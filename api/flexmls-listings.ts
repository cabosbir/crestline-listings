// api/flexmls-listings.ts - Authenticated Spark API
import type { VercelRequest, VercelResponse } from '@vercel/node';

const FLEXMLS_API_KEY = process.env.FLEXMLS_API_KEY; // This is your Access Token

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
    return res.status(200).json({ 
      success: false, 
      error: 'API key not configured',
      results: []
    });
  }

  try {
    const { city, minPrice, maxPrice, bedrooms, bathrooms, propertyType } = req.query;

    // Build Spark API filter string
    const filters: string[] = [];
    if (city) filters.push(`City Eq '${city}'`);
    if (minPrice) filters.push(`ListPrice Ge ${minPrice}`);
    if (maxPrice) filters.push(`ListPrice Le ${maxPrice}`);
    if (bedrooms) filters.push(`BedroomsTotal Ge ${bedrooms}`);
    if (bathrooms) filters.push(`BathroomsTotalInteger Ge ${bathrooms}`);
    if (propertyType) filters.push(`PropertyType Eq '${propertyType}'`);
    
    const filterString = filters.length > 0 ? filters.join(' And ') : '';
    
    // CORRECTED: Use the authenticated Spark API endpoint
    const url = new URL('https://sparkapi.com/v1/listings');
    if (filterString) {
      url.searchParams.append('_filter', filterString);
    }
    url.searchParams.append('_expand', 'Photos');
    url.searchParams.append('_limit', '50');

    console.log('🔍 Authenticated endpoint:', url.toString());
    console.log('🔍 Filter:', filterString || 'none');

    // Use SparkAPI authentication with Access Token
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `OAuth ${FLEXMLS_API_KEY}`,
        'X-SparkApi-User-Agent': 'BajaInternationalRealty',
        'Accept': 'application/json',
      }
    });

    console.log('📡 Status:', response.status);
    console.log('📡 Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText.substring(0, 500)
      });
      
      return res.status(200).json({
        success: false,
        results: [],
        debug: {
          status: response.status,
          endpoint: url.toString(),
          authMethod: 'OAuth with Access Token',
          errorPreview: errorText.substring(0, 200)
        }
      });
    }

    const data = await response.json();
    console.log('✅ Success! Results:', data.D?.Results?.length || 0);
    
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