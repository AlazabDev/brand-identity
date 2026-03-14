import { useState, useCallback, useEffect, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn, Grid3X3, LayoutGrid, Images } from "lucide-react";
import { galleryCategories, totalImageCount } from "@/data/galleryData";

const IMAGES_PER_PAGE = 24;

const ProjectsPage = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [visibleCount, setVisibleCount] = useState(IMAGES_PER_PAGE);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [columns, setColumns] = useState(3);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const galleryRef = useRef<HTMLDivElement>(null);

  const currentImages = galleryCategories.find((c) => c.id === activeCategory)?.images ?? [];
  const visibleImages = currentImages.slice(0, visibleCount);
  const hasMore = visibleCount < currentImages.length;

  // Reset on category change
  useEffect(() => {
    setVisibleCount(IMAGES_PER_PAGE);
    setImageErrors(new Set());
  }, [activeCategory]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") setLightboxIndex((i) => i !== null ? Math.min(i + 1, currentImages.length - 1) : null);
      if (e.key === "ArrowRight") setLightboxIndex((i) => i !== null ? Math.max(i - 1, 0) : null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [lightboxIndex, currentImages.length]);

  const loadMore = useCallback(() => {
    setVisibleCount((c) => Math.min(c + IMAGES_PER_PAGE, currentImages.length));
  }, [currentImages.length]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore) loadMore();
      },
      { rootMargin: "400px" }
    );
    const sentinel = document.getElementById("gallery-sentinel");
    if (sentinel) observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const handleImageError = (index: number) => {
    setImageErrors((prev) => new Set(prev).add(index));
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        {/* Hero */}
        <section className="py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="container-custom px-4 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="font-display font-bold text-4xl md:text-5xl mb-4">
                معرض أعمالنا
              </h1>
              <p className="text-primary-foreground/70 font-body text-lg max-w-2xl mx-auto mb-6">
                أكثر من {totalImageCount} صورة لمشاريعنا المنفذة في كبرى المولات والمراكز التجارية
              </p>
              <div className="flex items-center justify-center gap-2 text-accent">
                <Images className="w-5 h-5" />
                <span className="font-display font-bold">{totalImageCount} صورة</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Gallery Controls */}
        <section className="sticky top-16 md:top-20 z-40 bg-card/95 backdrop-blur-md border-b border-border">
          <div className="container-custom px-4 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Category Filter */}
              <div className="flex flex-wrap justify-center gap-2">
                {galleryCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-2 rounded-lg font-display font-bold text-xs sm:text-sm transition-all ${
                      activeCategory === cat.id
                        ? "bg-accent text-accent-foreground shadow-md"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {cat.label}
                    <span className="mr-1 opacity-60">({cat.images.length})</span>
                  </button>
                ))}
              </div>

              {/* Grid Controls */}
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <button
                  onClick={() => setColumns(2)}
                  className={`p-2 rounded-md transition-colors ${columns === 2 ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setColumns(3)}
                  className={`p-2 rounded-md transition-colors ${columns === 3 ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Active count */}
            <p className="text-center sm:text-right text-muted-foreground text-xs font-body mt-2">
              عرض {Math.min(visibleCount, currentImages.length)} من {currentImages.length} صورة
            </p>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="section-padding bg-background" ref={galleryRef}>
          <div className="container-custom px-4 lg:px-8">
            <div
              className={`grid gap-3 md:gap-4 ${
                columns === 2
                  ? "grid-cols-1 sm:grid-cols-2"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              }`}
            >
              {visibleImages.map((url, i) => {
                if (imageErrors.has(i)) return null;
                return (
                  <motion.div
                    key={`${activeCategory}-${i}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: Math.min(i * 0.02, 0.3) }}
                    className="group relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer bg-muted"
                    onClick={() => setLightboxIndex(i)}
                  >
                    <img
                      src={url}
                      alt={`مشروع ${i + 1}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 image-crisp"
                      loading="lazy"
                      onError={() => handleImageError(i)}
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 md:p-6">
                      <div className="flex items-center justify-between">
                        <span className="text-primary-foreground/80 text-xs font-body">
                          صورة {i + 1} من {currentImages.length}
                        </span>
                        <div className="w-10 h-10 rounded-full bg-accent/90 flex items-center justify-center">
                          <ZoomIn className="w-5 h-5 text-accent-foreground" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Load more sentinel for infinite scroll */}
            {hasMore && (
              <div id="gallery-sentinel" className="py-12 text-center">
                <button
                  onClick={loadMore}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-accent text-accent-foreground font-display font-bold text-sm hover:-translate-y-0.5 active:scale-95 transition-all"
                >
                  تحميل المزيد ({currentImages.length - visibleCount} صورة متبقية)
                </button>
              </div>
            )}

            {!hasMore && currentImages.length > 0 && (
              <p className="text-center text-muted-foreground font-body text-sm mt-12">
                — تم عرض جميع الصور ({currentImages.length}) —
              </p>
            )}
          </div>
        </section>

        {/* Lightbox */}
        <AnimatePresence>
          {lightboxIndex !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
              onClick={() => setLightboxIndex(null)}
            >
              {/* Close */}
              <button
                onClick={() => setLightboxIndex(null)}
                className="absolute top-4 left-4 z-10 w-12 h-12 rounded-full bg-card/10 backdrop-blur-sm flex items-center justify-center text-primary-foreground hover:bg-card/20 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Counter */}
              <div className="absolute top-4 right-4 z-10 text-primary-foreground/60 text-sm font-body bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                {lightboxIndex + 1} / {currentImages.length}
              </div>

              {/* Previous */}
              {lightboxIndex > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex(lightboxIndex - 1);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full bg-card/10 backdrop-blur-sm flex items-center justify-center text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <ChevronRight className="w-7 h-7" />
                </button>
              )}

              {/* Next */}
              {lightboxIndex < currentImages.length - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex(lightboxIndex + 1);
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full bg-card/10 backdrop-blur-sm flex items-center justify-center text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <ChevronLeft className="w-7 h-7" />
                </button>
              )}

              {/* Image */}
              <motion.img
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                src={currentImages[lightboxIndex]}
                alt={`مشروع ${lightboxIndex + 1}`}
                className="max-w-[90vw] max-h-[85vh] rounded-xl object-contain"
                onClick={(e) => e.stopPropagation()}
              />

              {/* Thumbnail strip */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 max-w-[80vw] overflow-x-auto py-2 px-3 bg-black/40 backdrop-blur-sm rounded-xl">
                {currentImages.slice(
                  Math.max(0, lightboxIndex - 5),
                  Math.min(currentImages.length, lightboxIndex + 6)
                ).map((url, idx) => {
                  const realIdx = Math.max(0, lightboxIndex - 5) + idx;
                  return (
                    <button
                      key={realIdx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightboxIndex(realIdx);
                      }}
                      className={`w-12 h-12 rounded-lg overflow-hidden shrink-0 transition-all ${
                        realIdx === lightboxIndex
                          ? "ring-2 ring-accent scale-110"
                          : "opacity-50 hover:opacity-80"
                      }`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
      <FloatingButtons />
    </div>
  );
};

export default ProjectsPage;
