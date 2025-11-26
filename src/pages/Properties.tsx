import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import PropertyCard from "@/components/PropertyCard";
import AdvancedPropertyFilters from "@/components/AdvancedPropertyFilters";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchListings, convertMLSToPropertyCard, type MLSProperty } from "@/services/flexMlsService";

const Properties = () => {
  const location = useLocation();
  const [properties, setProperties] = useState<any[]>([]);
  const [allProperties, setAllProperties] = useState<MLSProperty[]>([]); // Store raw MLS data for searching
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeSearchQuery, setActiveSearchQuery] = useState<string>("");
  const ITEMS_PER_PAGE = 9;
  
  const FLEXMLS_IFRAME_URL = "https://link.flexmls.com/u67gqp77eml,12";

  // Load initial properties
  useEffect(() => {
    loadProperties();
  }, []);

  // Handle URL parameters for direct MLS/address search
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mlsNumberParam = params.get('mlsNumber');
    const addressParam = params.get('address');
    const searchParam = params.get('search');
    
    if (mlsNumberParam || addressParam || searchParam) {
      const searchQuery = mlsNumberParam || addressParam || searchParam || "";
      setActiveSearchQuery(searchQuery);
      performUniversalSearch(searchQuery);
    }
  }, [location.search]);

  const loadProperties = async (filters?: any) => {
    setLoading(true);
    setError(null);
    try {
      console.log('📡 Loading properties with filters:', filters);
      const mlsProperties: MLSProperty[] = await fetchListings(filters);
      console.log('✅ Received properties:', mlsProperties.length);
      
      // Store raw MLS data for searching
      setAllProperties(mlsProperties);
      
      const convertedProperties = mlsProperties.map(convertMLSToPropertyCard);
      setProperties(convertedProperties);
      setCurrentPage(1);
    } catch (err) {
      console.error('❌ Error loading properties:', err);
      setError('Failed to load properties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 🚀 SUPER-POWERED UNIVERSAL SEARCH
  const performUniversalSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      loadProperties();
      return;
    }

    setLoading(true);
    setError(null);
    setActiveSearchQuery(searchQuery);
    
    try {
      console.log('🔍 [SUPER SEARCH] Searching for:', searchQuery);
      
      // Load all active properties first if not loaded
      let searchData = allProperties;
      if (allProperties.length === 0) {
        const mlsProperties: MLSProperty[] = await fetchListings({ city: 'Cabo San Lucas' });
        setAllProperties(mlsProperties);
        searchData = mlsProperties;
      }

      const query = searchQuery.toLowerCase().trim();
      
      // 🎯 MULTI-FIELD SEARCH LOGIC
      const results = searchData.filter((property: any) => {
        // Search in MLS Number (with and without dash)
        const mlsNumber = property.StandardFields?.ListingId || property.ListingId || '';
        const mlsMatch = mlsNumber.toLowerCase().includes(query) || 
                        mlsNumber.replace(/-/g, '').toLowerCase().includes(query.replace(/-/g, ''));
        
        // Search in Address
        const address = property.StandardFields?.UnparsedAddress || property.UnparsedAddress || '';
        const addressMatch = address.toLowerCase().includes(query);
        
        // Search in Street Name
        const streetName = property.StandardFields?.StreetName || property.StreetName || '';
        const streetMatch = streetName.toLowerCase().includes(query);
        
        // Search in City
        const city = property.StandardFields?.City || property.City || '';
        const cityMatch = city.toLowerCase().includes(query);
        
        // Search in Area/Community
        const area = property.StandardFields?.MLSAreaMajor || property.MLSAreaMajor || '';
        const areaMatch = area.toLowerCase().includes(query);
        
        // Search in Subdivision
        const subdivision = property.StandardFields?.SubdivisionName || property.SubdivisionName || '';
        const subdivisionMatch = subdivision.toLowerCase().includes(query);
        
        // Search in Property Type
        const propertyType = property.StandardFields?.PropertyType || property.PropertyType || '';
        const typeMatch = propertyType.toLowerCase().includes(query);
        
        // Search in Listing Agent Name
        const listAgent = property.StandardFields?.ListAgentFullName || property.ListAgentFullName || '';
        const agentMatch = listAgent.toLowerCase().includes(query);
        
        // Search in Property Name (for named buildings/developments)
        const propertyName = property.StandardFields?.BuildingName || property.BuildingName || '';
        const nameMatch = propertyName.toLowerCase().includes(query);
        
        // Search in Public Remarks (description)
        const remarks = property.StandardFields?.PublicRemarks || property.PublicRemarks || '';
        const remarksMatch = remarks.toLowerCase().includes(query);
        
        // Return true if ANY field matches
        return mlsMatch || addressMatch || streetMatch || cityMatch || 
               areaMatch || subdivisionMatch || typeMatch || agentMatch || 
               nameMatch || remarksMatch;
      });

      console.log(`✅ [SUPER SEARCH] Found ${results.length} matches for "${searchQuery}"`);
      
      if (results.length === 0) {
        console.log('💡 [SUPER SEARCH] No matches found. Try:');
        console.log('   - MLS Number (e.g., "25-4668")');
        console.log('   - Address (e.g., "Marina Cabo Plaza")');
        console.log('   - Area (e.g., "Pedregal")');
        console.log('   - Agent Name');
        console.log('   - Property Type');
      }

      const convertedResults = results.map(convertMLSToPropertyCard);
      setProperties(convertedResults);
      setCurrentPage(1);
      
    } catch (err) {
      console.error('❌ [SUPER SEARCH] Error:', err);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (filters: any, searchQuery?: string) => {
    console.log('🔍 [Domino] Filters received:', filters);
    console.log('🔍 [Domino] Search query:', searchQuery);
    
    // If there's a search query, use universal search
    if (searchQuery && searchQuery.trim()) {
      performUniversalSearch(searchQuery);
      return;
    }
    
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
    
    // Build API filters
    const apiFilters: any = {};
    
    // LOCATION: Priority order - Zone > Area > Community
    if (filters.zones && filters.zones.length > 0) {
      apiFilters.city = filters.zones[0];
    } else if (filters.areas && filters.areas.length > 0) {
      apiFilters.city = filters.areas[0];
    } else if (filters.communities && filters.communities.length > 0) {
      apiFilters.city = filters.communities[0];
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
    
    // PROPERTY TYPE
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
    
    // Clear search query when using filters
    setActiveSearchQuery("");
    loadProperties(apiFilters);
  };

  const handleReset = () => {
    setActiveSearchQuery("");
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
            resultCount={properties.length}
            totalCount={4528}
          />
          
          {/* Active Search Query Display */}
          {activeSearchQuery && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm">
                🔍 Searching for: <span className="font-semibold text-blue-700">"{activeSearchQuery}"</span>
                <button 
                  onClick={handleReset}
                  className="ml-3 text-blue-600 hover:text-blue-800 underline text-xs"
                >
                  Clear Search
                </button>
              </p>
            </div>
          )}
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
              <p className="text-muted-foreground mb-4">
                {activeSearchQuery 
                  ? `No properties found matching "${activeSearchQuery}"`
                  : "No properties found matching your criteria"}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Try searching by:
              </p>
              <div className="text-sm text-gray-600 mb-6 space-y-1">
                <p>• MLS Number (e.g., "25-4668")</p>
                <p>• Address (e.g., "Marina Cabo Plaza")</p>
                <p>• Area/Community (e.g., "Pedregal")</p>
                <p>• Agent Name</p>
                <p>• Property Type (e.g., "Condo")</p>
              </div>
              <Button onClick={handleReset} variant="outline">
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6 flex justify-between items-center">
                <p className="text-muted-foreground">
                  Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, properties.length)} of {properties.length} properties
                  {activeSearchQuery && (
                    <span className="ml-2 text-blue-600 font-medium">
                      matching "{activeSearchQuery}"
                    </span>
                  )}
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

              {/* Pagination Controls */}
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