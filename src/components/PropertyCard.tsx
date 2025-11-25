import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bed, Bath, Maximize, MapPin } from "lucide-react";
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
  sqft: string;
  description?: string;
  status?: string;
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
}: PropertyCardProps) => {
  const navigate = useNavigate();
  const [imgSrc, setImgSrc] = useState(image);
  const [imgError, setImgError] = useState(false);

  const handleViewDetails = () => {
    navigate(`/property/${id}`);
  };

  const handleImageError = () => {
    console.log('⚠️ Image failed to load, using fallback for:', mlsNumber);
    if (!imgError) {
      setImgError(true);
      // Try different fallback images
      const fallbacks = [
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop'
      ];
      setImgSrc(fallbacks[Math.floor(Math.random() * fallbacks.length)]);
    }
  };

  return (
    <Card className="group overflow-hidden hover:shadow-elegant transition-all duration-300 cursor-pointer">
      <div className="relative overflow-hidden h-64" onClick={handleViewDetails}>
        <img
          src={imgSrc}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={handleImageError}
          loading="lazy"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="bg-primary text-primary-foreground px-3 py-1 rounded-lg text-sm font-semibold shadow-lg">
            {status}
          </span>
          <span className="bg-accent text-accent-foreground px-3 py-1 rounded-lg text-sm font-semibold shadow-lg">
            MLS: {mlsNumber}
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <CardContent className="p-6">
        <div className="mb-3">
          <div className="text-3xl font-bold text-accent mb-2">{price}</div>
          <h3 className="text-xl font-bold line-clamp-1 mb-2 group-hover:text-accent transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm line-clamp-1">{location}</span>
          </div>
        </div>

        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {description}
          </p>
        )}

        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1">
            <Bed className="w-4 h-4 text-accent" />
            <span>{beds} beds</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-4 h-4 text-accent" />
            <span>{baths} baths</span>
          </div>
          <div className="flex items-center gap-1">
            <Maximize className="w-4 h-4 text-accent" />
            <span>{sqft}</span>
          </div>
        </div>

        <Button 
          variant="luxury" 
          className="w-full"
          onClick={handleViewDetails}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;