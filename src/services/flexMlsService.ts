// src/services/flexMlsService.ts - Updated for FlexMLS IDX Integration with Vercel API Routes

// Your FlexMLS IDX Link ID from the iframe URL
const FLEXMLS_IDX_LINK_ID = '1lpm0zo1944e';
const FLEXMLS_ACCOUNT_ID = '12';
const FLEXMLS_API_FEED_ID = 'b6byf74jy5upy5';

export interface MLSProperty {
  Id: string;
  StandardFields: {
    ListingId: string;
    UnparsedAddress: string;
    City: string;
    StateOrProvince: string;
    PostalCode: string;
    ListPrice: number;
    BedroomsTotal: number;
    BathroomsTotalInteger: number;
    BuildingAreaTotal: number;
    LotSizeArea: number;
    YearBuilt: number;
    PropertyType: string;
    PublicRemarks: string;
    MlsStatus: string;
  };
  Media?: Array<{
    Uri300: string;
    Uri800: string;
    Uri1024: string;
    Uri1280: string;
    Caption?: string;
  }>;
}

// Fetch listings through our secure Vercel API route
export async function fetchListings(params?: {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
}): Promise<MLSProperty[]> {
  try {
    // Build query parameters for our API route
    const queryParams = new URLSearchParams();
    
    if (params?.city) {
      queryParams.append('city', params.city);
    }
    if (params?.minPrice) {
      queryParams.append('minPrice', params.minPrice.toString());
    }
    if (params?.maxPrice) {
      queryParams.append('maxPrice', params.maxPrice.toString());
    }
    if (params?.bedrooms) {
      queryParams.append('bedrooms', params.bedrooms.toString());
    }
    if (params?.bathrooms) {
      queryParams.append('bathrooms', params.bathrooms.toString());
    }
    if (params?.propertyType) {
      queryParams.append('propertyType', params.propertyType);
    }
    
    const url = `/api/flexmls-listings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url);

    if (!response.ok) {
      console.warn('FlexMLS API returned error, using fallback data');
      return getFallbackListings();
    }

    const data = await response.json();
    return data.results || getFallbackListings();
  } catch (error) {
    console.error('Error fetching listings from FlexMLS:', error);
    return getFallbackListings();
  }
}

// Fetch single property by MLS ID through our secure API route
export async function fetchPropertyById(mlsId: string): Promise<MLSProperty | null> {
  try {
    const url = `/api/flexmls-property/${mlsId}`;
    
    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.result || null;
  } catch (error) {
    console.error('Error fetching property:', error);
    return null;
  }
}

// Convert MLS property to PropertyCard format
export function convertMLSToPropertyCard(mlsProperty: MLSProperty) {
  const std = mlsProperty.StandardFields;
  
  return {
    id: mlsProperty.Id,
    mlsNumber: std.ListingId,
    image: mlsProperty.Media?.[0]?.Uri800 || mlsProperty.Media?.[0]?.Uri1024 || '/placeholder-property.jpg',
    price: `$${std.ListPrice?.toLocaleString() || '0'}`,
    title: std.UnparsedAddress || 'Luxury Property',
    location: `${std.City || ''}, ${std.StateOrProvince || ''}`.trim(),
    beds: std.BedroomsTotal || 0,
    baths: std.BathroomsTotalInteger || 0,
    sqft: `${std.BuildingAreaTotal?.toLocaleString() || '0'} sq ft`,
    description: std.PublicRemarks || '',
    features: [],
    status: std.MlsStatus || 'Active',
    yearBuilt: std.YearBuilt,
    lotSize: std.LotSizeArea
  };
}

// Fallback mock data if API fails
function getFallbackListings(): MLSProperty[] {
  return [
    {
      Id: '1',
      StandardFields: {
        ListingId: 'DEMO-001',
        UnparsedAddress: '123 Ocean View Drive',
        City: 'Cabo San Lucas',
        StateOrProvince: 'BCS',
        PostalCode: '23450',
        ListPrice: 2850000,
        BedroomsTotal: 5,
        BathroomsTotalInteger: 4,
        BuildingAreaTotal: 4500,
        LotSizeArea: 8000,
        YearBuilt: 2022,
        PropertyType: 'Residential',
        PublicRemarks: 'Stunning beachfront villa with panoramic ocean views.',
        MlsStatus: 'Active'
      },
      Media: [{
        Uri300: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=300',
        Uri800: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
        Uri1024: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1024',
        Uri1280: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1280'
      }]
    }
  ];
}