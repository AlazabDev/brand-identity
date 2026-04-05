import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import PageMeta from "@/components/PageMeta";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";
import { Building2, Award, Handshake } from "lucide-react";

interface Partner {
  name: string;
  nameAr?: string;
  category: "mall" | "brand";
  logo?: string;
}

const partners: Partner[] = [
  // Malls
  { name: "Mall of Egypt", nameAr: "مول مصر", category: "mall", logo: "https://logo.clearbit.com/mallofegypt.com" },
  { name: "Mall of Arabia", nameAr: "مول العرب", category: "mall", logo: "https://logo.clearbit.com/mallofarabia.com" },
  { name: "City Centre Almaza", nameAr: "سيتي سنتر ألماظة", category: "mall", logo: "https://logo.clearbit.com/citycentrealmaza.com" },
  { name: "Cairo Festival City", nameAr: "كايرو فيستيفال سيتي", category: "mall", logo: "https://logo.clearbit.com/cairofestivalcity.com" },
  { name: "Open Air Mall", nameAr: "أوبن إير مول", category: "mall", logo: "https://logo.clearbit.com/openair-mall.com" },
  { name: "Dandy Mega Mall", nameAr: "داندي ميجا مول", category: "mall", logo: "https://logo.clearbit.com/dandymegamall.com" },
  { name: "Arkan Plaza", nameAr: "أركان بلازا", category: "mall", logo: "https://logo.clearbit.com/arkanplaza.com" },
  { name: "District 5", nameAr: "ديستريكت 5", category: "mall", logo: "https://logo.clearbit.com/district5.com" },
  { name: "Point 90 Mall", nameAr: "بوينت 90 مول", category: "mall", logo: "https://logo.clearbit.com/point90mall.com" },
  { name: "Gate Mall", nameAr: "جيت مول", category: "mall" },
  // Brands
  { name: "Abu Auf", nameAr: "أبو عوف", category: "brand", logo: "https://logo.clearbit.com/abuauf.com" },
  { name: "Zara Home", category: "brand", logo: "https://logo.clearbit.com/zarahome.com" },
  { name: "Costa Coffee", category: "brand", logo: "https://logo.clearbit.com/costa.co.uk" },
  { name: "Starbucks", category: "brand", logo: "https://logo.clearbit.com/starbucks.com" },
  { name: "Swarovski", category: "brand", logo: "https://logo.clearbit.com/swarovski.com" },
  { name: "Pandora", category: "brand", logo: "https://logo.clearbit.com/pandora.net" },
  { name: "Bath & Body Works", category: "brand", logo: "https://logo.clearbit.com/bathandbodyworks.com" },
  { name: "Victoria's Secret", category: "brand", logo: "https://logo.clearbit.com/victoriassecret.com" },
];

const malls = partners.filter((p) => p.category === "mall");
const brands = partners.filter((p) => p.category === "brand");

const PartnerCard = ({ partner, index }: { partner: Partner; index: number }) => {
  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = "none";
    const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
    if (fallback) fallback.style.display = "flex";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group relative bg-card border border-border rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-[160px] hover:border-accent/40 hover:shadow-lg transition-all duration-300"
    >
      {partner.logo ? (
        <>
          <img
            src={partner.logo}
            alt={`${partner.nameAr ?? partner.name} logo`}
            loading="lazy"
            className="h-12 w-auto object-contain mb-3 grayscale group-hover:grayscale-0 transition-all duration-300"
            onError={handleImgError}
          />
          {/* Fallback initials (hidden by default) */}
          <div
            className="hidden items-center justify-center w-14 h-14 rounded-xl bg-accent/10 text-accent font-display font-bold text-xl mb-3"
          >
            {(partner.nameAr ?? partner.name).charAt(0)}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-accent/10 text-accent font-display font-bold text-xl mb-3">
          {(partner.nameAr ?? partner.name).charAt(0)}
        </div>
      )}
      <p className="font-display font-bold text-foreground group-hover:text-accent transition-colors text-sm leading-relaxed">
        {partner.nameAr ?? partner.name}
      </p>
      <p className="text-muted-foreground text-xs mt-1">{partner.name}</p>
    </motion.div>
  );
};

const PartnersPage = () => {
  return (
    <PageTransition>
      <PageMeta
        title="شركاء النجاح | Brand Identity"
        description="اكتشف شركاء النجاح من المولات والعلامات التجارية الكبرى التي تعاونت مع Brand Identity في تجهيز وتأسيس المحلات التجارية."
        canonical="https://brand-identity.alazab.com/partners"
      />
      <div className="min-h-screen">
        <Header />
        <main id="main-content" className="pt-20">
          {/* Hero */}
          <section className="section-padding bg-primary text-primary-foreground relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--accent)/0.15),transparent_70%)]" />
            <div className="container-custom text-center relative z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-2 rounded-full mb-6"
              >
                <Handshake className="w-5 h-5" />
                <span className="font-body text-sm font-medium">شراكات موثوقة</span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="font-display font-bold text-4xl md:text-5xl lg:text-6xl mb-4"
              >
                شركاء النجاح
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-primary-foreground/70 font-body text-lg max-w-2xl mx-auto"
              >
                نفخر بشراكاتنا مع كبرى المولات والعلامات التجارية العالمية والمحلية في مصر
              </motion.p>
            </div>
          </section>

          {/* Stats */}
          <section className="py-14 bg-accent/5 border-b border-border">
            <div className="container-custom">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {[
                  { value: "+200", label: "مشروع منفذ" },
                  { value: "+15", label: "مول تجاري" },
                  { value: "+30", label: "علامة تجارية" },
                  { value: "+14", label: "سنة خبرة" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex flex-col items-center"
                  >
                    <p className="font-display font-bold text-4xl md:text-5xl text-accent mb-2">
                      {stat.value}
                    </p>
                    <p className="text-muted-foreground font-body text-sm">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Malls */}
          <section className="section-padding bg-background">
            <div className="container-custom">
              <div className="flex items-center gap-3 mb-3">
                <Building2 className="w-7 h-7 text-accent" />
                <h2 className="font-display font-bold text-3xl text-foreground">المولات التجارية</h2>
              </div>
              <p className="text-muted-foreground font-body mb-8 max-w-xl">
                نفذنا مشاريع داخل أكبر المراكز التجارية في مصر
              </p>
              <div className="gold-line mb-10" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {malls.map((mall, i) => (
                  <PartnerCard key={mall.name} partner={mall} index={i} />
                ))}
              </div>
            </div>
          </section>

          {/* Brands */}
          <section className="section-padding bg-muted/30">
            <div className="container-custom">
              <div className="flex items-center gap-3 mb-3">
                <Award className="w-7 h-7 text-accent" />
                <h2 className="font-display font-bold text-3xl text-foreground">العلامات التجارية</h2>
              </div>
              <p className="text-muted-foreground font-body mb-8 max-w-xl">
                صمّمنا ونفّذنا فروعًا لأشهر العلامات التجارية العالمية والمحلية
              </p>
              <div className="gold-line mb-10" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {brands.map((brand, i) => (
                  <PartnerCard key={brand.name} partner={brand} index={i} />
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="section-padding bg-primary text-primary-foreground">
            <div className="container-custom text-center">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="font-display font-bold text-3xl md:text-4xl mb-4"
              >
                هل تريد الانضمام لقائمة شركائنا؟
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-primary-foreground/70 font-body text-lg mb-8 max-w-lg mx-auto"
              >
                تواصل معنا اليوم لبدء مشروعك التجاري بأعلى معايير الجودة
              </motion.p>
              <motion.a
                href="/quote"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-8 py-3 rounded-full font-display font-bold text-lg hover:bg-accent/90 transition-colors"
              >
                اطلب عرض سعر
              </motion.a>
            </div>
          </section>
        </main>
        <Footer />
        <FloatingButtons />
      </div>
    </PageTransition>
  );
};

export default PartnersPage;
