// api/flexmls-listings.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

const FLEXMLS_API_KEY = process.env.FLEXMLS_API_KEY;
const FLEXMLS_API_FEED_ID = 'b6byf74jy5upy5'; // Your API Feed ID
const FLEXMLS_ACCOUNT_ID = '12';
const FLEXMLS_IDX_LINK_ID = '1lpm0zo1944e';
const FLEXMLS_PUBLIC_API = `https://api.flexmls.com/v1/public/${FLEXMLS_API_FEED_ID}`;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { city, minPrice, maxPrice, bedrooms, bathrooms, propertyType } = req.query;

    // Build FlexMLS filter string
    const filters: string[] = [];
    
    if (city) filters.push(`City Eq '${city}'`);
    if (minPrice) filters.push(`ListPrice Ge ${minPrice}`);
    if (maxPrice) filters.push(`ListPrice Le ${maxPrice}`);
    if (bedrooms) filters.push(`BedroomsTotal Ge ${bedrooms}`);
    if (bathrooms) filters.push(`BathroomsTotalInteger Ge ${bathrooms}`);
    if (propertyType) filters.push(`PropertyType Eq '${propertyType}'`);
    
    const filterString = filters.length > 0 ? filters.join(' And ') : '';
    
    const url = new URL(`${FLEXMLS_PUBLIC_API}/listings`);
    if (filterString) {
      url.searchParams.append('_filter', filterString);
    }
    url.searchParams.append('_expand', 'Photos');
    url.searchParams.append('_limit', '50');

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${FLEXMLS_API_KEY}`,
        'X-SparkApi-User-Agent': 'BajaInternationalRealty',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('FlexMLS API error:', response.status, errorText);
      throw new Error(`FlexMLS API error: ${response.status}`);
    }

    const data = await response.json();
    
    return res.status(200).json({
      success: true,
      results: data.D?.Results || []
    });

  } catch (error) {
    console.error('Error fetching from FlexMLS:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch listings',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
