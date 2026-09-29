export const CONSENT_VERSION = 'bir-property-alerts-v1';
export function preferences(input = {}) {
  const frequency = input.frequency ?? 'none';
  if (!['none', 'daily', 'weekly'].includes(frequency)) throw new Error('Choose daily, weekly or no alerts.');
  if (frequency === 'none') return {frequency, new_matches: false, favorite_changes: false, consent_version: null};
  const new_matches = input.new_matches === true;
  const favorite_changes = input.favorite_changes === true;
  if (!new_matches && !favorite_changes) throw new Error('Choose at least one alert topic.');
  return {frequency, new_matches, favorite_changes, consent_version: CONSENT_VERSION};
}

const strings = ['City','MLSAreaMajor','Address_co_Community2','SubdivisionName','PropertyType','view','construction','query'];
const numbers = ['minPrice','maxPrice','beds','minLot','maxLot','minTotal','maxTotal','minAC','maxAC'];
export function savedSearch(name, input) {
  if (typeof name !== 'string' || !name.trim() || name.trim().length > 80) throw new Error('Give your search a name of up to 80 characters.');
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid search.');
  const filters = {};
  for (const key of strings) {
    const value = input[key] ?? '';
    if (typeof value !== 'string' || value.length > 300) throw new Error('Invalid search filter.');
    filters[key] = value.trim();
  }
  for (const key of numbers) {
    const value = input[key] ?? '';
    if (value !== '' && (typeof value !== 'string' && typeof value !== 'number' || !Number.isFinite(Number(value)) || Number(value) < 0 || String(value).trim() === '')) throw new Error('Invalid numeric filter.');
    filters[key] = value === '' ? '' : String(Number(value));
  }
  filters.areaUnit = input.areaUnit ?? 'ft2';
  if (!['ft2','m2'].includes(filters.areaUnit)) throw new Error('Invalid size unit.');
  filters.financing = input.financing === true;
  for (const kind of ['Price','Lot','Total','AC']) {
    const lo=filters['min'+kind], hi=filters['max'+kind];
    if (lo !== '' && hi !== '' && Number(lo)>Number(hi)) throw new Error('Minimum exceeds maximum.');
  }
  // Preserve the current search's exact size bounds after a unit conversion.
  if (input._areaBounds) {
    filters._areaBounds = {};
    for (const key of numbers.filter(k=>/Lot|Total|AC/.test(k))) {
      const value = input._areaBounds[key];
      if (value !== undefined && filters[key] !== '') {
        if (typeof value !== 'number' || !Number.isFinite(value) || value<0) throw new Error('Invalid size bound.');
        const displayed=Number(filters[key])/(filters.areaUnit==='m2'?1:10.76391041671);
        if (Math.abs(displayed-value)>0.011) throw new Error('Inconsistent size bound.');
        filters._areaBounds[key]=value;
      }
    }
  }
  return {name:name.trim(),filters};
}

export function favorites(input) {
  if (!Array.isArray(input) || input.length>50) throw new Error('Save up to 50 properties.');
  const rows = new Map();
  for (const p of input) {
    if (!p || typeof p.key !== 'string' || !/^\d{1,40}$/.test(p.key) || typeof p.mls !== 'string' || p.mls.length>40) throw new Error('Invalid saved property.');
    rows.set(p.key,{listing_key:p.key,mls_number:p.mls});
  }
  return [...rows.values()];
}
