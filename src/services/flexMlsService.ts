// src/services/flexMlsService.ts

const FLEXMLS_API_BASE = 'https://api.flexmls.com/v1';
const API_KEY = import.meta.env.VITE_FLEXMLS_API_KEY;

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

// Fetch all listings
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

// Fetch single property by ID
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

// Convert MLS property to your PropertyCard format
export function convertMLSToPropertyCard(mlsProperty: MLSProperty) {
  return {
    id: mlsProperty.id,
    image: mlsProperty.photos[0]?.url || '',
    price: `$${mlsProperty.price.toLocaleString()}`,
    title: `${mlsProperty.address.streetNumber} ${mlsProperty.address.streetName}`,
    location: `${mlsProperty.address.city}, ${mlsProperty.address.state}`,
    beds: mlsProperty.bedrooms,
    baths: mlsProperty.bathrooms,
    sqft: `${mlsProperty.squareFeet.toLocaleString()} sq ft`
  };
}