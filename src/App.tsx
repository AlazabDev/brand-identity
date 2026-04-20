import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import { lazy, Suspense, useEffect } from "react";
import SkipToContent from "@/components/SkipToContent";
import LoadingScreen from "@/components/LoadingScreen";
import ErrorBoundary from "@/components/ErrorBoundary";
import { CookieConsent } from "@/components/CookieConsent";
// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const QuotePage = lazy(() => import("./pages/QuotePage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const CookiePolicyPage = lazy(() => import("./pages/CookiePolicyPage"));
const DataDeletionPage = lazy(() => import("./pages/DataDeletionPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const MaintenanceTrackingPage = lazy(() => import("./pages/MaintenanceTrackingPage"));
const TeamPage = lazy(() => import("./pages/TeamPage"));
const ProjectDetailPage = lazy(() => import("./pages/ProjectDetailPage"));
const PartnersPage = lazy(() => import("./pages/PartnersPage"));
const CareersPage = lazy(() => import("./pages/CareersPage"));
const WebhookDashboardPage = lazy(() => import("./pages/WebhookDashboardPage"));
const WorksPage = lazy(() => import("./pages/works"));
const ArchitectureProjectsPage = lazy(() => import("./pages/ArchitectureProjectsPage"));
const ArchitectureProjectDetailPage = lazy(() => import("./pages/ArchitectureProjectDetailPage"));
const AdminArchitecturePage = lazy(() => import("./pages/AdminArchitecturePage"));

const queryClient = new QueryClient();

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/quote" element={<QuotePage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/cookies" element={<CookiePolicyPage />} />
        <Route path="/data-deletion" element={<DataDeletionPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/partners" element={<PartnersPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/maintenance-tracking" element={<MaintenanceTrackingPage />} />
        <Route path="/admin/webhooks" element={<WebhookDashboardPage />} />
        <Route path="/admin/architecture" element={<AdminArchitecturePage />} />
        <Route path="/works" element={<WorksPage />} />
        <Route path="/architecture" element={<ArchitectureProjectsPage />} />
        <Route path="/architecture/:id" element={<ArchitectureProjectDetailPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <SkipToContent />
          <ScrollToTop />
          <Suspense fallback={<LoadingScreen />}>
            <AnimatedRoutes />
            <CookieConsent />
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;