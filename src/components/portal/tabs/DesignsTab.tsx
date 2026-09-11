import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ExternalLink, Ruler, Boxes } from "lucide-react";
import { fetchMagicplan, formatDate } from "@/lib/portal";
import { SectionCard, InfoRow, EmptyState, NotConfigured, TabSkeleton } from "@/components/portal/PortalUI";
import { Button } from "@/components/ui/button";

export default function DesignsTab({ projectId }: { projectId: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["portal-magicplan", projectId],
    queryFn: () => fetchMagicplan(projectId),
    staleTime: 60_000,
  });

  if (isLoading) return <SectionCard title="التصاميم والمخططات"><TabSkeleton /></SectionCard>;

  if (isError) {
    return (
      <SectionCard title="التصاميم والمخططات">
        <EmptyState
          icon={AlertCircle}
          title="تعذّر تحميل بيانات التصميم"
          description="خدمة Magicplan غير متاحة حاليًا. يظل باقي محتوى المشروع متاحًا."
        />
      </SectionCard>
    );
  }

  if (!data?.configured || data.linked === false || !data.plan) {
    return <SectionCard title="التصاميم والمخططات"><NotConfigured system="Magicplan" /></SectionCard>;
  }

  const plan = data.plan;

  return (
    <div className="space-y-6">
      <SectionCard title="بيانات المخطط" description="مصدر البيانات: Magicplan">
        <div className="grid gap-x-8 sm:grid-cols-2">
          <InfoRow label="اسم المخطط" value={plan.name} />
          <InfoRow label="المساحة الكلية" value={plan.area ? `${plan.area} م²` : "—"} />
          <InfoRow label="عدد الطوابق" value={Array.isArray(plan.floors) ? plan.floors.length : 0} />
          <InfoRow label="آخر تعديل" value={formatDate(plan.updatedAt)} />
        </div>
        {plan.viewerUrl && (
          <div className="mt-4">
            <Button asChild variant="outline" className="gap-2">
              <a href={plan.viewerUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                فتح المخطط في نافذة جديدة
              </a>
            </Button>
          </div>
        )}
      </SectionCard>

      {plan.viewerUrl ? (
        <SectionCard title="عارض النموذج ثلاثي الأبعاد / المخطط">
          <div className="aspect-video overflow-hidden rounded-xl border border-border bg-muted">
            <iframe
              src={plan.viewerUrl}
              title={`عارض مخطط ${plan.name}`}
              className="h-full w-full"
              loading="lazy"
              allow="fullscreen; xr-spatial-tracking"
            />
          </div>
        </SectionCard>
      ) : (
        <SectionCard title="عارض النموذج ثلاثي الأبعاد / المخطط">
          <EmptyState icon={Boxes} title="لا يوجد عارض تفاعلي متاح لهذا المخطط" />
        </SectionCard>
      )}

      {Array.isArray(plan.floors) && plan.floors.length > 0 && (
        <SectionCard title="الطوابق والمساحات">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {plan.floors.map((floor, i) => {
              const f = floor as { name?: string; area?: number | string };
              return (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-border/60 bg-secondary/30 p-4">
                  <Ruler className="h-5 w-5 text-accent" />
                  <div>
                    <p className="font-display font-bold text-foreground">{f.name || `الطابق ${i + 1}`}</p>
                    <p className="text-sm text-muted-foreground">{f.area ? `${f.area} م²` : "—"}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
