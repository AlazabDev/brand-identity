import { CheckCircle2, Clock, ListTodo } from "lucide-react";
import { type PortalProject, type Milestone } from "@/lib/portal";
import { SectionCard, StatTile, EmptyState } from "@/components/portal/PortalUI";

export default function ProgressTab({
  project,
  milestones,
}: {
  project: PortalProject;
  milestones: Milestone[];
}) {
  const completed = milestones.filter((m) => m.status === "completed");
  const current = milestones.filter((m) => ["in_progress", "in-progress"].includes(m.status));
  const upcoming = milestones.filter((m) => m.status === "pending" || m.status === "delayed");

  const columns = [
    { title: "مكتملة", items: completed, icon: CheckCircle2, tone: "text-emerald-600" },
    { title: "قيد التنفيذ", items: current, icon: Clock, tone: "text-accent-foreground" },
    { title: "قادمة", items: upcoming, icon: ListTodo, tone: "text-muted-foreground" },
  ];

  return (
    <div className="space-y-6">
      <SectionCard title="التقدم الكلي للمشروع">
        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          <StatTile label="نسبة الإنجاز الكلية" value={`${project.progress}%`} tone="text-accent-foreground" />
          <StatTile label="مراحل مكتملة" value={`${completed.length} / ${milestones.length}`} tone="text-emerald-600" />
          <StatTile label="مراحل نشطة" value={current.length} />
        </div>
        <div className="h-4 overflow-hidden rounded-full bg-muted">
          <div
            className="flex h-full items-center justify-end rounded-full bg-accent pr-2 text-[10px] font-bold text-accent-foreground transition-all"
            style={{ width: `${Math.min(Math.max(project.progress, 0), 100)}%` }}
          >
            {project.progress >= 12 ? `${project.progress}%` : ""}
          </div>
        </div>
      </SectionCard>

      {milestones.length === 0 ? (
        <SectionCard title="حالة المهام">
          <EmptyState title="لا توجد مهام مسجلة بعد" />
        </SectionCard>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {columns.map((col) => (
            <SectionCard key={col.title} title={`${col.title} (${col.items.length})`}>
              {col.items.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">لا يوجد</p>
              ) : (
                <ul className="space-y-2">
                  {col.items.map((m) => (
                    <li key={m.id} className="flex items-start gap-2 rounded-lg bg-secondary/30 p-3">
                      <col.icon className={`mt-0.5 h-4 w-4 shrink-0 ${col.tone}`} />
                      <span className="text-sm text-foreground">{m.title}</span>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          ))}
        </div>
      )}
    </div>
  );
}
