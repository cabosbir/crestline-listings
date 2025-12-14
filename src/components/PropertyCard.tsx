import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bed, Bath, Maximize, MapPin, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface PropertyCardProps {
  id: string;
  mlsNumber: string;
  image: string;
  price: string;
  title: string;
  location: string;
  beds: number;
  baths: number;
  sqft?: string;
  description?: string;
  status?: string;
  propertyType?: string;
  latitude?: number;
  longitude?: number;
  link?: string;
  currentPage?: number;
}

const PropertyCard = ({
  id,
  mlsNumber,
  link,
  title,
  price,
  beds,
  baths,
  sqft,
  image,
  propertyType,
  status,
  currentPage = 1
}: PropertyCardProps) => {

  const navigate = useNavigate();
  const [imgSrc, setImgSrc] = useState(image);
  const [imgError, setImgError] = useState(false);

  const handleViewDetails = (e?: React.MouseEvent) => {
    e?.stopPropagation();

    console.log('🎯 PropertyCard clicked - currentPage:', currentPage);
    
    // ⭐ Set flag before navigating
    sessionStorage.setItem('returningFromProperty', 'true');

    const routeId = mlsNumber ?? id;
    console.log('🚀 Navigating to:', `/property/${routeId}?page=${currentPage}`);
    navigate(`/property/${routeId}?page=${currentPage}`);
  };

  const handleNewClientForm = (e: React.MouseEvent) => {
    e.stopPropagation();

    navigate('/new-client', {
      state: { 
        propertyId: id,
        mlsNumber,
        propertyAddress: title,
        propertyPrice: price,
        propertyType
      }
    });
  };

  const handleImageError = () => {
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

  const formattedSqft =
    sqft && typeof sqft === 'string'
      ? sqft.replace(/sq ft/i, '').trim()
      : 'N/A';

  return (
    <Card
      className="group overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer border-0"
      onClick={handleViewDetails}
    >
      <div className="relative overflow-hidden" style={{ height: "400px" }}>
        <img 
          src={image}
          alt={title}
          loading="lazy"
          decoding="async"
          width={400}
          height={300}
          onError={(e) => {
          e.currentTarget.src = 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop';
      }}
         />
        <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-black/50 via-black/15 to-transparent" />

        <div className="absolute top-4 left-4">
          <span className="bg-purple-600 text-white px-4 py-1.5 rounded text-sm font-semibold shadow-lg">
            {status}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="text-4xl font-bold mb-3">{price}</div>

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
            {formattedSqft !== "N/A" && (
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

          <div className="text-sm text-white/80">{propertyType}</div>
        </div>

        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3">
          <Button
            variant="default"
            size="lg"
            className="bg-white text-black hover:bg-gray-100 font-semibold px-8"
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails(e);
            }}
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