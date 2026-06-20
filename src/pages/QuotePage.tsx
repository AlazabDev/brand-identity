import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import PageMeta from "@/components/PageMeta";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle, Loader2, MessageCircle, FileText } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { quoteSchema, firstZodError } from "@/lib/validation";

const steps = [
  "المعلومات الأساسية",
  "تفاصيل المشروع",
  "الخدمات المطلوبة",
  "الميزانية والجدول",
  "ملاحظات إضافية",
  "المراجعة والإرسال",
];

const servicesList = [
  "التعديلات الإنشائية والتأسيس",
  "تصنيع وحدات العرض",
  "وحدات التخزين",
  "الوحدات الديكورية والواجهات",
  "التشطيب والتسليم النهائي",
  "استشارات تصميمية",
  "صيانة دورية",
];

interface QuoteData {
  clientName: string;
  shopName: string;
  activity: string;
  mall: string;
  shopNumber: string;
  area: string;
  shopStatus: string;
  services: string[];
  budget: string;
  openingDate: string;
  notes: string;
}

const initialData: QuoteData = {
  clientName: "",
  shopName: "",
  activity: "",
  mall: "",
  shopNumber: "",
  area: "",
  shopStatus: "",
  services: [],
  budget: "",
  openingDate: "",
  notes: "",
};

const buildWhatsAppUrl = (data: QuoteData): string => {
  const text = `📋 طلب عرض سعر جديد\n\n👤 العميل: ${data.clientName}\n🏪 المحل: ${data.shopName || "—"}\n📂 النشاط: ${data.activity || "—"}\n🏬 المول: ${data.mall || "—"}\n🔢 رقم المحل: ${data.shopNumber || "—"}\n📐 المساحة: ${data.area || "—"} م²\n🔧 الحالة: ${data.shopStatus || "—"}\n🛠 الخدمات: ${data.services.join("، ") || "—"}\n💰 الميزانية: ${data.budget || "—"}\n📅 الافتتاح: ${data.openingDate || "—"}\n📝 ملاحظات: ${data.notes || "—"}`;
  return `https://wa.me/201004006620?text=${encodeURIComponent(text)}`;
};

const QuotePage = () => {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<QuoteData>(initialData);
  const [whatsAppUrl, setWhatsAppUrl] = useState<string | null>(null);
  const [lastSubmittedAt, setLastSubmittedAt] = useState<number>(0);

  const toggleService = (s: string) => {
    setData((d) => ({
      ...d,
      services: d.services.includes(s) ? d.services.filter((x) => x !== s) : [...d.services, s],
    }));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    if (Date.now() - lastSubmittedAt < 3000) {
      toast.warning("يرجى الانتظار قليلاً قبل إعادة الإرسال");
      return;
    }

    const parsed = quoteSchema.safeParse(data);
    if (!parsed.success) {
      toast.error(firstZodError(parsed.error));
      return;
    }

    setSubmitting(true);
    try {
      const v = parsed.data;
      const { error } = await supabase.from("quote_requests").insert({
        client_name: v.clientName,
        shop_name: v.shopName || null,
        business_type: v.activity || null,
        mall: v.mall || null,
        shop_number: v.shopNumber || null,
        area: v.area || null,
        shop_status: v.shopStatus || null,
        services: v.services.length > 0 ? v.services : null,
        budget: v.budget || null,
        opening_date: v.openingDate || null,
        notes: v.notes || null,
      });

      if (error) throw error;

      toast.success("تم إرسال طلب عرض السعر بنجاح! سنتواصل معك خلال 24 ساعة");
      setWhatsAppUrl(buildWhatsAppUrl(data));
      setLastSubmittedAt(Date.now());
      setStep(0);
      setData(initialData);
    } catch (err) {
      console.error("Error submitting quote:", err);
      toast.error("حدث خطأ أثناء الإرسال. حاول مرة أخرى");
    } finally {
      setSubmitting(false);
    }
  };

  const canNext = (): boolean => {
    if (step === 0) {
      return data.clientName.trim().length >= 2 && data.shopName.trim().length >= 2;
    }
    if (step === 2) {
      return data.services.length > 0;
    }
    return true;
  };

  return (
    <PageTransition>
      <PageMeta
        title="طلب عرض سعر | Brand Identity"
        description="احصل على عرض سعر دقيق لتجهيز محلك التجاري في المول - 6 خطوات بسيطة مع Brand Identity."
        canonical="https://brand-identity.alazab.com/quote"
      />
      <div className="min-h-screen">
        <Header />
        <main id="main-content" className="pt-20">
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
              <div className="flex items-center justify-between mb-12 overflow-x-auto pb-4">
                {steps.map((s, i) => (
                  <div key={s} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-display font-bold shrink-0 transition-colors ${
                      i <= step ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      {i < step ? <CheckCircle className="w-5 h-5" /> : i + 1}
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`w-8 md:w-16 h-0.5 mx-1 transition-colors ${i < step ? "bg-accent" : "bg-muted"}`} />
                    )}
                  </div>
                ))}
              </div>

              <div className="card-elevated p-8">
                <h2 className="font-display font-bold text-xl text-foreground mb-6">{steps[step]}</h2>

                {step === 0 && (
                  <div className="space-y-4">
                    <input placeholder="اسم العميل *" required maxLength={100} value={data.clientName} onChange={(e) => setData({ ...data, clientName: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
                    <input placeholder="اسم المحل *" required maxLength={100} value={data.shopName} onChange={(e) => setData({ ...data, shopName: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
                    <select value={data.activity} onChange={(e) => setData({ ...data, activity: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50">
                      <option value="">نوع النشاط</option>
                      <option>ملابس وأزياء</option><option>مطاعم وكافيهات</option><option>مجوهرات</option><option>إلكترونيات</option><option>أخرى</option>
                    </select>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-4">
                    <input placeholder="اسم المول" maxLength={100} value={data.mall} onChange={(e) => setData({ ...data, mall: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
                    <input placeholder="رقم المحل" maxLength={20} value={data.shopNumber} onChange={(e) => setData({ ...data, shopNumber: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
                    <input type="number" inputMode="numeric" placeholder="المساحة (م²)" maxLength={20} value={data.area} onChange={(e) => setData({ ...data, area: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
                    <select value={data.shopStatus} onChange={(e) => setData({ ...data, shopStatus: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50">
                      <option value="">حالة المحل</option><option>جديد (خام)</option><option>مجهز سابقاً</option><option>يحتاج تجديد</option>
                    </select>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <p className="text-muted-foreground font-body text-sm mb-4">اختر خدمة واحدة على الأقل</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {servicesList.map((s) => (
                        <button type="button" key={s} onClick={() => toggleService(s)} className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-body text-right transition-all ${
                          data.services.includes(s) ? "border-accent bg-accent/10 text-foreground" : "border-border text-muted-foreground hover:border-accent/50"
                        }`}>
                          <CheckCircle className={`w-5 h-5 shrink-0 ${data.services.includes(s) ? "text-accent" : "text-muted"}`} />
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <select value={data.budget} onChange={(e) => setData({ ...data, budget: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50">
                      <option value="">الميزانية التقريبية (جنيه مصري)</option>
                      <option>أقل من 200,000 ج.م</option>
                      <option>200,000 - 500,000 ج.م</option>
                      <option>500,000 - 1,000,000 ج.م</option>
                      <option>أكثر من 1,000,000 ج.م</option>
                    </select>
                    <label className="block text-sm font-body text-muted-foreground">تاريخ الافتتاح المتوقع</label>
                    <input type="date" value={data.openingDate} min={new Date().toISOString().split("T")[0]} onChange={(e) => setData({ ...data, openingDate: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <FileText className="w-5 h-5 text-accent" />
                      <p className="font-body text-sm">أضف أي ملاحظات أو متطلبات خاصة. لإرفاق صور أو مخططات يرجى مراسلتنا عبر واتساب بعد الإرسال.</p>
                    </div>
                    <textarea placeholder="ملاحظات إضافية..." rows={6} maxLength={2000} value={data.notes} onChange={(e) => setData({ ...data, notes: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none" />
                    <p className="text-xs text-muted-foreground text-left" dir="ltr">{data.notes.length}/2000</p>
                  </div>
                )}

                {step === 5 && (
                  <div className="space-y-4">
                    <p className="text-muted-foreground font-body mb-4">مراجعة البيانات قبل الإرسال:</p>
                    <div className="space-y-2 text-sm font-body bg-muted/50 rounded-lg p-6">
                      {data.clientName && <p><strong className="text-foreground">الاسم:</strong> <span className="text-muted-foreground">{data.clientName}</span></p>}
                      {data.shopName && <p><strong className="text-foreground">المحل:</strong> <span className="text-muted-foreground">{data.shopName}</span></p>}
                      {data.activity && <p><strong className="text-foreground">النشاط:</strong> <span className="text-muted-foreground">{data.activity}</span></p>}
                      {data.mall && <p><strong className="text-foreground">المول:</strong> <span className="text-muted-foreground">{data.mall}</span></p>}
                      {data.area && <p><strong className="text-foreground">المساحة:</strong> <span className="text-muted-foreground">{data.area} م²</span></p>}
                      {data.services.length > 0 && <p><strong className="text-foreground">الخدمات:</strong> <span className="text-muted-foreground">{data.services.join("، ")}</span></p>}
                      {data.budget && <p><strong className="text-foreground">الميزانية:</strong> <span className="text-muted-foreground">{data.budget}</span></p>}
                      {data.openingDate && <p><strong className="text-foreground">الافتتاح:</strong> <span className="text-muted-foreground">{data.openingDate}</span></p>}
                    </div>
                    {whatsAppUrl && (
                      <a
                        href={whatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-accent text-accent font-display font-bold hover:bg-accent/10 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        إرسال نسخة عبر واتساب
                      </a>
                    )}
                  </div>
                )}

                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    disabled={step === 0}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-foreground font-display font-bold text-sm disabled:opacity-30 hover:bg-muted transition-all"
                  >
                    <ArrowRight className="w-4 h-4" /> السابق
                  </button>
                  {step < 5 ? (
                    <button
                      type="button"
                      onClick={() => setStep((s) => Math.min(5, s + 1))}
                      disabled={!canNext()}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-accent-foreground font-display font-bold text-sm disabled:opacity-30 hover:-translate-y-0.5 active:scale-95 transition-all"
                    >
                      التالي <ArrowLeft className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-accent text-accent-foreground font-display font-bold text-sm hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
    </PageTransition>
  );
};

export { QuotePage };
export default QuotePage;
