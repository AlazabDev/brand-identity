import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";
import PageTransition from "@/components/PageTransition";
import { Link } from "react-router-dom";
import {
  Home,
  Info,
  Briefcase,
  FolderKanban,
  Building2,
  Hammer,
  Newspaper,
  Phone,
  FileText,
  HelpCircle,
  Users,
  Handshake,
  GraduationCap,
  Wrench,
  ShieldCheck,
  ScrollText,
  Cookie,
  Trash2,
  Sparkles,
} from "lucide-react";

interface SitemapLink {
  label: string;
  href: string;
  description?: string;
}

interface SitemapSection {
  title: string;
  icon: typeof Home;
  links: SitemapLink[];
}

const sitemapSections: SitemapSection[] = [
  {
    title: "الصفحات الرئيسية",
    icon: Home,
    links: [
      { label: "الرئيسية", href: "/", description: "نظرة عامة على خدماتنا وأعمالنا" },
      { label: "من نحن", href: "/about", description: "قصتنا ورؤيتنا وقيمنا" },
      { label: "اتصل بنا", href: "/contact", description: "تواصل معنا مباشرة" },
      { label: "طلب عرض سعر", href: "/quote", description: "احصل على استشارة وعرض سعر مجاني" },
    ],
  },
  {
    title: "الخدمات والأعمال",
    icon: Briefcase,
    links: [
      { label: "خدماتنا", href: "/services", description: "خدمات التجهيز المتكاملة للمحلات" },
      { label: "مشاريعنا", href: "/projects", description: "معرض المشاريع المنفذة" },
      { label: "مشاريع مميزة", href: "/showcase", description: "دراسات حالة تفصيلية" },
      { label: "المشاريع المعمارية", href: "/architecture", description: "تصاميم ونماذج ثلاثية الأبعاد" },
      { label: "كيف نعمل", href: "/works", description: "منهجيتنا في تنفيذ المشاريع" },
    ],
  },
  {
    title: "الشركة",
    icon: Users,
    links: [
      { label: "فريق العمل", href: "/team", description: "تعرف على نخبة مهندسينا" },
      { label: "شركاء النجاح", href: "/partners", description: "علامات تجارية نفخر بالعمل معها" },
      { label: "الوظائف", href: "/careers", description: "انضم إلى فريقنا" },
      { label: "المدونة", href: "/blog", description: "مقالات ونصائح في التجهيز التجاري" },
    ],
  },
  {
    title: "الدعم والمساعدة",
    icon: HelpCircle,
    links: [
      { label: "الأسئلة الشائعة", href: "/faq", description: "إجابات على أكثر الأسئلة تكراراً" },
      { label: "تتبع الصيانة", href: "/maintenance-tracking", description: "تابع حالة طلب الصيانة الخاص بك" },
    ],
  },
  {
    title: "الصفحات القانونية",
    icon: ShieldCheck,
    links: [
      { label: "سياسة الخصوصية", href: "/privacy" },
      { label: "شروط الاستخدام", href: "/terms" },
      { label: "سياسة الكوكيز", href: "/cookies" },
      { label: "حذف البيانات", href: "/data-deletion" },
    ],
  },
];

const sectionIcons = [Home, FolderKanban, Building2, Sparkles, FileText];

const SitemapPage = () => {
  return (
    <PageTransition>
      <PageMeta
        title="خريطة الموقع"
        description="خريطة موقع Brand Identity — تصفح جميع صفحات الموقع: الخدمات، المشاريع، المدونة، الشركة، والصفحات القانونية في مكان واحد."
        canonical="https://brand-identity.alazab.com/sitemap"
      />
      <div className="min-h-screen bg-background">
        <Header />
        <main id="main-content" className="pt-24 md:pt-28 pb-16">
          <div className="container-custom px-4 lg:px-8">
            {/* Page Header */}
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-body font-medium mb-4">
                <ScrollText className="w-4 h-4" />
                تصفح الموقع بسهولة
              </span>
              <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
                خريطة الموقع
              </h1>
              <p className="text-muted-foreground font-body leading-relaxed">
                جميع صفحات موقع Brand Identity منظمة في أقسام واضحة لتصل إلى ما تبحث عنه بسرعة.
              </p>
            </div>

            {/* Sections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sitemapSections.map((section, idx) => {
                const SectionIcon = section.icon ?? sectionIcons[idx % sectionIcons.length];
                return (
                  <nav
                    key={section.title}
                    aria-label={section.title}
                    className="bg-card border border-border rounded-2xl p-6 hover:border-accent/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-5">
                      <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <SectionIcon className="w-5 h-5 text-primary" />
                      </span>
                      <h2 className="font-display font-bold text-lg text-foreground">
                        {section.title}
                      </h2>
                    </div>
                    <ul className="space-y-1">
                      {section.links.map((link) => (
                        <li key={link.href}>
                          <Link
                            to={link.href}
                            className="group flex items-start gap-2 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
                          >
                            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent shrink-0 group-hover:scale-125 transition-transform" />
                            <span>
                              <span className="block text-sm font-body font-medium text-foreground group-hover:text-primary transition-colors">
                                {link.label}
                              </span>
                              {link.description && (
                                <span className="block text-xs text-muted-foreground font-body mt-0.5">
                                  {link.description}
                                </span>
                              )}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                );
              })}
            </div>

            {/* Extra hint */}
            <div className="mt-10 text-center">
              <p className="text-sm text-muted-foreground font-body flex items-center justify-center gap-2 flex-wrap">
                <Wrench className="w-4 h-4 text-accent" />
                لم تجد ما تبحث عنه؟
                <Link to="/contact" className="text-primary font-medium hover:text-accent transition-colors">
                  تواصل معنا
                </Link>
                أو اطلب
                <Link to="/quote" className="text-primary font-medium hover:text-accent transition-colors">
                  استشارة مجانية
                </Link>
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default SitemapPage;
