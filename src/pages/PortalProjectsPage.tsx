import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FolderOpen, LogOut, MapPin, RefreshCw } from "lucide-react";
import brandLogo from "@/assets/brand-identity.png";
import {
  getMyProfile,
  getMyProjects,
  getSessionOrNull,
  type ClientProfile,
  type PortalProject,
} from "@/services/portal";

const PortalProjectsPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<PortalProject[]>([]);
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const session = await getSessionOrNull();
      if (!session) {
        navigate("/portal/login", { replace: true });
        return;
      }
      setEmail(session.user.email ?? "");
      const [profileData, projectData] = await Promise.all([
        getMyProfile(),
        getMyProjects(),
      ]);
      setProfile(profileData);
      setProjects(projectData);
    } catch (loadError) {
      console.error("portal dashboard load failed", loadError);
      setError("تعذر تحميل مشروعاتك الآن.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/portal/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8]" dir="rtl">
      <header className="bg-primary text-white sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto max-w-7xl px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img src={brandLogo} alt="Brand Identity" className="h-9 object-contain" />
            <div className="min-w-0">
              <h1 className="font-display font-bold text-base md:text-lg">بوابة المشروعات</h1>
              <p className="font-body text-xs text-white/70 truncate">
                {profile?.full_name || email}
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={logout} className="text-white hover:bg-white/10">
            <LogOut className="w-4 h-4 ml-2" />
            خروج
          </Button>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 md:px-6 py-7 md:py-10">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
          <div>
            <p className="text-accent font-display font-bold text-sm mb-1">مشروعاتي</p>
            <h2 className="font-display font-bold text-2xl md:text-3xl text-primary">
              {profile?.company ? `${profile.company} — ` : ""}متابعة المشروعات
            </h2>
            <p className="font-body text-muted-foreground mt-2">
              اختر المشروع لعرض التنفيذ والحسابات والتصميمات والملفات المرتبطة به.
            </p>
          </div>
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ml-2 ${loading ? "animate-spin" : ""}`} />
            تحديث
          </Button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-destructive font-body">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-64 rounded-2xl bg-white animate-pulse border border-black/5" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <Card className="border-none shadow-sm">
            <CardContent className="py-14 text-center">
              <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-display font-bold text-lg text-primary">لا توجد مشروعات مرتبطة بالحساب</h3>
              <p className="font-body text-sm text-muted-foreground mt-2">
                عند ربط المشروع بحسابك سيظهر هنا تلقائيًا.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => navigate(`/portal/projects/${project.id}`)}
                className="text-right group"
              >
                <Card className="h-full overflow-hidden border border-black/5 shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:border-accent/60">
                  <div className="h-40 bg-muted overflow-hidden">
                    {project.images?.[0] ? (
                      <img
                        src={project.images[0]}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/5">
                        <FolderOpen className="w-12 h-12 text-primary/25" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display font-bold text-lg text-primary">{project.title}</h3>
                        <p className="font-body text-xs text-muted-foreground mt-1">
                          {project.category}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-accent/15 px-2.5 py-1 text-xs font-bold text-primary">
                        {project.progress}%
                      </span>
                    </div>

                    {(project.mall || project.area) && (
                      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground font-body">
                        <MapPin className="w-3.5 h-3.5" />
                        {[project.mall, project.area].filter(Boolean).join(" • ")}
                      </p>
                    )}

                    <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full"
                        style={{ width: `${Math.min(100, Math.max(0, project.progress))}%` }}
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs font-body">
                      <span className="text-muted-foreground">الحالة</span>
                      <span className="font-bold text-primary">{project.status}</span>
                    </div>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PortalProjectsPage;
