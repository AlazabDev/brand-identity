import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import PageMeta from "@/components/PageMeta";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const PrivacyPage = () => {
  return (
    <PageTransition>
      <PageMeta
        title="سياسة الخصوصية"
        description="سياسة الخصوصية لشركة Brand Identity - كيف نجمع ونستخدم ونحمي بياناتك الشخصية."
        canonical="https://brand-identity.alazab.com/privacy"
      />
      <div className="min-h-screen">
        <Header />
        <main id="main-content" className="pt-20">
          <section className="section-padding bg-primary text-primary-foreground">
            <div className="container-custom text-center">
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display font-bold text-4xl md:text-5xl mb-4">
                سياسة الخصوصية
              </motion.h1>
              <p className="text-primary-foreground/70 font-body">آخر تحديث: {new Date().toLocaleDateString("ar-EG")}</p>
            </div>
          </section>
          <section className="section-padding bg-background">
            <div className="container-custom max-w-3xl prose prose-lg font-body text-foreground" dir="rtl">
              <h2 className="font-display font-bold text-2xl mb-4">مقدمة</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">نحن في Brand Identity ("الشركة"، "نحن") نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح هذه السياسة كيفية جمع واستخدام وحماية المعلومات عند استخدامك لموقعنا الإلكتروني وخدماتنا.</p>

              <h2 className="font-display font-bold text-2xl mb-4">المعلومات التي نجمعها</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">نجمع الأنواع التالية من المعلومات:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6 mr-4">
                <li><strong>معلومات الهوية:</strong> الاسم، البريد الإلكتروني، رقم الهاتف</li>
                <li><strong>معلومات المشروع:</strong> تفاصيل المحل التجاري، الموقع، نوع النشاط</li>
                <li><strong>بيانات تسجيل الدخول:</strong> عند استخدام Google أو Meta (Facebook) لتسجيل الدخول، نحصل على اسمك وبريدك الإلكتروني وصورة الملف الشخصي</li>
                <li><strong>بيانات الاستخدام:</strong> معلومات تلقائية مثل عنوان IP ونوع المتصفح وصفحات الزيارة</li>
              </ul>

              <h2 className="font-display font-bold text-2xl mb-4">كيفية استخدام المعلومات</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">نستخدم معلوماتك الشخصية للأغراض التالية:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6 mr-4">
                <li>التواصل معك بشأن خدماتنا وتقديم عروض الأسعار</li>
                <li>إدارة حسابك وتسجيل الدخول</li>
                <li>تحسين تجربتك على موقعنا</li>
                <li>إرسال تحديثات حول مشاريعك (بموافقتك)</li>
                <li>الامتثال للالتزامات القانونية</li>
              </ul>

              <h2 className="font-display font-bold text-2xl mb-4">مشاركة المعلومات مع أطراف ثالثة</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">لا نبيع بياناتك الشخصية. قد نشارك معلوماتك مع:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6 mr-4">
                <li><strong>Google:</strong> لخدمات تسجيل الدخول والتحليلات</li>
                <li><strong>Meta (Facebook):</strong> لخدمات تسجيل الدخول</li>
                <li><strong>مزودي الخدمات:</strong> الذين يساعدوننا في تشغيل الموقع وتقديم خدماتنا</li>
              </ul>

              <h2 className="font-display font-bold text-2xl mb-4">حماية المعلومات</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">نتخذ إجراءات أمنية مناسبة لحماية بياناتك من الوصول غير المصرح به أو التعديل أو الكشف، بما في ذلك التشفير والتخزين الآمن وتقييد الوصول.</p>

              <h2 className="font-display font-bold text-2xl mb-4">حقوقك</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">يحق لك:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6 mr-4">
                <li>الوصول إلى بياناتك الشخصية المخزنة لدينا</li>
                <li>تصحيح أي معلومات غير دقيقة</li>
                <li>طلب حذف بياناتك (راجع <Link to="/data-deletion" className="text-accent hover:underline">صفحة حذف البيانات</Link>)</li>
                <li>سحب موافقتك على معالجة البيانات</li>
                <li>طلب نقل بياناتك</li>
              </ul>

              <h2 className="font-display font-bold text-2xl mb-4">الاحتفاظ بالبيانات</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">نحتفظ ببياناتك طالما كان ذلك ضرورياً لتقديم خدماتنا أو كما يقتضيه القانون. يمكنك طلب حذف بياناتك في أي وقت.</p>

              <h2 className="font-display font-bold text-2xl mb-4">التعديلات على السياسة</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">نحتفظ بالحق في تحديث هذه السياسة. سنخطرك بأي تغييرات جوهرية عبر الموقع أو البريد الإلكتروني.</p>

              <h2 className="font-display font-bold text-2xl mb-4">التواصل</h2>
              <p className="text-muted-foreground leading-relaxed">لأي استفسارات حول سياسة الخصوصية، تواصل معنا عبر: <a href="mailto:brand.identity@alazab.com" className="text-accent hover:underline">brand.identity@alazab.com</a></p>
            </div>
          </section>
        </main>
        <Footer />
        <FloatingButtons />
      </div>
    </PageTransition>
  );
};

export default PrivacyPage;
