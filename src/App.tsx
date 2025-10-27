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
import NotFound from "./pages/NotFound";

// Agent landing pages - UNCOMMENT WHEN CREATED
// import Agent1LandingPage from "./pages/agents/Agent1LandingPage"; // TODO: Bob Van Patten
// import Agent2LandingPage from "./pages/agents/Agent2LandingPage"; // TODO: Sarah Johnson
// import Agent3LandingPage from "./pages/agents/Agent3LandingPage"; // TODO: Alfonso Puente
// import Agent4LandingPage from "./pages/agents/Agent4LandingPage"; // TODO: Agent 4
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
          
          {/* Agent Landing Pages - UNCOMMENT WHEN AGENT PAGES ARE CREATED */}
          {/* 
          <Route path="/bob" element={<Agent1LandingPage />} />
          <Route path="/sarah" element={<Agent2LandingPage />} />
          <Route path="/alfonso" element={<Agent3LandingPage />} />
          <Route path="/agent4" element={<Agent4LandingPage />} />
          <Route path="/agent5" element={<Agent5LandingPage />} />
          <Route path="/agent6" element={<Agent6LandingPage />} />
          <Route path="/agent7" element={<Agent7LandingPage />} />
          <Route path="/agent8" element={<Agent8LandingPage />} />
          <Route path="/agent9" element={<Agent9LandingPage />} />
          <Route path="/agent10" element={<Agent10LandingPage />} />
          */}
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;