// api/flexmls-search.js - RESO Web API v3 on-demand search
const FLEXMLS_API_URL = 'https://replication.sparkapi.com/Version/3/Reso/OData/Property';

export default async function handler(req, res) {
  const { query, type } = req.query;
  
  if (!query) {
    return res.status(400).json({ 
      success: false, 
      error: 'Query parameter required' 
    });
  }

  try {
    const FLEXMLS_TOKEN = process.env.FLEXMLS_API_KEY || process.env.FLEXMLS_OAUTH_TOKEN;
    
    if (!FLEXMLS_TOKEN) {
      return res.status(500).json({
        success: false,
        error: 'FlexMLS token not configured'
      });
    }

    console.log(`🔍 [API] Searching for: ${query} (type: ${type})`);
    
    // Build OData filter for RESO API v3
    let filter = '';
    
    if (type === 'mls' || /^[\d-]+$/.test(query)) {
      console.log('🎯 [MLS SEARCH] Querying by ListingId');
      filter = `ListingId eq '${query}'`;
      
    } else if (type === 'address') {
      console.log('🏠 [ADDRESS SEARCH] Querying by address');
      filter = `contains(UnparsedAddress,'${query}')`;
      
    } else if (type === 'city') {
      console.log('🌆 [CITY SEARCH] Querying by city');
      filter = `City eq '${query}'`;
      
    } else {
      console.log('📝 [TEXT SEARCH] Multi-field query');
      filter = `contains(ListingId,'${query}') or contains(UnparsedAddress,'${query}') or contains(City,'${query}')`;
    }

    const url = `${FLEXMLS_API_URL}?$filter=${encodeURIComponent(filter)}&$top=50&$expand=Media`;
    
    console.log('📡 [REQUEST]:', url);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${FLEXMLS_TOKEN}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 429) {
        return res.status(429).json({
          success: false,
          error: 'Rate limit exceeded. Please try again in a moment.',
          retryAfter: 5
        });
      }
      
      const errorText = await response.text();
      console.error('❌ [FLEXMLS ERROR]:', response.status, errorText);
      throw new Error(`FlexMLS API error: ${response.status}`);
    }

    const data = await response.json();
    const results = data.value || [];
    
    console.log(`✅ [API] Found ${results.length} results for "${query}"`);

    return res.status(200).json({
      success: true,
      results: results,
      total: results.length,
      query: query,
      queryType: type
    });

  } catch (error) {
    console.error('💥 [API ERROR]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Search failed'
    });
  }
}