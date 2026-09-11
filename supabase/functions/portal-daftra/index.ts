import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authorizeProject, corsHeaders, jsonResponse } from "../_shared/portalAuth.ts";

const DEFAULT_BASE_URL = "https://alazab-co.daftra.com/api2";
const PAGE_SIZE = 100;
const MAX_PAGES = 100;

interface DaftraInvoice {
  id: string;
  no?: string;
  date?: string;
  due_date?: string;
  summary_total: number;
  payment_status?: string;
  total_paid: number;
}

interface DaftraWorkOrder {
  id: number;
  number?: string;
  title?: string;
  client_id?: number | null;
  status?: string | number | null;
  start_date?: string | null;
  delivery_date?: string | null;
  description?: string | null;
  budget?: number | string | null;
  budget_currency?: string | null;
  created?: string | null;
  modified?: string | null;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function toNumber(value: unknown): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapInvoice(entry: unknown): DaftraInvoice {
  const outer = asRecord(entry);
  const invoice = asRecord(outer.Invoice ?? entry);

  return {
    id: String(invoice.id ?? invoice.no ?? crypto.randomUUID()),
    no: invoice.no == null ? undefined : String(invoice.no),
    date: invoice.date == null ? undefined : String(invoice.date),
    due_date: invoice.due_date == null ? undefined : String(invoice.due_date),
    summary_total: toNumber(invoice.summary_total),
    total_paid: toNumber(invoice.total_paid),
    payment_status: invoice.payment_status == null
      ? undefined
      : String(invoice.payment_status),
  };
}

function mapWorkOrder(payload: unknown): DaftraWorkOrder | null {
  const root = asRecord(payload);
  const data = asRecord(root.data);
  const workOrder = asRecord(data.WorkOrder ?? data);
  const id = Number(workOrder.id);
  if (!Number.isFinite(id)) return null;

  return {
    id,
    number: workOrder.number == null ? undefined : String(workOrder.number),
    title: workOrder.title == null ? undefined : String(workOrder.title),
    client_id: workOrder.client_id == null ? null : Number(workOrder.client_id),
    status: workOrder.status == null
      ? null
      : typeof workOrder.status === "number"
        ? workOrder.status
        : String(workOrder.status),
    start_date: workOrder.start_date == null ? null : String(workOrder.start_date),
    delivery_date: workOrder.delivery_date == null
      ? null
      : String(workOrder.delivery_date),
    description: workOrder.description == null ? null : String(workOrder.description),
    budget: workOrder.budget == null
      ? null
      : typeof workOrder.budget === "number"
        ? workOrder.budget
        : String(workOrder.budget),
    budget_currency: workOrder.budget_currency == null
      ? null
      : String(workOrder.budget_currency),
    created: workOrder.created == null ? null : String(workOrder.created),
    modified: workOrder.modified == null ? null : String(workOrder.modified),
  };
}

async function fetchAllInvoices(
  baseUrl: string,
  apiKey: string,
  workOrderId: number,
): Promise<DaftraInvoice[]> {
  const invoices: DaftraInvoice[] = [];

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const url = new URL(`${baseUrl}/invoices`);
    url.searchParams.set("work_order_id", String(workOrderId));
    url.searchParams.set("limit", String(PAGE_SIZE));
    url.searchParams.set("page", String(page));
    url.searchParams.set("recursive", "1");

    const response = await fetch(url, {
      headers: { apikey: apiKey, Accept: "application/json" },
    });

    if (!response.ok) {
      console.error("Daftra invoices request failed", response.status, await response.text());
      throw new Error(`Daftra invoices request failed with ${response.status}`);
    }

    const payload = await response.json();
    const rawList: unknown[] = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload)
        ? payload
        : [];

    invoices.push(...rawList.map(mapInvoice));
    if (rawList.length < PAGE_SIZE) break;
  }

  return invoices;
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
      return jsonResponse({ configured: false, linked: false, workOrder: null, invoices: [], summary: null });
    }

    const workOrderId = auth.project.daftra_work_order_id;
    if (workOrderId == null) {
      return jsonResponse({ configured: true, linked: false, workOrder: null, invoices: [], summary: null });
    }

    const baseUrl = (Deno.env.get("DAFTRA_BASE_URL") ?? DEFAULT_BASE_URL).replace(/\/$/, "");
    const workOrderResponse = await fetch(
      `${baseUrl}/work_orders/${encodeURIComponent(String(workOrderId))}.json`,
      { headers: { apikey: apiKey, Accept: "application/json" } },
    );

    if (!workOrderResponse.ok) {
      console.error(
        "Daftra work order request failed",
        workOrderResponse.status,
        await workOrderResponse.text(),
      );
      return jsonResponse({ error: "Accounting service unavailable" }, 502);
    }

    const workOrder = mapWorkOrder(await workOrderResponse.json());
    if (!workOrder) {
      console.error("Daftra returned an invalid work order payload", workOrderId);
      return jsonResponse({ error: "Accounting service returned invalid project data" }, 502);
    }

    const invoices = await fetchAllInvoices(baseUrl, apiKey, workOrderId);
    const total = invoices.reduce((sum, item) => sum + item.summary_total, 0);
    const paid = invoices.reduce((sum, item) => sum + item.total_paid, 0);

    return jsonResponse({
      configured: true,
      linked: true,
      workOrder,
      invoices,
      summary: {
        total,
        paid,
        remaining: Math.max(total - paid, 0),
        currency: "EGP",
      },
    });
  } catch (error) {
    console.error("portal-daftra error", error);
    return jsonResponse({ error: "Unexpected error" }, 500);
  }
});
