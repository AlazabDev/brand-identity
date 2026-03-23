import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GRAPH_API = "https://graph.facebook.com/v21.0";
const SEAFILE_URL = "https://seafile.alazab.com";
const PHONE_NUMBER_ID_REGEX = /^\d{10,20}$/;

const normalizePhone = (value: string) => value.replace(/[^\d]/g, "");

const assertPhoneNumberId = (value: string) => {
  if (!PHONE_NUMBER_ID_REGEX.test(value)) {
    throw new Error("Invalid WHATSAPP_PHONE_NUMBER_ID. Use Meta Phone Number ID (digits only).");
  }
};

async function uploadToSeafile(fileBlob: Blob, fileName: string, folder = "/whatsapp-chat"): Promise<string | null> {
  const SEAFILE_TOKEN = Deno.env.get("SEAFILE_TOKEN");
  const SEAFILE_REPO_ID = Deno.env.get("SEAFILE_REPO_ID");
  if (!SEAFILE_TOKEN || !SEAFILE_REPO_ID) return null;

  try {
    // Ensure folder
    await fetch(`${SEAFILE_URL}/api2/repos/${SEAFILE_REPO_ID}/dir/?p=${encodeURIComponent(folder)}`, {
      method: "POST",
      headers: { Authorization: `Token ${SEAFILE_TOKEN}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: "operation=mkdir",
    }).catch(() => {});

    // Get upload link
    const uploadLinkRes = await fetch(
      `${SEAFILE_URL}/api2/repos/${SEAFILE_REPO_ID}/upload-link/?p=${encodeURIComponent(folder)}`,
      { headers: { Authorization: `Token ${SEAFILE_TOKEN}` } }
    );
    if (!uploadLinkRes.ok) {
      console.error(`Seafile upload link failed [${uploadLinkRes.status}]`);
      return null;
    }
    const uploadLink = (await uploadLinkRes.text()).replace(/"/g, "");

    const formData = new FormData();
    formData.append("file", fileBlob, fileName);
    formData.append("parent_dir", folder);
    formData.append("replace", "1");

    const uploadRes = await fetch(uploadLink, {
      method: "POST",
      headers: { Authorization: `Token ${SEAFILE_TOKEN}` },
      body: formData,
    });
    if (!uploadRes.ok) {
      console.error(`Seafile upload failed [${uploadRes.status}]`);
      return null;
    }
    await uploadRes.text();

    const filePath = `${folder}/${fileName}`;
    const shareLinkRes = await fetch(`${SEAFILE_URL}/api/v2.1/share-links/`, {
      method: "POST",
      headers: { Authorization: `Token ${SEAFILE_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ repo_id: SEAFILE_REPO_ID, path: filePath, permissions: { can_download: true } }),
    });
    if (shareLinkRes.ok) {
      const shareData = await shareLinkRes.json();
      return shareData.link || `${SEAFILE_URL}/lib/${SEAFILE_REPO_ID}/file${filePath}`;
    }
    return `${SEAFILE_URL}/lib/${SEAFILE_REPO_ID}/file${filePath}`;
  } catch (err) {
    console.error("Seafile upload error:", err);
    return null;
  }
}

async function uploadToSupabaseStorage(fileBlob: Blob, fileName: string): Promise<string | null> {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const filePath = `whatsapp/${Date.now()}_${fileName}`;
    const { error } = await supabase.storage.from("chat-files").upload(filePath, fileBlob, {
      contentType: fileBlob.type || "application/octet-stream",
      upsert: true,
    });
    if (error) {
      console.error("Supabase storage upload error:", error);
      return null;
    }
    const { data } = supabase.storage.from("chat-files").getPublicUrl(filePath);
    return data.publicUrl;
  } catch (err) {
    console.error("Supabase storage fallback error:", err);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const WHATSAPP_ACCESS_TOKEN = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
    const WHATSAPP_PHONE_NUMBER_ID = (Deno.env.get("WHATSAPP_PHONE_NUMBER_ID") || "").trim();

    if (!WHATSAPP_ACCESS_TOKEN) throw new Error("WHATSAPP_ACCESS_TOKEN not configured");
    if (!WHATSAPP_PHONE_NUMBER_ID) throw new Error("WHATSAPP_PHONE_NUMBER_ID not configured");
    assertPhoneNumberId(WHATSAPP_PHONE_NUMBER_ID);

    const contentType = req.headers.get("content-type") || "";

    // Handle file uploads
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File;
      const to = normalizePhone((formData.get("to") as string) || "");
      const mediaType = (formData.get("mediaType") as string) || "document";
      const fileName = (formData.get("fileName") as string) || file?.name || "file";

      if (!file) throw new Error("No file provided");
      if (!to) throw new Error("Recipient phone number is required");

      const timestamp = Date.now();
      const safeFileName = `${timestamp}_${fileName}`;

      // Try Seafile first, fallback to Supabase storage
      let fileUrl = await uploadToSeafile(file, safeFileName);
      if (!fileUrl) {
        console.log("Seafile unavailable, falling back to Supabase storage");
        fileUrl = await uploadToSupabaseStorage(file, safeFileName);
      }

      // Send via WhatsApp
      try {
        const waFormData = new FormData();
        waFormData.append("messaging_product", "whatsapp");
        waFormData.append("file", file, fileName);
        waFormData.append("type", mediaType);

        const uploadRes = await fetch(`${GRAPH_API}/${WHATSAPP_PHONE_NUMBER_ID}/media`, {
          method: "POST",
          headers: { Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}` },
          body: waFormData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          const msgType = mediaType === "image" ? "image" : mediaType === "audio" ? "audio" : "document";
          const msgPayload: any = {
            messaging_product: "whatsapp",
            to,
            type: msgType,
            [msgType]: { id: uploadData.id },
          };
          if (msgType === "document" && fileName) {
            msgPayload.document.filename = fileName;
          }

          await fetch(`${GRAPH_API}/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
            method: "POST",
            headers: { Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`, "Content-Type": "application/json" },
            body: JSON.stringify(msgPayload),
          });
        } else {
          const errText = await uploadRes.text();
          console.error(`WhatsApp media upload failed [${uploadRes.status}]: ${errText}`);
        }
      } catch (waErr) {
        console.error("WhatsApp media send failed:", waErr);
      }

      return new Response(JSON.stringify({ success: true, fileUrl: fileUrl || null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle JSON requests
    const { action, to, message } = await req.json();
    const recipientPhone = normalizePhone((to || "").toString());

    if (action === "send") {
      if (!recipientPhone) throw new Error("Recipient phone number is required");
      if (!message || !message.toString().trim()) throw new Error("Message is required");

      const res = await fetch(`${GRAPH_API}/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ messaging_product: "whatsapp", to: recipientPhone, type: "text", text: { body: message } }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(`WhatsApp API error [${res.status}]: ${JSON.stringify(data)}`);

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("WhatsApp function error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
