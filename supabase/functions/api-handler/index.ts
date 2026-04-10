import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    // Extract resource from path: /api-handler/{resource}
    const resource = pathParts[pathParts.length - 1] || "";

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // API key validation
    const apiKey = req.headers.get("x-api-key") || url.searchParams.get("api_key");
    const validApiKey = Deno.env.get("CUSTOM_API_KEY");

    if (validApiKey && apiKey !== validApiKey) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid API key" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log API request
    await supabase.from("webhook_logs").insert({
      endpoint: "api-handler",
      platform: "api",
      event_type: `${req.method} /${resource}`,
      payload: {
        method: req.method,
        resource,
        query: Object.fromEntries(url.searchParams),
      },
      status: "received",
    });

    // Route based on resource
    switch (resource) {
      case "health":
        return new Response(
          JSON.stringify({
            status: "ok",
            timestamp: new Date().toISOString(),
            version: "1.0.0",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

      case "projects": {
        if (req.method === "GET") {
          const { data, error } = await supabase
            .from("projects")
            .select("id, title, category, description, images, featured, completion_date")
            .order("created_at", { ascending: false });
          if (error) throw new Error(error.message);
          return new Response(JSON.stringify({ success: true, data }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        break;
      }

      case "blog": {
        if (req.method === "GET") {
          const { data, error } = await supabase
            .from("blog_posts")
            .select("id, title, slug, excerpt, category, cover_image, created_at")
            .eq("published", true)
            .order("created_at", { ascending: false });
          if (error) throw new Error(error.message);
          return new Response(JSON.stringify({ success: true, data }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        break;
      }

      case "webhooks": {
        if (req.method === "GET") {
          const { data, error } = await supabase
            .from("webhook_logs")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(50);
          if (error) throw new Error(error.message);
          return new Response(JSON.stringify({ success: true, data }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        break;
      }

      case "connections": {
        if (req.method === "GET") {
          const { data, error } = await supabase
            .from("platform_connections")
            .select("platform, status, metadata, updated_at")
            .order("updated_at", { ascending: false });
          if (error) throw new Error(error.message);
          return new Response(JSON.stringify({ success: true, data }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        break;
      }

      default:
        return new Response(
          JSON.stringify({
            error: "Not found",
            available: ["health", "projects", "blog", "webhooks", "connections"],
          }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
