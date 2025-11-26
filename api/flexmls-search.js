// api/flexmls-search.js - Intelligent on-demand search endpoint
const FLEXMLS_API_URL = 'https://sparkapi.flexmls.com/v1/listings';

export default async function handler(req, res) {
  const { query, type } = req.query;
  
  if (!query) {
    return res.status(400).json({ 
      success: false, 
      error: 'Query parameter required' 
    });
  }

  try {
    const FLEXMLS_TOKEN = process.env.FLEXMLS_API_KEY;
    
    if (!FLEXMLS_TOKEN) {
      return res.status(500).json({
        success: false,
        error: 'FlexMLS token not configured'
      });
    }

    console.log(`🔍 [API] Searching for: ${query} (type: ${type})`);
    
    let searchParams = new URLSearchParams({
      _limit: '50',
      _expand: 'Photos'
    });

    // Build filter based on search type
    if (type === 'mls' || /^[\d-]+$/.test(query)) {
      console.log('🎯 [MLS SEARCH] Querying by ListingId');
      searchParams.append('_filter', `ListingId Eq '${query}'`);
      
    } else if (type === 'address') {
      console.log('🏠 [ADDRESS SEARCH] Querying by address');
      searchParams.append('_filter', `UnparsedAddress Contains '${query}'`);
      
    } else if (type === 'city') {
      console.log('🌆 [CITY SEARCH] Querying by city');
      searchParams.append('_filter', `City Eq '${query}'`);
      
    } else {
      console.log('📝 [TEXT SEARCH] Multi-field query');
      searchParams.append('_filter', `ListingId Contains '${query}' Or UnparsedAddress Contains '${query}' Or City Contains '${query}' Or MLSAreaMajor Contains '${query}'`);
    }

    const response = await fetch(`${FLEXMLS_API_URL}?${searchParams.toString()}`, {
      headers: {
        'X-SparkApi-User-Agent': 'BIRCabo/1.0',
        'Authorization': `OAuth ${FLEXMLS_TOKEN}`,
        'Content-Type': 'application/json'
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
      
      const errorData = await response.json();
      console.error('❌ [FLEXMLS ERROR]:', errorData);
      throw new Error(`FlexMLS API error: ${response.status}`);
    }

    const data = await response.json();
    const results = data.D?.Results || [];
    
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
