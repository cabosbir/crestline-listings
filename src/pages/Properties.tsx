import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import PropertyCard from "@/components/PropertyCard";
import AdvancedPropertyFilters from "@/components/AdvancedPropertyFilters";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchListings, convertMLSToPropertyCard, type MLSProperty } from "@/services/flexMlsService";

const Properties = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;
  
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
      setCurrentPage(1); // Reset to page 1 when loading new properties
    } catch (err) {
      console.error('❌ Error loading properties:', err);
      setError('Failed to load properties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (filters: any) => {
    console.log('🔍 [Domino] Filters received:', filters);
    
    // Helper: Convert price strings to numbers
    const parsePrice = (priceStr: string | undefined) => {
      if (!priceStr || priceStr === "No Preference" || priceStr === "") return undefined;
      const cleaned = priceStr.replace(/[$,Million]/g, '').trim();
      const num = parseFloat(cleaned);
      if (isNaN(num)) return undefined;
      return priceStr.includes('Million') ? num * 1000000 : num;
    };
    
    // Helper: Convert beds/baths strings to numbers
    const parseNumber = (str: string | undefined) => {
      if (!str || str === "Any" || str === "No Preference" || str === "") return undefined;
      const parsed = parseInt(str.replace('+', ''));
      return isNaN(parsed) ? undefined : parsed;
    };
    
    // Build API filters (send ALL filters to backend!)
    const apiFilters: any = {};
    
    // LOCATION: Priority order - Zone > Area > Community
    if (filters.zones && filters.zones.length > 0) {
      apiFilters.city = filters.zones[0]; // Use first zone
    } else if (filters.areas && filters.areas.length > 0) {
      apiFilters.city = filters.areas[0]; // Use first area
    } else if (filters.communities && filters.communities.length > 0) {
      apiFilters.city = filters.communities[0]; // Use first community
    }
    
    // PRICE RANGE
    const minPrice = parsePrice(filters.minPrice);
    const maxPrice = parsePrice(filters.maxPrice);
    if (minPrice) apiFilters.minPrice = minPrice;
    if (maxPrice) apiFilters.maxPrice = maxPrice;
    
    // BEDROOMS & BATHROOMS
    const bedrooms = parseNumber(filters.minBeds);
    const bathrooms = parseNumber(filters.minBaths);
    if (bedrooms) apiFilters.bedrooms = bedrooms;
    if (bathrooms) apiFilters.bathrooms = bathrooms;
    
    // PROPERTY TYPE (send first selected type)
    if (filters.propertyTypes && filters.propertyTypes.length > 0) {
      apiFilters.propertyType = filters.propertyTypes[0];
    }
    
    // STATUS
    if (filters.status && filters.status !== "Active") {
      apiFilters.status = filters.status;
    }
    
    // SQUARE FEET
    const minSqft = parseNumber(filters.minSqft);
    if (minSqft) apiFilters.minSqft = minSqft;
    
    // YEAR BUILT
    const yearBuilt = parseNumber(filters.yearBuilt);
    if (yearBuilt) apiFilters.yearBuilt = yearBuilt;
    
    console.log('🎯 [Domino] Sending filters to API:', apiFilters);
    console.log(`📊 [Domino] Expected: FlexMLS will return only listings matching these filters`);
    
    loadProperties(apiFilters);
  };

  const handleReset = () => {
    loadProperties();
  };

  const handleOpenFullSearch = () => {
    window.open(FLEXMLS_IFRAME_URL, '_blank');
  };

  // Pagination calculations
  const totalPages = Math.ceil(properties.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const displayedProperties = properties.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            resultCount={properties.length}  // 🔥 PASS DYNAMIC COUNT
            totalCount={4528}                 // 🔥 TOTAL IN DATABASE
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
                  Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, properties.length)} of {properties.length} properties
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                {displayedProperties.map((property) => (
                  <PropertyCard key={property.id} {...property} />
                ))}
              </div>

              {/* Pagination Controls - Smart Limited Pages */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 my-8 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {/* First Page */}
                  {currentPage > 3 && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(1)}
                      >
                        1
                      </Button>
                      {currentPage > 4 && (
                        <span className="px-2 text-muted-foreground">...</span>
                      )}
                    </>
                  )}
                  
                  {/* Current Page and Neighbors */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      // Show pages within 2 of current page
                      return page >= currentPage - 2 && page <= currentPage + 2;
                    })
                    .map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    ))}
                  
                  {/* Last Page */}
                  {currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && (
                        <span className="px-2 text-muted-foreground">...</span>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(totalPages)}
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
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