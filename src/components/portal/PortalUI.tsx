import { type ReactNode } from "react";
import { type LucideIcon, Inbox, PlugZap } from "lucide-react";

export function SectionCard({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`card-elevated p-5 md:p-6 ${className}`}>
      {(title || action) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h3 className="font-display text-lg font-bold text-foreground">{title}</h3>}
            {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

export function StatTile({
  label,
  value,
  icon: Icon,
  tone = "text-primary",
}: {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  tone?: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-secondary/40 p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        {Icon && <Icon className="h-4 w-4" />}
        <span className="text-xs">{label}</span>
      </div>
      <p className={`mt-2 font-numeric text-xl font-bold ${tone}`}>{value}</p>
    </div>
  );
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-12 text-center">
      <Icon className="h-10 w-10 text-muted-foreground/60" />
      <p className="font-display font-bold text-foreground">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}

/** Shown when an external integration has no credentials or link configured. */
export function NotConfigured({ system }: { system: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-12 text-center">
      <PlugZap className="h-10 w-10 text-muted-foreground/60" />
      <p className="font-display font-bold text-foreground">لم يتم ربط {system} بعد</p>
      <p className="max-w-md text-sm text-muted-foreground">
        سيظهر المحتوى هنا تلقائيًا بمجرد ربط هذا المشروع بنظام {system} من قبل فريق العزب.
      </p>
    </div>
  );
}

export function TabSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/40" />
      ))}
    </div>
  );
}
