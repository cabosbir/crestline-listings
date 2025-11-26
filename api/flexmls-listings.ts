// api/flexmls-listings.ts - RESO Web API v3 - WITH PAGINATION
import type { VercelRequest, VercelResponse } from '@vercel/node';

const FLEXMLS_API_KEY = process.env.FLEXMLS_API_KEY;
const RESO_API_BASE = 'https://replication.sparkapi.com/Version/3/Reso/OData';

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

    // Build RESO OData $filter query
    const filters: string[] = [];
    if (city) filters.push(`City eq '${city}'`);
    if (minPrice) filters.push(`ListPrice ge ${minPrice}`);
    if (maxPrice) filters.push(`ListPrice le ${maxPrice}`);
    if (bedrooms) filters.push(`BedroomsTotal ge ${bedrooms}`);
    if (bathrooms) filters.push(`BathroomsFull ge ${bathrooms}`);
    
    const filterString = filters.length > 0 ? filters.join(' and ') : '';
    
    // 🔥 NEW: Fetch ALL listings with pagination
    const allListings = await fetchAllListings(filterString);
    
    console.log('✅ Total listings fetched:', allListings.length);
    
    return res.status(200).json({
      success: true,
      results: allListings,
      count: allListings.length,
      total: allListings.length
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

// 🔥 NEW FUNCTION: Fetch all listings with pagination
async function fetchAllListings(filterString: string): Promise<any[]> {
  let allListings: any[] = [];
  let skip = 0;
  const top = 200; // Fetch 200 per request (max allowed by most RESO APIs)
  let hasMore = true;

  while (hasMore) {
    // Build RESO OData URL with pagination
    const url = new URL(`${RESO_API_BASE}/Property`);
    if (filterString) {
      url.searchParams.append('$filter', filterString);
    }
    url.searchParams.append('$top', top.toString());
    url.searchParams.append('$skip', skip.toString());
    url.searchParams.append('$expand', 'Media');
    url.searchParams.append('$orderby', 'ModificationTimestamp desc'); // Most recent first

    console.log(`📡 Fetching page ${skip / top + 1} (skip: ${skip})...`);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${FLEXMLS_API_KEY}`,
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error on page:', errorText.substring(0, 300));
      break; // Stop pagination on error
    }

    const data = await response.json();
    const results = data.value || [];
    
    console.log(`✅ Fetched ${results.length} listings (total so far: ${allListings.length + results.length})`);
    
    if (results.length === 0) {
      hasMore = false; // No more results
    } else {
      allListings = [...allListings, ...results];
      
      if (results.length < top) {
        hasMore = false; // Last page (got fewer than requested)
      } else {
        skip += top; // Move to next page
      }
    }

    // Safety limit: Stop after fetching 5000 listings (adjust as needed)
    if (allListings.length >= 5000) {
      console.log('⚠️ Reached safety limit of 5000 listings');
      hasMore = false;
    }
  }

  return allListings;
}