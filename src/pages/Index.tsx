import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import MallExpertise from "@/components/MallExpertise";
import AbuAufShowcase from "@/components/AbuAufShowcase";
import ProjectsGallery from "@/components/ProjectsGallery";
import WorkSteps from "@/components/WorkSteps";
import Testimonials from "@/components/Testimonials";
import BlogPreview from "@/components/BlogPreview";
import CTABand from "@/components/CTABand";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import PageMeta from "@/components/PageMeta";
import PageTransition from "@/components/PageTransition";

const Index = () => {
  return (
    <PageTransition>
      <PageMeta
        title="تجهيز المحلات التجارية في المولات"
        description="شركة Brand Identity متخصصة في تأسيس وتجهيز المحلات التجارية داخل المولات - تصميم، تصنيع، تنفيذ. أكثر من 200 مشروع منفذ و270 فرع أبو عوف."
        canonical="https://brand-identity.alazab.com"
      />
      <div className="min-h-screen">
        <Header />
        <main id="main-content">
          <HeroSection />
          <ServicesSection />
          <MallExpertise />
          <AbuAufShowcase />
          <ProjectsGallery />
          <WorkSteps />
          <Testimonials />
          <BlogPreview />
          <CTABand />
        </main>
        <Footer />
        <FloatingButtons />
      </div>
    </PageTransition>
  );
};

export default Index;