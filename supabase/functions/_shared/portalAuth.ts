import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export interface PortalProject {
  id: string;
  title: string;
  daftra_work_order_id: number | null;
  magicplan_project_id: string | null;
  magicplan_plan_id: string | null;
  minio_prefix: string | null;
  progress: number;
  status: string;
}

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Verifies the caller JWT and explicitly verifies project membership.
 * RLS remains the database enforcement layer; this check is intentionally
 * duplicated here so external integrations are never called before the
 * user/project relationship has been proven.
 */
export async function authorizeProject(
  req: Request,
  projectId: string,
): Promise<{ project: PortalProject; userId: string; isAdmin: boolean } | { error: Response }> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: jsonResponse({ error: "Unauthorized" }, 401) };
  }

  if (!uuidPattern.test(projectId)) {
    return { error: jsonResponse({ error: "Invalid project id" }, 400) };
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !anonKey) {
    console.error("Portal auth is missing Supabase runtime configuration");
    return { error: jsonResponse({ error: "Server configuration error" }, 500) };
  }

  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData?.user;
  if (userError || !user) {
    return { error: jsonResponse({ error: "Unauthorized" }, 401) };
  }

  const { data: adminRole, error: roleError } = await supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (roleError) {
    console.error("Portal role lookup failed", roleError);
    return { error: jsonResponse({ error: "Authorization unavailable" }, 500) };
  }

  const isAdmin = Boolean(adminRole);

  if (!isAdmin) {
    const { data: membership, error: membershipError } = await supabase
      .from("client_projects")
      .select("id")
      .eq("user_id", user.id)
      .eq("project_id", projectId)
      .maybeSingle();

    if (membershipError) {
      console.error("Portal project membership lookup failed", membershipError);
      return { error: jsonResponse({ error: "Authorization unavailable" }, 500) };
    }

    if (!membership) {
      return { error: jsonResponse({ error: "Forbidden" }, 403) };
    }
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select(
      "id, title, daftra_work_order_id, magicplan_project_id, magicplan_plan_id, minio_prefix, progress, status",
    )
    .eq("id", projectId)
    .maybeSingle();

  if (projectError) {
    console.error("Portal project lookup failed", projectError);
    return { error: jsonResponse({ error: "Project lookup unavailable" }, 500) };
  }

  if (!project) {
    return { error: jsonResponse({ error: "Forbidden" }, 403) };
  }

  return {
    project: project as PortalProject,
    userId: user.id,
    isAdmin,
  };
}
