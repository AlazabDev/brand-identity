import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePortalSession } from "@/hooks/usePortalSession";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import brandLogo from "@/assets/brand-identity.png";

export default function PortalLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = usePortalSession();

  const from = (location.state as { from?: string })?.from || "/portal";

  useEffect(() => {
    if (session) navigate(from, { replace: true });
  }, [session, from, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError("بيانات الدخول غير صحيحة. يرجى المحاولة مرة أخرى.");
      setLoading(false);
      return;
    }
    navigate(from, { replace: true });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2" dir="rtl">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <img src={brandLogo || "/placeholder.svg"} alt="مجموعة العزب" className="h-12 w-auto" />
        <div className="space-y-6">
          <h1 className="font-display text-4xl font-bold leading-tight">
            بوابة متابعة المشروعات
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-primary-foreground/80">
            صورة واحدة متكاملة لمشروعك: التقدم، الملفات، المخططات، البيانات المالية والاعتمادات
            المطلوبة — في مكان واحد.
          </p>
          <ul className="space-y-3 text-primary-foreground/80">
            {["متابعة نسبة الإنجاز والمراحل", "الوصول للمخططات والملفات", "بيانات مالية وفواتير دقيقة"].map(
              (item) => (
                <li key={item} className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-accent" />
                  <span>{item}</span>
                </li>
              ),
            )}
          </ul>
        </div>
        <p className="text-sm text-primary-foreground/60">© مجموعة العزب — جميع الحقوق محفوظة</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <img src={brandLogo || "/placeholder.svg"} alt="مجموعة العزب" className="mx-auto h-14 w-auto" />
          </div>
          <div className="card-elevated p-8">
            <div className="mb-6 text-center">
              <h2 className="font-display text-2xl font-bold text-foreground">تسجيل دخول العميل</h2>
              <p className="mt-1 text-sm text-muted-foreground">ادخل بياناتك للوصول إلى مشروعاتك</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    dir="ltr"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pr-10 text-right"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <Link
                    to="/portal/reset-password"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    نسيت كلمة المرور؟
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10 text-right"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="rounded-lg bg-destructive/10 px-4 py-3 text-center text-sm text-destructive">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-accent font-display font-bold text-accent-foreground hover:bg-accent/90"
              >
                {loading ? "جاري الدخول..." : "تسجيل الدخول"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              لا تملك حسابًا؟ تواصل مع فريق المشروع أو{" "}
              <Link to="/contact" className="font-medium text-primary hover:underline">
                فريق الدعم
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
