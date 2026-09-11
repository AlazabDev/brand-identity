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
  daftra_client_id: string | null;
  magicplan_plan_id: string | null;
  minio_prefix: string | null;
}

/**
 * Verifies the caller's JWT and that the caller may access the given project.
 * Ownership is enforced by RLS: the project row is only visible to a linked
 * client or to an admin.
 */
export async function authorizeProject(
  req: Request,
  projectId: string,
): Promise<{ project: PortalProject } | { error: Response }> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: jsonResponse({ error: "Unauthorized" }, 401) };
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return { error: jsonResponse({ error: "Unauthorized" }, 401) };
  }

  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidPattern.test(projectId)) {
    return { error: jsonResponse({ error: "Invalid project id" }, 400) };
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, title, daftra_client_id, magicplan_plan_id, minio_prefix")
    .eq("id", projectId)
    .maybeSingle();

  if (projectError || !project) {
    return { error: jsonResponse({ error: "Forbidden" }, 403) };
  }

  return { project: project as PortalProject };
}
