// api/flexmls-listings.ts - FAST RESPONSE (Returns first 200 immediately)
import type { VercelRequest, VercelResponse } from '@vercel/node';

const FLEXMLS_API_KEY = process.env.FLEXMLS_API_KEY;
const RESO_API_BASE = 'https://replication.sparkapi.com/Version/3/Reso/OData';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1800'); // 10 min cache
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!FLEXMLS_API_KEY) {
    return res.status(200).json({ 
      success: false, 
      error: 'API key not configured',
      results: []
    });
  }

  try {
    const { 
      city,
      minPrice, 
      maxPrice, 
      bedrooms,
      bathrooms,
      propertyType,
      status,
      minSqft,
      yearBuilt
    } = req.query;

    console.log('🔍 [Fast Response] Filters:', {
      city, minPrice, maxPrice, bedrooms, bathrooms, propertyType, status
    });

    // ========================================
    // BUILD RESO $filter QUERY
    // ========================================
    const filters: string[] = [];

    // LOCATION
    if (city && typeof city === 'string') {
      filters.push(`City eq '${city.replace(/'/g, "''")}'`);
    }

    // PRICE
    if (minPrice && typeof minPrice === 'string') {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) filters.push(`ListPrice ge ${min}`);
    }

    if (maxPrice && typeof maxPrice === 'string') {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) filters.push(`ListPrice le ${max}`);
    }

    // BEDS & BATHS
    if (bedrooms && typeof bedrooms === 'string') {
      const beds = parseInt(bedrooms);
      if (!isNaN(beds)) filters.push(`BedroomsTotal ge ${beds}`);
    }

    if (bathrooms && typeof bathrooms === 'string') {
      const baths = parseInt(bathrooms);
      if (!isNaN(baths)) filters.push(`BathroomsFull ge ${baths}`);
    }

    // PROPERTY TYPE
    if (propertyType && typeof propertyType === 'string') {
      const typeMap: Record<string, string> = {
        'Condos': 'Residential',
        'Houses': 'Residential', 
        'Land': 'Land',
        'Commercial': 'Commercial',
        'Fractional': 'Residential',
        'MultiFamily': 'Residential'
      };
      const resoType = typeMap[propertyType];
      if (resoType) filters.push(`PropertyType eq '${resoType}'`);
    }

    // STATUS (default Active)
    const statusValue = (status && typeof status === 'string') ? status : 'Active';
    filters.push(`StandardStatus eq '${statusValue}'`);

    // SQFT
    if (minSqft && typeof minSqft === 'string' && minSqft !== 'No Preference') {
      const sqft = parseInt(minSqft.replace('+', ''));
      if (!isNaN(sqft)) filters.push(`LivingArea ge ${sqft}`);
    }

    // YEAR
    if (yearBuilt && typeof yearBuilt === 'string' && yearBuilt !== 'No Preference') {
      const year = parseInt(yearBuilt.replace('+', ''));
      if (!isNaN(year)) filters.push(`YearBuilt ge ${year}`);
    }

    const filterString = filters.join(' and ');
    console.log('🎯 [Filter]:', filterString);

    // ========================================
    // FETCH ONLY FIRST 200 (FAST!)
    // ========================================
    const listings = await fetchFirst200(filterString);

    console.log(`✅ [Result] ${listings.length} listings`);

    return res.status(200).json({
      success: true,
      results: listings,
      count: listings.length,
      total: listings.length,
      filters: filterString,
      note: listings.length === 200 ? 'Showing first 200 results. Apply more filters to narrow search.' : undefined
    });

  } catch (error) {
    console.error('💥 [Error]:', error);
    return res.status(200).json({ 
      success: false, 
      results: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// ========================================
// FETCH FIRST 200 ONLY (FAST!)
// ========================================
async function fetchFirst200(filterString: string): Promise<any[]> {
  const url = new URL(`${RESO_API_BASE}/Property`);
  
  // Add filters
  if (filterString) {
    url.searchParams.append('$filter', filterString);
  }
  
  // ONLY FETCH 200 (one request!)
  url.searchParams.append('$top', '200');
  url.searchParams.append('$skip', '0');
  url.searchParams.append('$expand', 'Media');
  url.searchParams.append('$orderby', 'ModificationTimestamp desc');

  console.log(`📡 [Fast Fetch] Getting first 200 listings...`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${FLEXMLS_API_KEY}`,
        'Accept': 'application/json',
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [API Error]:`, response.status, errorText.substring(0, 200));
      
      // On 429, return empty array (better than crashing)
      if (response.status === 429) {
        console.log(`⚠️ [Rate Limited] Returning empty results`);
        return [];
      }
      
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    const results = data.value || [];
    
    console.log(`✅ [Success] Got ${results.length} listings`);
    
    return results;
  } catch (error) {
    console.error(`❌ [Fetch Failed]:`, error);
    
    // Return empty array instead of throwing (graceful degradation)
    return [];
  }
}
