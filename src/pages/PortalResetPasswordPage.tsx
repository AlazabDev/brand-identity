import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound, Mail } from "lucide-react";
import brandLogo from "@/assets/brand-identity.png";

const PortalResetPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) setHasRecoverySession(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY" || session) {
        setHasRecoverySession(true);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const requestReset = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const redirectTo = `${window.location.origin}/portal/reset-password`;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo },
    );

    setLoading(false);
    if (resetError) {
      setError("تعذر إرسال رابط الاستعادة. تحقق من البريد وحاول مرة أخرى.");
      return;
    }

    setMessage("تم إرسال رابط استعادة كلمة المرور إذا كان البريد مسجلاً لدينا.");
  };

  const updatePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 8) {
      setError("كلمة المرور يجب ألا تقل عن 8 أحرف.");
      return;
    }
    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError("تعذر تحديث كلمة المرور. افتح رابط الاستعادة مرة أخرى وحاول.");
      return;
    }

    setMessage("تم تحديث كلمة المرور بنجاح.");
    setTimeout(() => navigate("/portal", { replace: true }), 700);
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center px-4" dir="rtl">
      <div className="w-full max-w-md rounded-2xl bg-white p-7 md:p-9 shadow-xl border border-black/5">
        <div className="text-center mb-8">
          <img src={brandLogo} alt="Brand Identity" className="h-14 mx-auto mb-4 object-contain" />
          <h1 className="font-display font-bold text-2xl text-primary">
            {hasRecoverySession ? "تعيين كلمة مرور جديدة" : "استعادة كلمة المرور"}
          </h1>
        </div>

        {hasRecoverySession ? (
          <form onSubmit={updatePassword} className="space-y-4">
            <div className="relative">
              <KeyRound className="absolute right-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="كلمة المرور الجديدة"
                className="pr-10 text-right"
                autoComplete="new-password"
                required
              />
            </div>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="تأكيد كلمة المرور"
              className="text-right"
              autoComplete="new-password"
              required
            />
            <Button
              type="submit"
              className="w-full bg-accent text-accent-foreground font-display font-bold"
              disabled={loading}
            >
              {loading ? "جاري الحفظ..." : "حفظ كلمة المرور"}
            </Button>
          </form>
        ) : (
          <form onSubmit={requestReset} className="space-y-4">
            <p className="font-body text-sm text-muted-foreground">
              أدخل البريد المسجل في بوابة العملاء وسنرسل رابط الاستعادة إليه.
            </p>
            <div className="relative">
              <Mail className="absolute right-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="البريد الإلكتروني"
                className="pr-10 text-right"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-accent text-accent-foreground font-display font-bold"
              disabled={loading}
            >
              {loading ? "جاري الإرسال..." : "إرسال رابط الاستعادة"}
            </Button>
          </form>
        )}

        {message && <p className="mt-4 text-sm text-center font-body text-green-700">{message}</p>}
        {error && <p className="mt-4 text-sm text-center font-body text-destructive">{error}</p>}

        <div className="mt-6 text-center">
          <Link to="/portal/login" className="text-sm font-body text-primary hover:underline">
            العودة لتسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PortalResetPasswordPage;
