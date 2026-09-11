import { supabase } from "@/integrations/supabase/client";

export type PortalProject = {
  id: string;
  title: string;
  category: string;
  description: string | null;
  mall: string | null;
  area: string | null;
  client_name: string | null;
  completion_date: string | null;
  images: string[] | null;
  progress: number;
  status: string;
  daftra_work_order_id: number | null;
  magicplan_project_id: string | null;
  magicplan_plan_id: string | null;
  minio_prefix: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectMilestone = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ClientProfile = {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  company: string | null;
  created_at: string;
  updated_at: string;
};

export async function getSessionOrNull() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getMyProfile(): Promise<ClientProfile | null> {
  const { data, error } = await supabase
    .from("client_profiles")
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data as ClientProfile | null;
}

export async function getMyProjects(): Promise<PortalProject[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as PortalProject[];
}

export async function getProject(projectId: string): Promise<PortalProject | null> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as PortalProject | null;
}

export async function getProjectMilestones(projectId: string): Promise<ProjectMilestone[]> {
  const { data, error } = await supabase
    .from("project_milestones")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true })
    .order("due_date", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ProjectMilestone[];
}

export async function callPortalFunction<T>(
  functionName: "portal-daftra" | "portal-magicplan" | "portal-files" | "portal-admin",
  body: Record<string, unknown>,
): Promise<T> {
  const { data, error } = await supabase.functions.invoke(functionName, { body });
  if (error) throw error;
  return data as T;
}
