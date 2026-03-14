import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const steps = ["المعلومات الأساسية", "تفاصيل المشروع", "الخدمات المطلوبة", "الميزانية والجدول", "رفع الملفات", "المراجعة والإرسال"];

const servicesList = [
  "التعديلات الإنشائية والتأسيس",
  "تصنيع وحدات العرض",
  "وحدات التخزين",
  "الوحدات الديكورية والواجهات",
  "التشطيب والتسليم النهائي",
  "استشارات تصميمية",
  "صيانة دورية",
];

const QuotePage = () => {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState({
    clientName: "", shopName: "", activity: "",
    mall: "", shopNumber: "", area: "", shopStatus: "",
    services: [] as string[],
    budget: "", openingDate: "",
    notes: "",
  });

  const toggleService = (s: string) => {
    setData((d) => ({
      ...d,
      services: d.services.includes(s) ? d.services.filter((x) => x !== s) : [...d.services, s],
    }));
  };

  const sendWhatsAppNotification = () => {
    const text = `📋 طلب عرض سعر جديد\n\n👤 العميل: ${data.clientName}\n🏪 المحل: ${data.shopName || "—"}\n📂 النشاط: ${data.activity || "—"}\n🏬 المول: ${data.mall || "—"}\n🔢 رقم المحل: ${data.shopNumber || "—"}\n📐 المساحة: ${data.area || "—"}\n🔧 الحالة: ${data.shopStatus || "—"}\n🛠 الخدمات: ${data.services.join("، ") || "—"}\n💰 الميزانية: ${data.budget || "—"}\n📅 الافتتاح: ${data.openingDate || "—"}\n📝 ملاحظات: ${data.notes || "—"}`;
    window.open(`https://wa.me/201004006620?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { error } = await supabase.from("quote_requests").insert({
        client_name: data.clientName,
        shop_name: data.shopName || null,
        business_type: data.activity || null,
        mall: data.mall || null,
        shop_number: data.shopNumber || null,
        area: data.area || null,
        shop_status: data.shopStatus || null,
        services: data.services.length > 0 ? data.services : null,
        budget: data.budget || null,
        opening_date: data.openingDate || null,
        notes: data.notes || null,
      });

      if (error) throw error;

      toast.success("تم إرسال طلب عرض السعر بنجاح! سنتواصل معك خلال 24 ساعة");
      sendWhatsAppNotification();
      setStep(0);
      setData({
        clientName: "", shopName: "", activity: "",
        mall: "", shopNumber: "", area: "", shopStatus: "",
        services: [], budget: "", openingDate: "", notes: "",
      });
    } catch (err) {
      console.error("Error submitting quote:", err);
      toast.error("حدث خطأ أثناء الإرسال. حاول مرة أخرى");
    } finally {
      setSubmitting(false);
    }
  };

  const canNext = () => {
    if (step === 0) return data.clientName && data.shopName;
    return true;
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <section className="section-padding bg-primary text-primary-foreground">
          <div className="container-custom text-center">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display font-bold text-4xl md:text-5xl mb-4">
              طلب عرض سعر
            </motion.h1>
            <p className="text-primary-foreground/70 font-body text-lg">احصل على عرض سعر دقيق في 6 خطوات بسيطة</p>
          </div>
        </section>

        <section className="section-padding bg-background">
          <div className="container-custom max-w-3xl">
            {/* Steps indicator */}
            <div className="flex items-center justify-between mb-12 overflow-x-auto pb-4">
              {steps.map((s, i) => (
                <div key={s} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-display font-bold shrink-0 ${
                    i <= step ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {i < step ? <CheckCircle className="w-5 h-5" /> : i + 1}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-8 md:w-16 h-0.5 mx-1 ${i < step ? "bg-accent" : "bg-muted"}`} />
                  )}
                </div>
              ))}
            </div>

            <div className="card-elevated p-8">
              <h2 className="font-display font-bold text-xl text-foreground mb-6">{steps[step]}</h2>

              {step === 0 && (
                <div className="space-y-4">
                  <input placeholder="اسم العميل *" required value={data.clientName} onChange={(e) => setData({ ...data, clientName: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
                  <input placeholder="اسم المحل *" required value={data.shopName} onChange={(e) => setData({ ...data, shopName: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
                  <select value={data.activity} onChange={(e) => setData({ ...data, activity: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50">
                    <option value="">نوع النشاط</option>
                    <option>ملابس وأزياء</option><option>مطاعم وكافيهات</option><option>مجوهرات</option><option>إلكترونيات</option><option>أخرى</option>
                  </select>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <input placeholder="اسم المول" value={data.mall} onChange={(e) => setData({ ...data, mall: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
                  <input placeholder="رقم المحل" value={data.shopNumber} onChange={(e) => setData({ ...data, shopNumber: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
                  <input placeholder="المساحة (م²)" value={data.area} onChange={(e) => setData({ ...data, area: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
                  <select value={data.shopStatus} onChange={(e) => setData({ ...data, shopStatus: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50">
                    <option value="">حالة المحل</option><option>جديد (خام)</option><option>مجهز سابقاً</option><option>يحتاج تجديد</option>
                  </select>
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {servicesList.map((s) => (
                    <button key={s} onClick={() => toggleService(s)} className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-body text-right transition-all ${
                      data.services.includes(s) ? "border-accent bg-accent/10 text-foreground" : "border-border text-muted-foreground hover:border-accent/50"
                    }`}>
                      <CheckCircle className={`w-5 h-5 shrink-0 ${data.services.includes(s) ? "text-accent" : "text-muted"}`} />
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <select value={data.budget} onChange={(e) => setData({ ...data, budget: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50">
                    <option value="">الميزانية التقريبية</option>
                    <option>أقل من 100,000 ريال</option><option>100,000 - 300,000 ريال</option><option>300,000 - 500,000 ريال</option><option>أكثر من 500,000 ريال</option>
                  </select>
                  <input type="date" placeholder="تاريخ الافتتاح المتوقع" value={data.openingDate} onChange={(e) => setData({ ...data, openingDate: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
                </div>
              )}

              {step === 4 && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-10 h-10 text-accent" />
                  </div>
                  <p className="text-muted-foreground font-body mb-4">يمكنك إرفاق صور المساحة أو المخططات</p>
                  <textarea placeholder="ملاحظات إضافية..." rows={4} value={data.notes} onChange={(e) => setData({ ...data, notes: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none" />
                </div>
              )}

              {step === 5 && (
                <div className="space-y-4">
                  <p className="text-muted-foreground font-body mb-4">مراجعة البيانات قبل الإرسال:</p>
                  <div className="space-y-2 text-sm font-body">
                    {data.clientName && <p><strong>الاسم:</strong> {data.clientName}</p>}
                    {data.shopName && <p><strong>المحل:</strong> {data.shopName}</p>}
                    {data.activity && <p><strong>النشاط:</strong> {data.activity}</p>}
                    {data.mall && <p><strong>المول:</strong> {data.mall}</p>}
                    {data.area && <p><strong>المساحة:</strong> {data.area} م²</p>}
                    {data.services.length > 0 && <p><strong>الخدمات:</strong> {data.services.join("، ")}</p>}
                    {data.budget && <p><strong>الميزانية:</strong> {data.budget}</p>}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-foreground font-display font-bold text-sm disabled:opacity-30 hover:bg-muted transition-all"
                >
                  <ArrowRight className="w-4 h-4" /> السابق
                </button>
                {step < 5 ? (
                  <button
                    onClick={() => setStep((s) => Math.min(5, s + 1))}
                    disabled={!canNext()}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-accent-foreground font-display font-bold text-sm disabled:opacity-30 hover:-translate-y-0.5 active:scale-95 transition-all"
                  >
                    التالي <ArrowLeft className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-accent text-accent-foreground font-display font-bold text-sm hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} إرسال الطلب
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingButtons />
    </div>
  );
};

export default QuotePage;
