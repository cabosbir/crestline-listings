// api/flexmls-listings.ts - COMPLETE FIX: Cascading Hierarchy + Field Name Corrections
// Build timestamp: Force rebuild without cache
import type { VercelRequest, VercelResponse } from '@vercel/node';

// ============================================================================
// FIELD NAME CORRECTION - Community vs Subdivision Auto-Detection
// ============================================================================
// Many FlexMLS properties use SubdivisionName instead of CommunityName
// This mapper auto-corrects known communities that are actually subdivisions
const KNOWN_SUBDIVISIONS = [
  'Misiones',
  'El Tezal-OceanSide',
  'El Tezal-East',
  'El Tezal-West',
  'Chileno Bay',
  'Cabo Bello/Santa Carmela',
  'Cabo del Sol',
  'Cabo del Sol Viejo',
  'Chileno Bay/Montage',
  'Maravilla',
  'Punta Ballena',
  'Pedregal',
  'Ventanas',
  'Rancho Paraiso',
  'Blue Bay',
  'La Jolla',
  'Palmilla',
  'Puerto Los Cabos',
  'Zacatitos',
  'CSL Country Club',
  'Country Club Estates'
];

// Community name corrections (UI label → actual FlexMLS value)
// ✅ CORRECTED VERSION - Maps UI labels to real MLS Community field values
const COMMUNITY_NAME_MAPPER: Record<string, string> = {
  // UI → MLS
  'Cabo del Sol-Inland': 'Cabo del Sol',

  // Chileno / Montage area
  'Chileno Bay Club': 'Chileno Bay',        // Optional but safe
  'Chileno/Montage-Inland': 'El Tule',      // Correct MLS matching region

  // Country Club
  'CSL Country Club': 'CSL Country Club',   // Do NOT map to Country Club Estates

  // El Tezal cluster
  'El Tezal-East': 'El Tezal',
  'El Tezal-West': 'El Tezal',
  'El Tezal-OceanSide': 'El Tezal'
};

/**
 * Corrects hierarchy fields by detecting if a "community" is actually a subdivision
 * and normalizing field names to match FlexMLS database values
 */
function correctHierarchyFields(params: {
  city: string | null;
  area: string | null;
  community: string | null;
  subdivision: string | null;
}): { city: string | null; area: string | null; community: string | null; subdivision: string | null } {
  let { city, area, community, subdivision } = params;

  // Apply community name corrections
  if (community && COMMUNITY_NAME_MAPPER[community]) {
    console.log(`📝 [Field Correction] Mapping "${community}" → "${COMMUNITY_NAME_MAPPER[community]}"`);
    community = COMMUNITY_NAME_MAPPER[community];
  }

  // Auto-detect if community is actually a subdivision
  if (community && !subdivision && KNOWN_SUBDIVISIONS.includes(community)) {
    console.log(`🔄 [Field Correction] "${community}" detected as Subdivision, not Community`);
    subdivision = community;
    community = null;
  }

  return { city, area, community, subdivision };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function parseBooleanQuery(value: string | string[] | undefined): string | null {
  if (!value) return null;
  const val = Array.isArray(value) ? value[0] : value;
  return val.toLowerCase() === 'true' ? 'true' : val.toLowerCase() === 'false' ? 'false' : null;
}

function getStringOrNull(value: string | string[] | undefined): string | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] : value;
}

// ============================================================================
// PAGINATION FUNCTIONS
// ============================================================================

async function fetchLimitedResults(
  baseUrl: string,
  limit: number
): Promise<{ value: any[]; '@iot.count'?: number }> {
  const url = `${baseUrl}&$top=${limit}`;
  console.log(`🔗 [Limited Fetch] ${url}`);
  
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.FLEXMLS_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`);
  }

  return await response.json();
}

async function fetchAllResults(baseUrl: string): Promise<any[]> {
  let allResults: any[] = [];
  let skip = 0;
  const top = 200;

  while (true) {
    const url = `${baseUrl}&$top=${top}&$skip=${skip}`;
    console.log(`🔗 [Paginated Fetch at skip ${skip}] ${url}`);

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${process.env.FLEXMLS_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`❌ [Fetch Failed at skip ${skip}]: API returned ${response.status}`);
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      const results = data.value || [];

      if (results.length === 0) {
        console.log(`✅ [Pagination Complete] No more results at skip ${skip}`);
        break;
      }

      allResults = allResults.concat(results);
      console.log(`📦 [Batch ${skip / top + 1}] Retrieved ${results.length} listings (total: ${allResults.length})`);

      if (results.length < top) {
        console.log(`✅ [Pagination Complete] Last batch was partial (${results.length} < ${top})`);
        break;
      }

      skip += top;
    } catch (error) {
      console.error(`❌ [Fetch Failed at skip ${skip}]:`, error);
      throw error;
    }
  }

  return allResults;
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      limit: rawLimit,
      city: rawCity,
      area: rawArea,
      areas: rawAreas,
      community: rawCommunity,
      communities: rawCommunities,
      subdivision: rawSubdivision,
      subdivisions: rawSubdivisions,
      propertyType,
      minPrice,
      maxPrice,
      minBeds,
      maxBeds,
      minBaths,
      maxBaths,
      search,
      sellerFinancing: rawSellerFinancing,
      primaryView: rawPrimaryView,
      currentPrice: rawCurrentPrice
    } = req.query;

    // Parse parameters
    const limit = rawLimit ? parseInt(rawLimit as string, 10) : undefined;
    let city = getStringOrNull(rawCity);
    let area = getStringOrNull(rawArea || rawAreas);
    let community = getStringOrNull(rawCommunity || rawCommunities);
    let subdivision = getStringOrNull(rawSubdivision || rawSubdivisions);

    // Special filters
    const sellerFinancing = parseBooleanQuery(rawSellerFinancing);
    const primaryView = parseBooleanQuery(rawPrimaryView);
    const currentPrice = parseBooleanQuery(rawCurrentPrice);

    console.log(`\n🎯 [Request] city=${city}, area=${area}, community=${community}, subdivision=${subdivision}`);

    // ============================================================================
    // FIELD NAME CORRECTION - Apply before cascading hierarchy
    // ============================================================================
    const corrected = correctHierarchyFields({ city, area, community, subdivision });
    city = corrected.city;
    area = corrected.area;
    community = corrected.community;
    subdivision = corrected.subdivision;

    console.log(`✅ [After Correction] city=${city}, area=${area}, community=${community}, subdivision=${subdivision}`);

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
      console.log(`🎯 [HIERARCHY] Using SUBDIVISION filter (most specific) - City/Area/Community ignored`);
      city = null;
      area = null;
      community = null;
    } else if (community) {
      console.log(`🎯 [HIERARCHY] Using COMMUNITY filter - City/Area become decoys (ignored)`);
      city = null;
      area = null;
    } else if (area) {
      console.log(`🎯 [HIERARCHY] Using AREA filter - City becomes decoy (ignored)`);
      city = null;
    } else if (city === 'Cabo Corridor') {
      // Special handling for Cabo Corridor zone
      console.log(`🎯 [HIERARCHY] Using ZONE DECOY for Cabo Corridor (fetching 2 corridor areas)`);
      area = null; // Will be replaced with corridor areas below
    }

    // Build location filters
    const locationFilters: string[] = [];

    // Subdivision filter (highest priority)
    if (subdivision) {
      const subdivisions = subdivision.split(',').map((s) => s.trim());
      if (subdivisions.length === 1) {
        locationFilters.push(
          `(SubdivisionName eq '${subdivisions[0]}' or contains(SubdivisionName, '${subdivisions[0]}'))`
        );
      } else {
        const subFilters = subdivisions
          .map(
            (sub) => `(SubdivisionName eq '${sub}' or contains(SubdivisionName, '${sub}'))`
          )
          .join(' or ');
        locationFilters.push(`(${subFilters})`);
      }
    }

    // Community filter
    if (community && !subdivision) {
      const communities = community.split(',').map((c) => c.trim());
      if (communities.length === 1) {
        locationFilters.push(
          `(CommunityName eq '${communities[0]}' or contains(CommunityName, '${communities[0]}'))`
        );
      } else {
        const commFilters = communities
          .map(
            (com) => `(CommunityName eq '${com}' or contains(CommunityName, '${com}'))`
          )
          .join(' or ');
        locationFilters.push(`(${commFilters})`);
      }
    }

    // Area filter - Special handling for Cabo Corridor
    if (area && !community && !subdivision) {
      if (city === 'Cabo Corridor' && !area) {
        // Cabo Corridor decoy: fetch both corridor areas
        const corridorAreas = ['CSL Cor-Inland', 'CSL-Corr. Oceanside'];
        const areaFilters = corridorAreas
          .map((a) => `(MLSAreaMajor eq '${a}' or contains(MLSAreaMajor, '${a}'))`)
          .join(' or ');
        locationFilters.push(`(${areaFilters})`);
      } else {
        const areas = area.split(',').map((a) => a.trim());
        if (areas.length === 1) {
          locationFilters.push(
            `(MLSAreaMajor eq '${areas[0]}' or contains(MLSAreaMajor, '${areas[0]}'))`
          );
        } else {
          const areaFilters = areas
            .map((a) => `(MLSAreaMajor eq '${a}' or contains(MLSAreaMajor, '${a}'))`)
            .join(' or ');
          locationFilters.push(`(${areaFilters})`);
        }
      }
    }

    // City filter (lowest priority)
    if (city && !area && !community && !subdivision) {
      if (city === 'Cabo Corridor') {
        // Apply Cabo Corridor decoy: fetch both areas
        const corridorAreas = ['CSL Cor-Inland', 'CSL-Corr. Oceanside'];
        const areaFilters = corridorAreas
          .map((a) => `(MLSAreaMajor eq '${a}' or contains(MLSAreaMajor, '${a}'))`)
          .join(' or ');
        locationFilters.push(`(${areaFilters})`);
      } else {
        locationFilters.push(
          `(City eq '${city}' or contains(City, '${city}'))`
        );
      }
    }

    // ============================================================================
    // GEOGRAPHIC BOUNDING BOX (Los Cabos Region)
    // ============================================================================
    // Prevents properties from showing in USA or in the ocean
    const geographicFilters: string[] = [];
    geographicFilters.push('Latitude ge 22.8');
    geographicFilters.push('Latitude le 23.3');
    geographicFilters.push('Longitude ge -110.3');
    geographicFilters.push('Longitude le -109.6');
    console.log(`🗺️ [Geographic Filter] Applied Los Cabos bounding box`);

    // Property Type filter
    if (propertyType && propertyType !== 'All') {
      const typeValue = propertyType === 'Condos' ? 'A' : propertyType === 'Houses' ? 'B' : 'C';
      locationFilters.push(`PropertyType eq '${typeValue}'`);
    }

    // Price filters
    if (minPrice) {
      locationFilters.push(`CurrentPricePublic ge ${minPrice}`);
    }
    if (maxPrice) {
      locationFilters.push(`CurrentPricePublic le ${maxPrice}`);
    }

    // Bedroom filters
    if (minBeds) {
      locationFilters.push(`BedsTotal ge ${minBeds}`);
    }
    if (maxBeds) {
      locationFilters.push(`BedsTotal le ${maxBeds}`);
    }

    // Bathroom filters
    if (minBaths) {
      locationFilters.push(`BathsTotal ge ${minBaths}`);
    }
    if (maxBaths) {
      locationFilters.push(`BathsTotal le ${maxBaths}`);
    }

    // Search filter (MLSAreaMajor, UnparsedAddress, PublicRemarks)
    if (search) {
      const searchValue = Array.isArray(search) ? search[0] : search;
      locationFilters.push(
        `(contains(MLSAreaMajor, '${searchValue}') or contains(UnparsedAddress, '${searchValue}') or contains(PublicRemarks, '${searchValue}'))`
      );
    }

    // Special filters
    if (sellerFinancing === 'true') {
      locationFilters.push(`SellerFinancing eq true`);
    } else if (sellerFinancing === 'false') {
      locationFilters.push(`SellerFinancing eq false`);
    }

    if (primaryView === 'true') {
      locationFilters.push(`View eq 'Ocean' or View eq 'Water' or View eq 'Beach'`);
    }

    if (currentPrice === 'true') {
      locationFilters.push(`CurrentPricePublic gt 0`);
    }

    // Add active status
    locationFilters.push(`StandardStatus eq 'Active'`);

    // Combine all filters
    const allFilters = [...locationFilters, ...geographicFilters];
    const filterString = allFilters.join(' and ');

    // Build base URL
    const FLEXMLS_BASE_URL = 'https://replication.sparkapi.com/Version/3/Reso/OData';
    const baseUrl = `${FLEXMLS_BASE_URL}/Property?$filter=${encodeURIComponent(
      filterString
    )}`;

    console.log(`🔍 [Final Filter] ${filterString}`);

    // Fetch results
    let data: { value: any[]; '@iot.count'?: number };
    if (limit) {
      data = await fetchLimitedResults(baseUrl, limit);
    } else {
      const results = await fetchAllResults(baseUrl);
      data = { value: results };
    }

    console.log(`✅ [Final Result] ${data.value?.length || 0} listings AFTER client-side filters`);

    return res.status(200).json({
      listings: data.value || [],
      total: data['@iot.count'],
    });
  } catch (error) {
    console.error('❌ [API Error]:', error);
    return res.status(500).json({
      error: 'Failed to fetch listings',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}