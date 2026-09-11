import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Link2, Plus, RefreshCw, Save, Users } from "lucide-react";
import brandLogo from "@/assets/brand-identity.png";
import { callPortalFunction, type PortalProject } from "@/services/portal";

type ClientProfileRow = {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  company: string | null;
};

type ClientProjectLink = { user_id: string; project_id: string };

type ProjectIntegrationForm = {
  daftraWorkOrderId: string;
  magicplanProjectId: string;
  magicplanPlanId: string;
  minioPrefix: string;
  progress: string;
  status: string;
};

const AdminPortalPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [projects, setProjects] = useState<PortalProject[]>([]);
  const [profiles, setProfiles] = useState<ClientProfileRow[]>([]);
  const [links, setLinks] = useState<ClientProjectLink[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [linkDrafts, setLinkDrafts] = useState<Record<string, string[]>>({});
  const [integrationForms, setIntegrationForms] = useState<Record<string, ProjectIntegrationForm>>({});
  const [clientForm, setClientForm] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    company: "",
  });

  const projectById = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects],
  );

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (!session) {
        navigate("/admin/login", { replace: true });
        return;
      }

      const { data: role, error: roleError } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (roleError || !role) {
        navigate("/admin/login", { replace: true });
        return;
      }

      const [projectsResult, profilesResult, linksResult] = await Promise.all([
        supabase.from("projects").select("*").order("created_at", { ascending: false }),
        supabase.from("client_profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("client_projects").select("user_id, project_id"),
      ]);

      if (projectsResult.error) throw projectsResult.error;
      if (profilesResult.error) throw profilesResult.error;
      if (linksResult.error) throw linksResult.error;

      const projectRows = (projectsResult.data ?? []) as unknown as PortalProject[];
      const profileRows = (profilesResult.data ?? []) as ClientProfileRow[];
      const linkRows = (linksResult.data ?? []) as ClientProjectLink[];
      setProjects(projectRows);
      setProfiles(profileRows);
      setLinks(linkRows);

      setLinkDrafts(Object.fromEntries(
        profileRows.map((profile) => [
          profile.user_id,
          linkRows.filter((link) => link.user_id === profile.user_id).map((link) => link.project_id),
        ]),
      ));

      setIntegrationForms(Object.fromEntries(
        projectRows.map((project) => [project.id, {
          daftraWorkOrderId: project.daftra_work_order_id == null ? "" : String(project.daftra_work_order_id),
          magicplanProjectId: project.magicplan_project_id ?? "",
          magicplanPlanId: project.magicplan_plan_id ?? "",
          minioPrefix: project.minio_prefix ?? "",
          progress: String(project.progress ?? 0),
          status: project.status ?? "planning",
        }]),
      ));
    } catch (loadError) {
      console.error("admin portal load failed", loadError);
      setError("تعذر تحميل بيانات بوابة العملاء.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleProject = (projectId: string) => {
    setSelectedProjects((current) =>
      current.includes(projectId)
        ? current.filter((id) => id !== projectId)
        : [...current, projectId]
    );
  };

  const createClient = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving("client");
    setError("");
    setMessage("");
    try {
      await callPortalFunction<{ success: true; userId: string }>("portal-admin", {
        email: clientForm.email,
        password: clientForm.password,
        fullName: clientForm.fullName,
        phone: clientForm.phone,
        company: clientForm.company,
        projectIds: selectedProjects,
      });
      setClientForm({ email: "", password: "", fullName: "", phone: "", company: "" });
      setSelectedProjects([]);
      setMessage("تم إنشاء حساب العميل وربطه بالمشروعات المحددة.");
      await load();
    } catch (createError) {
      console.error("client creation failed", createError);
      setError("تعذر إنشاء حساب العميل. راجع البيانات وسجل Edge Function.");
    } finally {
      setSaving(null);
    }
  };

  const toggleClientProject = (userId: string, projectId: string) => {
    setLinkDrafts((current) => {
      const selected = current[userId] ?? [];
      return {
        ...current,
        [userId]: selected.includes(projectId)
          ? selected.filter((id) => id !== projectId)
          : [...selected, projectId],
      };
    });
  };

  const saveClientLinks = async (userId: string) => {
    setSaving(`links:${userId}`);
    setError("");
    setMessage("");
    try {
      const desired = linkDrafts[userId] ?? [];
      const { error: deleteError } = await supabase
        .from("client_projects")
        .delete()
        .eq("user_id", userId);
      if (deleteError) throw deleteError;

      if (desired.length > 0) {
        const { error: insertError } = await supabase
          .from("client_projects")
          .insert(desired.map((projectId) => ({ user_id: userId, project_id: projectId })));
        if (insertError) throw insertError;
      }

      setMessage("تم تحديث صلاحيات المشروعات للعميل.");
      await load();
    } catch (linkError) {
      console.error("client project links save failed", linkError);
      setError("تعذر تحديث ربط العميل بالمشروعات.");
    } finally {
      setSaving(null);
    }
  };

  const updateIntegrationForm = (
    projectId: string,
    key: keyof ProjectIntegrationForm,
    value: string,
  ) => {
    setIntegrationForms((current) => ({
      ...current,
      [projectId]: { ...current[projectId], [key]: value },
    }));
  };

  const saveProjectIntegration = async (projectId: string) => {
    const form = integrationForms[projectId];
    if (!form) return;

    const progress = Number(form.progress);
    const workOrderId = form.daftraWorkOrderId.trim()
      ? Number(form.daftraWorkOrderId.trim())
      : null;

    if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
      setError("نسبة الإنجاز يجب أن تكون بين 0 و100.");
      return;
    }
    if (workOrderId != null && (!Number.isInteger(workOrderId) || workOrderId <= 0)) {
      setError("Daftra Work Order ID يجب أن يكون رقمًا صحيحًا موجبًا.");
      return;
    }

    setSaving(`project:${projectId}`);
    setError("");
    setMessage("");
    try {
      const payload = {
        daftra_work_order_id: workOrderId,
        magicplan_project_id: form.magicplanProjectId.trim() || null,
        magicplan_plan_id: form.magicplanPlanId.trim() || null,
        minio_prefix: form.minioPrefix.trim() || null,
        progress,
        status: form.status.trim() || "planning",
      };

      const { error: updateError } = await supabase
        .from("projects")
        .update(payload as any)
        .eq("id", projectId);
      if (updateError) throw updateError;

      setMessage(`تم تحديث ربط مشروع ${projectById.get(projectId)?.title ?? ""}.`);
      await load();
    } catch (updateError) {
      console.error("project integration update failed", updateError);
      setError("تعذر حفظ إعدادات ربط المشروع.");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8]" dir="rtl">
      <header className="bg-primary text-white sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto max-w-7xl px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={brandLogo} alt="Brand Identity" className="h-9 object-contain" />
            <div><h1 className="font-display font-bold">إدارة بوابة العملاء</h1><p className="text-xs text-white/70 font-body">الحسابات والربط بالمشروعات والأنظمة</p></div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={load} className="text-white hover:bg-white/10"><RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /></Button>
            <Button variant="ghost" onClick={() => navigate("/admin")} className="text-white hover:bg-white/10"><ArrowRight className="w-4 h-4 ml-2" />لوحة الإدارة</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 md:px-6 py-7">
        {message && <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-3 text-green-800 text-sm font-body">{message}</div>}
        {error && <div className="mb-5 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-destructive text-sm font-body">{error}</div>}

        <Tabs defaultValue="clients">
          <TabsList className="grid grid-cols-2 w-full md:w-[520px] bg-white mb-6">
            <TabsTrigger value="clients"><Users className="w-4 h-4 ml-2" />العملاء</TabsTrigger>
            <TabsTrigger value="integrations"><Link2 className="w-4 h-4 ml-2" />ربط المشروعات</TabsTrigger>
          </TabsList>

          <TabsContent value="clients" className="space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader><CardTitle className="font-display text-primary flex items-center gap-2"><Plus className="w-5 h-5" />إنشاء حساب عميل</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={createClient} className="space-y-4">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <Input placeholder="الاسم الكامل" value={clientForm.fullName} onChange={(e) => setClientForm({ ...clientForm, fullName: e.target.value })} required />
                    <Input type="email" placeholder="البريد الإلكتروني" value={clientForm.email} onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })} required />
                    <Input type="password" minLength={8} placeholder="كلمة المرور المؤقتة" value={clientForm.password} onChange={(e) => setClientForm({ ...clientForm, password: e.target.value })} required />
                    <Input placeholder="الهاتف" value={clientForm.phone} onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })} />
                    <Input placeholder="الشركة" value={clientForm.company} onChange={(e) => setClientForm({ ...clientForm, company: e.target.value })} />
                  </div>
                  <div>
                    <p className="font-display font-bold text-sm text-primary mb-2">المشروعات المسموح بها</p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {projects.map((project) => <label key={project.id} className="flex items-center gap-2 rounded-lg border bg-white p-3 text-sm font-body cursor-pointer"><input type="checkbox" checked={selectedProjects.includes(project.id)} onChange={() => toggleProject(project.id)} />{project.title}</label>)}
                    </div>
                  </div>
                  <Button type="submit" disabled={saving === "client"} className="bg-accent text-accent-foreground font-display font-bold">{saving === "client" ? "جاري الإنشاء..." : "إنشاء حساب العميل"}</Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {profiles.map((profile) => {
                const draft = linkDrafts[profile.user_id] ?? [];
                return <Card key={profile.id} className="border-none shadow-sm"><CardContent className="p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><h3 className="font-display font-bold text-primary">{profile.full_name}</h3><p className="text-sm text-muted-foreground font-body mt-1">{[profile.company, profile.phone].filter(Boolean).join(" • ") || "بدون بيانات إضافية"}</p></div><Button size="sm" onClick={() => saveClientLinks(profile.user_id)} disabled={saving === `links:${profile.user_id}`}><Save className="w-4 h-4 ml-2" />حفظ الربط</Button></div><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2 mt-4">{projects.map((project) => <label key={project.id} className="flex items-center gap-2 rounded-lg border bg-muted/20 p-2.5 text-sm font-body cursor-pointer"><input type="checkbox" checked={draft.includes(project.id)} onChange={() => toggleClientProject(profile.user_id, project.id)} />{project.title}</label>)}</div></CardContent></Card>;
              })}
              {!loading && profiles.length === 0 && <Card className="border-none shadow-sm"><CardContent className="py-10 text-center text-muted-foreground font-body">لا توجد حسابات عملاء بعد.</CardContent></Card>}
            </div>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-4">
            {projects.map((project) => {
              const form = integrationForms[project.id];
              if (!form) return null;
              return <Card key={project.id} className="border-none shadow-sm"><CardHeader><CardTitle className="font-display text-primary">{project.title}</CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3"><div><p className="text-xs text-muted-foreground mb-1 font-body">Daftra Work Order ID</p><Input inputMode="numeric" value={form.daftraWorkOrderId} onChange={(e) => updateIntegrationForm(project.id, "daftraWorkOrderId", e.target.value)} /></div><div><p className="text-xs text-muted-foreground mb-1 font-body">Magicplan Project ID</p><Input value={form.magicplanProjectId} onChange={(e) => updateIntegrationForm(project.id, "magicplanProjectId", e.target.value)} /></div><div><p className="text-xs text-muted-foreground mb-1 font-body">Magicplan Plan ID</p><Input value={form.magicplanPlanId} onChange={(e) => updateIntegrationForm(project.id, "magicplanPlanId", e.target.value)} /></div><div><p className="text-xs text-muted-foreground mb-1 font-body">MinIO Prefix</p><Input value={form.minioPrefix} onChange={(e) => updateIntegrationForm(project.id, "minioPrefix", e.target.value)} /></div><div><p className="text-xs text-muted-foreground mb-1 font-body">نسبة الإنجاز</p><Input type="number" min={0} max={100} value={form.progress} onChange={(e) => updateIntegrationForm(project.id, "progress", e.target.value)} /></div><div><p className="text-xs text-muted-foreground mb-1 font-body">الحالة</p><Input value={form.status} onChange={(e) => updateIntegrationForm(project.id, "status", e.target.value)} /></div></div><Button onClick={() => saveProjectIntegration(project.id)} disabled={saving === `project:${project.id}`} className="bg-accent text-accent-foreground"><Save className="w-4 h-4 ml-2" />{saving === `project:${project.id}` ? "جاري الحفظ..." : "حفظ الربط"}</Button></CardContent></Card>;
            })}
            {!loading && projects.length === 0 && <Card className="border-none shadow-sm"><CardContent className="py-10 text-center text-muted-foreground font-body">لا توجد مشروعات لإعداد الربط.</CardContent></Card>}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPortalPage;
