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

    // Log the callback event (without sensitive values)
    await supabase.from("webhook_logs").insert({
      endpoint: "auth-callback",
      platform,
      event_type: error ? "auth_error" : "auth_callback",
      payload: {
        code: code ? "***received***" : null,
        state_present: !!state,
        platform,
        error,
        error_description: errorDescription,
      },
      status: error ? "error" : "success",
    });

    if (error) {
      return new Response(
        JSON.stringify({ success: false, error, description: errorDescription }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!code) {
      return new Response(
        JSON.stringify({ success: false, error: "No authorization code provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // CSRF protection: validate signed `state` (format: <nonceB64>.<expiryMs>.<hmacB64>)
    const stateSecret = Deno.env.get("OAUTH_STATE_SECRET");
    if (!stateSecret) {
      return new Response(
        JSON.stringify({ success: false, error: "OAUTH_STATE_SECRET not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const stateValid = await verifySignedState(state, platform, stateSecret);
    if (!stateValid) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid or expired state (possible CSRF)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }


    // Exchange code for token based on platform
    const tokenResult = await exchangeCodeForToken(platform, code, state);

    // Store token securely (encrypted at application layer)
    if (tokenResult.success) {
      const encKey = Deno.env.get("TOKEN_ENCRYPTION_KEY");
      const accessTokenStored = encKey && tokenResult.accessToken
        ? await encryptString(tokenResult.accessToken, encKey)
        : tokenResult.accessToken;
      const refreshTokenStored = encKey && tokenResult.refreshToken
        ? await encryptString(tokenResult.refreshToken, encKey)
        : tokenResult.refreshToken || null;
      await supabase.from("platform_connections").upsert(
        {
          platform,
          access_token: accessTokenStored,
          refresh_token: refreshTokenStored,
          expires_at: tokenResult.expiresAt || null,
          metadata: { ...(tokenResult.metadata || {}), encrypted: !!encKey },
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

// --- Helpers ---------------------------------------------------------------

const b64urlEncode = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const b64urlDecode = (s: string): Uint8Array => {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
};

async function hmacSign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return b64urlEncode(new Uint8Array(sig));
}

async function verifySignedState(state: string | null, platform: string, secret: string): Promise<boolean> {
  if (!state) return false;
  const parts = state.split(".");
  if (parts.length !== 3) return false;
  const [nonce, expiryStr, sig] = parts;
  const expiry = Number(expiryStr);
  if (!Number.isFinite(expiry) || Date.now() > expiry) return false;
  const expected = await hmacSign(`${nonce}.${expiryStr}.${platform}`, secret);
  // constant-time-ish compare
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}

async function deriveAesKey(secret: string): Promise<CryptoKey> {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return crypto.subtle.importKey("raw", hash, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

async function encryptString(plaintext: string, secret: string): Promise<string> {
  const key = await deriveAesKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(plaintext))
  );
  return `enc:v1:${b64urlEncode(iv)}:${b64urlEncode(ct)}`;
}

