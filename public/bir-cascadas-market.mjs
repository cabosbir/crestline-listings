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
    const listing = row.mls ? '<a href="?property=' + encodeURIComponent(row.mls) + '#properties">' + escapeHtml(row.mls) + '</a>' : 'On request';
    return '<tr><th scope="row">' + (unit ? 'Unit ' + unit : 'Confirm with BIR') +
      '</th><td>' + price + '</td><td>' + listing + '</td><td>' +
      (plan ? '<a href="' + escapeHtml(plan) + '" aria-label="View floor plan for Unit ' + unit + '">View plan</a>' : 'Confirm with BIR') + '</td></tr>';
  });
  return '<table aria-labelledby="cascadas-compare-title" width="100%" cellpadding="8"><thead><tr>' +
    '<th scope="col">Unit</th><th scope="col">Asking price</th><th scope="col">MLS number</th><th scope="col">Floor plan</th>' +
    '</tr></thead><tbody>' + entries.join('') + '</tbody></table>';
}
