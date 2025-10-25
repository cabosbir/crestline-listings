import { Bed, Bath, Maximize, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PropertyCardProps {
  image: string;
  price: string;
  title: string;
  location: string;
  beds: number;
  baths: number;
  sqft: string;
}

const PropertyCard = ({ image, price, title, location, beds, baths, sqft }: PropertyCardProps) => {
  return (
    <Card className="group overflow-hidden border-border hover:shadow-hover transition-smooth cursor-pointer">
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-smooth"
        />
        <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-4 py-2 rounded-lg font-bold shadow-gold">
          {price}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start gap-2 mb-2">
          <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">{location}</p>
        </div>
        <h3 className="text-xl font-semibold mb-4 text-foreground group-hover:text-primary transition-fast">
          {title}
        </h3>

        {/* Stats */}
        <div className="flex items-center gap-6 mb-4 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Bed className="h-4 w-4" />
            <span className="text-sm font-medium">{beds} Beds</span>
          </div>
          <div className="flex items-center gap-2">
            <Bath className="h-4 w-4" />
            <span className="text-sm font-medium">{baths} Baths</span>
          </div>
          <div className="flex items-center gap-2">
            <Maximize className="h-4 w-4" />
            <span className="text-sm font-medium">{sqft}</span>
          </div>
        </div>

        <Button variant="outline" className="w-full">
          View Details
        </Button>
      </div>
    </Card>
  );
};

export default PropertyCard;
