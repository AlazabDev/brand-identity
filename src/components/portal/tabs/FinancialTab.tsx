import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Wallet, TrendingUp, Receipt } from "lucide-react";
import { fetchDaftra, formatCurrency, formatDate } from "@/lib/portal";
import { SectionCard, StatTile, EmptyState, NotConfigured, TabSkeleton } from "@/components/portal/PortalUI";

const PAYMENT_STATUS: Record<string, { label: string; tone: string }> = {
  paid: { label: "مدفوعة", tone: "bg-emerald-500/15 text-emerald-700" },
  unpaid: { label: "غير مدفوعة", tone: "bg-destructive/10 text-destructive" },
  partial: { label: "مدفوعة جزئيًا", tone: "bg-accent/15 text-accent-foreground" },
};

export default function FinancialTab({ projectId }: { projectId: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["portal-daftra", projectId],
    queryFn: () => fetchDaftra(projectId),
    staleTime: 60_000,
  });

  if (isLoading) return <SectionCard title="البيانات المالية"><TabSkeleton /></SectionCard>;

  if (isError) {
    return (
      <SectionCard title="البيانات المالية">
        <EmptyState
          icon={AlertCircle}
          title="تعذّر تحميل البيانات المالية"
          description="خدمة المحاسبة (دفترة) غير متاحة حاليًا. يظل باقي محتوى المشروع متاحًا."
        />
      </SectionCard>
    );
  }

  if (!data?.configured) {
    return <SectionCard title="البيانات المالية"><NotConfigured system="دفترة" /></SectionCard>;
  }

  if (data.linked === false) {
    return (
      <SectionCard title="البيانات المالية">
        <NotConfigured system="دفترة" />
      </SectionCard>
    );
  }

  const summary = data.summary;
  const currency = summary?.currency || "EGP";

  return (
    <div className="space-y-6">
      {summary && (
        <SectionCard title="ملخص مالي" description="القيم مصدرها نظام دفترة المحاسبي">
          <div className="grid gap-3 sm:grid-cols-3">
            <StatTile label="إجمالي التعاقد" value={formatCurrency(summary.total, currency)} icon={TrendingUp} />
            <StatTile label="المدفوع" value={formatCurrency(summary.paid, currency)} icon={Wallet} tone="text-emerald-600" />
            <StatTile label="المتبقي" value={formatCurrency(summary.remaining, currency)} icon={Receipt} tone="text-accent-foreground" />
          </div>
        </SectionCard>
      )}

      <SectionCard title="الفواتير" description="فواتير المشروع الصادرة">
        {data.invoices.length === 0 ? (
          <EmptyState icon={Receipt} title="لا توجد فواتير بعد" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-3 py-2 font-medium">رقم الفاتورة</th>
                  <th className="px-3 py-2 font-medium">التاريخ</th>
                  <th className="px-3 py-2 font-medium">الإجمالي</th>
                  <th className="px-3 py-2 font-medium">المدفوع</th>
                  <th className="px-3 py-2 font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {data.invoices.map((inv) => {
                  const st = PAYMENT_STATUS[inv.payment_status ?? ""] ?? {
                    label: inv.payment_status || "—",
                    tone: "bg-muted text-muted-foreground",
                  };
                  return (
                    <tr key={inv.id} className="border-b border-border/50 last:border-0">
                      <td className="px-3 py-3 font-numeric">{inv.no || inv.id.slice(0, 8)}</td>
                      <td className="px-3 py-3 text-muted-foreground">{formatDate(inv.date)}</td>
                      <td className="px-3 py-3 font-numeric">{formatCurrency(inv.summary_total ?? 0, currency)}</td>
                      <td className="px-3 py-3 font-numeric text-emerald-600">{formatCurrency(inv.total_paid ?? 0, currency)}</td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs ${st.tone}`}>{st.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
