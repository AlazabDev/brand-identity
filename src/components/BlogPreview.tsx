import { motion } from "framer-motion";
import { ArrowLeft, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const BASE = "https://objectstorage.me-jeddah-1.oraclecloud.com/n/axwmiwn72of7/b/alazab-media/o/retail-interiors/retail-interiors-";

const articles = [
  {
    id: 1,
    title: "أفكار ذكية لاستغلال المساحات الصغيرة في الأكشاك",
    excerpt: "اكتشف كيف تحوّل كشك صغير إلى تجربة تسوق مميزة تجذب العملاء وتعرض المنتجات بأفضل شكل",
    img: `${BASE}025.jpg`,
    date: "15 مارس 2026",
  },
  {
    id: 2,
    title: "إضاءة المحلات التجارية: دليلك الشامل",
    excerpt: "تعرف على أنواع الإضاءة المناسبة لكل نوع من المحلات التجارية وكيف تؤثر على تجربة العميل",
    img: `${BASE}030.jpg`,
    date: "10 مارس 2026",
  },
  {
    id: 3,
    title: "اشتراطات الدفاع المدني في المولات",
    excerpt: "كل ما تحتاج معرفته عن متطلبات السلامة والأمان عند تجهيز محلك داخل المول",
    img: `${BASE}035.jpg`,
    date: "5 مارس 2026",
  },
];

const BlogPreview = () => {
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
            أحدث اتجاهات تصميم المحلات
          </h2>
          <div className="gold-line" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((article, i) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.1 }}
              className="card-elevated overflow-hidden group"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={article.img}
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 image-crisp"
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-body mb-3">
                  <Calendar className="w-3.5 h-3.5" />
                  {article.date}
                </div>
                <h3 className="font-display font-bold text-foreground mb-2 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-muted-foreground text-sm font-body line-clamp-2 mb-4">
                  {article.excerpt}
                </p>
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-1 text-accent text-sm font-display font-bold hover:gap-2 transition-all"
                >
                  اقرأ المزيد
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogPreview;
