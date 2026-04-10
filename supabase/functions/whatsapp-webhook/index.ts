import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GRAPH_API = "https://graph.facebook.com/v21.0";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  // WhatsApp Webhook Verification (GET)
  if (req.method === "GET") {
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    const verifyToken = Deno.env.get("WHATSAPP_VERIFY_TOKEN");

    if (mode === "subscribe" && token === verifyToken) {
      // Log verification
      await supabase.from("webhook_logs").insert({
        endpoint: "whatsapp-webhook",
        platform: "whatsapp",
        event_type: "verification",
        payload: { mode, verified: true },
        status: "success",
      });

      return new Response(challenge, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    // Log failed verification
    await supabase.from("webhook_logs").insert({
      endpoint: "whatsapp-webhook",
      platform: "whatsapp",
      event_type: "verification_failed",
      payload: { mode, token_match: false },
      status: "error",
    });

    return new Response("Forbidden", { status: 403 });
  }

  // Handle incoming webhook events (POST)
  if (req.method === "POST") {
    try {
      const body = await req.json();

      // Log raw webhook
      await supabase.from("webhook_logs").insert({
        endpoint: "whatsapp-webhook",
        platform: "whatsapp",
        event_type: "incoming_webhook",
        payload: body,
        status: "received",
      });

      const entry = body?.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      if (!value) {
        return new Response(JSON.stringify({ status: "no_data" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Handle status updates
      if (value.statuses) {
        for (const status of value.statuses) {
          await supabase.from("webhook_logs").insert({
            endpoint: "whatsapp-webhook",
            platform: "whatsapp",
            event_type: "message_status",
            payload: {
              message_id: status.id,
              status: status.status,
              recipient: status.recipient_id,
              timestamp: status.timestamp,
              errors: status.errors,
            },
            status: status.status === "failed" ? "error" : "success",
          });
        }
      }

      // Handle incoming messages
      if (value.messages) {
        const accessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
        const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");

        for (const message of value.messages) {
          const contact = value.contacts?.find(
            (c: { wa_id: string }) => c.wa_id === message.from
          );

          // Store message
          await supabase.from("whatsapp_messages").insert({
            message_id: message.id,
            from_number: message.from,
            from_name: contact?.profile?.name || null,
            message_type: message.type,
            content: extractMessageContent(message),
            media_url: null,
            timestamp: new Date(Number(message.timestamp) * 1000).toISOString(),
            direction: "incoming",
            status: "received",
          });

          // Auto-reply with AI if enabled
          const autoReply = Deno.env.get("WHATSAPP_AUTO_REPLY") === "true";
          if (autoReply && accessToken && phoneNumberId && message.type === "text") {
            await sendAutoReply(
              accessToken,
              phoneNumberId,
              message.from,
              message.text?.body || "",
              supabase
            );
          }
        }
      }

      return new Response(JSON.stringify({ status: "processed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error";
      await supabase.from("webhook_logs").insert({
        endpoint: "whatsapp-webhook",
        platform: "whatsapp",
        event_type: "processing_error",
        payload: { error: errorMessage },
        status: "error",
      });

      // Always return 200 to WhatsApp to avoid retries
      return new Response(JSON.stringify({ status: "error", error: errorMessage }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  return new Response("Method not allowed", { status: 405 });
});

function extractMessageContent(message: Record<string, unknown>): string {
  const type = message.type as string;
  switch (type) {
    case "text":
      return (message.text as { body: string })?.body || "";
    case "image":
      return (message.image as { caption?: string })?.caption || "[صورة]";
    case "video":
      return (message.video as { caption?: string })?.caption || "[فيديو]";
    case "audio":
      return "[رسالة صوتية]";
    case "document":
      return (message.document as { filename?: string })?.filename || "[مستند]";
    case "location":
      return `[موقع: ${(message.location as { latitude: number })?.latitude}, ${(message.location as { longitude: number })?.longitude}]`;
    case "sticker":
      return "[ملصق]";
    case "reaction":
      return `[تفاعل: ${(message.reaction as { emoji?: string })?.emoji}]`;
    default:
      return `[${type}]`;
  }
}

async function sendAutoReply(
  accessToken: string,
  phoneNumberId: string,
  to: string,
  incomingText: string,
  supabase: ReturnType<typeof createClient>
) {
  try {
    // Call AI chat function for response
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const aiRes = await fetch(`${supabaseUrl}/functions/v1/ai-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: incomingText }],
      }),
    });

    if (!aiRes.ok) return;

    const aiText = await aiRes.text();
    const replyText = aiText.substring(0, 4096); // WhatsApp limit

    // Send reply
    const res = await fetch(`${GRAPH_API}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: replyText },
      }),
    });

    const data = await res.json();

    // Store reply
    await supabase.from("whatsapp_messages").insert({
      message_id: data.messages?.[0]?.id || `auto_${Date.now()}`,
      from_number: phoneNumberId,
      to_number: to,
      message_type: "text",
      content: replyText,
      timestamp: new Date().toISOString(),
      direction: "outgoing",
      status: res.ok ? "sent" : "failed",
    });
  } catch (err) {
    console.error("Auto-reply error:", err);
  }
}
