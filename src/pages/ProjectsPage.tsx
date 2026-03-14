import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, X } from "lucide-react";

const BASE = "https://objectstorage.me-jeddah-1.oraclecloud.com/n/axwmiwn72of7/b/alazab-media/o/retail-interiors/retail-interiors-";

const categories = ["الكل", "ملابس", "مطاعم", "إكسسوارات", "أكشاك"];

const projects = [
  { id: 1, img: `${BASE}001.jpg`, name: "بوتيك ريماس", mall: "مول العرب", cat: "ملابس", area: "85 م²" },
  { id: 2, img: `${BASE}003.jpg`, name: "متجر أناقة", mall: "سيتي ستارز", cat: "ملابس", area: "120 م²" },
  { id: 3, img: `${BASE}008.jpg`, name: "كافيه أوربان", mall: "مول مصر", cat: "مطاعم", area: "95 م²" },
  { id: 4, img: `${BASE}010.jpg`, name: "مطعم برجر لاونج", mall: "الماسة مول", cat: "مطاعم", area: "150 م²" },
  { id: 5, img: `${BASE}015.jpg`, name: "مجوهرات لمار", mall: "مول العرب", cat: "إكسسوارات", area: "45 م²" },
  { id: 6, img: `${BASE}020.jpg`, name: "كشك العطور", mall: "سيتي ستارز", cat: "أكشاك", area: "12 م²" },
  { id: 7, img: `${BASE}025.jpg`, name: "بوتيك الأميرة", mall: "مول مصر", cat: "ملابس", area: "100 م²" },
  { id: 8, img: `${BASE}030.jpg`, name: "مطعم الشرق", mall: "الماسة مول", cat: "مطاعم", area: "200 م²" },
];

const ProjectsPage = () => {
  const [filter, setFilter] = useState("الكل");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtered = filter === "الكل" ? projects : projects.filter((p) => p.cat === filter);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <section className="section-padding bg-primary text-primary-foreground">
          <div className="container-custom text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display font-bold text-4xl md:text-5xl mb-4"
            >
              معرض المشاريع
            </motion.h1>
            <p className="text-primary-foreground/70 font-body text-lg">أحدث مشاريعنا في كبرى المولات</p>
          </div>
        </section>

        <section className="section-padding bg-background">
          <div className="container-custom">
            {/* Filter */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-5 py-2 rounded-lg font-display font-bold text-sm transition-all ${
                    filter === cat
                      ? "bg-accent text-accent-foreground"
                      : "bg-card text-foreground hover:bg-muted"
                  }`}
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Grid */}
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filtered.map((project) => (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer"
                    onClick={() => setLightbox(project.id)}
                  >
                    <img
                      src={project.img}
                      alt={project.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 image-crisp"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                      <h3 className="font-display font-bold text-lg text-primary-foreground">{project.name}</h3>
                      <p className="text-primary-foreground/70 text-sm font-body">{project.mall} • {project.area}</p>
                      <div className="flex items-center gap-2 mt-2 text-accent text-sm font-display font-bold">
                        <Eye className="w-4 h-4" /> معاينة المشروع
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </section>

        {/* Lightbox */}
        <AnimatePresence>
          {lightbox && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
              onClick={() => setLightbox(null)}
            >
              <button
                onClick={() => setLightbox(null)}
                className="absolute top-4 left-4 w-12 h-12 rounded-full bg-card/20 flex items-center justify-center text-primary-foreground hover:bg-card/40 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={projects.find((p) => p.id === lightbox)?.img}
                alt=""
                className="max-w-full max-h-[85vh] rounded-2xl object-contain"
                onClick={(e) => e.stopPropagation()}
              />
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
