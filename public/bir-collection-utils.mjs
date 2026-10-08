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
 if(fields.some(([key])=>key==='subdivision'))url.searchParams.delete('community');
 for(const [key,id,fallback] of fields){const value=document.getElementById(id).value;if(value===fallback)url.searchParams.delete(key);else url.searchParams.set(key,value);}
 history.replaceState(history.state,'',url);
}

// Location fields follow the same MLS hierarchy as the complete search.
export const COLLECTION_LOCATION_FIELDS=[
 ['area','ov-area',''],['mlsArea','ov-mls-area',''],
 ['mlsCommunity','ov-mls-community',''],['subdivision','ov-subdivision','']
];
export function collectionLocation(row){
 const text=value=>typeof value==='string'&&value.trim()&&!/^\*+$/.test(value)?value.trim():'';
 return {mlsArea:text(row.MLSAreaMajor),mlsCommunity:text(row.Address_co_Community2),
  subdivision:row.InternetAddressDisplayYN===false?'':text(row.SubdivisionName)};
}
export function matchesCollectionLocation(row,{area='',mlsArea='',mlsCommunity='',subdivision='',community=''}={}){
 const selectedSubdivision=subdivision||community;
 return matchesArea(row,area)&&(!mlsArea||row.mlsArea===mlsArea)&&(!mlsCommunity||row.mlsCommunity===mlsCommunity)&&(!selectedSubdivision||row.subdivision===selectedSubdivision);
}
export function collectionLocationOptions(rows,filters,key){
 const keys=COLLECTION_LOCATION_FIELDS.map(([name])=>name),parents=keys.slice(0,keys.indexOf(key));
 return [...new Set(rows.filter(row=>parents.every(parent=>parent==='area'?matchesArea(row,filters.area):!filters[parent]||row[parent]===filters[parent])).map(row=>row[key]).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
}
export function changeCollectionLocation(filters,key,value){
 const keys=COLLECTION_LOCATION_FIELDS.map(([name])=>name),index=keys.indexOf(key);
 if(index<0)throw Error('Unknown location field');
 const next={...filters,[key]:value};for(const child of keys.slice(index+1))next[child]='';return next;
}
export function setupCollectionLocations(getRows){
 const fields=COLLECTION_LOCATION_FIELDS.map(([key,id])=>({key,select:document.getElementById(id)}));
 const params=new URL(location.href).searchParams;
 let pending=Object.fromEntries(fields.map(({key})=>[key,params.get(key)||'']));
 // Older condo links used community for the subdivision name.
 if(!pending.subdivision)pending.subdivision=params.get('community')||'';
 const choices=()=>Object.fromEntries(fields.map(({key,select})=>[key,select.value]));
 function refresh(preferred=pending||choices()){
  const rows=getRows(),current={...preferred};pending=null;
  current.area=fields[0].select.value;
  for(const {key,select} of fields.slice(1)){
   const label={mlsArea:'All areas',mlsCommunity:'All communities',subdivision:'All subdivisions'}[key];
   const values=collectionLocationOptions(rows,current,key);
   select.replaceChildren(new Option(label,''),...values.map(value=>new Option(value,value)));
   // Keep a saved or refreshed search specific when its last listing disappears.
   if(current[key]&&!values.includes(current[key]))select.add(new Option(current[key]+' (no current matches)',current[key]));
   select.value=current[key]||'';select.disabled=false;
  }
 }
 function change(target){
  const field=fields.find(({select})=>select===target);if(!field)return;
  refresh(changeCollectionLocation(choices(),field.key,target.value));
 }
 function reset(){pending=null;refresh({area:fields[0].select.value,mlsArea:'',mlsCommunity:'',subdivision:''});}
 return {choices,refresh,change,reset};
}
