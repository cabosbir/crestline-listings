export const CABO_AREAS=['Cabo San Lucas','Cabo Corridor','San Jose del Cabo','San Jose Corridor','Pacific','East Cape'];
export function matchesArea(row,area=''){
 if(!area)return true;
 if(area==='cerritos-pescadero')return row.area==='Pacific'&&row.mlsCommunity==='Pescadero/Cerritos';
 if(area==='todos-santos')return row.area==='Pacific'&&['Todos Santos','Todos Santos North'].includes(row.mlsCommunity);
 return row.area===area;
}
export function sortByPrice(rows,order='price-asc'){
 return [...rows].sort((a,b)=>{
  const ap=Number.isFinite(a.price)&&a.price>0?a.price:null,bp=Number.isFinite(b.price)&&b.price>0?b.price:null;
  if(ap===null&&bp!==null)return 1;if(bp===null&&ap!==null)return -1;
  return (ap!==null&&bp!==null?(order==='price-desc'?bp-ap:ap-bp):0)||String(a.mls).localeCompare(String(b.mls));
 });
}
export function restoreCollectionFilters(fields){
 const params=new URL(location.href).searchParams;
 for(const [key,id] of fields){const select=document.getElementById(id),value=params.get(key);if([...select.options].some(o=>o.value===value))select.value=value;}
}
export function rememberCollectionFilters(fields){
 const url=new URL(location.href);
 for(const [key,id,fallback] of fields){const value=document.getElementById(id).value;if(value===fallback)url.searchParams.delete(key);else url.searchParams.set(key,value);}
 history.replaceState(history.state,'',url);
}
