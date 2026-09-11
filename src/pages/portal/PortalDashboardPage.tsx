import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePortalSession } from "@/hooks/usePortalSession";
import PortalLayout from "@/components/portal/PortalLayout";
import ProjectCard from "@/components/portal/ProjectCard";
import { type PortalProject } from "@/lib/portal";
import { Building2, FolderOpen, TrendingUp } from "lucide-react";

async function fetchClientProjects(userId: string): Promise<PortalProject[]> {
  const { data, error } = await supabase
    .from("client_projects")
    .select("projects(*)")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? [])
    .map((row) => (row as { projects: PortalProject | null }).projects)
    .filter((p): p is PortalProject => Boolean(p))
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
}

export default function PortalDashboardPage() {
  const { user, profile } = usePortalSession();

  const { data: projects, isLoading, isError } = useQuery({
    queryKey: ["portal-projects", user?.id],
    queryFn: () => fetchClientProjects(user!.id),
    enabled: Boolean(user?.id),
  });

  const active = projects?.filter((p) => !["completed", "delivered"].includes(p.status)).length ?? 0;
  const avgProgress = projects?.length
    ? Math.round(projects.reduce((s, p) => s + (p.progress || 0), 0) / projects.length)
    : 0;

  const stats = [
    { label: "إجمالي المشروعات", value: projects?.length ?? 0, icon: FolderOpen },
    { label: "مشروعات نشطة", value: active, icon: Building2 },
    { label: "متوسط الإنجاز", value: `${avgProgress}%`, icon: TrendingUp },
  ];

  return (
    <PortalLayout>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
          مرحبًا، {profile?.full_name || "عميلنا العزيز"}
        </h1>
        <p className="mt-1 text-muted-foreground">تابع حالة مشروعاتك وكل التفاصيل من مكان واحد</p>
      </div>

      {!isLoading && !isError && (projects?.length ?? 0) > 0 && (
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="card-elevated flex items-center gap-4 p-5">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent/15 text-accent-foreground">
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="font-numeric text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card-elevated h-80 animate-pulse bg-muted/40" />
          ))}
        </div>
      )}

      {isError && (
        <div className="card-elevated p-10 text-center">
          <p className="text-destructive">تعذّر تحميل المشروعات. يرجى تحديث الصفحة أو المحاولة لاحقًا.</p>
        </div>
      )}

      {!isLoading && !isError && (projects?.length ?? 0) === 0 && (
        <div className="card-elevated flex flex-col items-center gap-3 p-12 text-center">
          <FolderOpen className="h-12 w-12 text-muted-foreground" />
          <h2 className="font-display text-lg font-bold text-foreground">لا توجد مشروعات مرتبطة بحسابك بعد</h2>
          <p className="max-w-md text-muted-foreground">
            سيتم ربط مشروعاتك بحسابك بواسطة فريق العزب. تواصل معنا إذا كنت تتوقع ظهور مشروع هنا.
          </p>
        </div>
      )}

      {!isLoading && !isError && (projects?.length ?? 0) > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects!.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </PortalLayout>
  );
}
