import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { HelmetProvider, type HelmetServerState } from "react-helmet-async";
import Index from "./pages/Index";
const Properties = lazy(() => import("./pages/Properties"));
const AdvancedSearch = lazy(() => import("./pages/AdvancedSearch"));
const PropertiesMap = lazy(() => import("./pages/PropertiesMap"));
const PropertyDetail = lazy(() => import("./pages/PropertyDetail"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Team = lazy(() => import("./pages/Team"));
const AgentDetail = lazy(() => import("./pages/AgentDetail"));
const IDXSearch = lazy(() => import("./pages/IDXSearch"));
const AlfonsoLandingPage = lazy(() => import("./pages/AlfonsoLandingPage"));
const BobLandingPage = lazy(() => import("./pages/BobLandingPage"));
const BonnieReneeLandingPage = lazy(() => import("./pages/BonnieReneeLandingPage"));
const CharlesLandingPage = lazy(() => import("./pages/CharlesLandingPage"));
const CozbiLandingPage = lazy(() => import("./pages/CozbiLandingPage"));
const DavidLandingPage = lazy(() => import("./pages/DavidLandingPage"));
const DonLandingPage = lazy(() => import("./pages/DonLandingPage"));
const EdgarLandingPage = lazy(() => import("./pages/EdgarLandingPage"));
const ErikaLandingPage = lazy(() => import("./pages/ErikaLandingPage"));
const ErikaGracianoLandingPage = lazy(() => import("./pages/ErikaGracianoLandingPage"));
const FernandoLandingPage = lazy(() => import("./pages/FernandoLandingPage"));
const HectorLandingPage = lazy(() => import("./pages/HectorLandingPage"));
const HumbertoLandingPage = lazy(() => import("./pages/HumbertoLandingPage"));
const MarisolLandingPage = lazy(() => import("./pages/MarisolLandingPage"));
const OfficeListings = lazy(() => import("./pages/OfficeListings"));
const OfficeListingDetail = lazy(() => import("./pages/OfficeListingDetail"));
const PacificoHeights = lazy(() => import("./pages/PacificoHeights"));
const MarketReport = lazy(() => import("./pages/MarketReport"));
const NewClientForm = lazy(() => import("./pages/NewClientForm"));
const SellerEvaluationForm = lazy(() => import("./pages/SellerEvaluationForm"));
const FilterTrainingDashboard = lazy(() => import("./pages/FilterTrainingDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

function LivePropertySearch() { useEffect(() => { window.location.replace("/property-search.html" + window.location.search); }, []); return <p>Opening property search...</p>; }
const queryClient = new QueryClient();

// Honor section links after React renders the destination page.
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      let id = hash.slice(1);
      try { id = decodeURIComponent(id); } catch { /* Keep malformed fragments harmless. */ }
      const target = id ? document.getElementById(id) : null;
      if (target) {
        target.scrollIntoView({ block: "start", behavior: "instant" });
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname, hash]);

  return null;
}

function RetiredAssistantRedirect() {
  useEffect(() => { window.location.replace('/property-search.html'); }, []);
  return <a href="/property-search.html">Open Cabo MLS Search</a>;
}

export const AppContent = ({ helmetContext }: { helmetContext?: { helmet?: HelmetServerState } }) => (
  <HelmetProvider context={helmetContext}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <>
          <Toaster />
          <Sonner />
          <ScrollToTop />
          <Suspense fallback={<p role="status" className="p-6">Loading page…</p>}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/search" element={<LivePropertySearch />} /> {/* 🔥 NEW: Full-page search */}
          <Route path="/ai-search" element={<RetiredAssistantRedirect />} /> {/* 🤖 NEW: AI property search */}
          <Route path="/properties/map" element={<PropertiesMap />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/team" element={<Team />} />
          <Route path="/team/:id" element={<AgentDetail />} />
          <Route path="/idx-search" element={<IDXSearch />} />

          {/* Market Report Page */}
          <Route path="/market-report" element={<MarketReport />} />

          {/* Admin: Filter Training Dashboard - 🧠 NEW */}
          <Route path="/admin/filter-training" element={<FilterTrainingDashboard />} />

          {/* New Client Forms - All URL patterns supported */}
          <Route path="/new-client" element={<NewClientForm />} />
          <Route path="/new-client-form" element={<NewClientForm />} />
          <Route path="/new-client/:agentSlug" element={<NewClientForm />} />
          <Route path="/agents/:agentSlug/new-client" element={<NewClientForm />} />

          {/* Seller Evaluation Forms - Both URL patterns supported */}
          <Route path="/seller-evaluation" element={<SellerEvaluationForm />} />
          <Route path="/seller-evaluation/:agentSlug" element={<SellerEvaluationForm />} />
          <Route path="/agents/:agentSlug/seller-evaluation" element={<SellerEvaluationForm />} />

          {/* Agent Landing Pages - Short URLs (e.g., /bob) */}
          <Route path="/alfonso" element={<AlfonsoLandingPage />} />
          <Route path="/bob" element={<BobLandingPage />} />
          <Route path="/bonnie-renee" element={<BonnieReneeLandingPage />} />
          <Route path="/charles-jones" element={<CharlesLandingPage />} />
          <Route path="/cozbi" element={<CozbiLandingPage />} />
          <Route path="/david" element={<DavidLandingPage />} />
          <Route path="/don" element={<DonLandingPage />} />
          <Route path="/edgar" element={<EdgarLandingPage />} />
          <Route path="/erika" element={<ErikaLandingPage />} />
          <Route path="/erika-graciano" element={<ErikaGracianoLandingPage />} />
          <Route path="/fernando-cabrera" element={<FernandoLandingPage />} />
          <Route path="/hector" element={<HectorLandingPage />} />
          <Route path="/humberto" element={<HumbertoLandingPage />} />
          <Route path="/marisol" element={<MarisolLandingPage />} />
          <Route path="/susu" element={<Navigate to="/team" replace />} />

          {/* Agent Landing Pages - Full URLs (e.g., /agents/bob) */}
          <Route path="/agents/alfonso" element={<AlfonsoLandingPage />} />
          <Route path="/agents/bob" element={<BobLandingPage />} />
          <Route path="/agents/bonnie-renee" element={<BonnieReneeLandingPage />} />
          <Route path="/agents/charles-jones" element={<CharlesLandingPage />} />
          <Route path="/agents/cozbi" element={<CozbiLandingPage />} />
          <Route path="/agents/david" element={<DavidLandingPage />} />
          <Route path="/agents/don" element={<DonLandingPage />} />
          <Route path="/agents/edgar" element={<EdgarLandingPage />} />
          <Route path="/agents/erika" element={<ErikaLandingPage />} />
          <Route path="/agents/erika-graciano" element={<ErikaGracianoLandingPage />} />
          <Route path="/agents/fernando-cabrera" element={<FernandoLandingPage />} />
          <Route path="/agents/hector" element={<HectorLandingPage />} />
          <Route path="/agents/humberto" element={<HumbertoLandingPage />} />
          <Route path="/agents/marisol" element={<MarisolLandingPage />} />
          <Route path="/agents/susu" element={<Navigate to="/team" replace />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="/office-listings" element={<OfficeListings />} />
          <Route path="/office-listings/:id" element={<OfficeListingDetail />} />
          <Route path="/pacifico-heights" element={<PacificoHeights />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
          </Suspense>
        </>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

const App = () => <BrowserRouter><AppContent /></BrowserRouter>;

export default App;
