import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import PageMeta from "@/components/PageMeta";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const categories = [
  {
    title: "استفسارات عامة",
    questions: [
      { q: "ما هي خدماتكم الرئيسية؟", a: "نقدم خدمات تجهيز متكاملة تشمل التعديلات الإنشائية، تصنيع وحدات العرض والتخزين، الديكور والواجهات، والتشطيب والتسليم النهائي." },
      { q: "هل تعملون في جميع المولات؟", a: "نعم، لدينا خبرة في العمل مع مختلف المولات التجارية ونفهم اشتراطات ومتطلبات كل مول." },
    ],
  },
  {
    title: "التصميم والاستشارات",
    questions: [
      { q: "هل تقدمون تصميمات 3D قبل التنفيذ؟", a: "نعم، نقدم تصميمات ثلاثية الأبعاد احترافية لتتمكن من رؤية محلك قبل بدء التنفيذ." },
      { q: "هل يمكنني تعديل التصميم بعد الاعتماد؟", a: "نعم، يمكن إجراء تعديلات على التصميم خلال مرحلة التصميم الأولي وفقاً للاتفاق." },
    ],
  },
  {
    title: "التنفيذ والمواد",
    questions: [
      { q: "ما هي مدة تنفيذ المشروع؟", a: "تختلف المدة حسب حجم المشروع والخدمات المطلوبة، عادةً بين 3-8 أسابيع." },
      { q: "ما هي الخامات المستخدمة؟", a: "نستخدم خامات عالية الجودة من خشب، زجاج، معدن، أكريليك، وغيرها حسب التصميم المطلوب." },
    ],
  },
  {
    title: "الضمان والصيانة",
    questions: [
      { q: "هل هناك ضمان على الأعمال؟", a: "نعم، نقدم ضمان شامل على جميع الأعمال المنفذة يتراوح بين سنة إلى 3 سنوات حسب نوع العمل." },
      { q: "هل تقدمون خدمات صيانة بعد التسليم؟", a: "نعم، نقدم عقود صيانة دورية اختيارية لضمان استمرار جودة التجهيزات." },
    ],
  },
];

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-b-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-4 text-right" aria-expanded={open}>
        <span className="font-display font-bold text-foreground text-sm">{q}</span>
        <ChevronDown className={`w-5 h-5 text-accent shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="pb-4">
          <p className="text-muted-foreground text-sm font-body leading-relaxed">{a}</p>
        </motion.div>
      )}
    </div>
  );
}

const FAQPage = () => {
  return (
    <PageTransition>
      <PageMeta
        title="الأسئلة الشائعة"
        description="إجابات على أكثر الأسئلة شيوعاً حول خدمات تجهيز المحلات التجارية من Brand Identity."
        canonical="https://brand-identity.alazab.com/faq"
      />
      <div className="min-h-screen">
        <Header />
        <main id="main-content" className="pt-20">
          <section className="section-padding bg-primary text-primary-foreground">
            <div className="container-custom text-center">
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display font-bold text-4xl md:text-5xl mb-4">
                الأسئلة الشائعة
              </motion.h1>
            </div>
          </section>

          <section className="section-padding bg-background">
            <div className="container-custom max-w-3xl space-y-10">
              {categories.map((cat) => (
                <div key={cat.title}>
                  <h2 className="font-display font-bold text-xl text-foreground mb-4">{cat.title}</h2>
                  <div className="card-elevated p-6">
                    {cat.questions.map((item) => (
                      <AccordionItem key={item.q} {...item} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
        <Footer />
        <FloatingButtons />
      </div>
    </PageTransition>
  );
};

export default FAQPage;