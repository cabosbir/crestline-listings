import { Card } from "@/components/ui/card";
import { Bed, Bath, Maximize } from "lucide-react";

interface PropertyCardProps {
  id?: number | string;
  image: string;
  price: string;
  title: string;
  location: string;
  beds?: number;
  baths?: number;
  sqft?: string;
  totalM2?: string;
  mlsNumber?: string;
  description?: string;
  features?: string[];
  status?: string;
  yearBuilt?: number;
  lotSize?: number;
  link?: string; // Add link prop
}

const PropertyCard = ({ 
  id, 
  image, 
  price, 
  title, 
  location, 
  beds, 
  baths, 
  sqft,
  totalM2,
  mlsNumber,
  description,
  features,
  status,
  yearBuilt,
  lotSize,
  link
}: PropertyCardProps) => {
  // Default to FlexMLS search if no specific link provided
  const propertyLink = link || "https://link.flexmls.com/u67gqp77eml,12";
  
  return (
    <Card className="group overflow-hidden border rounded-xl hover:shadow-2xl transition-all duration-300 cursor-pointer">
      {/* Property Image */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {mlsNumber && (
          <div className="absolute top-4 left-4 bg-accent text-accent-foreground px-3 py-1 rounded-md text-sm font-medium">
            MLS# {mlsNumber}
          </div>
        )}
        {status && (
          <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm font-medium">
            {status}
          </div>
        )}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-md">
          <span className="text-lg font-bold text-primary">{price}</span>
        </div>
      </div>

      {/* Property Details */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-accent transition-colors">
          {title}
        </h3>
        <p className="text-muted-foreground mb-4">{location}</p>
        
        {/* Property Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          {beds !== undefined && (
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              <span>{beds} Beds</span>
            </div>
          )}
          {baths !== undefined && (
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              <span>{baths} Baths</span>
            </div>
          )}
          {(sqft || totalM2) && (
            <div className="flex items-center gap-1">
              <Maximize className="w-4 h-4" />
              <span>{sqft || `${totalM2} m²`}</span>
            </div>
          )}
        </div>

        {/* Additional Info */}
        {(yearBuilt || lotSize) && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground border-t pt-3">
            {yearBuilt && <span>Built: {yearBuilt}</span>}
            {lotSize && <span>Lot: {lotSize.toLocaleString()} sq ft</span>}
          </div>
        )}

        {/* Description Preview */}
        {description && (
          <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
            {description}
          </p>
        )}

        {/* Features Preview */}
        {features && features.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {features.slice(0, 3).map((feature, idx) => (
              <span 
                key={idx}
                className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded"
              >
                {feature}
              </span>
            ))}
            {features.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{features.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* View Details Button - Links to specific property on FlexMLS */}
        <div className="mt-4 pt-4 border-t">
          <a 
            href={propertyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-accent hover:bg-accent/90 text-accent-foreground font-medium py-2 px-4 rounded-md transition-colors text-center"
            onClick={(e) => e.stopPropagation()}
          >
            View Property Details
          </a>
        </div>
      </div>
    </Card>
  );
};

export default PropertyCard;