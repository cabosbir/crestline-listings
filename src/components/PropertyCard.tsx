import { Card } from "@/components/ui/card";
import { Bed, Bath, Maximize } from "lucide-react";
import { Link } from "react-router-dom";

interface PropertyCardProps {
  id?: number | string;
  image: string;
  price: string;
  title: string;
  location: string;
  beds: number;
  baths: number;
  sqft: string;
  mlsNumber?: string;
  description?: string;
  features?: string[];
  status?: string;
  yearBuilt?: number;
  lotSize?: number;
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
  mlsNumber,
  description,
  features,
  status,
  yearBuilt,
  lotSize
}: PropertyCardProps) => {
  return (
    <Card className="group overflow-hidden border rounded-xl hover:shadow-2xl transition-all duration-300 cursor-pointer">
      <Link to={id ? `/properties/${id}` : "#"}>
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
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              <span>{beds} Beds</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              <span>{baths} Baths</span>
            </div>
            <div className="flex items-center gap-1">
              <Maximize className="w-4 h-4" />
              <span>{sqft}</span>
            </div>
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
        </div>
      </Link>
    </Card>
  );
};

export default PropertyCard;

// MLS Service Integration Types and Helper Functions
// These should ideally be in a separate service file (src/services/flexMlsService.ts)

export interface MLSProperty {
  id: string;
  listingId: string;
  address: {
    streetNumber: string;
    streetName: string;
    city: string;
    state: string;
    postalCode: string;
  };
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  lotSize: number;
  yearBuilt: number;
  propertyType: string;
  description: string;
  photos: Array<{
    url: string;
    caption?: string;
  }>;
  features: string[];
  status: string;
  listingAgent: {
    name: string;
    email: string;
    phone: string;
  };
}

// Convert MLS property to PropertyCard format
export function convertMLSToPropertyCard(mlsProperty: MLSProperty) {
  return {
    id: mlsProperty.id,
    mlsNumber: mlsProperty.listingId,
    image: mlsProperty.photos[0]?.url || '',
    price: `$${mlsProperty.price.toLocaleString()}`,
    title: `${mlsProperty.address.streetNumber} ${mlsProperty.address.streetName}`,
    location: `${mlsProperty.address.city}, ${mlsProperty.address.state}`,
    beds: mlsProperty.bedrooms,
    baths: mlsProperty.bathrooms,
    sqft: `${mlsProperty.squareFeet.toLocaleString()} sq ft`,
    description: mlsProperty.description,
    features: mlsProperty.features,
    status: mlsProperty.status,
    yearBuilt: mlsProperty.yearBuilt,
    lotSize: mlsProperty.lotSize,
  };
}

// MLS API Functions
const FLEXMLS_API_BASE = 'https://api.flexmls.com/v1';
const API_KEY = import.meta.env.VITE_FLEXMLS_API_KEY;

export async function fetchListings(params?: {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
}): Promise<MLSProperty[]> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.city) queryParams.append('city', params.city);
    if (params?.minPrice) queryParams.append('minPrice', params.minPrice.toString());
    if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params?.bedrooms) queryParams.append('bedrooms', params.bedrooms.toString());
    if (params?.bathrooms) queryParams.append('bathrooms', params.bathrooms.toString());
    if (params?.propertyType) queryParams.append('propertyType', params.propertyType);

    const response = await fetch(
      `${FLEXMLS_API_BASE}/listings?${queryParams}`,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch listings');
    }

    const data = await response.json();
    return data.listings;
  } catch (error) {
    console.error('Error fetching listings:', error);
    return [];
  }
}

export async function fetchPropertyById(id: string): Promise<MLSProperty | null> {
  try {
    const response = await fetch(
      `${FLEXMLS_API_BASE}/listings/${id}`,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Property not found');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching property:', error);
    return null;
  }
}