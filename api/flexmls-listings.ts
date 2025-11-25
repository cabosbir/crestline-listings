// api/flexmls-listings.ts - RESO Web API v3
import type { VercelRequest, VercelResponse } from '@vercel/node';

const FLEXMLS_API_KEY = process.env.FLEXMLS_API_KEY;
const RESO_API_BASE = 'https://replication.sparkapi.com/Version/3/Reso/OData';

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
    const { city, minPrice, maxPrice, bedrooms, bathrooms } = req.query;

    // Build RESO OData $filter query
    const filters: string[] = [];
    if (city) filters.push(`City eq '${city}'`);
    if (minPrice) filters.push(`ListPrice ge ${minPrice}`);
    if (maxPrice) filters.push(`ListPrice le ${maxPrice}`);
    if (bedrooms) filters.push(`BedroomsTotal ge ${bedrooms}`);
    if (bathrooms) filters.push(`BathroomsFull ge ${bathrooms}`);
    
    const filterString = filters.length > 0 ? filters.join(' and ') : '';
    
    // Build RESO OData URL
    const url = new URL(`${RESO_API_BASE}/Property`);
    if (filterString) {
      url.searchParams.append('$filter', filterString);
    }
    url.searchParams.append('$top', '50');
    url.searchParams.append('$expand', 'Media');

    console.log('🔍 RESO API v3:', url.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${FLEXMLS_API_KEY}`,
        'Accept': 'application/json',
      }
    });

    console.log('📡 Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error:', errorText.substring(0, 300));
      
      return res.status(200).json({
        success: false,
        results: [],
        debug: {
          status: response.status,
          error: errorText.substring(0, 200)
        }
      });
    }

    const data = await response.json();
    console.log('✅ Results:', data.value?.length || 0);
    
    return res.status(200).json({
      success: true,
      results: data.value || [],
      count: data.value?.length || 0
    });

  } catch (error) {
    console.error('💥 Error:', error);
    return res.status(200).json({ 
      success: false, 
      results: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}