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

function decodeXml(value: string): string {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");
}

function textBetween(xml: string, tag: string): string[] {
  const matches = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "g")) ?? [];
  return matches.map((entry) =>
    decodeXml(entry.replace(new RegExp(`</?${tag}>`, "g"), ""))
  );
}

function resolveBucketBase(endpoint: string, bucket?: string | null): {
  bucketBase: string;
  mode: "bucket-in-endpoint" | "separate-bucket";
} | null {
  let parsed: URL;
  try {
    parsed = new URL(endpoint);
  } catch {
    return null;
  }

  const endpointPath = parsed.pathname.replace(/\/+$/, "");
  if (endpointPath && endpointPath !== "/") {
    return {
      bucketBase: `${parsed.origin}${endpointPath}`,
      mode: "bucket-in-endpoint",
    };
  }

  const normalizedBucket = bucket?.trim();
  if (!normalizedBucket) return null;

  return {
    bucketBase: `${parsed.origin}/${normalizedBucket}`,
    mode: "separate-bucket",
  };
}

function objectUrl(bucketBase: string, key: string): string {
  return `${bucketBase}/${key.split("/").map(encodeURIComponent).join("/")}`;
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

    if (!endpoint || !accessKey || !secretKey) {
      return jsonResponse({ configured: false, linked: false, files: [] });
    }

    const storageTarget = resolveBucketBase(endpoint, bucket);
    if (!storageTarget) {
      console.error(
        "MinIO configuration requires either a bucket in MINIO_ENDPOINT or MINIO_BUCKET",
      );
      return jsonResponse({ configured: false, linked: false, files: [] });
    }

    const prefix = auth.project.minio_prefix?.replace(/^\/+/, "");
    if (!prefix) {
      return jsonResponse({
        configured: true,
        linked: false,
        files: [],
        configurationMode: storageTarget.mode,
      });
    }

    const client = new AwsClient({
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
      service: "s3",
      region: Deno.env.get("MINIO_REGION") ?? "us-east-1",
    });

    const files: StoredFile[] = [];
    let continuationToken: string | null = null;
    let page = 0;

    do {
      page += 1;
      if (page > 100) {
        console.error("MinIO listing stopped after 100 pages", prefix);
        break;
      }

      const listUrl = new URL(storageTarget.bucketBase);
      listUrl.searchParams.set("list-type", "2");
      listUrl.searchParams.set("prefix", prefix);
      listUrl.searchParams.set("max-keys", "1000");
      if (continuationToken) {
        listUrl.searchParams.set("continuation-token", continuationToken);
      }

      const listRes = await client.fetch(listUrl, { method: "GET" });
      if (!listRes.ok) {
        console.error("MinIO list failed", listRes.status, await listRes.text());
        return jsonResponse({ error: "File storage unavailable" }, 502);
      }

      const xml = await listRes.text();
      const contents = xml.match(/<Contents>[\s\S]*?<\/Contents>/g) ?? [];

      for (const entry of contents) {
        const key = textBetween(entry, "Key")[0];
        if (!key || key.endsWith("/")) continue;

        const signed = await client.sign(
          new Request(`${objectUrl(storageTarget.bucketBase, key)}?X-Amz-Expires=900`),
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

      const isTruncated = textBetween(xml, "IsTruncated")[0]?.toLowerCase() === "true";
      continuationToken = isTruncated
        ? textBetween(xml, "NextContinuationToken")[0] ?? null
        : null;
    } while (continuationToken);

    return jsonResponse({
      configured: true,
      linked: true,
      configurationMode: storageTarget.mode,
      prefix,
      files,
    });
  } catch (error) {
    console.error("portal-files error", error);
    return jsonResponse({ error: "Unexpected error" }, 500);
  }
});
