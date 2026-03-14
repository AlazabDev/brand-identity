import { motion } from "framer-motion";
import { Eye } from "lucide-react";
import { Link } from "react-router-dom";

const BASE = "https://objectstorage.me-jeddah-1.oraclecloud.com/n/axwmiwn72of7/b/alazab-media/o/retail-interiors/retail-interiors-";

const projects = [
  { id: 1, img: `${BASE}003.jpg`, name: "بوتيك ريماس", mall: "مول العرب", type: "ملابس" },
  { id: 2, img: `${BASE}008.jpg`, name: "كافيه أوربان", mall: "سيتي ستارز", type: "مطاعم" },
  { id: 3, img: `${BASE}015.jpg`, name: "مطعم برجر لاونج", mall: "مول مصر", type: "مطاعم" },
  { id: 4, img: `${BASE}020.jpg`, name: "مجوهرات لمار", mall: "الماسة مول", type: "إكسسوارات" },
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
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.1 }}
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer"
            >
              <img
                src={project.img}
                alt={project.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 image-crisp"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <h3 className="font-display font-bold text-xl text-primary-foreground">
                  {project.name}
                </h3>
                <p className="text-primary-foreground/70 text-sm font-body">{project.mall}</p>
                <Link
                  to="/projects"
                  className="inline-flex items-center gap-2 mt-3 text-accent text-sm font-display font-bold"
                >
                  <Eye className="w-4 h-4" />
                  شاهد التفاصيل
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg border-2 border-primary text-primary font-display font-bold text-sm hover:bg-primary hover:text-primary-foreground transition-all"
          >
            عرض جميع المشاريع
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProjectsGallery;
