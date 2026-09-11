import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders, jsonResponse } from "../_shared/portalAuth.ts";

/** Admin-only: creates a client account and links it to a project. */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return jsonResponse({ error: "Unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData } = await userClient.auth.getUser();
    if (!userData?.user) return jsonResponse({ error: "Unauthorized" }, 401);

    const { data: roles } = await userClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin");
    if (!roles || roles.length === 0) return jsonResponse({ error: "Forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : null;
    const company = typeof body.company === "string" ? body.company.trim() : null;
    const projectIds: string[] = Array.isArray(body.projectIds)
      ? body.projectIds.filter((id: unknown): id is string => typeof id === "string")
      : [];

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || password.length < 8 || fullName.length < 2) {
      return jsonResponse({ error: "بيانات غير صحيحة: تحقق من البريد والاسم وكلمة مرور 8 أحرف على الأقل" }, 400);
    }

    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (createError || !created?.user) {
      return jsonResponse({ error: createError?.message ?? "تعذر إنشاء الحساب" }, 400);
    }

    const userId = created.user.id;

    const { error: profileError } = await admin
      .from("client_profiles")
      .upsert({ user_id: userId, full_name: fullName, phone, company }, { onConflict: "user_id" });
    if (profileError) console.error("profile insert failed", profileError);

    if (projectIds.length > 0) {
      const { error: linkError } = await admin
        .from("client_projects")
        .upsert(projectIds.map((projectId) => ({ user_id: userId, project_id: projectId })), {
          onConflict: "user_id,project_id",
        });
      if (linkError) console.error("link insert failed", linkError);
    }

    return jsonResponse({ success: true, userId });
  } catch (error) {
    console.error("portal-admin error", error);
    return jsonResponse({ error: "Unexpected error" }, 500);
  }
});
