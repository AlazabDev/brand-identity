import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import AboutPage from "./pages/AboutPage.tsx";
import ServicesPage from "./pages/ServicesPage.tsx";
import ProjectsPage from "./pages/ProjectsPage.tsx";
import BlogPage from "./pages/BlogPage.tsx";
import ContactPage from "./pages/ContactPage.tsx";
import QuotePage from "./pages/QuotePage.tsx";
import FAQPage from "./pages/FAQPage.tsx";
import PrivacyPage from "./pages/PrivacyPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const queryClient = new QueryClient();

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/quote" element={<QuotePage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
