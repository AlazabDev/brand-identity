import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import { motion } from "framer-motion";

const PrivacyPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <section className="section-padding bg-primary text-primary-foreground">
          <div className="container-custom text-center">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display font-bold text-4xl md:text-5xl mb-4">
              سياسة الخصوصية
            </motion.h1>
          </div>
        </section>
        <section className="section-padding bg-background">
          <div className="container-custom max-w-3xl prose prose-lg font-body text-foreground">
            <h2 className="font-display font-bold text-2xl mb-4">مقدمة</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">نحن في Brand Identity نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح هذه السياسة كيفية جمع واستخدام وحماية المعلومات.</p>
            <h2 className="font-display font-bold text-2xl mb-4">المعلومات التي نجمعها</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">نجمع المعلومات التي تقدمها لنا طوعاً من خلال نماذج الاتصال مثل الاسم والبريد الإلكتروني ورقم الهاتف وتفاصيل المشروع.</p>
            <h2 className="font-display font-bold text-2xl mb-4">كيفية استخدام المعلومات</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">نستخدم المعلومات للتواصل معك بشأن خدماتنا وتقديم عروض الأسعار وتحسين تجربتك على موقعنا.</p>
            <h2 className="font-display font-bold text-2xl mb-4">حماية المعلومات</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">نتخذ إجراءات أمنية مناسبة لحماية بياناتك من الوصول غير المصرح به أو التعديل أو الكشف.</p>
            <h2 className="font-display font-bold text-2xl mb-4">حقوقك</h2>
            <p className="text-muted-foreground leading-relaxed">يحق لك طلب الوصول إلى بياناتك الشخصية أو تصحيحها أو حذفها. تواصل معنا عبر brand.identity@alazab.com</p>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingButtons />
    </div>
  );
};

export default PrivacyPage;
