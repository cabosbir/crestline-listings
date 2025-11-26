import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import { Button } from "@/components/ui/button";
import { ArrowLeft, List, Loader2, MapPin, Bed, Bath } from "lucide-react";
import { fetchListings, convertMLSToPropertyCard, type MLSProperty } from "@/services/flexMlsService";

const PropertiesMap = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  useEffect(() => {
    loadProperties();
  }, [searchParams]);

  const loadProperties = async () => {
    setLoading(true);
    try {
      // Get filters from URL params
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
        .filter(p => p.latitude && p.longitude); // Only show properties with coordinates
      
      console.log('📍 Properties with coordinates:', convertedProperties.length);
      setProperties(convertedProperties);
    } catch (err) {
      console.error('❌ Error loading map properties:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate center of map based on properties
  const getMapCenter = () => {
    if (properties.length === 0) {
      return { lat: 23.0545, lng: -109.7084 }; // Cabo San Lucas default
    }
    
    const avgLat = properties.reduce((sum, p) => sum + (p.latitude || 0), 0) / properties.length;
    const avgLng = properties.reduce((sum, p) => sum + (p.longitude || 0), 0) / properties.length;
    
    return { lat: avgLat, lng: avgLng };
  };

  const center = getMapCenter();

  // Build Google Maps URL with markers
  const buildMapUrl = () => {
    const baseUrl = 'https://maps.google.com/maps?';
    const params = new URLSearchParams({
      t: '',
      z: '12',
      ie: 'UTF8',
      iwloc: '',
      output: 'embed',
      q: `${center.lat},${center.lng}`
    });

    // Add markers for each property (Google Maps iframe has marker limit, so we'll use a different approach)
    return `${baseUrl}${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <FloatingContact />

      {/* Header */}
      <section className="pt-32 pb-6 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/properties')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to List View
            </Button>
            
            <Button 
              variant="default"
              onClick={() => navigate('/properties')}
            >
              <List className="w-4 h-4 mr-2" />
              Switch to List View
            </Button>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Map View
          </h1>
          <p className="text-xl text-muted-foreground">
            {loading ? 'Loading properties...' : `Showing ${properties.length} properties on map`}
          </p>
        </div>
      </section>

      {/* Map Section */}
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
              <Button onClick={() => navigate('/properties')}>
                View All Properties
              </Button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Map */}
              <div className="lg:col-span-2">
                <div className="sticky top-4">
                  <div className="bg-secondary rounded-xl overflow-hidden border border-border shadow-lg">
                    <iframe
                      src={buildMapUrl()}
                      className="w-full h-[600px] border-0"
                      title="Properties Map"
                      allowFullScreen
                      loading="lazy"
                    />
                    <div className="p-4 bg-card">
                      <div className="text-sm text-muted-foreground mb-2">
                        📍 Showing {properties.length} properties with location data
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Note: Click on properties in the sidebar to view details. For interactive pins, 
                        we recommend using the FlexMLS native map which supports advanced mapping features.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Property List Sidebar */}
              <div className="lg:col-span-1">
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {properties.map((property) => (
                    <div
                      key={property.id}
                      className={`bg-card border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg ${
                        selectedProperty?.id === property.id 
                          ? 'border-accent shadow-lg' 
                          : 'border-border'
                      }`}
                      onClick={() => {
                        setSelectedProperty(property);
                        navigate(`/property/${property.id}`);
                      }}
                    >
                      <img
                        src={property.image}
                        alt={property.title}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=200&fit=crop';
                        }}
                      />
                      
                      <div className="text-2xl font-bold text-accent mb-2">
                        {property.price}
                      </div>

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

                      <div className="text-sm line-clamp-2 mb-2">
                        {property.title}
                      </div>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {property.location}
                      </div>

                      <Button 
                        size="sm" 
                        className="w-full mt-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/property/${property.id}`);
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
