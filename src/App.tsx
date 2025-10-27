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

// Import agent landing pages
import Agent1LandingPage from "./pages/agents/Agent1LandingPage"; // TODO: Replace with actual agent name
import Agent2LandingPage from "./pages/agents/Agent2LandingPage"; // TODO: Replace with actual agent name
import Agent3LandingPage from "./pages/agents/Agent3LandingPage"; // TODO: Replace with actual agent name
import Agent4LandingPage from "./pages/agents/Agent4LandingPage"; // TODO: Replace with actual agent name
import Agent5LandingPage from "./pages/agents/Agent5LandingPage"; // TODO: Replace with actual agent name
import Agent6LandingPage from "./pages/agents/Agent6LandingPage"; // TODO: Replace with actual agent name
import Agent7LandingPage from "./pages/agents/Agent7LandingPage"; // TODO: Replace with actual agent name
import Agent8LandingPage from "./pages/agents/Agent8LandingPage"; // TODO: Replace with actual agent name
import Agent9LandingPage from "./pages/agents/Agent9LandingPage"; // TODO: Replace with actual agent name
import Agent10LandingPage from "./pages/agents/Agent10LandingPage"; // TODO: Replace with actual agent name

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
          
          {/* Agent Landing Pages - Personal URLs for each agent */}
          <Route path="/agent1" element={<Agent1LandingPage />} /> {/* TODO: Change to /bob or agent's name */}
          <Route path="/agent2" element={<Agent2LandingPage />} /> {/* TODO: Change to /sarah or agent's name */}
          <Route path="/agent3" element={<Agent3LandingPage />} /> {/* TODO: Change to /alfonso or agent's name */}
          <Route path="/agent4" element={<Agent4LandingPage />} /> {/* TODO: Change to agent's name */}
          <Route path="/agent5" element={<Agent5LandingPage />} /> {/* TODO: Change to agent's name */}
          <Route path="/agent6" element={<Agent6LandingPage />} /> {/* TODO: Change to agent's name */}
          <Route path="/agent7" element={<Agent7LandingPage />} /> {/* TODO: Change to agent's name */}
          <Route path="/agent8" element={<Agent8LandingPage />} /> {/* TODO: Change to agent's name */}
          <Route path="/agent9" element={<Agent9LandingPage />} /> {/* TODO: Change to agent's name */}
          <Route path="/agent10" element={<Agent10LandingPage />} /> {/* TODO: Change to agent's name */}
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;