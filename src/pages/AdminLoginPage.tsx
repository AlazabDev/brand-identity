import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Mail } from "lucide-react";
import brandLogo from "@/assets/brand-identity.png";

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError("بيانات الدخول غير صحيحة");
      setLoading(false);
      return;
    }

    // Check admin role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .eq("role", "admin");

    if (!roles || roles.length === 0) {
      setError("ليس لديك صلاحيات الدخول للوحة الإدارة");
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4" dir="rtl">
      <div className="w-full max-w-md bg-card rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <img src={brandLogo} alt="Brand Identity" className="h-16 mx-auto mb-4" />
          <h1 className="font-display font-bold text-2xl text-foreground">لوحة الإدارة</h1>
          <p className="text-muted-foreground text-sm mt-1 font-body">تسجيل دخول المسؤول</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute right-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pr-10 text-right"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute right-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input
              type="password"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10 text-right"
              required
            />
          </div>

          {error && (
            <p className="text-destructive text-sm text-center font-body">{error}</p>
          )}

          <Button type="submit" className="w-full bg-accent text-accent-foreground font-display font-bold" disabled={loading}>
            {loading ? "جاري الدخول..." : "تسجيل الدخول"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
