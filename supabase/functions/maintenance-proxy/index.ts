import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Require a valid Supabase JWT (anon or user). Blocks unauthenticated direct calls.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const MAINTENANCE_API_KEY = Deno.env.get("MAINTENANCE_API_KEY");
    const MAINTENANCE_API_URL = Deno.env.get("MAINTENANCE_API_URL");

    if (!MAINTENANCE_API_KEY || !MAINTENANCE_API_URL) {
      throw new Error("Maintenance API credentials not configured");
    }

    const { action, ...params } = await req.json();

    // Action: create - Create a new maintenance request
    if (action === "create") {
      const { client_name, client_phone, service_type, description, priority } = params;

      if (!client_name || !client_phone || !service_type || !description) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: client_name, client_phone, service_type, description" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const res = await fetch(`${MAINTENANCE_API_URL}/maintenance-gateway`, {
        method: "POST",
        headers: {
          "x-api-key": MAINTENANCE_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channel: "api",
          client_name,
          client_phone,
          service_type,
          description,
          priority: priority || "medium",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `API error [${res.status}]`);

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: query - Query maintenance request status
    if (action === "query") {
      const { request_number, client_phone } = params;

      if (!request_number && !client_phone) {
        return new Response(
          JSON.stringify({ error: "Provide request_number or client_phone" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const queryParam = request_number
        ? `request_number=${encodeURIComponent(request_number)}`
        : `client_phone=${encodeURIComponent(client_phone)}`;

      const res = await fetch(`${MAINTENANCE_API_URL}/query-maintenance-requests?${queryParam}`, {
        headers: { "x-api-key": MAINTENANCE_API_KEY },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `API error [${res.status}]`);

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action. Use 'create' or 'query'" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Maintenance proxy error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
