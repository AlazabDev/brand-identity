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

// Public pages
const Index = lazy(() => import("./pages/Index"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const ProjectDetailPage = lazy(() => import("./pages/ProjectDetailPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const QuotePage = lazy(() => import("./pages/QuotePage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const CookiePolicyPage = lazy(() => import("./pages/CookiePolicyPage"));
const DataDeletionPage = lazy(() => import("./pages/DataDeletionPage"));
const SitemapPage = lazy(() => import("./pages/SitemapPage"));
const TeamPage = lazy(() => import("./pages/TeamPage"));
const PartnersPage = lazy(() => import("./pages/PartnersPage"));
const CareersPage = lazy(() => import("./pages/CareersPage"));
const WorksPage = lazy(() => import("./pages/works"));
const ArchitectureProjectsPage = lazy(() => import("./pages/ArchitectureProjectsPage"));
const ArchitectureProjectDetailPage = lazy(() => import("./pages/ArchitectureProjectDetailPage"));
const ShowcaseIndexPage = lazy(() => import("./pages/ShowcaseIndexPage"));
const ShowcaseDetailPage = lazy(() => import("./pages/ShowcaseDetailPage"));
const MaintenanceTrackingPage = lazy(() => import("./pages/MaintenanceTrackingPage"));

// Client portal — single production implementation
const PortalLoginPage = lazy(() => import("./pages/PortalLoginPage"));
const PortalResetPasswordPage = lazy(() => import("./pages/PortalResetPasswordPage"));
const PortalProjectsPage = lazy(() => import("./pages/PortalProjectsPage"));
const PortalProjectPage = lazy(() => import("./pages/PortalProjectPage"));

// Administration
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminPortalPage = lazy(() => import("./pages/AdminPortalPage"));
const WebhookDashboardPage = lazy(() => import("./pages/WebhookDashboardPage"));
const AdminArchitecturePage = lazy(() => import("./pages/AdminArchitecturePage"));

const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
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
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/quote" element={<QuotePage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/cookies" element={<CookiePolicyPage />} />
        <Route path="/data-deletion" element={<DataDeletionPage />} />
        <Route path="/sitemap" element={<SitemapPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/partners" element={<PartnersPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/maintenance-tracking" element={<MaintenanceTrackingPage />} />
        <Route path="/works" element={<WorksPage />} />
        <Route path="/architecture" element={<ArchitectureProjectsPage />} />
        <Route path="/architecture/:id" element={<ArchitectureProjectDetailPage />} />
        <Route path="/showcase" element={<ShowcaseIndexPage />} />
        <Route path="/showcase/:slug" element={<ShowcaseDetailPage />} />

        <Route path="/portal/login" element={<PortalLoginPage />} />
        <Route path="/portal/reset-password" element={<PortalResetPasswordPage />} />
        <Route path="/portal" element={<PortalProjectsPage />} />
        <Route path="/portal/projects/:id" element={<PortalProjectPage />} />

        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/portal" element={<AdminPortalPage />} />
        <Route path="/admin/webhooks" element={<WebhookDashboardPage />} />
        <Route path="/admin/architecture" element={<AdminArchitecturePage />} />

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
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
