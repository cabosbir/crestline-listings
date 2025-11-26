// api/test-area-fields.js - Test area field names
const FLEXMLS_API_URL = 'https://replication.sparkapi.com/Version/3/Reso/OData/Property';

export default async function handler(req, res) {
  try {
    const FLEXMLS_TOKEN = process.env.FLEXMLS_API_KEY || process.env.FLEXMLS_OAUTH_TOKEN;
    
    const testsToRun = [
      { field: 'MLSAreaMajor', value: 'CSL-Beach & Marina' },
      { field: 'MLSAreaMinor', value: 'CSL-Beach & Marina' },
      { field: 'Area', value: 'CSL-Beach & Marina' },
      { field: 'SubdivisionName', value: 'CSL-Beach & Marina' }
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
          results[`${test.field} eq '${test.value}'`] = data['@odata.count'] || 0;
        } else {
          results[`${test.field} eq '${test.value}'`] = `Error: ${response.status}`;
        }
      } catch (err) {
        results[`${test.field} eq '${test.value}'`] = `Error: ${err.message}`;
      }
    }

    // Get sample to see actual area field values
    const sampleUrl = `${FLEXMLS_API_URL}?$top=1&$filter=City eq 'Cabo San Lucas'`;
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
          MLSAreaMajor: data.value[0].MLSAreaMajor,
          MLSAreaMinor: data.value[0].MLSAreaMinor,
          SubdivisionName: data.value[0].SubdivisionName,
          City: data.value[0].City
        };
      }
    }

    return res.status(200).json({
      success: true,
      tests: results,
      sampleProperty: sampleProperty
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
