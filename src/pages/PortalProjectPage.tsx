import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowRight,
  CalendarDays,
  ExternalLink,
  File,
  FolderOpen,
  LogOut,
  RefreshCw,
  Ruler,
  WalletCards,
} from "lucide-react";
import brandLogo from "@/assets/brand-identity.png";
import {
  callPortalFunction,
  getProject,
  getProjectMilestones,
  getSessionOrNull,
  type PortalProject,
  type ProjectMilestone,
} from "@/services/portal";

type DaftraResult = {
  configured: boolean;
  linked: boolean;
  workOrder: null | {
    id: number;
    number?: string;
    title?: string;
    status?: string | number | null;
    start_date?: string | null;
    delivery_date?: string | null;
  };
  invoices: Array<{
    id: string;
    no?: string;
    date?: string;
    due_date?: string;
    summary_total: number;
    total_paid: number;
    payment_status?: string;
  }>;
  summary: null | { total: number; paid: number; remaining: number; currency: string };
};

type MagicplanResult = {
  configured: boolean;
  linked: boolean;
  action: "project" | "plan" | "files";
  projectId?: string;
  storedPlanId?: string | null;
  data: any;
  pageInfo?: any;
};

type MinioResult = {
  configured: boolean;
  linked: boolean;
  prefix?: string;
  files: Array<{
    key: string;
    name: string;
    size: number;
    lastModified: string | null;
    url: string;
  }>;
};

const money = (value: number, currency = "EGP") =>
  new Intl.NumberFormat("ar-EG", { style: "currency", currency, maximumFractionDigits: 2 }).format(value || 0);

const fileSize = (bytes: number) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

const PortalProjectPage = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<PortalProject | null>(null);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [daftra, setDaftra] = useState<DaftraResult | null>(null);
  const [magicProject, setMagicProject] = useState<MagicplanResult | null>(null);
  const [magicPlan, setMagicPlan] = useState<MagicplanResult | null>(null);
  const [minio, setMinio] = useState<MinioResult | null>(null);
  const [tabLoading, setTabLoading] = useState<string | null>(null);
  const [tabError, setTabError] = useState("");

  const loadProject = async () => {
    setLoading(true);
    setError("");
    try {
      const session = await getSessionOrNull();
      if (!session) {
        navigate("/portal/login", { replace: true });
        return;
      }
      const [projectData, milestoneData] = await Promise.all([
        getProject(id),
        getProjectMilestones(id),
      ]);
      if (!projectData) {
        setError("المشروع غير موجود أو غير مرتبط بحسابك.");
        return;
      }
      setProject(projectData);
      setMilestones(milestoneData);
    } catch (loadError) {
      console.error("portal project load failed", loadError);
      setError("تعذر تحميل بيانات المشروع.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadDaftra = async () => {
    if (daftra || tabLoading) return;
    setTabLoading("accounts");
    setTabError("");
    try {
      setDaftra(await callPortalFunction<DaftraResult>("portal-daftra", { projectId: id }));
    } catch (requestError) {
      console.error("Daftra portal request failed", requestError);
      setTabError("تعذر تحميل بيانات الحسابات الآن.");
    } finally {
      setTabLoading(null);
    }
  };

  const loadMagicProject = async () => {
    if (magicProject || tabLoading) return;
    setTabLoading("designs");
    setTabError("");
    try {
      setMagicProject(
        await callPortalFunction<MagicplanResult>("portal-magicplan", {
          projectId: id,
          action: "project",
        }),
      );
    } catch (requestError) {
      console.error("Magicplan portal request failed", requestError);
      setTabError("تعذر تحميل بيانات التصميمات الآن.");
    } finally {
      setTabLoading(null);
    }
  };

  const loadMagicPlan = async () => {
    setTabLoading("plan");
    setTabError("");
    try {
      setMagicPlan(
        await callPortalFunction<MagicplanResult>("portal-magicplan", {
          projectId: id,
          action: "plan",
        }),
      );
    } catch (requestError) {
      console.error("Magicplan plan request failed", requestError);
      setTabError("تعذر تحميل بيانات المخطط.");
    } finally {
      setTabLoading(null);
    }
  };

  const loadMinio = async () => {
    if (minio || tabLoading) return;
    setTabLoading("files");
    setTabError("");
    try {
      setMinio(await callPortalFunction<MinioResult>("portal-files", { projectId: id }));
    } catch (requestError) {
      console.error("MinIO portal request failed", requestError);
      setTabError("تعذر تحميل ملفات المشروع الآن.");
    } finally {
      setTabLoading(null);
    }
  };

  const changeTab = (value: string) => {
    setTabError("");
    if (value === "accounts") void loadDaftra();
    if (value === "designs") void loadMagicProject();
    if (value === "files") void loadMinio();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/portal/login", { replace: true });
  };

  if (loading) {
    return <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center"><div className="w-9 h-9 rounded-full border-4 border-accent border-t-transparent animate-spin" /></div>;
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center px-4" dir="rtl">
        <Card className="max-w-lg w-full"><CardContent className="py-10 text-center"><p className="font-display font-bold text-primary text-lg">{error || "المشروع غير متاح"}</p><Button className="mt-5" onClick={() => navigate("/portal")}>العودة لمشروعاتي</Button></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8]" dir="rtl">
      <header className="bg-primary text-white sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto max-w-7xl px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img src={brandLogo} alt="Brand Identity" className="h-9 object-contain" />
            <div className="min-w-0">
              <h1 className="font-display font-bold truncate">{project.title}</h1>
              <p className="font-body text-xs text-white/70 truncate">بوابة المشروع</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" onClick={() => navigate("/portal")} className="text-white hover:bg-white/10">
              <ArrowRight className="w-4 h-4 ml-2" />
              مشروعاتي
            </Button>
            <Button variant="ghost" onClick={logout} className="text-white hover:bg-white/10">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 md:px-6 py-7">
        <div className="grid md:grid-cols-[1fr_auto] gap-5 items-start mb-6">
          <div>
            <p className="text-accent font-display font-bold text-sm">{project.category}</p>
            <h2 className="font-display font-bold text-2xl md:text-3xl text-primary mt-1">{project.title}</h2>
            {project.description && <p className="font-body text-muted-foreground mt-2 max-w-3xl">{project.description}</p>}
          </div>
          <Card className="border-none shadow-sm min-w-[220px]">
            <CardContent className="p-4">
              <div className="flex justify-between text-sm font-body"><span className="text-muted-foreground">الحالة</span><strong className="text-primary">{project.status}</strong></div>
              <div className="flex justify-between text-sm font-body mt-2"><span className="text-muted-foreground">الإنجاز</span><strong className="text-primary">{project.progress}%</strong></div>
              <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-accent" style={{ width: `${Math.min(100, Math.max(0, project.progress))}%` }} /></div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" onValueChange={changeTab}>
          <TabsList className="grid grid-cols-4 w-full bg-white mb-6 h-auto p-1">
            <TabsTrigger value="overview" className="py-2.5"><FolderOpen className="w-4 h-4 ml-1.5" />نظرة عامة</TabsTrigger>
            <TabsTrigger value="accounts" className="py-2.5"><WalletCards className="w-4 h-4 ml-1.5" />الحسابات</TabsTrigger>
            <TabsTrigger value="designs" className="py-2.5"><Ruler className="w-4 h-4 ml-1.5" />التصميمات</TabsTrigger>
            <TabsTrigger value="files" className="py-2.5"><File className="w-4 h-4 ml-1.5" />الملفات</TabsTrigger>
          </TabsList>

          {tabError && <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm font-body text-destructive">{tabError}</div>}

          <TabsContent value="overview">
            <div className="grid lg:grid-cols-3 gap-5">
              <Card className="lg:col-span-2 border-none shadow-sm">
                <CardHeader><CardTitle className="font-display text-primary">مراحل المشروع</CardTitle></CardHeader>
                <CardContent>
                  {milestones.length === 0 ? (
                    <p className="font-body text-sm text-muted-foreground">لم تتم إضافة مراحل للمشروع بعد.</p>
                  ) : (
                    <div className="space-y-3">
                      {milestones.map((milestone) => (
                        <div key={milestone.id} className="rounded-xl border border-black/5 bg-muted/20 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div><h4 className="font-display font-bold text-primary">{milestone.title}</h4>{milestone.description && <p className="font-body text-sm text-muted-foreground mt-1">{milestone.description}</p>}</div>
                            <span className="text-xs font-bold bg-white rounded-full px-2.5 py-1">{milestone.status}</span>
                          </div>
                          {milestone.due_date && <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" />{new Date(milestone.due_date).toLocaleDateString("ar-EG")}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader><CardTitle className="font-display text-primary">بيانات المشروع</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm font-body">
                  {project.client_name && <div><span className="text-muted-foreground">العميل</span><p className="font-bold mt-1">{project.client_name}</p></div>}
                  {project.mall && <div><span className="text-muted-foreground">الموقع / المول</span><p className="font-bold mt-1">{project.mall}</p></div>}
                  {project.area && <div><span className="text-muted-foreground">المساحة</span><p className="font-bold mt-1">{project.area}</p></div>}
                  {project.completion_date && <div><span className="text-muted-foreground">تاريخ الإكمال</span><p className="font-bold mt-1">{new Date(project.completion_date).toLocaleDateString("ar-EG")}</p></div>}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="accounts">
            {tabLoading === "accounts" && <LoadingCard text="جاري تحميل بيانات دفترة..." />}
            {!tabLoading && daftra && !daftra.configured && <StateCard text="تكامل دفترة غير مهيأ على الخادم." />}
            {!tabLoading && daftra?.configured && !daftra.linked && <StateCard text="المشروع غير مربوط بـ Work Order في دفترة حتى الآن." />}
            {daftra?.linked && daftra.summary && (
              <div className="space-y-5">
                <div className="grid md:grid-cols-3 gap-4">
                  <Metric title="إجمالي الفواتير" value={money(daftra.summary.total, daftra.summary.currency)} />
                  <Metric title="المدفوع" value={money(daftra.summary.paid, daftra.summary.currency)} />
                  <Metric title="المتبقي" value={money(daftra.summary.remaining, daftra.summary.currency)} />
                </div>
                {daftra.workOrder && <Card className="border-none shadow-sm"><CardContent className="p-5 font-body text-sm"><div className="flex flex-wrap gap-x-8 gap-y-2"><span><b>Work Order:</b> {daftra.workOrder.number || daftra.workOrder.id}</span><span><b>الحالة:</b> {String(daftra.workOrder.status ?? "-")}</span>{daftra.workOrder.start_date && <span><b>البداية:</b> {daftra.workOrder.start_date}</span>}{daftra.workOrder.delivery_date && <span><b>التسليم:</b> {daftra.workOrder.delivery_date}</span>}</div></CardContent></Card>}
                <Card className="border-none shadow-sm overflow-hidden"><CardHeader><CardTitle className="font-display text-primary">الفواتير المرتبطة بالمشروع</CardTitle></CardHeader><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm font-body"><thead className="bg-muted/60"><tr><th className="p-3 text-right">رقم الفاتورة</th><th className="p-3 text-right">التاريخ</th><th className="p-3 text-right">الإجمالي</th><th className="p-3 text-right">المدفوع</th><th className="p-3 text-right">الحالة</th></tr></thead><tbody>{daftra.invoices.map((invoice) => <tr key={invoice.id} className="border-t"><td className="p-3">{invoice.no || invoice.id}</td><td className="p-3">{invoice.date || "-"}</td><td className="p-3">{money(invoice.summary_total)}</td><td className="p-3">{money(invoice.total_paid)}</td><td className="p-3">{invoice.payment_status || "-"}</td></tr>)}</tbody></table>{daftra.invoices.length === 0 && <p className="p-6 text-center text-muted-foreground">لا توجد فواتير مرتبطة بالـ Work Order.</p>}</div></CardContent></Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="designs">
            {tabLoading === "designs" && <LoadingCard text="جاري تحميل بيانات Magicplan..." />}
            {!tabLoading && magicProject && !magicProject.configured && <StateCard text="تكامل Magicplan غير مهيأ على الخادم." />}
            {!tabLoading && magicProject?.configured && !magicProject.linked && <StateCard text="المشروع غير مربوط بمشروع Magicplan حتى الآن." />}
            {magicProject?.linked && magicProject.data && (
              <div className="grid lg:grid-cols-2 gap-5">
                <Card className="border-none shadow-sm overflow-hidden">
                  {magicProject.data.thumbnail_url && <img src={magicProject.data.thumbnail_url} alt={magicProject.data.name || project.title} className="w-full h-56 object-cover" />}
                  <CardContent className="p-5"><h3 className="font-display font-bold text-xl text-primary">{magicProject.data.name || project.title}</h3>{magicProject.data.description && <p className="font-body text-sm text-muted-foreground mt-2">{magicProject.data.description}</p>}<div className="mt-4 flex flex-wrap gap-2">{magicProject.data.cloud_url && <Button asChild variant="outline"><a href={magicProject.data.cloud_url} target="_blank" rel="noreferrer">فتح Magicplan <ExternalLink className="w-4 h-4 mr-2" /></a></Button>}<Button onClick={loadMagicPlan} disabled={tabLoading === "plan"} className="bg-accent text-accent-foreground">{tabLoading === "plan" ? "جاري التحميل..." : "بيانات المخطط"}</Button></div></CardContent>
                </Card>
                <Card className="border-none shadow-sm"><CardHeader><CardTitle className="font-display text-primary">المخطط</CardTitle></CardHeader><CardContent className="font-body text-sm">{magicPlan?.data ? <div className="space-y-2"><p><b>الاسم:</b> {magicPlan.data.name || "-"}</p><p><b>Plan ID:</b> {magicPlan.data.id || magicProject.data.plan_id || "-"}</p><p><b>الوحدة:</b> {magicPlan.data.unit || "-"}</p><p><b>آخر تعديل:</b> {magicPlan.data.user_modified || "-"}</p></div> : <p className="text-muted-foreground">اضغط «بيانات المخطط» عند الحاجة لتحميل بيانات الخطة من Magicplan.</p>}</CardContent></Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="files">
            {tabLoading === "files" && <LoadingCard text="جاري تحميل ملفات المشروع..." />}
            {!tabLoading && minio && !minio.configured && <StateCard text="تخزين MinIO غير مهيأ على الخادم." />}
            {!tabLoading && minio?.configured && !minio.linked && <StateCard text="لم يتم ربط مجلد ملفات بهذا المشروع بعد." />}
            {minio?.linked && <Card className="border-none shadow-sm"><CardHeader><CardTitle className="font-display text-primary">ملفات المشروع</CardTitle></CardHeader><CardContent className="space-y-2">{minio.files.map((item) => <a key={item.key} href={item.url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-4 rounded-xl border border-black/5 p-3 hover:border-accent/60 hover:bg-accent/5 transition-colors"><div className="min-w-0"><p className="font-body font-bold text-primary truncate">{item.name}</p><p className="text-xs text-muted-foreground mt-1">{fileSize(item.size)}{item.lastModified ? ` • ${new Date(item.lastModified).toLocaleString("ar-EG")}` : ""}</p></div><ExternalLink className="w-4 h-4 shrink-0 text-muted-foreground" /></a>)}{minio.files.length === 0 && <p className="text-sm text-muted-foreground font-body text-center py-8">المجلد مرتبط ولكن لا توجد ملفات داخله.</p>}</CardContent></Card>}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const LoadingCard = ({ text }: { text: string }) => <Card className="border-none shadow-sm"><CardContent className="py-12 flex items-center justify-center gap-3 font-body text-muted-foreground"><RefreshCw className="w-5 h-5 animate-spin" />{text}</CardContent></Card>;
const StateCard = ({ text }: { text: string }) => <Card className="border-none shadow-sm"><CardContent className="py-12 text-center font-body text-muted-foreground">{text}</CardContent></Card>;
const Metric = ({ title, value }: { title: string; value: string }) => <Card className="border-none shadow-sm"><CardContent className="p-5"><p className="text-xs text-muted-foreground font-body">{title}</p><p className="font-display font-bold text-xl text-primary mt-1">{value}</p></CardContent></Card>;

export default PortalProjectPage;
