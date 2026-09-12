import { supabase } from "@/integrations/supabase/client";

/**
 * Shared types and data helpers for the client project portal.
 * External systems remain the source of truth; this layer only aggregates.
 */
export interface PortalProject {
  id: string;
  title: string;
  category: string;
  client_name: string | null;
  description: string | null;
  status: string;
  progress: number;
  area: string | null;
  mall: string | null;
  images: string[] | null;
  completion_date: string | null;
  created_at: string;
  updated_at: string;
  daftra_work_order_id: number | null;
  magicplan_project_id: string | null;
  magicplan_plan_id: string | null;
  minio_prefix: string | null;
}

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DaftraInvoice {
  id: string;
  no?: string;
  date?: string;
  due_date?: string;
  summary_total?: number;
  total_paid?: number;
  payment_status?: string;
}

export interface DaftraWorkOrder {
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

export interface DaftraResult {
  configured: boolean;
  linked?: boolean;
  workOrder?: DaftraWorkOrder | null;
  invoices: DaftraInvoice[];
  summary: { total: number; paid: number; remaining: number; currency: string } | null;
}

export interface MagicplanProjectData {
  id: string;
  plan_id?: string | null;
  external_reference_id?: string | null;
  name?: string | null;
  description?: string | null;
  thumbnail_url?: string | null;
  cloud_url?: string | null;
  user_created?: string | null;
  user_modified?: string | null;
  archived_at?: string | null;
  address?: {
    street?: string | null;
    city?: string | null;
    country?: string | null;
    postal_code?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  } | null;
}

export interface MagicplanProjectResult {
  configured: boolean;
  linked?: boolean;
  action: "project";
  projectId?: string;
  storedPlanId?: string | null;
  data: MagicplanProjectData | null;
  pageInfo?: unknown;
}

export interface StoredFile {
  key: string;
  name: string;
  size: number;
  lastModified: string | null;
  url: string;
}

export interface FilesResult {
  configured: boolean;
  linked?: boolean;
  files: StoredFile[];
  prefix?: string;
  configurationMode?: "bucket-in-endpoint" | "separate-bucket";
}

async function invoke<T>(fn: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke(fn, { body });
  if (error) throw error;
  return data as T;
}

export const fetchDaftra = (projectId: string) =>
  invoke<DaftraResult>("portal-daftra", { projectId });

/**
 * Only the Magicplan project action is consumed by the production UI today.
 * Plan/files actions stay behind the Edge Function until their live server
 * response shapes are re-verified against the production account.
 */
export const fetchMagicplanProject = (projectId: string) =>
  invoke<MagicplanProjectResult>("portal-magicplan", { projectId, action: "project" });

export const fetchFiles = (projectId: string) =>
  invoke<FilesResult>("portal-files", { projectId });

/** Project status → Arabic label + tone used across the portal. */
export const STATUS_META: Record<string, { label: string; tone: string }> = {
  planning: { label: "التخطيط", tone: "bg-muted text-muted-foreground" },
  in_progress: { label: "قيد التنفيذ", tone: "bg-accent/15 text-accent-foreground" },
  "in-progress": { label: "قيد التنفيذ", tone: "bg-accent/15 text-accent-foreground" },
  on_hold: { label: "متوقف مؤقتًا", tone: "bg-destructive/10 text-destructive" },
  completed: { label: "مكتمل", tone: "bg-emerald-500/15 text-emerald-700" },
  delivered: { label: "تم التسليم", tone: "bg-emerald-500/15 text-emerald-700" },
};

export const MILESTONE_STATUS_META: Record<string, { label: string; tone: string }> = {
  pending: { label: "لم تبدأ", tone: "bg-muted text-muted-foreground" },
  in_progress: { label: "قيد التنفيذ", tone: "bg-accent/15 text-accent-foreground" },
  "in-progress": { label: "قيد التنفيذ", tone: "bg-accent/15 text-accent-foreground" },
  completed: { label: "مكتملة", tone: "bg-emerald-500/15 text-emerald-700" },
  delayed: { label: "متأخرة", tone: "bg-destructive/10 text-destructive" },
};

export function statusMeta(status: string | null | undefined) {
  return STATUS_META[status ?? ""] ?? {
    label: status ?? "غير محدد",
    tone: "bg-muted text-muted-foreground",
  };
}

export function milestoneStatusMeta(status: string | null | undefined) {
  return MILESTONE_STATUS_META[status ?? ""] ?? {
    label: status ?? "غير محدد",
    tone: "bg-muted text-muted-foreground",
  };
}

export function formatCurrency(value: number, currency = "EGP") {
  try {
    return new Intl.NumberFormat("ar-EG", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value || 0);
  } catch {
    return `${Math.round(value || 0).toLocaleString("ar-EG")} ${currency}`;
  }
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatFileSize(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
