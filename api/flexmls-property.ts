// api/flexmls-property.ts - RESO Web API v3
import type { VercelRequest, VercelResponse } from '@vercel/node';

const FLEXMLS_API_KEY = process.env.FLEXMLS_API_KEY;
const RESO_API_BASE = 'https://replication.sparkapi.com/Version/3/Reso/OData';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers - must match your listings endpoint
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
      error: 'API key not configured'
    });
  }

  try {
    const { listingKey } = req.query;

    if (!listingKey || typeof listingKey !== 'string') {
      console.error('❌ Missing or invalid listingKey parameter');
      return res.status(200).json({ 
        success: false, 
        error: 'listingKey parameter is required'
      });
    }

    console.log('🔍 Fetching property:', listingKey);

    // Use same API pattern as listings - search by ListingKey filter
    const url = new URL(`${RESO_API_BASE}/Property`);
    url.searchParams.append('$filter', `ListingKey eq '${listingKey}'`);
    url.searchParams.append('$expand', 'Media');

    console.log('📡 RESO API v3:', url.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${FLEXMLS_API_KEY}`,
        'Accept': 'application/json',
      }
    });

    console.log('📊 Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error:', errorText.substring(0, 300));
      
      return res.status(200).json({
        success: false,
        error: `API returned status ${response.status}`
      });
    }

    const data = await response.json();
    console.log('✅ Results:', data.value?.length || 0);
    
    if (!data.value || data.value.length === 0) {
      console.error('❌ Property not found');
      return res.status(200).json({
        success: false,
        error: 'Property not found'
      });
    }

    const property = data.value[0];
    
    console.log('✅ Property found:', {
      ListingId: property.ListingId,
      Beds: property.BedroomsTotal,
      Baths: property.BathroomsFull
    });

    return res.status(200).json({
      success: true,
      result: property
    });

  } catch (error) {
    console.error('💥 Error:', error);
    return res.status(200).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}