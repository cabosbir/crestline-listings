// src/pages/PropertyDetail.tsx - SUPER-POWERED VERSION 🚀
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import { Button } from "@/components/ui/button";
import { 
  Bed, Bath, Maximize, MapPin, ArrowLeft, X,
  Calendar, CheckCircle2, Loader2, ChevronLeft, ChevronRight, 
  ExternalLink, Share2, Mail, AlertCircle
} from "lucide-react";
import { fetchPropertyById, type MLSProperty } from "@/services/flexMlsService";
import { searchByMLS } from "@/services/intelligentSearch";

// 🎯 TYPE-SAFE PROPERTY INTERFACE
interface ConvertedProperty {
  id: string;
  mlsNumber: string;
  title: string;
  price: string;
  priceRaw: number;
  location: string;
  fullLocation: string;
  beds: number;
  baths: number;
  sqft: string;
  sqftRaw: number;
  lotSize: string;
  yearBuilt: string | number;
  propertyType: string;
  status: string;
  image: string;
  images: string[];
  description: string;
  features: string[];
  latitude?: number;
  longitude?: number;
  listingAgent?: string;
  listingOffice?: string;
}

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [property, setProperty] = useState<ConvertedProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loadingStrategy, setLoadingStrategy] = useState<string>('');

  useEffect(() => {
    window.scrollTo(0, 0);
    loadProperty();
  }, [id]);

  // 🎯 INTELLIGENT PROPERTY LOADING WITH MULTIPLE FALLBACK STRATEGIES
  const loadProperty = async () => {
    setLoading(true);
    setError(null);
    
    if (!id) {
      console.error('❌ No property ID provided');
      setError('No property ID provided');
      setLoading(false);
      return;
    }

    console.log('🔍 [PROPERTY DETAIL] Starting intelligent load for ID:', id);

    // 🎯 STRATEGY 1: Try intelligent search (best for MLS numbers)
    try {
      setLoadingStrategy('Searching by MLS number...');
      console.log('🎯 [STRATEGY 1] Trying intelligent search for:', id);
      
      const mlsProperty = await searchByMLS(id);
      
      if (mlsProperty) {
        console.log('✅ [STRATEGY 1] Success! Found via intelligent search');
        setProperty(convertMLSToProperty(mlsProperty, id));
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn('⚠️ [STRATEGY 1] Intelligent search failed:', err);
    }

    // 🎯 STRATEGY 2: Try old API by ID (fallback for internal IDs)
    try {
      setLoadingStrategy('Searching by property ID...');
      console.log('🎯 [STRATEGY 2] Trying old API by ID:', id);
      
      const mlsProperty = await fetchPropertyById(id);
      
      if (mlsProperty) {
        console.log('✅ [STRATEGY 2] Success! Found via old API');
        setProperty(convertMLSToProperty(mlsProperty, id));
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn('⚠️ [STRATEGY 2] Old API failed:', err);
    }

    // 🎯 STRATEGY 3: Check if ID might be MLS with different format
    if (id.includes('-') || /^\d+$/.test(id)) {
      try {
        setLoadingStrategy('Trying alternative MLS format...');
        
        // Try with/without dashes
        const alternateId = id.includes('-') ? id.replace(/-/g, '') : id;
        console.log('🎯 [STRATEGY 3] Trying alternate format:', alternateId);
        
        const mlsProperty = await searchByMLS(alternateId);
        
        if (mlsProperty) {
          console.log('✅ [STRATEGY 3] Success! Found with alternate format');
          setProperty(convertMLSToProperty(mlsProperty, id));
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('⚠️ [STRATEGY 3] Alternate format failed:', err);
      }
    }

    // ❌ ALL STRATEGIES FAILED
    console.error('❌ [ALL STRATEGIES FAILED] Property not found:', id);
    setError(`Property not found. Tried multiple search methods for: ${id}`);
    setProperty(null);
    setLoading(false);
  };

  // 🎯 ROBUST MLS TO PROPERTY CONVERTER
  const convertMLSToProperty = (mls: MLSProperty, fallbackId: string): ConvertedProperty => {
    console.log('🔄 [CONVERTER] Converting MLS property:', mls);

    const images = mls.Media?.length 
      ? mls.Media.slice(0, 20).map(m => m.MediaURL).filter(Boolean)
      : ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&h=1000&fit=crop'];

    return {
      id: mls.ListingKey || fallbackId,
      mlsNumber: mls.ListingId || fallbackId,
      title: mls.UnparsedAddress || 'Luxury Property in Cabo San Lucas',
      price: `$${(mls.ListPrice || 0).toLocaleString()}`,
      priceRaw: mls.ListPrice || 0,
      location: mls.City || 'Cabo San Lucas',
      fullLocation: `${mls.City || 'Cabo San Lucas'}, ${mls.StateOrProvince || 'BCS'}`,
      beds: mls.BedroomsTotal || 0,
      baths: mls.BathroomsFull || 0,
      sqft: `${(mls.LivingArea || 0).toLocaleString()} sq ft`,
      sqftRaw: mls.LivingArea || 0,
      lotSize: mls.LotSizeArea ? `${mls.LotSizeArea.toLocaleString()} sqft` : 'N/A',
      yearBuilt: mls.YearBuilt || 'N/A',
      propertyType: mls.PropertyType || 'Residential',
      status: mls.StandardStatus || 'Active',
      image: images[0],
      images: images,
      description: mls.PublicRemarks || 'Beautiful luxury property in Cabo San Lucas with premium finishes and stunning views.',
      features: extractFeatures(mls),
      latitude: mls.Latitude,
      longitude: mls.Longitude,
      listingAgent: mls.ListAgentFullName,
      listingOffice: mls.ListOfficeName
    };
  };

  // 🎯 INTELLIGENT FEATURE EXTRACTION
  const extractFeatures = (mls: MLSProperty): string[] => {
    const features: string[] = [];
    
    // Appliances
    if (mls.Appliances && Array.isArray(mls.Appliances) && mls.Appliances.length > 0) {
      features.push(...mls.Appliances.slice(0, 3));
    }
    
    // Style & Construction
    if (mls.ArchitecturalStyle) features.push(mls.ArchitecturalStyle);
    if (mls.ConstructionMaterials) features.push(`Built with ${mls.ConstructionMaterials}`);
    
    // Climate Control
    if (mls.Cooling) features.push(`${mls.Cooling} Cooling`);
    if (mls.Heating) features.push(`${mls.Heating} Heating`);
    
    // Parking & Access
    if (mls.ParkingFeatures) features.push(`Parking: ${mls.ParkingFeatures}`);
    if (mls.GarageSpaces) features.push(`${mls.GarageSpaces} Car Garage`);
    
    // Views & Location
    if (mls.View && Array.isArray(mls.View)) {
      features.push(`Views: ${mls.View.join(', ')}`);
    } else if (mls.View) {
      features.push(`View: ${mls.View}`);
    }
    
    // Amenities
    if (mls.WaterfrontFeatures) features.push('Waterfront Property');
    if (mls.PoolFeatures) features.push('Swimming Pool');
    if (mls.SpaFeatures) features.push('Spa');
    if (mls.PatioAndPorchFeatures) features.push('Patio/Porch');
    if (mls.FireplaceFeatures) features.push('Fireplace');
    if (mls.SecurityFeatures) features.push('Security System');
    
    // Flooring
    if (mls.Flooring && Array.isArray(mls.Flooring)) {
      features.push(`Flooring: ${mls.Flooring.join(', ')}`);
    }
    
    // Roof
    if (mls.Roof) features.push(`${mls.Roof} Roof`);
    
    // Default features if none found
    if (features.length === 0) {
      features.push(
        'Modern Finishes',
        'Open Floor Plan',
        'Prime Location',
        'High-End Appliances',
        'Quality Construction',
        'Excellent Condition'
      );
    }
    
    // Return max 12 features
    return features.slice(0, 12);
  };

  // 🎯 IMAGE NAVIGATION
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

  // 🎯 SMART NAVIGATION BACK - Preserves search filters
  const handleBackToProperties = () => {
    // Use browser history to go back, preserving all filters
    navigate(-1);
  };

  // 🎯 SHARE FUNCTIONALITY
  const handleShare = async () => {
    const shareData = {
      title: property?.title || 'Property in Cabo San Lucas',
      text: `Check out this property: ${property?.title} - ${property?.price}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled or failed:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // 🎯 LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-accent mb-4 mx-auto" />
            <p className="text-xl text-muted-foreground mb-2">Loading property details...</p>
            {loadingStrategy && (
              <p className="text-sm text-muted-foreground">{loadingStrategy}</p>
            )}
          </div>
        </div>
        <Footer />
      </div>
    );
  };

  // 🎯 ERROR STATE
  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center max-w-2xl mx-auto px-4">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4 mx-auto" />
            <h1 className="text-4xl font-bold mb-4">Property Not Found</h1>
            <p className="text-muted-foreground mb-6">
              {error || "We couldn't find this property. It may have been sold, removed, or the ID is incorrect."}
            </p>
            <div className="mb-6 p-4 bg-secondary rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Property ID:</p>
              <p className="font-mono font-bold break-all">{id}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={handleBackToProperties} size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Properties
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/')}
              >
                Go to Home
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // 🎯 SUCCESS STATE - RENDER PROPERTY
  return (
    <div className="min-h-screen bg-background"> 
      <Navbar />
     {property && (
        <Helmet>
          <title>{`${property.beds ?? 'N/A'} Bed ${property.baths ?? 'N/A'} Bath ${property.propertyType ?? 'Property'} for Sale in ${property.location ?? 'Cabo San Lucas'} | MLS ${property.mlsNumber ?? 'Listing'}`}</title>
          <meta 
            name="description" 
            content={`${property.propertyType} for sale in ${property.location}. ${property.beds} bedrooms, ${property.baths} bathrooms, ${property.sqft}. Listed at ${property.price}. ${property.description.substring(0, 150)}...`}
          />
          <link rel="canonical" href={`https://www.bircabo.com/property/${property.mlsNumber}`} />
          <meta property="og:url" content={`https://www.bircabo.com/property/${property.mlsNumber}`} />
          <meta property="og:title" content={`${property.title} - ${property.price}`} />
          <meta property="og:description" content={`${property.beds} bed, ${property.baths} bath ${property.propertyType} in ${property.location}. ${property.price}.`} />
          <meta property="og:image" content={property.images[0]} />
          <meta property="og:type" content="product" />
          
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "RealEstateListing",
              "name": property.title,
              "description": property.description,
              "image": property.images,
              "offers": {
                "@type": "Offer",
                "priceCurrency": "USD",
                "price": property.priceRaw,
                "availability": property.status === "Active" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                "url": `https://www.bircabo.com/property/${property.mlsNumber}`
              },
              "address": {
                "@type": "PostalAddress",
                "addressLocality": property.location,
                "addressRegion": "Baja California Sur",
                "addressCountry": "MX"
              },
              ...(property.latitude && property.longitude ? {
                "geo": {
                  "@type": "GeoCoordinates",
                  "latitude": property.latitude,
                  "longitude": property.longitude
                }
              } : {}),
              "numberOfRooms": property.beds,
              "numberOfBedrooms": property.beds,
              "numberOfBathroomsTotal": property.baths,
              ...(property.sqftRaw ? {
                "floorSize": {
                  "@type": "QuantitativeValue",
                  "value": property.sqftRaw,
                  "unitCode": "FTK"
                }
              } : {})
            })}
          </script>
        </Helmet>
      )}

      <FloatingContact />

      {/* Navigation Bar */}
      <div className="container mx-auto px-4 pt-32 pb-4">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={handleBackToProperties}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Browse
          </Button>
          
          <div className="flex gap-2 mb-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleShare}
              className="hover:bg-accent/10"
              title="Share Property"
            >
              <Share2 className="w-5 h-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleBackToProperties}
              className="hover:bg-accent/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
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
            
            {/* Status & MLS Badges */}
            <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
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

          {/* Image Navigation */}
          {property.images.length > 1 && (
            <>
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
                  {property.images.map((_, index) => (
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

              {/* Thumbnail Gallery */}
              <div className="grid grid-cols-5 gap-4 mt-6">
                {property.images.slice(0, 5).map((img, index) => (
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
            </>
          )}
        </div>
      </section>

      {/* Property Details */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{property.title}</h1>
                <div className="text-4xl font-bold text-accent mb-4">{property.price}</div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-5 h-5" />
                  <span className="text-lg">{property.fullLocation}</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-secondary border border-border rounded-xl p-4 text-center hover:shadow-lg transition-shadow">
                  <Bed className="w-6 h-6 mx-auto mb-2 text-accent" />
                  <div className="text-sm text-muted-foreground">Bedrooms</div>
                  <div className="text-2xl font-bold">{property.beds}</div>
                </div>
                <div className="bg-secondary border border-border rounded-xl p-4 text-center hover:shadow-lg transition-shadow">
                  <Bath className="w-6 h-6 mx-auto mb-2 text-accent" />
                  <div className="text-sm text-muted-foreground">Bathrooms</div>
                  <div className="text-2xl font-bold">{property.baths}</div>
                </div>
                <div className="bg-secondary border border-border rounded-xl p-4 text-center hover:shadow-lg transition-shadow">
                  <Maximize className="w-6 h-6 mx-auto mb-2 text-accent" />
                  <div className="text-sm text-muted-foreground">Size</div>
                  <div className="text-xl font-bold">{property.sqft}</div>
                </div>
                <div className="bg-secondary border border-border rounded-xl p-4 text-center hover:shadow-lg transition-shadow">
                  <Calendar className="w-6 h-6 mx-auto mb-2 text-accent" />
                  <div className="text-sm text-muted-foreground">Built</div>
                  <div className="text-2xl font-bold">{property.yearBuilt}</div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-4">About This Property</h2>
                <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>

              {/* Features */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-6">Features & Amenities</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {property.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
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
                  <div className="p-4 bg-secondary rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Lot Size</div>
                    <div className="font-semibold">{property.lotSize}</div>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Property Type</div>
                    <div className="font-semibold">{property.propertyType}</div>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Status</div>
                    <div className="font-semibold">{property.status}</div>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">MLS Number</div>
                    <div className="font-semibold">{property.mlsNumber}</div>
                  </div>
                  {property.listingAgent && (
                    <div className="p-4 bg-secondary rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Listing Agent</div>
                      <div className="font-semibold">{property.listingAgent}</div>
                    </div>
                  )}
                  {property.listingOffice && (
                    <div className="p-4 bg-secondary rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Listing Office</div>
                      <div className="font-semibold">{property.listingOffice}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Map */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-6">Location Map</h2>
                <div className="bg-secondary rounded-xl overflow-hidden border border-border shadow-lg">
                  {property.latitude && property.longitude ? (
                    <iframe
                      src={`https://maps.google.com/maps?q=${property.latitude},${property.longitude}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                      className="w-full h-96 border-0"
                      title="Property Location Map"
                      allowFullScreen
                      loading="lazy"
                    />
                  ) : (
                    <iframe
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(property.title + ', ' + property.fullLocation)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                      className="w-full h-96 border-0"
                      title="Property Location Map"
                      allowFullScreen
                      loading="lazy"
                    />
                  )}
                  <div className="p-4 bg-card">
                    <div className="flex items-start gap-3 mb-3">
                      <MapPin className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <div className="font-semibold text-lg mb-1">{property.title}</div>
                        <div className="text-muted-foreground">{property.fullLocation}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const mapUrl = property.latitude && property.longitude
                            ? `https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`
                            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.title + ', ' + property.fullLocation)}`;
                          window.open(mapUrl, '_blank');
                        }}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Google Maps
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const wazeUrl = property.latitude && property.longitude
                            ? `https://waze.com/ul?ll=${property.latitude},${property.longitude}&navigate=yes`
                            : `https://waze.com/ul?q=${encodeURIComponent(property.title + ', ' + property.fullLocation)}&navigate=yes`;
                          window.open(wazeUrl, '_blank');
                        }}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Waze
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
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
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
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
                        onClick={() => {
                          window.location.href = `mailto:?subject=${encodeURIComponent(property.title)}&body=${encodeURIComponent(window.location.href)}`;
                        }}
                      >
                        <Mail className="w-4 h-4 mr-2" />
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