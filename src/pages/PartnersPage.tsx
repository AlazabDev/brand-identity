import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import PageMeta from "@/components/PageMeta";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";
import { Building2, Award } from "lucide-react";

interface Partner {
  name: string;
  category: "mall" | "brand";
}

const partners: Partner[] = [
  // Malls
  { name: "Mall of Egypt", category: "mall" },
  { name: "Mall of Arabia", category: "mall" },
  { name: "City Centre Almaza", category: "mall" },
  { name: "Cairo Festival City", category: "mall" },
  { name: "Open Air Mall", category: "mall" },
  { name: "Dandy Mega Mall", category: "mall" },
  { name: "Arkan Plaza", category: "mall" },
  { name: "District 5", category: "mall" },
  { name: "Point 90 Mall", category: "mall" },
  { name: "Gate Mall", category: "mall" },
  // Brands
  { name: "أبو عوف", category: "brand" },
  { name: "Zara Home", category: "brand" },
  { name: "Costa Coffee", category: "brand" },
  { name: "Starbucks", category: "brand" },
  { name: "Swarovski", category: "brand" },
  { name: "Pandora", category: "brand" },
  { name: "Bath & Body Works", category: "brand" },
  { name: "Victoria's Secret", category: "brand" },
];

const malls = partners.filter((p) => p.category === "mall");
const brands = partners.filter((p) => p.category === "brand");

const PartnersPage = () => {
  return (
    <PageTransition>
      <PageMeta
        title="شركاء النجاح"
        description="اكتشف شركاء النجاح من المولات والعلامات التجارية الكبرى التي تعاونت مع Brand Identity."
        canonical="https://brand-identity.alazab.com/partners"
      />
      <div className="min-h-screen">
        <Header />
        <main id="main-content" className="pt-20">
          {/* Hero */}
          <section className="section-padding bg-primary text-primary-foreground">
            <div className="container-custom text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display font-bold text-4xl md:text-5xl mb-4"
              >
                شركاء النجاح
              </motion.h1>
              <p className="text-primary-foreground/70 font-body text-lg max-w-2xl mx-auto">
                نفخر بشراكاتنا مع كبرى المولات والعلامات التجارية العالمية والمحلية
              </p>
            </div>
          </section>

          {/* Stats */}
          <section className="py-12 bg-accent/5">
            <div className="container-custom">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
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
                  >
                    <p className="font-display font-bold text-3xl md:text-4xl text-accent mb-1">
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
              <div className="flex items-center gap-3 mb-8">
                <Building2 className="w-7 h-7 text-accent" />
                <h2 className="font-display font-bold text-3xl text-foreground">المولات التجارية</h2>
              </div>
              <div className="gold-line mb-10" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {malls.map((mall, i) => (
                  <motion.div
                    key={mall.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="card-elevated p-6 flex items-center justify-center text-center min-h-[120px] group hover:border-accent/30 transition-colors"
                  >
                    <p className="font-display font-bold text-foreground group-hover:text-accent transition-colors text-sm">
                      {mall.name}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Brands */}
          <section className="section-padding bg-muted/50">
            <div className="container-custom">
              <div className="flex items-center gap-3 mb-8">
                <Award className="w-7 h-7 text-accent" />
                <h2 className="font-display font-bold text-3xl text-foreground">العلامات التجارية</h2>
              </div>
              <div className="gold-line mb-10" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {brands.map((brand, i) => (
                  <motion.div
                    key={brand.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="card-elevated p-6 flex items-center justify-center text-center min-h-[120px] group hover:border-accent/30 transition-colors"
                  >
                    <p className="font-display font-bold text-foreground group-hover:text-accent transition-colors text-sm">
                      {brand.name}
                    </p>
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

export default PartnersPage;
