// api/test-cabo-fields.js - Diagnostic to find correct field for Cabo San Lucas
const FLEXMLS_API_URL = 'https://replication.sparkapi.com/Version/3/Reso/OData/Property';

export default async function handler(req, res) {
  try {
    const FLEXMLS_TOKEN = process.env.FLEXMLS_API_KEY || process.env.FLEXMLS_OAUTH_TOKEN;
    
    if (!FLEXMLS_TOKEN) {
      return res.status(500).json({ error: 'Token not configured' });
    }

    // Test different field names for "Cabo San Lucas"
    const testsToRun = [
      { field: 'City', value: 'Cabo San Lucas' },
      { field: 'PostalCity', value: 'Cabo San Lucas' },
      { field: 'MLSAreaMajor', value: 'Cabo San Lucas' },
      { field: 'StateOrProvince', value: 'Cabo San Lucas' },
      { field: 'City', value: 'CSL' },
      { field: 'PostalCity', value: 'CSL' }
    ];

    const results = {};

    for (const test of testsToRun) {
      const filterString = `${test.field} eq '${test.value}'`;
      const url = `${FLEXMLS_API_URL}?$filter=${encodeURIComponent(filterString)}&$top=0&$count=true`;
      
      try {
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${FLEXMLS_TOKEN}`,
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const count = data['@odata.count'] || 0;
          results[`${test.field} eq '${test.value}'`] = count;
        } else {
          results[`${test.field} eq '${test.value}'`] = `Error: ${response.status}`;
        }
      } catch (err) {
        results[`${test.field} eq '${test.value}'`] = `Error: ${err.message}`;
      }
    }

    // Also get one sample property to see its fields
    const sampleUrl = `${FLEXMLS_API_URL}?$top=1&$filter=StandardStatus eq 'Active'`;
    const sampleResponse = await fetch(sampleUrl, {
      headers: {
        'Authorization': `Bearer ${FLEXMLS_TOKEN}`,
        'Accept': 'application/json'
      }
    });

    let sampleProperty = null;
    if (sampleResponse.ok) {
      const data = await sampleResponse.json();
      if (data.value && data.value.length > 0) {
        sampleProperty = {
          City: data.value[0].City,
          PostalCity: data.value[0].PostalCity,
          MLSAreaMajor: data.value[0].MLSAreaMajor,
          StateOrProvince: data.value[0].StateOrProvince,
          UnparsedAddress: data.value[0].UnparsedAddress
        };
      }
    }

    return res.status(200).json({
      success: true,
      tests: results,
      sampleProperty: sampleProperty,
      note: 'Check which field has the most properties for Cabo San Lucas'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
