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
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const platform = url.searchParams.get("platform") || "unknown";
    const error = url.searchParams.get("error");
    const errorDescription = url.searchParams.get("error_description");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Log the callback event
    await supabase.from("webhook_logs").insert({
      endpoint: "auth-callback",
      platform,
      event_type: error ? "auth_error" : "auth_callback",
      payload: {
        code: code ? "***received***" : null,
        state,
        platform,
        error,
        error_description: errorDescription,
      },
      status: error ? "error" : "success",
    });

    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error,
          description: errorDescription,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!code) {
      return new Response(
        JSON.stringify({ success: false, error: "No authorization code provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Exchange code for token based on platform
    const tokenResult = await exchangeCodeForToken(platform, code, state);

    // Store token securely
    if (tokenResult.success) {
      await supabase.from("platform_connections").upsert(
        {
          platform,
          access_token: tokenResult.accessToken,
          refresh_token: tokenResult.refreshToken || null,
          expires_at: tokenResult.expiresAt || null,
          metadata: tokenResult.metadata || {},
          status: "active",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "platform" }
      );
    }

    // Redirect back to webhook dashboard
    const appUrl = Deno.env.get("APP_URL") || "https://brand-identity.alazab.com";
    return Response.redirect(
      `${appUrl}/admin/webhooks?platform=${platform}&status=${tokenResult.success ? "connected" : "error"}`,
      302
    );
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

interface TokenResult {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
}

async function exchangeCodeForToken(
  platform: string,
  code: string,
  _state: string | null
): Promise<TokenResult> {
  const configs: Record<string, { tokenUrl: string; clientIdEnv: string; clientSecretEnv: string }> = {
    facebook: {
      tokenUrl: "https://graph.facebook.com/v21.0/oauth/access_token",
      clientIdEnv: "FACEBOOK_APP_ID",
      clientSecretEnv: "FACEBOOK_APP_SECRET",
    },
    instagram: {
      tokenUrl: "https://api.instagram.com/oauth/access_token",
      clientIdEnv: "INSTAGRAM_APP_ID",
      clientSecretEnv: "INSTAGRAM_APP_SECRET",
    },
    google: {
      tokenUrl: "https://oauth2.googleapis.com/token",
      clientIdEnv: "GOOGLE_CLIENT_ID",
      clientSecretEnv: "GOOGLE_CLIENT_SECRET",
    },
    tiktok: {
      tokenUrl: "https://open.tiktokapis.com/v2/oauth/token/",
      clientIdEnv: "TIKTOK_CLIENT_KEY",
      clientSecretEnv: "TIKTOK_CLIENT_SECRET",
    },
  };

  const config = configs[platform];
  if (!config) {
    return { success: false, metadata: { error: `Unsupported platform: ${platform}` } };
  }

  const clientId = Deno.env.get(config.clientIdEnv);
  const clientSecret = Deno.env.get(config.clientSecretEnv);

  if (!clientId || !clientSecret) {
    return {
      success: false,
      metadata: { error: `Missing credentials for ${platform}` },
    };
  }

  const redirectUri = `${Deno.env.get("SUPABASE_URL")}/functions/v1/auth-callback?platform=${platform}`;

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
  });

  const res = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    return {
      success: false,
      metadata: { error: data.error || data.error_description || "Token exchange failed" },
    };
  }

  const expiresIn = data.expires_in ? Number(data.expires_in) : 3600;
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

  return {
    success: true,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt,
    metadata: { scope: data.scope, token_type: data.token_type },
  };
}
