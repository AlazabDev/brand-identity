import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Search } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <section className="section-padding bg-background min-h-[70vh] flex items-center">
          <div className="container-custom text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-8">
                <Search className="w-12 h-12 text-accent" />
              </div>
              <h1 className="font-display font-bold text-7xl md:text-9xl text-primary mb-4">404</h1>
              <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-4">
                الصفحة غير موجودة
              </h2>
              <p className="text-muted-foreground font-body text-lg mb-8 max-w-md mx-auto">
                عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-accent text-accent-foreground font-display font-bold text-sm hover:-translate-y-0.5 active:scale-95 transition-all"
                >
                  <Home className="w-4 h-4" />
                  العودة للرئيسية
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-lg border border-border text-foreground font-display font-bold text-sm hover:bg-muted transition-all"
                >
                  تواصل معنا
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;