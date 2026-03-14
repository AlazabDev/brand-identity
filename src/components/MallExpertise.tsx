import { motion } from "framer-motion";
import { Shield, Maximize, Clock } from "lucide-react";

const cards = [
  {
    icon: Shield,
    title: "فهم تعقيدات المولات",
    desc: "خبرة في التعامل مع إدارات المولات، استخراج التصاريح، الالتزام بمواعيد العمل الرسمية، تنفيذ الأعمال دون إزعاج الحركة التجارية",
  },
  {
    icon: Maximize,
    title: "تصميمات مرنة وجذابة",
    desc: "نقدم تصاميم تتناسب مع مختلف المساحات (محلات صغيرة - أكشاك - مساحات مفتوحة) مع تحقيق أقصى استفادة من كل متر مربع",
  },
  {
    icon: Clock,
    title: "التزام بمواعيد التسليم",
    desc: "ندرك أهمية الافتتاح في الوقت المحدد للموسم أو المناسبات - فريق عمل مدرب يعمل بنظام الورديات لضمان السرعة والإتقان",
  },
];

const MallExpertise = () => {
  return (
    <section className="section-padding bg-muted/50">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
            لماذا نحن الخيار الأمثل لمحلات المولات؟
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto font-body">
            العمل داخل المولات يتطلب خبرة خاصة وتعقيدات فنية وإدارية.. نحن نفهم ذلك بعمق
          </p>
          <div className="gold-line" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.15 }}
              className="card-elevated p-8 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-6">
                <card.icon className="w-8 h-8 text-accent" strokeWidth={1.5} />
              </div>
              <h3 className="font-display font-bold text-xl text-foreground mb-3">
                {card.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed font-body">
                {card.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MallExpertise;
