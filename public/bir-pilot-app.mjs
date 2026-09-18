import {defaults, locationFields, changeLocation, locationOptions, filterListings, coordinates} from './bir-pilot-search.mjs';
import {loadInventory} from './bir-pilot-inventory.mjs';
const $ = id => document.getElementById(id);
let filters=defaults(),rows=[],matches=[],shown=24,map,layer;
let ready=false,failed=false,detailVersion=0;
const detailsCache=new Map();
const style=document.createElement('style');
style.textContent='.leaflet-tooltip.cluster-number{background:transparent;border:0;box-shadow:none;color:#fff;font-weight:700;font-size:12px}.leaflet-tooltip.cluster-number:before{display:none}.photo-placeholder{height:180px;background:#e5ece7;display:grid;place-items:center;color:#44605e;font-size:14px}.page-info{align-self:center;font-size:14px}#inquiry textarea{min-height:100px;width:100%;padding:10px;border:1px solid #b9cbc6;font:inherit}#inquiry .contact-options{display:flex;gap:15px;flex-wrap:wrap;margin:16px 0}@media(max-width:760px){#cards{grid-template-columns:1fr}.bar{flex-wrap:wrap;gap:10px}.layout aside{padding:18px}#inquiry{max-height:90vh;overflow:auto}.steps{flex-wrap:wrap}}';
document.head.append(style);
const previous=document.createElement('button');previous.textContent='Previous';previous.hidden=true;$('more').before(previous);
const pageInfo=document.createElement('span');pageInfo.className='page-info';$('more').after(pageInfo);
previous.onclick=()=>{shown=Math.max(24,shown-24);renderCards();$('cards').scrollIntoView({block:'start'});};
const inquiryNote=$('inquiry').querySelector('p:not(#property-context)');
inquiryNote.textContent='Ask Don about this property. Your email draft will include its MLS number and your question.';
const questionLabel=document.createElement('label');questionLabel.htmlFor='inquiry-question';questionLabel.textContent='What would you like to know?';
const question=document.createElement('textarea');question.id='inquiry-question';question.placeholder='Availability, a showing, financing, or another question…';
$('email').before(questionLabel,question);
const contactOptions=document.createElement('div');contactOptions.className='contact-options';
const callLink=document.createElement('a');callLink.href='tel:+526241296245';callLink.textContent='Call Don';contactOptions.append(callLink);$('email').after(contactOptions);
let selectedProperty;
function updateInquiry(){if(!selectedProperty)return;const p=selectedProperty;const body=`I would like more information about ${p.UnparsedAddress}.\nMLS: ${p.ListingId}\nPrice: ${money(p.ListPrice)}\n\n${question.value}`;$('email').href=`mailto:don@bircabo.com?subject=${encodeURIComponent('Property inquiry: MLS '+p.ListingId)}&body=${encodeURIComponent(body)}`;}
question.oninput=updateInquiry;
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
 layer.clearLayers(); const mapped=matches.filter(coordinates),groups=new Map();
 for(const p of mapped){const point=map.project([p.Latitude,p.Longitude],map.getZoom());const key=`${Math.floor(point.x/64)}:${Math.floor(point.y/64)}`;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(p);}
 for(const group of groups.values()){
  const lat=group.reduce((n,p)=>n+p.Latitude,0)/group.length,lng=group.reduce((n,p)=>n+p.Longitude,0)/group.length;
  const marker=L.circleMarker([lat,lng],{radius:group.length>1?Math.min(23,11+Math.log2(group.length)):7,color:'#fff',weight:2,fillColor:'#bc6956',fillOpacity:.94}).addTo(layer);
  if(group.length>1){marker.bindTooltip(String(group.length),{permanent:true,direction:'center',className:'cluster-number'});marker.on('click',()=>map.setView([lat,lng],Math.min(map.getZoom()+2,19)));}
  else{const p=group[0],box=document.createElement('div');box.textContent=`${money(p.ListPrice)} · ${p.UnparsedAddress} · MLS ${p.ListingId}`;marker.bindPopup(box);}
 }
 $('mapnote').textContent=`${mapped.length.toLocaleString()} of ${matches.length.toLocaleString()} matches have map coordinates. Numbered circles group nearby properties; click to zoom in.`;
}
function inquire(p){selectedProperty=p;question.value='';$('property-context').textContent=`${p.UnparsedAddress} · MLS ${p.ListingId} · ${money(p.ListPrice)}`;updateInquiry();$('inquiry').showModal();question.focus();}
function renderCards(loadDetails=true){
 const version=++detailVersion,visible=matches.slice(shown-24,shown);
 $('cards').replaceChildren();
 for(const original of visible){
  const cached=detailsCache.get(original.ListingKey),p={...original,...cached};
  const card=document.createElement('article');card.className='card';
  const url=p.Media?.[0]?.MediaURL;
  if(url && /^https:\/\//.test(url)){const image=document.createElement('img');image.src=url;image.alt=p.UnparsedAddress||'Property';image.loading='lazy';image.className='photo';card.append(image);}
  else{const placeholder=document.createElement('div');placeholder.className='photo-placeholder';placeholder.textContent=cached?'Photo not available':'Loading photo…';card.append(placeholder);}
  const content=document.createElement('div');content.className='content';
  for(const [tag,text,cls] of [['div',money(p.ListPrice),'price'],['h2',p.UnparsedAddress||'Property',''],['p',[p.SubdivisionName,p.Address_co_Community2,p.City].filter(Boolean).join(' · '),'meta'],['p',`${p.PropertyType} · ${p.BedroomsTotal ?? '—'} bedrooms · ${p.BathroomsTotalDecimal ?? p.BathroomsFull ?? '—'} baths`,'meta'],['p',p.General_sp_Description_co_AC_sp_SqFt != null ? `${Number(p.General_sp_Description_co_AC_sp_SqFt).toLocaleString()} indoor sq ft` : 'Indoor area not supplied','meta'],['p',`MLS ${p.ListingId} · Listed by ${p.ListOfficeName||'MLS member office'}`,'meta']]){const el=document.createElement(tag);el.textContent=text;el.className=cls;content.append(el);}
  const detail=document.createElement('details'),summary=document.createElement('summary'),remarks=document.createElement('p');summary.textContent='Property description';remarks.textContent=p.PublicRemarks||(cached?'No description supplied.':'Loading description…');remarks.className='meta';detail.append(summary,remarks);content.append(detail);
  const button=document.createElement('button');button.className='inquiry';button.textContent='Ask about this property';button.onclick=()=>inquire(p);content.append(button);card.append(content);$('cards').append(card);
 }
 $('more').textContent='Next 24 properties';$('more').hidden=!ready||shown>=matches.length;previous.hidden=!ready||shown<=24;$('empty').hidden=matches.length>0;
 pageInfo.textContent=matches.length?`${shown-23}–${Math.min(shown,matches.length)}${ready?' of '+matches.length.toLocaleString():''}`:'';
 const missing=visible.filter(p=>!detailsCache.has(p.ListingKey)).map(p=>p.ListingKey);
 if(loadDetails&&missing.length)fetch('/api/search-pilot?keys='+encodeURIComponent(missing.join(',')),{cache:'no-store'}).then(async response=>{if(!response.ok)throw new Error('Details unavailable');return response.json();}).then(data=>{
   if(!Array.isArray(data.results))throw new Error('Invalid details');
   for(const p of data.results)detailsCache.set(p.ListingKey,{Media:p.Media,PublicRemarks:p.PublicRemarks});
   for(const key of missing)if(!detailsCache.has(key))detailsCache.set(key,{Media:[],PublicRemarks:'This property is no longer available from the feed. Reload the search for current availability.'});
   if(version===detailVersion)renderCards(false);
 }).catch(()=>{if(version===detailVersion){$('message').textContent='Photos and descriptions could not load. Change page or filter to retry. Search counts are still available.';document.querySelectorAll('.photo-placeholder').forEach(el=>el.textContent='Photo temporarily unavailable');}});
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
$('sort').onchange=()=>{shown=24;render();};$('more').onclick=()=>{shown+=24;renderCards();$('cards').scrollIntoView({block:'start'});};$('close').onclick=()=>$('inquiry').close();
try{
 const controls=[...document.querySelectorAll('#filters input,#filters select,#filters button,#sort')];
 controls.forEach(el=>el.disabled=true);
 const started=performance.now();
 const firstPage=fetch('/api/search-pilot?mode=first',{cache:'no-store'}).then(async response=>{if(!response.ok)throw new Error('Initial results unavailable');return response.json();}).then(data=>{
  if(ready||failed)return;
  matches=data.results;
  for(const p of matches)detailsCache.set(p.ListingKey,{Media:p.Media,PublicRemarks:p.PublicRemarks});
  renderCards(false);$('count').textContent=`${Number(data.total).toLocaleString()} properties · first ${matches.length} shown`;
  $('mapnote').textContent='The complete map and location filters are loading.';
  $('timestamp').textContent=`First properties loaded in ${((performance.now()-started)/1000).toFixed(1)} seconds. Preparing all location choices…`;
 }).catch(()=>{});
 const data=await loadInventory(async cursor=>{
   const response=await fetch('/api/search-pilot'+(cursor?'?cursor='+encodeURIComponent(cursor):'?mode=inventory'),{cache:'no-store'});
   const page=await response.json();
   if(!response.ok)throw new Error(page.error||'Listing data unavailable');
   return page;
 },(loaded,total)=>{if(!matches.length)$('count').textContent=`Preparing search: ${loaded.toLocaleString()}${total===null?'':` of ${total.toLocaleString()}`} listings…`;});
 rows=data.results;
 ready=true;
 if(!Array.isArray(rows))throw new Error('Invalid listing data');
 rows=rows.filter(p=>p.StandardStatus==='Active'&&p.InternetEntireListingDisplayYN!==false);
 controls.forEach(el=>el.disabled=false);
 options('PropertyType',[...new Set(rows.map(p=>p.PropertyType).filter(Boolean))].sort(),'');options('view',[...new Set(rows.map(p=>p.General_sp_Description_co_Primary_sp_View).filter(Boolean))].sort(),'');syncLocations();
 $('timestamp').textContent=`All filters ready in ${((performance.now()-started)/1000).toFixed(1)} seconds. ${rows.length.toLocaleString()} public active listings checked ${new Date(data.fetchedAt).toLocaleTimeString()}. Includes Reservations Only; reload for updates.`;
 if(window.L){map=L.map('map').setView([23.05,-109.75],9);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);layer=L.layerGroup().addTo(map);map.on('zoomend',renderMap);}
 else $('map').textContent='Map could not load. You can still browse the matching listings below.';
 render();
}catch(error){failed=true;$('count').textContent='Complete search unavailable';$('timestamp').textContent='Any properties shown are only the first page. Reload to retry loading the complete filters and map.';$('message').textContent=error.message;}


