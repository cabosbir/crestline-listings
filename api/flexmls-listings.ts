// api/flexmls-listings.ts - CORRECTED VERSION
import type { VercelRequest, VercelResponse } from '@vercel/node';

const FLEXMLS_API_KEY = process.env.FLEXMLS_API_KEY;
const FLEXMLS_API_FEED_ID = 'b6byf74jy5upy5';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if API key exists
  if (!FLEXMLS_API_KEY) {
    console.error('FLEXMLS_API_KEY environment variable is not set');
    return res.status(500).json({ 
      success: false, 
      error: 'API configuration error',
      results: []
    });
  }

  try {
    const { city, minPrice, maxPrice, bedrooms, bathrooms, propertyType } = req.query;

    // Build FlexMLS filter string (Spark API filter syntax)
    const filters: string[] = [];
    
    if (city) filters.push(`City Eq '${city}'`);
    if (minPrice) filters.push(`ListPrice Ge ${minPrice}`);
    if (maxPrice) filters.push(`ListPrice Le ${maxPrice}`);
    if (bedrooms) filters.push(`BedroomsTotal Ge ${bedrooms}`);
    if (bathrooms) filters.push(`BathroomsTotalInteger Ge ${bathrooms}`);
    if (propertyType) filters.push(`PropertyType Eq '${propertyType}'`);
    
    const filterString = filters.length > 0 ? filters.join(' And ') : '';
    
    // CORRECTED: Use sparkapi.com endpoint
    const url = new URL(`https://sparkapi.com/v1/${FLEXMLS_API_FEED_ID}/listings`);
    if (filterString) {
      url.searchParams.append('_filter', filterString);
    }
    url.searchParams.append('_expand', 'Photos');
    url.searchParams.append('_limit', '50');

    console.log('Fetching from FlexMLS Spark API:', url.toString());

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `OAuth ${FLEXMLS_API_KEY}`,  // Changed to OAuth
        'X-SparkApi-User-Agent': 'BajaInternationalRealty',
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('FlexMLS API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        url: url.toString()
      });
      
      // Return empty results gracefully instead of throwing error
      return res.status(200).json({
        success: false,
        results: [],
        error: `API returned ${response.status}: ${response.statusText}`,
        debug: {
          endpoint: url.toString(),
          status: response.status
        }
      });
    }

    const data = await response.json();
    
    console.log('FlexMLS API success:', {
      resultsCount: data.D?.Results?.length || 0,
      hasData: !!data.D
    });
    
    return res.status(200).json({
      success: true,
      results: data.D?.Results || [],
      count: data.D?.Results?.length || 0
    });

  } catch (error) {
    console.error('Error in flexmls-listings handler:', error);
    return res.status(200).json({ 
      success: false, 
      results: [],
      error: 'Failed to fetch listings',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}