import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import PropertyCard from "@/components/PropertyCard";
import LeafletPropertyMap from "@/components/LeafletPropertyMap";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight, Map, Grid, SlidersHorizontal } from "lucide-react";
import { fetchListings, convertMLSToPropertyCard, type MLSProperty } from "@/services/flexMlsService";
import { searchProperties, getFlexMLSTotalCount } from "@/services/intelligentSearch";

const Properties = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [allProperties, setAllProperties] = useState<MLSProperty[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeSearchQuery, setActiveSearchQuery] = useState<string>("");
  const [totalCount, setTotalCount] = useState(4528);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const ITEMS_PER_PAGE = 9;

  // ⭐ SAVE STATE - Save page number, view mode, and scroll position
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const browseState = {
        url: window.location.pathname + window.location.search,
        scrollPosition: window.scrollY,
        currentPage: currentPage,
        viewMode: viewMode,
        timestamp: Date.now()
      };
      sessionStorage.setItem('propertiesBrowseState', JSON.stringify(browseState));
      console.log('💾 Saved browse state:', browseState);
    }
  }, [currentPage, viewMode]);

  // Fetch real MLS total count
  useEffect(() => {
    const fetchTotalCount = async () => {
      const total = await getFlexMLSTotalCount();
      setTotalCount(total);
    };
    
    fetchTotalCount();
  }, []);

  // Handle URL parameters for searches and filters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    // Check for direct search (MLS number, address, text search)
    const mlsNumberParam = params.get('mlsNumber');
    const addressParam = params.get('address');
    const searchParam = params.get('search');
    
    if (mlsNumberParam || addressParam || searchParam) {
      const searchQuery = mlsNumberParam || addressParam || searchParam || "";
      setActiveSearchQuery(searchQuery);
      performUniversalSearch(searchQuery);
      return;
    }
    
    // ⭐ Check for filter params from AdvancedSearch
    const zonesParam = params.get('zones');
    const areasParam = params.get('areas');
    const communitiesParam = params.get('communities');
    const subdivisionsParam = params.get('subdivisions');
    const minPriceParam = params.get('minPrice');
    const maxPriceParam = params.get('maxPrice');
    const bedsParam = params.get('beds');
    const bathsParam = params.get('baths');
    const propertyTypesParam = params.get('propertyTypes');
    const statusParam = params.get('status');
    
    // ⭐ Special filters
    const sellerFinancingParam = params.get('sellerFinancing');
    const primaryViewParam = params.get('primaryView');
    const currentPriceParam = params.get('currentPrice');
    console.log("DEBUG FILTER TYPES:", {
      sellerFinancingParam,
      type: typeof sellerFinancingParam,
    });
    
    if (zonesParam || areasParam || communitiesParam || subdivisionsParam) {
      // Build filters object from URL params
      const apiFilters: any = {};
      
      // Location filters
      if (zonesParam) apiFilters.city = zonesParam.split(',');
      if (areasParam) apiFilters.area = areasParam.split(',');
      
      // ⭐ Community filter
      if (communitiesParam) {
        apiFilters.communities = communitiesParam.split(',');
        console.log('🏘️ Communities filter:', apiFilters.communities);
      }
      
      if (subdivisionsParam) {
        apiFilters.subdivisions = subdivisionsParam.split(',');
        console.log('🏘️ Subdivisions filter:', apiFilters.subdivisions);
      }

      // Price & property filters
      if (minPriceParam) apiFilters.minPrice = parsePrice(minPriceParam);
      if (maxPriceParam) apiFilters.maxPrice = parsePrice(maxPriceParam);
      if (bedsParam) apiFilters.bedrooms = parseInt(bedsParam.replace('+', ''));
      if (bathsParam) apiFilters.bathrooms = parseInt(bathsParam.replace('+', ''));
      if (propertyTypesParam) apiFilters.propertyTypes = propertyTypesParam.split(',');
      if (statusParam) apiFilters.status = statusParam;
      
      // ⭐ Special filters - will be applied CLIENT-SIDE in flexMlsService
      if (sellerFinancingParam === 'true') apiFilters.sellerFinancing = true;
      if (primaryViewParam === 'true') apiFilters.primaryView = true;
      if (currentPriceParam === 'true') apiFilters.currentPrice = true;
      
      console.log('🔍 [PROPERTIES] Loading from AdvancedSearch filters:', apiFilters);
      loadProperties(apiFilters).then(() => {
        // Restore state AFTER properties load
        const returning = sessionStorage.getItem('returningFromProperty');
        if (returning === 'true') {
          const savedState = sessionStorage.getItem('propertiesBrowseState');
          if (savedState) {
            try {
              const state = JSON.parse(savedState);
              const isRecent = (Date.now() - state.timestamp) < 30 * 60 * 1000;
              const urlMatches = state.url === (window.location.pathname + window.location.search);
              
              if (urlMatches && isRecent) {
                console.log('🔄 Restoring page:', state.currentPage);
                setCurrentPage(state.currentPage || 1);
                setViewMode(state.viewMode || 'list');
                setTimeout(() => {
                  window.scrollTo({ top: state.scrollPosition || 0, behavior: 'smooth' });
                }, 100);
              }
            } catch (e) {
              console.error('Error restoring:', e);
            }
          }
          sessionStorage.removeItem('returningFromProperty');
        } else {
          // New search - reset to page 1
          setCurrentPage(1);
        }
      });
    }
  }, [location.search]);

  const parsePrice = (priceStr: string): number => {
    if (!priceStr || priceStr === "No Preference") return 0;
    const cleaned = priceStr.replace(/[$,Million]/g, '').trim();
    const num = parseFloat(cleaned);
    if (isNaN(num)) return 0;
    return priceStr.includes('Million') ? num * 1000000 : num;
  };

  const loadProperties = async (filters?: any) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🧠 Loading properties with filters:', filters);
      const mlsProperties: MLSProperty[] = await fetchListings(filters);
      console.log('👍 Received properties:', mlsProperties.length);

      setAllProperties(mlsProperties);

      const convertedProperties = mlsProperties.map(convertMLSToPropertyCard);
      setProperties(convertedProperties);

      // Don't reset page - let state restoration handle it
      // Only reset if currentPage is still 1 (initial state)
      
    } catch (err) {
      console.error('❌ Error loading properties:', err);
      setError('Failed to load properties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
        setAllProperties(mlsProperties);
        const convertedProperties = mlsProperties.map(convertMLSToPropertyCard);
        setProperties(convertedProperties);
        // Don't reset page here either
      } else {
        setProperties([]);
        setError(`No properties found matching "${query}"`);
      }
    } catch (err) {
      console.error('❌ [SEARCH ERROR]:', err);
      setError('Search failed. Please try again.');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setProperties([]);
    setAllProperties([]);
    setActiveSearchQuery("");
    setCurrentPage(1);
    setError(null);
    navigate('/properties');
  };

  const cameFromAdvancedSearch = () => {
    const params = new URLSearchParams(location.search);
    return params.has('zones') || params.has('areas') || params.has('communities') || params.has('subdivisions');
  };

  const goBackToFilters = () => {
    navigate(`/search${location.search}`);
  };

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = properties.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(properties.length / ITEMS_PER_PAGE);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get properties with coordinates for map
  const propertiesWithCoords = properties.filter(p => p.latitude && p.longitude);
  const mapCenter = propertiesWithCoords.length > 0
    ? {
        lat: propertiesWithCoords.reduce((sum, p) => sum + p.latitude, 0) / propertiesWithCoords.length,
        lng: propertiesWithCoords.reduce((sum, p) => sum + p.longitude, 0) / propertiesWithCoords.length
      }
    : { lat: 23.0545, lng: -109.7084 };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <FloatingContact />

      <section className="pt-32 pb-12 bg-secondary">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Cabo San Lucas Properties
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Search {totalCount.toLocaleString()}+ Properties across Baja California Sur including Cabo San Lucas, 
            San Jose del Cabo, Todos Santos, East Cape, and La Paz
          </p>

          {/* Advanced Filters Button */}
          <div className="flex gap-4 items-start">
            <Button
              size="lg"
              onClick={() => navigate('/search')}
              className="gap-2"
            >
              <SlidersHorizontal className="w-5 h-5" />
              Advanced Filters
            </Button>

            {/* View Mode Toggle - Only show when results exist */}
            {properties.length > 0 && (
              <div className="flex gap-2 bg-card border border-border rounded-lg p-1">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="gap-2"
                >
                  <Grid className="w-4 h-4" />
                  List
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                  className="gap-2"
                  disabled={propertiesWithCoords.length === 0}
                >
                  <Map className="w-4 h-4" />
                  Map {propertiesWithCoords.length > 0 && `(${propertiesWithCoords.length})`}
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-accent mb-4 mx-auto" />
                <p className="text-muted-foreground">Loading properties...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={handleReset}>Start New Search</Button>
              </div>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-12">
              <div className="max-w-2xl mx-auto bg-blue-50 border border-blue-200 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-blue-900 mb-3">
                  👈 Use Advanced Filters to Start Searching
                </h2>
                <p className="text-blue-700 mb-6">
                  Select your preferences in the filters panel to find your perfect property. 
                  You can search by location, price range, bedrooms, and more!
                </p>
                <div className="text-sm text-blue-600 space-y-2">
                  <p><strong>Quick Tips:</strong></p>
                  <p>• Select a Zone (Cabo San Lucas, San Jose del Cabo, etc.)</p>
                  <p>• Set your price range and property preferences</p>
                  <p>• Click "View Results" to see filtered properties</p>
                  <p>• Toggle between List and Map view once results load</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {viewMode === 'map' ? (
                // MAP VIEW
                <div>
                  <div className="mb-6 flex justify-between items-center">
                    <p className="text-muted-foreground">
                      Showing {propertiesWithCoords.length} of {properties.length} properties on map
                    </p>
                    <div className="flex gap-2">
                      {cameFromAdvancedSearch() && (
                        <Button 
                          variant="outline" 
                          onClick={goBackToFilters}
                        >
                          ← Back to Filters
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        onClick={handleReset}
                      >
                        Clear Search
                      </Button>
                    </div>
                  </div>

                  {propertiesWithCoords.length === 0 ? (
                    <div className="text-center py-12 bg-yellow-50 border border-yellow-200 rounded-xl">
                      <p className="text-yellow-800 mb-4">
                        None of the search results have location data for map display.
                      </p>
                      <Button onClick={() => setViewMode('list')}>
                        View as List Instead
                      </Button>
                    </div>
                  ) : (
                    <div className="grid lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                        <LeafletPropertyMap 
                          properties={propertiesWithCoords}
                          center={mapCenter}
                          zoom={11}
                        />
                      </div>
                      <div className="lg:col-span-1 max-h-[600px] overflow-y-auto space-y-4">
                        {propertiesWithCoords.map((property, index) => (
                          <div 
                            key={property.id}
                            className="bg-card border-2 border-border rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all"
                            onClick={() => {
                              // ⭐ Mark that we're leaving to view a property
                              sessionStorage.setItem('returningFromProperty', 'true');
                              navigate(`/property/${property.mlsNumber || property.id}`);
                            }}
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                {index + 1}
                              </div>
                              <img
                                src={property.image}
                                alt={property.title}
                                className="flex-1 h-32 object-cover rounded-lg"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=200&fit=crop';
                                }}
                              />
                            </div>

                            <div className="text-xl font-bold text-accent mb-2">{property.price}</div>
                            <div className="text-sm line-clamp-2 mb-2">{property.title}</div>
                            <div className="text-xs text-muted-foreground">{property.location}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // LIST VIEW
                <>
                  <div className="mb-6 flex justify-between items-center">
                    <p className="text-muted-foreground">
                      Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, properties.length)} of {properties.length} properties
                    </p>

                    <div className="flex gap-2">
                      {cameFromAdvancedSearch() && (
                        <Button 
                          variant="outline" 
                          onClick={goBackToFilters}
                        >
                          ← Back to Filters
                        </Button>
                      )}

                      <Button 
                        variant="outline" 
                        onClick={handleReset}
                      >
                        Clear Search
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {currentItems.map((property) => (
                      <div
                        key={property.id}
                        onClick={() => {
                          // ⭐ Mark that we're leaving to view a property
                          sessionStorage.setItem('returningFromProperty', 'true');
                        }}
                      >
                        <PropertyCard {...property} currentPage={currentPage} />
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          if (totalPages <= 7) return true;
                          if (page === 1 || page === totalPages) return true;
                          if (Math.abs(page - currentPage) <= 1) return true;
                          return false;
                        })
                        .map((page, index, array) => (
                          <div key={page} className="flex items-center gap-2">
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className="text-muted-foreground">...</span>
                            )}

                            <Button
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => paginate(page)}
                            >
                              {page}
                            </Button>
                          </div>
                        ))}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Properties;