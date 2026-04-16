import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeftRight } from "lucide-react";

const BASE = "https://objectstorage.me-jeddah-1.oraclecloud.com/n/axwmiwn72of7/b/alazab-media/o/retail-interiors/retail-interiors-";

const comparisons = [
  { before: `${BASE}040.jpg`, after: `${BASE}001.jpg`, label: "محل أزياء - مول مصر" },
  { before: `${BASE}045.jpg`, after: `${BASE}010.jpg`, label: "كافيه - كايرو فيستيفال" },
  { before: `${BASE}050.jpg`, after: `${BASE}020.jpg`, label: "محل عطور - سيتي ستارز" },
];

function Slider({ before, after, label }: { before: string; after: string; label: string }) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current || !isDragging.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.min(100, Math.max(0, (x / rect.width) * 100));
    setPosition(pct);
  }, []);

  const handlePointerDown = useCallback(() => {
    isDragging.current = true;
  }, []);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative aspect-[4/3] rounded-2xl overflow-hidden cursor-col-resize select-none group"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerMove={(e) => handleMove(e.clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
    >
      {/* After (full) */}
      <img src={after} alt={`${label} - بعد`} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />

      {/* Before (clipped) */}
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 0 0 ${position}%)` }}>
        <img src={before} alt={`${label} - قبل`} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-accent z-10"
        style={{ left: `${position}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-accent flex items-center justify-center shadow-lg">
          <ArrowLeftRight className="w-5 h-5 text-accent-foreground" />
        </div>
      </div>

      {/* Labels */}
      <span className="absolute top-4 right-4 bg-accent text-accent-foreground text-xs font-display font-bold px-3 py-1 rounded-full z-20">
        بعد
      </span>
      <span className="absolute top-4 left-4 bg-foreground/80 text-background text-xs font-display font-bold px-3 py-1 rounded-full z-20">
        قبل
      </span>

      {/* Project label */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4 z-20">
        <p className="text-primary-foreground font-display font-bold text-sm">{label}</p>
      </div>
    </div>
  );
}

export const BeforeAfter = () => {
  return (
    <section className="section-padding bg-muted/50">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-14"
        >
          <p className="text-accent font-display font-bold text-sm mb-2">شاهد الفرق بنفسك</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
            تحوّل المساحة.. قبل وبعد
          </h2>
          <div className="gold-line" />
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto font-body">
            اسحب المؤشر لتكتشف كيف نحوّل المساحات الخالية إلى محلات تجارية مميزة
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {comparisons.map((comp, i) => (
            <motion.div
              key={comp.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.15 }}
            >
              <Slider {...comp} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
