import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import { Button } from "@/components/ui/button";
import { 
  Bed, Bath, Maximize, MapPin, ArrowLeft, X,
  Home, Calendar, CheckCircle2 
} from "lucide-react";

// Uncomment when FlexMLS is ready
// import { fetchPropertyById } from "@/services/flexMlsService";

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data - will be replaced by FlexMLS
  const mockProperties = [
    {
      id: 1,
      title: "Beachfront Paradise Villa",
      price: "$2,850,000",
      location: "Marina District",
      fullLocation: "Marina District, Cabo San Lucas",
      beds: 5,
      baths: 4,
      sqft: "4,500 sq ft",
      lotSize: "8,000 sqft",
      yearBuilt: 2022,
      propertyType: "Villa",
      status: "Sale",
      image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&h=1000&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&h=1000&fit=crop",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&h=1000&fit=crop",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&h=1000&fit=crop"
      ],
      description: "Extraordinary beachfront villa with panoramic ocean views. Modern Mexican architecture with premium finishes, expansive outdoor living, and direct beach access. This stunning property offers the ultimate coastal lifestyle.",
      features: [
        "Ocean Views",
        "Infinity Pool",
        "Outdoor Kitchen",
        "Guest Casita",
        "Beach Access",
        "Smart Home",
        "Wine Cellar",
        "Home Theater",
        "Gym"
      ]
    },
    {
      id: 2,
      title: "Golf Course Estate",
      price: "$3,200,000",
      location: "Sunset Hills",
      fullLocation: "Quivira, Cabo San Lucas",
      beds: 4,
      baths: 5,
      sqft: "5,200 sq ft",
      lotSize: "10,000 sqft",
      yearBuilt: 2020,
      propertyType: "Estate",
      status: "Sale",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&h=1000&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&h=1000&fit=crop",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&h=1000&fit=crop",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1600&h=1000&fit=crop"
      ],
      description: "Extraordinary golf course estate in Quivira with panoramic ocean and fairway views. Modern Mexican architecture with premium finishes, expansive outdoor living, and access to world-class Jack Nicklaus golf course.",
      features: [
        "Golf Course Views",
        "Ocean Views",
        "Infinity Pool",
        "Outdoor Kitchen",
        "Game Room",
        "Golf Cart",
        "Guest Casita",
        "Home Theater"
      ]
    },
    {
      id: 3,
      title: "Oceanfront Penthouse",
      price: "$4,500,000",
      location: "Downtown Luxury",
      fullLocation: "Downtown, Cabo San Lucas",
      beds: 3,
      baths: 3,
      sqft: "3,200 sq ft",
      lotSize: "N/A",
      yearBuilt: 2021,
      propertyType: "Penthouse",
      status: "Sale",
      image: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1600&h=1000&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1600&h=1000&fit=crop",
        "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1600&h=1000&fit=crop",
        "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=1600&h=1000&fit=crop"
      ],
      description: "Luxurious oceanfront penthouse in the heart of downtown with breathtaking panoramic views. Modern design with floor-to-ceiling windows, premium finishes, and exclusive amenities.",
      features: [
        "Ocean Views",
        "Rooftop Terrace",
        "Infinity Pool",
        "Concierge Service",
        "Gym",
        "Wine Storage",
        "Smart Home",
        "Private Elevator"
      ]
    }
  ];

  // Load property data
  useEffect(() => {
    window.scrollTo(0, 0);
    loadProperty();
  }, [id]);

  const loadProperty = async () => {
    setLoading(true);
    try {
      // TODO: Uncomment when FlexMLS is configured
      /*
      const mlsProperty = await fetchPropertyById(id);
      if (mlsProperty) {
        // Convert MLS property to your format
        const convertedProperty = {
          id: mlsProperty.id,
          title: `${mlsProperty.address.streetNumber} ${mlsProperty.address.streetName}`,
          price: `$${mlsProperty.price.toLocaleString()}`,
          location: mlsProperty.address.city,
          fullLocation: `${mlsProperty.address.city}, ${mlsProperty.address.state}`,
          beds: mlsProperty.bedrooms,
          baths: mlsProperty.bathrooms,
          sqft: `${mlsProperty.squareFeet.toLocaleString()} sq ft`,
          lotSize: `${mlsProperty.lotSize.toLocaleString()} sqft`,
          yearBuilt: mlsProperty.yearBuilt,
          propertyType: mlsProperty.propertyType,
          status: mlsProperty.status,
          image: mlsProperty.photos[0]?.url || '',
          images: mlsProperty.photos.map(p => p.url),
          description: mlsProperty.description,
          features: mlsProperty.features
        };
        setProperty(convertedProperty);
      } else {
        setProperty(null);
      }
      */
      
      // For now, use mock data
      const foundProperty = mockProperties.find(p => p.id === parseInt(id || "0"));
      setProperty(foundProperty || null);
    } catch (error) {
      console.error('Error loading property:', error);
      // Fallback to mock data on error
      const foundProperty = mockProperties.find(p => p.id === parseInt(id || "0"));
      setProperty(foundProperty || null);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-muted-foreground">Loading property...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Property not found
  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Property Not Found</h1>
            <p className="text-muted-foreground mb-6">The property you're looking for doesn't exist.</p>
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

      {/* Back Button & Close Button */}
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

      {/* Hero Image */}
      <section className="pb-12">
        <div className="container mx-auto px-4">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ height: "500px" }}>
            <img 
              src={property.image}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="bg-primary text-white px-4 py-2 rounded-lg font-semibold">
                Featured
              </span>
              <span className="bg-accent text-accent-foreground px-4 py-2 rounded-lg font-semibold">
                Luxury
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Left Column - Property Details */}
            <div className="lg:col-span-2">
              {/* Title & Price */}
              <div className="mb-8">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{property.title}</h1>
                <div className="text-4xl font-bold text-accent mb-4">{property.price}</div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-5 h-5" />
                  <span className="text-lg">{property.fullLocation}</span>
                </div>
              </div>

              {/* Quick Stats */}
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

              {/* About This Property */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-4">About This Property</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {property.description}
                </p>
              </div>

              {/* Features & Amenities */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-6">Features & Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Details */}
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
                    <div className="text-sm text-muted-foreground mb-1">Property ID</div>
                    <div className="font-semibold">{property.id}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Contact Card */}
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
                      onClick={() => navigate('/contact')}
                    >
                      Schedule Viewing
                    </Button>
                  </div>

                  <div className="border-t border-border pt-6">
                    <div className="text-sm text-muted-foreground mb-2">Property ID</div>
                    <div className="font-semibold mb-4">{property.id}</div>
                    
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