import {defaults, locationFields, changeLocation, locationOptions, filterListings, coordinates} from './bir-pilot-search.mjs';
import {loadInventory} from './bir-pilot-inventory.mjs';
const $ = id => document.getElementById(id);
let filters=defaults(),rows=[],matches=[],shown=24,map,layer;
const money=n=>n == null ? 'Price on request' : new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
function options(id,values,value){const select=$(id);select.replaceChildren(new Option('Any',''),...values.map(v=>new Option(v,v)));select.value=value;}
function syncLocations(){
 for(const [index,key] of locationFields.entries()){
  options(key,locationOptions(rows,filters,key),filters[key]);
  $(key).disabled=index>0 && !filters[locationFields[index-1]];
 }
 document.querySelectorAll('.step').forEach((el,index)=>el.classList.toggle('active',index===0 || filters[locationFields[index-1]]));
}
function renderMap(){
 if(!map)return;
 layer.clearLayers(); const mapped=matches.filter(coordinates),groups=new Map(),scale=2**(map.getZoom()-5);
 for(const p of mapped){const key=`${Math.floor(p.Latitude*scale)}:${Math.floor(p.Longitude*scale)}`;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(p);}
 for(const group of groups.values()){
  const lat=group.reduce((n,p)=>n+p.Latitude,0)/group.length,lng=group.reduce((n,p)=>n+p.Longitude,0)/group.length;
  const marker=L.circleMarker([lat,lng],{radius:group.length>1?Math.min(23,11+Math.log2(group.length)):7,color:'#fff',weight:2,fillColor:'#bc6956',fillOpacity:.94}).addTo(layer);
  if(group.length>1){marker.bindTooltip(String(group.length),{permanent:true,direction:'center',className:'cluster-number'});marker.on('click',()=>map.setView([lat,lng],Math.min(map.getZoom()+2,19)));}
  else{const p=group[0],box=document.createElement('div');box.textContent=`${money(p.ListPrice)} · ${p.UnparsedAddress} · MLS ${p.ListingId}`;marker.bindPopup(box);}
 }
 $('mapnote').textContent=`${mapped.length.toLocaleString()} of ${matches.length.toLocaleString()} matches have map coordinates. Numbered circles group nearby properties; click to zoom in.`;
}
function inquire(p){$('property-context').textContent=`${p.UnparsedAddress} · MLS ${p.ListingId} · ${money(p.ListPrice)}`;const body=`I would like more information about ${p.UnparsedAddress}.\nMLS: ${p.ListingId}\nPrice: ${money(p.ListPrice)}\n\nMy questions:\n`;$('email').href=`mailto:don@bircabo.com?subject=${encodeURIComponent('Property inquiry: MLS '+p.ListingId)}&body=${encodeURIComponent(body)}`;$('inquiry').showModal();}
function renderCards(){
 $('cards').replaceChildren();
 for(const p of matches.slice(0,shown)){
  const card=document.createElement('article');card.className='card';
  const url=p.Media?.[0]?.MediaURL;
  if(url && /^https:\/\//.test(url)){const image=document.createElement('img');image.src=url;image.alt=p.UnparsedAddress||'Property';image.loading='lazy';image.className='photo';card.append(image);}
  const content=document.createElement('div');content.className='content';
  for(const [tag,text,cls] of [['div',money(p.ListPrice),'price'],['h2',p.UnparsedAddress||'Property',''],['p',[p.SubdivisionName,p.Address_co_Community2,p.City].filter(Boolean).join(' · '),'meta'],['p',`${p.PropertyType} · ${p.BedroomsTotal ?? '—'} bedrooms · ${p.BathroomsTotalDecimal ?? p.BathroomsFull ?? '—'} baths`,'meta'],['p',p.General_sp_Description_co_AC_sp_SqFt != null ? `${Number(p.General_sp_Description_co_AC_sp_SqFt).toLocaleString()} indoor sq ft` : 'Indoor area not supplied','meta'],['p',`MLS ${p.ListingId} · Listed by ${p.ListOfficeName||'MLS member office'}`,'meta']]){const el=document.createElement(tag);el.textContent=text;el.className=cls;content.append(el);}
  const detail=document.createElement('details'),summary=document.createElement('summary'),remarks=document.createElement('p');summary.textContent='Property description';remarks.textContent=p.PublicRemarks||'No description supplied.';remarks.className='meta';detail.append(summary,remarks);content.append(detail);
  const button=document.createElement('button');button.className='inquiry';button.textContent='Ask about this property';button.onclick=()=>inquire(p);content.append(button);card.append(content);$('cards').append(card);
 }
 $('more').hidden=shown>=matches.length;$('empty').hidden=matches.length>0;
}
function render(){
 matches=filterListings(rows,filters);const sort=$('sort').value;
 matches.sort((a,b)=>sort==='low'?(a.ListPrice??Infinity)-(b.ListPrice??Infinity):sort==='high'?(b.ListPrice??-Infinity)-(a.ListPrice??-Infinity):String(b.ModificationTimestamp||'').localeCompare(String(a.ModificationTimestamp||'')));
 $('count').textContent=`${matches.length.toLocaleString()} matching properties`;renderCards();renderMap();
 if(filters.minPrice && filters.maxPrice && Number(filters.minPrice)>Number(filters.maxPrice))$('message').textContent='Minimum price is higher than maximum price.';
}
$('filters').addEventListener('submit',e=>e.preventDefault());
$('filters').addEventListener('input',e=>{
 const key=e.target.name;if(!(key in filters))return;
 if(locationFields.includes(key)){filters=changeLocation(filters,key,e.target.value);syncLocations();$('message').textContent='Location choices below this level cleared. Other filters kept.';}
 else{filters={...filters,[key]:key==='financing'?e.target.checked:e.target.value};$('message').textContent='';}
 shown=24;render();
});
$('clear-location').onclick=()=>{filters={...filters,...Object.fromEntries(locationFields.map(k=>[k,'']))};syncLocations();shown=24;render();$('message').textContent='Location cleared. Price, bedrooms and other filters kept.';};
$('filters').addEventListener('reset',e=>{e.preventDefault();filters=defaults();for(const [k,v] of Object.entries(filters)){if(k==='financing')$(k).checked=false;else $(k).value=v;}syncLocations();shown=24;render();$('message').textContent='All filters cleared.';});
$('sort').onchange=()=>{shown=24;render();};$('more').onclick=()=>{shown+=24;renderCards();};$('close').onclick=()=>$('inquiry').close();
try{
 const controls=[...document.querySelectorAll('#filters input,#filters select,#filters button,#sort')];
 controls.forEach(el=>el.disabled=true);
 const data=await loadInventory(async cursor=>{
   const response=await fetch('/api/search-pilot'+(cursor?'?cursor='+encodeURIComponent(cursor):''),{cache:'no-store'});
   const page=await response.json();
   if(!response.ok)throw new Error(page.error||'Listing data unavailable');
   return page;
 },(loaded,total)=>{$('count').textContent=`Loading inventory: ${loaded.toLocaleString()}${total===null?'':` of ${total.toLocaleString()}`} listings…`;$('timestamp').textContent='Search becomes available after every page has loaded and counts agree.';});
 rows=data.results;
 if(!Array.isArray(rows))throw new Error('Invalid listing data');
 rows=rows.filter(p=>p.StandardStatus==='Active'&&p.InternetEntireListingDisplayYN!==false);
 controls.forEach(el=>el.disabled=false);
 options('PropertyType',[...new Set(rows.map(p=>p.PropertyType).filter(Boolean))].sort(),'');options('view',[...new Set(rows.map(p=>p.General_sp_Description_co_Primary_sp_View).filter(Boolean))].sort(),'');syncLocations();
 $('timestamp').textContent=`${rows.length.toLocaleString()} public active listings retrieved ${new Date(data.fetchedAt).toLocaleString()}. Count checked against this feed; comparison with standard FLEX is still required. Reload for updates.`;
 if(window.L){map=L.map('map').setView([23.05,-109.75],9);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);layer=L.layerGroup().addTo(map);map.on('zoomend',renderMap);}
 else $('map').textContent='Map could not load. You can still browse the matching listings below.';
 render();
}catch(error){$('count').textContent='Inventory could not be verified';$('timestamp').textContent='Search is unavailable until the complete inventory can be loaded.';$('message').textContent=error.message;}

