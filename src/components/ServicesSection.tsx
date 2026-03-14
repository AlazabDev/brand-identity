import { motion } from "framer-motion";
import { Hammer, GlassWater, Archive, Palette, KeyRound } from "lucide-react";

const services = [
  {
    icon: Hammer,
    title: "التعديلات الإنشائية والتأسيس",
    desc: "هدم وإعادة بناء، تمديدات كهربائية مخفية، سباكة للمحلات الغذائية، تأسيس أنظمة الإطفاء والإنذار بما يتوافق مع اشتراطات المولات والدفاع المدني",
  },
  {
    icon: GlassWater,
    title: "تصنيع وحدات العرض",
    desc: "تصميم وتصنيع وحدات عرض مخصصة حسب هوية الماركة - خامات عالية الجودة (خشب، زجاج، معدن، أكريليك) - إضاءة LED مدمجة لإبراز المنتجات",
  },
  {
    icon: Archive,
    title: "وحدات التخزين",
    desc: "حلول تخزين ذكية خلف الكواليس - غرف تخزين خلفية منظمة - أدراج وخزائن مدمجة في التصميم العام للمحل - استخدام أمثل للمساحات الضيقة",
  },
  {
    icon: Palette,
    title: "الوحدات الديكورية والواجهات",
    desc: "تنفيذ واجهات المحلات وفق هوية العلامة التجارية - تصنيع اللافتات المضيئة (نيون، LED) - أعمال الجبس بورد والأسقف المعلقة - أرضيات مميزة",
  },
  {
    icon: KeyRound,
    title: "التشطيب والتسليم النهائي",
    desc: "دهانات ديكورية عالية الجودة - تركيب الكاميرات وأنظمة الأمان - تجهيز نقاط البيع (POS) - النظافة النهائية والتسليم على المفتاح جاهز للتشغيل",
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="section-padding bg-background">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
            خدماتنا من الألف إلى الياء
          </h2>
          <div className="gold-line" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.1 }}
              className="card-elevated p-8 group relative overflow-hidden"
            >
              {/* Gold bottom line on hover */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />

              <div className="w-14 h-14 rounded-xl bg-primary/5 flex items-center justify-center mb-5">
                <service.icon className="w-7 h-7 text-accent" strokeWidth={1.5} />
              </div>
              <h3 className="font-display font-bold text-lg text-foreground mb-3">
                {service.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed font-body">
                {service.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
