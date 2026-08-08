import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import PageMeta from "@/components/PageMeta";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, Send, Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { contactSchema, firstZodError } from "@/lib/validation";

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  activity: string;
  mall: string;
  area: string;
  message: string;
}

const initialForm: ContactForm = {
  name: "",
  email: "",
  phone: "",
  activity: "",
  mall: "",
  area: "",
  message: "",
};

const buildWhatsAppUrl = (data: ContactForm): string => {
  const text = `📩 رسالة جديدة من الموقع\n\n👤 الاسم: ${data.name}\n📧 البريد: ${data.email || "—"}\n📱 الجوال: ${data.phone || "—"}\n🏪 النشاط: ${data.activity || "—"}\n🏬 المول: ${data.mall || "—"}\n📐 المساحة: ${data.area || "—"}\n💬 الرسالة: ${data.message || "—"}`;
  return `https://wa.me/201004006620?text=${encodeURIComponent(text)}`;
};

const fieldClass = (hasError?: string): string =>
  `w-full min-h-11 px-4 py-3 rounded-lg border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 ${
    hasError ? "border-destructive" : "border-border"
  }`;


const ContactPage = () => {
  const [form, setForm] = useState<ContactForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [lastSubmittedAt, setLastSubmittedAt] = useState<number>(0);
  const [whatsAppUrl, setWhatsAppUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactForm, string>>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    // Prevent rapid double-submits (3s throttle)
    if (Date.now() - lastSubmittedAt < 3000) {
      toast.warning("يرجى الانتظار قليلاً قبل إعادة الإرسال");
      return;
    }

    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof ContactForm, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof ContactForm | undefined;
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error(firstZodError(parsed.error));
      return;
    }
    setErrors({});


    setSubmitting(true);
    try {
      const { error } = await supabase.from("contact_messages").insert({
        name: parsed.data.name,
        email: parsed.data.email || null,
        phone: parsed.data.phone || null,
        business_type: parsed.data.activity || null,
        mall: parsed.data.mall || null,
        area: parsed.data.area || null,
        message: parsed.data.message || null,
      });

      if (error) throw error;

      toast.success("تم إرسال رسالتك بنجاح! سنتواصل معك قريباً");
      setWhatsAppUrl(buildWhatsAppUrl(form));
      setLastSubmittedAt(Date.now());
      setForm(initialForm);
    } catch (err) {
      console.error("Error submitting contact:", err);
      toast.error("حدث خطأ أثناء الإرسال. حاول مرة أخرى");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <PageMeta
        title="اتصل بنا | Brand Identity"
        description="تواصل مع Brand Identity للحصول على استشارة مجانية لتجهيز محلك التجاري داخل المول. هاتف: +201004006620"
        canonical="https://brand-identity.alazab.com/contact"
      />
      <div className="min-h-screen">
        <Header />
        <main id="main-content" className="pt-20">
          <section className="section-padding bg-primary text-primary-foreground">
            <div className="container-custom text-center">
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display font-bold text-4xl md:text-5xl mb-4">
                اتصل بنا
              </motion.h1>
              <p className="text-primary-foreground/70 font-body text-lg">نحن هنا لمساعدتك في تجهيز محلك</p>
            </div>
          </section>

          <section className="section-padding bg-background">
            <div className="container-custom">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                {[
                  { icon: Phone, label: "الهاتف", value: "+20 100 400 6620", href: "tel:+201004006620" },
                  { icon: Mail, label: "البريد", value: "brand.identity@alazab.com", href: "mailto:brand.identity@alazab.com" },
                  { icon: MapPin, label: "العنوان", value: "القاهرة الجديدة - جمهورية مصر العربية" },
                  { icon: Clock, label: "ساعات العمل", value: "السبت - الخميس: 9 ص - 6 م" },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="card-elevated p-6 text-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                      <item.icon className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="font-display font-bold text-foreground mb-1">{item.label}</h3>
                    {item.href ? (
                      <a href={item.href} className="text-muted-foreground text-sm font-body hover:text-accent transition-colors" dir="ltr">{item.value}</a>
                    ) : (
                      <p className="text-muted-foreground text-sm font-body">{item.value}</p>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <motion.form
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  onSubmit={handleSubmit}
                  noValidate
                  className="card-elevated p-8 space-y-5"
                >
                  <h2 className="font-display font-bold text-2xl text-foreground mb-2">أرسل لنا رسالة</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-name" className="block mb-1 font-body text-xs text-muted-foreground">الاسم الكامل *</label>
                      <input id="contact-name" type="text" placeholder="الاسم الكامل" required maxLength={100} value={form.name} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "contact-name-error" : undefined} onChange={(e) => setForm({ ...form, name: e.target.value })} className={fieldClass(errors.name)} />
                      {errors.name && <p id="contact-name-error" className="mt-1 font-body text-xs text-destructive">{errors.name}</p>}
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="block mb-1 font-body text-xs text-muted-foreground">البريد الإلكتروني</label>
                      <input id="contact-email" type="email" placeholder="name@example.com" maxLength={255} value={form.email} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "contact-email-error" : undefined} onChange={(e) => setForm({ ...form, email: e.target.value })} className={fieldClass(errors.email)} />
                      {errors.email && <p id="contact-email-error" className="mt-1 font-body text-xs text-destructive">{errors.email}</p>}
                    </div>
                    <div>
                      <label htmlFor="contact-phone" className="block mb-1 font-body text-xs text-muted-foreground">رقم الجوال</label>
                      <input id="contact-phone" type="tel" inputMode="tel" placeholder="01xxxxxxxxx" maxLength={20} value={form.phone} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "contact-phone-error" : undefined} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={fieldClass(errors.phone)} />
                      {errors.phone && <p id="contact-phone-error" className="mt-1 font-body text-xs text-destructive">{errors.phone}</p>}
                    </div>
                    <div>
                      <label htmlFor="contact-activity" className="block mb-1 font-body text-xs text-muted-foreground">نوع النشاط</label>
                      <select id="contact-activity" value={form.activity} onChange={(e) => setForm({ ...form, activity: e.target.value })} className={fieldClass(errors.activity)}>
                        <option value="">اختر نوع النشاط</option>
                        <option>ملابس وأزياء</option>
                        <option>مطاعم وكافيهات</option>
                        <option>مجوهرات وإكسسوارات</option>
                        <option>إلكترونيات</option>
                        <option>أخرى</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="contact-mall" className="block mb-1 font-body text-xs text-muted-foreground">المول المطلوب</label>
                      <input id="contact-mall" type="text" placeholder="اسم المول" maxLength={100} value={form.mall} onChange={(e) => setForm({ ...form, mall: e.target.value })} className={fieldClass(errors.mall)} />
                    </div>
                    <div>
                      <label htmlFor="contact-area" className="block mb-1 font-body text-xs text-muted-foreground">المساحة (م²)</label>
                      <input id="contact-area" type="text" inputMode="numeric" placeholder="مثال: 120" maxLength={20} value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className={fieldClass(errors.area)} />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="contact-message" className="block mb-1 font-body text-xs text-muted-foreground">رسالتك</label>
                    <textarea id="contact-message" placeholder="اكتب تفاصيل مشروعك..." rows={4} maxLength={2000} value={form.message} aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? "contact-message-error" : undefined} onChange={(e) => setForm({ ...form, message: e.target.value })} className={`${fieldClass(errors.message)} resize-none`} />
                    {errors.message && <p id="contact-message-error" className="mt-1 font-body text-xs text-destructive">{errors.message}</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button type="submit" disabled={submitting} className="inline-flex min-h-11 items-center gap-2 px-8 py-3 rounded-lg bg-accent text-accent-foreground font-display font-bold hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Send className="w-4 h-4" aria-hidden="true" />} {submitting ? "جارٍ الإرسال..." : "إرسال الرسالة"}
                    </button>
                    {whatsAppUrl && (
                      <a
                        href={whatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center gap-2 px-6 py-3 rounded-lg border border-accent text-accent font-display font-bold hover:bg-accent/10 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" aria-hidden="true" />
                        إرسال نسخة عبر واتساب
                      </a>
                    )}
                  </div>
                  <p aria-live="polite" className="font-body text-xs text-muted-foreground">
                    {whatsAppUrl ? "تم استلام رسالتك بنجاح، سنتواصل معك قريباً." : ""}
                  </p>
                </motion.form>


                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="rounded-2xl overflow-hidden"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2708.771324907652!2d31.278762925568998!3d29.987812974952135!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1458396627ebf27d%3A0x15bc48a54f2e9a92!2z2KfZhNi52LLYqCDZhNmF2YLYp9mI2YTYp9iqINmI2KfZhNiq2YjYsdmK2K_Yp9iq!5e1!3m2!1sar!2seg!4v1773443057660!5m2!1sar!2seg"
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: "400px" }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="موقعنا على الخريطة"
                  />
                </motion.div>
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

export { ContactPage };
export default ContactPage;
