import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  CalendarRange,
  Wallet,
  DraftingCompass,
  FolderOpen,
  TrendingUp,
  History,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { type PortalProject, type Milestone, statusMeta } from "@/lib/portal";
import PortalLayout from "@/components/portal/PortalLayout";
import LoadingScreen from "@/components/LoadingScreen";
import OverviewTab from "@/components/portal/tabs/OverviewTab";
import TimelineTab from "@/components/portal/tabs/TimelineTab";
import FinancialTab from "@/components/portal/tabs/FinancialTab";
import DesignsTab from "@/components/portal/tabs/DesignsTab";
import FilesTab from "@/components/portal/tabs/FilesTab";
import ProgressTab from "@/components/portal/tabs/ProgressTab";
import ActivityTab from "@/components/portal/tabs/ActivityTab";

interface ProjectBundle {
  project: PortalProject;
  milestones: Milestone[];
}

async function fetchProject(projectId: string): Promise<ProjectBundle> {
  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();
  if (error) throw error;
  if (!project) throw new Error("not-found");

  const { data: milestones, error: milestonesError } = await supabase
    .from("project_milestones")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });
  if (milestonesError) throw milestonesError;

  return {
    project: project as PortalProject,
    milestones: (milestones ?? []) as Milestone[],
  };
}

/**
 * Production navigation only exposes sections backed by an implemented data
 * source. Approvals and the Foundry project assistant stay out of navigation
 * until their backend contracts are provisioned and verified live.
 */
const TABS = [
  { key: "overview", label: "نظرة عامة", icon: LayoutDashboard },
  { key: "timeline", label: "الجدول الزمني", icon: CalendarRange },
  { key: "financial", label: "المالية", icon: Wallet },
  { key: "designs", label: "التصاميم", icon: DraftingCompass },
  { key: "files", label: "الملفات", icon: FolderOpen },
  { key: "progress", label: "التقدم", icon: TrendingUp },
  { key: "activity", label: "النشاط", icon: History },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function PortalProjectPage() {
  const { id = "" } = useParams();
  const [tab, setTab] = useState<TabKey>("overview");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["portal-project", id],
    queryFn: () => fetchProject(id),
    enabled: Boolean(id),
  });

  if (isLoading) return <LoadingScreen />;

  if (isError || !data) {
    return (
      <PortalLayout crumbs={[{ label: "المشروع" }]}>
        <div className="card-elevated flex flex-col items-center gap-3 p-12 text-center">
          <h2 className="font-display text-lg font-bold text-foreground">
            تعذّر الوصول إلى هذا المشروع
          </h2>
          <p className="text-muted-foreground">
            قد يكون المشروع غير مرتبط بحسابك أو غير موجود. يرجى العودة إلى قائمة مشروعاتك.
          </p>
          <Link
            to="/portal"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground"
          >
            <ArrowRight className="h-4 w-4" />
            العودة للمشروعات
          </Link>
        </div>
      </PortalLayout>
    );
  }

  const { project, milestones } = data;
  const status = statusMeta(project.status);
  const code = project.id.slice(0, 8).toUpperCase();

  return (
    <PortalLayout crumbs={[{ label: project.title }]}>
      <div className="card-elevated mb-6 overflow-hidden">
        {project.images?.[0] && (
          <div className="relative h-40 w-full overflow-hidden bg-muted md:h-52">
            <img
              src={project.images[0] || "/placeholder.svg"}
              alt={project.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/70 to-transparent" />
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 md:p-6">
          <div>
            <p className="font-numeric text-xs text-muted-foreground">كود المشروع: {code}</p>
            <h1 className="mt-1 font-display text-2xl font-bold text-foreground">{project.title}</h1>
            <div className="mt-2 flex items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs ${status.tone}`}>{status.label}</span>
              {project.mall && <span className="text-sm text-muted-foreground">{project.mall}</span>}
            </div>
          </div>
          <div className="text-center">
            <p className="font-numeric text-3xl font-bold text-accent-foreground">{project.progress}%</p>
            <p className="text-sm text-muted-foreground">نسبة الإنجاز</p>
          </div>
        </div>
      </div>

      <div className="custom-scrollbar mb-6 flex gap-2 overflow-x-auto pb-2">
        {TABS.map((item) => {
          const active = tab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === "overview" && <OverviewTab project={project} milestones={milestones} />}
      {tab === "timeline" && <TimelineTab milestones={milestones} />}
      {tab === "financial" && <FinancialTab projectId={project.id} />}
      {tab === "designs" && <DesignsTab projectId={project.id} />}
      {tab === "files" && <FilesTab projectId={project.id} minioPrefix={project.minio_prefix} />}
      {tab === "progress" && <ProgressTab project={project} milestones={milestones} />}
      {tab === "activity" && <ActivityTab project={project} milestones={milestones} />}
    </PortalLayout>
  );
}
