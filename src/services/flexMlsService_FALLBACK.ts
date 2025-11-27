// flexMlsService_FALLBACK.ts - Enhanced with Auto-Fallback Search
import { saveFieldMapping, recordFilterResult, type FilterMapping } from './groqFilterIntelligence_SMART';

export interface SearchFilters {
  city?: string;
  area?: string;
  community?: string;
  subdivision?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyTypes?: string[];
  status?: string;
  search?: string;
  limit?: number;
}

export interface FallbackResult {
  success: boolean;
  results: any[];
  count: number;
  attemptedFields: Array<{
    field: string;
    value: string;
    count: number;
  }>;
  workingField?: string;
  workingValue?: string;
  fieldMapping?: FilterMapping;
}

// ============================================================================
// CORE SEARCH FUNCTION
// ============================================================================

async function fetchListings(filters: SearchFilters): Promise<any[]> {
  const queryParams = new URLSearchParams();

  // Location filters
  if (filters.city) queryParams.append('city', filters.city);
  if (filters.area) queryParams.append('area', filters.area);
  if (filters.community) queryParams.append('community', filters.community);
  if (filters.subdivision) queryParams.append('subdivision', filters.subdivision);

  // Price
  if (filters.minPrice) queryParams.append('minPrice', filters.minPrice.toString());
  if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice.toString());

  // Property details
  if (filters.bedrooms) queryParams.append('bedrooms', filters.bedrooms.toString());
  if (filters.bathrooms) queryParams.append('bathrooms', filters.bathrooms.toString());
  
  // Property types
  if (filters.propertyTypes && filters.propertyTypes.length > 0) {
    queryParams.append('propertyTypes', filters.propertyTypes.join(','));
  }

  // Status
  if (filters.status) queryParams.append('status', filters.status);

  // Search
  if (filters.search) queryParams.append('search', filters.search);

  // Limit
  if (filters.limit) queryParams.append('limit', filters.limit.toString());

  const apiBase = import.meta.env.DEV ? 'https://bircabo.com' : '';
  const url = `${apiBase}/api/flexmls-listings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  console.log('📡 Fetching listings from:', url);

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.success) {
      return data.results || [];
    } else {
      console.error('API error:', data.error);
      return [];
    }
  } catch (error) {
    console.error('Fetch error:', error);
    return [];
  }
}

// ============================================================================
// AUTO-FALLBACK SEARCH SYSTEM
// ============================================================================

export async function searchWithFallback(
  primaryFilters: SearchFilters,
  locationValue: string,
  originalField: 'zone' | 'area' | 'community' | 'subdivision'
): Promise<FallbackResult> {
  const attemptedFields: Array<{ field: string; value: string; count: number }> = [];

  console.log(`🔄 Starting fallback search for "${locationValue}" (original field: ${originalField})`);

  // ATTEMPT 1: Try original field
  console.log(`\n🎯 Attempt 1: Trying as ${originalField}`);
  let filters = { ...primaryFilters };
  let results = await fetchListings(filters);
  attemptedFields.push({ field: originalField, value: locationValue, count: results.length });

  if (results.length > 0) {
    console.log(`✅ Success! Found ${results.length} results in ${originalField}`);
    recordFilterResult(originalField, locationValue, locationValue, results.length);
    return {
      success: true,
      results,
      count: results.length,
      attemptedFields,
      workingField: originalField,
      workingValue: locationValue,
    };
  }

  // ATTEMPT 2-5: Try all other fields
  const fieldsTryOrder: Array<'zone' | 'area' | 'community' | 'subdivision'> = 
    ['zone', 'area', 'community', 'subdivision'].filter(f => f !== originalField) as any;

  for (const field of fieldsTryOrder) {
    console.log(`\n🎯 Attempt ${attemptedFields.length + 1}: Trying as ${field}`);
    
    filters = { ...primaryFilters };
    
    // Clear all location fields first
    delete filters.city;
    delete filters.area;
    delete filters.community;
    delete filters.subdivision;

    // Set the new field
    if (field === 'zone') {
      filters.city = locationValue;
    } else if (field === 'area') {
      filters.area = locationValue;
    } else if (field === 'community') {
      filters.community = locationValue;
    } else if (field === 'subdivision') {
      filters.subdivision = locationValue;
    }

    results = await fetchListings(filters);
    attemptedFields.push({ field, value: locationValue, count: results.length });

    if (results.length > 0) {
      console.log(`✅ SUCCESS! Found ${results.length} results in ${field}`);
      
      // Save the successful field mapping
      const mapping: FilterMapping = {
        field,
        value: locationValue,
      };
      saveFieldMapping(locationValue, mapping);
      recordFilterResult(field, locationValue, locationValue, results.length);

      return {
        success: true,
        results,
        count: results.length,
        attemptedFields,
        workingField: field,
        workingValue: locationValue,
        fieldMapping: mapping,
      };
    }
  }

  // ATTEMPT 6: Try with parent zones
  console.log(`\n🎯 Attempt ${attemptedFields.length + 1}: Trying with parent zones`);
  
  // Common parent zone mappings
  const parentZoneAttempts = [
    { zone: 'La Paz', area: locationValue },
    { zone: 'Cabo San Lucas', area: locationValue },
    { zone: 'Cabo Corridor', area: locationValue },
    { zone: 'San Jose del Cabo', area: locationValue },
    { zone: 'East Cape', area: locationValue },
  ];

  for (const attempt of parentZoneAttempts) {
    console.log(`   Trying: zone="${attempt.zone}" + area="${attempt.area}"`);
    filters = { ...primaryFilters };
    delete filters.community;
    delete filters.subdivision;
    filters.city = attempt.zone;
    filters.area = attempt.area;

    results = await fetchListings(filters);
    
    if (results.length > 0) {
      console.log(`✅ SUCCESS! Found ${results.length} results with zone="${attempt.zone}" + area="${attempt.area}"`);
      
      const mapping: FilterMapping = {
        field: 'area',
        value: locationValue,
        parentZone: attempt.zone,
      };
      saveFieldMapping(locationValue, mapping);
      recordFilterResult('area', locationValue, locationValue, results.length);

      attemptedFields.push({ 
        field: `zone:${attempt.zone}+area`, 
        value: locationValue, 
        count: results.length 
      });

      return {
        success: true,
        results,
        count: results.length,
        attemptedFields,
        workingField: 'area',
        workingValue: locationValue,
        fieldMapping: mapping,
      };
    }
  }

  // All attempts failed
  console.log(`❌ No results found in any field for "${locationValue}"`);
  recordFilterResult(originalField, locationValue, locationValue, 0);

  return {
    success: false,
    results: [],
    count: 0,
    attemptedFields,
  };
}

// ============================================================================
// REGULAR SEARCH (No fallback)
// ============================================================================

export async function searchListings(filters: SearchFilters): Promise<any[]> {
  return await fetchListings(filters);
}

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

export { fetchListings };
