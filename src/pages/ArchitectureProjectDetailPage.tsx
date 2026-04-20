import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Printer, MapPin, Ruler, Calendar, Building2, Boxes, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import PageMeta from "@/components/PageMeta";
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getProjectById as getArchitectureProject } from "@/lib/architectureStore";

export const ArchitectureProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const project = id ? getArchitectureProject(id) : undefined;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-display font-bold text-2xl text-foreground mb-4">
            المشروع غير موجود
          </h1>
          <Button onClick={() => navigate("/architecture")} variant="default">
            العودة إلى المشاريع
          </Button>
        </div>
      </div>
    );
  }

  const infoRows: { icon: typeof Ruler; label: string; value: string }[] = [
    { icon: Ruler, label: "المساحة", value: `${project.areaM2.toLocaleString("ar-EG")} م²` },
    { icon: MapPin, label: "الحي والمدينة", value: `${project.district}، ${project.city}` },
    { icon: Calendar, label: "سنة الإنجاز", value: String(project.year) },
    { icon: Building2, label: "مواد البناء", value: project.materials.join("، ") },
    { icon: Boxes, label: "الطاقة", value: project.capacity },
  ];

  return (
    <PageTransition>
      <PageMeta
        title={`${project.title} — أبوعوف`}
        description={project.summary}
        canonical={`https://brand-identity.alazab.com/architecture/${project.id}`}
      />
      <div className="min-h-screen bg-background">
        <Header />
        <main id="main-content" className="pt-20">
          {/* Hero */}
          <section className="bg-primary text-primary-foreground py-12 md:py-20 print:bg-white print:text-black">
            <div className="container-custom px-4">
              <nav className="flex items-center gap-2 text-sm font-body text-primary-foreground/70 mb-4 print:hidden">
                <Link to="/" className="hover:text-accent transition-colors">
                  الرئيسية
                </Link>
                <span>/</span>
                <Link to="/architecture" className="hover:text-accent transition-colors">
                  أبوعوف المعماري
                </Link>
                <span>/</span>
                <span className="text-primary-foreground">{project.title}</span>
              </nav>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display font-bold text-3xl md:text-5xl mb-3"
              >
                {project.title}
              </motion.h1>
              <p className="font-body text-base md:text-lg text-primary-foreground/80">
                {project.client} — {project.fullAddress}
              </p>
            </div>
          </section>

          {/* Description */}
          <section className="section-padding">
            <div className="container-custom px-4 max-w-5xl">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <h2 className="font-display font-bold text-2xl text-foreground mb-4">
                    الوصف المعماري
                  </h2>
                  <div className="gold-line mb-6" />
                  <p className="font-body text-foreground/85 leading-loose whitespace-pre-line">
                    {project.description}
                  </p>
                </div>
                <Card className="h-fit">
                  <CardContent className="p-6">
                    <h3 className="font-display font-bold text-lg text-foreground mb-4">
                      بيانات المشروع
                    </h3>
                    <dl className="space-y-4">
                      {infoRows.map((row) => (
                        <div key={row.label} className="flex gap-3">
                          <row.icon className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                          <div>
                            <dt className="text-xs text-muted-foreground font-body">
                              {row.label}
                            </dt>
                            <dd className="text-sm font-body text-foreground">{row.value}</dd>
                          </div>
                        </div>
                      ))}
                    </dl>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="section-padding bg-muted/40">
            <div className="container-custom px-4 max-w-5xl">
              <h2 className="font-display font-bold text-2xl text-foreground mb-6">
                ألبوم الصور المعمارية
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {project.gallery.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setLightboxIndex(i)}
                    className="relative aspect-square overflow-hidden rounded-lg bg-muted group focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <img
                      src={img.src}
                      alt={img.caption}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <span className="text-white text-xs font-body">{img.caption}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* 3D Model */}
          <section className="section-padding">
            <div className="container-custom px-4 max-w-5xl">
              <h2 className="font-display font-bold text-2xl text-foreground mb-2">
                النموذج ثلاثي الأبعاد
              </h2>
              <p className="text-muted-foreground font-body text-sm mb-6">
                تجول داخل النموذج المعماري لمشروع {project.title}.
              </p>
              <div className="relative w-full aspect-[4/3] md:aspect-[16/10] bg-muted rounded-xl overflow-hidden border border-border">
                <iframe
                  title={`${project.title} 3D model`}
                  src={project.modelEmbedUrl}
                  className="absolute inset-0 w-full h-full"
                  allowFullScreen
                />
                <div className="absolute top-3 left-3 bg-background/90 backdrop-blur px-3 py-1.5 rounded shadow pointer-events-none">
                  <p className="font-display font-bold text-xs text-foreground">{project.title}</p>
                  <p className="text-[10px] text-muted-foreground font-body">{project.district}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Location info */}
          <section className="section-padding bg-muted/40">
            <div className="container-custom px-4 max-w-5xl">
              <h2 className="font-display font-bold text-2xl text-foreground mb-4">
                الموقع والمحاور الرئيسية
              </h2>
              <div className="gold-line mb-6" />
              <p className="font-body text-foreground/85 mb-4">
                يقع المشروع في <strong>{project.fullAddress}</strong>، ويتميز بقربه من المحاور
                الرئيسية التالية:
              </p>
              <div className="flex flex-wrap gap-2">
                {project.nearby.map((n) => (
                  <span
                    key={n}
                    className="inline-flex items-center gap-1.5 bg-background border border-border px-3 py-1.5 rounded-full text-sm font-body text-foreground"
                  >
                    <MapPin className="w-3.5 h-3.5 text-accent" />
                    {n}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Actions */}
          <section className="py-10 print:hidden">
            <div className="container-custom px-4 max-w-5xl flex flex-wrap gap-3 justify-between">
              <Button asChild variant="outline">
                <Link to="/architecture">
                  <ArrowRight className="w-4 h-4" />
                  العودة إلى المشاريع
                </Link>
              </Button>
              <Button onClick={() => window.print()} variant="default">
                <Printer className="w-4 h-4" />
                طباعة التقرير المعماري
              </Button>
            </div>
          </section>
        </main>
        <Footer />
        <FloatingButtons />
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxIndex !== null} onOpenChange={(o) => !o && setLightboxIndex(null)}>
        <DialogContent className="max-w-4xl p-0 bg-background border-border">
          {lightboxIndex !== null && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                className="absolute top-3 left-3 z-10 bg-background/90 hover:bg-background p-2 rounded-full border border-border"
                aria-label="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
              <img
                src={project.gallery[lightboxIndex].src}
                alt={project.gallery[lightboxIndex].caption}
                className="w-full h-auto max-h-[80vh] object-contain bg-black"
              />
              <p className="p-4 text-center font-body text-sm text-foreground">
                {project.gallery[lightboxIndex].caption}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
};

export default ArchitectureProjectDetailPage;
