import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Eye } from "lucide-react";

const HERO_IMAGE = "https://objectstorage.me-jeddah-1.oraclecloud.com/n/axwmiwn72of7/b/alazab-media/o/retail-interiors/retail-interiors-001.jpg";

const stats = [
  { value: 15, suffix: "+", label: "سنة خبرة" },
  { value: 120, suffix: "+", label: "مشروع منفذ" },
  { value: 50, suffix: "+", label: "محل في المولات" },
  { value: 99, suffix: "%", label: "دقة تسليم" },
];

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 2000;
          const step = Math.ceil(target / (duration / 16));
          let current = 0;
          const interval = setInterval(() => {
            current += step;
            if (current >= target) {
              current = target;
              clearInterval(interval);
            }
            setCount(current);
          }, 16);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="font-display font-bold text-3xl md:text-4xl text-accent">
      {count}{suffix}
    </span>
  );
}

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image with slow zoom */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1 }}
        animate={{ scale: 1.1 }}
        transition={{ duration: 10, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
      >
        <img
          src={HERO_IMAGE}
          alt="محل تجاري فاخر داخل مول"
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30" />

      {/* Content */}
      <div className="relative z-10 container-custom px-4 lg:px-8 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-3xl"
        >
          <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-primary-foreground leading-tight mb-6">
            من التأسيس إلى التسليم النهائي..
            <br />
            <span className="text-accent">محل جاهز في المول</span>
          </h1>
          <p className="text-primary-foreground/80 text-lg md:text-xl font-body mb-8 max-w-2xl">
            متخصصون في تجهيز المحلات التجارية داخل المولات - تصميم، تصنيع، تنفيذ
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/quote"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-accent text-accent-foreground font-display font-bold text-base hover:-translate-y-0.5 active:scale-95 transition-all"
            >
              اطلب عرض سعر
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg border-2 border-primary-foreground/30 text-primary-foreground font-display font-bold text-base hover:bg-primary-foreground/10 transition-all"
            >
              <Eye className="w-5 h-5" />
              شاهد أعمالنا
            </Link>
          </div>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 md:mt-24 grid grid-cols-2 md:grid-cols-4 gap-6 bg-card/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-primary-foreground/10"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <Counter target={stat.value} suffix={stat.suffix} />
              <p className="text-primary-foreground/70 text-sm mt-1 font-body">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/30 flex items-start justify-center p-1.5">
          <div className="w-1.5 h-3 rounded-full bg-accent" />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
