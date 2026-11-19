export const featuredPhotoOrder = ['26-1759','24-4467','26-3083','26-3891','25-5698','26-811'];
const handPickedMLS = new Set(['26-3891','26-1759','26-1326','25-3456','26-481','25-678','26-811','25-2758','26-616','26-246','26-3488','26-3314','26-1965']);
const isFeatured = row => row.StandardStatus === 'Active' && row.InternetEntireListingDisplayYN !== false &&
  row.PropertyType !== 'Reservations Only' &&
  (String(row.ListOfficeName || '').trim().toLowerCase() === 'baja international realty' || handPickedMLS.has(row.ListingId));

// Listing facts come from the validated inventory. Photos/details enhance them;
// a failed enhancement must not erase facts and links already available.
export async function loadFeaturedListings({signal, onRows, fetcher = fetch, clock = () => performance.now()}) {
  const started = clock();
  const response = await fetcher('/api/search-pilot?mode=snapshot', {signal});
  if (!response.ok) throw new Error('Inventory unavailable');
  const data = await response.json();
  const serverTime = Date.parse(response.headers.get('date') || '');
  const ageText = response.headers.get('age');
  const cacheAge = ageText === null ? 0 : /^\d+$/.test(ageText.trim()) ? Number(ageText) : NaN;
  const age = serverTime + cacheAge * 1000 + (clock() - started) - Date.parse(data.fetchedAt);
  if (!Number.isFinite(serverTime) || !Number.isSafeInteger(cacheAge) || cacheAge < 0 ||
      data.complete !== true || !Array.isArray(data.results) || data.total !== data.results.length ||
      !Number.isFinite(age) || age >= 3600000 || age < -60000 ||
      new Set(data.results.map(row => row.ListingKey)).size !== data.total) {
    throw new Error('Incomplete or outdated inventory');
  }
  let rows = data.results.filter(isFeatured);
  onRows(rows);
  const batches = [];
  for (let i = 0; i < rows.length; i += 24) batches.push(rows.slice(i, i + 24));
  await Promise.allSettled(batches.map(async batch => {
    const requested = new Set(batch.map(row => row.ListingKey));
    const details = await fetcher('/api/search-pilot?keys=' + encodeURIComponent([...requested].join(',')), {signal});
    if (!details.ok) throw new Error('Details unavailable');
    const result = await details.json();
    if (!Array.isArray(result.results) || !Number.isSafeInteger(result.total) ||
        result.results.length !== result.total || result.next ||
        new Set(result.results.map(row => row.ListingKey)).size !== result.total ||
        result.results.some(row => !requested.has(row.ListingKey))) {
      throw new Error('Incomplete details');
    }
    const current = new Map(result.results.filter(isFeatured).map(row => [row.ListingKey, row]));
    // A successful response is authoritative, including removals from inventory.
    rows = rows.flatMap(row => requested.has(row.ListingKey) ? (current.has(row.ListingKey) ? [current.get(row.ListingKey)] : []) : [row]);
    onRows(rows);
  }));
  return rows;
}
