import { CheckCircle2, Circle, Clock, AlertTriangle } from "lucide-react";
import { type Milestone, milestoneStatusMeta, formatDate } from "@/lib/portal";
import { SectionCard, EmptyState } from "@/components/portal/PortalUI";

const ICONS: Record<string, typeof Circle> = {
  completed: CheckCircle2,
  in_progress: Clock,
  "in-progress": Clock,
  delayed: AlertTriangle,
  pending: Circle,
};

export default function TimelineTab({ milestones }: { milestones: Milestone[] }) {
  if (milestones.length === 0) {
    return (
      <SectionCard title="الجدول الزمني">
        <EmptyState title="لم تُضف مراحل للمشروع بعد" description="ستظهر مراحل المشروع هنا فور إضافتها من فريق العزب." />
      </SectionCard>
    );
  }

  return (
    <SectionCard title="الجدول الزمني للمشروع" description="مراحل تنفيذ المشروع بالترتيب الزمني">
      <ol className="relative space-y-6 pr-6">
        <span className="absolute bottom-2 right-[9px] top-2 w-0.5 bg-border" aria-hidden />
        {milestones.map((m) => {
          const meta = milestoneStatusMeta(m.status);
          const Icon = ICONS[m.status] ?? Circle;
          const done = m.status === "completed";
          const active = ["in_progress", "in-progress"].includes(m.status);
          return (
            <li key={m.id} className="relative pr-6">
              <span
                className={`absolute right-[-2px] top-0.5 grid h-5 w-5 place-items-center rounded-full bg-background ${
                  done ? "text-emerald-600" : active ? "text-accent-foreground" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div className="rounded-xl border border-border/60 bg-secondary/30 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-display font-bold text-foreground">{m.title}</h4>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs ${meta.tone}`}>{meta.label}</span>
                </div>
                {m.description && <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>}
                <p className="mt-2 text-xs text-muted-foreground">
                  الموعد المستهدف: {formatDate(m.due_date)}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </SectionCard>
  );
}
