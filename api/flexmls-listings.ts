// api/flexmls-listings.ts - Fixed version
import type { VercelRequest, VercelResponse } from '@vercel/node';

const FLEXMLS_API_KEY = process.env.FLEXMLS_API_KEY;
const FLEXMLS_API_FEED_ID = 'b6byf74jy5upy5zp4'; // CORRECTED: Full Feed ID

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
    console.error('❌ FLEXMLS_API_KEY is missing');
    return res.status(500).json({ 
      success: false, 
      error: 'API key not configured',
      results: []
    });
  }

  console.log('✅ API Key present, length:', FLEXMLS_API_KEY.length);

  try {
    const { city, minPrice, maxPrice, bedrooms, bathrooms, propertyType } = req.query;

    // Build filters
    const filters: string[] = [];
    if (city) filters.push(`City Eq '${city}'`);
    if (minPrice) filters.push(`ListPrice Ge ${minPrice}`);
    if (maxPrice) filters.push(`ListPrice Le ${maxPrice}`);
    if (bedrooms) filters.push(`BedroomsTotal Ge ${bedrooms}`);
    if (bathrooms) filters.push(`BathroomsTotalInteger Ge ${bathrooms}`);
    if (propertyType) filters.push(`PropertyType Eq '${propertyType}'`);
    
    const filterString = filters.length > 0 ? filters.join(' And ') : '';
    
    // CORRECTED: Try without /v1/ in the path
    const url = new URL(`https://sparkapi.com/${FLEXMLS_API_FEED_ID}/listings`);
    if (filterString) {
      url.searchParams.append('_filter', filterString);
    }
    url.searchParams.append('_expand', 'Photos');
    url.searchParams.append('_limit', '50');

    console.log('🔍 Attempting to fetch:', url.toString());
    console.log('🔍 Filter string:', filterString || 'none');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${FLEXMLS_API_KEY}`,
        'X-SparkApi-User-Agent': 'BajaInternationalRealty',
        'Accept': 'application/json',
      }
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ FlexMLS API Error:', {
        status: response.status,
        body: errorText,
        url: url.toString()
      });
      
      return res.status(200).json({
        success: false,
        results: [],
        debug: {
          apiStatus: response.status,
          apiResponse: errorText.substring(0, 500),
          endpoint: url.toString(),
          feedId: FLEXMLS_API_FEED_ID,
        }
      });
    }

    const data = await response.json();
    
    console.log('✅ Success! Results count:', data.D?.Results?.length || 0);
    
    return res.status(200).json({
      success: true,
      results: data.D?.Results || [],
      count: data.D?.Results?.length || 0
    });

  } catch (error) {
    console.error('💥 Exception:', error);
    return res.status(200).json({ 
      success: false, 
      results: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}