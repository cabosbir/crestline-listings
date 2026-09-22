import { publicListing, fields } from './search-pilot.js';

export const WEEK = 7 * 86400000;
export function reduction(row, now = Date.now()) {
  const changed = Date.parse(row.PriceChangeTimestamp);
  if (row.MajorChangeType !== 'Price Reduced' || !Number.isFinite(changed) || changed > now || changed < now - WEEK || !(Number(row.ListPrice) > 0)) return null;
  const clean = publicListing(row);
  return clean ? {...clean, PriceChangeTimestamp: row.PriceChangeTimestamp, MajorChangeType: 'Price Reduced'} : null;
}

export async function loadReductions(base, key, fetcher = fetch, now = Date.now()) {
  const endpoint = new URL(`${base.replace(/\/$/, '')}/Property`);
  if (endpoint.protocol !== 'https:') throw new Error('Invalid feed');
  const url = new URL(endpoint);
  url.searchParams.set('$filter', `StandardStatus eq 'Active' and InternetEntireListingDisplayYN ne false and MajorChangeType eq 'Price Reduced' and PriceChangeTimestamp ge ${new Date(now-WEEK).toISOString()} and PriceChangeTimestamp le ${new Date(now).toISOString()}`);
  url.searchParams.set('$select', [...fields.filter(f => f !== 'PublicRemarks'), 'PriceChangeTimestamp', 'MajorChangeType'].join(','));
  url.searchParams.set('$expand', 'Media($top=1)');
  url.searchParams.set('$top', '100');
  url.searchParams.set('$count', 'true');
  url.searchParams.set('$orderby', 'PriceChangeTimestamp desc,ListingKey asc');
  let next = url, total = null, received = 0;
  const rows = new Map(), seen = new Set();
  for (let page = 0; next && page < 20; page++) {
    if (seen.has(next.href)) throw new Error('Repeated page');
    seen.add(next.href);
    const response = await fetcher(next, {headers:{Authorization:`Bearer ${key}`,Accept:'application/json'},signal:AbortSignal.timeout(20000),redirect:'error'});
    if (!response.ok) throw new Error(`Feed HTTP ${response.status}`);
    const data = await response.json(), count = data['@odata.count'];
    if (!Array.isArray(data.value) || !Number.isSafeInteger(count) || count < 0 || count > 2000 || (total !== null && count !== total)) throw new Error('Incomplete report');
    total = count; received += data.value.length;
    for (const row of data.value) {
      const clean = reduction(row, now);
      if (!clean?.ListingKey || rows.has(clean.ListingKey)) throw new Error('Invalid report row');
      rows.set(clean.ListingKey, clean);
    }
    next = data['@odata.nextLink'] ? new URL(data['@odata.nextLink'], endpoint) : null;
    if (next && (!data.value.length || next.origin !== endpoint.origin || next.pathname !== endpoint.pathname || next.username || next.password)) throw new Error('Invalid continuation');
  }
  if (next || received !== total || rows.size !== total) throw new Error('Incomplete report');
  return {results:[...rows.values()],total,complete:true,fetchedAt:new Date(now).toISOString()};
}

export default async function handler(req,res) {
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET') return res.status(405).json({error:'Method not allowed'});
  try {
    if(req.query.source==='refresh') {
      if(!process.env.FLEXMLS_BASE_URL || !process.env.FLEXMLS_API_KEY) throw new Error('Feed not configured');
      const data=await loadReductions(process.env.FLEXMLS_BASE_URL,process.env.FLEXMLS_API_KEY);
      res.setHeader('Vercel-CDN-Cache-Control','public, s-maxage=300');
      return res.status(200).json(data);
    }
    const response=await fetch('https://inventory.bircabo.com/?section=price-reductions',{signal:AbortSignal.timeout(5000),redirect:'error'});
    if(!response.ok) throw new Error('Report unavailable');
    const data=await response.json(),age=Date.now()-Date.parse(data.fetchedAt);
    if(data.complete!==true || !Array.isArray(data.results) || data.results.length!==data.total || !Number.isFinite(age) || age< -60000 || age>36*3600000) throw new Error('Report expired');
    // Keep the seven-day promise as time passes between daily refreshes.
    const results=data.results.map(row=>reduction(row)).filter(Boolean);
    res.setHeader('Cache-Control','public, max-age=60');
    return res.status(200).json({...data,results,total:results.length});
  } catch {
    res.setHeader('Retry-After','300');
    return res.status(503).json({error:'Price reductions are being updated. Please try again shortly.'});
  }
}
