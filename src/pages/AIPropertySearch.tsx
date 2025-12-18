import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyChatBot from "@/components/PropertyChatBot";

const AIPropertySearch = () => {
  return (
    <>
      <Helmet>
        <title>Property Search | Baja International Realty</title>
        <meta
          name="description"
          content="Search for properties in Los Cabos using our intelligent natural language search. Ask questions like 'Show me 3-bedroom condos under $500k in Cabo San Lucas' and get instant results."
        />
        <meta
          name="keywords"
          content="property search, Los Cabos real estate, Cabo San Lucas homes, intelligent property search, natural language search"
        />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />

        {/* Hero Header */}
        <div className="bg-[#112f76] text-white py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Intelligent Property Search
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
              Find your dream home in Los Cabos using natural language. Just ask what you're looking for!
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span>Powered by BIR</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <span>Live MLS Data</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <span>Instant Results</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chatbot Container */}
        <div className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
          <div className="h-[calc(100vh-300px)] min-h-[600px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <PropertyChatBot onClose={() => window.history.back()} fullPage />
          </div>

          {/* Example Queries */}
          <div className="mt-8 bg-secondary/30 rounded-xl p-6 border border-border">
            <h2 className="text-xl font-bold mb-4">Try These Example Searches:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-background p-4 rounded-lg border border-border">
                <p className="text-sm font-medium text-purple-600">Budget-Friendly</p>
                <p className="text-sm text-muted-foreground mt-1">
                  "Show me 2-bedroom condos under $400k in San Jose del Cabo"
                </p>
              </div>
              <div className="bg-background p-4 rounded-lg border border-border">
                <p className="text-sm font-medium text-blue-600">Beachfront Living</p>
                <p className="text-sm text-muted-foreground mt-1">
                  "Find beachfront properties with ocean views in the Corridor"
                </p>
              </div>
              <div className="bg-background p-4 rounded-lg border border-border">
                <p className="text-sm font-medium text-green-600">Luxury Estates</p>
                <p className="text-sm text-muted-foreground mt-1">
                  "What luxury homes with pools are available in Querencia?"
                </p>
              </div>
              <div className="bg-background p-4 rounded-lg border border-border">
                <p className="text-sm font-medium text-orange-600">Investment Opportunities</p>
                <p className="text-sm text-muted-foreground mt-1">
                  "Show me condos under $300k near the marina"
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                How It Works:
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• <strong>Natural Language:</strong> Ask questions like you would to a real estate agent</li>
                <li>• <strong>Smart Parsing:</strong> Our system understands locations, budgets, bedrooms, amenities, and more</li>
                <li>• <strong>Live Results:</strong> Search our entire MLS database in real-time</li>
                <li>• <strong>Follow-ups:</strong> Refine your search with conversational follow-up questions</li>
              </ul>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default AIPropertySearch;
