import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Properties from "./pages/Properties";
import AdvancedSearch from "./pages/AdvancedSearch"; // 🔥 NEW: Full-page search with live map
import PropertiesMap from "./pages/PropertiesMap";
import PropertyDetail from "./pages/PropertyDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Team from "./pages/Team";
import AgentDetail from "./pages/AgentDetail";
import IDXSearch from "./pages/IDXSearch";
import AlfonsoLandingPage from "./pages/AlfonsoLandingPage";
import BobLandingPage from "./pages/BobLandingPage";
import CozbiLandingPage from "./pages/CozbiLandingPage";
import DavidLandingPage from "./pages/DavidLandingPage";
import DonLandingPage from "./pages/DonLandingPage";
import EdgarLandingPage from "./pages/EdgarLandingPage";
import ErikaLandingPage from "./pages/ErikaLandingPage";
import HectorLandingPage from "./pages/HectorLandingPage";
import MarisolLandingPage from "./pages/MarisolLandingPage";
import SusuLandingPage from "./pages/SusuLandingPage";
import MarketReport from "./pages/MarketReport";
import NewClientForm from "./pages/NewClientForm";
import SellerEvaluationForm from "./pages/SellerEvaluationForm";
import FilterTrainingDashboard from "./pages/FilterTrainingDashboard"; // 🧠 NEW: AI Filter Training
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// ScrollToTop component - scrolls to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/search" element={<AdvancedSearch />} /> {/* 🔥 NEW: Full-page search */}
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
          <Route path="/cozbi" element={<CozbiLandingPage />} />
          <Route path="/david" element={<DavidLandingPage />} />
          <Route path="/don" element={<DonLandingPage />} />
          <Route path="/edgar" element={<EdgarLandingPage />} />
          <Route path="/erika" element={<ErikaLandingPage />} />
          <Route path="/hector" element={<HectorLandingPage />} />
          <Route path="/marisol" element={<MarisolLandingPage />} />
          <Route path="/susu" element={<SusuLandingPage />} />
          
          {/* Agent Landing Pages - Full URLs (e.g., /agents/bob) */}
          <Route path="/agents/alfonso" element={<AlfonsoLandingPage />} />
          <Route path="/agents/bob" element={<BobLandingPage />} />
          <Route path="/agents/cozbi" element={<CozbiLandingPage />} />
          <Route path="/agents/david" element={<DavidLandingPage />} />
          <Route path="/agents/don" element={<DonLandingPage />} />
          <Route path="/agents/edgar" element={<EdgarLandingPage />} />
          <Route path="/agents/erika" element={<ErikaLandingPage />} />
          <Route path="/agents/hector" element={<HectorLandingPage />} />
          <Route path="/agents/marisol" element={<MarisolLandingPage />} />
          <Route path="/agents/susu" element={<SusuLandingPage />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
