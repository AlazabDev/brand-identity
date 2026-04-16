import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "كم يستغرق تجهيز محل تجاري داخل مول؟",
    a: "يعتمد على حجم المحل وطبيعة الأعمال المطلوبة. بشكل عام، تتراوح المدة بين 30 إلى 75 يوم عمل من بداية الموافقات حتى التسليم النهائي. نلتزم بجدول زمني واضح منذ البداية.",
  },
  {
    q: "هل تتعاملون مع إدارة المول مباشرة؟",
    a: "نعم، فريقنا يتولى التنسيق الكامل مع إدارة المول — من استخراج تصاريح العمل إلى المعاينات الدورية وتقديم المخططات المطلوبة وفق اشتراطاتهم.",
  },
  {
    q: "هل يمكنكم العمل أثناء ساعات عمل المول؟",
    a: "نعمل وفق المواعيد المحددة من إدارة المول (غالباً بعد إغلاق المول أو قبل الافتتاح). لدينا فرق عمل بنظام الورديات لتنفيذ أكبر قدر ممكن من الأعمال دون التأثير على حركة المول.",
  },
  {
    q: "ما هي تكلفة تجهيز محل في المول؟",
    a: "تختلف التكلفة حسب مساحة المحل ونوع النشاط ومستوى التشطيبات المطلوبة. نقدم عروض أسعار مفصلة وشفافة بعد المعاينة الميدانية. يمكنك طلب عرض سعر مجاني الآن.",
  },
];

export const FAQPreview = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          {/* Right side - heading */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="lg:col-span-2"
          >
            <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
              <HelpCircle className="w-7 h-7 text-accent" />
            </div>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
              أسئلة شائعة
            </h2>
            <p className="text-muted-foreground font-body leading-relaxed mb-6">
              إجابات سريعة على أكثر الأسئلة التي يطرحها عملاؤنا. لم تجد إجابتك؟ تواصل معنا مباشرة.
            </p>
            <Link
              to="/faq"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-accent-foreground font-display font-bold text-sm hover:-translate-y-0.5 active:scale-95 transition-all"
            >
              جميع الأسئلة
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Left side - accordion */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="lg:col-span-3"
          >
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="card-elevated px-6 border-none"
                >
                  <AccordionTrigger className="font-display font-bold text-foreground text-right hover:no-underline py-5 text-base">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground font-body leading-relaxed pb-5">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
