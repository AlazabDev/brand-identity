import { ClipboardCheck } from "lucide-react";
import { SectionCard, EmptyState } from "@/components/portal/PortalUI";

/**
 * Approvals require a dedicated project_approvals table with an audit log,
 * which is not provisioned in this environment yet. The section renders a
 * clear empty state instead of querying a non-existent table.
 */
export default function ApprovalsTab() {
  return (
    <SectionCard
      title="الاعتمادات المطلوبة"
      description="القرارات التي تحتاج موافقتك (تصميم، خامة، سعر، موعد)"
    >
      <EmptyState
        icon={ClipboardCheck}
        title="لا توجد اعتمادات مطلوبة حاليًا"
        description="عند وجود قرار يحتاج موافقتك، سيظهر هنا مع التفاصيل والملفات، وسيتم تسجيل قرارك في سجل التدقيق."
      />
    </SectionCard>
  );
}
