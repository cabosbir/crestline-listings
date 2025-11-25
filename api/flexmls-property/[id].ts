// api/flexmls-property/[id].ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

const FLEXMLS_API_KEY = process.env.FLEXMLS_API_KEY;
const FLEXMLS_API_FEED_ID = 'b6byf74jy5upy5';
const FLEXMLS_PUBLIC_API = `https://api.flexmls.com/v1/public/${FLEXMLS_API_FEED_ID}`;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Property ID is required' });
    }

    const url = `${FLEXMLS_PUBLIC_API}/listings/${id}?_expand=Photos`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${FLEXMLS_API_KEY}`,
        'X-SparkApi-User-Agent': 'BajaInternationalRealty',
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Property not found' });
    }

    const data = await response.json();
    
    return res.status(200).json({
      success: true,
      result: data.D?.Results?.[0] || null
    });

  } catch (error) {
    console.error('Error fetching property:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch property' 
    });
  }
}
