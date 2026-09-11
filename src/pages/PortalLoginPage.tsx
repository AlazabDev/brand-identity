import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Mail } from "lucide-react";
import brandLogo from "@/assets/brand-identity.png";

const PortalLoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/portal", { replace: true });
    });
  }, [navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (authError) {
      setError("تعذر تسجيل الدخول. تحقق من البريد الإلكتروني وكلمة المرور.");
      setLoading(false);
      return;
    }

    navigate("/portal", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center px-4" dir="rtl">
      <div className="w-full max-w-md rounded-2xl bg-white p-7 md:p-9 shadow-xl border border-black/5">
        <div className="text-center mb-8">
          <img src={brandLogo} alt="Brand Identity" className="h-16 mx-auto mb-4 object-contain" />
          <h1 className="font-display font-bold text-2xl text-primary">بوابة العملاء</h1>
          <p className="font-body text-sm text-muted-foreground mt-2">
            ادخل لمتابعة مشروعاتك وملفاتك وحسابات المشروع
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="relative">
            <Mail className="absolute right-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="البريد الإلكتروني"
              className="pr-10 text-right"
              autoComplete="email"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute right-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="كلمة المرور"
              className="pr-10 text-right"
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className="text-sm text-destructive font-body text-center">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-accent-foreground font-display font-bold"
          >
            {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
          </Button>
        </form>

        <div className="mt-5 flex items-center justify-between text-sm font-body">
          <Link to="/portal/reset-password" className="text-primary hover:underline">
            نسيت كلمة المرور؟
          </Link>
          <Link to="/" className="text-muted-foreground hover:text-primary">
            العودة للموقع
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PortalLoginPage;
