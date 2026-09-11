import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authorizeProject, corsHeaders, jsonResponse } from "../_shared/portalAuth.ts";

const DEFAULT_BASE_URL = "https://alazab-co.daftra.com/api2";

interface DaftraInvoice {
  id: string;
  no?: string;
  date?: string;
  due_date?: string;
  summary_total?: number;
  payment_status?: string;
  total_paid?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const projectId = typeof body.projectId === "string" ? body.projectId : "";

    const auth = await authorizeProject(req, projectId);
    if ("error" in auth) return auth.error;

    const apiKey = Deno.env.get("DAFTRA_API_KEY");
    if (!apiKey) {
      return jsonResponse({ configured: false, invoices: [], summary: null });
    }

    const clientId = auth.project.daftra_client_id;
    if (!clientId) {
      return jsonResponse({ configured: true, linked: false, invoices: [], summary: null });
    }

    const baseUrl = (Deno.env.get("DAFTRA_BASE_URL") ?? DEFAULT_BASE_URL).replace(/\/$/, "");
    const res = await fetch(
      `${baseUrl}/invoices?client_id=${encodeURIComponent(clientId)}&limit=100`,
      { headers: { APIKEY: apiKey, Accept: "application/json" } },
    );

    if (!res.ok) {
      console.error("Daftra request failed", res.status);
      return jsonResponse({ error: "Accounting service unavailable" }, 502);
    }

    const payload = await res.json();
    const rawList: unknown[] = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload)
        ? payload
        : [];

    const invoices: DaftraInvoice[] = rawList.map((entry) => {
      const record = (entry as Record<string, unknown>)?.Invoice ?? entry;
      const invoice = record as Record<string, unknown>;
      return {
        id: String(invoice.id ?? invoice.no ?? crypto.randomUUID()),
        no: invoice.no ? String(invoice.no) : undefined,
        date: invoice.date ? String(invoice.date) : undefined,
        due_date: invoice.due_date ? String(invoice.due_date) : undefined,
        summary_total: Number(invoice.summary_total ?? 0),
        total_paid: Number(invoice.total_paid ?? 0),
        payment_status: invoice.payment_status ? String(invoice.payment_status) : undefined,
      };
    });

    const total = invoices.reduce((sum, item) => sum + (item.summary_total ?? 0), 0);
    const paid = invoices.reduce((sum, item) => sum + (item.total_paid ?? 0), 0);

    return jsonResponse({
      configured: true,
      linked: true,
      invoices,
      summary: { total, paid, remaining: Math.max(total - paid, 0), currency: "EGP" },
    });
  } catch (error) {
    console.error("portal-daftra error", error);
    return jsonResponse({ error: "Unexpected error" }, 500);
  }
});
