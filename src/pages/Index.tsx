import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import MallExpertise from "@/components/MallExpertise";
import { ClientLogos } from "@/components/ClientLogos";
import AbuAufShowcase from "@/components/AbuAufShowcase";
import { BeforeAfter } from "@/components/BeforeAfter";
import ProjectsGallery from "@/components/ProjectsGallery";
import WorkSteps from "@/components/WorkSteps";
import { TrustIndicators } from "@/components/TrustIndicators";
import Testimonials from "@/components/Testimonials";
import { FAQPreview } from "@/components/FAQPreview";
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
        description="شركة Brand Identity متخصصة في تأسيس وتجهيز المحلات التجارية داخل المولات - تصميم، تصنيع، تنفيذ. أكثر من 100 مشروع منفذ و135 فرع أبو عوف."
        canonical="https://brand-identity.alazab.com"
      />
      <div className="min-h-screen">
        <Header />
        <main id="main-content">
          <HeroSection />
          <ClientLogos />
          <ServicesSection />
          <MallExpertise />
          <AbuAufShowcase />
          <BeforeAfter />
          <ProjectsGallery />
          <WorkSteps />
          <TrustIndicators />
          <Testimonials />
          <FAQPreview />
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
