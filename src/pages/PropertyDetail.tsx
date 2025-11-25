import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import { Button } from "@/components/ui/button";
import { 
  Bed, Bath, Maximize, MapPin, ArrowLeft, X,
  Calendar, CheckCircle2, Loader2, ChevronLeft, ChevronRight
} from "lucide-react";
import { fetchPropertyById, type MLSProperty } from "@/services/flexMlsService";

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadProperty();
  }, [id]);

  const loadProperty = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 Loading property with ID:', id);
      console.log('📍 Location state:', location.state);
      
      if (!id) {
        console.error('❌ No property ID provided');
        setError('No property ID provided');
        setProperty(null);
        setLoading(false);
        return;
      }
      
      // First try to fetch from API
      const mlsProperty: MLSProperty | null = await fetchPropertyById(id);
      
      if (mlsProperty) {
        console.log('✅ MLS Property received:', mlsProperty);
        
        const convertedProperty = {
          id: mlsProperty.ListingKey,
          mlsNumber: mlsProperty.ListingId || id,
          title: mlsProperty.UnparsedAddress || 'Luxury Property in Cabo San Lucas',
          price: `$${mlsProperty.ListPrice?.toLocaleString() || '0'}`,
          location: mlsProperty.City || 'Cabo San Lucas',
          fullLocation: `${mlsProperty.City || 'Cabo San Lucas'}, ${mlsProperty.StateOrProvince || 'BCS'}`,
          beds: mlsProperty.BedroomsTotal || 0,
          baths: mlsProperty.BathroomsFull || 0,
          sqft: `${mlsProperty.LivingArea?.toLocaleString() || '0'} sq ft`,
          lotSize: mlsProperty.LotSizeArea ? `${mlsProperty.LotSizeArea.toLocaleString()} sqft` : 'N/A',
          yearBuilt: mlsProperty.YearBuilt || 'N/A',
          propertyType: mlsProperty.PropertyType || 'Residential',
          status: mlsProperty.StandardStatus || 'Active',
          image: mlsProperty.Media?.[0]?.MediaURL || 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&h=1000&fit=crop',
          images: mlsProperty.Media?.slice(0, 10).map(m => m.MediaURL) || [
            'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&h=1000&fit=crop'
          ],
          description: mlsProperty.PublicRemarks || 'Beautiful luxury property in Cabo San Lucas with premium finishes and stunning views.',
          features: extractFeatures(mlsProperty)
        };
        
        console.log('✅ Converted property:', convertedProperty);
        setProperty(convertedProperty);
      } else {
        console.error('❌ Property not found from API');
        setError('Property not found. The API returned no data.');
        setProperty(null);
      }
    } catch (error) {
      console.error('💥 Error loading property:', error);
      setError('Error loading property details. Please try again.');
      setProperty(null);
    } finally {
      setLoading(false);
    }
  };

  const extractFeatures = (mlsProperty: MLSProperty): string[] => {
    const features: string[] = [];
    
    if (mlsProperty.Appliances && Array.isArray(mlsProperty.Appliances)) {
      features.push(...mlsProperty.Appliances.slice(0, 3));
    }
    if (mlsProperty.ArchitecturalStyle) {
      features.push(mlsProperty.ArchitecturalStyle);
    }
    if (mlsProperty.Cooling) {
      features.push(`${mlsProperty.Cooling} Cooling`);
    }
    if (mlsProperty.Heating) {
      features.push(`${mlsProperty.Heating} Heating`);
    }
    if (mlsProperty.ParkingFeatures) {
      features.push(`Parking: ${mlsProperty.ParkingFeatures}`);
    }
    if (mlsProperty.View) {
      features.push(`View: ${mlsProperty.View}`);
    }
    if (mlsProperty.WaterfrontFeatures) {
      features.push('Waterfront');
    }
    if (mlsProperty.PoolFeatures) {
      features.push('Pool');
    }
    if (mlsProperty.PatioAndPorchFeatures) {
      features.push('Patio/Porch');
    }
    
    if (features.length === 0) {
      features.push('Modern Finishes', 'Open Floor Plan', 'Prime Location', 'High-End Appliances', 'Quality Construction', 'Excellent Condition');
    }
    
    return features.slice(0, 9);
  };

  const nextImage = () => {
    if (property && property.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === property.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (property && property.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? property.images.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-accent mb-4 mx-auto" />
            <p className="text-xl text-muted-foreground">Loading property details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Property Not Found</h1>
            <p className="text-muted-foreground mb-6">
              {error || "The property you're looking for doesn't exist or has been removed."}
            </p>
            <div className="mb-6 p-4 bg-secondary rounded-lg">
              <p className="text-sm text-muted-foreground font-mono break-all">
                Property ID: {id}
              </p>
            </div>
            <Button onClick={() => navigate('/properties')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Properties
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <FloatingContact />

      <div className="container mx-auto px-4 pt-32 pb-4">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/properties')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Browse
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/')}
            className="mb-4 hover:bg-accent/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Hero Image Gallery */}
      <section className="pb-12">
        <div className="container mx-auto px-4">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ height: "500px" }}>
            <img 
              src={property.images[currentImageIndex]}
              alt={`${property.title} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover transition-opacity duration-300"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&h=1000&fit=crop';
              }}
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="bg-primary text-white px-4 py-2 rounded-lg font-semibold shadow-lg">
                {property.status}
              </span>
              <span className="bg-accent text-accent-foreground px-4 py-2 rounded-lg font-semibold shadow-lg">
                MLS: {property.mlsNumber}
              </span>
            </div>

            {/* Image Counter */}
            {property.images.length > 1 && (
              <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                {currentImageIndex + 1} / {property.images.length}
              </div>
            )}
          </div>

          {/* Navigation Arrows Below Image */}
          {property.images.length > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <Button
                onClick={prevImage}
                variant="outline"
                size="lg"
                className="rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <ChevronLeft className="h-6 w-6" />
                Previous
              </Button>
              
              <div className="flex gap-2">
                {property.images.map((_: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      index === currentImageIndex 
                        ? 'bg-accent w-8' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>

              <Button
                onClick={nextImage}
                variant="outline"
                size="lg"
                className="rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Next
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          )}

          {/* Thumbnail Gallery */}
          {property.images.length > 1 && (
            <div className="grid grid-cols-5 gap-4 mt-6">
              {property.images.slice(0, 5).map((img: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative h-24 rounded-lg overflow-hidden transition-all ${
                    index === currentImageIndex 
                      ? 'ring-4 ring-accent scale-105' 
                      : 'hover:ring-2 ring-gray-300 hover:scale-105 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=200&h=150&fit=crop';
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="mb-8">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{property.title}</h1>
                <div className="text-4xl font-bold text-accent mb-4">{property.price}</div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-5 h-5" />
                  <span className="text-lg">{property.fullLocation}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-secondary border border-border rounded-xl p-4 text-center">
                  <Bed className="w-6 h-6 mx-auto mb-2 text-accent" />
                  <div className="text-sm text-muted-foreground">Bedrooms</div>
                  <div className="text-2xl font-bold">{property.beds}</div>
                </div>
                <div className="bg-secondary border border-border rounded-xl p-4 text-center">
                  <Bath className="w-6 h-6 mx-auto mb-2 text-accent" />
                  <div className="text-sm text-muted-foreground">Bathrooms</div>
                  <div className="text-2xl font-bold">{property.baths}</div>
                </div>
                <div className="bg-secondary border border-border rounded-xl p-4 text-center">
                  <Maximize className="w-6 h-6 mx-auto mb-2 text-accent" />
                  <div className="text-sm text-muted-foreground">Size</div>
                  <div className="text-xl font-bold">{property.sqft}</div>
                </div>
                <div className="bg-secondary border border-border rounded-xl p-4 text-center">
                  <Calendar className="w-6 h-6 mx-auto mb-2 text-accent" />
                  <div className="text-sm text-muted-foreground">Built</div>
                  <div className="text-2xl font-bold">{property.yearBuilt}</div>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-4">About This Property</h2>
                <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-6">Features & Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-6">Additional Details</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Lot Size</div>
                    <div className="font-semibold">{property.lotSize}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Property Type</div>
                    <div className="font-semibold">{property.propertyType}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Status</div>
                    <div className="font-semibold">{property.status}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">MLS Number</div>
                    <div className="font-semibold">{property.mlsNumber}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-32">
                <div className="bg-card border border-border rounded-2xl p-6 shadow-elegant">
                  <h3 className="text-2xl font-bold mb-4">Interested in this property?</h3>
                  <p className="text-muted-foreground mb-6">
                    Contact us today to schedule a viewing or get more information.
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <Button 
                      variant="luxury" 
                      size="lg" 
                      className="w-full"
                      onClick={() => navigate('/contact')}
                    >
                      Contact Agent
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="w-full"
                      onClick={() => navigate('/new-client', {
                        state: {
                          propertyId: property.id,
                          mlsNumber: property.mlsNumber,
                          propertyAddress: property.title,
                          propertyPrice: property.price,
                          propertyType: property.propertyType
                        }
                      })}
                    >
                      Schedule Viewing
                    </Button>
                  </div>

                  <div className="border-t border-border pt-6">
                    <div className="text-sm text-muted-foreground mb-2">MLS Number</div>
                    <div className="font-semibold mb-4">{property.mlsNumber}</div>
                    
                    <div className="text-sm text-muted-foreground mb-2">Share Property</div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          alert('Link copied to clipboard!');
                        }}
                      >
                        Copy Link
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          window.location.href = `mailto:?subject=${encodeURIComponent(property.title)}&body=${encodeURIComponent(window.location.href)}`;
                        }}
                      >
                        Email
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PropertyDetail;