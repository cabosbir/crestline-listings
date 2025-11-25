import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import PropertyCard from "@/components/PropertyCard";
import AdvancedPropertyFilters from "@/components/AdvancedPropertyFilters";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2 } from "lucide-react";
import { fetchListings, convertMLSToPropertyCard, type MLSProperty } from "@/services/flexMlsService";

const Properties = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const FLEXMLS_IFRAME_URL = "https://link.flexmls.com/u67gqp77eml,12";

  // Load initial properties
  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async (filters?: any) => {
    setLoading(true);
    setError(null);
    try {
      console.log('📡 Loading properties with filters:', filters);
      const mlsProperties: MLSProperty[] = await fetchListings(filters);
      console.log('✅ Received properties:', mlsProperties.length);
      const convertedProperties = mlsProperties.map(convertMLSToPropertyCard);
      setProperties(convertedProperties);
    } catch (err) {
      console.error('❌ Error loading properties:', err);
      setError('Failed to load properties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (filters: any) => {
    console.log('🔍 Filters received:', filters);
    
    // Extract first zone if multiple selected
    const selectedZone = filters.zones && filters.zones.length > 0 ? filters.zones[0] : undefined;
    
    // Extract first area if multiple selected
    const selectedArea = filters.areas && filters.areas.length > 0 ? filters.areas[0] : undefined;
    
    // Extract first community if multiple selected
    const selectedCommunity = filters.communities && filters.communities.length > 0 ? filters.communities[0] : undefined;
    
    // Convert price strings to numbers (remove $ and commas)
    const parsePrice = (priceStr: string) => {
      if (!priceStr || priceStr === "No Preference") return undefined;
      const cleaned = priceStr.replace(/[$,Million]/g, '').trim();
      const num = parseFloat(cleaned);
      if (priceStr.includes('Million')) {
        return num * 1000000;
      }
      return num;
    };
    
    // Convert beds/baths strings to numbers
    const parseBeds = (bedsStr: string) => {
      if (!bedsStr || bedsStr === "Any") return undefined;
      return parseInt(bedsStr.replace('+', ''));
    };
    
    const apiFilters = {
      city: selectedZone || selectedArea || selectedCommunity, // Use zone, area, or community as city filter
      minPrice: parsePrice(filters.minPrice),
      maxPrice: parsePrice(filters.maxPrice),
      bedrooms: parseBeds(filters.minBeds),
      bathrooms: parseBeds(filters.minBaths),
    };
    
    console.log('🚀 Sending to API:', apiFilters);
    
    loadProperties(apiFilters);
  };

  const handleReset = () => {
    loadProperties();
  };

  const handleOpenFullSearch = () => {
    window.open(FLEXMLS_IFRAME_URL, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <FloatingContact />

      {/* Header Section */}
      <section className="pt-32 pb-8 bg-secondary">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
            Cabo San Lucas Properties
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mb-6">
            Search 4,370+ luxury properties across Baja California Sur including Cabo San Lucas, 
            San Jose del Cabo, Todos Santos, East Cape, and La Paz
          </p>

          {/* Advanced Filters */}
          <AdvancedPropertyFilters 
            onApplyFilters={handleApplyFilters}
            onReset={handleReset}
          />
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-accent mb-4" />
              <p className="text-muted-foreground">Loading properties...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => loadProperties()} variant="outline">
                Try Again
              </Button>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground mb-4">No properties found matching your criteria.</p>
              <Button onClick={handleReset} variant="outline">
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6 flex justify-between items-center">
                <p className="text-muted-foreground">
                  Showing {properties.length} properties
                </p>
                <Button 
                  variant="outline"
                  onClick={handleOpenFullSearch}
                  size="sm"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View in MLS
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {properties.map((property) => (
                  <PropertyCard key={property.id} {...property} />
                ))}
              </div>
            </>
          )}

          <div className="text-center mt-8 space-y-2">
            <p className="text-sm text-muted-foreground">
              All listings courtesy of MLS BCS (Multiple Listing Service of Baja California Sur)
            </p>
            <p className="text-xs text-gray-400">
              Showing properties in: Cabo San Lucas • San Jose del Cabo • Cabo Corridor • East Cape • 
              Los Barriles • Todos Santos • Pescadero • La Paz • Loreto
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Properties;