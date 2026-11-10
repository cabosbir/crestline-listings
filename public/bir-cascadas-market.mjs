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
