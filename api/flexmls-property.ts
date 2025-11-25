// api/flexmls-property.ts - Vercel API Route
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { listingKey } = req.query;

    // Validate listingKey parameter
    if (!listingKey || typeof listingKey !== 'string') {
      console.error('❌ Missing or invalid listingKey parameter');
      return res.status(400).json({ 
        success: false, 
        error: 'listingKey parameter is required' 
      });
    }

    const accessToken = process.env.FLEXMLS_API_KEY;

    if (!accessToken) {
      console.error('❌ FLEXMLS_API_KEY environment variable not set');
      return res.status(500).json({ 
        success: false, 
        error: 'API configuration error' 
      });
    }

    console.log('🔍 Fetching property:', listingKey);

    // Use Flex MLS RESO Web API v3 endpoint
    const flexMlsUrl = `https://replication.sparkapi.com/Version/3/Reso/OData/Property('${encodeURIComponent(listingKey)}')`;

    console.log('📡 Calling Flex MLS API:', flexMlsUrl);

    const response = await fetch(flexMlsUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    console.log('📊 Flex MLS Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Flex MLS API Error:', response.status, errorText);

      if (response.status === 401) {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication failed with Flex MLS API' 
        });
      }

      if (response.status === 404) {
        return res.status(404).json({ 
          success: false, 
          error: 'Property not found' 
        });
      }

      return res.status(response.status).json({ 
        success: false, 
        error: `Flex MLS API error: ${response.statusText}` 
      });
    }

    const data = await response.json();
    console.log('✅ Flex MLS Response received');

    // Transform Flex MLS response to our format
    const property = data.value?.[0] || data;

    if (!property || !property.ListingKey) {
      console.error('❌ Invalid property data from Flex MLS');
      return res.status(404).json({ 
        success: false, 
        error: 'Property data invalid' 
      });
    }

    console.log('✅ Property found:', {
      ListingKey: property.ListingKey,
      ListingId: property.ListingId,
      Address: property.UnparsedAddress,
      Beds: property.BedroomsTotal,
      Baths: property.BathroomsFull,
    });

    // Return the property data
    return res.status(200).json({
      success: true,
      result: {
        ListingKey: property.ListingKey,
        ListingId: property.ListingId,
        UnparsedAddress: property.UnparsedAddress,
        City: property.City,
        StateOrProvince: property.StateOrProvince,
        PostalCode: property.PostalCode,
        ListPrice: property.ListPrice,
        BedroomsTotal: property.BedroomsTotal,
        BathroomsFull: property.BathroomsFull,
        BathroomsHalf: property.BathroomsHalf,
        LivingArea: property.LivingArea,
        LotSizeArea: property.LotSizeArea,
        YearBuilt: property.YearBuilt,
        PropertyType: property.PropertyType,
        PublicRemarks: property.PublicRemarks,
        StandardStatus: property.StandardStatus,
        Latitude: property.Latitude,
        Longitude: property.Longitude,
        Appliances: property.Appliances,
        ArchitecturalStyle: property.ArchitecturalStyle,
        Cooling: property.Cooling,
        Heating: property.Heating,
        ParkingFeatures: property.ParkingFeatures,
        View: property.View,
        WaterfrontFeatures: property.WaterfrontFeatures,
        PoolFeatures: property.PoolFeatures,
        PatioAndPorchFeatures: property.PatioAndPorchFeatures,
        Media: property.Media,
      }
    });

  } catch (error) {
    console.error('💥 API Route Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
