import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { AwsClient } from "https://esm.sh/aws4fetch@1.0.20";
import { authorizeProject, corsHeaders, jsonResponse } from "../_shared/portalAuth.ts";

interface StoredFile {
  key: string;
  name: string;
  size: number;
  lastModified: string | null;
  url: string;
}

function textBetween(xml: string, tag: string): string[] {
  const matches = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "g")) ?? [];
  return matches.map((entry) => entry.replace(new RegExp(`</?${tag}>`, "g"), ""));
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const projectId = typeof body.projectId === "string" ? body.projectId : "";

    const auth = await authorizeProject(req, projectId);
    if ("error" in auth) return auth.error;

    const endpoint = Deno.env.get("MINIO_ENDPOINT");
    const accessKey = Deno.env.get("MINIO_ACCESS_KEY");
    const secretKey = Deno.env.get("MINIO_SECRET_KEY");
    const bucket = Deno.env.get("MINIO_BUCKET");

    if (!endpoint || !accessKey || !secretKey || !bucket) {
      return jsonResponse({ configured: false, files: [] });
    }

    const prefix = auth.project.minio_prefix;
    if (!prefix) return jsonResponse({ configured: true, linked: false, files: [] });

    const host = endpoint.replace(/\/$/, "");
    const client = new AwsClient({
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
      service: "s3",
      region: Deno.env.get("MINIO_REGION") ?? "us-east-1",
    });

    const listUrl =
      `${host}/${bucket}?list-type=2&prefix=${encodeURIComponent(prefix.replace(/^\//, ""))}&max-keys=200`;
    const listRes = await client.fetch(listUrl, { method: "GET" });

    if (!listRes.ok) {
      console.error("MinIO list failed", listRes.status);
      return jsonResponse({ error: "File storage unavailable" }, 502);
    }

    const xml = await listRes.text();
    const contents = xml.match(/<Contents>[\s\S]*?<\/Contents>/g) ?? [];

    const files: StoredFile[] = [];
    for (const entry of contents) {
      const key = textBetween(entry, "Key")[0];
      if (!key || key.endsWith("/")) continue;

      const signed = await client.sign(
        new Request(`${host}/${bucket}/${key.split("/").map(encodeURIComponent).join("/")}?X-Amz-Expires=900`),
        { aws: { signQuery: true } },
      );

      files.push({
        key,
        name: key.split("/").pop() ?? key,
        size: Number(textBetween(entry, "Size")[0] ?? 0),
        lastModified: textBetween(entry, "LastModified")[0] ?? null,
        url: signed.url,
      });
    }

    return jsonResponse({ configured: true, linked: true, files });
  } catch (error) {
    console.error("portal-files error", error);
    return jsonResponse({ error: "Unexpected error" }, 500);
  }
});
