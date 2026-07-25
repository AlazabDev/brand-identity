import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { X, ChevronLeft, ChevronRight, ZoomIn, Images, ArrowLeft } from "lucide-react";
import { galleryCategories, totalImageCount } from "@/data/galleryData";

const PREVIEW_COUNT = 9;

export const FilterableGallery = () => {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={() => setLightboxIndex(null)}
            role="dialog"
            aria-label="عرض الصورة"
          >
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-4 left-4 z-10 w-12 h-12 rounded-full bg-card/10 backdrop-blur-sm flex items-center justify-center text-primary-foreground hover:bg-card/20 transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="absolute top-4 right-4 z-10 text-primary-foreground/70 text-sm font-body bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
              {lightboxIndex + 1} / {visibleImages.length}
            </div>

            {lightboxIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(lightboxIndex - 1);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full bg-card/10 backdrop-blur-sm flex items-center justify-center text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                aria-label="السابق"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            )}

            {lightboxIndex < visibleImages.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(lightboxIndex + 1);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full bg-card/10 backdrop-blur-sm flex items-center justify-center text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                aria-label="التالي"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
            )}

            <motion.img
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              src={visibleImages[lightboxIndex]}
              alt={`مشروع ${lightboxIndex + 1}`}
              className="max-w-[90vw] max-h-[85vh] rounded-xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default FilterableGallery;
