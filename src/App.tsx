import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Team from "./pages/Team";
import AgentDetail from "./pages/AgentDetail";
import IDXSearch from "./pages/IDXSearch";
import AlfonsoLandingPage from "./pages/AlfonsoLandingPage";
import BobLandingPage from "./pages/BobLandingPage";
import NotFound from "./pages/NotFound";

// Agent landing pages - UNCOMMENT WHEN CREATED
// import Agent2LandingPage from "./pages/agents/Agent2LandingPage"; // TODO: Edgar Pacheco
// import Agent4LandingPage from "./pages/agents/Agent4LandingPage"; // TODO: Cozbi
// import Agent5LandingPage from "./pages/agents/Agent5LandingPage"; // TODO: Agent 5
// import Agent6LandingPage from "./pages/agents/Agent6LandingPage"; // TODO: Agent 6
// import Agent7LandingPage from "./pages/agents/Agent7LandingPage"; // TODO: Agent 7
// import Agent8LandingPage from "./pages/agents/Agent8LandingPage"; // TODO: Agent 8
// import Agent9LandingPage from "./pages/agents/Agent9LandingPage"; // TODO: Agent 9
// import Agent10LandingPage from "./pages/agents/Agent10LandingPage"; // TODO: Agent 10

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
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/team" element={<Team />} />
          <Route path="/team/:id" element={<AgentDetail />} />
          <Route path="/idx-search" element={<IDXSearch />} />
          
          {/* Agent Landing Pages */}
          <Route path="/agents/alfonso" element={<AlfonsoLandingPage />} />
          <Route path="/agents/bob" element={<BobLandingPage />} />
          {/* 
          <Route path="/agents/edgar" element={<Agent2LandingPage />} />
          <Route path="/agents/cozbi" element={<Agent4LandingPage />} />
          */}
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;