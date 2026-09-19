import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { authorizeProject, corsHeaders, jsonResponse } from "../_shared/portalAuth.ts";

/**
 * Client portal assistant. Answers only about a project the caller is proven
 * to have access to: authorization runs first, then the model receives a
 * compact, server-built context of that project's real data.
 */

const STATUS_LABELS: Record<string, string> = {
  planning: "تخطيط",
  in_progress: "قيد التنفيذ",
  execution: "قيد التنفيذ",
  review: "مراجعة",
  completed: "مكتمل",
  on_hold: "متوقف مؤقتًا",
  pending: "لم يبدأ",
  done: "منجز",
};

const label = (value: string | null | undefined) =>
  value ? STATUS_LABELS[value] ?? value : "غير محدد";

const formatDate = (value: string | null) => {
  if (!value) return "غير محدد";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  // Localization rule: DD/MM/YYYY
  return `${String(date.getDate()).padStart(2, "0")}/${
    String(date.getMonth() + 1).padStart(2, "0")
  }/${date.getFullYear()}`;
};

interface Milestone {
  title: string;
  description: string | null;
  due_date: string | null;
  status: string;
}

interface ProjectDetails {
  title: string;
  category: string | null;
  description: string | null;
  mall: string | null;
  area: string | null;
  client_name: string | null;
  completion_date: string | null;
  progress: number;
  status: string;
  updated_at: string;
}

function buildContext(project: ProjectDetails, milestones: Milestone[]): string {
  const lines = [
    `اسم المشروع: ${project.title}`,
    `الحالة: ${label(project.status)}`,
    `نسبة الإنجاز: ${project.progress}%`,
    `المول: ${project.mall ?? "غير محدد"}`,
    `المساحة: ${project.area ?? "غير محددة"}`,
    `نوع المشروع: ${project.category ?? "غير محدد"}`,
    `تاريخ التسليم المتوقع: ${formatDate(project.completion_date)}`,
    `آخر تحديث للبيانات: ${formatDate(project.updated_at)}`,
  ];

  if (project.description) lines.push(`وصف المشروع: ${project.description}`);

  if (milestones.length > 0) {
    lines.push("مراحل المشروع:");
    for (const milestone of milestones) {
      lines.push(
        `- ${milestone.title} — الحالة: ${label(milestone.status)} — الموعد: ${
          formatDate(milestone.due_date)
        }${milestone.description ? ` — ${milestone.description}` : ""}`,
      );
    }
  } else {
    lines.push("مراحل المشروع: لم تُسجَّل مراحل بعد.");
  }

  return lines.join("\n");
}

const SYSTEM_PROMPT = `أنت مساعد خدمة عملاء لشركة Brand Identity المتخصصة في تجهيز المحلات داخل المولات في مصر.
مهمتك الرد على صاحب المشروع بدقة اعتمادًا فقط على بيانات المشروع المرفقة أدناه.

قواعد إلزامية:
- أجب بالعربية بأسلوب ودود ومهني ومختصر (3-5 جمل كحد أقصى).
- لا تخترع أرقامًا أو تواريخ أو مبالغ غير موجودة في البيانات؛ إن لم تتوفر المعلومة قل ذلك واقترح التواصل مع فريق المشروع على 01004006620.
- لا تتحدث عن أي مشروع آخر أو أي عميل آخر.
- استخدم صيغة التاريخ يوم/شهر/سنة.
- للأسئلة المالية التفصيلية أو الملفات، وجّه العميل لتبويب «الحسابات» أو «الملفات» داخل البوابة.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const projectId = typeof body.projectId === "string" ? body.projectId : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const history = Array.isArray(body.history) ? body.history : [];
    const conversationId = typeof body.conversationId === "string" && body.conversationId
      ? body.conversationId
      : crypto.randomUUID();

    if (!message || message.length > 2000) {
      return jsonResponse({ error: "الرسالة مطلوبة ويجب ألا تتجاوز 2000 حرف" }, 400);
    }

    const authorized = await authorizeProject(req, projectId);
    if ("error" in authorized) return authorized.error;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const scopedClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    });

    const [projectResult, milestonesResult] = await Promise.all([
      scopedClient
        .from("projects")
        .select(
          "title, category, description, mall, area, client_name, completion_date, progress, status, updated_at",
        )
        .eq("id", projectId)
        .maybeSingle(),
      scopedClient
        .from("project_milestones")
        .select("title, description, due_date, status")
        .eq("project_id", projectId)
        .order("sort_order", { ascending: true }),
    ]);

    if (projectResult.error || !projectResult.data) {
      console.error("portal-agent project load failed", projectResult.error);
      return jsonResponse({ error: "تعذر تحميل بيانات المشروع" }, 500);
    }
    if (milestonesResult.error) {
      console.error("portal-agent milestones load failed", milestonesResult.error);
    }

    const context = buildContext(
      projectResult.data as ProjectDetails,
      (milestonesResult.data ?? []) as Milestone[],
    );

    const trimmedHistory = history
      .filter(
        (item: unknown): item is { role: string; content: string } =>
          typeof item === "object" && item !== null &&
          typeof (item as { content?: unknown }).content === "string" &&
          ["user", "assistant"].includes(String((item as { role?: unknown }).role)),
      )
      .slice(-8)
      .map((item) => ({ role: item.role, content: item.content.slice(0, 2000) }));

    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      console.error("portal-agent missing LOVABLE_API_KEY");
      return jsonResponse({ error: "خدمة المساعد غير مهيأة" }, 500);
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.6-flash",
        messages: [
          { role: "system", content: `${SYSTEM_PROMPT}\n\nبيانات المشروع:\n${context}` },
          ...trimmedHistory,
          { role: "user", content: message },
        ],
      }),
    });

    if (aiResponse.status === 429) {
      return jsonResponse({ error: "تم تجاوز الحد المسموح، حاول بعد قليل." }, 429);
    }
    if (aiResponse.status === 402) {
      return jsonResponse({ error: "خدمة المساعد غير متاحة حاليًا." }, 402);
    }
    if (!aiResponse.ok) {
      console.error("portal-agent AI gateway error", aiResponse.status, await aiResponse.text());
      return jsonResponse({ error: "تعذر الحصول على رد من المساعد" }, 502);
    }

    const payload = await aiResponse.json();
    const reply = payload?.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) {
      return jsonResponse({ error: "رد غير مفهوم من المساعد" }, 502);
    }

    return jsonResponse({ reply: reply.trim(), conversationId });
  } catch (error) {
    console.error("portal-agent error", error);
    return jsonResponse({ error: "Unexpected error" }, 500);
  }
});
