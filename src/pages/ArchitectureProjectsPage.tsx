import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Ruler, Calendar } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import PageMeta from "@/components/PageMeta";
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAllProjects } from "@/lib/architectureStore";

const architectureProjects = getAllProjects();

export const ArchitectureProjectsPage = () => {
  return (
    <PageTransition>
      <PageMeta
        title="أبوعوف – تصميم معماري صحي"
        description="مشاريع معمارية لأبوعوف في القاهرة والجيزة: مطاعم، مستودعات تبريد، مصانع أغذية عضوية."
        canonical="https://brand-identity.alazab.com/architecture"
      />
      <div className="min-h-screen bg-[hsl(var(--background))]">
        <Header />
        <main id="main-content" className="pt-20">
          {/* Hero */}
          <section className="bg-primary text-primary-foreground py-16 md:py-24">
            <div className="container-custom px-4 text-center">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-accent font-body text-sm md:text-base mb-3 tracking-widest"
              >
                AbuOuf Health Architecture — Egypt
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="font-display font-bold text-3xl md:text-5xl mb-4"
              >
                أبوعوف – تصميم معماري صحي
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-body text-base md:text-lg max-w-2xl mx-auto text-primary-foreground/80"
              >
                ستة مشاريع نموذجية تجمع بين العمارة الخضراء والهوية المصرية المعاصرة في القاهرة
                والجيزة.
              </motion.p>
            </div>
          </section>

          {/* Projects Grid */}
          <section className="section-padding">
            <div className="container-custom px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {architectureProjects.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="overflow-hidden group h-full flex flex-col border-border hover:border-accent transition-colors">
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        <img
                          src={p.coverImage}
                          alt={p.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 right-3 bg-accent text-accent-foreground text-xs font-body px-2.5 py-1 rounded">
                          {p.city}
                        </div>
                      </div>
                      <CardContent className="p-5 flex-1 flex flex-col">
                        <h2 className="font-display font-bold text-lg text-foreground mb-1">
                          {p.title}
                        </h2>
                        <p className="text-muted-foreground font-body text-sm mb-3">
                          {p.client} — {p.district}
                        </p>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground font-body mb-4">
                          <span className="flex items-center gap-1">
                            <Ruler className="w-3.5 h-3.5" /> {p.areaM2.toLocaleString("ar-EG")} م²
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" /> {p.year}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" /> {p.type}
                          </span>
                        </div>
                        <p className="text-foreground/80 font-body text-sm mb-5 leading-relaxed flex-1">
                          {p.summary}
                        </p>
                        <Button asChild variant="default" className="w-full">
                          <Link to={`/architecture/${p.id}`}>
                            عرض التفاصيل المعمارية
                            <ArrowLeft className="w-4 h-4" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
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

export default ArchitectureProjectsPage;
