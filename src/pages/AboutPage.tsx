import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import { motion } from "framer-motion";
import { Target, Eye, Award, Lightbulb, Shield, Heart } from "lucide-react";

const values = [
  { icon: Award, title: "الجودة", desc: "نلتزم بأعلى معايير الجودة في كل تفصيلة" },
  { icon: Shield, title: "الالتزام", desc: "نحترم المواعيد ونلتزم بالاتفاقيات" },
  { icon: Lightbulb, title: "الابتكار", desc: "نبتكر حلولاً إبداعية لكل تحدي" },
  { icon: Heart, title: "الشفافية", desc: "نتعامل بوضوح وصدق مع عملائنا" },
];

const AboutPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        {/* Hero */}
        <section className="section-padding bg-primary text-primary-foreground">
          <div className="container-custom text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display font-bold text-4xl md:text-5xl mb-4"
            >
              من نحن
            </motion.h1>
            <p className="text-primary-foreground/70 font-body text-lg max-w-2xl mx-auto">
              نحن فريق من المهندسين والمصممين والفنيين المتخصصين في تحويل مساحات المولات الخالية إلى محلات جاهزة تجمع بين الجمال والوظيفة
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="section-padding bg-background">
          <div className="container-custom max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display font-bold text-3xl text-foreground mb-6 text-center">قصتنا</h2>
              <div className="gold-line mb-8" />
              <p className="text-muted-foreground font-body text-lg leading-relaxed text-center">
                نؤمن أن كل محل يحمل قصة، ونحن نساعدك على سردها من خلال تصميم يعكس هويتك ويجذب الزبائن.
                بدأنا رحلتنا عام 2010 بفريق صغير وحلم كبير، واليوم نفخر بأننا أنجزنا أكثر من 200 مشروع
                في كبرى المولات التجارية.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="section-padding bg-muted/50">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="card-elevated p-8"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/5 flex items-center justify-center mb-4">
                  <Eye className="w-7 h-7 text-accent" strokeWidth={1.5} />
                </div>
                <h3 className="font-display font-bold text-2xl text-foreground mb-3">رؤيتنا</h3>
                <p className="text-muted-foreground font-body leading-relaxed">
                  أن نكون الشريك الأول والأكثر ثقة في تجهيز المحلات التجارية في المنطقة العربية، ونقدم
                  تجارب بيع متكاملة تجمع بين الإبداع والهندسة الدقيقة.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="card-elevated p-8"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/5 flex items-center justify-center mb-4">
                  <Target className="w-7 h-7 text-accent" strokeWidth={1.5} />
                </div>
                <h3 className="font-display font-bold text-2xl text-foreground mb-3">رسالتنا</h3>
                <p className="text-muted-foreground font-body leading-relaxed">
                  نسعى لتقديم حلول تجهيز متكاملة تبدأ من التصميم وحتى التسليم النهائي، مع التركيز
                  على الجودة والالتزام بالمواعيد وتحقيق رضا العميل.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="section-padding bg-background">
          <div className="container-custom">
            <h2 className="font-display font-bold text-3xl text-foreground mb-4 text-center">قيمنا</h2>
            <div className="gold-line mb-12" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {values.map((v, i) => (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <v.icon className="w-8 h-8 text-accent" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-display font-bold text-foreground mb-1">{v.title}</h3>
                  <p className="text-muted-foreground text-sm font-body">{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingButtons />
    </div>
  );
};

export default AboutPage;
