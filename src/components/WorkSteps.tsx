import { motion } from "framer-motion";
import { MapPin, Box, FileText, Wrench, CheckCircle } from "lucide-react";

const steps = [
  { icon: MapPin, title: "استشارة وزيارة ميدانية", desc: "فريقنا يزور الموقع ويأخذ المقاسات بدقة" },
  { icon: Box, title: "تصميم أولي (3D)", desc: "نقدم لك تصميماً ثلاثي الأبعاد للمحل قبل التنفيذ" },
  { icon: FileText, title: "اعتماد العروض والمواد", desc: "نحدد الخامات والتكاليف بدقة شفافة" },
  { icon: Wrench, title: "التنفيذ والتصنيع", desc: "نبدأ العمل في الورشة والموقع وفق الجدول الزمني" },
  { icon: CheckCircle, title: "التركيب والتسليم", desc: "نركب القطع ونسلم المحل جاهزاً بالكامل" },
];

const WorkSteps = () => {
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
            من الفكرة إلى الافتتاح في 5 خطوات
          </h2>
          <div className="gold-line" />
        </motion.div>

        <div className="relative">
          {/* Dotted line connector */}
          <div className="hidden lg:block absolute top-12 right-[10%] left-[10%] h-0.5 border-t-2 border-dashed border-accent/40" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.1 }}
                className="text-center relative"
              >
                <div className="w-24 h-24 rounded-full bg-card flex items-center justify-center mx-auto mb-4 ring-4 ring-accent/20 relative z-10"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <step.icon className="w-10 h-10 text-accent" strokeWidth={1.5} />
                </div>
                <span className="inline-block bg-accent text-accent-foreground text-xs font-display font-bold px-3 py-1 rounded-full mb-3">
                  الخطوة {i + 1}
                </span>
                <h3 className="font-display font-bold text-base text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm font-body">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkSteps;
