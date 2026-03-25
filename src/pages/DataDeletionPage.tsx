import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import PageMeta from "@/components/PageMeta";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const DataDeletionPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("contact_messages").insert({
        name,
        email,
        message: `[طلب حذف بيانات] ${message || "أرغب في حذف بياناتي الشخصية من النظام"}`,
      });
      if (error) throw error;
      toast.success("تم إرسال طلبك بنجاح. سنتواصل معك خلال 30 يوم عمل.");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      toast.error("حدث خطأ أثناء إرسال الطلب. يرجى المحاولة لاحقاً.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <PageMeta
        title="طلب حذف البيانات"
        description="صفحة طلب حذف البيانات الشخصية من Brand Identity وفقاً لسياسة الخصوصية ومتطلبات Meta."
        canonical="https://brand-identity.alazab.com/data-deletion"
      />
      <div className="min-h-screen">
        <Header />
        <main id="main-content" className="pt-20">
          <section className="section-padding bg-primary text-primary-foreground">
            <div className="container-custom text-center">
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display font-bold text-4xl md:text-5xl mb-4">
                طلب حذف البيانات
              </motion.h1>
              <p className="text-primary-foreground/70 font-body">Data Deletion Request</p>
            </div>
          </section>
          <section className="section-padding bg-background">
            <div className="container-custom max-w-3xl prose prose-lg font-body text-foreground" dir="rtl">
              <h2 className="font-display font-bold text-2xl mb-4">سياسة حذف البيانات</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">نحترم حقك في حذف بياناتك الشخصية. وفقاً لسياسة الخصوصية الخاصة بنا ومتطلبات منصات Meta وGoogle، يمكنك طلب حذف جميع البيانات المرتبطة بحسابك في أي وقت.</p>

              <h2 className="font-display font-bold text-2xl mb-4">ما البيانات التي سيتم حذفها؟</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">عند تقديم طلب حذف البيانات، سنقوم بحذف:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6 mr-4">
                <li>معلومات الملف الشخصي (الاسم، البريد الإلكتروني، رقم الهاتف)</li>
                <li>بيانات تسجيل الدخول عبر Google أو Meta (Facebook)</li>
                <li>سجل الرسائل والتواصل</li>
                <li>طلبات عروض الأسعار المرتبطة بحسابك</li>
                <li>أي بيانات أخرى مخزنة ومرتبطة بهويتك</li>
              </ul>

              <h2 className="font-display font-bold text-2xl mb-4">كيفية تقديم طلب الحذف</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">يمكنك تقديم طلب حذف البيانات بإحدى الطرق التالية:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6 mr-4">
                <li>ملء النموذج أدناه</li>
                <li>إرسال بريد إلكتروني إلى: <a href="mailto:brand.identity@alazab.com" className="text-accent hover:underline">brand.identity@alazab.com</a></li>
                <li>التواصل معنا عبر الهاتف: <a href="tel:+201004006620" className="text-accent hover:underline" dir="ltr">+20 100 400 6620</a></li>
              </ul>

              <h2 className="font-display font-bold text-2xl mb-4">مدة المعالجة</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">سنقوم بمعالجة طلبك خلال 30 يوم عمل من تاريخ استلامه. سيتم إرسال تأكيد إليك عبر البريد الإلكتروني بمجرد اكتمال عملية الحذف.</p>

              <h2 className="font-display font-bold text-2xl mb-6">نموذج طلب حذف البيانات</h2>
              <form onSubmit={handleSubmit} className="space-y-4 not-prose">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">الاسم الكامل *</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="أدخل اسمك الكامل" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">البريد الإلكتروني المسجل *</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="أدخل بريدك الإلكتروني" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">تفاصيل إضافية (اختياري)</label>
                  <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="أي معلومات إضافية تساعدنا في معالجة طلبك" rows={4} />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "جاري الإرسال..." : "إرسال طلب الحذف"}
                </Button>
              </form>
            </div>
          </section>
        </main>
        <Footer />
        <FloatingButtons />
      </div>
    </PageTransition>
  );
};

export default DataDeletionPage;
