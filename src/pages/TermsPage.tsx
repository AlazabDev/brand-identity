import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import PageMeta from "@/components/PageMeta";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";

const TermsPage = () => {
  return (
    <PageTransition>
      <PageMeta
        title="شروط الاستخدام"
        description="شروط وأحكام استخدام موقع Brand Identity الإلكتروني وخدماتنا."
        canonical="https://brand-identity.alazab.com/terms"
      />
      <div className="min-h-screen">
        <Header />
        <main id="main-content" className="pt-20">
          <section className="section-padding bg-primary text-primary-foreground">
            <div className="container-custom text-center">
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display font-bold text-4xl md:text-5xl mb-4">
                شروط الاستخدام
              </motion.h1>
              <p className="text-primary-foreground/70 font-body">آخر تحديث: {new Date().toLocaleDateString("ar-EG")}</p>
            </div>
          </section>
          <section className="section-padding bg-background">
            <div className="container-custom max-w-3xl prose prose-lg font-body text-foreground" dir="rtl">
              <h2 className="font-display font-bold text-2xl mb-4">1. القبول بالشروط</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">باستخدامك لموقع Brand Identity الإلكتروني ("الموقع") أو أي من خدماتنا، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي من هذه الشروط، يُرجى عدم استخدام الموقع.</p>

              <h2 className="font-display font-bold text-2xl mb-4">2. وصف الخدمات</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">تقدم Brand Identity خدمات تجهيز المحلات التجارية والديكور الداخلي بما يشمل التصميم والتنفيذ والتسليم. تشمل خدماتنا على سبيل المثال لا الحصر: تجهيز المحلات، وحدات العرض والتخزين، الديكور والواجهات، والتسليم النهائي.</p>

              <h2 className="font-display font-bold text-2xl mb-4">3. حساب المستخدم</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">عند إنشاء حساب على موقعنا، يجب عليك تقديم معلومات دقيقة وكاملة. أنت مسؤول عن الحفاظ على سرية بيانات تسجيل الدخول الخاصة بك وعن جميع الأنشطة التي تتم تحت حسابك.</p>

              <h2 className="font-display font-bold text-2xl mb-4">4. الملكية الفكرية</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">جميع المحتويات المعروضة على الموقع بما في ذلك النصوص والصور والتصاميم والشعارات والعلامات التجارية هي ملك لشركة Brand Identity أو مرخصة لها. لا يجوز نسخ أو إعادة إنتاج أي محتوى دون إذن كتابي مسبق.</p>

              <h2 className="font-display font-bold text-2xl mb-4">5. استخدام الموقع</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">يلتزم المستخدم بعدم:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6 mr-4">
                <li>استخدام الموقع لأي غرض غير قانوني أو غير مصرح به</li>
                <li>محاولة الوصول غير المصرح به إلى أنظمتنا أو بيانات المستخدمين الآخرين</li>
                <li>نشر محتوى مسيء أو ضار أو مخالف للقانون</li>
                <li>استخدام أي برامج آلية لجمع البيانات من الموقع</li>
              </ul>

              <h2 className="font-display font-bold text-2xl mb-4">6. سياسة الدفع والأسعار</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">يتم تحديد الأسعار بناءً على طلب عرض السعر الخاص بكل مشروع. جميع الأسعار المعروضة قابلة للتغيير وتخضع لشروط العقد المبرم بين الطرفين.</p>

              <h2 className="font-display font-bold text-2xl mb-4">7. إخلاء المسؤولية</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">يتم تقديم الموقع والخدمات "كما هي" دون أي ضمانات صريحة أو ضمنية. لا نتحمل المسؤولية عن أي أضرار مباشرة أو غير مباشرة ناتجة عن استخدام الموقع.</p>

              <h2 className="font-display font-bold text-2xl mb-4">8. تسجيل الدخول عبر طرف ثالث</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">نوفر إمكانية تسجيل الدخول باستخدام حسابات Google وMeta (Facebook). عند استخدام هذه الخدمات، فإنك توافق على مشاركة بيانات ملفك الشخصي الأساسية (الاسم والبريد الإلكتروني) معنا وفقاً لسياسة الخصوصية الخاصة بنا.</p>

              <h2 className="font-display font-bold text-2xl mb-4">9. التعديلات على الشروط</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم نشر أي تغييرات على هذه الصفحة مع تحديث تاريخ "آخر تحديث".</p>

              <h2 className="font-display font-bold text-2xl mb-4">10. القانون الواجب التطبيق</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">تخضع هذه الشروط لقوانين جمهورية مصر العربية. أي نزاع ينشأ عن استخدام الموقع يخضع لاختصاص المحاكم المصرية المختصة.</p>

              <h2 className="font-display font-bold text-2xl mb-4">11. التواصل</h2>
              <p className="text-muted-foreground leading-relaxed">لأي استفسارات بخصوص هذه الشروط، يُرجى التواصل معنا عبر البريد الإلكتروني: <a href="mailto:brand.identity@alazab.com" className="text-accent hover:underline">brand.identity@alazab.com</a></p>
            </div>
          </section>
        </main>
        <Footer />
        <FloatingButtons />
      </div>
    </PageTransition>
  );
};

export default TermsPage;
