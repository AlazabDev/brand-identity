import { motion } from "framer-motion";
import { ShieldCheck, Clock, Award, Headphones, Banknote, FileCheck } from "lucide-react";

const indicators = [
  {
    icon: ShieldCheck,
    title: "ضمان 5 سنوات",
    desc: "ضمان شامل على جميع التشطيبات والتركيبات",
  },
  {
    icon: Clock,
    title: "تسليم في الموعد",
    desc: "التزام تعاقدي مع غرامة تأخير لراحتك",
  },
  {
    icon: Award,
    title: "خامات معتمدة",
    desc: "نستخدم خامات بشهادات جودة دولية فقط",
  },
  {
    icon: Headphones,
    title: "دعم ما بعد التسليم",
    desc: "فريق صيانة متاح 24/7 لخدمتك بعد الافتتاح",
  },
  {
    icon: Banknote,
    title: "أسعار تنافسية",
    desc: "عروض أسعار شفافة بدون تكاليف مخفية",
  },
  {
    icon: FileCheck,
    title: "تصاريح ومطابقات",
    desc: "نتولى استخراج جميع التصاريح من المول والدفاع المدني",
  },
];

export const TrustIndicators = () => {
  return (
    <section className="section-padding bg-primary relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 35px, hsl(var(--primary-foreground)) 35px, hsl(var(--primary-foreground)) 36px)",
          }}
        />
      </div>

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-14"
        >
          <p className="text-accent font-display font-bold text-sm mb-2">لماذا يثق بنا أكثر من 120 عميل؟</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-primary-foreground">
            ضمانات تجعلك تطمئن
          </h2>
          <div className="w-20 h-1 bg-accent mx-auto mt-4 rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {indicators.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.08 }}
              className="flex items-start gap-4 bg-primary-foreground/5 backdrop-blur-sm rounded-2xl p-6 border border-primary-foreground/10 hover:border-accent/30 transition-colors"
            >
              <div className="shrink-0 w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <item.icon className="w-6 h-6 text-accent" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-display font-bold text-primary-foreground mb-1">
                  {item.title}
                </h3>
                <p className="text-primary-foreground/60 text-sm font-body leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
