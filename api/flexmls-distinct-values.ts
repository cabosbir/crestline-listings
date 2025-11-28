// api/flexmls-distinct-values.ts - Get REAL distinct values from MLS
import type { VercelRequest, VercelResponse } from '@vercel/node';

const FLEXMLS_API_KEY = process.env.FLEXMLS_API_KEY;
const RESO_API_BASE = 'https://replication.sparkapi.com/Version/3/Reso/OData';

interface DistinctValuesResponse {
  zones: string[];
  areas: string[];
  communities: string[];
  subdivisions: string[];
  propertyTypes: string[];
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200'); // Cache 1 hour
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  
  if (!FLEXMLS_API_KEY) {
    return res.status(200).json({ 
      success: false, 
      error: 'API key not configured'
    });
  }

  try {
    console.log('📊 Fetching distinct values from MLS...');

    // Fetch a large sample of active listings to extract distinct values
    const url = new URL(`${RESO_API_BASE}/Property`);
    url.searchParams.append('$filter', "StandardStatus eq 'Active'");
    url.searchParams.append('$top', '1000'); // Sample 1000 active listings
    url.searchParams.append('$select', 'City,MLSAreaMajor,SubdivisionName,PropertyType');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${FLEXMLS_API_KEY}`,
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    const properties = data.value || [];
    
    console.log(`✅ Sampled ${properties.length} properties`);

    // Extract distinct values
    const zonesSet = new Set<string>();
    const areasSet = new Set<string>();
    const communitiesSet = new Set<string>();
    const subdivisionSet = new Set<string>();
    const propertyTypesSet = new Set<string>();

    properties.forEach((prop: any) => {
      // City (Zone)
      if (prop.City && prop.City.trim()) {
        zonesSet.add(prop.City.trim());
      }
      
      // Area
      if (prop.MLSAreaMajor && prop.MLSAreaMajor.trim()) {
        areasSet.add(prop.MLSAreaMajor.trim());
      }
      
      // Community/Subdivision (SubdivisionName can contain both)
      if (prop.SubdivisionName && prop.SubdivisionName.trim()) {
        const name = prop.SubdivisionName.trim();
        communitiesSet.add(name);
        subdivisionSet.add(name);
      }
      
      // Property Type
      if (prop.PropertyType && prop.PropertyType.trim()) {
        propertyTypesSet.add(prop.PropertyType.trim());
      }
    });

    // Convert to sorted arrays
    const distinctValues: DistinctValuesResponse = {
      zones: Array.from(zonesSet).sort(),
      areas: Array.from(areasSet).sort(),
      communities: Array.from(communitiesSet).sort(),
      subdivisions: Array.from(subdivisionSet).sort(),
      propertyTypes: Array.from(propertyTypesSet).sort()
    };

    console.log('📊 Distinct values found:');
    console.log(`  Zones: ${distinctValues.zones.length}`);
    console.log(`  Areas: ${distinctValues.areas.length}`);
    console.log(`  Communities: ${distinctValues.communities.length}`);
    console.log(`  Subdivisions: ${distinctValues.subdivisions.length}`);
    console.log(`  Property Types: ${distinctValues.propertyTypes.length}`);

    return res.status(200).json({
      success: true,
      data: distinctValues,
      sampleSize: properties.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Error fetching distinct values:', error);
    return res.status(200).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}