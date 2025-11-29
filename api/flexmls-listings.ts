// api/flexmls-listings.ts - WITH SPECIAL FILTERS SUPPORT
import type { VercelRequest, VercelResponse } from '@vercel/node';

const FLEXMLS_API_KEY = process.env.FLEXMLS_API_KEY;
const RESO_API_BASE = 'https://replication.sparkapi.com/Version/3/Reso/OData';

function parseBooleanQuery(val: unknown): boolean | null {
  if (val === undefined || val === null) return null;
  if (typeof val === 'boolean') return val;
  if (Array.isArray(val)) {
    // If array, only accept single-value arrays like ['true']
    if (val.length === 1 && typeof val[0] === 'string') {
      const s = (val[0] as string).toLowerCase();
      if (s === 'true') return true;
      if (s === 'false') return false;
    }
    return null;
  }
  if (typeof val === 'string') {
    const s = val.toLowerCase();
    if (s === 'true') return true;
    if (s === 'false') return false;
  }
  return null;
}

function getStringOrNull(val: unknown): string | null {
  if (val === undefined || val === null) return null;
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) {
    // join multiple query params into comma separated string (consistent with previous behavior)
    return val.join(',');
  }
  return null;
}

function getStringArray(val: unknown): string[] | null {
  if (val === undefined || val === null) return null;
  if (Array.isArray(val)) {
    return val.map(v => String(v));
  }
  if (typeof val === 'string') {
    // split comma separated strings into array
    return val.split(',').map(s => s.trim()).filter(Boolean);
  }
  return null;
}

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
    // NB: do not destructure into types that force comparisons later.
    // Keep raw query, but normalize below.
    const raw = req.query;

    const cityRaw = raw.city;
    const areaRaw = raw.area;
    const communityRaw = raw.community;
    const subdivisionRaw = raw.subdivision;
    const minPriceRaw = raw.minPrice;
    const maxPriceRaw = raw.maxPrice;
    const bedroomsRaw = raw.bedrooms;
    const bathroomsRaw = raw.bathrooms;
    const propertyTypesRaw = raw.propertyTypes;
    const statusRaw = raw.status;
    const minSqftRaw = raw.minSqft;
    const yearBuiltRaw = raw.yearBuilt;
    const searchRaw = raw.search;
    const limitRaw = raw.limit;

    // Special / dynamic fields:
    const sellerFinancingRaw = raw.sellerFinancing;  // may be boolean, string, or null
    const primaryViewRaw = raw.primaryView;          // may be boolean, string, or null
    const currentPriceRaw = raw.currentPrice;        // often string or null
    const viewFieldNameRaw = raw.viewFieldName;
    const sellerFinancingFieldNameRaw = raw.sellerFinancingFieldName;
    const currentPriceFieldNameRaw = raw.currentPriceFieldName;
    const originalPriceFieldNameRaw = raw.originalPriceFieldName;

    // Normalized values (safe to compare)
    const maxResults = limitRaw && typeof limitRaw === 'string' ? parseInt(limitRaw) : undefined;
    const search = typeof searchRaw === 'string' ? searchRaw : (Array.isArray(searchRaw) ? searchRaw[0] : undefined);

    const city = getStringOrNull(cityRaw);
    const area = getStringOrNull(areaRaw);
    const community = getStringOrNull(communityRaw);
    const subdivision = getStringOrNull(subdivisionRaw);
    const minPrice = typeof minPriceRaw === 'string' ? minPriceRaw : (Array.isArray(minPriceRaw) ? String(minPriceRaw[0]) : undefined);
    const maxPrice = typeof maxPriceRaw === 'string' ? maxPriceRaw : (Array.isArray(maxPriceRaw) ? String(maxPriceRaw[0]) : undefined);
    const bedrooms = typeof bedroomsRaw === 'string' ? bedroomsRaw : (Array.isArray(bedroomsRaw) ? String(bedroomsRaw[0]) : undefined);
    const bathrooms = typeof bathroomsRaw === 'string' ? bathroomsRaw : (Array.isArray(bathroomsRaw) ? String(bathroomsRaw[0]) : undefined);
    const propertyTypes = getStringOrNull(propertyTypesRaw);
    const status = typeof statusRaw === 'string' ? statusRaw : (Array.isArray(statusRaw) ? String(statusRaw[0]) : undefined);
    const minSqft = typeof minSqftRaw === 'string' ? minSqftRaw : (Array.isArray(minSqftRaw) ? String(minSqftRaw[0]) : undefined);
    const yearBuilt = typeof yearBuiltRaw === 'string' ? yearBuiltRaw : (Array.isArray(yearBuiltRaw) ? String(yearBuiltRaw[0]) : undefined);

    // Normalized booleans
    const sellerFinancingBool = parseBooleanQuery(sellerFinancingRaw);
    const primaryViewBool = parseBooleanQuery(primaryViewRaw);
    const currentPriceBool = parseBooleanQuery(currentPriceRaw); // if front sends boolean for this
    // view field names (strings)
    const viewFieldName = typeof viewFieldNameRaw === 'string' ? viewFieldNameRaw : (Array.isArray(viewFieldNameRaw) ? String(viewFieldNameRaw[0]) : undefined);
    const sellerFinancingFieldName = typeof sellerFinancingFieldNameRaw === 'string' ? sellerFinancingFieldNameRaw : (Array.isArray(sellerFinancingFieldNameRaw) ? String(sellerFinancingFieldNameRaw[0]) : undefined);
    const currentPriceFieldName = typeof currentPriceFieldNameRaw === 'string' ? currentPriceFieldNameRaw : (Array.isArray(currentPriceFieldNameRaw) ? String(currentPriceFieldNameRaw[0]) : undefined);
    const originalPriceFieldName = typeof originalPriceFieldNameRaw === 'string' ? originalPriceFieldNameRaw : (Array.isArray(originalPriceFieldNameRaw) ? String(originalPriceFieldNameRaw[0]) : undefined);

    console.log('🔍 [API] Filters (raw):', {
      city: cityRaw, area: areaRaw, community: communityRaw, subdivision: subdivisionRaw,
      minPrice: minPriceRaw, maxPrice: maxPriceRaw, bedrooms: bedroomsRaw, bathrooms: bathroomsRaw,
      propertyTypes: propertyTypesRaw, status: statusRaw, search: searchRaw, limit: maxResults,
      sellerFinancing: sellerFinancingRaw, primaryView: primaryViewRaw, currentPrice: currentPriceRaw
    });

    console.log('🔍 [API] Filters (normalized):', {
      city, area, community, subdivision, minPrice, maxPrice, bedrooms, bathrooms, propertyTypes, status, search, maxResults,
      sellerFinancingBool, primaryViewBool, currentPriceBool, viewFieldName, sellerFinancingFieldName, currentPriceFieldName, originalPriceFieldName
    });

    // BUILD RESO $filter QUERY
    const filters: string[] = [];

    // MLS SEARCH - Search across multiple fields
    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchTerm = search.trim();
      console.log('🔎 [MLS SEARCH]:', searchTerm);
      
      const searchFilters = [
        `contains(UnparsedAddress, '${searchTerm.replace(/'/g, "''")}')`,
        `contains(City, '${searchTerm.replace(/'/g, "''")}')`,
        `contains(MLSAreaMajor, '${searchTerm.replace(/'/g, "''")}')`,
        `contains(SubdivisionName, '${searchTerm.replace(/'/g, "''")}')`,
        `contains(ListingId, '${searchTerm.replace(/'/g, "''")}')`,
        `contains(PublicRemarks, '${searchTerm.replace(/'/g, "''")}')`
      ];
      
      filters.push(`(${searchFilters.join(' or ')})`);
    }

    // LOCATION - City/Zone
    if (city) {
      const cities = city.split(',').map(c => c.trim()).filter(Boolean);
      if (cities.length === 1) {
        filters.push(`City eq '${cities[0].replace(/'/g, "''")}'`);
      } else if (cities.length > 1) {
        const cityFilters = cities.map(c => `City eq '${c.replace(/'/g, "''")}'`);
        filters.push(`(${cityFilters.join(' or ')})`);
      }
    }

    // AREAS - Use contains() for flexible matching
    if (area) {
      const areaList = area.split(',').map(a => a.trim()).filter(Boolean);
      
      if (areaList.length === 1) {
        filters.push(`(MLSAreaMajor eq '${areaList[0].replace(/'/g, "''")}' or contains(MLSAreaMajor, '${areaList[0].replace(/'/g, "''")}'))`);
      } else if (areaList.length > 1) {
        const areaFilters = areaList.map(a => 
          `(MLSAreaMajor eq '${a.replace(/'/g, "''")}' or contains(MLSAreaMajor, '${a.replace(/'/g, "''")}'))`
        );
        filters.push(`(${areaFilters.join(' or ')})`);
      }
    }

    // COMMUNITIES - Use contains() for flexible matching
    if (community) {
      const communityList = community.split(',').map(c => c.trim()).filter(Boolean);
      if (communityList.length === 1) {
        filters.push(`contains(SubdivisionName, '${communityList[0].replace(/'/g, "''")}')`);
      } else if (communityList.length > 1) {
        const communityFilters = communityList.map(c => `contains(SubdivisionName, '${c.replace(/'/g, "''")}')`);
        filters.push(`(${communityFilters.join(' or ')})`);
      }
    }

    // SUBDIVISIONS - Use contains() for flexible matching
    if (subdivision) {
      const subdivisionList = subdivision.split(',').map(s => s.trim()).filter(Boolean);
      if (subdivisionList.length === 1) {
        filters.push(`contains(SubdivisionName, '${subdivisionList[0].replace(/'/g, "''")}')`);
      } else if (subdivisionList.length > 1) {
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
    if (propertyTypes) {
      // propertyTypes may be passed as comma string or array joined into a CSV above
      const types = propertyTypes.split(',').map(t => t.trim()).filter(Boolean);
      if (types.length > 0) {
        if (types.length === 1) {
          filters.push(`PropertyType eq '${types[0]}'`);
        } else {
          const typeFilters = types.map(t => `PropertyType eq '${t}'`);
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

    // 🆕 SPECIAL FILTERS WITH DYNAMIC FIELD DISCOVERY
    // Field names are discovered by Groq AI and passed from frontend
    
    // Seller Financing
    // Use normalized boolean sellerFinancingBool
    if (sellerFinancingBool === true) {
      const fieldName = (sellerFinancingFieldName && typeof sellerFinancingFieldName === 'string') 
        ? sellerFinancingFieldName 
        : 'SellerFinancingYN';
      // API-side filter if field supports boolean equality
      filters.push(`${fieldName} eq true`);
      console.log(`💵 [Special Filter] Seller Financing: Yes (using ${fieldName})`);
    }

    // Primary View - Oceanfront properties
    // NOTE: This field exists in the data but FlexMLS API may not support filtering on it.
    // We'll filter client-side instead to avoid breaking the entire query
    if (primaryViewBool === true) {
      console.log(`👁️ [Special Filter] Primary View: WILL FILTER CLIENT-SIDE (API doesn't support filtering this field)`);
    }

    // Current Price - No price reductions
    // If front sends a boolean for 'currentPrice' we'll interpret it as "only current price"
    if (currentPriceBool === true) {
      const currentField = (currentPriceFieldName && typeof currentPriceFieldName === 'string') 
        ? currentPriceFieldName 
        : 'ListPrice';
      const originalField = (originalPriceFieldName && typeof originalPriceFieldName === 'string') 
        ? originalPriceFieldName 
        : 'OriginalListPrice';
      filters.push(`${currentField} eq ${originalField}`);
      console.log(`💲 [Special Filter] Current Price: Yes (comparing ${currentField} eq ${originalField})`);
    }

    const filterString = filters.join(' and ');
    console.log('🎯 [Filter]:', filterString);

    // FETCH RESULTS (with optional limit)
    let listings = maxResults 
      ? await fetchLimitedResults(filterString, maxResults)
      : await fetchAllResults(filterString);

    console.log(`✅ [Result] ${listings.length} listings${maxResults ? ` (limited to ${maxResults})` : ''} BEFORE client-side filters`);

    // 🆕 CLIENT-SIDE SPECIAL FILTERS (fields that API can't filter on)
    
    // Primary View - Filter for Ocean views (client-side)
    if (primaryViewBool === true) {
      const viewFieldNameToUse = (viewFieldName && typeof viewFieldName === 'string')
        ? viewFieldName
        : 'General_sp_Description_co_Primary_sp_View';
      
      const beforeCount = listings.length;
      listings = listings.filter(listing => {
        const viewValue = listing[viewFieldNameToUse];
        if (!viewValue) return false;
        if (typeof viewValue !== 'string') return false;
        const hasOcean = viewValue.toLowerCase().includes('ocean');
        return hasOcean;
      });
      
      console.log(`🌊 [Client Filter] Primary View: ${beforeCount} → ${listings.length} (filtered ${beforeCount - listings.length} non-ocean properties)`);
    }

    console.log(`✅ [Final Result] ${listings.length} listings AFTER client-side filters`);

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
