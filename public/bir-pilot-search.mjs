export const locationFields = ['City', 'MLSAreaMajor', 'Address_co_Community2', 'SubdivisionName'];
export const defaults = () => ({City:'', MLSAreaMajor:'', Address_co_Community2:'', SubdivisionName:'', PropertyType:'', minPrice:'', maxPrice:'', beds:'', view:'', financing:false, query:''});
export function changeLocation(filters, field, value) {
  const next = {...filters, [field]:value};
  const index = locationFields.indexOf(field);
  if (index < 0) throw new Error('Unknown location field');
  for (const child of locationFields.slice(index + 1)) next[child] = '';
  return next;
}
export function locationOptions(rows, filters, field) {
  const parents = locationFields.slice(0, locationFields.indexOf(field));
  return [...new Set(rows.filter(p => parents.every(k => !filters[k] || p[k] === filters[k])).map(p => p[field]).filter(Boolean))].sort();
}
export function filterListings(rows, f) {
  const query = f.query.trim().toLowerCase();
  return rows.filter(p => p.StandardStatus === 'Active' && p.InternetEntireListingDisplayYN !== false)
    .filter(p => locationFields.every(k => !f[k] || p[k] === f[k]))
    .filter(p => !f.PropertyType || p.PropertyType === f.PropertyType)
    .filter(p => !f.minPrice || (p.ListPrice != null && Number(p.ListPrice) >= Number(f.minPrice)))
    .filter(p => !f.maxPrice || (p.ListPrice != null && Number(p.ListPrice) <= Number(f.maxPrice)))
    .filter(p => !f.beds || (p.BedroomsTotal != null && Number(p.BedroomsTotal) >= Number(f.beds)))
    .filter(p => !f.view || p.General_sp_Description_co_Primary_sp_View === f.view)
    .filter(p => !f.financing || /^(yes|true)$/i.test(String(p.General_sp_Description_co_Seller_sp_Financing_sp_Offered)))
    .filter(p => !query || [p.ListingId, p.UnparsedAddress, ...locationFields.map(k => p[k])].some(v => String(v || '').toLowerCase().includes(query)));
}
export function coordinates(p) {
  return typeof p.Latitude === 'number' && typeof p.Longitude === 'number' && Math.abs(p.Latitude) <= 90 && Math.abs(p.Longitude) <= 180 && !(p.Latitude === 0 && p.Longitude === 0);
}
