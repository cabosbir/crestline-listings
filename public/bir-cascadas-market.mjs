// The hero and listing grid use the same validated public inventory snapshot.
export function cascadasMarketSummary(rows, fetchedAt, delayed = false) {
  if (!Array.isArray(rows) || !Number.isFinite(Date.parse(fetchedAt))) {
    return '<strong>Ask Don for current availability</strong><span>We cannot confirm the latest listings and asking prices right now.</span>';
  }
  const prices = rows.map(row => row.price).filter(price => Number.isFinite(price) && price > 0);
  const money = value => '$' + value.toLocaleString('en-US', {maximumFractionDigits: 0});
  let priceText = 'Ask Don about other available condos.';
  if (prices.length) {
    const low = Math.min(...prices), high = Math.max(...prices);
    priceText = 'Asking ' + money(low) + (low === high ? '' : '–' + money(high)) + ' USD';
    const missing = rows.length - prices.length;
    if (missing) priceText += ' · ' + missing + (missing === 1 ? ' additional price' : ' additional prices') + ' on request';
  } else if (rows.length) {
    priceText = 'Asking prices on request';
  }
  const checked = new Date(fetchedAt).toLocaleString('en-US', {timeZone: 'America/Mazatlan', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'});
  const count = rows.length ? rows.length + (rows.length === 1 ? ' condo for sale' : ' condos for sale') : 'No current public MLS listings';
  return '<strong>' + count + '</strong><span>' + priceText + '</span><small>MLS availability checked <time datetime="' + new Date(fetchedAt).toISOString() + '">' + checked + ' Cabo time</time>.' + (delayed ? ' Update delayed; confirm availability and prices with Don.' : '') + '</small>';
}

export function cascadasPlanLinks(html) {
  const plans = new Map();
  for (const [,unit,href] of html.matchAll(/<article class="fp-card" data-unit="(\d{3})">[^<]*<h4>[^<]*<\/h4>\s*<a class="fp-open" href="(https:\/\/cabo-condos\.com\/[^"<]+)"/g)) {
    plans.set(unit, plans.has(unit) ? null : href);
  }
  return plans;
}

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char =>
  ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'})[char]);

// Parking details checked against the public MLS listing for each revision.
const verifiedParking = {
  "20251020181417672130000000": ["2026-10-20T21:46:39Z","1 enclosed garage space + 1 underground space"],
  "20260109233353749431000000": ["2026-07-25T21:28:11Z","1 private enclosed garage space + 1 general parking space"],
  "20260403202143087547000000": ["2026-10-31T17:46:37Z","Private 2-car garage"],
  "20260521020637115794000000": ["2026-07-12T23:35:37Z","Enclosed 1-car garage + 1 parking space"],
  "20260607221244257570000000": ["2026-06-19T17:34:20Z","2 garage spaces"],
  "20260702175259016894000000": ["2026-07-05T22:30:56Z","2 underground parking spaces"],
  "20261002013434742478000000": ["2026-10-30T23:25:34Z","2 garage spaces"],
  "20261027233813174620000000": ["2026-11-14T00:15:04Z","2 underground parking spaces"],
  "20261113013618777607000000": ["2026-11-13T09:01:20Z","2 garage spaces"]
};

export function cascadasComparison(rows, plans) {
  if (!rows) return '<p>Current availability could not be confirmed.</p>';
  if (!rows.length) return '<p>There are no active public MLS listings in this collection.</p>';
  const entries = rows.map(row => {
    const address = String(row.name ?? '').split(',');
    const fromName = address.map(part => part.match(/\b(?:Cascadas\b[^\d]*|(?:unit|penthouse|ph)\s+)(\d{3})\s*$/i)?.[1]).filter(Boolean);
    const possibleUnits = new Set(fromName);
    if (address.length > 1) {
      const streetUnit = address[0].match(/(?:^|\s)(\d{3})\s*$/)?.[1];
      if (streetUnit && plans.has(streetUnit)) possibleUnits.add(streetUnit);
    }
    const unit = possibleUnits.size === 1 ? [...possibleUnits][0] : null;
    const plan = unit && plans.get(unit);
    const price = Number.isFinite(row.price) && row.price > 0 ? '$' + row.price.toLocaleString('en-US') + ' USD' : 'On request';
    // Don verified Unit 934's indoor area against his floor plan on 2026-11-21.
    // Keep this correction scoped to the identified listing, not other units or MLS searches.
    const verified934 = unit === '934' && row.key === '20261027233813174620000000' && row.mls === '26-4832';
    const interior = verified934
      ? '132.46 m² (1,426 sq ft)<br><small>Floor plan; confirmed by Don.</small>'
      : Number.isFinite(row.interiorSqFt) && row.interiorSqFt > 0
        ? Math.round(row.interiorSqFt).toLocaleString('en-US') + ' sq ft' : 'Confirm with BIR';
    const parking = verifiedParking[row.key];
    const parkingText = parking && Date.parse(parking[0]) === Date.parse(row.modifiedAt) ? parking[1] : 'Confirm with BIR';
    const listing = row.mls ? '<a href="?property=' + encodeURIComponent(row.mls) + '#properties">' + escapeHtml(row.mls) + '</a>' : 'On request';
    return '<tr><th scope="row">' + (unit ? 'Unit ' + unit : 'Confirm with BIR') +
      '</th><td>' + price + '</td><td>' + listing + '</td><td>' + interior + '</td><td>' + parkingText + '</td><td>' +
      (plan ? '<a href="' + escapeHtml(plan) + '" aria-label="View floor plan for Unit ' + unit + '">View plan</a>' : 'Confirm with BIR') + '</td></tr>';
  });
  return '<table aria-labelledby="cascadas-compare-title" width="100%" cellpadding="8"><thead><tr>' +
    '<th scope="col">Unit</th><th scope="col">Asking price</th><th scope="col">MLS number</th><th scope="col">Indoor area</th><th scope="col">Parking (MLS)</th><th scope="col">Floor plan</th>' +
    '</tr></thead><tbody>' + entries.join('') + '</tbody></table>';
}
