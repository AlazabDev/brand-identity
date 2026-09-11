import { type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, LayoutGrid, ChevronLeft } from "lucide-react";
import brandLogo from "@/assets/brand-identity.png";
import { usePortalSession } from "@/hooks/usePortalSession";
import { Button } from "@/components/ui/button";

interface Crumb {
  label: string;
  to?: string;
}

interface PortalLayoutProps {
  children: ReactNode;
  crumbs?: Crumb[];
}

export default function PortalLayout({ children, crumbs = [] }: PortalLayoutProps) {
  const { profile, user, signOut } = usePortalSession();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/portal/login");
  };

  const displayName = profile?.full_name || user?.email || "العميل";

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-header">
        <div className="container-custom flex h-16 items-center justify-between gap-4">
          <Link to="/portal" className="flex items-center gap-3">
            <img src={brandLogo || "/placeholder.svg"} alt="مجموعة العزب" className="h-9 w-auto" />
            <span className="hidden font-display text-sm font-bold sm:block">بوابة العملاء</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden text-left sm:block">
              <p className="font-display text-sm font-bold leading-tight">{displayName}</p>
              <p className="text-xs text-primary-foreground/70">{profile?.company || "حساب عميل"}</p>
            </div>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-accent font-display text-sm font-bold text-accent-foreground">
              {displayName.charAt(0)}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="text-primary-foreground hover:bg-primary-foreground/10"
              aria-label="تسجيل الخروج"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {crumbs.length > 0 && (
        <nav aria-label="مسار التنقل" className="border-b border-border bg-card">
          <div className="container-custom flex h-11 items-center gap-2 text-sm">
            <Link to="/portal" className="flex items-center gap-1 text-muted-foreground hover:text-primary">
              <LayoutGrid className="h-4 w-4" />
              <span>المشروعات</span>
            </Link>
            {crumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-2">
                <ChevronLeft className="h-4 w-4 text-muted-foreground/50" />
                {crumb.to ? (
                  <Link to={crumb.to} className="text-muted-foreground hover:text-primary">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-medium text-foreground">{crumb.label}</span>
                )}
              </span>
            ))}
          </div>
        </nav>
      )}

      <main className="container-custom page-enter py-6 md:py-10">{children}</main>
    </div>
  );
}
