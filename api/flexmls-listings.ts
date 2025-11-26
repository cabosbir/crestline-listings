// api/flexmls-listings.ts - RESO Web API v3 - WITH CACHING & OPTIMIZATION
import type { VercelRequest, VercelResponse } from '@vercel/node';

const FLEXMLS_API_KEY = process.env.FLEXMLS_API_KEY;
const RESO_API_BASE = 'https://replication.sparkapi.com/Version/3/Reso/OData';

// In-memory cache (will persist during serverless function warm starts)
let cachedListings: any[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!FLEXMLS_API_KEY) {
    return res.status(200).json({ 
      success: false, 
      error: 'API key not configured',
      results: []
    });
  }

  try {
    const { city, minPrice, maxPrice, bedrooms, bathrooms } = req.query;

    // Check if cache is valid
    const now = Date.now();
    const isCacheValid = cachedListings && (now - cacheTimestamp) < CACHE_DURATION;

    let allListings: any[] = [];

    if (isCacheValid && cachedListings) {
      console.log('✅ Using cached listings:', cachedListings.length);
      allListings = cachedListings;
    } else {
      console.log('🔄 Cache expired or empty, fetching new listings...');
      
      try {
        // Fetch with limited results to avoid timeout
        allListings = await fetchListingsWithLimit(1000); // Limit to 1000 to stay under 30s
        
        // Update cache
        cachedListings = allListings;
        cacheTimestamp = now;
        
        console.log('✅ Cached', allListings.length, 'listings');
      } catch (error) {
        console.error('❌ Error fetching listings:', error);
        
        // If fetch fails but we have old cache, use it
        if (cachedListings) {
          console.log('⚠️ Using stale cache due to fetch error');
          allListings = cachedListings;
        } else {
          throw error; // No cache available, throw error
        }
      }
    }

    // Apply client-side filters
    let filteredListings = allListings;

    if (city && typeof city === 'string') {
      filteredListings = filteredListings.filter(listing => 
        listing.City?.toLowerCase().includes(city.toLowerCase())
      );
    }

    if (minPrice && typeof minPrice === 'string') {
      const min = parseFloat(minPrice);
      filteredListings = filteredListings.filter(listing => 
        listing.ListPrice >= min
      );
    }

    if (maxPrice && typeof maxPrice === 'string') {
      const max = parseFloat(maxPrice);
      filteredListings = filteredListings.filter(listing => 
        listing.ListPrice <= max
      );
    }

    if (bedrooms && typeof bedrooms === 'string') {
      const beds = parseInt(bedrooms);
      filteredListings = filteredListings.filter(listing => 
        listing.BedroomsTotal >= beds
      );
    }

    if (bathrooms && typeof bathrooms === 'string') {
      const baths = parseInt(bathrooms);
      filteredListings = filteredListings.filter(listing => 
        listing.BathroomsFull >= baths
      );
    }

    console.log('✅ Returning', filteredListings.length, 'filtered listings');
    
    return res.status(200).json({
      success: true,
      results: filteredListings,
      count: filteredListings.length,
      total: allListings.length,
      cached: isCacheValid,
      cacheAge: isCacheValid ? Math.round((now - cacheTimestamp) / 1000) : 0
    });

  } catch (error) {
    console.error('💥 Error:', error);
    return res.status(200).json({ 
      success: false, 
      results: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Fetch listings with a limit to avoid timeout
async function fetchListingsWithLimit(maxListings: number): Promise<any[]> {
  let allListings: any[] = [];
  let skip = 0;
  const top = 200; // Fetch 200 per request
  let hasMore = true;
  let requestCount = 0;
  const maxRequests = Math.ceil(maxListings / top); // e.g., 5 requests for 1000 listings

  while (hasMore && requestCount < maxRequests) {
    const url = new URL(`${RESO_API_BASE}/Property`);
    url.searchParams.append('$top', top.toString());
    url.searchParams.append('$skip', skip.toString());
    url.searchParams.append('$expand', 'Media');
    url.searchParams.append('$orderby', 'ModificationTimestamp desc');

    console.log(`📡 Fetching batch ${requestCount + 1}/${maxRequests} (skip: ${skip})...`);

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${FLEXMLS_API_KEY}`,
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout per request
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error on batch:', response.status, errorText.substring(0, 200));
        
        // If we hit rate limit (429), stop and return what we have
        if (response.status === 429) {
          console.log('⚠️ Rate limit hit, returning partial results:', allListings.length);
          break;
        }
        
        break; // Stop on other errors
      }

      const data = await response.json();
      const results = data.value || [];
      
      console.log(`✅ Batch ${requestCount + 1}: ${results.length} listings (total: ${allListings.length + results.length})`);
      
      if (results.length === 0) {
        hasMore = false;
      } else {
        allListings = [...allListings, ...results];
        
        if (results.length < top) {
          hasMore = false; // Last page
        } else {
          skip += top;
          requestCount++;
          
          // Small delay to avoid rate limiting (100ms between requests)
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    } catch (error) {
      console.error('❌ Request error:', error instanceof Error ? error.message : error);
      break; // Stop on request errors
    }
  }

  console.log('✅ Total fetched:', allListings.length, 'listings');
  return allListings;
}