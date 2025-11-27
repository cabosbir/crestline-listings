// api/flexmls-listings.ts - FETCH ALL RESULTS WITH OPTIONAL LIMIT
import type { VercelRequest, VercelResponse } from '@vercel/node';

const FLEXMLS_API_KEY = process.env.FLEXMLS_API_KEY;
const RESO_API_BASE = 'https://replication.sparkapi.com/Version/3/Reso/OData';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1800');
  
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
      areas,
      communities,
      subdivisions,
      minPrice, 
      maxPrice, 
      bedrooms,
      bathrooms,
      propertyTypes,
      status,
      minSqft,
      yearBuilt,
      limit // NEW: Optional limit parameter
    } = req.query;

    const maxResults = limit && typeof limit === 'string' ? parseInt(limit) : undefined;

    console.log('🔍 [API] Filters:', {
      city, areas, communities, subdivisions, minPrice, maxPrice, 
      bedrooms, bathrooms, propertyTypes, status, limit: maxResults
    });

    // BUILD RESO $filter QUERY
    const filters: string[] = [];

    // LOCATION - City/Zone
    if (city && typeof city === 'string') {
      const cities = city.split(',').map(c => c.trim());
      if (cities.length === 1) {
        filters.push(`City eq '${cities[0].replace(/'/g, "''")}'`);
      } else {
        const cityFilters = cities.map(c => `City eq '${c.replace(/'/g, "''")}'`);
        filters.push(`(${cityFilters.join(' or ')})`);
      }
    }

    // AREAS
    if (areas && typeof areas === 'string') {
      const areaList = areas.split(',').map(a => a.trim());
      if (areaList.length === 1) {
        filters.push(`MLSAreaMajor eq '${areaList[0].replace(/'/g, "''")}'`);
      } else {
        const areaFilters = areaList.map(a => `MLSAreaMajor eq '${a.replace(/'/g, "''")}'`);
        filters.push(`(${areaFilters.join(' or ')})`);
      }
    }

    // COMMUNITIES
    if (communities && typeof communities === 'string') {
      const communityList = communities.split(',').map(c => c.trim());
      if (communityList.length === 1) {
        filters.push(`contains(SubdivisionName, '${communityList[0].replace(/'/g, "''")}')`);
      } else {
        const communityFilters = communityList.map(c => `contains(SubdivisionName, '${c.replace(/'/g, "''")}')`);
        filters.push(`(${communityFilters.join(' or ')})`);
      }
    }

    // SUBDIVISIONS
    if (subdivisions && typeof subdivisions === 'string') {
      const subdivisionList = subdivisions.split(',').map(s => s.trim());
      if (subdivisionList.length === 1) {
        filters.push(`contains(SubdivisionName, '${subdivisionList[0].replace(/'/g, "''")}')`);
      } else {
        const subdivisionFilters = subdivisionList.map(s => `contains(SubdivisionName, '${s.replace(/'/g, "''")}')`);
        filters.push(`(${subdivisionFilters.join(' or ')})`);
      }
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

    // PROPERTY TYPES
    if (propertyTypes && typeof propertyTypes === 'string') {
      const types = propertyTypes.split(',').map(t => t.trim());
      const typeMap: Record<string, string> = {
        'Condos': 'Residential',
        'Houses': 'Residential', 
        'Land': 'Land',
        'Commercial': 'Commercial',
        'Fractional': 'Residential',
        'MultiFamily': 'Residential'
      };
      const resoTypes = [...new Set(types.map(t => typeMap[t]).filter(Boolean))];
      if (resoTypes.length > 0) {
        if (resoTypes.length === 1) {
          filters.push(`PropertyType eq '${resoTypes[0]}'`);
        } else {
          const typeFilters = resoTypes.map(t => `PropertyType eq '${t}'`);
          filters.push(`(${typeFilters.join(' or ')})`);
        }
      }
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

    // FETCH RESULTS (with optional limit)
    const listings = maxResults 
      ? await fetchLimitedResults(filterString, maxResults)
      : await fetchAllResults(filterString);

    console.log(`✅ [Result] ${listings.length} listings${maxResults ? ` (limited to ${maxResults})` : ''}`);

    return res.status(200).json({
      success: true,
      results: listings,
      count: listings.length,
      total: listings.length,
      filters: filterString,
      limited: !!maxResults
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

// FETCH LIMITED RESULTS (for landing pages)
async function fetchLimitedResults(filterString: string, limit: number): Promise<any[]> {
  const url = new URL(`${RESO_API_BASE}/Property`);
  
  if (filterString) {
    url.searchParams.append('$filter', filterString);
  }
  
  url.searchParams.append('$top', limit.toString());
  url.searchParams.append('$skip', '0');
  url.searchParams.append('$expand', 'Media');
  url.searchParams.append('$orderby', 'ModificationTimestamp desc');

  console.log(`📡 [Limited Fetch] Getting up to ${limit} listings...`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

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
      if (response.status === 429) {
        console.log(`⚠️ [Rate Limited]`);
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
    return [];
  }
}

// FETCH ALL RESULTS WITH PAGINATION (for search)
async function fetchAllResults(filterString: string): Promise<any[]> {
  let allResults: any[] = [];
  let skip = 0;
  const top = 200;
  let hasMore = true;

  console.log(`📡 [Pagination] Starting to fetch all results...`);

  while (hasMore && skip < 5000) {
    const url = new URL(`${RESO_API_BASE}/Property`);
    
    if (filterString) {
      url.searchParams.append('$filter', filterString);
    }
    
    url.searchParams.append('$top', top.toString());
    url.searchParams.append('$skip', skip.toString());
    url.searchParams.append('$expand', 'Media');
    url.searchParams.append('$orderby', 'ModificationTimestamp desc');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

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
        if (response.status === 429) {
          console.log(`⚠️ [Rate Limited] Stopping at ${allResults.length} results`);
          break;
        }
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      const results = data.value || [];
      
      console.log(`✅ [Page ${Math.floor(skip / top) + 1}] Got ${results.length} listings (total: ${allResults.length + results.length})`);
      
      allResults = [...allResults, ...results];
      
      if (results.length < top) {
        hasMore = false;
        console.log(`🎉 [Complete] Fetched all ${allResults.length} results`);
      } else {
        skip += top;
      }
      
    } catch (error) {
      console.error(`❌ [Fetch Failed at skip ${skip}]:`, error);
      hasMore = false;
    }
  }

  return allResults;
}