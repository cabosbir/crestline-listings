// api/test-combined-query.js - Test combined filters
const FLEXMLS_API_URL = 'https://replication.sparkapi.com/Version/3/Reso/OData/Property';

export default async function handler(req, res) {
  try {
    const FLEXMLS_TOKEN = process.env.FLEXMLS_API_KEY || process.env.FLEXMLS_OAUTH_TOKEN;
    
    // Test the exact query that's failing
    const filters = [
      "(City eq 'Cabo San Lucas')",
      "(MLSAreaMajor eq 'CSL-Beach & Marina')",
      "StandardStatus eq 'Active'"
    ];
    
    const filterString = filters.join(' and ');
    const url = `${FLEXMLS_API_URL}?$filter=${encodeURIComponent(filterString)}&$top=0&$count=true`;
    
    console.log('Testing query:', filterString);
    console.log('URL:', url);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${FLEXMLS_TOKEN}`,
        'Accept': 'application/json'
      }
    });

    const data = await response.json();
    
    return res.status(200).json({
      success: response.ok,
      status: response.status,
      filterString: filterString,
      count: data['@odata.count'] || 0,
      data: data
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
