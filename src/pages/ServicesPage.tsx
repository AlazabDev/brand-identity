import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import { motion } from "framer-motion";
import { Hammer, GlassWater, Archive, Palette, KeyRound, CheckCircle } from "lucide-react";

const services = [
  {
    icon: Hammer,
    title: "التعديلات الإنشائية والتأسيس",
    desc: "هدم وإعادة بناء، تمديدات كهربائية مخفية، سباكة للمحلات الغذائية، تأسيس أنظمة الإطفاء والإنذار بما يتوافق مع اشتراطات المولات والإدارة العامة للدفاع المدني",
    details: ["هدم وإعادة بناء الجدران", "تمديدات كهربائية مخفية", "أعمال السباكة للمحلات الغذائية", "أنظمة الإطفاء والإنذار", "أنظمة التكييف المركزي"],
  },
  {
    icon: GlassWater,
    title: "تصنيع وحدات العرض",
    desc: "تصميم وتصنيع وحدات عرض مخصصة حسب هوية الماركة بخامات عالية الجودة",
    details: ["رفوف وواجهات زجاجية", "ستاندات عرض مخصصة", "إضاءة LED مدمجة", "خامات خشب ومعدن وأكريليك", "تنفيذ دقيق حسب المساحات"],
  },
  {
    icon: Archive,
    title: "وحدات التخزين",
    desc: "حلول تخزين ذكية تستغل كل سنتيمتر من المساحة المتاحة",
    details: ["غرف تخزين خلفية منظمة", "أدراج وخزائن مدمجة", "أنظمة تخزين ذكية", "استغلال المساحات الضيقة", "حلول تخزين مخفية"],
  },
  {
    icon: Palette,
    title: "الوحدات الديكورية والواجهات",
    desc: "تنفيذ واجهات المحلات وفق هوية العلامة التجارية بأعلى جودة",
    details: ["واجهات محلات مميزة", "لافتات مضيئة (نيون، LED)", "أعمال الجبس بورد", "أسقف معلقة مميزة", "أرضيات (سيراميك، باركيه، إيبوكسي)"],
  },
  {
    icon: KeyRound,
    title: "التشطيب والتسليم النهائي",
    desc: "تسليم المحل جاهزاً بالكامل على المفتاح للتشغيل الفوري",
    details: ["دهانات ديكورية عالية الجودة", "كاميرات وأنظمة أمان", "تجهيز نقاط البيع (POS)", "النظافة النهائية الشاملة", "تسليم على المفتاح"],
  },
];

const ServicesPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <section className="section-padding bg-primary text-primary-foreground">
          <div className="container-custom text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display font-bold text-4xl md:text-5xl mb-4"
            >
              خدماتنا المتكاملة
            </motion.h1>
            <p className="text-primary-foreground/70 font-body text-lg max-w-2xl mx-auto">
              من الألف إلى الياء - نقدم لك حلول تجهيز شاملة لمحلك التجاري
            </p>
          </div>
        </section>

        <section className="section-padding bg-background">
          <div className="container-custom space-y-12">
            {services.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.1 }}
                className="card-elevated p-8 md:p-10"
              >
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="w-20 h-20 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0">
                    <service.icon className="w-10 h-10 text-accent" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-display font-bold text-2xl text-foreground mb-3">{service.title}</h2>
                    <p className="text-muted-foreground font-body mb-6">{service.desc}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {service.details.map((detail) => (
                        <div key={detail} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-accent shrink-0" />
                          <span className="text-foreground text-sm font-body">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
      <FloatingButtons />
    </div>
  );
};

export default ServicesPage;
