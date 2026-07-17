import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Ruler, Clock, Store, Layers, Hammer, Sparkles, Ruler as RulerIcon } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import PageMeta from "@/components/PageMeta";
import PageTransition from "@/components/PageTransition";
import { Badge } from "@/components/ui/badge";
import { showcaseProjects } from "@/data/showcaseProjects";

const iconMap = {
  store: Store,
  layers: Layers,
  hammer: Hammer,
  sparkles: Sparkles,
  ruler: RulerIcon,
};

export const ShowcaseIndexPage = () => {
  return (
    <PageTransition>
      <PageMeta
        title="مشاريعنا المميزة"
        description="استعرض مشاريعنا المنفذة في كبرى المولات المصرية بتفاصيل التصميم والخامات والمساحة."
        canonical="https://brand-identity.alazab.com/showcase"
      />
      <div className="min-h-screen bg-background">
        <Header />
        <main id="main-content" className="pt-20">
          <section className="bg-primary text-primary-foreground py-14 md:py-20">
            <div className="container-custom px-4 text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display font-bold text-3xl md:text-5xl mb-4"
              >
                مشاريعنا المميزة
              </motion.h1>
              <p className="font-body text-primary-foreground/80 max-w-2xl mx-auto">
                نخبة من المشاريع المنفذة داخل أكبر المولات، مع تفاصيل التصميم والخامات
                ومدة التنفيذ.
              </p>
            </div>
          </section>

          <section className="section-padding">
            <div className="container-custom px-4 max-w-6xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {showcaseProjects.map((p, i) => {
                  const Icon = iconMap[p.serviceIcon] ?? Store;
                  return (
                    <motion.div
                      key={p.slug}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        to={`/showcase/${p.slug}`}
                        className="group block rounded-2xl overflow-hidden bg-card border border-border hover:border-accent transition-colors"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img
                            src={p.cover}
                            alt={p.title}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground inline-flex items-center gap-1">
                            <Icon className="w-3 h-3" />
                            {p.service}
                          </Badge>
                        </div>
                        <div className="p-5">
                          <h3 className="font-display font-bold text-lg text-foreground mb-2 group-hover:text-accent transition-colors">
                            {p.title}
                          </h3>
                          <p className="font-body text-sm text-muted-foreground line-clamp-2 mb-4">
                            {p.summary}
                          </p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-body text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-accent" /> {p.mall}
                            </span>
                            <span className="flex items-center gap-1">
                              <Ruler className="w-3.5 h-3.5 text-accent" /> {p.area}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-accent" /> {p.duration}
                            </span>
                          </div>
                          <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-display font-bold text-accent">
                            استعرض التفاصيل
                            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        </main>
        <Footer />
        <FloatingButtons />
      </div>
    </PageTransition>
  );
};

export default ShowcaseIndexPage;
