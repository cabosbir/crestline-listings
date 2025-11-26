// api/flexmls-listings.ts - PRODUCTION READY WITH MULTI-USER SUPPORT
import type { VercelRequest, VercelResponse } from '@vercel/node';

const FLEXMLS_API_KEY = process.env.FLEXMLS_API_KEY;
const RESO_API_BASE = 'https://replication.sparkapi.com/Version/3/Reso/OData';

// ========================================
// SHARED CACHE (All users share this)
// ========================================
let cachedListings: any[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// ========================================
// REQUEST QUEUE (Prevents rate limiting)
// ========================================
let ongoingFetch: Promise<any[]> | null = null;
let waitingRequests: number = 0; // Track how many requests are waiting

// ========================================
// LAST FETCH TRACKING (Rate limit protection)
// ========================================
let lastFetchTime: number = 0;
const MIN_FETCH_INTERVAL = 60 * 1000; // Don't fetch more than once per minute

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600'); // CDN cache for 30 min
  
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
    const now = Date.now();

    // ========================================
    // STEP 1: Check if cache is valid
    // ========================================
    const isCacheValid = cachedListings && (now - cacheTimestamp) < CACHE_DURATION;
    const cacheAge = now - cacheTimestamp;

    let allListings: any[] = [];

    if (isCacheValid && cachedListings) {
      console.log(`✅ [User] Using cached listings: ${cachedListings.length} (age: ${Math.round(cacheAge / 1000)}s)`);
      allListings = cachedListings;
    } else {
      // ========================================
      // STEP 2: Check if we can fetch (rate limit protection)
      // ========================================
      const timeSinceLastFetch = now - lastFetchTime;
      const canFetch = timeSinceLastFetch >= MIN_FETCH_INTERVAL;

      if (!canFetch && cachedListings && cachedListings.length > 0) {
        // Too soon to fetch again, but we have cache - use stale cache
        console.log(`⏰ [User] Rate limit protection: using stale cache (${cachedListings.length} listings, age: ${Math.round(cacheAge / 1000)}s)`);
        allListings = cachedListings;
      } else if (ongoingFetch) {
        // ========================================
        // STEP 3: Another request is already fetching - wait for it
        // ========================================
        waitingRequests++;
        console.log(`⏳ [User ${waitingRequests}] Waiting for ongoing fetch...`);
        
        try {
          allListings = await ongoingFetch;
          console.log(`✅ [User ${waitingRequests}] Got results from ongoing fetch: ${allListings.length}`);
        } finally {
          waitingRequests--;
        }
      } else {
        // ========================================
        // STEP 4: Start a new fetch (only if no one else is fetching)
        // ========================================
        console.log(`🔄 [Primary] Starting new fetch (${waitingRequests} users waiting)...`);
        
        ongoingFetch = fetchListingsWithLimit(1000);
        lastFetchTime = now; // Mark when we started fetching
        
        try {
          allListings = await ongoingFetch;
          
          // Update cache only if we got results
          if (allListings.length > 0) {
            cachedListings = allListings;
            cacheTimestamp = now;
            console.log(`✅ [Primary] Cached ${allListings.length} listings for all users`);
          } else {
            console.log(`⚠️ [Primary] Got 0 results, keeping old cache`);
            
            // Use old cache if new fetch returned nothing
            if (cachedListings && cachedListings.length > 0) {
              allListings = cachedListings;
            }
          }
        } catch (error) {
          console.error(`❌ [Primary] Fetch error:`, error);
          
          // Use stale cache on error
          if (cachedListings && cachedListings.length > 0) {
            console.log(`⚠️ [Primary] Using stale cache due to error: ${cachedListings.length}`);
            allListings = cachedListings;
          } else {
            // No cache available at all
            return res.status(200).json({
              success: false,
              results: [],
              count: 0,
              total: 0,
              error: 'Unable to fetch listings. Please try again in a few moments.',
              retryAfter: 60
            });
          }
        } finally {
          ongoingFetch = null; // Clear ongoing fetch
        }
      }
    }

    // ========================================
    // STEP 5: Apply client-side filters (fast!)
    // ========================================
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

    console.log(`✅ [Response] Returning ${filteredListings.length} filtered listings (from ${allListings.length} total)`);
    
    return res.status(200).json({
      success: true,
      results: filteredListings,
      count: filteredListings.length,
      total: allListings.length,
      cached: isCacheValid,
      cacheAge: Math.round(cacheAge / 1000),
      serverTime: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 [Error] Handler error:', error);
    return res.status(200).json({ 
      success: false, 
      results: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// ========================================
// FETCH FUNCTION WITH RATE LIMIT PROTECTION
// ========================================
async function fetchListingsWithLimit(maxListings: number): Promise<any[]> {
  let allListings: any[] = [];
  let skip = 0;
  const top = 200; // Fetch 200 per request
  let hasMore = true;
  let requestCount = 0;
  const maxRequests = Math.ceil(maxListings / top); // e.g., 5 requests for 1000 listings
  let consecutiveErrors = 0;
  const MAX_CONSECUTIVE_ERRORS = 2;

  while (hasMore && requestCount < maxRequests && consecutiveErrors < MAX_CONSECUTIVE_ERRORS) {
    const url = new URL(`${RESO_API_BASE}/Property`);
    url.searchParams.append('$top', top.toString());
    url.searchParams.append('$skip', skip.toString());
    url.searchParams.append('$expand', 'Media');
    url.searchParams.append('$orderby', 'ModificationTimestamp desc');

    console.log(`📡 [API] Fetching batch ${requestCount + 1}/${maxRequests} (skip: ${skip})...`);

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${FLEXMLS_API_KEY}`,
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(15000) // 15 second timeout per request
      });

      if (!response.ok) {
        consecutiveErrors++;
        const errorText = await response.text();
        console.error(`❌ [API] Error on batch ${requestCount + 1}:`, response.status, errorText.substring(0, 200));
        
        // If we hit rate limit (429), stop and return what we have
        if (response.status === 429) {
          console.log(`⚠️ [API] Rate limit hit, returning partial results: ${allListings.length}`);
          break;
        }
        
        // On other errors, if we have some results, return them
        if (allListings.length > 0) {
          console.log(`⚠️ [API] Error but returning ${allListings.length} listings collected`);
          break;
        }
        
        // Add delay before retry
        await new Promise(resolve => setTimeout(resolve, 3000));
        continue;
      }

      const data = await response.json();
      const results = data.value || [];
      
      // Reset error counter on success
      consecutiveErrors = 0;
      
      console.log(`✅ [API] Batch ${requestCount + 1}: ${results.length} listings (total: ${allListings.length + results.length})`);
      
      if (results.length === 0) {
        hasMore = false;
      } else {
        allListings = [...allListings, ...results];
        
        if (results.length < top) {
          hasMore = false; // Last page
        } else {
          skip += top;
          requestCount++;
          
          // Progressive delay: 1s after 1st request, 2s after 2nd, 3s after 3rd, etc.
          const delayMs = Math.min(1000 * (requestCount + 1), 5000);
          console.log(`⏱️ [API] Waiting ${delayMs}ms before next batch...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    } catch (error) {
      consecutiveErrors++;
      console.error('❌ [API] Request error:', error instanceof Error ? error.message : error);
      
      // If we have some results, return them
      if (allListings.length > 0) {
        console.log(`⚠️ [API] Error but returning ${allListings.length} listings collected`);
        break;
      }
      
      // Add delay before retry
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  console.log(`✅ [API] Total fetched: ${allListings.length} listings`);
  return allListings;
}