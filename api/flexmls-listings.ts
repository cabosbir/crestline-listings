// api/flexmls-listings.ts - SERVER-SIDE FILTERING (DOMINO EFFECT)
import type { VercelRequest, VercelResponse } from '@vercel/node';

const FLEXMLS_API_KEY = process.env.FLEXMLS_API_KEY;
const RESO_API_BASE = 'https://replication.sparkapi.com/Version/3/Reso/OData';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'public, s-maxage=300'); // Cache for 5 minutes
  
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
      city,           // Zone/Area/Community (location)
      minPrice, 
      maxPrice, 
      bedrooms,       // minBeds
      bathrooms,      // minBaths
      propertyType,   // Condos, Houses, Land, etc.
      status,         // Active, Pending, etc.
      minSqft,
      yearBuilt
    } = req.query;

    console.log('🔍 [Domino Effect] Filters received:', {
      city, minPrice, maxPrice, bedrooms, bathrooms, propertyType, status, minSqft, yearBuilt
    });

    // ========================================
    // BUILD RESO $filter QUERY (Server-side filtering!)
    // ========================================
    const filters: string[] = [];

    // LOCATION (Zone/Area/Community)
    if (city && typeof city === 'string') {
      // FlexMLS uses City field for location
      filters.push(`City eq '${city.replace(/'/g, "''")}'`); // Escape single quotes
    }

    // PRICE RANGE
    if (minPrice && typeof minPrice === 'string') {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        filters.push(`ListPrice ge ${min}`);
      }
    }

    if (maxPrice && typeof maxPrice === 'string') {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        filters.push(`ListPrice le ${max}`);
      }
    }

    // BEDROOMS
    if (bedrooms && typeof bedrooms === 'string') {
      const beds = parseInt(bedrooms);
      if (!isNaN(beds)) {
        filters.push(`BedroomsTotal ge ${beds}`);
      }
    }

    // BATHROOMS
    if (bathrooms && typeof bathrooms === 'string') {
      const baths = parseInt(bathrooms);
      if (!isNaN(baths)) {
        filters.push(`BathroomsFull ge ${baths}`);
      }
    }

    // PROPERTY TYPE
    if (propertyType && typeof propertyType === 'string') {
      // Map frontend types to RESO PropertyType values
      const typeMap: Record<string, string> = {
        'Condos': 'Residential',
        'Houses': 'Residential', 
        'Land': 'Land',
        'Commercial': 'Commercial',
        'Fractional': 'Residential',
        'MultiFamily': 'Residential'
      };
      
      const resoType = typeMap[propertyType];
      if (resoType) {
        filters.push(`PropertyType eq '${resoType}'`);
      }
    }

    // STATUS (default to Active if not specified)
    const statusValue = (status && typeof status === 'string') ? status : 'Active';
    filters.push(`StandardStatus eq '${statusValue}'`);

    // SQUARE FEET
    if (minSqft && typeof minSqft === 'string' && minSqft !== 'No Preference') {
      const sqft = parseInt(minSqft.replace('+', ''));
      if (!isNaN(sqft)) {
        filters.push(`LivingArea ge ${sqft}`);
      }
    }

    // YEAR BUILT
    if (yearBuilt && typeof yearBuilt === 'string' && yearBuilt !== 'No Preference') {
      const year = parseInt(yearBuilt.replace('+', ''));
      if (!isNaN(year)) {
        filters.push(`YearBuilt ge ${year}`);
      }
    }

    const filterString = filters.join(' and ');
    
    console.log('🎯 [API Filter]:', filterString);

    // ========================================
    // FETCH FROM FLEXMLS WITH FILTERS
    // ========================================
    const allListings = await fetchFilteredListings(filterString);

    console.log(`✅ [Domino Result] Got ${allListings.length} listings matching filters`);

    return res.status(200).json({
      success: true,
      results: allListings,
      count: allListings.length,
      total: allListings.length,
      filters: filterString,
      cached: false
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
// FETCH WITH SERVER-SIDE FILTERS
// ========================================
async function fetchFilteredListings(filterString: string): Promise<any[]> {
  let allListings: any[] = [];
  let skip = 0;
  const top = 200; // Fetch 200 per request
  let hasMore = true;
  let requestCount = 0;
  const MAX_REQUESTS = 25; // Safety limit (5000 max listings)

  while (hasMore && requestCount < MAX_REQUESTS) {
    const url = new URL(`${RESO_API_BASE}/Property`);
    
    // Add filters
    if (filterString) {
      url.searchParams.append('$filter', filterString);
    }
    
    // Add pagination
    url.searchParams.append('$top', top.toString());
    url.searchParams.append('$skip', skip.toString());
    url.searchParams.append('$expand', 'Media');
    url.searchParams.append('$orderby', 'ModificationTimestamp desc');

    console.log(`📡 [Batch ${requestCount + 1}] Fetching skip=${skip}...`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

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
        console.error(`❌ [Batch ${requestCount + 1}] Error:`, response.status, errorText.substring(0, 200));
        
        // On rate limit or error, return what we have
        if (response.status === 429 || allListings.length > 0) {
          console.log(`⚠️ Returning ${allListings.length} partial results`);
          break;
        }
        
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      const results = data.value || [];
      
      console.log(`✅ [Batch ${requestCount + 1}] Got ${results.length} listings (total: ${allListings.length + results.length})`);
      
      if (results.length === 0) {
        hasMore = false; // No more results
      } else {
        allListings = [...allListings, ...results];
        
        if (results.length < top) {
          hasMore = false; // Last page
        } else {
          skip += top;
          requestCount++;
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
    } catch (error) {
      console.error(`❌ [Batch ${requestCount + 1}] Failed:`, error);
      
      // Return what we have if we collected something
      if (allListings.length > 0) {
        console.log(`⚠️ Error occurred, returning ${allListings.length} listings`);
        break;
      }
      
      throw error;
    }
  }

  console.log(`✅ [Final] Total listings: ${allListings.length}`);
  return allListings;
}