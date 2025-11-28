// src/services/flexMlsService.ts - FIXED TO PASS SPECIAL FILTERS

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
  Latitude?: number;
  Longitude?: number;
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

const propertyCache: Map<string, MLSProperty> = new Map();

export async function fetchListings(params?: {
  city?: string | string[];
  areas?: string | string[];
  communities?: string | string[];
  subdivisions?: string | string[];
  propertyTypes?: string | string[];
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  limit?: number;
  search?: string;
  listingId?: string;
  sellerFinancing?: boolean;
  primaryView?: boolean;
  currentPrice?: boolean;
  // 🆕 Dynamic field names from AI discovery
  viewFieldName?: string;
  sellerFinancingFieldName?: string;
  currentPriceFieldName?: string;
  originalPriceFieldName?: string;
}): Promise<MLSProperty[]> {
  try {
    const queryParams = new URLSearchParams();
    
    // Handle search parameters FIRST (highest priority)
    if (params?.search) {
      queryParams.append('search', params.search);
    }
    if (params?.listingId) {
      queryParams.append('listingId', params.listingId);
    }
    
    // Handle arrays and strings for ALL location filters
    if (params?.city) {
      const cities = Array.isArray(params.city) ? params.city.join(',') : params.city;
      queryParams.append('city', cities);
    }
    if (params?.areas) {
      const areasStr = Array.isArray(params.areas) ? params.areas.join(',') : params.areas;
      queryParams.append('area', areasStr);
    }
    if (params?.communities) {
      const communitiesStr = Array.isArray(params.communities) ? params.communities.join(',') : params.communities;
      queryParams.append('community', communitiesStr);
    }
    if (params?.subdivisions) {
      const subdivisionsStr = Array.isArray(params.subdivisions) ? params.subdivisions.join(',') : params.subdivisions;
      queryParams.append('subdivision', subdivisionsStr);
    }
    if (params?.propertyTypes) {
      const typesStr = Array.isArray(params.propertyTypes) ? params.propertyTypes.join(',') : params.propertyTypes;
      queryParams.append('propertyTypes', typesStr);
    }
    if (params?.status) {
      queryParams.append('status', params.status);
    }
    
    if (params?.minPrice) queryParams.append('minPrice', params.minPrice.toString());
    if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params?.bedrooms) queryParams.append('bedrooms', params.bedrooms.toString());
    if (params?.bathrooms) queryParams.append('bathrooms', params.bathrooms.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    // 🆕 SPECIAL FILTERS - THIS WAS MISSING!
    if (params?.sellerFinancing) {
      queryParams.append('sellerFinancing', 'true');
      if (params.sellerFinancingFieldName) {
        queryParams.append('sellerFinancingFieldName', params.sellerFinancingFieldName);
      }
      console.log('💵 Service: Adding seller financing filter');
    }
    if (params?.primaryView) {
      queryParams.append('primaryView', 'true');
      if (params.viewFieldName) {
        queryParams.append('viewFieldName', params.viewFieldName);
        console.log(`👁️ Service: Adding primary view filter (field: ${params.viewFieldName})`);
      } else {
        console.log('👁️ Service: Adding primary view filter');
      }
    }
    if (params?.currentPrice) {
      queryParams.append('currentPrice', 'true');
      if (params.currentPriceFieldName) {
        queryParams.append('currentPriceFieldName', params.currentPriceFieldName);
      }
      if (params.originalPriceFieldName) {
        queryParams.append('originalPriceFieldName', params.originalPriceFieldName);
      }
      console.log('💲 Service: Adding current price filter');
    }
    
    const url = `/api/flexmls-listings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    console.log('📡 Fetching listings from:', url);
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.success) {
      console.warn('⚠️ API returned no results, using fallback');
      return getFallbackListings();
    }
    
    console.log('✅ Fetched listings:', data.results?.length || 0);
    console.log('📊 Total in MLS:', data.total || 'Unknown');
    
    if (data.results && Array.isArray(data.results)) {
      data.results.forEach((prop: MLSProperty) => {
        propertyCache.set(prop.ListingKey, prop);
      });
    }
    
    return data.results || getFallbackListings();
  } catch (error) {
    console.error('❌ Error fetching listings:', error);
    return getFallbackListings();
  }
}

export async function fetchPropertyById(listingKey: string): Promise<MLSProperty | null> {
  try {
    if (!listingKey || listingKey.trim() === '') {
      console.error('❌ Invalid listing key provided:', listingKey);
      return null;
    }

    const trimmedKey = listingKey.trim();
    
    if (propertyCache.has(trimmedKey)) {
      console.log('✅ Found property in cache:', trimmedKey);
      return propertyCache.get(trimmedKey) || null;
    }

    console.log('🔍 Searching for property by ListingKey:', trimmedKey);
    
    const url = `/api/flexmls-listings`;
    
    console.log('📡 Fetching all listings from:', url);
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.success || !data.results) {
      console.error('❌ Failed to fetch listings');
      return null;
    }

    console.log('✅ Fetched listings:', data.results?.length || 0);
    
    const property = data.results.find((p: MLSProperty) => p.ListingKey === trimmedKey);
    
    if (!property) {
      console.error('❌ Property not found:', trimmedKey);
      return null;
    }

    console.log('✅ Property found:', {
      ListingId: property.ListingId,
      Beds: property.BedroomsTotal,
      Baths: property.BathroomsFull
    });
    
    propertyCache.set(trimmedKey, property);
    
    return property;
  } catch (error) {
    console.error('💥 Error fetching property:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    return null;
  }
}

export function convertMLSToPropertyCard(mlsProperty: MLSProperty) {
  let imageUrl = 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop';
  
  if (mlsProperty.Media && mlsProperty.Media.length > 0) {
    const sortedMedia = [...mlsProperty.Media].sort((a, b) => (a.Order || 0) - (b.Order || 0));
    const firstImage = sortedMedia[0].MediaURL;
    
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
    sqft: `${mlsProperty.LivingArea?.toLocaleString() || '0'}`,
    description: mlsProperty.PublicRemarks?.substring(0, 150) || '',
    features: [],
    status: mlsProperty.StandardStatus || 'Active',
    propertyType: mlsProperty.PropertyType || 'Single Family Home',
    yearBuilt: mlsProperty.YearBuilt,
    lotSize: mlsProperty.LotSizeArea,
    latitude: mlsProperty.Latitude,
    longitude: mlsProperty.Longitude
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
    PropertyType: 'Single Family Home',
    PublicRemarks: 'Stunning beachfront villa with panoramic ocean views.',
    StandardStatus: 'Active',
    Latitude: 22.8905,
    Longitude: -109.9167,
    Media: [{
      MediaURL: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      Order: 1
    }]
  }];
}