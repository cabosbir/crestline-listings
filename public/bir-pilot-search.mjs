export const locationFields = ['City', 'MLSAreaMajor', 'Address_co_Community2', 'SubdivisionName'];
export const defaults = () => ({City:'', MLSAreaMajor:'', Address_co_Community2:'', SubdivisionName:'', PropertyType:'', minPrice:'', maxPrice:'', beds:'', view:'', financing:false, query:'', construction:'', minLot:'', maxLot:'', areaUnit:'ft2', minTotal:'', maxTotal:'', minAC:'', maxAC:''});
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
export function lotSquareMeters(p) {
  const value=p.General_sp_Description_co_Lot_sp_M2;
  return value!==null && value!==undefined && String(value).trim()!=='' && Number.isFinite(Number(value)) && Number(value)>0 ? Number(value) : null;
}
export function propertyAreaSquareMeters(p,kind) {
  const positive=value=>value!==null && value!==undefined && String(value).trim()!=='' && Number.isFinite(Number(value)) && Number(value)>0 ? Number(value) : null;
  if(kind==='Total')return positive(p.General_sp_Description_co_Total_sp_M2);
  return positive(p.General_sp_Description_co_AC_sp_M2) ?? (positive(p.General_sp_Description_co_AC_sp_SqFt)===null ? null : Number(p.General_sp_Description_co_AC_sp_SqFt)/10.76391041671);
}
export function matchesPropertyArea(p,f,kind) {
  const min=f['min'+kind],max=f['max'+kind];
  if(!min&&!max)return true;
  const value=kind==='Lot'?lotSquareMeters(p):propertyAreaSquareMeters(p,kind);
  if(value===null)return false;
  const bound=name=>f._areaBounds?.[name] ?? Number(f[name])/(f.areaUnit==='m2'?1:10.76391041671);
  return (!min||value>=bound('min'+kind)-1e-8)&&(!max||value<=bound('max'+kind)+1e-8);
}
export function convertSizeUnits(filters,unit) {
  const next={...filters,areaUnit:unit,_areaBounds:{...filters._areaBounds}};
  for(const name of ['minLot','maxLot','minTotal','maxTotal','minAC','maxAC']) {
    if(filters[name]===''){delete next._areaBounds[name];continue;}
    const meters=filters._areaBounds?.[name] ?? Number(filters[name])/(filters.areaUnit==='m2'?1:10.76391041671);
    next._areaBounds[name]=meters;
    next[name]=String(Math.round(meters*(unit==='m2'?1:10.76391041671)*100)/100);
  }
  return next;
}
export function filterListings(rows, f) {
  const query = f.query.trim().toLowerCase();
  return rows.filter(p => p.StandardStatus === 'Active' && p.InternetEntireListingDisplayYN !== false)
    .filter(p => locationFields.every(k => !f[k] || p[k] === f[k]))
    .filter(p => !f.PropertyType || p.PropertyType === f.PropertyType)
    .filter(p => !f.minPrice || (p.ListPrice != null && Number(p.ListPrice) >= Number(f.minPrice)))
    .filter(p => !f.maxPrice || (p.ListPrice != null && Number(p.ListPrice) <= Number(f.maxPrice)))
    .filter(p => !f.beds || (p.BedroomsTotal != null && Number(p.BedroomsTotal) >= Number(f.beds)))
    .filter(p => matchesPropertyArea(p,f,'Total') && matchesPropertyArea(p,f,'AC'))
    .filter(p => !f.construction || p.General_sp_Description_co_Construction === f.construction)
    .filter(p => matchesPropertyArea(p,f,'Lot'))
    .filter(p => !f.view || p.General_sp_Description_co_Primary_sp_View === f.view)
    .filter(p => !f.financing || /^(yes|true)$/i.test(String(p.General_sp_Description_co_Seller_sp_Financing_sp_Offered)))
    .filter(p => !query || [p.ListingId, p.UnparsedAddress, ...locationFields.map(k => p[k])].some(v => String(v || '').toLowerCase().includes(query)));
}
export function coordinates(p) {
  return typeof p.Latitude === 'number' && typeof p.Longitude === 'number' && Math.abs(p.Latitude) <= 90 && Math.abs(p.Longitude) <= 180 && !(p.Latitude === 0 && p.Longitude === 0);
}
