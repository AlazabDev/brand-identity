import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import PageMeta from "@/components/PageMeta";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";

const CookiePolicyPage = () => {
  return (
    <PageTransition>
      <PageMeta
        title="سياسة ملفات تعريف الارتباط"
        description="سياسة ملفات تعريف الارتباط (الكوكيز) لموقع Brand Identity وكيفية استخدامها."
        canonical="https://brand-identity.alazab.com/cookies"
      />
      <div className="min-h-screen">
        <Header />
        <main id="main-content" className="pt-20">
          <section className="section-padding bg-primary text-primary-foreground">
            <div className="container-custom text-center">
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display font-bold text-4xl md:text-5xl mb-4">
                سياسة ملفات تعريف الارتباط
              </motion.h1>
              <p className="text-primary-foreground/70 font-body">آخر تحديث: {new Date().toLocaleDateString("ar-EG")}</p>
            </div>
          </section>
          <section className="section-padding bg-background">
            <div className="container-custom max-w-3xl prose prose-lg font-body text-foreground" dir="rtl">
              <h2 className="font-display font-bold text-2xl mb-4">ما هي ملفات تعريف الارتباط؟</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">ملفات تعريف الارتباط (Cookies) هي ملفات نصية صغيرة يتم تخزينها على جهازك عند زيارة موقعنا الإلكتروني. تساعدنا هذه الملفات في تحسين تجربتك وتقديم خدمات أفضل.</p>

              <h2 className="font-display font-bold text-2xl mb-4">أنواع ملفات تعريف الارتباط التي نستخدمها</h2>

              <h3 className="font-display font-semibold text-xl mb-3">ملفات تعريف الارتباط الضرورية</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">هذه الملفات ضرورية لعمل الموقع بشكل صحيح وتشمل: إدارة جلسات تسجيل الدخول، حفظ تفضيلات الأمان، وضمان وظائف الموقع الأساسية.</p>

              <h3 className="font-display font-semibold text-xl mb-3">ملفات تعريف الارتباط التحليلية</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">نستخدم هذه الملفات لفهم كيفية تفاعل الزوار مع موقعنا وتحسين أدائه. تشمل أدوات مثل Google Analytics لتتبع عدد الزوار وسلوكهم على الموقع.</p>

              <h3 className="font-display font-semibold text-xl mb-3">ملفات تعريف الارتباط الوظيفية</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">تتيح هذه الملفات للموقع تذكر اختياراتك (مثل اللغة المفضلة) وتوفير ميزات محسّنة وشخصية.</p>

              <h3 className="font-display font-semibold text-xl mb-3">ملفات تعريف الارتباط التسويقية</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">تُستخدم لتتبع الزوار عبر المواقع المختلفة بهدف عرض إعلانات ذات صلة. قد تشمل ملفات من Meta (Facebook) وGoogle لأغراض إعلانية.</p>

              <h2 className="font-display font-bold text-2xl mb-4">ملفات تعريف الارتباط من طرف ثالث</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">قد يستخدم موقعنا خدمات من أطراف ثالثة تضع ملفات تعريف الارتباط الخاصة بها، وتشمل:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6 mr-4">
                <li><strong>Google Analytics</strong> – لتحليل حركة المرور على الموقع</li>
                <li><strong>Google Sign-In</strong> – لتمكين تسجيل الدخول بحساب Google</li>
                <li><strong>Meta (Facebook)</strong> – لتمكين تسجيل الدخول وأغراض تحليلية</li>
                <li><strong>خرائط Google</strong> – لعرض موقعنا على الخريطة</li>
              </ul>

              <h2 className="font-display font-bold text-2xl mb-4">إدارة ملفات تعريف الارتباط</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">يمكنك التحكم في ملفات تعريف الارتباط من خلال إعدادات متصفحك. يمكنك:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6 mr-4">
                <li>حذف جميع ملفات تعريف الارتباط المخزنة على جهازك</li>
                <li>ضبط المتصفح لإعلامك عند إرسال ملف تعريف ارتباط جديد</li>
                <li>رفض جميع ملفات تعريف الارتباط أو بعضها</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mb-6">يرجى ملاحظة أن تعطيل بعض ملفات تعريف الارتباط قد يؤثر على وظائف الموقع.</p>

              <h2 className="font-display font-bold text-2xl mb-4">التحديثات على هذه السياسة</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">قد نقوم بتحديث هذه السياسة من وقت لآخر. سيتم نشر أي تغييرات على هذه الصفحة.</p>

              <h2 className="font-display font-bold text-2xl mb-4">التواصل</h2>
              <p className="text-muted-foreground leading-relaxed">لأي استفسارات حول سياسة ملفات تعريف الارتباط، تواصل معنا عبر: <a href="mailto:brand.identity@alazab.com" className="text-accent hover:underline">brand.identity@alazab.com</a></p>
            </div>
          </section>
        </main>
        <Footer />
        <FloatingButtons />
      </div>
    </PageTransition>
  );
};

export default CookiePolicyPage;
