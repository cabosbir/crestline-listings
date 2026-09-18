// api/flexmls-field-inspector.ts
// DIAGNOSTIC TOOL - Discovers actual field names and values in your FlexMLS data
// Deploy this temporarily to find the correct parameters for East Cape, La Paz, etc.

import type { VercelRequest, VercelResponse } from '@vercel/node';

const FLEXMLS_BASE_URL = process.env.FLEXMLS_BASE_URL;
const FLEXMLS_API_KEY = process.env.FLEXMLS_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!FLEXMLS_BASE_URL || !FLEXMLS_API_KEY) {
    return res.status(500).json({ error: 'Missing env vars' });
  }

  try {
    // Fetch a larger sample of properties with NO filters
    const url = new URL(`${FLEXMLS_BASE_URL}/Property`);
    url.searchParams.set('$top', '200'); // Get 200 properties
    url.searchParams.set('$orderby', 'ModificationTimestamp desc');
    url.searchParams.set('$expand', 'Media');

    console.log('🔍 Fetching sample properties:', url.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${FLEXMLS_API_KEY}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    const properties = data?.value || [];

    console.log(`✅ Retrieved ${properties.length} properties`);

    // Extract unique values from location fields
    const locationFieldNames = [
      'City',
      'StateOrProvince',
      'PostalCode',
      'CountyOrParish',
      'MLSAreaMajor',
      'MLSAreaMinor',
      'Area',
      'SubArea',
      'Community',
      'SubdivisionName',
      'Neighborhood',
      'Township',
      'Zone',
    ];

    const fieldValues: Record<string, Set<string>> = {};
    
    // Initialize sets for each field
    locationFieldNames.forEach(field => {
      fieldValues[field] = new Set();
    });

    // Extract values from all properties
    properties.forEach((property: any) => {
      locationFieldNames.forEach(field => {
        const value = property[field];
        if (value && typeof value === 'string' && value.trim()) {
          fieldValues[field].add(value.trim());
        }
      });
    });

    // Convert sets to sorted arrays and count
    const analysis: Record<string, any> = {};
    
    locationFieldNames.forEach(field => {
      const values = Array.from(fieldValues[field]).sort();
      analysis[field] = {
        count: values.length,
        values: values,
      };
    });

    // Special analysis: Find properties that might be East Cape, La Paz, etc.
    const suspectedZones = ['East Cape', 'La Paz', 'Loreto', 'Mulege', 'Comondu'];
    const foundInFields: Record<string, any[]> = {};

    suspectedZones.forEach(zone => {
      foundInFields[zone] = [];
      
      properties.forEach((property: any, index: number) => {
        locationFieldNames.forEach(field => {
          const value = property[field];
          if (value && typeof value === 'string') {
            if (value.toLowerCase().includes(zone.toLowerCase())) {
              foundInFields[zone].push({
                propertyIndex: index,
                field: field,
                value: value,
                listingId: property.ListingId,
                address: property.UnparsedAddress,
              });
            }
          }
        });
      });
    });

    // Return comprehensive analysis
    return res.status(200).json({
      success: true,
      summary: {
        totalPropertiesSampled: properties.length,
        fieldsAnalyzed: locationFieldNames.length,
      },
      fieldAnalysis: analysis,
      suspectedZoneMatches: foundInFields,
      instructions: {
        message: 'Check "fieldAnalysis" to see all unique values for each location field',
        usage: 'Use the field with the most distinct zone values as your primary zone filter',
        nextStep: 'Look at suspectedZoneMatches to see if East Cape, La Paz, etc. exist in your data',
      }
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
