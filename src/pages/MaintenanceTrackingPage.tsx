import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, Clock, CheckCircle2, XCircle, ArrowRight, Wrench, Phone, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import PageMeta from "@/components/PageMeta";

interface MaintenanceRequest {
  id: string;
  request_number: string;
  client_name: string;
  client_phone: string;
  service_type: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  workflow_stage?: string;
  estimated_cost?: number | null;
  actual_cost?: number | null;
  title?: string;
}

const STATUS_CONFIG: Record<string, { label: string; emoji: string; color: string; icon: typeof CheckCircle2 }> = {
  new: { label: "جديد", emoji: "🆕", color: "bg-blue-100 text-blue-800 border-blue-200", icon: Clock },
  open: { label: "مفتوح", emoji: "📂", color: "bg-blue-100 text-blue-800 border-blue-200", icon: Clock },
  accepted: { label: "مقبول", emoji: "✅", color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle2 },
  in_progress: { label: "قيد التنفيذ", emoji: "🔄", color: "bg-amber-100 text-amber-800 border-amber-200", icon: ArrowRight },
  completed: { label: "مكتمل", emoji: "🎉", color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: CheckCircle2 },
  rejected: { label: "مرفوض", emoji: "❌", color: "bg-red-100 text-red-800 border-red-200", icon: XCircle },
};

const SERVICE_LABELS: Record<string, { label: string; icon: string }> = {
  plumbing: { label: "سباكة", icon: "🔧" },
  electrical: { label: "كهرباء", icon: "⚡" },
  ac: { label: "تكييف", icon: "❄️" },
  painting: { label: "دهانات", icon: "🎨" },
  carpentry: { label: "نجارة", icon: "🪚" },
  general: { label: "عامة", icon: "🏗️" },
};

const PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
  low: { label: "منخفضة", color: "bg-muted text-muted-foreground" },
  medium: { label: "متوسطة", color: "bg-amber-100 text-amber-800" },
  high: { label: "عالية", color: "bg-red-100 text-red-800" },
};

const MaintenanceTrackingPage = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MaintenanceRequest[] | null>(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError("");
    setResults(null);

    try {
      const isRequestNum = /^MR-/i.test(q);
      const body = isRequestNum
        ? { action: "query", request_number: q }
        : { action: "query", client_phone: q };

      const { data, error: fnError } = await supabase.functions.invoke("maintenance-proxy", { body });
      if (fnError) throw fnError;

      const requests = data?.data?.data || data?.data?.requests || data?.data || [];
      if (Array.isArray(requests) && requests.length > 0) {
        setResults(requests);
      } else if (typeof requests === "object" && requests.request_number) {
        setResults([requests]);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error("Tracking query error:", err);
      setError("حدث خطأ في البحث. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const key = status?.toLowerCase().replace(/\s/g, "_");
    return STATUS_CONFIG[key] || { label: status, emoji: "❓", color: "bg-muted text-muted-foreground border-border", icon: Clock };
  };

  return (
    <PageTransition>
      <PageMeta
        title="تتبع طلبات الصيانة | Brand Identity"
        description="تتبع حالة طلب الصيانة الخاص بك باستخدام رقم الطلب أو رقم الهاتف"
      />
      <Header />
      <main id="main-content" className="min-h-screen bg-background pt-24 pb-16" dir="rtl">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
              <Wrench className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              تتبع طلبات الصيانة
            </h1>
            <p className="text-muted-foreground text-lg">
              أدخل رقم الطلب أو رقم هاتفك لمعرفة حالة طلبك
            </p>
          </motion.div>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="mb-8 border-border/50 shadow-lg">
              <CardContent className="p-6">
                <div className="flex gap-3">
                  <Input
                    type="text"
                    placeholder="رقم الطلب (MR-26-XXXXX) أو رقم الهاتف (01xxxxxxxxx)"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="flex-1 text-base"
                    dir="ltr"
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={loading || !query.trim()}
                    className="px-6"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                    <span className="hidden sm:inline mr-2">بحث</span>
                  </Button>
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> رقم الطلب: MR-26-XXXXX</span>
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> الهاتف: 01xxxxxxxxx</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
              <p className="text-destructive font-medium">{error}</p>
            </motion.div>
          )}

          {/* No Results */}
          {results !== null && results.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
              <Search className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground mb-1">لم يتم العثور على طلبات</p>
              <p className="text-muted-foreground">تأكد من صحة رقم الطلب أو رقم الهاتف</p>
            </motion.div>
          )}

          {/* Results */}
          {results && results.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <p className="text-sm text-muted-foreground mb-2">
                تم العثور على {results.length} طلب(ات)
              </p>
              {results.map((req, i) => {
                const statusCfg = getStatusConfig(req.status);
                const service = SERVICE_LABELS[req.service_type] || { label: req.service_type, icon: "🔧" };
                const priority = PRIORITY_LABELS[req.priority] || { label: req.priority, color: "bg-muted text-muted-foreground" };
                const StatusIcon = statusCfg.icon;

                return (
                  <motion.div
                    key={req.id || i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Card className="border-border/50 hover:shadow-md transition-shadow">
                      <CardContent className="p-5">
                        {/* Top row */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-primary text-lg" dir="ltr">
                              {req.request_number}
                            </span>
                          </div>
                          <Badge className={`${statusCfg.color} border font-medium gap-1`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusCfg.emoji} {statusCfg.label}
                          </Badge>
                        </div>

                        {/* Details grid */}
                        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                          <div>
                            <span className="text-muted-foreground">نوع الخدمة</span>
                            <p className="font-medium mt-0.5">{service.icon} {service.label}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">الأولوية</span>
                            <p className="mt-0.5">
                              <Badge variant="outline" className={`${priority.color} text-xs`}>
                                {priority.label}
                              </Badge>
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">تاريخ الطلب</span>
                            <p className="font-medium mt-0.5" dir="ltr">
                              {req.created_at ? new Date(req.created_at).toLocaleDateString("ar-EG", {
                                year: "numeric", month: "long", day: "numeric"
                              }) : "—"}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">آخر تحديث</span>
                            <p className="font-medium mt-0.5" dir="ltr">
                              {req.updated_at ? new Date(req.updated_at).toLocaleDateString("ar-EG", {
                                year: "numeric", month: "long", day: "numeric"
                              }) : "—"}
                            </p>
                          </div>
                        </div>

                        {/* Description */}
                        {req.description && (
                          <div className="mt-3 pt-3 border-t border-border/50">
                            <span className="text-xs text-muted-foreground">وصف المشكلة</span>
                            <p className="text-sm mt-1 text-foreground">{req.description}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </PageTransition>
  );
};

export default MaintenanceTrackingPage;
