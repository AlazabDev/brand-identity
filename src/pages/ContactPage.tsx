import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import PageMeta from "@/components/PageMeta";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ContactPage = () => {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", activity: "", mall: "", area: "", message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const sendWhatsAppNotification = (data: typeof form) => {
    const text = `📩 رسالة جديدة من الموقع\n\n👤 الاسم: ${data.name}\n📧 البريد: ${data.email || "—"}\n📱 الجوال: ${data.phone || "—"}\n🏪 النشاط: ${data.activity || "—"}\n🏬 المول: ${data.mall || "—"}\n📐 المساحة: ${data.area || "—"}\n💬 الرسالة: ${data.message || "—"}`;
    window.open(`https://wa.me/201004006620?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.from("contact_messages").insert({
        name: form.name,
        email: form.email || null,
        phone: form.phone || null,
        business_type: form.activity || null,
        mall: form.mall || null,
        area: form.area || null,
        message: form.message || null,
      });

      if (error) throw error;

      toast.success("تم إرسال رسالتك بنجاح! سنتواصل معك قريباً");
      sendWhatsAppNotification(form);
      setForm({ name: "", email: "", phone: "", activity: "", mall: "", area: "", message: "" });
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
        title="اتصل بنا"
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
                  { icon: MapPin, label: "العنوان", value: "الحي التجاري - مدينة الرياض" },
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
                  className="card-elevated p-8 space-y-5"
                >
                  <h2 className="font-display font-bold text-2xl text-foreground mb-2">أرسل لنا رسالة</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="text" placeholder="الاسم الكامل" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
                    <input type="email" placeholder="البريد الإلكتروني" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
                    <input type="tel" placeholder="رقم الجوال" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
                    <select value={form.activity} onChange={(e) => setForm({ ...form, activity: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50">
                      <option value="">نوع النشاط</option>
                      <option>ملابس وأزياء</option>
                      <option>مطاعم وكافيهات</option>
                      <option>مجوهرات وإكسسوارات</option>
                      <option>إلكترونيات</option>
                      <option>أخرى</option>
                    </select>
                    <input type="text" placeholder="المول المطلوب" value={form.mall} onChange={(e) => setForm({ ...form, mall: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
                    <input type="text" placeholder="المساحة (م²)" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
                  </div>
                  <textarea placeholder="رسالتك..." rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none" />
                  <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-accent text-accent-foreground font-display font-bold hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} إرسال الرسالة
                  </button>
                </motion.form>

                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="rounded-2xl overflow-hidden"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2708.771324907652!2d31.278762925568998!3d29.987812974952135!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1458396627ebf27d%3A0x15bc48a54f2e9a92!2z2KfZhNi52LLYqCDZhNmE2YXZgtin2YjZhNin2Kog2YjYp9mE2KrZiNix2YrYr9in2Ko!5e1!3m2!1sar!2seg!4v1773443057660!5m2!1sar!2seg"
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

export default ContactPage;