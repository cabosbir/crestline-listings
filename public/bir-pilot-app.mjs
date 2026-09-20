import {defaults, locationFields, changeLocation, locationOptions, filterListings, coordinates} from './bir-pilot-search.mjs';
import {loadInventory,loadGroupedInventory} from './bir-pilot-inventory.mjs';
const $ = id => document.getElementById(id);
document.querySelector('.intro').textContent='Start with a zone, then narrow your search by area, community and subdivision. Each choice narrows the options below it. If you already know the subdivision you want, select it directly.';
document.querySelector('.steps').remove();
for(const key of locationFields)document.querySelector(`label[for="${key}"]`).textContent=document.querySelector(`label[for="${key}"]`).textContent.replace(/^\d+\.\s*/, '');
$('MLSAreaMajor').nextElementSibling.textContent='Choose any area, or select a zone to narrow the list.';
$('SubdivisionName').nextElementSibling.textContent='Know the subdivision? Choose it directly. No other location is required.';
if(new URLSearchParams(location.search).get('check-email')==='1'){
 const check=document.createElement('p');check.id='email-connection-check';check.setAttribute('role','status');check.style.cssText='padding:20px;background:#fff3cd';check.textContent='Checking the email connection without sending a message...';document.querySelector('.notice').after(check);
 fetch('/api/search-pilot?mode=email-check',{}).then(async response=>{if(!response.ok)throw new Error('Connection check unavailable');return response.json();}).then(result=>{check.textContent=`${result.message} Connection status: ${result.status}`;}).catch(()=>{check.textContent='The connection check could not finish.';});
}
let filters=defaults(),rows=[],matches=[],shown=24,map,layer;
let ready=false,failed=false,detailVersion=0;
const detailsCache=new Map();
const galleryCache=new Map(),galleryRequests=new Map(),photoPositions=new Map();
const style=document.createElement('style');
style.textContent='.leaflet-tooltip.cluster-number{background:transparent;border:0;box-shadow:none;color:#fff;font-weight:700;font-size:12px}.leaflet-tooltip.cluster-number:before{display:none}.photo-placeholder{height:180px;background:#e5ece7;display:grid;place-items:center;color:#44605e;font-size:14px}.page-info{align-self:center;font-size:14px}#inquiry textarea{min-height:100px;width:100%;padding:10px;border:1px solid #b9cbc6;font:inherit}#inquiry .contact-options{display:flex;gap:15px;flex-wrap:wrap;margin:16px 0}@media(max-width:760px){#cards{grid-template-columns:1fr}.bar{flex-wrap:wrap;gap:10px}.layout aside{padding:18px}#inquiry{max-height:90vh;overflow:auto}.steps{flex-wrap:wrap}}';
document.head.append(style);
style.textContent+='.photo-viewer{position:relative;background:#e5ece7}.photo-viewer .photo{display:block;cursor:zoom-in;margin:0}.photo-arrow{position:absolute;top:72px;padding:4px 12px;background:#ffffffed;color:#183d49;font-size:26px;border:0;box-shadow:0 1px 5px #0004}.photo-prev{left:8px}.photo-next{right:8px}.photo-caption{margin:0;padding:6px 10px;font-size:12px;background:#fff}.photo-count{position:absolute;right:8px;bottom:36px;background:#183d49e8;color:white;border:0;padding:4px 8px;font-size:12px}.listing-title{border:0;padding:0;text-align:left;font:inherit;color:inherit;background:none;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:4px}.listing-title:hover{background:none;color:#12666a}#listing-gallery{width:96vw;max-width:1200px;max-height:94vh;padding:20px}#listing-gallery .gallery-heading{display:flex;justify-content:space-between;align-items:start;gap:18px}#listing-gallery .photo{width:100%;height:65vh;object-fit:contain;cursor:default;background:#142b31}#listing-gallery .photo-arrow{top:45%}.photo-thumbnails{display:flex;overflow-x:auto;gap:8px;padding:10px;background:white}.photo-thumbnails button{padding:2px;flex:none;border:2px solid transparent}.photo-thumbnails button[aria-current=true]{border-color:#12666a}.photo-thumbnails img{width:85px;height:60px;object-fit:cover;display:block}.gallery-facts{line-height:1.6}.photo-viewer button:disabled{opacity:.5;cursor:wait}@media(max-width:760px){#listing-gallery{width:98vw;padding:12px}#listing-gallery .photo{height:48vh}.gallery-heading h2{font-size:20px}}';
async function fetchGallery(p){
 if(galleryCache.has(p.ListingKey))return galleryCache.get(p.ListingKey);
 if(!galleryRequests.has(p.ListingKey))galleryRequests.set(p.ListingKey,(async()=>{
  const response=await fetch('/api/search-pilot?mode=gallery&keys='+encodeURIComponent(p.ListingKey),{});
  if(!response.ok)throw new Error('Photos could not load. Please try again.');
  const data=await response.json(),listing=data.results?.find(row=>row.ListingKey===p.ListingKey);
  if(!listing||!Array.isArray(listing.Media))throw new Error('This listing is unavailable. Reload the search for current availability.');
  galleryCache.set(p.ListingKey,listing);return listing;
 })().finally(()=>galleryRequests.delete(p.ListingKey)));
 return galleryRequests.get(p.ListingKey);
}
function photoViewer(p,large=false){
 const box=document.createElement('div');box.className='photo-viewer';box.setAttribute('aria-label','Property photos');
 const image=document.createElement('img');image.className='photo';image.loading='lazy';image.alt=p.UnparsedAddress||'Property';
 const prev=document.createElement('button'),next=document.createElement('button'),count=document.createElement('button'),caption=document.createElement('p');
 prev.className='photo-arrow photo-prev';prev.textContent='‹';prev.setAttribute('aria-label','Previous photo');next.className='photo-arrow photo-next';next.textContent='›';next.setAttribute('aria-label','Next photo');count.className='photo-count';caption.className='photo-caption';caption.setAttribute('role','status');
 const thumbs=document.createElement('div');thumbs.className='photo-thumbnails';
 let full=galleryCache.get(p.ListingKey),photos=full?.Media||p.Media||[],position=photoPositions.get(p.ListingKey)||0,busy=false;
 function draw(){
  position=photos.length?((position%photos.length)+photos.length)%photos.length:0;
  if(photos.length){image.src=photos[position].MediaURL;image.hidden=false;image.alt=`${p.UnparsedAddress||'Property'} - photo ${position+1}`;}else{image.removeAttribute('src');image.hidden=true;}
  count.textContent=full?(photos.length?`${position+1} / ${photos.length}`:'No photos'):'View all photos';
  caption.textContent=photos[position]?.caption||(full?'':'Use arrows to browse photos');
  prev.disabled=next.disabled=busy||(!!full&&photos.length<2);photoPositions.set(p.ListingKey,position);
  if(large&&full){if(thumbs.childElementCount!==photos.length){thumbs.replaceChildren();photos.forEach((photo,index)=>{const button=document.createElement('button');button.type='button';button.setAttribute('aria-label',`Show photo ${index+1}`);const thumb=document.createElement('img');thumb.src=photo.MediaURL;thumb.alt='';thumb.loading='lazy';button.append(thumb);button.onclick=()=>{position=index;draw();};thumbs.append(button);});}Array.from(thumbs.children).forEach((button,index)=>button.setAttribute('aria-current',String(position===index)));}
 }
 async function move(delta){
  if(busy)return;busy=true;prev.disabled=next.disabled=true;
  try{if(!full){caption.textContent='Loading all photos...';full=await fetchGallery(p);photos=full.Media;}position+=delta;draw();}
  catch(error){caption.textContent=error.message;}
  finally{busy=false;prev.disabled=next.disabled=!!full&&photos.length<2;}
 }
 prev.onclick=()=>move(-1);next.onclick=()=>move(1);count.onclick=()=>large?move(0):openListing(p);
 if(!large){image.tabIndex=0;image.setAttribute('role','button');image.setAttribute('aria-label','Open full property gallery');image.onclick=()=>openListing(p);image.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();openListing(p);}};}
 box.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();move(event.key==='ArrowLeft'?-1:1);}});
 let touchX;box.addEventListener('touchstart',event=>{touchX=event.touches[0]?.clientX;},{passive:true});box.addEventListener('touchend',event=>{const end=event.changedTouches[0]?.clientX;if(touchX!=null&&end!=null&&Math.abs(end-touchX)>50)move(end<touchX?1:-1);touchX=null;},{passive:true});
 image.onerror=()=>{caption.textContent='This photo could not load. Try the next photo.';};
 box.append(image,prev,next,count,caption);if(large)box.append(thumbs);draw();if(large&&!full)move(0);return box;
}
// Saved choices contain identifiers only, never cached listing descriptions or photos.
const savedKey='bir-saved-properties-v1';
let savedProperties=[];
try{const value=JSON.parse(localStorage.getItem(savedKey)||'[]');if(Array.isArray(value))savedProperties=value.filter(p=>p&&typeof p.key==='string'&&/^\d{1,40}$/.test(p.key)&&typeof p.mls==='string').slice(0,500);}catch{}
const savedBar=document.createElement('div');savedBar.className='saved-bar';
const savedOpen=document.createElement('button');savedOpen.type='button';
const savedNote=document.createElement('p');savedNote.textContent='Save favorites without signing up. Saved on this browser only; clearing browser data removes them.';
const savedStatus=document.createElement('p');savedStatus.setAttribute('role','status');savedStatus.className='saved-status';
savedBar.append(savedOpen,savedNote,savedStatus);document.querySelector('.notice').after(savedBar);
const savedDialog=document.createElement('dialog');savedDialog.className='saved-dialog';savedDialog.setAttribute('aria-label','Saved properties');document.body.append(savedDialog);
function refreshSaveButtons(){
 savedOpen.textContent=`\u2665 Saved properties (${savedProperties.length})`;
 document.querySelectorAll('button[data-save-key]').forEach(button=>{const selected=savedProperties.some(p=>p.key===button.dataset.saveKey);button.textContent=selected?'\u2665 Saved':'\u2661 Save property';button.setAttribute('aria-pressed',String(selected));});
}
function toggleSaved(p){
 const key=String(p.ListingKey),selected=savedProperties.some(item=>item.key===key);
 if(!selected&&savedProperties.length>=500){savedStatus.textContent='Your saved list is full. Remove a property before adding another.';return;}
 const next=selected?savedProperties.filter(item=>item.key!==key):[...savedProperties,{key,mls:String(p.ListingId||'')}];
 try{localStorage.setItem(savedKey,JSON.stringify(next));}catch{savedStatus.textContent='This browser could not save your change. Please allow site storage and try again.';return;}
 savedProperties=next;refreshSaveButtons();savedStatus.textContent=selected?'Property removed from your saved list.':'Property saved on this browser. No signup or marketing emails.';
 if(savedDialog.open)renderSaved();
}
function saveButton(p){const button=document.createElement('button');button.type='button';button.className='save-property';button.dataset.saveKey=String(p.ListingKey);const selected=savedProperties.some(item=>item.key===String(p.ListingKey));button.textContent=selected?'\u2665 Saved':'\u2661 Save property';button.setAttribute('aria-pressed',String(selected));button.onclick=()=>toggleSaved(p);return button;}
function renderSaved(){
 savedDialog.replaceChildren();const heading=document.createElement('div');heading.className='saved-heading';const title=document.createElement('h2');title.textContent=`Saved properties (${savedProperties.length})`;const close=document.createElement('button');close.textContent='Back to search';close.onclick=()=>savedDialog.close();heading.append(title,close);savedDialog.append(heading);
 const note=document.createElement('p');note.textContent='Your saved list is independent of your search filters. Saved on this browser only.';savedDialog.append(note);
 if(!savedProperties.length){const empty=document.createElement('p');empty.textContent='No saved properties yet. Tap the heart on any property to keep it here.';savedDialog.append(empty);return;}
 for(const saved of savedProperties){
  const row=rows.find(p=>String(p.ListingKey)===saved.key),card=document.createElement('article');card.className='saved-item';
  if(row){const title=document.createElement('h3');title.textContent=row.UnparsedAddress||'Property';const facts=document.createElement('p');facts.textContent=`${money(row.ListPrice)} · ${row.PropertyType} · MLS ${row.ListingId}`;const open=document.createElement('button');open.textContent='View property';open.onclick=()=>{savedDialog.close();openListing({...row,...detailsCache.get(row.ListingKey)});};card.append(title,facts,open);}
  else{const text=document.createElement('p');text.textContent=ready?`MLS ${saved.mls}: no longer in the current public search. Contact Don to check its status.`:`MLS ${saved.mls}: current availability has not loaded yet.`;card.append(text);}
  const remove=document.createElement('button');remove.textContent='Remove from saved';remove.onclick=()=>toggleSaved({ListingKey:saved.key,ListingId:saved.mls});card.append(remove);savedDialog.append(card);
 }
}
savedOpen.onclick=()=>{renderSaved();savedDialog.showModal();};refreshSaveButtons();
window.addEventListener('storage',event=>{if(event.key!==savedKey&&event.key!==null)return;try{const value=JSON.parse(event.newValue||'[]');if(!Array.isArray(value))return;savedProperties=value.filter(p=>p&&typeof p.key==='string'&&/^\d{1,40}$/.test(p.key)&&typeof p.mls==='string').slice(0,500);refreshSaveButtons();if(savedDialog.open)renderSaved();}catch{}});
style.textContent+='.saved-bar{padding:14px 24px;border-bottom:1px solid #d4dfdc;background:#f1f6f3}.saved-bar p{margin:7px 0;font-size:13px}.saved-status:empty{display:none}.save-property{margin:8px 8px 8px 0;color:#12666a}.save-property[aria-pressed=true]{background:#12666a;color:white}.saved-dialog{width:92vw;max-width:850px;max-height:90vh;overflow:auto;padding:24px;border:1px solid #c5d4ce;border-radius:12px}.saved-heading{display:flex;align-items:center;justify-content:space-between;gap:12px}.saved-item{padding:16px 0;border-top:1px solid #d4dfdc}.saved-item button{margin-right:12px}.saved-item h3{margin:6px 0}@media(max-width:760px){.saved-dialog{padding:14px}.saved-heading{align-items:start}.saved-heading h2{font-size:21px}}';

const listingDialog=document.createElement('dialog');listingDialog.id='listing-gallery';document.body.append(listingDialog);
function openListing(p,fromMap=false){
 if(listingDialog.open)listingDialog.close();
 listingDialog.classList.toggle('map-listing',fromMap);
 listingDialog.setAttribute('aria-label','Property details');
 const heading=document.createElement('div');heading.className='gallery-heading';const title=document.createElement('h2');title.textContent=p.UnparsedAddress||'Property';const back=document.createElement('button');back.textContent=fromMap?'Back to map':'Back to results';back.onclick=()=>listingDialog.close();heading.append(title,back);
 if(fromMap){const expand=document.createElement('button');expand.textContent='Expand listing';expand.onclick=()=>openListing(p);heading.append(expand);}
 const facts=document.createElement('p');facts.className='gallery-facts';facts.textContent=`${money(p.ListPrice)} · ${p.PropertyType} · ${p.BedroomsTotal??'-'} bedrooms · ${p.BathroomsTotalDecimal??p.BathroomsFull??'-'} baths · MLS ${p.ListingId}`;
 const remarks=document.createElement('p');remarks.textContent=p.PublicRemarks||'Loading property description...';
 const details=document.createElement('section');details.className='property-details';details.textContent='Loading property details...';
 const inquireButton=document.createElement('button');inquireButton.textContent='Ask about this property';inquireButton.onclick=()=>inquire(p);
 listingDialog.replaceChildren(heading,facts,saveButton(p),photoViewer(p,true),remarks,details,inquireButton);if(fromMap&&!window.matchMedia('(max-width:760px)').matches)listingDialog.show();else listingDialog.showModal();
 fetchGallery(p).then(row=>{remarks.textContent=row.PublicRemarks||'No description supplied.';renderPropertyDetails(details,row.PropertyDetails);}).catch(error=>{remarks.textContent=error.message;details.textContent='Property details could not load. Close and reopen this property to retry.';});
}


function renderPropertyDetails(target,groups){
 target.replaceChildren();
 const title=document.createElement('h3');title.textContent='Property details';target.append(title);
 if(!Array.isArray(groups)||!groups.length){const note=document.createElement('p');note.textContent='Additional details have not been supplied in the public listing feed.';target.append(note);return;}
 for(const group of groups){
  const section=document.createElement('section'),heading=document.createElement('h4'),list=document.createElement('dl');heading.textContent=group.heading;
  for(const item of group.items){const label=document.createElement('dt'),value=document.createElement('dd');if(item.value==='Select One')continue;label.textContent=({AC:'Air-conditioned', 'AC M2':'Indoor area (m²)','AC SqFt':'Indoor area (sq ft)','Lot M2':'Lot size (m²)','Total M2':'Total area (m²)','Mstr Plan Community':'Master-planned community','Dues Amount2':'HOA dues','Dues Period2':'Payment period'})[item.label]||item.label;value.textContent=typeof item.value==='number'&&!/year/i.test(item.label)?item.value.toLocaleString('en-US'):String(item.value);list.append(label,value);}
  section.append(heading,list);target.append(section);
 }
}
style.textContent+='.property-details{margin:24px 0}.property-details section{border-top:1px solid #d4dfdc;padding:10px 0}.property-details h4{margin:8px 0}.property-details dl{display:grid;grid-template-columns:minmax(120px,1fr) 2fr;gap:8px 20px;margin:12px 0}.property-details dt{font-weight:600}.property-details dd{margin:0;overflow-wrap:anywhere}';

const mapWrap=document.createElement('div');mapWrap.className='map-workspace';$('map').before(mapWrap);mapWrap.append($('map'),listingDialog);
listingDialog.addEventListener('keydown',event=>{if(event.key==='Escape'&&listingDialog.classList.contains('map-listing'))listingDialog.close();});
style.textContent+=`.map-workspace{position:relative}#map{height:620px;max-height:75vh}.price-marker{background:none;border:0}.map-price{display:block;white-space:nowrap;text-align:center;background:#fff;color:#123e4b;border:1px solid #537874;border-radius:6px;padding:5px 7px;font-size:12px;font-weight:750;box-shadow:0 2px 5px #0003}.price-marker:hover .map-price,.price-marker:focus .map-price{background:#12666a;color:#fff;border-color:#fff}.map-property-choices{max-height:260px;overflow:auto}.map-property-choices button{display:block;width:100%;margin-top:8px;text-align:left;font-size:13px}#listing-gallery.map-listing{position:absolute;inset:10px auto 10px 10px;margin:0;width:43%;min-width:310px;max-width:480px;max-height:calc(100% - 20px);padding:16px;z-index:500;overflow:auto;box-shadow:0 5px 24px #0004}#listing-gallery.map-listing .gallery-heading{flex-wrap:wrap;gap:8px}#listing-gallery.map-listing h2{font-size:21px;margin:0;width:100%}#listing-gallery.map-listing .photo{height:240px}#listing-gallery.map-listing .gallery-facts{font-size:14px}#listing-gallery.map-listing .gallery-heading{position:sticky;top:-16px;background:white;z-index:3;padding:12px 0}.photo-count{top:10px;bottom:auto}.map-listing .photo-thumbnails img{width:65px;height:48px}@media(max-width:760px){#map{height:480px;max-height:70vh}#listing-gallery.map-listing{position:fixed;inset:0;width:100%;min-width:0;max-width:none;max-height:100dvh;height:100dvh;border-radius:0;z-index:1500}#listing-gallery.map-listing .photo{height:42vh}}`;

const filterToggle=document.createElement('button');filterToggle.className='mobile-filter-toggle';filterToggle.textContent='Show search filters';filterToggle.setAttribute('aria-expanded','false');filterToggle.setAttribute('aria-controls','filters');$('filters').before(filterToggle);
filterToggle.onclick=()=>{const open=document.querySelector('aside').classList.toggle('filters-open');filterToggle.textContent=open?'Hide search filters':'Show search filters';filterToggle.setAttribute('aria-expanded',String(open));};
style.textContent+='.mobile-filter-toggle{display:none}@media(max-width:760px){.mobile-filter-toggle{display:block;margin:10px 0}aside:not(.filters-open) #filters,aside:not(.filters-open) .steps,aside:not(.filters-open) .fine{display:none}.intro{margin-bottom:8px}}';
const previous=document.createElement('button');previous.textContent='Previous';previous.hidden=true;$('more').before(previous);
const pageInfo=document.createElement('span');pageInfo.className='page-info';$('more').after(pageInfo);
previous.onclick=()=>{shown=Math.max(24,shown-24);renderCards();$('cards').scrollIntoView({block:'start'});};
const inquiryNote=$('inquiry').querySelector('p:not(#property-context)');
inquiryNote.textContent='Send Don your question. The property and MLS number are included automatically.';
const inquiryForm=document.createElement('form');inquiryForm.id='inquiry-form';$('email').before(inquiryForm);
style.textContent+='#inquiry{max-height:90vh;overflow:auto}';
for(const [id,label,type,required,max] of [['contact-name','Your name','text',true,100],['contact-email','Your email','email',true,254],['contact-phone','Phone (optional)','tel',false,50]]){
 const l=document.createElement('label');l.htmlFor=id;l.textContent=label;
 const input=document.createElement('input');input.id=id;input.type=type;input.required=required;input.maxLength=max;input.autocomplete=type==='text'?'name':type;inquiryForm.append(l,input);
}
const questionLabel=document.createElement('label');questionLabel.htmlFor='inquiry-question';questionLabel.textContent='What would you like to know?';
const question=document.createElement('textarea');question.id='inquiry-question';question.placeholder='Availability, a showing, financing, or another question...';
question.required=true;question.maxLength=3000;inquiryForm.append(questionLabel,question);
const trap=document.createElement('input');trap.name='website';trap.tabIndex=-1;trap.autocomplete='off';trap.setAttribute('aria-hidden','true');trap.style.cssText='position:absolute;left:-10000px';inquiryForm.append(trap);
const sendButton=document.createElement('button');sendButton.type='submit';sendButton.textContent='Send inquiry';sendButton.style.marginTop='16px';inquiryForm.append(sendButton);
const inquiryStatus=document.createElement('p');inquiryStatus.setAttribute('role','status');inquiryForm.append(inquiryStatus);
$('email').textContent='Or email Don';
inquiryForm.onsubmit=async event=>{
 event.preventDefault();if(!selectedProperty||sendButton.disabled)return;
 sendButton.disabled=true;$('close').disabled=true;sendButton.textContent='Sending...';inquiryStatus.textContent='';
 try{
  const response=await fetch('/api/search-pilot',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:$('contact-name').value,email:$('contact-email').value,phone:$('contact-phone').value,message:question.value,website:trap.value,listingId:String(selectedProperty.ListingId),address:selectedProperty.UnparsedAddress||''})});
  const result=await response.json();if(!response.ok||!result.success)throw new Error(result.error||'We could not confirm your inquiry was sent. Please use the email or call link.');
  inquiryStatus.textContent='Thank you. Your inquiry has been submitted to Don.';sendButton.textContent='Inquiry submitted';
 }catch(error){inquiryStatus.textContent=error.message||'Unable to confirm delivery. Please use the email or call link.';sendButton.disabled=false;sendButton.textContent='Send inquiry';}
 finally{$('close').disabled=false;}
};
$('inquiry').addEventListener('cancel',event=>{if($('close').disabled)event.preventDefault();});
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
  $(key).disabled=false;
 }
 document.querySelectorAll('.step').forEach((el,index)=>el.classList.toggle('active',index===0 || filters[locationFields[index-1]]));
}
function mapPrice(value){
 if(value==null||!Number.isFinite(Number(value)))return 'Ask price';
 const n=Number(value);return n>=1000000?'$'+Number((n/1000000).toFixed(2))+'M':n>=1000?'$'+Number((n/1000).toFixed(1))+'K':money(n);
}
function fitLocationMap(){
 if(!map)return;
 const points=matches.filter(coordinates).map(p=>[p.Latitude,p.Longitude]);
 if(points.length)map.fitBounds(points,{padding:[45,45],maxZoom:16});
}
function renderMap(){
 if(!map)return;
 layer.clearLayers();const mapped=matches.filter(coordinates),groups=new Map();
 for(const p of mapped){const point=map.project([p.Latitude,p.Longitude],map.getZoom());const key=`${Math.floor(point.x/75)}:${Math.floor(point.y/42)}`;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(p);}
 for(const group of groups.values()){
  const lat=group.reduce((n,p)=>n+p.Latitude,0)/group.length,lng=group.reduce((n,p)=>n+p.Longitude,0)/group.length;
  const label=document.createElement('span');label.className='map-price';label.textContent=group.length===1?mapPrice(group[0].ListPrice):group.length+' listings';
  const title=group.length===1?`${money(group[0].ListPrice)} · ${group[0].UnparsedAddress} · MLS ${group[0].ListingId}`:`${group.length} properties. Click to explore.`;
  const marker=L.marker([lat,lng],{icon:L.divIcon({html:label,className:'price-marker',iconSize:[76,30],iconAnchor:[38,30]}),title,keyboard:true}).addTo(layer);
  marker.on('click',()=>{
   if(group.length===1){openListing({...group[0],...detailsCache.get(group[0].ListingKey)},true);return;}
   if(map.getZoom()<18){map.setView([lat,lng],Math.min(map.getZoom()+2,19));return;}
   const box=document.createElement('div');box.className='map-property-choices';
   const heading=document.createElement('strong');heading.textContent=`${group.length} properties at this location`;box.append(heading);
   for(const p of group){const button=document.createElement('button');button.textContent=`${money(p.ListPrice)} · ${p.UnparsedAddress} · MLS ${p.ListingId}`;button.onclick=()=>{map.closePopup();openListing({...p,...detailsCache.get(p.ListingKey)},true);};box.append(button);}
   L.popup({maxWidth:300,closeOnClick:false}).setLatLng([lat,lng]).setContent(box).openOn(map);
  });
 }
 $('mapnote').textContent=`${mapped.length.toLocaleString()} of ${matches.length.toLocaleString()} matches have map coordinates. Click a price to explore a property. Groups zoom in; overlapping properties remain individually selectable.`;
}

function inquire(p){selectedProperty=p;question.value='';inquiryStatus.textContent='';sendButton.disabled=false;sendButton.textContent='Send inquiry';$('property-context').textContent=`${p.UnparsedAddress} · MLS ${p.ListingId} · ${money(p.ListPrice)}`;updateInquiry();$('inquiry').showModal();$('contact-name').focus();}
function renderCards(loadDetails=true){
 const version=++detailVersion,visible=matches.slice(shown-24,shown);
 $('cards').replaceChildren();
 for(const original of visible){
  const cached=detailsCache.get(original.ListingKey),p={...original,...cached};
  const card=document.createElement('article');card.className='card';
  const url=p.Media?.[0]?.MediaURL;
  if(url && /^https:\/\//.test(url)){card.append(photoViewer(p));}
  else{const placeholder=document.createElement('div');placeholder.className='photo-placeholder';placeholder.textContent=cached?'Photo not available':'Loading photo...';card.append(placeholder);}
  const content=document.createElement('div');content.className='content';content.append(saveButton(p));
  for(const [tag,text,cls] of [['div',money(p.ListPrice),'price'],['h2',p.UnparsedAddress||'Property',''],['p',[p.SubdivisionName,p.Address_co_Community2,p.City].filter(Boolean).join(' · '),'meta'],['p',`${p.PropertyType} · ${p.BedroomsTotal ?? '-'} bedrooms · ${p.BathroomsTotalDecimal ?? p.BathroomsFull ?? '-'} baths`,'meta'],['p',p.General_sp_Description_co_AC_sp_SqFt != null ? `${Number(p.General_sp_Description_co_AC_sp_SqFt).toLocaleString()} indoor sq ft` : 'Indoor area not supplied','meta'],['p',`MLS ${p.ListingId}`,'meta']]){const el=document.createElement(tag);el.textContent=text;el.className=cls;content.append(el);}
  const title=content.querySelector('h2'),titleButton=document.createElement('button');titleButton.className='listing-title';titleButton.textContent=title.textContent;titleButton.onclick=()=>openListing(p);title.replaceChildren(titleButton);
  const detail=document.createElement('details'),summary=document.createElement('summary'),remarks=document.createElement('p');summary.textContent='Property description';remarks.textContent=p.PublicRemarks||(cached?'No description supplied.':'Loading description...');remarks.className='meta';detail.append(summary,remarks);content.append(detail);
  const button=document.createElement('button');button.className='inquiry';button.textContent='Ask about this property';button.onclick=()=>inquire(p);content.append(button);card.append(content);$('cards').append(card);
 }
 $('more').textContent='Next 24 properties';$('more').hidden=!ready||shown>=matches.length;previous.hidden=!ready||shown<=24;$('empty').hidden=matches.length>0;
 pageInfo.textContent=matches.length?`${shown-23}-${Math.min(shown,matches.length)}${ready?' of '+matches.length.toLocaleString():''}`:'';
 const missing=visible.filter(p=>!detailsCache.has(p.ListingKey)).map(p=>p.ListingKey);
 if(loadDetails&&missing.length)fetch('/api/search-pilot?keys='+encodeURIComponent(missing.join(',')),{}).then(async response=>{if(!response.ok)throw new Error('Details unavailable');return response.json();}).then(data=>{
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
 shown=24;render();if(locationFields.includes(key))fitLocationMap();
});
$('clear-location').onclick=()=>{filters={...filters,...Object.fromEntries(locationFields.map(k=>[k,'']))};syncLocations();shown=24;render();fitLocationMap();$('message').textContent='Location cleared. Price, bedrooms and other filters kept.';};
$('filters').addEventListener('reset',e=>{e.preventDefault();filters=defaults();for(const [k,v] of Object.entries(filters)){if(k==='financing')$(k).checked=false;else $(k).value=v;}syncLocations();shown=24;render();fitLocationMap();$('message').textContent='All filters cleared.';});
$('sort').onchange=()=>{shown=24;render();};$('more').onclick=()=>{shown+=24;renderCards();$('cards').scrollIntoView({block:'start'});};$('close').onclick=()=>$('inquiry').close();
const alternateSearch=document.createElement('p');
const alternateLink=document.createElement('a');alternateLink.href='/idx-search';alternateLink.textContent='Open standard FLEX search';alternateLink.className='action';
alternateSearch.append(alternateLink);$('timestamp').after(alternateSearch);
const slowNotice=setTimeout(()=>{if(!ready&&!failed)$('message').textContent='Taking longer than expected. You can use standard FLEX search while this loads.';},4000);
try{
 const controls=[...document.querySelectorAll('#filters input,#filters select,#filters button,#sort')];
 controls.forEach(el=>el.disabled=true);
 const started=performance.now();
 const firstPage=fetch('/api/search-pilot?mode=first',{}).then(async response=>{if(!response.ok)throw new Error('Initial results unavailable');return response.json();}).then(data=>{
  if(ready||failed)return;
  matches=data.results;
  for(const p of matches)detailsCache.set(p.ListingKey,{Media:p.Media,PublicRemarks:p.PublicRemarks});
  renderCards(false);$('count').textContent=`${Number(data.total).toLocaleString()} properties · first ${matches.length} shown`;
  $('mapnote').textContent='The complete map and location filters are loading.';
  $('timestamp').textContent=`First properties loaded in ${((performance.now()-started)/1000).toFixed(1)} seconds. Preparing all location choices...`;
 }).catch(()=>{});
 const loadingMethod='shared-snapshot';
 const response=await fetch('/api/search-pilot?mode=snapshot');
 const data=await response.json();
 if(!response.ok)throw new Error(data.error||'The property search is temporarily unavailable.');
 const age=Date.now()-Date.parse(data.fetchedAt);
 if(data.complete!==true||!Array.isArray(data.results)||data.results.length!==data.total||new Set(data.results.map(p=>p.ListingKey)).size!==data.total||!Number.isFinite(age)||age>300000||age< -60000)throw new Error('A current complete inventory is not available. Please use standard FLEX search.');
 $('timestamp').dataset.cacheStatus=response.headers.get('x-vercel-cache')||'unknown';
 $('timestamp').dataset.inventorySource=response.headers.get('x-bir-inventory-source')||'unknown';
 rows=data.results;
 ready=true;clearTimeout(slowNotice);$('message').textContent='';
 if(!Array.isArray(rows))throw new Error('Invalid listing data');
 rows=rows.filter(p=>p.StandardStatus==='Active'&&p.InternetEntireListingDisplayYN!==false);
 controls.forEach(el=>el.disabled=false);
 options('PropertyType',[...new Set(rows.map(p=>p.PropertyType).filter(Boolean))].sort(),'');options('view',[...new Set(rows.map(p=>p.General_sp_Description_co_Primary_sp_View).filter(Boolean))].sort(),'');syncLocations();
 $('timestamp').textContent=`All filters ready in ${((performance.now()-started)/1000).toFixed(1)} seconds. ${rows.length.toLocaleString()} public active listings checked ${new Date(data.fetchedAt).toLocaleTimeString()}. Includes Reservations Only; reload for updates.`;
 $('timestamp').dataset.loadingMethod=loadingMethod;
 if(window.L){map=L.map('map',{zoomControl:false}).setView([23.05,-109.75],9);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);L.control.zoom({position:'topright'}).addTo(map);layer=L.layerGroup().addTo(map);map.on('zoomend',renderMap);}
 else $('map').textContent='Map could not load. You can still browse the matching listings below.';
 render();if(savedDialog.open)renderSaved();
}catch(error){failed=true;clearTimeout(slowNotice);$('count').textContent='Complete search unavailable';$('timestamp').textContent='Please use standard FLEX search below. Any properties shown here are only the first page.';$('message').textContent=error.message;}


