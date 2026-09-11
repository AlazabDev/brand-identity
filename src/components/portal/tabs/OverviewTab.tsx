import { CalendarClock, CalendarDays, Layers, MapPin, Ruler, Activity } from "lucide-react";
import {
  type PortalProject,
  type Milestone,
  statusMeta,
  formatDate,
} from "@/lib/portal";
import { SectionCard, InfoRow, StatTile } from "@/components/portal/PortalUI";

function currentPhase(milestones: Milestone[]) {
  const active = milestones.find((m) => ["in_progress", "in-progress"].includes(m.status));
  if (active) return active.title;
  const completed = milestones.filter((m) => m.status === "completed");
  if (completed.length) return `اكتملت: ${completed[completed.length - 1].title}`;
  return "لم تبدأ المراحل بعد";
}

export default function OverviewTab({
  project,
  milestones,
}: {
  project: PortalProject;
  milestones: Milestone[];
}) {
  const status = statusMeta(project.status);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <SectionCard title="نظرة عامة على المشروع" description={project.description || undefined}>
          <div className="grid gap-x-8 sm:grid-cols-2">
            <InfoRow label="اسم المشروع" value={project.title} />
            <InfoRow label="التصنيف" value={project.category || "—"} />
            <InfoRow
              label="الحالة"
              value={<span className={`rounded-full px-2.5 py-0.5 text-xs ${status.tone}`}>{status.label}</span>}
            />
            <InfoRow label="المرحلة الحالية" value={currentPhase(milestones)} />
            <InfoRow label="الموقع" value={project.mall || "—"} />
            <InfoRow label="المساحة" value={project.area ? `${project.area} م²` : "—"} />
            <InfoRow label="تاريخ البداية" value={formatDate(project.created_at)} />
            <InfoRow label="التسليم المتوقع" value={formatDate(project.completion_date)} />
            <InfoRow label="مدير المشروع" value={project.client_name || "فريق العزب"} />
            <InfoRow label="آخر تحديث" value={formatDate(project.updated_at)} />
          </div>
        </SectionCard>
      </div>

      <div className="space-y-6">
        <SectionCard title="مؤشرات سريعة">
          <div className="grid grid-cols-2 gap-3">
            <StatTile label="نسبة الإنجاز" value={`${project.progress}%`} icon={Activity} tone="text-accent-foreground" />
            <StatTile label="عدد المراحل" value={milestones.length} icon={Layers} />
            <StatTile
              label="مراحل مكتملة"
              value={milestones.filter((m) => m.status === "completed").length}
              icon={CalendarDays}
              tone="text-emerald-600"
            />
            <StatTile
              label="مراحل نشطة"
              value={milestones.filter((m) => ["in_progress", "in-progress"].includes(m.status)).length}
              icon={CalendarClock}
            />
          </div>
        </SectionCard>

        <SectionCard title="التقدم الكلي">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">نسبة الإنجاز</span>
              <span className="font-numeric text-lg font-bold text-primary">{project.progress}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${Math.min(Math.max(project.progress, 0), 100)}%` }}
              />
            </div>
            {(project.mall || project.area) && (
              <p className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
                {project.mall ? <MapPin className="h-4 w-4 text-accent" /> : <Ruler className="h-4 w-4 text-accent" />}
                {project.mall || `${project.area} م²`}
              </p>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
