import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import PageMeta from "@/components/PageMeta";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Calendar, User, Ruler } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  return (
    <PageTransition>
      <PageMeta
        title={project?.title ?? "تفاصيل المشروع"}
        description={project?.description ?? "عرض تفصيلي لمشروع تجهيز محل تجاري"}
        canonical={`https://brand-identity.alazab.com/projects/${id}`}
      />
      <div className="min-h-screen">
        <Header />
        <main id="main-content" className="pt-20">
          {/* Breadcrumb */}
          <section className="bg-muted/50 py-4">
            <div className="container-custom px-4">
              <nav className="flex items-center gap-2 text-sm font-body text-muted-foreground">
                <Link to="/" className="hover:text-accent transition-colors">الرئيسية</Link>
                <span>/</span>
                <Link to="/projects" className="hover:text-accent transition-colors">المشاريع</Link>
                <span>/</span>
                <span className="text-foreground">{project?.title ?? "..."}</span>
              </nav>
            </div>
          </section>

          {isLoading ? (
            <section className="section-padding bg-background">
              <div className="container-custom max-w-5xl">
                <Skeleton className="h-10 w-2/3 mb-4" />
                <Skeleton className="h-6 w-1/3 mb-8" />
                <Skeleton className="h-80 w-full rounded-xl mb-8" />
                <Skeleton className="h-24 w-full" />
              </div>
            </section>
          ) : project ? (
            <>
              {/* Hero */}
              <section className="section-padding bg-primary text-primary-foreground">
                <div className="container-custom max-w-5xl">
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-display font-bold text-3xl md:text-5xl mb-4"
                  >
                    {project.title}
                  </motion.h1>
                  <div className="flex flex-wrap gap-4 text-primary-foreground/70 font-body text-sm">
                    {project.mall && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" /> {project.mall}
                      </span>
                    )}
                    {project.client_name && (
                      <span className="flex items-center gap-1.5">
                        <User className="w-4 h-4" /> {project.client_name}
                      </span>
                    )}
                    {project.area && (
                      <span className="flex items-center gap-1.5">
                        <Ruler className="w-4 h-4" /> {project.area}
                      </span>
                    )}
                    {project.completion_date && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" /> {project.completion_date}
                      </span>
                    )}
                  </div>
                </div>
              </section>

              {/* Gallery */}
              {project.images && project.images.length > 0 && (
                <section className="section-padding bg-background">
                  <div className="container-custom max-w-5xl">
                    <h2 className="font-display font-bold text-2xl text-foreground mb-6">صور المشروع</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {project.images.map((img, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.95 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 }}
                          className={i === 0 ? "md:col-span-2" : ""}
                        >
                          <img
                            src={img}
                            alt={`${project.title} - صورة ${i + 1}`}
                            className="w-full h-64 md:h-80 object-cover rounded-xl"
                            loading="lazy"
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Description */}
              {project.description && (
                <section className="section-padding bg-muted/50">
                  <div className="container-custom max-w-3xl">
                    <h2 className="font-display font-bold text-2xl text-foreground mb-6">تفاصيل المشروع</h2>
                    <div className="gold-line mb-8" />
                    <p className="text-muted-foreground font-body text-lg leading-relaxed whitespace-pre-line">
                      {project.description}
                    </p>
                  </div>
                </section>
              )}

              {/* Info Cards */}
              <section className="section-padding bg-background">
                <div className="container-custom max-w-5xl">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "التصنيف", value: project.category },
                      { label: "المول", value: project.mall ?? "—" },
                      { label: "العميل", value: project.client_name ?? "—" },
                      { label: "المساحة", value: project.area ?? "—" },
                    ].map((item) => (
                      <div key={item.label} className="card-elevated p-5 text-center">
                        <p className="text-muted-foreground font-body text-xs mb-1">{item.label}</p>
                        <p className="font-display font-bold text-foreground">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Back Link */}
              <section className="pb-12">
                <div className="container-custom max-w-5xl">
                  <Link
                    to="/projects"
                    className="inline-flex items-center gap-2 text-accent font-body font-medium hover:underline"
                  >
                    <ArrowRight className="w-4 h-4" />
                    العودة لجميع المشاريع
                  </Link>
                </div>
              </section>
            </>
          ) : (
            <section className="section-padding bg-background text-center">
              <div className="container-custom">
                <h2 className="font-display font-bold text-2xl text-foreground mb-4">المشروع غير موجود</h2>
                <Link to="/projects" className="text-accent font-body hover:underline">
                  العودة للمشاريع
                </Link>
              </div>
            </section>
          )}
        </main>
        <Footer />
        <FloatingButtons />
      </div>
    </PageTransition>
  );
};

export default ProjectDetailPage;
