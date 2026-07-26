import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { X, ChevronLeft, ChevronRight, ZoomIn, Images, ArrowLeft } from "lucide-react";
import { galleryCategories, totalImageCount } from "@/data/galleryData";

const PREVIEW_COUNT = 9;

export const FilterableGallery = () => {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef<number>(0);

  const currentImages = useMemo(
    () => galleryCategories.find((c) => c.id === activeCategory)?.images ?? [],
    [activeCategory],
  );

  const visibleImages = useMemo(
    () => currentImages.slice(0, PREVIEW_COUNT),
    [currentImages],
  );

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight") {
        setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i));
      }
      if (e.key === "ArrowLeft") {
        setLightboxIndex((i) =>
          i !== null && i < visibleImages.length - 1 ? i + 1 : i,
        );
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [lightboxIndex, visibleImages.length]);

  return (
    <section className="section-padding bg-background">
      <div className="container-custom px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-10"
        >
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
            معرض مشاريعنا حسب النشاط
          </h2>
          <div className="gold-line" />
          <p className="text-muted-foreground mt-4 font-body flex items-center justify-center gap-2">
            <Images className="w-5 h-5 text-accent" />
            أكثر من {totalImageCount} صورة — اختر نوع النشاط لعرض المشاريع
          </p>
        </motion.div>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {galleryCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-lg font-display font-bold text-xs sm:text-sm transition-all ${
                activeCategory === cat.id
                  ? "bg-accent text-accent-foreground shadow-md scale-105"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat.label}
              <span className="mr-1 opacity-60">({cat.images.length})</span>
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {visibleImages.map((url, i) => (
              <motion.button
                key={`${activeCategory}-${i}`}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: Math.min(i * 0.03, 0.2) }}
                onClick={() => setLightboxIndex(i)}
                className="group relative rounded-2xl overflow-hidden aspect-square sm:aspect-[4/3] cursor-pointer bg-muted"
                aria-label={`عرض الصورة ${i + 1}`}
              >
                <img
                  src={url}
                  alt={`مشروع ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 image-crisp"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end p-4">
                  <div className="w-11 h-11 rounded-full bg-accent/90 flex items-center justify-center">
                    <ZoomIn className="w-5 h-5 text-accent-foreground" />
                  </div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        <div className="text-center mt-10">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-accent text-accent-foreground font-display font-bold text-sm hover:-translate-y-0.5 active:scale-95 transition-all"
          >
            عرض المعرض الكامل ({currentImages.length} صورة)
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center touch-pan-y"
            onClick={() => setLightboxIndex(null)}
            onTouchStart={(e) => {
              touchStartX.current = e.touches[0].clientX;
              touchDeltaX.current = 0;
            }}
            onTouchMove={(e) => {
              if (touchStartX.current !== null) {
                touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
              }
            }}
            onTouchEnd={() => {
              const dx = touchDeltaX.current;
              const threshold = 50;
              if (Math.abs(dx) > threshold && lightboxIndex !== null) {
                // RTL: swipe right-to-left (dx<0) => next; swipe left-to-right (dx>0) => previous
                if (dx < 0 && lightboxIndex < visibleImages.length - 1) {
                  setLightboxIndex(lightboxIndex + 1);
                } else if (dx > 0 && lightboxIndex > 0) {
                  setLightboxIndex(lightboxIndex - 1);
                }
              }
              touchStartX.current = null;
              touchDeltaX.current = 0;
            }}
            role="dialog"
            aria-label="عرض الصورة"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(null);
              }}
              className="absolute top-4 left-4 z-20 w-12 h-12 md:w-12 md:h-12 rounded-full bg-accent text-accent-foreground shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
              aria-label="إغلاق"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="absolute top-4 right-4 z-20 text-primary-foreground text-sm font-body bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
              {lightboxIndex + 1} / {visibleImages.length}
            </div>

            {lightboxIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(lightboxIndex - 1);
                }}
                className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 md:w-16 md:h-16 rounded-full bg-accent/95 text-accent-foreground shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                aria-label="السابق"
              >
                <ChevronRight className="w-7 h-7 md:w-8 md:h-8" />
              </button>
            )}

            {lightboxIndex < visibleImages.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(lightboxIndex + 1);
                }}
                className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 md:w-16 md:h-16 rounded-full bg-accent/95 text-accent-foreground shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                aria-label="التالي"
              >
                <ChevronLeft className="w-7 h-7 md:w-8 md:h-8" />
              </button>
            )}

            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 md:hidden text-primary-foreground/80 text-xs font-body bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
              اسحب يميناً أو يساراً للتنقل
            </div>

            <motion.img
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              src={visibleImages[lightboxIndex]}
              alt={`مشروع ${lightboxIndex + 1}`}
              className="max-w-[92vw] max-h-[78vh] md:max-h-[85vh] rounded-xl object-contain select-none pointer-events-none"
              draggable={false}
            />
          </motion.div>

        )}
      </AnimatePresence>
    </section>
  );
};

export default FilterableGallery;
