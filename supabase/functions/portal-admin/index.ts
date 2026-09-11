import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders, jsonResponse } from "../_shared/portalAuth.ts";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Admin-only: creates a client account and links it to selected projects. */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      console.error("portal-admin missing Supabase runtime configuration");
      return jsonResponse({ error: "Server configuration error" }, 500);
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData?.user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const { data: adminRole, error: roleError } = await userClient
      .from("user_roles")
      .select("id")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError) {
      console.error("portal-admin role lookup failed", roleError);
      return jsonResponse({ error: "Authorization unavailable" }, 500);
    }
    if (!adminRole) return jsonResponse({ error: "Forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
    const phone = typeof body.phone === "string" && body.phone.trim()
      ? body.phone.trim()
      : null;
    const company = typeof body.company === "string" && body.company.trim()
      ? body.company.trim()
      : null;
    const projectIds = Array.isArray(body.projectIds)
      ? [...new Set(body.projectIds.filter(
        (id: unknown): id is string => typeof id === "string" && uuidPattern.test(id),
      ))]
      : [];

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || password.length < 8 || fullName.length < 2) {
      return jsonResponse(
        { error: "بيانات غير صحيحة: تحقق من البريد والاسم وكلمة مرور 8 أحرف على الأقل" },
        400,
      );
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);

    if (projectIds.length > 0) {
      const { data: existingProjects, error: projectsError } = await admin
        .from("projects")
        .select("id")
        .in("id", projectIds);

      if (projectsError) {
        console.error("portal-admin project validation failed", projectsError);
        return jsonResponse({ error: "تعذر التحقق من المشروعات" }, 500);
      }

      const existingIds = new Set((existingProjects ?? []).map((project) => project.id));
      const unknownProjectIds = projectIds.filter((id) => !existingIds.has(id));
      if (unknownProjectIds.length > 0) {
        return jsonResponse({ error: "يوجد مشروع غير صالح", projectIds: unknownProjectIds }, 400);
      }
    }

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

    const cleanupCreatedUser = async () => {
      const { error } = await admin.auth.admin.deleteUser(userId);
      if (error) console.error("portal-admin cleanup failed", userId, error);
    };

    const { error: profileError } = await admin
      .from("client_profiles")
      .insert({ user_id: userId, full_name: fullName, phone, company });

    if (profileError) {
      console.error("portal-admin profile insert failed", profileError);
      await cleanupCreatedUser();
      return jsonResponse({ error: "تم إلغاء إنشاء الحساب بسبب فشل ملف العميل" }, 500);
    }

    if (projectIds.length > 0) {
      const { error: linkError } = await admin
        .from("client_projects")
        .insert(projectIds.map((projectId) => ({ user_id: userId, project_id: projectId })));

      if (linkError) {
        console.error("portal-admin project link failed", linkError);
        await cleanupCreatedUser();
        return jsonResponse({ error: "تم إلغاء إنشاء الحساب بسبب فشل ربط المشروعات" }, 500);
      }
    }

    return jsonResponse({ success: true, userId, projectIds });
  } catch (error) {
    console.error("portal-admin error", error);
    return jsonResponse({ error: "Unexpected error" }, 500);
  }
});
