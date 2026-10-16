// Spanish presentation; baseline main 13ba42d3f9ddad0143353167718de67a3df63b53.
const viewLabel=v=>({Ocean:'Vista al mar',Oceanfront:'Frente al mar',Arch:'Vista al Arco',Marina:'Vista a la marina','Golf Course':'Vista al campo de golf',City:'Vista a la ciudad',Mountain:'Vista a la montaña',Territory:'Vista al entorno',Local:'Vista local'}[v]||v);
import {priceSortButton,setupPriceSort} from './bir-property-sort-es.mjs';
import { SCOPES, GOLF_COMMUNITIES } from './bir-property-scopes.mjs';
import {CABO_AREAS,collectionLocation,sortByPrice,matchesCollectionLocation,setupCollectionLocations,COLLECTION_LOCATION_FIELDS,restoreCollectionFilters,rememberCollectionFilters} from './bir-collection-utils-es.mjs';
import {propertyDetailsHref,setupPropertyDetails} from './bir-property-details-es.mjs';
export const WATER_VIEWS=['Ocean','Oceanfront','Arch','Marina'];
const fields={city:'City',area:'MLSAreaMajor',community:'Address_co_Community2',subdivision:'SubdivisionName'};
export function matchesRule(row,rule){
 return Object.entries(rule).every(([key,values])=>key==='subdivisionContains'?values.some(v=>String(row.SubdivisionName||'').includes(v)):key==='excludeSubdivision'?!values.includes(row.SubdivisionName):values.includes(row[fields[key]]));
}
export function matchesScope(row,id){const scope=SCOPES[id];return Boolean(scope&&scope.rules.some(rule=>matchesRule(row,rule)));}
export function golfIds(row){return GOLF_COMMUNITIES.filter(id=>matchesScope(row,id));}
import {snapshotResponseTime} from './bir-inventory-time.mjs';
export {snapshotResponseTime};
export function currentRows(data,config,now=Date.now()){
 const age=now-Date.parse(data.fetchedAt);
 if(data.complete!==true||!Array.isArray(data.results)||data.total!==data.results.length||new Set(data.results.map(x=>x.ListingKey)).size!==data.total||!Number.isFinite(age)||age< -60000||age>=3600000)throw Error('Current inventory unavailable');
 const allowed=config.types||['Condos','Houses','Land'];
 return data.results.filter(x=>x.StandardStatus==='Active'&&x.InternetEntireListingDisplayYN!==false&&allowed.includes(x.PropertyType)&&
  (x.PropertyType==='Land'||x.General_sp_Description_co_Construction==='Completed')&&
  (config.golf?golfIds(x).length>0:config.scope==='all'?CABO_AREAS.includes(x.City):matchesScope(x,config.scope))&&
  (!config.water||WATER_VIEWS.includes(x.General_sp_Description_co_Primary_sp_View))&&
  (!config.frontage||x.General_sp_Description_co_Primary_sp_View==='Oceanfront')
 ).map(x=>({key:x.ListingKey,mls:x.ListingId,kind:x.PropertyType,area:x.City,...collectionLocation(x),
  name:x.InternetAddressDisplayYN===false?'Propiedad · dirección a solicitud':x.UnparsedAddress||x.SubdivisionName||'Detalles de la propiedad',
  community:x.InternetAddressDisplayYN===false?'Dirección a solicitud':x.SubdivisionName||'Desarrollo a solicitud',
  price:Number.isFinite(x.ListPrice)&&x.ListPrice>0?x.ListPrice:null,beds:x.BedroomsTotal,baths:x.BathroomsTotalDecimal??x.BathroomsFull,
  lotM2:Number.isFinite(x.General_sp_Description_co_Lot_sp_M2)&&x.General_sp_Description_co_Lot_sp_M2>0?x.General_sp_Description_co_Lot_sp_M2:null,
  view:x.General_sp_Description_co_Primary_sp_View==='Select One'?'':x.General_sp_Description_co_Primary_sp_View||'',office:x.ListOfficeName||'',golf:golfIds(x)}));
}
export function filterRows(rows,{kind='',golf='',price='all',beds='0',size='0',view='',sort='price-desc',...location}={}){
 const range=price==='all'?null:price.split('-').map(Number);
 return sortByPrice(rows.filter(x=>(!kind||x.kind===kind)&&(!golf||x.golf.includes(golf))&&(!range||(x.price!==null&&x.price>=range[0]&&x.price<range[1]))&&
  (!Number(beds)||(x.kind!=='Land'&&x.beds!=null&&x.beds>=Number(beds)))&&(!Number(size)||(x.lotM2!==null&&x.lotM2>=Number(size)))&&(!view||x.view===view)&&matchesCollectionLocation(x,location)),sort);
}
export function requestPayload(form,config){return {name:String(form.get('name')||'').trim(),email:String(form.get('email')||'').trim(),phone:'',inquiryType:'buying',
 propertyType:config.types?.length===1?({Condos:'condo',Houses:'house',Land:'land'}[config.types[0]]):'',preferredAgent:'Don Weis',agentEmail:'don@bircabo.com',website:String(form.get('website')||''),
 message:`${config.title}\nSource: https://www.bircabo.com/${config.path}\nBudget (USD): ${form.get('budget')||'Not specified'}\nBuying timeframe: ${form.get('timing')||'Not specified'}\n\n${String(form.get('message')||'').trim()}`};}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>n==null?'Precio a solicitud':new Intl.NumberFormat('es-MX',{style:'currency',currency:'USD',currencyDisplay:'narrowSymbol',maximumFractionDigits:0}).format(n)+' USD';
if(typeof document!=='undefined'&&document.getElementById('bir-page-config')){
 const config=JSON.parse(document.getElementById('bir-page-config').textContent),grid=document.getElementById('ov-grid'),status=document.getElementById('ov-status'),more=document.getElementById('ov-more'),empty=document.getElementById('ov-empty'),form=document.getElementById('ov-filters');
 const simpleListings=config.simpleListings===true;
 if(!simpleListings)setupPriceSort(status,document.getElementById('ov-sort'));
 const details=setupPropertyDetails({completedOnly:true,returnLabel:'Volver a tus resultados'}),photos=new Map();let rows=[],limit=12,busy=false,expiry,version=0,checked='';
 const controls=[...COLLECTION_LOCATION_FIELDS,['kind','ov-kind',''],['golf','ov-golf',''],['price','ov-price','all'],['beds','ov-beds','0'],['size','ov-size','0'],['view','ov-view',''],['sort','ov-sort',simpleListings?'price-asc':'price-desc']];
 const choices=()=>Object.fromEntries(controls.map(([key,id,fallback])=>[key,simpleListings?fallback:document.getElementById(id).value]));
 const locationRows=()=>rows.filter(x=>(!document.getElementById('ov-kind').value||x.kind===document.getElementById('ov-kind').value)&&(!document.getElementById('ov-golf').value||x.golf.includes(document.getElementById('ov-golf').value)));
 const locations=setupCollectionLocations(locationRows);
 function dependencies(){const land=document.getElementById('ov-kind').value==='Land'||config.types?.join()==='Land';document.getElementById('ov-beds').disabled=land;if(land)document.getElementById('ov-beds').value='0';}
 const card=x=>`<article class="ov-card" data-mls="${esc(x.mls)}"><a class="ov-image-link" href="${esc(propertyDetailsHref(x.mls))}" data-property-details="${esc(x.mls)}" aria-label="Fotos y detalles de ${esc(x.name)}">${photos.has(x.key)?`<img src="${esc(photos.get(x.key))}" alt="${esc(x.name)} — foto de la propiedad" width="600" height="400" loading="lazy">`:'<span>Cargando foto de la propiedad…</span>'}</a><div class="ov-card-body"><span class="ov-badge">${x.kind==='Land'?'Terreno':x.kind==='Condos'?'Departamento terminado':'Casa terminada'}${x.view?' · '+esc(viewLabel(x.view)):''}</span><p class="ov-price">${money(x.price)}</p><h3><a href="${esc(propertyDetailsHref(x.mls))}" data-property-details="${esc(x.mls)}">${esc(x.name)}</a></h3><p>${x.kind==='Land'?(x.lotM2?Number(x.lotM2).toLocaleString('es-MX')+' m² de terreno':'Superficie a solicitud'):(x.beds==null?'Recámaras a solicitud':esc(x.beds)+' recámaras')+' · '+(x.baths==null?'Baños a solicitud':esc(x.baths)+' baños')}</p><p>${esc(x.area)} · ${esc(x.community)}</p><p class="ov-office">Inmobiliaria anunciante: ${esc(x.office||'Participante de MLS BCS')}</p><div class="ov-card-foot"><span>MLS ${esc(x.mls)}</span><a href="${esc(propertyDetailsHref(x.mls))}" data-property-details="${esc(x.mls)}">Fotos y detalles →</a></div></div></article>`;
 async function loadPhotos(visible,stamp){const missing=visible.filter(x=>!photos.has(x.key));for(let i=0;i<missing.length;i+=24){try{
  const requested=new Set(missing.slice(i,i+24).map(x=>x.key)),response=await fetch('/api/search-pilot?keys='+encodeURIComponent([...requested].join(',')),{signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error();const data=await response.json();
  for(const x of data.results||[]){if(!requested.has(x.ListingKey)||x.StandardStatus!=='Active'||x.InternetEntireListingDisplayYN===false||!['Condos','Houses','Land'].includes(x.PropertyType)||(x.PropertyType!=='Land'&&x.General_sp_Description_co_Construction!=='Completed'))continue;const src=x.Media?.[0]?.MediaURL;if(typeof src==='string'&&src.startsWith('https://'))photos.set(x.ListingKey,src);}
 }catch{/* Details and contact remain available if a photo service is unavailable. */}}
 if(stamp!==version)return;for(const row of visible){const container=[...grid.querySelectorAll('[data-mls]')].find(x=>x.dataset.mls===row.mls)?.querySelector('.ov-image-link');if(!container)continue;const src=photos.get(row.key);if(src&&!container.querySelector('img')){const img=document.createElement('img');img.src=src;img.alt=row.name+' — foto de la propiedad';img.width=600;img.height=400;img.loading='lazy';container.replaceChildren(img);}else if(!src){const span=container.querySelector('span');if(span)span.textContent='Ver fotos y detalles';}}}
 function render(){if(!simpleListings)rememberCollectionFilters(controls);const selected=filterRows(rows,choices()),visible=selected.slice(0,limit),stamp=++version;grid.innerHTML=visible.map(card).join('');more.hidden=selected.length<=limit;more.textContent=`Ver ${Math.min(12,Math.max(0,selected.length-limit))} propiedades más`;empty.hidden=selected.length!==0;
 status.innerHTML=simpleListings?`<span class="ov-checked">Disponibilidad consultada: ${esc(checked)}.</span>`:`<span>${selected.length} ${selected.length===1?'propiedad encontrada':'propiedades encontradas'} · Mostrando ${visible.length}</span>${priceSortButton(choices().sort)}<span class="ov-checked">Disponibilidad consultada: ${esc(checked)}.</span>`;details.update(rows);void loadPhotos(visible,stamp);}
 function clear(message){rows=[];version++;grid.replaceChildren();more.hidden=true;empty.hidden=true;status.textContent=message;details.update([]);}
 async function refresh(){
  if(busy)return;busy=true;
  try{
   const started=performance.now();
   const response=await fetch('/api/search-pilot?mode=snapshot',{signal:AbortSignal.timeout(25000)});
   if(!response.ok)throw Error();
   const data=await response.json(),serverNow=snapshotResponseTime(response.headers,performance.now()-started);
   rows=currentRows(data,config,serverNow);
   const inventoryAge=serverNow-Date.parse(data.fetchedAt);
   locations.refresh();
   checked=new Date(data.fetchedAt).toLocaleString('es-MX',{timeZone:'America/Mazatlan',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})+' (hora de Cabo)';
   if(inventoryAge>=300000)checked+=' (actualización demorada; confirma con Don)';
   render();clearTimeout(expiry);
   expiry=setTimeout(()=>clear('Esta consulta de disponibilidad venció. Recarga la página o pide información actualizada a Don.'),Math.max(0,3600000-inventoryAge));
  }catch{clear('No podemos confirmar la disponibilidad en este momento. Recarga la página, pide opciones a Don o utiliza la búsqueda completa del MLS.');}
  finally{busy=false;}
 }
 if(!simpleListings)restoreCollectionFilters(controls);dependencies();form.addEventListener('submit',e=>e.preventDefault());form.addEventListener('change',event=>{dependencies();if(['ov-kind','ov-golf'].includes(event.target.id)){locations.reset();}else locations.change(event.target);limit=12;render();});form.addEventListener('reset',()=>setTimeout(()=>{dependencies();locations.reset();limit=12;render();},0));more.addEventListener('click',()=>{limit+=12;render();});void refresh();setInterval(()=>{if(!document.hidden)void refresh();},300000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)void refresh();});
 const lead=document.getElementById('property-shortlist'),button=lead.querySelector('button[type="submit"]'),message=lead.querySelector('.buyer-form-status');
 lead.addEventListener('submit',async event=>{event.preventDefault();if(button.disabled)return;const payload=requestPayload(new FormData(lead),config);button.disabled=true;button.textContent='Enviando…';message.textContent='';try{const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(25000)}),data=await response.json();if(!response.ok||data.success!==true)throw Error();document.dispatchEvent(new CustomEvent('bir-lead-result',{detail:{form:'general_contact',outcome:'success'}}));message.textContent='Gracias. Tu solicitud fue enviada a Don en Baja International Realty.';button.textContent='Solicitud enviada';lead.reset();}catch{document.dispatchEvent(new CustomEvent('bir-lead-result',{detail:{form:'general_contact',outcome:'error'}}));message.replaceChildren(document.createTextNode('No pudimos confirmar el envío. Tu solicitud sigue aquí. '));const email=document.createElement('a');email.href='mailto:don@bircabo.com?subject='+encodeURIComponent(config.title)+'&body='+encodeURIComponent(payload.message);email.textContent='Enviar por correo a Don';message.append(email);button.disabled=false;button.textContent='Volver a intentar';}});
}
