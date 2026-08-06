import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `أنت مساعد ذكي لشركة Brand Identity المتخصصة في تأسيس وتجهيز المحلات التجارية داخل المولات في مصر.

معلومات عن الشركة:
- الاسم: Brand Identity
- التخصص: تصميم وتصنيع وتنفيذ تجهيزات المحلات التجارية داخل المولات
- الخبرة: أكثر من 100 مشروع منفذ ومئات الفروع لعلامات تجارية كبرى
- الخدمات: التصميم الداخلي، تصنيع الديكورات، تنفيذ التشطيبات، أعمال الكهرباء والسباكة، تكييف الهواء، اللوحات الإعلانية
- المولات: مول مصر، كايرو فيستيفال سيتي، مول العرب، سيتي ستارز، وغيرها
- الهاتف: 01004006620
- الموقع: brand-identity.alazab.com

تعليمات:
- أجب باللغة العربية دائماً
- كن ودوداً ومحترفاً
- إذا سأل الزائر عن خدمة محددة، اشرح بالتفصيل
- إذا أراد الزائر طلب عرض سعر، وجهه لصفحة /quote
- إذا أراد التواصل المباشر، أعطه رقم الهاتف
- اجعل إجاباتك مختصرة ومفيدة (لا تتجاوز 3-4 جمل)`;

// Azure AI Foundry (Azabot) via APIM gateway
const AZURE_RESPONSES_ENDPOINT =
  "https://az-ai-gateway.azure-api.net/az-ai-resource/openai/v1/responses";
const AZURE_MODEL = "az-model-sol";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

const sseLine = (content: string) =>
  `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`;

/** Converts Azure Responses SSE events into the chat-completions delta format the client parses. */
function toChatCompletionStream(azureBody: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const reader = azureBody.getReader();
  let buffer = "";

  return new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
        return;
      }
      buffer += decoder.decode(value, { stream: true });
      let idx: number;
      while ((idx = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const event = JSON.parse(payload);
          if (event.type === "response.output_text.delta" && typeof event.delta === "string") {
            controller.enqueue(encoder.encode(sseLine(event.delta)));
          }
        } catch {
          // Ignore partial or non-JSON events.
        }
      }
    },
    cancel(reason) {
      return reader.cancel(reason);
    },
  });
}

async function callAzure(messages: ChatMessage[], apimKey: string): Promise<Response | null> {
  try {
    const response = await fetch(AZURE_RESPONSES_ENDPOINT, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": apimKey,
        "api-key": apimKey,
        Authorization: `Bearer ${apimKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: AZURE_MODEL,
        instructions: SYSTEM_PROMPT,
        input: messages.map((m) => ({
          role: m.role,
          content: [
            {
              type: m.role === "assistant" ? "output_text" : "input_text",
              text: m.content,
            },
          ],
        })),
        stream: true,
      }),
    });

    if (!response.ok || !response.body) {
      console.error("Azure agent error:", response.status, await response.text());
      return null;
    }

    return new Response(toChatCompletionStream(response.body), {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Azure agent request failed:", error);
    return null;
  }
}

async function callLovable(messages: ChatMessage[]): Promise<Response> {
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!lovableApiKey) throw new Error("LOVABLE_API_KEY is not configured");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3.6-flash",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      stream: true,
    }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      return new Response(
        JSON.stringify({ error: "تم تجاوز الحد المسموح، يرجى المحاولة لاحقاً." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "يرجى إعادة شحن الرصيد." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.error("AI gateway error:", response.status, await response.text());
    return new Response(JSON.stringify({ error: "حدث خطأ في الخدمة" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(response.body, {
    headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require valid Supabase JWT to prevent paid API abuse
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "").trim();
    const projectUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const authClient = createClient(projectUrl, anonKey);
    const { data: claimsData } = await authClient.auth.getClaims(token);
    let isAllowed = Boolean(claimsData?.claims);

    // Anonymous project keys carry no `sub` claim, so validate issuer/expiry manually.
    if (!isAllowed) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
        const projectRef = new URL(projectUrl).hostname.split(".")[0];
        const issuerMatches =
          typeof payload.iss === "string" &&
          (payload.iss === "supabase" || payload.iss.includes(projectRef));
        const refMatches = payload.ref === undefined || payload.ref === projectRef;
        const notExpired = typeof payload.exp === "number" && payload.exp * 1000 > Date.now();
        isAllowed =
          issuerMatches && refMatches && notExpired && ["anon", "authenticated"].includes(payload.role);
      } catch {
        isAllowed = false;
      }
    }

    if (!isAllowed) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages } = (await req.json()) as { messages: ChatMessage[] };
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages مطلوبة" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apimKey = Deno.env.get("AZURE_APIM_SUBSCRIPTION_KEY");
    if (apimKey) {
      const azureResponse = await callAzure(messages, apimKey);
      if (azureResponse) return azureResponse;
    }

    // Fallback to Lovable AI when Azure is unavailable.
    return await callLovable(messages);
  } catch (e) {
    console.error("ai-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
