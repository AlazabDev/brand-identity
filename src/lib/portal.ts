import { supabase } from "@/integrations/supabase/client";

/**
 * Shared types and data helpers for the client project portal.
 * The portal reads from Supabase (projects, milestones, links) and calls
 * the portal-* edge functions which proxy Daftra, Magicplan and MinIO.
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
  daftra_client_id: string | null;
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

export interface DaftraResult {
  configured: boolean;
  linked?: boolean;
  invoices: DaftraInvoice[];
  summary: { total: number; paid: number; remaining: number; currency: string } | null;
}

export interface MagicplanResult {
  configured: boolean;
  linked?: boolean;
  plan: {
    id: string;
    name: string;
    viewerUrl: string | null;
    area?: number | string | null;
    floors?: unknown[];
    updatedAt?: string | null;
  } | null;
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
}

async function invoke<T>(fn: string, projectId: string): Promise<T> {
  const { data, error } = await supabase.functions.invoke(fn, {
    body: { projectId },
  });
  if (error) throw error;
  return data as T;
}

export const fetchDaftra = (projectId: string) =>
  invoke<DaftraResult>("portal-daftra", projectId);

export const fetchMagicplan = (projectId: string) =>
  invoke<MagicplanResult>("portal-magicplan", projectId);

export const fetchFiles = (projectId: string) =>
  invoke<FilesResult>("portal-files", projectId);

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
  return STATUS_META[status ?? ""] ?? { label: status ?? "غير محدد", tone: "bg-muted text-muted-foreground" };
}

export function milestoneStatusMeta(status: string | null | undefined) {
  return (
    MILESTONE_STATUS_META[status ?? ""] ?? {
      label: status ?? "غير محدد",
      tone: "bg-muted text-muted-foreground",
    }
  );
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
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
