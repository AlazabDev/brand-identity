import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import PageMeta from "@/components/PageMeta";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";
import { Briefcase, MapPin, Clock, ChevronDown, ChevronUp, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Job {
  id: string;
  title: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
}

const openPositions: Job[] = [
  {
    id: "1",
    title: "مهندس موقع",
    location: "القاهرة",
    type: "دوام كامل",
    description: "نبحث عن مهندس موقع متمرس للإشراف على تنفيذ مشاريع تجهيز المحلات التجارية في المولات.",
    requirements: [
      "خبرة لا تقل عن 3 سنوات في مشاريع التجهيزات الداخلية",
      "إجادة قراءة الرسومات الهندسية",
      "القدرة على إدارة فرق العمل الميدانية",
      "مهارات تواصل ممتازة",
    ],
  },
  {
    id: "2",
    title: "مصمم داخلي",
    location: "القاهرة",
    type: "دوام كامل",
    description: "فرصة للمصممين المبدعين للعمل على تصميم محلات تجارية في أكبر المولات.",
    requirements: [
      "خبرة لا تقل عن 2 سنوات في التصميم الداخلي التجاري",
      "إتقان برامج AutoCAD و 3ds Max",
      "معرفة بمعايير المولات التجارية",
      "القدرة على تقديم أفكار إبداعية",
    ],
  },
  {
    id: "3",
    title: "فني نجارة",
    location: "المنطقة الصناعية - القاهرة",
    type: "دوام كامل",
    description: "نحتاج فنيين نجارة محترفين لتصنيع وحدات العرض والتخزين.",
    requirements: [
      "خبرة لا تقل عن 5 سنوات في النجارة",
      "إجادة العمل على ماكينات CNC",
      "الدقة والاهتمام بالتفاصيل",
      "القدرة على قراءة الرسومات الفنية",
    ],
  },
];

const CareersPage = () => {
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [applyingFor, setApplyingFor] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    experience: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingFor) return;

    setSubmitting(true);
    const { error } = await supabase.from("job_applications").insert({
      full_name: form.fullName,
      email: form.email || null,
      phone: form.phone || null,
      position: applyingFor,
      experience_years: form.experience || null,
      message: form.message || null,
    });

    if (error) {
      toast.error("حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.");
    } else {
      toast.success("تم إرسال طلبك بنجاح! سنتواصل معك قريبًا.");
      setForm({ fullName: "", email: "", phone: "", experience: "", message: "" });
      setApplyingFor(null);
    }
    setSubmitting(false);
  };

  return (
    <PageTransition>
      <PageMeta
        title="الوظائف المتاحة"
        description="انضم لفريق Brand Identity - تصفح الوظائف المتاحة وقدم طلبك الآن."
        canonical="https://brand-identity.alazab.com/careers"
      />
      <div className="min-h-screen">
        <Header />
        <main id="main-content" className="pt-20">
          {/* Hero */}
          <section className="section-padding bg-primary text-primary-foreground">
            <div className="container-custom text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display font-bold text-4xl md:text-5xl mb-4"
              >
                انضم لفريقنا
              </motion.h1>
              <p className="text-primary-foreground/70 font-body text-lg max-w-2xl mx-auto">
                نبحث عن مواهب مميزة تشاركنا الشغف بالإبداع والتميز في تجهيز المحلات التجارية
              </p>
            </div>
          </section>

          {/* Jobs */}
          <section className="section-padding bg-background">
            <div className="container-custom max-w-3xl">
              <h2 className="font-display font-bold text-2xl text-foreground mb-8">
                الوظائف المتاحة ({openPositions.length})
              </h2>
              <div className="space-y-4">
                {openPositions.map((job) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="card-elevated overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                      className="w-full p-6 flex items-center justify-between text-right"
                    >
                      <div>
                        <h3 className="font-display font-bold text-lg text-foreground mb-2">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap gap-3 text-muted-foreground font-body text-xs">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" /> {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {job.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5" /> {job.title}
                          </span>
                        </div>
                      </div>
                      {expandedJob === job.id ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                      )}
                    </button>

                    {expandedJob === job.id && (
                      <div className="px-6 pb-6 border-t border-border pt-4">
                        <p className="text-muted-foreground font-body text-sm leading-relaxed mb-4">
                          {job.description}
                        </p>
                        <h4 className="font-display font-bold text-foreground text-sm mb-2">المتطلبات:</h4>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground font-body text-sm mb-4">
                          {job.requirements.map((req) => (
                            <li key={req}>{req}</li>
                          ))}
                        </ul>
                        <Button
                          onClick={() => setApplyingFor(job.title)}
                          className="gap-2"
                        >
                          <Send className="w-4 h-4" />
                          تقدم لهذه الوظيفة
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Application Form */}
          {applyingFor && (
            <section className="section-padding bg-muted/50" id="apply-form">
              <div className="container-custom max-w-2xl">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card-elevated p-8"
                >
                  <h2 className="font-display font-bold text-2xl text-foreground mb-2">
                    التقديم لوظيفة: {applyingFor}
                  </h2>
                  <p className="text-muted-foreground font-body text-sm mb-6">
                    يرجى تعبئة النموذج التالي وسيتم التواصل معك خلال 48 ساعة
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-body font-medium text-foreground mb-1">
                        الاسم الكامل *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.fullName}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-body font-medium text-foreground mb-1">
                          البريد الإلكتروني
                        </label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-body font-medium text-foreground mb-1">
                          رقم الهاتف
                        </label>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-body font-medium text-foreground mb-1">
                        سنوات الخبرة
                      </label>
                      <input
                        type="text"
                        value={form.experience}
                        onChange={(e) => setForm({ ...form, experience: e.target.value })}
                        placeholder="مثال: 5 سنوات"
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-body font-medium text-foreground mb-1">
                        رسالة إضافية
                      </label>
                      <textarea
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button type="submit" disabled={submitting} className="gap-2">
                        <Send className="w-4 h-4" />
                        {submitting ? "جارٍ الإرسال..." : "إرسال الطلب"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setApplyingFor(null)}
                      >
                        إلغاء
                      </Button>
                    </div>
                  </form>
                </motion.div>
              </div>
            </section>
          )}
        </main>
        <Footer />
        <FloatingButtons />
      </div>
    </PageTransition>
  );
};

export default CareersPage;
