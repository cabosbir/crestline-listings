import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bed, Bath, Maximize, MapPin, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

interface PropertyCardProps {
  id: string;
  mlsNumber: string;
  image: string;
  price: string;
  title: string;
  location: string;
  beds: number;
  baths: number;
  sqft?: string; // Made optional since it can be undefined
  description?: string;
  status?: string;
  propertyType?: string;
  latitude?: number;
  longitude?: number;
}

const PropertyCard = ({
  id,
  mlsNumber,
  image,
  price,
  title,
  location,
  beds,
  baths,
  sqft,
  description,
  status = "Active",
  propertyType = "Single Family Home",
  latitude,
  longitude,
}: PropertyCardProps) => {
  const navigate = useNavigate();
  const [imgSrc, setImgSrc] = useState(image);
  const [imgError, setImgError] = useState(false);
  const [mapUrl, setMapUrl] = useState<string>("");

  useEffect(() => {
    // Generate FREE OpenStreetMap static image
    if (latitude && longitude) {
      // OpenStreetMap Static Map - 100% FREE, no API key needed
      const osmUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}&zoom=13&size=400x300&maptype=mapnik&markers=${latitude},${longitude},red-pushpin`;
      setMapUrl(osmUrl);
      console.log('🗺️ Generated free map for:', title);
    } else if (location) {
      // Fallback: Use geocoding (also free)
      console.log('📍 No coordinates for:', title, '- will show on detail page');
    }
  }, [latitude, longitude, location, title]);

  const handleViewDetails = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    navigate(`/property/${id}`);
  };

  const handleNewClientForm = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/new-client', {
      state: { 
        propertyId: id,
        mlsNumber: mlsNumber,
        propertyAddress: title,
        propertyPrice: price,
        propertyType: propertyType
      }
    });
  };

  const handleImageError = () => {
    console.log('⚠️ Image failed to load, using fallback for:', mlsNumber);
    if (!imgError) {
      setImgError(true);
      const fallbacks = [
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop'
      ];
      setImgSrc(fallbacks[Math.floor(Math.random() * fallbacks.length)]);
    }
  };

  // FIXED: Safe handling of sqft - check for undefined BEFORE calling .replace()
  const formattedSqft = sqft && typeof sqft === 'string' 
    ? sqft.replace(/sq ft/i, '').trim() 
    : 'N/A';

  return (
    <Card 
      className="group overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer border-0"
      onClick={handleViewDetails}
    >
      <div className="relative overflow-hidden" style={{ height: "400px" }}>
        <img
          src={imgSrc}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={handleImageError}
          loading="lazy"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="absolute top-4 left-4">
          <span className="bg-purple-600 text-white px-4 py-1.5 rounded text-sm font-semibold shadow-lg">
            {status}
          </span>
        </div>

        {mapUrl && (
          <div className="absolute top-4 right-4 w-24 h-24 rounded-lg overflow-hidden border-2 border-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <img
              src={mapUrl}
              alt="Property location"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="text-4xl font-bold mb-3">
            {price}
          </div>

          <div className="flex items-center gap-4 mb-3 text-lg">
            <div className="flex items-center gap-1.5">
              <Bed className="w-5 h-5" />
              <span className="font-semibold">{beds} Beds</span>
            </div>
            <span className="text-white/60">•</span>
            <div className="flex items-center gap-1.5">
              <Bath className="w-5 h-5" />
              <span className="font-semibold">{baths} Baths</span>
            </div>
            {formattedSqft !== 'N/A' && (
              <>
                <span className="text-white/60">•</span>
                <div className="flex items-center gap-1.5">
                  <Maximize className="w-5 h-5" />
                  <span className="font-semibold">{formattedSqft} SqFt</span>
                </div>
              </>
            )}
          </div>

          <div className="text-base mb-1 line-clamp-1 flex items-center gap-2">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            {title}
          </div>

          <div className="text-sm text-white/80">
            {propertyType}
          </div>
        </div>

        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3">
          <Button 
            variant="default"
            size="lg"
            className="bg-white text-black hover:bg-gray-100 font-semibold px-8"
            onClick={handleViewDetails}
          >
            View Details
          </Button>
          <Button 
            variant="outline"
            size="lg"
            className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black font-semibold px-6"
            onClick={handleNewClientForm}
          >
            <FileText className="w-4 h-4 mr-2" />
            Request Info
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PropertyCard;