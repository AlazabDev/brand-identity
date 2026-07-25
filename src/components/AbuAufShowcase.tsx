import { motion } from "framer-motion";
import { Award, Store, MapPin, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

// Featured project images sourced from public/upload
const uploadImages = [
  "AbuAuf_AlRehab_002.jpg",
  "AbuAuf_AlRehab_004.jpg",
  "AbuAuf_AlRehab_006.jpg",
  "AbuAuf_AlRehab_008.jpg",
  "AbuAuf_AlRehab_010.jpg",
  "AbuAuf_AlRehab_012.jpg",
  "abuauf_10.jpg",
  "abuauf_13.jpg",
  "abuauf_15.jpg",
  "units-005.jpg",
  "units-010.jpg",
  "units-013.jpg",
].map((name) => `/upload/${encodeURIComponent(name)}`);

const featured = uploadImages.slice(0, 9);

const AbuAufShowcase = () => {
  return (
    <section className="section-padding bg-primary relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, hsl(var(--accent)) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent font-display font-bold text-sm mb-6">
            <Award className="w-5 h-5" />
            مشاريع مختارة من أعمالنا
          </div>
          <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-primary-foreground">
            نماذج من تجهيزات المولات
          </h2>
          <div className="w-20 h-1 bg-accent mx-auto mt-4 rounded-full" />
          <p className="text-primary-foreground/80 mt-6 max-w-3xl mx-auto font-body text-lg leading-relaxed">
            ننفّذ محلات وفروع تجزئة داخل كبرى المولات والمراكز التجارية في مصر،
            بمعايير جودة عالية والتزام كامل باشتراطات الدفاع المدني وإدارات
            المولات. فيما يلي نماذج مختارة من مشاريع منفّذة على أرض الواقع.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {[
            { icon: Store, num: "مئات", label: "الفروع المنفّذة" },
            { icon: MapPin, num: "عشرات", label: "المولات والمراكز" },
            { icon: Sparkles, num: "متعدد", label: "قطاعات التجزئة" },
            { icon: Award, num: "عالية", label: "معايير التنفيذ" },
          ].map((stat, i) => (
            <div
              key={i}
              className="text-center bg-primary-foreground/5 backdrop-blur-sm rounded-2xl p-6 border border-primary-foreground/10"
            >
              <stat.icon className="w-8 h-8 text-accent mx-auto mb-3" />
              <p className="font-display font-black text-2xl text-accent">
                {stat.num}
              </p>
              <p className="text-primary-foreground/70 text-sm font-body mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-10">
          {featured.map((url, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.06 }}
              className="relative rounded-xl overflow-hidden aspect-square sm:aspect-[4/3] group"
            >
              <img
                src={url}
                alt={`نموذج مشروع منفّذ ${i + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="bg-primary-foreground/5 backdrop-blur-sm rounded-2xl p-8 border border-primary-foreground/10 text-center max-w-3xl mx-auto mb-8"
        >
          <p className="text-primary-foreground/90 font-body text-lg leading-relaxed italic">
            "الالتزام بالمواعيد وجودة التنفيذ وفهم متطلبات العلامة التجارية هي
            القيم التي نبني عليها كل مشروع، ونحرص على تكرارها في كل فرع نُسلّمه."
          </p>
          <p className="text-accent font-display font-bold mt-4">
            — فريق Brand Identity
          </p>
        </motion.div>

        <div className="text-center">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-accent text-accent-foreground font-display font-bold text-sm hover:-translate-y-0.5 active:scale-95 transition-all"
          >
            تصفّح جميع المشاريع
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AbuAufShowcase;
