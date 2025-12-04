// api/flexmls-listings.ts - COMPLETE CORRECTED VERSION
// Fixed: City vs MLSAreaMajor filtering for all zones
// All features preserved: hierarchy, subdivision detection, communities, special filters, pagination

import type { VercelRequest, VercelResponse } from '@vercel/node';

const FLEXMLS_BASE_URL = process.env.FLEXMLS_BASE_URL;
const FLEXMLS_API_KEY = process.env.FLEXMLS_API_KEY;

// ============================================================================
// KNOWN SUBDIVISIONS
// ============================================================================
const KNOWN_SUBDIVISIONS = [
  'Misiones',
  'El Tezal',
  'Chileno Bay',
  'Cabo Bello',
  'Santa Carmela',
  'Cabo del Sol',
  'Cabo del Sol Viejo',
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
  'Country Club Estates',
  'El Tule',
];

// ============================================================================
// COMMUNITY NAME MAPPER
// ============================================================================
const COMMUNITY_NAME_MAPPER: Record<string, string> = {
  'Cabo del Sol-Inland': 'Cabo del Sol',
  'Chileno Bay Club': 'Chileno Bay',
  'Chileno/Montage-Inland': 'El Tule',
  'CSL Country Club': 'CSL Country Club',
  'El Tezal-East': 'El Tezal',
  'El Tezal-West': 'El Tezal',
  'El Tezal-OceanSide': 'El Tezal',
  'Cabo Bello': 'Cabo Bello',
};

// ============================================================================
// ZONE MAPPER - CORRECTED based on actual MLS field analysis
// ============================================================================
// Maps UI zone names to either City field OR MLSAreaMajor sub-areas
const ZONE_MAPPER: Record<string, { useCity: boolean; values: string[] }> = {
  // Zones that use City field directly (no sub-areas in MLSAreaMajor)
  'East Cape': { useCity: true, values: ['East Cape'] },
  'La Paz': { useCity: true, values: ['La Paz'] },
  'Loreto': { useCity: true, values: ['Loreto'] },
  'Pacific': { useCity: true, values: ['Pacific'] },
  
  // Zones that use MLSAreaMajor sub-areas
  'Cabo Corridor': { 
    useCity: false, 
    values: ['CSL Cor-Inland', 'CSL-Corr. Oceanside'] 
  },
  'Cabo San Lucas': { 
    useCity: false, 
    values: ['CSL-Beach & Marina', 'CSL-Centro', 'CSL-North'] 
  },
  'San Jose Corridor': { 
    useCity: false, 
    values: ['SJD Corr-Inland', 'SJD Corr-Oceanside'] 
  },
  'San Jose del Cabo': { 
    useCity: false, 
    values: ['SJD-Beachside', 'SJD-Centro', 'SJD-East', 'SJD-Inland/Golf', 'SJD-North'] 
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function parseBooleanQuery(val: unknown): boolean | null {
  if (val === undefined || val === null) return null;
  if (typeof val === 'boolean') return val;
  const s = Array.isArray(val) ? String(val[0]) : String(val);
  if (!s) return null;
  const low = s.toLowerCase();
  if (low === 'true') return true;
  if (low === 'false') return false;
  return null;
}

function getStringOrNull(val: unknown): string | null {
  if (val === undefined || val === null) return null;
  if (typeof val === 'string') return val;
  if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'string') return val[0];
  return null;
}

function safeEscape(s: string) {
  return s.replace(/'/g, "''");
}

/**
 * Try to map UI labels into MLS-identical values, and
 * detect when a community string is actually a subdivision.
 */
function correctHierarchyFields(params: {
  city: string | null;
  area: string | null;
  community: string | null;
  subdivision: string | null;
}) {
  let { city, area, community, subdivision } = params;

  if (community && COMMUNITY_NAME_MAPPER[community]) {
    console.log(`📝 [Field Correction] Mapping "${community}" → "${COMMUNITY_NAME_MAPPER[community]}"`);
    community = COMMUNITY_NAME_MAPPER[community];
  }

  // If the community matches a known subdivision, treat it as subdivision (most specific).
  if (community && !subdivision && KNOWN_SUBDIVISIONS.includes(community)) {
    console.log(`🔄 [Field Correction] "${community}" detected as Subdivision`);
    subdivision = community;
    community = null;
  }

  return { city, area, community, subdivision };
}

// ============================================================================
// BUILD LOCATION FILTERS - CORRECTED
// ============================================================================

function buildLocationFilters({
  city,
  area,
  community,
  subdivision,
}: {
  city: string | null;
  area: string | null;
  community: string | null;
  subdivision: string | null;
}) {
  const parts: string[] = [];

  // -------------------------
  // 1. Subdivision (highest priority)
  // -------------------------
  if (subdivision) {
    const list = subdivision.split(',').map(s => s.trim()).filter(Boolean);

    if (list.length === 1) {
      const s = safeEscape(list[0]);
      parts.push(
        `(SubdivisionName eq '${s}' or contains(SubdivisionName,'${s}') or contains(UnparsedAddress,'${s}'))`
      );
    } else {
      const f = list
        .map(s => {
          const v = safeEscape(s);
          return `(SubdivisionName eq '${v}' or contains(SubdivisionName,'${v}') or contains(UnparsedAddress,'${v}'))`;
        })
        .join(' or ');
      parts.push(`(${f})`);
    }

    return parts;
  }

  // -------------------------
  // 2. Community
  // -------------------------
  if (community) {
    const list = community.split(',').map(s => s.trim()).filter(Boolean);

    if (list.length === 1) {
      const s = safeEscape(list[0]);
      parts.push(
        `(Community eq '${s}' or contains(Community,'${s}') or contains(UnparsedAddress,'${s}'))`
      );
    } else {
      const f = list
        .map(s => {
          const v = safeEscape(s);
          return `(Community eq '${v}' or contains(Community,'${v}') or contains(UnparsedAddress,'${v}'))`;
        })
        .join(' or ');
      parts.push(`(${f})`);
    }

    return parts;
  }

  // -------------------------
  // 3. Area (uses MLSAreaMajor)
  // -------------------------
  if (area) {
    const list = area.split(',').map(s => s.trim()).filter(Boolean);

    if (list.length === 1) {
      const s = safeEscape(list[0]);
      parts.push(
        `(MLSAreaMajor eq '${s}' or contains(MLSAreaMajor,'${s}'))`
      );
    } else {
      const f = list
        .map(a => {
          const v = safeEscape(a);
          return `(MLSAreaMajor eq '${v}' or contains(MLSAreaMajor,'${v}'))`;
        })
        .join(' or ');
      parts.push(`(${f})`);
    }

    return parts;
  }

  // -------------------------
  // 4. City / Zone - CORRECTED LOGIC
  // -------------------------
  if (city) {
    const zoneConfig = ZONE_MAPPER[city];

    if (zoneConfig) {
      if (zoneConfig.useCity) {
        // For East Cape, La Paz, Loreto, Pacific → use City field
        const f = zoneConfig.values
          .map(c => {
            const v = safeEscape(c);
            return `(City eq '${v}')`;
          })
          .join(' or ');
        parts.push(`(${f})`);
        console.log(`🎯 [Zone Filter] Using City field for: ${city}`);
      } else {
        // For Cabo zones with sub-areas → use MLSAreaMajor
        const f = zoneConfig.values
          .map(a => {
            const v = safeEscape(a);
            return `(MLSAreaMajor eq '${v}' or contains(MLSAreaMajor,'${v}'))`;
          })
          .join(' or ');
        parts.push(`(${f})`);
        console.log(`🎯 [Zone Filter] Using MLSAreaMajor for: ${city}`);
      }
      return parts;
    }

    // Fallback: treat as normal city
    const s = safeEscape(city);
    parts.push(`(City eq '${s}')`);
    console.log(`🎯 [Zone Filter] Using City fallback for: ${city}`);
    return parts;
  }

  return parts;
}

// ============================================================================
// FETCH HELPERS
// ============================================================================

async function fetchLimitedResultsFromUrl(urlObj: URL, limit: number, apiKey: string) {
  urlObj.searchParams.set('$top', String(limit));
  urlObj.searchParams.set('$skip', '0');
  urlObj.searchParams.set('$orderby', 'ModificationTimestamp desc');
  urlObj.searchParams.set('$expand', 'Media');

  console.log(`📡 [Limited] ${urlObj.toString()}`);

  const response = await fetch(urlObj.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`);
  }
  return await response.json();
}

async function fetchAllResultsFromUrl(urlObj: URL, apiKey: string): Promise<any[]> {
  const top = 200;
  let skip = 0;
  const all: any[] = [];

  while (true) {
    urlObj.searchParams.set('$top', String(top));
    urlObj.searchParams.set('$skip', String(skip));
    urlObj.searchParams.set('$orderby', 'ModificationTimestamp desc');
    urlObj.searchParams.set('$expand', 'Media');

    console.log(`📡 [Page fetch] skip=${skip} ${urlObj.toString()}`);

    const response = await fetch(urlObj.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    const results = data?.value || [];
    all.push(...results);

    console.log(`📦 Retrieved ${results.length} (accum ${all.length})`);

    if (results.length < top) break;
    skip += top;

    // safety cap to avoid infinite loops
    if (skip >= 5000) {
      console.warn('⚠️ reached safe pagination cap (5000) - breaking');
      break;
    }
  }

  return all;
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Basic method + env validation
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    return res.status(200).end();
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  if (!FLEXMLS_BASE_URL || !FLEXMLS_API_KEY) {
    console.error('🚨 Missing FLEXMLS_BASE_URL or FLEXMLS_API_KEY env vars');
    return res.status(500).json({
      success: false,
      error: 'Server misconfigured: FLEXMLS_BASE_URL or FLEXMLS_API_KEY missing',
    });
  }

  try {
    // parse incoming query params
    const raw = req.query;
    const search = getStringOrNull(raw.search);
    const limit = raw.limit ? parseInt(String(Array.isArray(raw.limit) ? raw.limit[0] : raw.limit), 10) : undefined;

    // Accept either singular or plural param names (areas / areas)
    let city = getStringOrNull(raw.city);
    let area = getStringOrNull(raw.area ?? raw.areas);
    let community = getStringOrNull(raw.community ?? raw.communities);
    let subdivision = getStringOrNull(raw.subdivision ?? raw.subdivisions);

    const minPrice = getStringOrNull(raw.minPrice);
    const maxPrice = getStringOrNull(raw.maxPrice);
    const minBeds = getStringOrNull(raw.minBeds ?? raw.bedrooms);
    const maxBeds = getStringOrNull(raw.maxBeds);
    const minBaths = getStringOrNull(raw.minBaths ?? raw.bathrooms);
    const maxBaths = getStringOrNull(raw.maxBaths);
    const propertyType = getStringOrNull(raw.propertyType);
    const sellerFinancing = parseBooleanQuery(raw.sellerFinancing);
    const primaryView = parseBooleanQuery(raw.primaryView);
    const currentPrice = parseBooleanQuery(raw.currentPrice);

    console.log('🎯 [Request raw]', { city, area, community, subdivision, limit, search });

    // Apply corrections / normalization for known UI labels
    ({ city, area, community, subdivision } = correctHierarchyFields({
      city, area, community, subdivision
    }));

    console.log('🔧 [After correction]', { city, area, community, subdivision });

    // Cascading hierarchy: most specific first
    // If subdivision exists, ignore community/area/city
    if (subdivision) {
      console.log('🎯 [Hierarchy] Using SUBDIVISION only');
      community = null;
      area = null;
      city = null;
    } else if (community) {
      console.log('🎯 [Hierarchy] Using COMMUNITY only (subdivision absent)');
      area = null;
      city = null;
    } else if (area) {
      console.log('🎯 [Hierarchy] Using AREA only');
      city = null;
    } else if (city) {
      // City used only as last resort (and special zone handling)
      console.log('🎯 [Hierarchy] Using CITY/ZONE only');
    }

    // Build location filters (safe)
    const locationFilters = buildLocationFilters({ city, area, community, subdivision });

    // Additional filters
    const otherFilters: string[] = [];

    // Price
    if (minPrice) {
      const v = Number(minPrice);
      if (!Number.isNaN(v)) otherFilters.push(`ListPrice ge ${v}`);
    }
    if (maxPrice) {
      const v = Number(maxPrice);
      if (!Number.isNaN(v)) otherFilters.push(`ListPrice le ${v}`);
    }

    // Beds/Baths
    if (minBeds) {
      const v = Number(minBeds);
      if (!Number.isNaN(v)) otherFilters.push(`BedroomsTotal ge ${v}`);
    }
    if (maxBeds) {
      const v = Number(maxBeds);
      if (!Number.isNaN(v)) otherFilters.push(`BedroomsTotal le ${v}`);
    }
    if (minBaths) {
      const v = Number(minBaths);
      if (!Number.isNaN(v)) otherFilters.push(`BathroomsFull ge ${v}`);
    }
    if (maxBaths) {
      const v = Number(maxBaths);
      if (!Number.isNaN(v)) otherFilters.push(`BathroomsFull le ${v}`);
    }

    // Property type (simple mapping — adjust to your MLS codes)
    if (propertyType && propertyType !== 'All') {
      // Example mapping; adapt if your MLS uses different codes
      const typeMap: Record<string, string> = {
        'Condo': 'Condo',
        'Condos': 'Condo',
        'House': 'Residential',
        'Houses': 'Residential'
      };
      const mapped = typeMap[propertyType] ?? propertyType;
      otherFilters.push(`PropertyType eq '${safeEscape(mapped)}'`);
    }

    // Search - free text (safe)
    if (search && search.trim() !== '') {
      const s = safeEscape(search.trim());
      otherFilters.push(`(contains(UnparsedAddress,'${s}') or contains(PublicRemarks,'${s}') or contains(ListingId,'${s}'))`);
    }

    // Special flags
    if (sellerFinancing === true) otherFilters.push(`SellerFinancingYN eq true`);
    if (sellerFinancing === false) otherFilters.push(`SellerFinancingYN eq false`);
    if (currentPrice === true) otherFilters.push(`ListPrice gt 0`);

    // Primary view - we prefer client-side filtering for robustness; if requested, add a loose server-side hint
    if (primaryView === true) {
      // Loose server-side hint: look for 'View' field values that commonly indicate ocean/water
      otherFilters.push(`(contains(View,'ocean') or contains(View,'water') or contains(View,'beach'))`);
    }

    // Always only active listings
    otherFilters.push(`StandardStatus eq 'Active'`);

    // Geographic bounding box for Los Cabos (prevents USA/ocean results)
    const geoFilters = [
      'Latitude ge 22.8',
      'Latitude le 23.3',
      'Longitude ge -110.3',
      'Longitude le -109.6'
    ];

    // Combine everything
    const allFilters = [...locationFilters, ...otherFilters, ...geoFilters].filter(Boolean);
    const filterString = allFilters.length > 0 ? allFilters.join(' and ') : '';

    // Build URL safely using URL API
    const base = new URL(`${FLEXMLS_BASE_URL}/Property`);
    if (filterString) base.searchParams.set('$filter', filterString);
    // Add minimal default expansion/order for performance
    base.searchParams.set('$orderby', 'ModificationTimestamp desc');
    base.searchParams.set('$expand', 'Media');

    console.log('🔍 [Final Filter]', filterString);

    // Fetch
    let results: any[] = [];
    if (limit && Number.isFinite(limit)) {
      const resp = await fetchLimitedResultsFromUrl(new URL(base.toString()), limit, FLEXMLS_API_KEY);
      results = resp?.value ?? [];
    } else {
      results = await fetchAllResultsFromUrl(new URL(base.toString()), FLEXMLS_API_KEY);
    }

    // Client-side stronger primary view filter (optional) — keep as you previously had
    if (primaryView === true && Array.isArray(results)) {
      const viewFieldNames = ['View', 'General_sp_Description_co_Primary_sp_View'];
      results = results.filter(r => {
        for (const f of viewFieldNames) {
          const v = r[f];
          if (typeof v === 'string' && v.toLowerCase().includes('ocean')) return true;
          if (typeof v === 'string' && v.toLowerCase().includes('water')) return true;
        }
        return false;
      });
    }

    console.log(`✅ [Result] ${results.length} listings`);

    // return sanitized response
    return res.status(200).json({
      success: true,
      count: results.length,
      results,
      filters: filterString
    });

  } catch (err) {
    console.error('❌ [API Error]:', err);
    // Include message for debugging in logs but return safe error to client
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch listings',
      details: err instanceof Error ? err.message : String(err)
    });
  }
}