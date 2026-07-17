import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  MapPin,
  Calendar,
  User,
  Ruler,
  Clock,
  CheckCircle2,
  Store,
  Layers,
  Hammer,
  Sparkles,
  Phone,
  MessageCircle,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import PageMeta from "@/components/PageMeta";
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { getShowcaseBySlug, showcaseProjects } from "@/data/showcaseProjects";

const iconMap = {
  store: Store,
  layers: Layers,
  hammer: Hammer,
  sparkles: Sparkles,
  ruler: Ruler,
};

export const ShowcaseDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const project = slug ? getShowcaseBySlug(slug) : undefined;

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center px-4">
          <h1 className="font-display font-bold text-2xl text-foreground mb-4">
            المشروع غير موجود
          </h1>
          <Button onClick={() => navigate("/showcase")} variant="default">
            العودة إلى المشاريع
          </Button>
        </div>
      </div>
    );
  }

  const ServiceIcon = iconMap[project.serviceIcon] ?? Store;

  const infoRows = [
    { icon: MapPin, label: "المول", value: project.mall },
    { icon: User, label: "العميل", value: project.client },
    { icon: Ruler, label: "المساحة", value: project.area },
    { icon: Clock, label: "مدة التنفيذ", value: project.duration },
    { icon: Calendar, label: "سنة الإنجاز", value: project.year },
  ];

  const related = showcaseProjects.filter((p) => p.slug !== project.slug).slice(0, 3);

  return (
    <PageTransition>
      <PageMeta
        title={`${project.title} — Brand Identity`}
        description={project.summary}
        canonical={`https://brand-identity.alazab.com/showcase/${project.slug}`}
      />
      <div className="min-h-screen bg-background">
        <Header />
        <main id="main-content" className="pt-20">
          {/* Hero */}
          <section className="relative bg-primary text-primary-foreground py-14 md:py-20 overflow-hidden">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `url(${project.cover})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-l from-primary/95 via-primary/85 to-primary/70" />
            <div className="container-custom px-4 relative">
              <nav className="flex items-center gap-2 text-sm font-body text-primary-foreground/70 mb-5">
                <Link to="/" className="hover:text-accent transition-colors">
                  الرئيسية
                </Link>
                <span>/</span>
                <Link to="/projects" className="hover:text-accent transition-colors">
                  المشاريع
                </Link>
                <span>/</span>
                <span className="text-primary-foreground">{project.title}</span>
              </nav>
              <Badge className="bg-accent text-accent-foreground mb-4 inline-flex items-center gap-1.5">
                <ServiceIcon className="w-3.5 h-3.5" />
                {project.service}
              </Badge>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display font-bold text-3xl md:text-5xl mb-3"
              >
                {project.title}
              </motion.h1>
              <p className="font-body text-base md:text-lg text-primary-foreground/85 max-w-3xl">
                {project.summary}
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6 text-sm font-body text-primary-foreground/80">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-accent" /> {project.mall}
                </span>
                <span className="flex items-center gap-1.5">
                  <Ruler className="w-4 h-4 text-accent" /> {project.area}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-accent" /> {project.duration}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-accent" /> {project.year}
                </span>
              </div>
            </div>
          </section>

          {/* Carousel */}
          <section className="section-padding">
            <div className="container-custom px-4 max-w-6xl">
              <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-2">
                معرض صور المشروع
              </h2>
              <div className="gold-line mb-8" />
              <Carousel
                opts={{ align: "start", loop: true, direction: "rtl" }}
                className="w-full"
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {project.gallery.map((img, i) => (
                    <CarouselItem
                      key={i}
                      className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/2"
                    >
                      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted group">
                        <img
                          src={img}
                          alt={`${project.title} — صورة ${i + 1}`}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute bottom-3 right-3 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-body text-foreground">
                          {i + 1} / {project.gallery.length}
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex" />
                <CarouselNext className="hidden md:flex" />
              </Carousel>
            </div>
          </section>

          {/* Description + Info */}
          <section className="section-padding bg-muted/40">
            <div className="container-custom px-4 max-w-6xl">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-2">
                    عن المشروع
                  </h2>
                  <div className="gold-line mb-6" />
                  <p className="font-body text-foreground/85 leading-loose whitespace-pre-line mb-8">
                    {project.description}
                  </p>

                  <h3 className="font-display font-bold text-xl text-foreground mb-4">
                    أبرز ما نُفّذ
                  </h3>
                  <ul className="space-y-3 mb-8">
                    {project.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="font-body text-foreground/85">{h}</span>
                      </li>
                    ))}
                  </ul>

                  <h3 className="font-display font-bold text-xl text-foreground mb-4">
                    الخامات المستخدمة
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.materials.map((m) => (
                      <span
                        key={m}
                        className="inline-flex items-center gap-1.5 bg-background border border-border px-3 py-1.5 rounded-full text-sm font-body text-foreground"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                <aside className="space-y-4">
                  <Card>
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
                              <dd className="text-sm font-body text-foreground">
                                {row.value}
                              </dd>
                            </div>
                          </div>
                        ))}
                      </dl>
                    </CardContent>
                  </Card>

                  <Card className="bg-primary text-primary-foreground border-primary">
                    <CardContent className="p-6">
                      <ServiceIcon className="w-10 h-10 text-accent mb-3" />
                      <h3 className="font-display font-bold text-lg mb-2">
                        {project.service}
                      </h3>
                      <p className="font-body text-sm text-primary-foreground/80 mb-4">
                        نُنفّذ لك مشروعاً بنفس المعايير ونفس الجودة — من التصميم إلى
                        التسليم النهائي.
                      </p>
                      <Button
                        asChild
                        className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                      >
                        <Link to="/quote">اطلب عرض سعر</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </aside>
              </div>
            </div>
          </section>

          {/* CTA Band */}
          <section className="bg-primary text-primary-foreground py-14 md:py-16">
            <div className="container-custom px-4 max-w-5xl text-center">
              <h2 className="font-display font-bold text-2xl md:text-4xl mb-3">
                جاهزون لبدء مشروعك التالي؟
              </h2>
              <p className="font-body text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                فريقنا مستعد لدراسة موقعك ومساحتك واحتياجاتك، وتقديم عرض سعر مفصّل خلال
                48 ساعة.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  <Link to="/quote">
                    اطلب عرض سعر مجاني
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Link to="/contact">
                    <Phone className="w-4 h-4" />
                    تواصل مباشر
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <a
                    href="https://wa.me/201062777333"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    واتساب
                  </a>
                </Button>
              </div>
            </div>
          </section>

          {/* Related */}
          {related.length > 0 && (
            <section className="section-padding">
              <div className="container-custom px-4 max-w-6xl">
                <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-2">
                  مشاريع مشابهة
                </h2>
                <div className="gold-line mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {related.map((p) => {
                    const Icon = iconMap[p.serviceIcon] ?? Store;
                    return (
                      <Link
                        key={p.slug}
                        to={`/showcase/${p.slug}`}
                        className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-muted block"
                      >
                        <img
                          src={p.cover}
                          alt={p.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-4">
                          <Badge className="bg-accent text-accent-foreground mb-2 inline-flex items-center gap-1">
                            <Icon className="w-3 h-3" />
                            {p.service}
                          </Badge>
                          <h3 className="font-display font-bold text-white text-lg">
                            {p.title}
                          </h3>
                          <p className="text-white/80 text-xs font-body mt-1">
                            {p.mall} · {p.area}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
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

export default ShowcaseDetailPage;
