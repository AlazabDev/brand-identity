import { motion } from "framer-motion";
import { Eye, ArrowLeft, Images } from "lucide-react";
import { Link } from "react-router-dom";
import { galleryCategories, totalImageCount } from "@/data/galleryData";

// Pick 6 curated images from different categories for homepage
const featuredImages = [
  { url: galleryCategories[1].images[0], label: "تجهيزات داخلية" },
  { url: galleryCategories[2].images[0], label: "محلات تجارية" },
  { url: galleryCategories[1].images[20], label: "تجهيزات داخلية" },
  { url: galleryCategories[3].images[0], label: "مشاريع أبو عوف" },
  { url: galleryCategories[2].images[30], label: "محلات تجارية" },
  { url: galleryCategories[1].images[50], label: "تجهيزات داخلية" },
];

const ProjectsGallery = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
            أحدث مشاريعنا في المولات
          </h2>
          <div className="gold-line" />
          <p className="text-muted-foreground mt-4 font-body flex items-center justify-center gap-2">
            <Images className="w-5 h-5 text-accent" />
            أكثر من {totalImageCount} صورة لمشاريعنا المنفذة
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredImages.map((project, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.1 }}
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer"
            >
              <img
                src={project.url}
                alt={project.label}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 image-crisp"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <span className="text-xs font-display font-bold text-accent bg-accent/20 backdrop-blur-sm px-3 py-1 rounded-full w-fit mb-2">
                  {project.label}
                </span>
                <Link
                  to="/projects"
                  className="inline-flex items-center gap-2 text-primary-foreground text-sm font-display font-bold"
                >
                  <Eye className="w-4 h-4" />
                  شاهد المعرض الكامل
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-accent text-accent-foreground font-display font-bold text-sm hover:-translate-y-0.5 active:scale-95 transition-all"
          >
            عرض جميع الأعمال ({totalImageCount} صورة)
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProjectsGallery;
