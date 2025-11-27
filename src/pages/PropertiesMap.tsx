import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import LeafletPropertyMap from "@/components/LeafletPropertyMap";
import { Button } from "@/components/ui/button";
import { ArrowLeft, List, Loader2, MapPin, Bed, Bath, ExternalLink } from "lucide-react";
import { fetchListings, convertMLSToPropertyCard, type MLSProperty } from "@/services/flexMlsService";

const PropertiesMap = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [hoveredProperty, setHoveredProperty] = useState<any>(null);

  useEffect(() => {
    loadProperties();
  }, [searchParams]);

  const loadProperties = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (searchParams.get('city')) filters.city = searchParams.get('city');
      if (searchParams.get('minPrice')) filters.minPrice = searchParams.get('minPrice');
      if (searchParams.get('maxPrice')) filters.maxPrice = searchParams.get('maxPrice');
      if (searchParams.get('bedrooms')) filters.bedrooms = searchParams.get('bedrooms');
      if (searchParams.get('bathrooms')) filters.bathrooms = searchParams.get('bathrooms');

      console.log('🗺️ Loading map with filters:', filters);
      
      const mlsProperties: MLSProperty[] = await fetchListings(filters);
      const convertedProperties = mlsProperties
        .map(convertMLSToPropertyCard)
        .filter(p => p.latitude && p.longitude);
      
      console.log('📍 Properties with coordinates:', convertedProperties.length);
      setProperties(convertedProperties);
    } catch (err) {
      console.error('❌ Error loading map properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMapCenter = () => {
    if (properties.length === 0) {
      return { lat: 23.0545, lng: -109.7084 };
    }
    
    const avgLat = properties.reduce((sum, p) => sum + (p.latitude || 0), 0) / properties.length;
    const avgLng = properties.reduce((sum, p) => sum + (p.longitude || 0), 0) / properties.length;
    
    return { lat: avgLat, lng: avgLng };
  };

  const center = getMapCenter();

  // Open FlexMLS with all properties on map
  const openFlexMLSMap = () => {
    const params = new URLSearchParams();
    if (searchParams.get('city')) params.append('Location', searchParams.get('city')!);
    
    window.open(`https://link.flexmls.com/1lpm0zo1944e,12?${params.toString()}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <FloatingContact />

      <section className="pt-32 pb-6 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={() => navigate('/search')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to List View
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={openFlexMLSMap}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in FlexMLS
              </Button>
              <Button variant="default" onClick={() => navigate('/search')}>
                <List className="w-4 h-4 mr-2" />
                List View
              </Button>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">Interactive Map View</h1>
          <p className="text-xl text-muted-foreground">
            {loading ? 'Loading properties...' : `Showing ${properties.length} properties • Click any pin to view details`}
          </p>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-accent mb-4 mx-auto" />
                <p className="text-muted-foreground">Loading map...</p>
              </div>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-20">
              <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">No Properties Found</h2>
              <p className="text-muted-foreground mb-6">
                No properties with location data match your filters.
              </p>
              <Button onClick={() => navigate('/search')}>View All Properties</Button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* FREE LEAFLET MAP - NO API KEY! */}
              <div className="lg:col-span-2">
                <div className="sticky top-4">
                  <LeafletPropertyMap 
                    properties={properties}
                    center={center}
                    zoom={11}
                  />
                  
                  <div className="mt-4 p-4 bg-card rounded-xl border border-border">
                    <div className="text-sm font-semibold mb-2">
                      📍 {properties.length} properties with location data
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      • Click any red pin to view property details<br/>
                      • Hover over pins to see quick info<br/>
                      • Properties are numbered matching the sidebar
                    </p>
                  </div>
                </div>
              </div>

              {/* PROPERTY LIST SIDEBAR */}
              <div className="lg:col-span-1">
                <div className="space-y-4 max-h-[680px] overflow-y-auto pr-2">
                  {properties.map((property, index) => (
                    <div
                      key={property.id}
                      className={`bg-card border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
                        selectedProperty?.id === property.id ? 'border-accent shadow-lg scale-[1.02]' : 'border-border'
                      } ${
                        hoveredProperty?.id === property.id ? 'ring-2 ring-accent' : ''
                      }`}
                      onClick={() => {
                        setSelectedProperty(property);
                        navigate(`/property/${property.mlsNumber || property.id}`);
                      }}
                      onMouseEnter={() => setHoveredProperty(property)}
                      onMouseLeave={() => setHoveredProperty(null)}
                    >
                      {/* Property Number Badge */}
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
                      
                      <div className="text-2xl font-bold text-accent mb-2">{property.price}</div>

                      <div className="flex items-center gap-3 mb-2 text-sm">
                        <div className="flex items-center gap-1">
                          <Bed className="w-4 h-4" />
                          <span>{property.beds}</span>
                        </div>
                        <span className="text-muted-foreground">•</span>
                        <div className="flex items-center gap-1">
                          <Bath className="w-4 h-4" />
                          <span>{property.baths}</span>
                        </div>
                      </div>

                      <div className="text-sm line-clamp-2 mb-2 font-medium">{property.title}</div>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                        <MapPin className="w-3 h-3" />
                        {property.location}
                      </div>

                      <Button 
                        size="sm" 
                        className="w-full" 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/property/${property.mlsNumber || property.id}`);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PropertiesMap;
