import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GRAPH_API = "https://graph.facebook.com/v21.0";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const WHATSAPP_ACCESS_TOKEN = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
    const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");

    if (!WHATSAPP_ACCESS_TOKEN) throw new Error("WHATSAPP_ACCESS_TOKEN not configured");
    if (!WHATSAPP_PHONE_NUMBER_ID) throw new Error("WHATSAPP_PHONE_NUMBER_ID not configured");

    const { action, to, message, mediaUrl, mediaType, fileName } = await req.json();

    if (action === "send") {
      // Send text message
      const payload: any = {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: message },
      };

      const res = await fetch(`${GRAPH_API}/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(`WhatsApp API error [${res.status}]: ${JSON.stringify(data)}`);

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "send_media") {
      // First upload media
      const mediaRes = await fetch(mediaUrl);
      const mediaBlob = await mediaRes.blob();

      const formData = new FormData();
      formData.append("messaging_product", "whatsapp");
      formData.append("file", mediaBlob, fileName || "file");
      formData.append("type", mediaType || "document");

      const uploadRes = await fetch(`${GRAPH_API}/${WHATSAPP_PHONE_NUMBER_ID}/media`, {
        method: "POST",
        headers: { Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}` },
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(`Media upload failed [${uploadRes.status}]: ${JSON.stringify(uploadData)}`);

      // Send media message
      const msgType = mediaType === "image" ? "image" : mediaType === "video" ? "video" : "document";
      const msgPayload: any = {
        messaging_product: "whatsapp",
        to,
        type: msgType,
        [msgType]: { id: uploadData.id },
      };

      if (msgType === "document" && fileName) {
        msgPayload.document.filename = fileName;
      }

      const sendRes = await fetch(`${GRAPH_API}/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(msgPayload),
      });

      const sendData = await sendRes.json();
      if (!sendRes.ok) throw new Error(`Send media failed [${sendRes.status}]: ${JSON.stringify(sendData)}`);

      return new Response(JSON.stringify({ success: true, data: sendData }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("WhatsApp function error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
