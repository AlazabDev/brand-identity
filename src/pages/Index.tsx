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

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
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
  );
};

export default Index;
