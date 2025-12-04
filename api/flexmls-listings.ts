// api/flexmls-listings.ts - WITH CASCADING DECOY FILTERS + GEOGRAPHIC BOUNDS
import type { VercelRequest, VercelResponse } from '@vercel/node';

const FLEXMLS_API_KEY = process.env.FLEXMLS_API_KEY;
const RESO_API_BASE = 'https://replication.sparkapi.com/Version/3/Reso/OData';

function parseBooleanQuery(val: unknown): boolean | null {
  if (val === undefined || val === null) return null;
  if (typeof val === 'boolean') return val;
  if (Array.isArray(val)) {
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
    return val.join(',');
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

    const sellerFinancingRaw = raw.sellerFinancing;
    const primaryViewRaw = raw.primaryView;
    const currentPriceRaw = raw.currentPrice;
    const viewFieldNameRaw = raw.viewFieldName;
    const sellerFinancingFieldNameRaw = raw.sellerFinancingFieldName;
    const currentPriceFieldNameRaw = raw.currentPriceFieldName;
    const originalPriceFieldNameRaw = raw.originalPriceFieldName;

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

    const sellerFinancingBool = parseBooleanQuery(sellerFinancingRaw);
    const primaryViewBool = parseBooleanQuery(primaryViewRaw);
    const currentPriceBool = parseBooleanQuery(currentPriceRaw);
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

    const filters: string[] = [];

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

    // ============================================================================
    // CASCADING FILTER HIERARCHY WITH DECOY SYSTEM
    // ============================================================================
    // Rule: Most specific filter wins. Less specific filters become "decoys"
    // Hierarchy: City → Area → Community → Subdivision
    // If Subdivision exists, use ONLY Subdivision (ignore all others)
    // Else if Community exists, use ONLY Community (ignore City/Area)
    // Else if Area exists, use ONLY Area (ignore City)
    // Else if City exists, use City (or decoy for Cabo Corridor)
    // ============================================================================

    if (subdivision) {
      const subdivisionList = subdivision.split(',').map(s => s.trim()).filter(Boolean);
      
      if (subdivisionList.length === 1) {
        filters.push(`(SubdivisionName eq '${subdivisionList[0].replace(/'/g, "''")}' or contains(SubdivisionName, '${subdivisionList[0].replace(/'/g, "''")}'))`);
      } else if (subdivisionList.length > 1) {
        const subdivisionFilters = subdivisionList.map(s => 
          `(SubdivisionName eq '${s.replace(/'/g, "''")}' or contains(SubdivisionName, '${s.replace(/'/g, "''")}'))`
        );
        filters.push(`(${subdivisionFilters.join(' or ')})`);
      }
      console.log('🎯 [HIERARCHY] Using SUBDIVISION filter (most specific) - City/Area/Community ignored');
    }
    else if (community) {
      const communityList = community.split(',').map(c => c.trim()).filter(Boolean);
      
      if (communityList.length === 1) {
        filters.push(`(CommunityName eq '${communityList[0].replace(/'/g, "''")}' or contains(CommunityName, '${communityList[0].replace(/'/g, "''")}'))`);
      } else if (communityList.length > 1) {
        const communityFilters = communityList.map(c => 
          `(CommunityName eq '${c.replace(/'/g, "''")}' or contains(CommunityName, '${c.replace(/'/g, "''")}'))`
        );
        filters.push(`(${communityFilters.join(' or ')})`);
      }
      console.log('🎯 [HIERARCHY] Using COMMUNITY filter - City/Area become decoys (ignored)');
    }
    else if (area) {
      const areaList = area.split(',').map(a => a.trim()).filter(Boolean);
      
      if (areaList.length === 1) {
        filters.push(`(MLSAreaMajor eq '${areaList[0].replace(/'/g, "''")}' or contains(MLSAreaMajor, '${areaList[0].replace(/'/g, "''")}'))`);
      } else if (areaList.length > 1) {
        const areaFilters = areaList.map(a => 
          `(MLSAreaMajor eq '${a.replace(/'/g, "''")}' or contains(MLSAreaMajor, '${a.replace(/'/g, "''")}'))`
        );
        filters.push(`(${areaFilters.join(' or ')})`);
      }
      console.log('🎯 [HIERARCHY] Using AREA filter - City becomes decoy (ignored)');
    }
    else if (city) {
      if (city === 'Cabo Corridor') {
        const corridorAreas = [
          'CSL Cor-Inland',
          'CSL-Corr. Oceanside'
        ];
        const areaFilters = corridorAreas.map(a => 
          `(MLSAreaMajor eq '${a.replace(/'/g, "''")}' or contains(MLSAreaMajor, '${a.replace(/'/g, "''")}'))`
        );
        filters.push(`(${areaFilters.join(' or ')})`);
        console.log('🎯 [HIERARCHY] Using ZONE DECOY for Cabo Corridor (fetching 2 corridor areas)');
      } else {
        const cityList = city.split(',').map(c => c.trim()).filter(Boolean);
        
        if (cityList.length === 1) {
          filters.push(`City eq '${cityList[0].replace(/'/g, "''")}'`);
        } else if (cityList.length > 1) {
          const cityFilters = cityList.map(c => `City eq '${c.replace(/'/g, "''")}'`);
          filters.push(`(${cityFilters.join(' or ')})`);
        }
        console.log('🎯 [HIERARCHY] Using CITY filter (standard City field)');
      }
    }

    if (minPrice && typeof minPrice === 'string') {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) filters.push(`ListPrice ge ${min}`);
    }
    if (maxPrice && typeof maxPrice === 'string') {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) filters.push(`ListPrice le ${max}`);
    }

    if (bedrooms && typeof bedrooms === 'string') {
      const beds = parseInt(bedrooms);
      if (!isNaN(beds)) filters.push(`BedroomsTotal ge ${beds}`);
    }
    if (bathrooms && typeof bathrooms === 'string') {
      const baths = parseInt(bathrooms);
      if (!isNaN(baths)) filters.push(`BathroomsFull ge ${baths}`);
    }

    if (propertyTypes) {
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

    const statusValue = (status && typeof status === 'string') ? status : 'Active';
    filters.push(`StandardStatus eq '${statusValue}'`);

    // ============================================================================
    // GEOGRAPHIC BOUNDING BOX - Prevent properties showing in wrong locations
    // ============================================================================
    // Los Cabos region approximate bounds (prevents USA/ocean properties)
    filters.push(`Latitude ge 22.8`);
    filters.push(`Latitude le 23.3`);
    filters.push(`Longitude ge -110.3`);
    filters.push(`Longitude le -109.6`);
    console.log('🗺️ [Geographic Filter] Applied Los Cabos bounding box');

    if (minSqft && typeof minSqft === 'string' && minSqft !== 'No Preference') {
      const sqft = parseInt(minSqft.replace('+', ''));
      if (!isNaN(sqft)) filters.push(`LivingArea ge ${sqft}`);
    }

    if (yearBuilt && typeof yearBuilt === 'string' && yearBuilt !== 'No Preference') {
      const year = parseInt(yearBuilt.replace('+', ''));
      if (!isNaN(year)) filters.push(`YearBuilt ge ${year}`);
    }

    if (sellerFinancingBool === true) {
      const fieldName = (sellerFinancingFieldName && typeof sellerFinancingFieldName === 'string') 
        ? sellerFinancingFieldName 
        : 'SellerFinancingYN';
      filters.push(`${fieldName} eq true`);
      console.log(`💵 [Special Filter] Seller Financing: Yes (using ${fieldName})`);
    }

    if (primaryViewBool === true) {
      console.log(`👁️ [Special Filter] Primary View: WILL FILTER CLIENT-SIDE`);
    }

    if (currentPriceBool === true) {
      const currentField = (currentPriceFieldName && typeof currentPriceFieldName === 'string') 
        ? currentPriceFieldName 
        : 'ListPrice';
      const originalField = (originalPriceFieldName && typeof originalPriceFieldName === 'string') 
        ? originalPriceFieldName 
        : 'OriginalListPrice';
      filters.push(`${currentField} eq ${originalField}`);
      console.log(`💲 [Special Filter] Current Price: Yes`);
    }

    const filterString = filters.join(' and ');
    console.log('🎯 [Filter]:', filterString);

    let listings = maxResults 
      ? await fetchLimitedResults(filterString, maxResults)
      : await fetchAllResults(filterString);

    console.log(`✅ [Result] ${listings.length} listings${maxResults ? ` (limited to ${maxResults})` : ''} BEFORE client-side filters`);

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
      
      console.log(`🌊 [Client Filter] Primary View: ${beforeCount} → ${listings.length}`);
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