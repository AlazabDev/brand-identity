import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authorizeProject, corsHeaders, jsonResponse } from "../_shared/portalAuth.ts";

const DEFAULT_BASE_URL = "https://cloud.magicplan.app/api/v2";
const ALLOWED_ACTIONS = new Set(["project", "plan", "files"]);

function clampPage(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(parsed)));
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const projectId = typeof body.projectId === "string" ? body.projectId : "";
    const action = typeof body.action === "string" ? body.action : "project";

    if (!ALLOWED_ACTIONS.has(action)) {
      return jsonResponse({ error: "Invalid Magicplan action" }, 400);
    }

    const auth = await authorizeProject(req, projectId);
    if ("error" in auth) return auth.error;

    const apiKey = Deno.env.get("MAGICPLAN_API_KEY");
    const customerId = Deno.env.get("MAGICPLAN_ID");
    if (!apiKey || !customerId) {
      return jsonResponse({ configured: false, linked: false, action, data: null });
    }

    const magicplanProjectId = auth.project.magicplan_project_id;
    if (!magicplanProjectId) {
      return jsonResponse({ configured: true, linked: false, action, data: null });
    }

    const baseUrl = (Deno.env.get("MAGICPLAN_BASE_URL") ?? DEFAULT_BASE_URL).replace(/\/$/, "");
    const headers = {
      Accept: "application/json",
      key: apiKey,
      customer: customerId,
    };

    let url: URL;
    if (action === "project") {
      url = new URL(`${baseUrl}/projects/${encodeURIComponent(magicplanProjectId)}`);
    } else if (action === "plan") {
      url = new URL(`${baseUrl}/projects/${encodeURIComponent(magicplanProjectId)}/plan`);
    } else {
      url = new URL(`${baseUrl}/projects/${encodeURIComponent(magicplanProjectId)}/files`);
      url.searchParams.set("page", String(clampPage(body.page, 1, 1, 100000)));
      url.searchParams.set("page_size", String(clampPage(body.pageSize, 100, 1, 100)));
    }

    const response = await fetch(url, { headers });
    if (!response.ok) {
      const details = await response.text();
      console.error("Magicplan request failed", action, response.status, details);
      return jsonResponse({ error: "Design service unavailable" }, 502);
    }

    const payload = await response.json();
    const responseData = payload?.data ?? null;

    return jsonResponse({
      configured: true,
      linked: true,
      action,
      projectId: magicplanProjectId,
      storedPlanId: auth.project.magicplan_plan_id,
      data: responseData,
      pageInfo: payload?.page_info ?? null,
    });
  } catch (error) {
    console.error("portal-magicplan error", error);
    return jsonResponse({ error: "Unexpected error" }, 500);
  }
});
