import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ExternalLink, DraftingCompass, Image as ImageIcon } from "lucide-react";
import { fetchMagicplanProject, formatDate } from "@/lib/portal";
import {
  SectionCard,
  InfoRow,
  EmptyState,
  NotConfigured,
  TabSkeleton,
} from "@/components/portal/PortalUI";
import { Button } from "@/components/ui/button";

export default function DesignsTab({ projectId }: { projectId: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["portal-magicplan-project", projectId],
    queryFn: () => fetchMagicplanProject(projectId),
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <SectionCard title="التصاميم والمخططات">
        <TabSkeleton />
      </SectionCard>
    );
  }

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

  if (!data?.configured || data.linked === false) {
    return (
      <SectionCard title="التصاميم والمخططات">
        <NotConfigured system="Magicplan" />
      </SectionCard>
    );
  }

  const project = data.data;
  if (!project) {
    return (
      <SectionCard title="التصاميم والمخططات">
        <EmptyState
          icon={DraftingCompass}
          title="لم ترجع بيانات مشروع من Magicplan"
          description="راجع ربط Magicplan Project ID لهذا المشروع."
        />
      </SectionCard>
    );
  }

  const planId = project.plan_id ?? data.storedPlanId ?? null;

  return (
    <div className="space-y-6">
      <SectionCard
        title="مشروع Magicplan"
        description="البيانات معروضة مباشرة من مشروع Magicplan المرتبط"
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="grid gap-x-8 sm:grid-cols-2">
            <InfoRow label="اسم المشروع" value={project.name || "—"} />
            <InfoRow label="Magicplan Project ID" value={project.id} />
            <InfoRow label="Plan ID" value={planId || "—"} />
            <InfoRow label="External Reference" value={project.external_reference_id || "—"} />
            <InfoRow label="آخر تعديل" value={formatDate(project.user_modified)} />
            <InfoRow
              label="الحالة"
              value={project.archived_at ? `مؤرشف — ${formatDate(project.archived_at)}` : "نشط"}
            />
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
            {project.thumbnail_url ? (
              <img
                src={project.thumbnail_url}
                alt={project.name || "Magicplan"}
                className="h-full min-h-48 w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="grid min-h-48 place-items-center text-muted-foreground">
                <ImageIcon className="h-10 w-10" />
              </div>
            )}
          </div>
        </div>

        {project.description && (
          <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
            {project.description}
          </p>
        )}

        {project.cloud_url && (
          <div className="mt-5">
            <Button asChild variant="outline" className="gap-2">
              <a href={project.cloud_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                فتح المشروع في Magicplan
              </a>
            </Button>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="المخطط والملفات الهندسية"
        description="سيتم تفعيل التفاصيل والملفات هنا بعد اجتياز اختبار المسارات المباشر من خادم الإنتاج."
      >
        <EmptyState
          icon={DraftingCompass}
          title="ربط المشروع مؤكد — اختبار المسارات التفصيلية متبقٍ"
          description="لن تعتمد البوابة على شكل Plan أو Files مفترض قبل اختبار Magicplan مباشرة من الخادم ومطابقة الاستجابة الفعلية."
        />
      </SectionCard>
    </div>
  );
}
