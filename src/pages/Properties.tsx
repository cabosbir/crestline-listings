// src/pages/Properties.tsx - Updated with Live FlexMLS Feed

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ExternalLink } from "lucide-react";

const Properties = () => {
  const [mlsNumber, setMlsNumber] = useState("");
  const FLEXMLS_BASE_URL = "https://link.flexmls.com/1lpm0zo1944e,12";

  const handleMLSSearch = () => {
    if (mlsNumber.trim()) {
      window.open(`${FLEXMLS_BASE_URL}?search=${encodeURIComponent(mlsNumber)}`, '_blank');
    }
  };

  const handleOpenFullSearch = () => {
    window.open(FLEXMLS_BASE_URL, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <FloatingContact />

      {/* Header */}
      <section className="pt-32 pb-8 bg-secondary">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
            Luxury Properties
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mb-6">
            Discover exceptional oceanfront villas, elegant condos, and exclusive estates in the most desirable locations
          </p>

          {/* MLS Quick Search */}
          <div className="max-w-2xl">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by MLS # or IDX number..."
                  value={mlsNumber}
                  onChange={(e) => setMlsNumber(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleMLSSearch();
                    }
                  }}
                  className="pl-10"
                />
              </div>
              <Button 
                variant="luxury" 
                onClick={handleMLSSearch}
                disabled={!mlsNumber.trim()}
                className="px-6"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button 
                variant="outline" 
                onClick={handleOpenFullSearch}
                className="px-4"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Full Search
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Enter an MLS number for direct lookup, or browse all listings below
            </p>
          </div>
        </div>
      </section>

      {/* Live FlexMLS Feed */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-border">
            <iframe 
              src={FLEXMLS_BASE_URL}
              frameBorder="0"
              width="100%"
              height="1200"
              className="w-full"
              title="FlexMLS Property Listings"
              style={{ minHeight: '1200px' }}
            />
          </div>
          
          <div className="text-center mt-6">
            <Button 
              variant="outline"
              onClick={handleOpenFullSearch}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Window
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Properties;