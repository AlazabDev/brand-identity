import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import PageMeta from "@/components/PageMeta";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";
import { Calendar, ArrowLeft } from "lucide-react";

const BASE = "https://objectstorage.me-jeddah-1.oraclecloud.com/n/axwmiwn72of7/b/alazab-media/o/retail-interiors/retail-interiors-";

const articles = [
  { id: 1, title: "أفكار ذكية لاستغلال المساحات الصغيرة في الأكشاك", excerpt: "اكتشف كيف تحوّل كشك صغير إلى تجربة تسوق مميزة", img: `${BASE}025.jpg`, date: "15 مارس 2026", cat: "تصميم" },
  { id: 2, title: "إضاءة المحلات التجارية: دليلك الشامل لاختيار الإضاءة المناسبة", excerpt: "تعرف على أنواع الإضاءة المناسبة لكل نوع من المحلات", img: `${BASE}030.jpg`, date: "10 مارس 2026", cat: "إضاءة" },
  { id: 3, title: "اشتراطات الدفاع المدني في المولات: ما يجب أن تعرفه", excerpt: "كل ما تحتاج معرفته عن متطلبات السلامة والأمان", img: `${BASE}035.jpg`, date: "5 مارس 2026", cat: "تراخيص" },
  { id: 4, title: "اختيار الخامات المثالية لمحلات الملابس", excerpt: "دليل شامل لاختيار أفضل المواد لتجهيز محلات الأزياء", img: `${BASE}040.jpg`, date: "1 مارس 2026", cat: "مواد" },
  { id: 5, title: "تصميم واجهات المحلات لجذب العملاء", excerpt: "كيف تجعل واجهة محلك هي عامل الجذب الأول", img: `${BASE}005.jpg`, date: "25 فبراير 2026", cat: "تصميم" },
  { id: 6, title: "نصائح لتقليل تكاليف تجهيز المحل", excerpt: "طرق ذكية لتوفير الميزانية دون التنازل عن الجودة", img: `${BASE}012.jpg`, date: "20 فبراير 2026", cat: "نصائح" },
];

const BlogPage = () => {
  return (
    <PageTransition>
      <PageMeta
        title="المدونة"
        description="أحدث اتجاهات تصميم وتجهيز المحلات التجارية - نصائح، أفكار، واشتراطات المولات من خبراء Brand Identity."
        canonical="https://brand-identity.alazab.com/blog"
      />
      <div className="min-h-screen">
        <Header />
        <main id="main-content" className="pt-20">
          <section className="section-padding bg-primary text-primary-foreground">
            <div className="container-custom text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display font-bold text-4xl md:text-5xl mb-4"
              >
                المدونة
              </motion.h1>
              <p className="text-primary-foreground/70 font-body text-lg">أحدث اتجاهات تصميم المحلات التجارية</p>
            </div>
          </section>

          <section className="section-padding bg-background">
            <div className="container-custom">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article, i) => (
                  <motion.article
                    key={article.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="card-elevated overflow-hidden group"
                  >
                    <div className="aspect-[16/10] overflow-hidden">
                      <img src={article.img} alt={article.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 image-crisp" loading="lazy" />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs font-display font-bold text-accent bg-accent/10 px-3 py-1 rounded-full">{article.cat}</span>
                        <span className="flex items-center gap-1 text-muted-foreground text-xs font-body">
                          <Calendar className="w-3.5 h-3.5" /> {article.date}
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-foreground mb-2 line-clamp-2">{article.title}</h3>
                      <p className="text-muted-foreground text-sm font-body mb-4 line-clamp-2">{article.excerpt}</p>
                      <span className="inline-flex items-center gap-1 text-accent text-sm font-display font-bold cursor-pointer hover:gap-2 transition-all">
                        اقرأ المزيد <ArrowLeft className="w-4 h-4" />
                      </span>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          </section>
        </main>
        <Footer />
        <FloatingButtons />
      </div>
    </PageTransition>
  );
};

export default BlogPage;