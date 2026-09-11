import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authorizeProject, corsHeaders, jsonResponse } from "../_shared/portalAuth.ts";

const DEFAULT_BASE_URL = "https://api.magicplan.app/v2";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const projectId = typeof body.projectId === "string" ? body.projectId : "";

    const auth = await authorizeProject(req, projectId);
    if ("error" in auth) return auth.error;

    const apiKey = Deno.env.get("MAGICPLAN_API_KEY");
    if (!apiKey) return jsonResponse({ configured: false, plan: null });

    const planId = auth.project.magicplan_plan_id;
    if (!planId) return jsonResponse({ configured: true, linked: false, plan: null });

    // A full URL stored on the project is used directly as the viewer source.
    if (/^https?:\/\//i.test(planId)) {
      return jsonResponse({
        configured: true,
        linked: true,
        plan: { id: planId, name: auth.project.title, viewerUrl: planId, floors: [] },
      });
    }

    const baseUrl = (Deno.env.get("MAGICPLAN_BASE_URL") ?? DEFAULT_BASE_URL).replace(/\/$/, "");
    const res = await fetch(`${baseUrl}/plans/${encodeURIComponent(planId)}`, {
      headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
    });

    if (!res.ok) {
      console.error("Magicplan request failed", res.status);
      return jsonResponse({ error: "Design service unavailable" }, 502);
    }

    const plan = await res.json();
    return jsonResponse({
      configured: true,
      linked: true,
      plan: {
        id: planId,
        name: plan?.name ?? auth.project.title,
        viewerUrl: plan?.viewer_url ?? plan?.share_url ?? null,
        area: plan?.total_area ?? null,
        floors: Array.isArray(plan?.floors) ? plan.floors : [],
        updatedAt: plan?.updated_at ?? null,
      },
    });
  } catch (error) {
    console.error("portal-magicplan error", error);
    return jsonResponse({ error: "Unexpected error" }, 500);
  }
});
