// api/flexmls-filter-count.js - Live count preview for filter selections
const FLEXMLS_API_URL = 'https://replication.sparkapi.com/Version/3/Reso/OData/Property';

export default async function handler(req, res) {
  try {
    const FLEXMLS_TOKEN = process.env.FLEXMLS_API_KEY || process.env.FLEXMLS_OAUTH_TOKEN;
    
    if (!FLEXMLS_TOKEN) {
      return res.status(500).json({
        success: false,
        error: 'FlexMLS token not configured'
      });
    }

    // Get filter parameters from query
    const { zones, areas, communities, minPrice, maxPrice, beds, baths, propertyTypes, status } = req.query;
    
    console.log('📊 [FILTER COUNT] Calculating for filters:', req.query);

    // Build OData filter
    let filters = [];
    
    // LOCATION FILTERS
    if (zones) {
      const zoneList = Array.isArray(zones) ? zones : [zones];
      const zoneFilters = zoneList.map(z => `City eq '${z}'`).join(' or ');
      if (zoneFilters) filters.push(`(${zoneFilters})`);
    }
    
    if (areas) {
      const areaList = Array.isArray(areas) ? areas : [areas];
      const areaFilters = areaList.map(a => `MLSAreaMajor eq '${a}'`).join(' or ');
      if (areaFilters) filters.push(`(${areaFilters})`);
    }
    
    if (communities) {
      const communityList = Array.isArray(communities) ? communities : [communities];
      const communityFilters = communityList.map(c => `SubdivisionName eq '${c}'`).join(' or ');
      if (communityFilters) filters.push(`(${communityFilters})`);
    }
    
    // PRICE RANGE
    if (minPrice) {
      filters.push(`ListPrice ge ${minPrice}`);
    }
    if (maxPrice) {
      filters.push(`ListPrice le ${maxPrice}`);
    }
    
    // BEDS & BATHS
    if (beds) {
      filters.push(`BedroomsTotal ge ${beds}`);
    }
    if (baths) {
      filters.push(`BathroomsFull ge ${baths}`);
    }
    
    // PROPERTY TYPE
    if (propertyTypes) {
      const typeList = Array.isArray(propertyTypes) ? propertyTypes : [propertyTypes];
      const typeFilters = typeList.map(t => {
        // Map friendly names to FlexMLS values
        const typeMap = {
          'Condos': 'Residential',
          'Houses': 'Residential',
          'Land': 'Land',
          'Commercial': 'Commercial',
          'Fractional': 'Fractional',
          'MultiFamily': 'Multi-Family'
        };
        return `PropertyType eq '${typeMap[t] || t}'`;
      }).join(' or ');
      if (typeFilters) filters.push(`(${typeFilters})`);
    }
    
    // STATUS
    if (status && status !== 'Active') {
      filters.push(`StandardStatus eq '${status}'`);
    } else {
      filters.push(`StandardStatus eq 'Active'`); // Default to Active
    }
    
    // Combine all filters
    const filterString = filters.length > 0 ? filters.join(' and ') : 'StandardStatus eq "Active"';
    
    // Use $count to get total without fetching data
    const url = `${FLEXMLS_API_URL}?$filter=${encodeURIComponent(filterString)}&$top=0&$count=true`;
    
    console.log('📡 [FILTER COUNT] Query URL:', url);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${FLEXMLS_TOKEN}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 429) {
        // Rate limited - return cached estimate
        return res.status(200).json({
          success: true,
          count: 0,
          estimated: true,
          message: 'Rate limited - showing estimate'
        });
      }
      
      throw new Error(`FlexMLS API error: ${response.status}`);
    }

    const data = await response.json();
    const count = data['@odata.count'] || 0;
    
    console.log(`✅ [FILTER COUNT] Found ${count} matching properties`);

    return res.status(200).json({
      success: true,
      count: count,
      filters: req.query
    });

  } catch (error) {
    console.error('💥 [FILTER COUNT ERROR]:', error);
    return res.status(200).json({
      success: true,
      count: 0,
      estimated: true,
      error: error.message
    });
  }
}