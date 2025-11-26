// src/services/flexMlsService.ts - UPDATED WITH PAGINATION NOTES

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

// In-memory cache for properties
const propertyCache: Map<string, MLSProperty> = new Map();

/*
  ⚠️ IMPORTANT: YOUR BACKEND API NEEDS TO FETCH ALL LISTINGS
  
  The issue: Your FlexMLS has 4,541 listings but your API only returns 50.
  
  SOLUTION: Your backend /api/flexmls-listings endpoint needs to:
  
  1. Implement pagination loops to fetch ALL pages from FlexMLS API
  2. FlexMLS API typically returns 25-50 results per page
  3. You need to loop until you get all ~4,500 listings
  
  Example backend implementation (Node.js/Express):
  
  ```javascript
  async function fetchAllListings() {
    let allListings = [];
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
      const response = await fetch(`https://sparkapi.flexmls.com/v1/listings?_limit=200&_page=${page}`, {
        headers: {
          'X-SparkApi-User-Agent': 'YourApp',
          'Authorization': 'OAuth YOUR_ACCESS_TOKEN'
        }
      });
      
      const data = await response.json();
      
      if (data.D && data.D.Results) {
        allListings = [...allListings, ...data.D.Results];
        
        // Check if there are more pages
        if (data.D.Results.length < 200) {
          hasMore = false; // Last page
        } else {
          page++;
        }
      } else {
        hasMore = false;
      }
    }
    
    return allListings; // Should return ~4,500 listings
  }
  ```
  
  ALTERNATIVE: Use FlexMLS pagination metadata
  - FlexMLS returns pagination info in the response
  - Look for: D.Pagination.TotalRows, D.Pagination.TotalPages
  - Loop until you've fetched all pages
  
  PERFORMANCE TIP:
  - Cache all listings in memory or Redis
  - Refresh every 15-30 minutes
  - This prevents hitting the API on every user search
*/

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
    console.log('📊 Total in MLS:', data.total || 'Unknown'); // Your API should return total count
    
    // Cache the properties for later retrieval
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
    
    // First, check if we have it cached from listings
    if (propertyCache.has(trimmedKey)) {
      console.log('✅ Found property in cache:', trimmedKey);
      return propertyCache.get(trimmedKey) || null;
    }

    console.log('🔍 Searching for property by ListingKey:', trimmedKey);
    
    // Fetch listings without filters to get all properties
    const url = `/api/flexmls-listings`;
    
    console.log('📡 Fetching all listings from:', url);
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.success || !data.results) {
      console.error('❌ Failed to fetch listings');
      return null;
    }

    console.log('✅ Fetched listings:', data.results?.length || 0);
    
    // Find the property by ListingKey
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
    
    // Cache it
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