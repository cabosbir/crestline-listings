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
import { searchProperties, getFlexMLSTotalCount } from "@/services/intelligentSearch";

const Properties = () => {
  const location = useLocation();
  const [properties, setProperties] = useState<any[]>([]);
  const [allProperties, setAllProperties] = useState<MLSProperty[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeSearchQuery, setActiveSearchQuery] = useState<string>("");
  const [totalCount, setTotalCount] = useState(4528);
  const ITEMS_PER_PAGE = 9;
  
  const FLEXMLS_IFRAME_URL = "https://link.flexmls.com/u67gqp77eml,12";

  // 🔥 REMOVED: No longer pre-load 200 properties on page load
  // Properties load on-demand when user searches or filters

  // Fetch real MLS total count
  useEffect(() => {
    const fetchTotalCount = async () => {
      const total = await getFlexMLSTotalCount();
      setTotalCount(total);
    };
    
    fetchTotalCount();
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

  // 🎯 INTELLIGENT ON-DEMAND SEARCH - Queries API when needed
  const performUniversalSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setProperties([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setActiveSearchQuery(searchQuery);
    
    try {
      const query = searchQuery.trim();
      console.log('🔍 [INTELLIGENT SEARCH] Querying API for:', query);
      
      const isMlsNumber = /^[\d-]+$/.test(query);
      const searchType = isMlsNumber ? 'mls' : 'text';
      
      console.log(`🎯 [SEARCH TYPE] Detected: ${searchType}`);
      
      const mlsProperties = await searchProperties(query, searchType);
      
      console.log(`✅ [API RESULT] Found ${mlsProperties.length} properties`);
      
      if (mlsProperties.length > 0) {
        console.log('📋 [SAMPLE]', {
          ListingId: mlsProperties[0].ListingId,
          Address: mlsProperties[0].UnparsedAddress,
          Price: mlsProperties[0].ListPrice
        });
      }
      
      const convertedResults = mlsProperties.map(convertMLSToPropertyCard);
      setProperties(convertedResults);
      setAllProperties(mlsProperties);
      setCurrentPage(1);
      
    } catch (err: any) {
      console.error('❌ [SEARCH ERROR]:', err);
      
      if (err.message?.includes('Rate limit') || err.message?.includes('429')) {
        setError('FlexMLS is rate limiting requests. Please wait a moment and try again.');
      } else {
        setError('Search failed. Please try again or use the "View in MLS" button.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (filters: any, searchQuery?: string) => {
    console.log('🔍 [Domino] Filters received:', filters);
    console.log('🔍 [Domino] Search query:', searchQuery);
    
    if (searchQuery && searchQuery.trim()) {
      performUniversalSearch(searchQuery);
      return;
    }
    
    const parsePrice = (priceStr: string | undefined) => {
      if (!priceStr || priceStr === "No Preference" || priceStr === "") return undefined;
      const cleaned = priceStr.replace(/[$,Million]/g, '').trim();
      const num = parseFloat(cleaned);
      if (isNaN(num)) return undefined;
      return priceStr.includes('Million') ? num * 1000000 : num;
    };
    
    const parseNumber = (str: string | undefined) => {
      if (!str || str === "Any" || str === "No Preference" || str === "") return undefined;
      const parsed = parseInt(str.replace('+', ''));
      return isNaN(parsed) ? undefined : parsed;
    };
    
    const apiFilters: any = {};
    
    if (filters.zones && filters.zones.length > 0) {
      apiFilters.city = filters.zones[0];
    } else if (filters.areas && filters.areas.length > 0) {
      apiFilters.city = filters.areas[0];
    } else if (filters.communities && filters.communities.length > 0) {
      apiFilters.city = filters.communities[0];
    }
    
    const minPrice = parsePrice(filters.minPrice);
    const maxPrice = parsePrice(filters.maxPrice);
    if (minPrice) apiFilters.minPrice = minPrice;
    if (maxPrice) apiFilters.maxPrice = maxPrice;
    
    const bedrooms = parseNumber(filters.minBeds);
    const bathrooms = parseNumber(filters.minBaths);
    if (bedrooms) apiFilters.bedrooms = bedrooms;
    if (bathrooms) apiFilters.bathrooms = bathrooms;
    
    if (filters.propertyTypes && filters.propertyTypes.length > 0) {
      apiFilters.propertyType = filters.propertyTypes[0];
    }
    
    if (filters.status && filters.status !== "Active") {
      apiFilters.status = filters.status;
    }
    
    const minSqft = parseNumber(filters.minSqft);
    if (minSqft) apiFilters.minSqft = minSqft;
    
    const yearBuilt = parseNumber(filters.yearBuilt);
    if (yearBuilt) apiFilters.yearBuilt = yearBuilt;
    
    console.log('🎯 [Domino] Sending filters to API:', apiFilters);
    
    setActiveSearchQuery("");
    loadProperties(apiFilters);
  };

  const handleReset = () => {
    setActiveSearchQuery("");
    setProperties([]);
  };

  const handleOpenFullSearch = () => {
    window.open(FLEXMLS_IFRAME_URL, '_blank');
  };

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

      <section className="pt-32 pb-8 bg-secondary">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
            Cabo San Lucas Properties
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mb-6">
            Search {totalCount.toLocaleString()}+ luxury properties across Baja California Sur including Cabo San Lucas, 
            San Jose del Cabo, Todos Santos, East Cape, and La Paz
          </p>

          <AdvancedPropertyFilters 
            onApplyFilters={handleApplyFilters}
            onReset={handleReset}
            resultCount={properties.length}
            totalCount={totalCount}
          />
          
          {activeSearchQuery && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
              <p className="text-sm">
                🔍 <span className="font-semibold text-blue-700">"{activeSearchQuery}"</span>
                <span className="text-gray-600 ml-2">
                  ({properties.length} {properties.length === 1 ? 'result' : 'results'})
                </span>
              </p>
              <button 
                onClick={handleReset}
                className="text-blue-600 hover:text-blue-800 underline text-sm"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      </section>

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
              {activeSearchQuery ? (
                <>
                  <p className="text-muted-foreground mb-4 text-lg font-semibold">
                    No properties found matching "{activeSearchQuery}"
                  </p>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto mb-6">
                    <h3 className="font-semibold text-blue-800 mb-3">💡 Search Tips</h3>
                    <div className="text-sm text-blue-700 space-y-2 text-left">
                      <p>• Try searching with different spelling or format</p>
                      <p>• Remove dashes from MLS numbers (e.g., "254668" instead of "25-4668")</p>
                      <p>• Try searching by address or city instead</p>
                      <p>• Use the <strong>"View in MLS"</strong> button to access the full FlexMLS portal</p>
                    </div>
                  </div>
                  
                  <Button onClick={handleReset} variant="outline">
                    Clear Search
                  </Button>
                </>
              ) : (
                <>
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold text-gray-800 mb-3">
                      Search {totalCount.toLocaleString()}+ Luxury Properties
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                      Use the search bar above or Advanced Filters to find your perfect property in Cabo San Lucas, 
                      San Jose del Cabo, and throughout Baja California Sur.
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
                    <button 
                      onClick={() => document.querySelector('input[placeholder*="MLS"]')?.focus()}
                      className="p-6 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-all cursor-pointer text-left"
                    >
                      <div className="text-4xl mb-3">🔍</div>
                      <h3 className="font-semibold text-blue-900 mb-2">Quick Search</h3>
                      <p className="text-sm text-blue-700">
                        Search by MLS number, address, or property type in the search bar above
                      </p>
                    </button>
                    
                    <button 
                      onClick={() => document.querySelector('[class*="Advanced Filters"]')?.click()}
                      className="p-6 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 hover:border-purple-300 transition-all cursor-pointer text-left"
                    >
                      <div className="text-4xl mb-3">🎯</div>
                      <h3 className="font-semibold text-purple-900 mb-2">Advanced Filters</h3>
                      <p className="text-sm text-purple-700">
                        Use the Advanced Filters button to search by location, price, beds, and more
                      </p>
                    </button>
                    
                    <button 
                      onClick={() => navigate('/properties/map')}
                      className="p-6 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 hover:border-green-300 transition-all cursor-pointer text-left"
                    >
                      <div className="text-4xl mb-3">🗺️</div>
                      <h3 className="font-semibold text-green-900 mb-2">Map Search</h3>
                      <p className="text-sm text-green-700">
                        Browse properties visually with our interactive map search feature
                      </p>
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-4">
                    Try searching by:
                  </p>
                  <div className="text-sm text-gray-600 mb-6 space-y-1">
                    <p>• MLS Number (e.g., "25-4668")</p>
                    <p>• Address (e.g., "Marina Cabo Plaza")</p>
                    <p>• City (e.g., "Cabo San Lucas")</p>
                    <p>• Property Type (e.g., "Condo")</p>
                  </div>
                </>
              )}
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