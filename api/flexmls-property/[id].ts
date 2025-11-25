// api/flexmls-property/[id].ts - PRODUCTION READY
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
    console.error('❌ FLEXMLS_API_KEY not configured');
    return res.status(500).json({ 
      success: false, 
      error: 'API key not configured'
    });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Property ID is required'
      });
    }

    // Fetch single property by ListingKey using RESO API
    const url = new URL(`${RESO_API_BASE}/Property('${id}')`);
    url.searchParams.append('$expand', 'Media');

    console.log('🔍 Fetching property:', id);
    console.log('📡 URL:', url.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${FLEXMLS_API_KEY}`,
        'Accept': 'application/json',
      }
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText.substring(0, 300)
      });
      
      return res.status(response.status).json({
        success: false,
        error: `Property not found or API error: ${response.status}`,
        details: errorText.substring(0, 200)
      });
    }

    const data = await response.json();
    console.log('✅ Property fetched successfully:', data.ListingId || 'Unknown');
    
    return res.status(200).json({
      success: true,
      result: data
    });

  } catch (error) {
    console.error('💥 Exception:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}