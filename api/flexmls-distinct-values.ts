// api/flexmls-distinct-values.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

const FLEXMLS_API_KEY = process.env.FLEXMLS_API_KEY;
const RESO_API_BASE = 'https://replication.sparkapi.com/Version/3/Reso/OData';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!FLEXMLS_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { field } = req.query;

    if (!field || typeof field !== 'string') {
      return res.status(400).json({ error: 'field parameter required. Valid: SubdivisionName, MLSAreaMajor, City, PropertyType, StandardStatus' });
    }

    const validFields = ['SubdivisionName', 'MLSAreaMajor', 'City', 'PropertyType', 'StandardStatus'];
    if (!validFields.includes(field)) {
      return res.status(400).json({ 
        error: `Invalid field. Valid fields: ${validFields.join(', ')}` 
      });
    }

    console.log(`🔍 [DISTINCT] Fetching distinct values for: ${field}`);

    const allValues = new Set<string>();
    let skip = 0;
    const top = 500;
    let hasMore = true;
    let pageCount = 0;

    while (hasMore && skip < 10000) {
      const url = new URL(`${RESO_API_BASE}/Property`);
      url.searchParams.append('$select', field);
      url.searchParams.append('$top', top.toString());
      url.searchParams.append('$skip', skip.toString());
      url.searchParams.append('$orderby', 'ModificationTimestamp desc');

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${FLEXMLS_API_KEY}`,
            'Accept': 'application/json',
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status === 429) {
            console.log(`⚠️ [RATE LIMITED] Stopping at ${allValues.size} values`);
            break;
          }
          throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();
        const results = data.value || [];

        pageCount++;
        console.log(`✅ [Page ${pageCount}] Got ${results.length} results (total unique so far: ${allValues.size})`);

        results.forEach((property: any) => {
          const value = property[field];
          if (value && typeof value === 'string' && value.trim()) {
            allValues.add(value.trim());
          }
        });

        if (results.length < top) {
          hasMore = false;
          console.log(`🎉 [COMPLETE] Fetched all pages. Found ${allValues.size} distinct ${field} values`);
        } else {
          skip += top;
        }

      } catch (error) {
        console.error(`❌ [Fetch Error at skip ${skip}]:`, error);
        hasMore = false;
      }
    }

    const sortedValues = Array.from(allValues).sort();

    console.log(`📊 [FINAL] ${sortedValues.length} distinct values for ${field}`);

    return res.status(200).json({
      success: true,
      field,
      count: sortedValues.length,
      values: sortedValues,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 [Error]:', error);
    return res.status(200).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
