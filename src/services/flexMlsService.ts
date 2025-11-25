// src/services/flexMlsService.ts - RESO Web API Format

export interface MLSProperty {
  ListingKey: string;
  ListingId: string;
  UnparsedAddress: string;
  City: string;
  StateOrProvince: string;
  PostalCode: string;
  ListPrice: number;
  BedroomsTotal: number;
  BathroomsFull: number;
  LivingArea: number;
  LotSizeArea: number;
  YearBuilt: number;
  PropertyType: string;
  PublicRemarks: string;
  StandardStatus: string;
  Media?: Array<{
    MediaURL: string;
    Order: number;
  }>;
}

export async function fetchListings(params?: {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
}): Promise<MLSProperty[]> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.city) queryParams.append('city', params.city);
    if (params?.minPrice) queryParams.append('minPrice', params.minPrice.toString());
    if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params?.bedrooms) queryParams.append('bedrooms', params.bedrooms.toString());
    if (params?.bathrooms) queryParams.append('bathrooms', params.bathrooms.toString());
    
    const url = `/api/flexmls-listings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.success) {
      console.warn('API returned no results');
      return getFallbackListings();
    }
    
    return data.results || getFallbackListings();
  } catch (error) {
    console.error('Error fetching listings:', error);
    return getFallbackListings();
  }
}

export async function fetchPropertyById(mlsId: string): Promise<MLSProperty | null> {
  try {
    const url = `/api/flexmls-property/${mlsId}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    return data.result || null;
  } catch (error) {
    console.error('Error fetching property:', error);
    return null;
  }
}

export function convertMLSToPropertyCard(mlsProperty: MLSProperty) {
  return {
    id: mlsProperty.ListingKey,
    mlsNumber: mlsProperty.ListingId,
    image: mlsProperty.Media?.[0]?.MediaURL || '/placeholder-property.jpg',
    price: `$${mlsProperty.ListPrice?.toLocaleString() || '0'}`,
    title: mlsProperty.UnparsedAddress || 'Luxury Property',
    location: `${mlsProperty.City || ''}, ${mlsProperty.StateOrProvince || ''}`.trim(),
    beds: mlsProperty.BedroomsTotal || 0,
    baths: mlsProperty.BathroomsFull || 0,
    sqft: `${mlsProperty.LivingArea?.toLocaleString() || '0'} sq ft`,
    description: mlsProperty.PublicRemarks || '',
    features: [],
    status: mlsProperty.StandardStatus || 'Active',
    yearBuilt: mlsProperty.YearBuilt,
    lotSize: mlsProperty.LotSizeArea
  };
}

function getFallbackListings(): MLSProperty[] {
  return [{
    ListingKey: '1',
    ListingId: 'DEMO-001',
    UnparsedAddress: '123 Ocean View Drive',
    City: 'Cabo San Lucas',
    StateOrProvince: 'BCS',
    PostalCode: '23450',
    ListPrice: 2850000,
    BedroomsTotal: 5,
    BathroomsFull: 4,
    LivingArea: 4500,
    LotSizeArea: 8000,
    YearBuilt: 2022,
    PropertyType: 'Residential',
    PublicRemarks: 'Stunning beachfront villa with panoramic ocean views.',
    StandardStatus: 'Active',
    Media: [{
      MediaURL: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      Order: 1
    }]
  }];
}