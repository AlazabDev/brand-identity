import { GitCommitVertical } from "lucide-react";
import { type PortalProject, type Milestone, milestoneStatusMeta, formatDate } from "@/lib/portal";
import { SectionCard, EmptyState } from "@/components/portal/PortalUI";

interface ActivityItem {
  id: string;
  title: string;
  detail: string;
  at: string;
  tone: string;
}

/**
 * Until a dedicated project_activity table is provisioned, the activity feed is
 * derived from the real data we already have (project + milestone updates),
 * ordered chronologically. No placeholder data is invented.
 */
function buildActivity(project: PortalProject, milestones: Milestone[]): ActivityItem[] {
  const items: ActivityItem[] = [];

  items.push({
    id: `project-${project.id}`,
    title: "تحديث حالة المشروع",
    detail: `نسبة الإنجاز الحالية ${project.progress}%`,
    at: project.updated_at,
    tone: "text-accent-foreground",
  });

  milestones.forEach((m) => {
    const meta = milestoneStatusMeta(m.status);
    items.push({
      id: `milestone-${m.id}`,
      title: m.title,
      detail: `حالة المرحلة: ${meta.label}`,
      at: m.updated_at,
      tone: m.status === "completed" ? "text-emerald-600" : "text-muted-foreground",
    });
  });

  return items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

export default function ActivityTab({
  project,
  milestones,
}: {
  project: PortalProject;
  milestones: Milestone[];
}) {
  const activity = buildActivity(project, milestones);

  return (
    <SectionCard title="سجل نشاط المشروع" description="أحدث التحديثات على المشروع ومراحله">
      {activity.length === 0 ? (
        <EmptyState title="لا يوجد نشاط مسجل بعد" />
      ) : (
        <ol className="relative space-y-5 pr-6">
          <span className="absolute bottom-2 right-[9px] top-2 w-0.5 bg-border" aria-hidden />
          {activity.map((item) => (
            <li key={item.id} className="relative pr-6">
              <span className="absolute right-[-2px] top-0.5 grid h-5 w-5 place-items-center rounded-full bg-background">
                <GitCommitVertical className={`h-5 w-5 ${item.tone}`} />
              </span>
              <div className="rounded-xl border border-border/60 bg-secondary/30 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-display font-bold text-foreground">{item.title}</h4>
                  <time className="text-xs text-muted-foreground">{formatDate(item.at)}</time>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </SectionCard>
  );
}
