import { Link } from "react-router-dom";
import { ArrowLeft, Building2, CalendarClock, MapPin } from "lucide-react";
import { type PortalProject, statusMeta, formatDate } from "@/lib/portal";

export default function ProjectCard({ project }: { project: PortalProject }) {
  const status = statusMeta(project.status);
  const cover = project.images?.[0];
  const code = project.id.slice(0, 8).toUpperCase();

  return (
    <Link
      to={`/portal/projects/${project.id}`}
      className="card-elevated group flex flex-col overflow-hidden focus-visible:outline-2 focus-visible:outline-accent"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {cover ? (
          <img
            src={cover || "/placeholder.svg"}
            alt={project.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-muted-foreground">
            <Building2 className="h-12 w-12" />
          </div>
        )}
        <span
          className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-medium backdrop-blur ${status.tone}`}
        >
          {status.label}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <p className="font-numeric text-xs text-muted-foreground">كود المشروع: {code}</p>
          <h3 className="mt-1 font-display text-lg font-bold text-foreground line-clamp-1">
            {project.title}
          </h3>
        </div>

        <div className="space-y-1.5 text-sm text-muted-foreground">
          {project.mall && (
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-accent" />
              <span className="line-clamp-1">{project.mall}</span>
            </p>
          )}
          <p className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 shrink-0 text-accent" />
            <span>التسليم المتوقع: {formatDate(project.completion_date)}</span>
          </p>
        </div>

        <div className="mt-auto space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">نسبة الإنجاز</span>
            <span className="font-numeric font-bold text-primary">{project.progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${Math.min(Math.max(project.progress, 0), 100)}%` }}
            />
          </div>
        </div>

        <span className="flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
          عرض تفاصيل المشروع
          <ArrowLeft className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
