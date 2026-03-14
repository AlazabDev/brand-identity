import { motion } from "framer-motion";
import { Award, Store, MapPin, Handshake } from "lucide-react";
import { Link } from "react-router-dom";
import { galleryCategories } from "@/data/galleryData";

// Get Abu Auf images from gallery data
const abuAufImages = galleryCategories.find(c => c.id === "abuauf")?.images || [];
const featured = abuAufImages.slice(0, 6);

const AbuAufShowcase = () => {
  return (
    <section className="section-padding bg-primary relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, hsl(var(--accent)) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }} />
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
            شريك النجاح الاستراتيجي
          </div>
          <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-primary-foreground">
            أبو عوف × Brand Identity
          </h2>
          <div className="w-20 h-1 bg-accent mx-auto mt-4 rounded-full" />
          <p className="text-primary-foreground/80 mt-6 max-w-3xl mx-auto font-body text-lg leading-relaxed">
            نفخر بشراكتنا الاستراتيجية مع <strong className="text-accent">أبو عوف</strong> — العلامة التجارية الرائدة في مصر والشرق الأوسط.
            قمنا بتجهيز وتنفيذ أكثر من <strong className="text-accent">270 فرعاً</strong> في مختلف المولات والمواقع التجارية بأعلى معايير الجودة والاحترافية.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {[
            { icon: Store, num: "+270", label: "فرع منفّذ" },
            { icon: MapPin, num: "+50", label: "مول ومركز تجاري" },
            { icon: Handshake, num: "+10", label: "سنوات شراكة" },
            { icon: Award, num: "100%", label: "رضا العميل" },
          ].map((stat, i) => (
            <div key={i} className="text-center bg-primary-foreground/5 backdrop-blur-sm rounded-2xl p-6 border border-primary-foreground/10">
              <stat.icon className="w-8 h-8 text-accent mx-auto mb-3" />
              <p className="font-display font-black text-3xl text-accent">{stat.num}</p>
              <p className="text-primary-foreground/70 text-sm font-body mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Image Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-10">
          {featured.map((url, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.08 }}
              className="relative rounded-xl overflow-hidden aspect-[4/3] group"
            >
              <img
                src={url}
                alt={`أبو عوف - فرع ${i + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="bg-primary-foreground/5 backdrop-blur-sm rounded-2xl p-8 border border-primary-foreground/10 text-center max-w-3xl mx-auto mb-8"
        >
          <p className="text-primary-foreground/90 font-body text-lg leading-relaxed italic">
            "شركة Brand Identity هي الشريك المثالي لنا في تجهيز فروعنا. الالتزام بالمواعيد، جودة التنفيذ، وفهمهم العميق لمتطلبات العلامة التجارية جعلهم الخيار الأول لنا على مدار سنوات طويلة."
          </p>
          <p className="text-accent font-display font-bold mt-4">— إدارة أبو عوف</p>
        </motion.div>

        <div className="text-center">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-accent text-accent-foreground font-display font-bold text-sm hover:-translate-y-0.5 active:scale-95 transition-all"
          >
            شاهد جميع مشاريع أبو عوف
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AbuAufShowcase;
