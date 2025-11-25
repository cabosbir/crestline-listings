// src/services/flexMlsService.ts - RESO Web API Format - PRODUCTION READY

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
  Appliances?: string[];
  ArchitecturalStyle?: string;
  Cooling?: string;
  Heating?: string;
  ParkingFeatures?: string;
  View?: string;
  WaterfrontFeatures?: string;
  PoolFeatures?: string;
  PatioAndPorchFeatures?: string;
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
    
    console.log('📡 Fetching listings from:', url);
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.success) {
      console.warn('⚠️ API returned no results, using fallback');
      return getFallbackListings();
    }
    
    console.log('✅ Fetched listings:', data.results?.length || 0);
    return data.results || getFallbackListings();
  } catch (error) {
    console.error('❌ Error fetching listings:', error);
    return getFallbackListings();
  }
}

export async function fetchPropertyById(listingKey: string): Promise<MLSProperty | null> {
  try {
    const url = `/api/flexmls-property/${listingKey}`;
    
    console.log('🔍 Fetching property by ID:', listingKey);
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('❌ Failed to fetch property:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (!data.success || !data.result) {
      console.error('❌ No property data returned');
      return null;
    }
    
    console.log('✅ Property fetched:', data.result.ListingId);
    return data.result;
  } catch (error) {
    console.error('💥 Error fetching property:', error);
    return null;
  }
}

export function convertMLSToPropertyCard(mlsProperty: MLSProperty) {
  // Get the best available image
  let imageUrl = 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop';
  
  if (mlsProperty.Media && mlsProperty.Media.length > 0) {
    // Sort by Order if available
    const sortedMedia = [...mlsProperty.Media].sort((a, b) => (a.Order || 0) - (b.Order || 0));
    const firstImage = sortedMedia[0].MediaURL;
    
    // Ensure the URL is valid
    if (firstImage && (firstImage.startsWith('http://') || firstImage.startsWith('https://'))) {
      imageUrl = firstImage;
    }
  }
  
  return {
    id: mlsProperty.ListingKey,
    mlsNumber: mlsProperty.ListingId,
    image: imageUrl,
    price: `$${mlsProperty.ListPrice?.toLocaleString() || '0'}`,
    title: mlsProperty.UnparsedAddress || 'Luxury Property',
    location: `${mlsProperty.City || ''}, ${mlsProperty.StateOrProvince || ''}`.trim(),
    beds: mlsProperty.BedroomsTotal || 0,
    baths: mlsProperty.BathroomsFull || 0,
    sqft: `${mlsProperty.LivingArea?.toLocaleString() || '0'} sq ft`,
    description: mlsProperty.PublicRemarks?.substring(0, 150) || '',
    features: [],
    status: mlsProperty.StandardStatus || 'Active',
    yearBuilt: mlsProperty.YearBuilt,
    lotSize: mlsProperty.LotSizeArea
  };
}

function getFallbackListings(): MLSProperty[] {
  return [{
    ListingKey: 'fallback-1',
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
    PublicRemarks: 'Stunning beachfront villa with panoramic ocean views. This property is shown as fallback data while the API is being configured.',
    StandardStatus: 'Active',
    Media: [{
      MediaURL: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      Order: 1
    }]
  }];
}