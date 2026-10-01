import {defaults, locationFields, changeLocation, locationOptions, filterListings, coordinates, convertSizeUnits} from './bir-pilot-search.mjs';
import {loadInventory,loadGroupedInventory} from './bir-pilot-inventory.mjs';
const $ = id => document.getElementById(id);
document.querySelector('.intro').textContent='Choose a property type, then narrow your search by zone, area, community and subdivision. Each choice narrows the options below it. If you already know the subdivision you want, select it directly.';
document.querySelector('.steps').remove();
for(const key of locationFields)document.querySelector(`label[for="${key}"]`).textContent=document.querySelector(`label[for="${key}"]`).textContent.replace(/^\d+\.\s*/, '');
$('MLSAreaMajor').nextElementSibling.textContent='Choose any area, or select a zone to narrow the list.';
$('SubdivisionName').nextElementSibling.textContent='Know the subdivision? Choose it directly. No other location is required.';
if(new URLSearchParams(location.search).get('check-email')==='1'){
 const check=document.createElement('p');check.id='email-connection-check';check.setAttribute('role','status');check.style.cssText='padding:20px;background:#fff3cd';check.textContent='Checking the email connection without sending a message...';document.querySelector('.notice').after(check);
 fetch('/api/search-pilot?mode=email-check',{}).then(async response=>{if(!response.ok)throw new Error('Connection check unavailable');return response.json();}).then(result=>{check.textContent=`${result.message} Connection status: ${result.status}`;}).catch(()=>{check.textContent='The connection check could not finish.';});
}
const extraFilters=document.createElement('div');
extraFilters.innerHTML='<label for="construction">CONSTRUCTION</label><select id="construction" name="construction"><option value="">Any</option></select><label for="areaUnit">SIZE UNITS — all size filters</label><select id="areaUnit" name="areaUnit"><option value="ft2">Square feet (ft²)</option><option value="m2">Square meters (m²)</option></select><p class="hint">Applies to lot, total and interior size.</p><strong>LOT SIZE</strong><label for="minLot">Minimum lot size</label><input id="minLot" name="minLot" type="number" min="0" step="any" placeholder="Any"><label for="maxLot">Maximum lot size</label><input id="maxLot" name="maxLot" type="number" min="0" step="any" placeholder="Any"><small class="hint">Uses the lot area reported in MLS, not indoor floor area. Listings without a reported lot size are excluded when a size limit is set.</small>';
$('PropertyType').after(extraFilters);
const areaFilters=document.createElement('div');
for(const [kind,label] of [['Total','TOTAL PROPERTY SIZE'],['AC','INTERIOR SIZE']]){
 const group=document.createElement('div');
 group.innerHTML=`<strong>${label}</strong><label for="min${kind}">Minimum ${kind==='Total'?'total':'interior'} size</label><input id="min${kind}" name="min${kind}" type="number" min="0" step="any" placeholder="Any"><label for="max${kind}">Maximum ${kind==='Total'?'total':'interior'} size</label><input id="max${kind}" name="max${kind}" type="number" min="0" step="any" placeholder="Any">`;
 areaFilters.append(group);
}
const areaHelp=document.createElement('small');areaHelp.className='hint';areaHelp.textContent='Interior size uses the indoor area reported in MLS. Total property size can include other areas; neither is lot size. Listings without the selected size are excluded when a limit is set.';areaFilters.append(areaHelp);extraFilters.after(areaFilters);

const entryType = new URLSearchParams(location.search).get('type');
const initialType = ({land:'Land',houses:'Houses',house:'Houses',homes:'Houses',condos:'Condos',condo:'Condos'})[String(entryType||'').toLowerCase()] || '';
const typeLabel=document.querySelector('label[for="PropertyType"]');typeLabel.textContent='TYPE';
$('filters').prepend(typeLabel,$('PropertyType'));
const requestedCommunity=new URLSearchParams(location.search).get('community');
const initialCommunity=['El Tezal-East','El Tezal-West','Pedregal CSL','Pescadero/Cerritos'].includes(requestedCommunity)?requestedCommunity:'';
let filters={...defaults(),PropertyType:initialType,Address_co_Community2:initialCommunity},rows=[],matches=[],shown=24,map,layer;
const alertParam=new URLSearchParams(location.hash.slice(1)).get('alert');
const alertIds=alertParam===null?null:[...new Set(alertParam.split(','))];
const validAlert=alertIds&&alertIds.length>0&&alertIds.length<=20000&&alertIds.every(id=>/^\d{2}-\d{1,10}$/.test(id));
if(alertIds){filters={...defaults(),query:validAlert?alertIds.join(','):'__invalid_alert__'};$('query').value=filters.query;}

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
  count.textContent=full?(photos.length?`${position+1} / ${photos.length}`:'No photos'):'Photos & details';
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
 if(!large){image.tabIndex=0;image.setAttribute('role','button');image.setAttribute('aria-label','Open photos & details');image.onclick=()=>openListing(p);image.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();openListing(p);}};}
 box.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();move(event.key==='ArrowLeft'?-1:1);}});
 let touchX;box.addEventListener('touchstart',event=>{touchX=event.touches[0]?.clientX;},{passive:true});box.addEventListener('touchend',event=>{const end=event.changedTouches[0]?.clientX;if(touchX!=null&&end!=null&&Math.abs(end-touchX)>50)move(end<touchX?1:-1);touchX=null;},{passive:true});
 image.onerror=()=>{caption.textContent='This photo could not load. Try the next photo.';};
 box.append(image,prev,next,count,caption);if(large)box.append(thumbs);draw();if(large&&!full)move(0);return box;
}
// Saved choices contain identifiers only, never cached listing descriptions or photos.
const savedKey='bir-saved-properties-v1';
let accountUI=null,accountMode=false;
let savedProperties=[];
try{const value=JSON.parse(localStorage.getItem(savedKey)||'[]');if(Array.isArray(value))savedProperties=value.filter(p=>p&&typeof p.key==='string'&&/^\d{1,40}$/.test(p.key)&&typeof p.mls==='string').slice(0,500);}catch{}
const savedBar=document.createElement('div');savedBar.className='saved-bar';
const savedOpen=document.createElement('button');savedOpen.type='button';savedOpen.className='saved-primary';
const savedNote=document.createElement('p');savedNote.innerHTML='<strong>Keep your favorites. Compare your choices.</strong><span>Click <b>Save property</b> (up to 50) on any listing, then open <b>Saved &amp; Compare</b> to review your favorites and compare up to three side by side.</span><small>Two free ways to save: keep favorites on this device without signing in, or use My Account to save across devices.</small>';
const savedStatus=document.createElement('p');savedStatus.setAttribute('role','status');savedStatus.className='saved-status';
const resultActions=document.createElement('div');resultActions.className='result-actions';count.before(resultActions);resultActions.append(count,savedOpen);savedBar.append(savedNote,savedStatus);document.querySelector('main .bar').after(savedBar);
const savedDialog=document.createElement('dialog');savedDialog.className='saved-dialog';savedDialog.setAttribute('aria-label','Saved properties');document.body.append(savedDialog);
function refreshSaveButtons(){
 savedOpen.textContent=`\u2665 Saved & Compare (${savedProperties.length})`;
 document.querySelectorAll('button[data-save-key]').forEach(button=>{const selected=savedProperties.some(p=>p.key===button.dataset.saveKey);button.textContent=selected?'\u2665 Saved':'\u2661 Save property';button.setAttribute('aria-pressed',String(selected));});
}
function toggleSaved(p,source){
 if(accountMode){if(accountUI)void accountUI.toggle(p);else savedStatus.textContent="Your account is loading. Please try again shortly.";return;}
 const key=String(p.ListingKey),selected=savedProperties.some(item=>item.key===key);
 if(!selected&&savedProperties.length>=50){savedStatus.textContent='You can save up to 50 properties. Remove a saved property before adding another.';return;}
 const next=selected?savedProperties.filter(item=>item.key!==key):[...savedProperties,{key,mls:String(p.ListingId||'')}];
 try{localStorage.setItem(savedKey,JSON.stringify(next));}catch{savedStatus.textContent='This browser could not save your change. Please allow site storage and try again.';return;}
 savedProperties=next;refreshSaveButtons();savedStatus.textContent=selected?'Property removed from your saved list.':'Saved on this device. No account required.';
 if(!selected&&next.length===1)offerAccount(source);
 if(savedDialog.open)renderSaved();
}

function offerAccount(source){
 try{if(localStorage.getItem('bir-account-invite-dismissed-v1'))return;}catch{}
 document.getElementById('save-account-offer')?.remove();
 const box=document.createElement('aside');box.id='save-account-offer';box.className='save-account-offer';box.setAttribute('aria-label','Two free ways to save');
 const text=document.createElement('p');text.textContent='Saved on this device. Want your favorites on your phone or another computer? A free buyer account keeps them together.';
 const link=document.createElement('a');link.href='/buyer-account.html';link.textContent='Create free account';
 const keep=document.createElement('button');keep.type='button';keep.textContent='Keep saving on this device';keep.onclick=()=>{try{localStorage.setItem('bir-account-invite-dismissed-v1','1');}catch{}box.remove();};
 box.append(text,link,keep);if(source?.isConnected)source.after(box);else savedBar.append(box);
}

function saveButton(p){const button=document.createElement('button');button.type='button';button.className='save-property';button.dataset.saveKey=String(p.ListingKey);const selected=savedProperties.some(item=>item.key===String(p.ListingKey));button.textContent=selected?'\u2665 Saved':'\u2661 Save property';button.setAttribute('aria-pressed',String(selected));button.onclick=()=>toggleSaved(p,button);return button;}

function propertyLink(p){return 'https://www.bircabo.com/property-search.html?mls='+encodeURIComponent(p.ListingId);}
function sharingActions(p){
 const bar=document.createElement('div');bar.className='listing-share-actions';
 const agent=document.createElement('button');agent.type='button';agent.textContent='Send to a BIR agent';agent.className='share-agent';agent.onclick=()=>{inquire(p);question.value='I would like to discuss this property with a BIR agent.\n'+propertyLink(p);updateInquiry();};
 const friend=document.createElement('button');friend.type='button';friend.textContent='Share listing';friend.onclick=()=>openShare(p);bar.append(agent,friend);return bar;
}
const shareDialog=document.createElement('dialog');shareDialog.setAttribute('aria-label','Share listing');shareDialog.className='saved-dialog';document.body.append(shareDialog);
function openShare(p){
 const list=Array.isArray(p)?p:[p],multiple=Array.isArray(p);p=list[0];
 shareDialog.replaceChildren();const heading=document.createElement('div');heading.className='saved-heading';const title=document.createElement('h2');title.textContent=multiple?'Share saved favorites':'Share this listing';const close=document.createElement('button');close.textContent='Close';close.onclick=()=>shareDialog.close();heading.append(title,close);
 const text=document.createElement('p');text.textContent=multiple?list.length+' saved favorites':(p.UnparsedAddress||'Property')+' · MLS '+p.ListingId;
 const note=document.createElement('p');note.textContent='Share with a friend, spouse or your agent. No account is needed to view the link. Only listings still in the public inventory will appear. This shares your current selection, not future changes to your favorites.';
 const url=multiple?favoritesLink(list):propertyLink(p),subject=multiple?'My BIR saved favorites':'BIR property: MLS '+p.ListingId,body=list.map(x=>(x.UnparsedAddress||'Property')+' · MLS '+x.ListingId).join('\n')+'\n'+url;
 const field=document.createElement('input');field.readOnly=true;field.value=url;field.setAttribute('aria-label','Listing link');field.style.cssText='box-sizing:border-box;width:100%;padding:12px;font:inherit';
 const actions=document.createElement('div');actions.className='listing-share-actions';const status=document.createElement('p');status.setAttribute('role','status');
 const copy=document.createElement('button');copy.textContent='Copy link';copy.onclick=async()=>{try{await navigator.clipboard.writeText(url);status.textContent='Link copied. Paste it into your message.';}catch{field.focus();field.select();status.textContent='Select and copy the link above.';}};
 const email=document.createElement('a');email.textContent='Email';email.href='mailto:?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
 const whatsapp=document.createElement('a');whatsapp.textContent='WhatsApp';whatsapp.href='https://wa.me/?text='+encodeURIComponent(body);whatsapp.target='_blank';whatsapp.rel='noopener noreferrer';actions.append(copy,email,whatsapp);
 if(navigator.share){const more=document.createElement('button');more.textContent='More sharing options';more.onclick=async()=>{try{await navigator.share({title:subject,text:(p.UnparsedAddress||'Property')+' · MLS '+p.ListingId,url});}catch(e){if(e.name!=='AbortError')status.textContent='Please use Copy link, Email or WhatsApp.';}};actions.append(more);}
 shareDialog.append(heading,text,note,field,actions,status);shareDialog.showModal();
}
style.textContent+='.listing-share-actions{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:12px 0}.listing-share-actions .share-agent{background:#12666a;color:white}.listing-share-actions a{display:inline-block;padding:10px 14px;border:1px solid #b8d5cf;border-radius:6px;color:#12666a;text-decoration:none;font-weight:600}';


function favoritesLink(list){return 'https://www.bircabo.com/property-search.html?mls='+encodeURIComponent(list.map(p=>p.ListingId).join(','));}
function savedSharingActions(){const list=savedProperties.map(s=>rows.find(p=>String(p.ListingKey)===s.key)||{ListingKey:s.key,ListingId:s.mls,UnparsedAddress:'Saved property'});const bar=document.createElement('div');bar.className='listing-share-actions';const agent=document.createElement('button');agent.className='share-agent';agent.textContent='Send all favorites to a BIR agent';agent.onclick=()=>{inquire(list[0]);$('property-context').textContent=list.length+' saved favorites';question.value='I would like to discuss these saved favorites with a BIR agent.\nMLS numbers: '+list.map(p=>p.ListingId).join(', ')+'\n'+favoritesLink(list);updateInquiry();};const share=document.createElement('button');share.textContent='Share all favorites';share.onclick=()=>openShare(list);bar.append(agent,share);return bar;}

function renderSaved(){
 compareKeys=compareKeys.filter(key=>savedProperties.some(p=>p.key===key)&&rows.some(p=>String(p.ListingKey)===key));
 savedDialog.replaceChildren();const heading=document.createElement('div');heading.className='saved-heading';const title=document.createElement('h2');title.textContent=`Saved & Compare (${savedProperties.length})`;const close=document.createElement('button');close.textContent='Back to search';close.onclick=()=>savedDialog.close();heading.append(title,close);savedDialog.append(heading);
 const note=document.createElement('p');note.textContent=accountMode?'Your saved list is independent of your search filters. Saved to your signed-in account.':'Your saved list is independent of your search filters. Saved on this browser only.';savedDialog.append(note);
 if(!accountMode){const choices=document.createElement('section');choices.setAttribute('aria-label','Free saving options');choices.style.cssText='padding:16px;margin:16px 0;background:#edf4f1;border:1px solid #b8d5cf;border-radius:8px';const label=document.createElement('h3');label.textContent='Two free ways to save';label.style.margin='0 0 8px';const device=document.createElement('p');device.textContent='Save on this device — your favorites are already saved in this browser. No account needed.';const account=document.createElement('p');account.textContent='Free buyer account — access favorites and saved searches across devices. Your saved listings will automatically transfer to your account when you sign in.';const link=document.createElement('a');link.href='/buyer-account.html';link.textContent='Create a free account or sign in';link.style.cssText='display:inline-block;background:#12666a;color:white;padding:10px 14px;border-radius:6px;text-decoration:none;font-weight:700';choices.append(label,device,account,link);savedDialog.append(choices);}

 if(!savedProperties.length){const empty=document.createElement('p');empty.textContent='No saved properties yet. Click Save property on any listing to keep it here.';savedDialog.append(empty);return;}
 savedDialog.append(savedSharingActions());
 const removeAll=document.createElement('button');removeAll.type='button';removeAll.textContent='Remove all saved properties';
 const removeFeedback=document.createElement('p');removeFeedback.setAttribute('role','status');
 const confirmation=document.createElement('section');confirmation.hidden=true;confirmation.setAttribute('aria-label','Confirm removal');
 const warning=document.createElement('p');warning.textContent='Remove all '+savedProperties.length+' saved properties '+(accountMode?'from your account on all devices':'from this browser')+'? Your saved searches and alert preferences will be kept.';
 const yes=document.createElement('button');yes.type='button';yes.textContent='Yes, remove all saved properties';const cancel=document.createElement('button');cancel.type='button';cancel.textContent='Cancel';cancel.onclick=()=>{confirmation.hidden=true;removeAll.focus();};confirmation.append(warning,yes,cancel);
 removeAll.onclick=()=>{confirmation.hidden=false;yes.focus();};
 yes.onclick=async()=>{
  if(yes.disabled)return;yes.disabled=true;
  try{
   if(accountMode){if(!accountUI)throw Error('Your account is loading. Please try again shortly.');await accountUI.removeAllFavorites();}
   else{localStorage.setItem(savedKey,'[]');savedProperties=[];compareKeys=[];refreshSaveButtons();renderSaved();savedStatus.textContent='All saved properties removed from this browser.';}
  }catch(error){removeFeedback.textContent=error.message||'Could not remove all properties. Please try again.';}
  finally{yes.disabled=false;}
 };savedDialog.append(removeAll,confirmation,removeFeedback);
 const compareBar=document.createElement('div');compareBar.className='compare-controls';const compareHelp=document.createElement('p');compareHelp.textContent='Choose two or three properties to compare side by side.';const compareStart=document.createElement('button');compareStart.textContent=`Compare selected (${compareKeys.length}/3)`;compareStart.disabled=compareKeys.length<2;compareStart.onclick=openComparison;compareBar.append(compareHelp,compareStart);savedDialog.append(compareBar);
 for(const saved of savedProperties){
  const row=rows.find(p=>String(p.ListingKey)===saved.key),card=document.createElement('article');card.className='saved-item';
  if(row){const title=document.createElement('h3');title.textContent=row.UnparsedAddress||'Property';const facts=document.createElement('p');facts.textContent=`${money(row.ListPrice)} · ${row.PropertyType} · MLS ${row.ListingId}`;const open=document.createElement('button');open.textContent='View property';open.onclick=()=>{savedDialog.close();openListing({...row,...detailsCache.get(row.ListingKey)});};card.append(title,facts,open);}
  else{const text=document.createElement('p');text.textContent=ready?`MLS ${saved.mls}: no longer in the current public search. Contact Don to check its status.`:`MLS ${saved.mls}: current availability has not loaded yet.`;card.append(text);}
  if(row){const label=document.createElement('label'),check=document.createElement('input');label.className='compare-choice';check.type='checkbox';check.checked=compareKeys.includes(saved.key);check.disabled=compareKeys.length===3&&!check.checked;check.setAttribute('aria-label',`Compare MLS ${saved.mls}`);check.onchange=()=>{compareKeys=check.checked?[...compareKeys,saved.key]:compareKeys.filter(key=>key!==saved.key);renderSaved();};label.append(check,document.createTextNode('Compare'));card.append(label);}
  const remove=document.createElement('button');remove.textContent='Remove from saved';remove.onclick=()=>toggleSaved({ListingKey:saved.key,ListingId:saved.mls});card.append(remove);if(row)card.append(sharingActions(row));savedDialog.append(card);
 }
}
let compareKeys=[],compareVersion=0;
const compareDialog=document.createElement('dialog');compareDialog.className='compare-dialog';compareDialog.setAttribute('aria-label','Compare saved properties');document.body.append(compareDialog);
function comparisonFacts(p){
 const missing='Not supplied',groups=p.PropertyDetails||[],items=groups.flatMap(g=>g.items||[]);
 const text=value=>value===null||value===undefined||value===''||value==='Select One'?missing:String(value);
 const fact=(...labels)=>{for(const label of labels){const item=items.find(x=>x.label===label&&text(x.value)!==missing);if(item)return text(item.value);}return missing;};
 const group=name=>{const data=groups.find(g=>g.heading===name);return data?.items?.filter(x=>text(x.value)!==missing).map(x=>x.value==='Yes'?x.label:`${x.label}: ${text(x.value)}`).join('; ')||missing;};
 return new Map([
 ['Price (USD)',money(p.ListPrice)],['Property type',text(p.PropertyType)],['Bedrooms',text(p.BedroomsTotal)],['Bathrooms',text(p.BathroomsTotalDecimal??p.BathroomsFull)],
 ['Zone',text(p.City)],['Area',text(p.MLSAreaMajor)],['Community',text(p.Address_co_Community2)],['Subdivision',text(p.SubdivisionName)],
 ['Indoor area (sq ft)',text(p.General_sp_Description_co_AC_sp_SqFt)!==missing?text(p.General_sp_Description_co_AC_sp_SqFt):fact('AC SqFt')],['Indoor area (m²)',fact('AC M2')],['Lot size (m²)',fact('Lot size (m²)','Lot M2')],['Lot size (acres)',fact('Lot size (acres)')],
 ['Year built',fact('Year built','Year Built')],['HOA fee (as supplied)',fact('HOA fee','Dues Amount2','Dues Amount')],['HOA payment period',fact('HOA fee frequency','Dues Period2','Dues Period')],['HOA details',group('HOA Info')],['Furnished',fact('Furnished')],['Views',fact('Views','Primary View')],['Garage spaces',fact('Garage spaces','Garage Stalls')],['Amenities',group('Amenities')],['Community amenities',group('Common Amenities')],['Appliances',group('Appliances')],['Water',group('Water')],['MLS number',text(p.ListingId)]
 ]);
}
async function openComparison(){
 const selected=compareKeys.map(key=>rows.find(p=>String(p.ListingKey)===key)).filter(Boolean);if(selected.length<2||selected.length>3)return;
 const version=++compareVersion;savedDialog.close();compareDialog.replaceChildren();
 const heading=document.createElement('div');heading.className='saved-heading';const title=document.createElement('h2');title.textContent='Compare your favorites';const back=document.createElement('button');back.textContent='Back to saved properties';back.onclick=()=>{compareDialog.close();renderSaved();savedDialog.showModal();};heading.append(title,back);
 const note=document.createElement('p');note.textContent='Your map and filters stay where you left them. On a small screen, swipe the table sideways. HOA fees are shown as supplied; currency may differ from the USD listing price.';
 const status=document.createElement('p');status.setAttribute('role','status');status.textContent='Loading additional property details…';
 const tableWrap=document.createElement('div');tableWrap.className='comparison-scroll';tableWrap.tabIndex=0;tableWrap.setAttribute('aria-label','Property comparison table; scroll horizontally for all properties');
 const table=document.createElement('table');table.className='comparison-table';tableWrap.append(table);compareDialog.append(heading,note,status,tableWrap);compareDialog.showModal();
 function draw(properties,errors=new Set()){
  table.replaceChildren();const caption=document.createElement('caption');caption.textContent=`Comparing ${properties.length} saved properties`;table.append(caption);
  const head=document.createElement('thead'),tr=document.createElement('tr'),corner=document.createElement('th');corner.scope='col';corner.textContent='Property';tr.append(corner);
  for(const p of properties){const th=document.createElement('th');th.scope='col';if(p.Media?.[0]?.MediaURL){const img=document.createElement('img');img.src=p.Media[0].MediaURL;img.alt='';img.loading='lazy';th.append(img);}const name=document.createElement('p');name.textContent=p.UnparsedAddress||`MLS ${p.ListingId}`;const view=document.createElement('button');view.textContent='View full listing';view.onclick=()=>{openListing(p);const close=listingDialog.querySelector('.gallery-heading button');close.textContent='Back to comparison';};th.append(name,view);if(errors.has(p.ListingKey)){const warning=document.createElement('p');warning.className='compare-warning';warning.textContent='Additional details unavailable. Try again below.';th.append(warning);}tr.append(th);}head.append(tr);table.append(head);
  const all=properties.map(comparisonFacts),body=document.createElement('tbody');for(const label of all[0].keys()){const row=document.createElement('tr'),th=document.createElement('th');th.scope='row';th.textContent=label;row.append(th);all.forEach(facts=>{const td=document.createElement('td');td.textContent=facts.get(label);row.append(td);});body.append(row);}table.append(body);
 }
 draw(selected.map(p=>({...p,...galleryCache.get(p.ListingKey)})));
 // Fetch at most three listings only after Compare is requested; reuse gallery cache.
 const result=await Promise.allSettled(selected.map(fetchGallery));if(version!==compareVersion||!compareDialog.open)return;
 const errors=new Set();draw(selected.map((p,i)=>{if(result[i].status==='fulfilled')return {...p,...result[i].value};errors.add(p.ListingKey);return p;}),errors);
 status.textContent=errors.size?'Some additional details could not load. Your basic comparison is still available.':'Details loaded. “Not supplied” means the public listing feed did not provide that information.';
 if(errors.size){const retry=document.createElement('button');retry.textContent='Retry additional details';retry.onclick=()=>{compareDialog.close();openComparison();};status.append(document.createTextNode(' '),retry);}
}
style.textContent+=`.compare-controls{position:sticky;top:0;background:white;padding:8px 0;z-index:1;border-bottom:1px solid #d4dfdc}.compare-controls p{margin:4px 0 10px}.compare-choice{display:inline-flex;align-items:center;gap:8px;margin:10px 18px 10px 0}.compare-choice input{width:20px;height:20px}.compare-dialog{width:96vw;max-width:1250px;max-height:94vh;padding:24px;border:1px solid #c5d4ce;border-radius:12px;overflow:auto}.comparison-scroll{overflow-x:auto;max-width:100%}.comparison-table{width:100%;border-collapse:collapse;table-layout:fixed;min-width:720px}.comparison-table caption{text-align:left;padding:12px 0;font-weight:600}.comparison-table th,.comparison-table td{padding:14px;text-align:left;vertical-align:top;border:1px solid #d4dfdc;overflow-wrap:anywhere}.comparison-table th{background:#f1f6f3}.comparison-table th:first-child{width:150px}.comparison-table img{width:100%;height:140px;object-fit:cover;border-radius:6px}.comparison-table button{font-size:14px}.comparison-table tbody tr:nth-child(even) td{background:#fafcfb}.compare-warning{color:#865411;font-size:13px}@media(max-width:760px){.compare-dialog{padding:12px;width:98vw}.compare-dialog h2{font-size:21px}.comparison-table{min-width:760px}.comparison-table th:first-child{width:110px}.comparison-table th,.comparison-table td{padding:10px}}`;
savedOpen.onclick=()=>{renderSaved();savedDialog.showModal();};refreshSaveButtons();
window.addEventListener('storage',event=>{if(accountMode)return;if(event.key!==savedKey&&event.key!==null)return;try{const value=JSON.parse(event.newValue||'[]');if(!Array.isArray(value))return;savedProperties=value.filter(p=>p&&typeof p.key==='string'&&/^\d{1,40}$/.test(p.key)&&typeof p.mls==='string').slice(0,500);refreshSaveButtons();if(savedDialog.open)renderSaved();}catch{}});
style.textContent+='.saved-bar{padding:14px 24px;border-bottom:1px solid #d4dfdc;background:#f1f6f3}.saved-primary{background:#12666a;color:white;border:2px solid #12666a;padding:12px 20px;font-size:18px;font-weight:700;box-shadow:0 2px 5px #0002}.saved-primary:hover{background:#0b4b50}.saved-bar p{margin:7px 0;font-size:13px}.saved-status:empty{display:none}.save-property{margin:8px 8px 8px 0;color:#12666a}.save-property[aria-pressed=true]{background:#12666a;color:white}.saved-dialog{width:92vw;max-width:850px;max-height:90vh;overflow:auto;padding:24px;border:1px solid #c5d4ce;border-radius:12px}.saved-heading{display:flex;align-items:center;justify-content:space-between;gap:12px}.saved-item{padding:16px 0;border-top:1px solid #d4dfdc}.saved-item button{margin-right:12px}.saved-item h3{margin:6px 0}@media(max-width:760px){.saved-dialog{padding:14px}.saved-heading{align-items:start}.saved-heading h2{font-size:21px}}';

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
 const tabs=document.createElement('div');tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Listing views');tabs.style.cssText='display:flex;gap:10px;margin:16px 0';
 const infoTab=document.createElement('button'),mapTab=document.createElement('button');infoTab.textContent='Photos & details';mapTab.textContent='Map';
 const infoPane=document.createElement('section'),mapPane=document.createElement('section');infoPane.id='listing-info-pane';mapPane.id='listing-map-pane';infoPane.setAttribute('role','tabpanel');mapPane.setAttribute('role','tabpanel');mapPane.hidden=true;
 infoPane.append(photoViewer(p,true),remarks,details);let listingMap=null;
 const mapCanvas=document.createElement('div');mapCanvas.style.cssText='height:350px;width:100%;border:1px solid #b8d5cf;border-radius:6px';mapCanvas.setAttribute('aria-label','Map of this property');
 if(coordinates(p)){const note=document.createElement('p');note.textContent='Location supplied by the listing agent. Confirm the exact location with your BIR agent.';const external=document.createElement('a');external.textContent='Open location in Google Maps';external.href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(p.Latitude+','+p.Longitude);external.target='_blank';external.rel='noopener';mapPane.append(mapCanvas,note,external);}else{mapPane.textContent='A map location has not been supplied for this listing. Ask a BIR agent for its location.';}
 function showPane(showMap){infoPane.hidden=showMap;mapPane.hidden=!showMap;infoTab.setAttribute('aria-selected',String(!showMap));mapTab.setAttribute('aria-selected',String(showMap));infoTab.tabIndex=showMap?-1:0;mapTab.tabIndex=showMap?0:-1;if(showMap&&coordinates(p)){if(window.L){if(!listingMap){listingMap=L.map(mapCanvas).setView([p.Latitude,p.Longitude],16);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(listingMap);L.marker([p.Latitude,p.Longitude]).addTo(listingMap);}requestAnimationFrame(()=>listingMap?.invalidateSize());}else mapCanvas.textContent='Map could not load. Use the Google Maps link below.';}}
 for(const [tab,pane,id,showMap]of [[infoTab,infoPane,'listing-info-tab',false],[mapTab,mapPane,'listing-map-tab',true]]){tab.type='button';tab.id=id;tab.setAttribute('role','tab');tab.setAttribute('aria-controls',pane.id);pane.setAttribute('aria-labelledby',id);tab.onclick=()=>showPane(showMap);tab.onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?false:e.key==='End'?true:!showMap;showPane(next);(next?mapTab:infoTab).focus();}};tabs.append(tab);}
 showPane(false);listingDialog.addEventListener('close',()=>{listingMap?.remove();listingMap=null;},{once:true});
 listingDialog.replaceChildren(heading,facts,saveButton(p),sharingActions(p),tabs,infoPane,mapPane);if(fromMap&&!window.matchMedia('(max-width:760px)').matches)listingDialog.show();else listingDialog.showModal();
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
inquiryNote.textContent='Your message goes to Don at Baja International Realty. If you work with another BIR agent, include their name in your message. The listing link and MLS number are included automatically.';
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
  const response=await fetch('/api/search-pilot',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:$('contact-name').value,email:$('contact-email').value,phone:$('contact-phone').value,message:question.value+'\nListing: '+propertyLink(selectedProperty),website:trap.value,listingId:String(selectedProperty.ListingId),address:selectedProperty.UnparsedAddress||''})});
  const result=await response.json();if(!response.ok||!result.success)throw new Error(result.error||'We could not confirm your inquiry was sent. Please use the email or call link.');
  inquiryStatus.textContent='Thank you. Your inquiry has been submitted to Don.';sendButton.textContent='Inquiry submitted';
 }catch(error){inquiryStatus.textContent=error.message||'Unable to confirm delivery. Please use the email or call link.';sendButton.disabled=false;sendButton.textContent='Send inquiry';}
 finally{$('close').disabled=false;}
};
$('inquiry').addEventListener('cancel',event=>{if($('close').disabled)event.preventDefault();});
const contactOptions=document.createElement('div');contactOptions.className='contact-options';
const callLink=document.createElement('a');callLink.href='tel:+526241296245';callLink.textContent='Call Don';contactOptions.append(callLink);$('email').after(contactOptions);
let selectedProperty;
function updateInquiry(){if(!selectedProperty)return;const p=selectedProperty;const body=`I would like more information about ${p.UnparsedAddress}.\nMLS: ${p.ListingId}\nPrice: ${money(p.ListPrice)}\nListing: ${propertyLink(p)}\n\n${question.value}`;$('email').href=`mailto:don@bircabo.com?subject=${encodeURIComponent('Property inquiry: MLS '+p.ListingId)}&body=${encodeURIComponent(body)}`;}
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
  const detail=document.createElement('button');detail.type='button';detail.textContent='Photos & details';detail.onclick=()=>openListing(p);content.append(detail);
  const button=document.createElement('button');button.className='inquiry';button.textContent='Ask about this property';button.onclick=()=>inquire(p);content.append(sharingActions(p));card.append(content);$('cards').append(card);
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
 for(const kind of ['Total','AC'])if(filters['min'+kind] && filters['max'+kind] && Number(filters['min'+kind])>Number(filters['max'+kind]))$('message').textContent='Minimum '+(kind==='Total'?'total':'interior')+' size is higher than maximum size.';
 if(filters.minLot && filters.maxLot && Number(filters.minLot)>Number(filters.maxLot))$('message').textContent='Minimum lot size is higher than maximum lot size.';
 if(filters.minPrice && filters.maxPrice && Number(filters.minPrice)>Number(filters.maxPrice))$('message').textContent='Minimum price is higher than maximum price.';
}
$('filters').addEventListener('submit',e=>e.preventDefault());
$('filters').addEventListener('input',e=>{
 const key=e.target.name;if(!(key in filters))return;
 if(locationFields.includes(key)){filters=changeLocation(filters,key,e.target.value);syncLocations();$('message').textContent='Location choices below this level cleared. Other filters kept.';}
 else if(key==='areaUnit'){filters=convertSizeUnits(filters,e.target.value);for(const name of ['minLot','maxLot','minTotal','maxTotal','minAC','maxAC'])$(name).value=filters[name];$('message').textContent='All size limits converted to the selected units.';}
 else{filters={...filters,[key]:key==='financing'?e.target.checked:e.target.value};if(filters._areaBounds)delete filters._areaBounds[key];$('message').textContent='';}
 shown=24;render();if(locationFields.includes(key))fitLocationMap();
});
$('clear-location').onclick=()=>{filters={...filters,...Object.fromEntries(locationFields.map(k=>[k,'']))};syncLocations();shown=24;render();fitLocationMap();$('message').textContent='Location cleared. Price, bedrooms and other filters kept.';};
$('filters').addEventListener('reset',e=>{e.preventDefault();filters=defaults();for(const [k,v] of Object.entries(filters)){if(k==='financing')$(k).checked=false;else $(k).value=v;}syncLocations();shown=24;render();fitLocationMap();$('message').textContent='All filters cleared.';});
$('sort').onchange=()=>{shown=24;render();};$('more').onclick=()=>{shown+=24;renderCards();$('cards').scrollIntoView({block:'start'});};$('close').onclick=()=>$('inquiry').close();
const alternateSearch=document.createElement('p');alternateSearch.hidden=true;
const alternateLink=document.createElement('a');alternateLink.href='/idx-search';alternateLink.textContent='Open standard FLEX search';alternateLink.className='action';
alternateSearch.append(alternateLink);$('timestamp').after(alternateSearch);
const slowNotice=setTimeout(()=>{if(!ready&&!failed)$('message').textContent='Taking longer than expected. Your search is still loading.';},4000);
try{
 const controls=[...document.querySelectorAll('#filters input,#filters select,#filters button,#sort')];
 controls.forEach(el=>el.disabled=true);
 const started=performance.now();
 const firstPage=fetch('/api/search-pilot?mode=first',{}).then(async response=>{if(!response.ok)throw new Error('Initial results unavailable');return response.json();}).then(data=>{
  if(ready||failed)return;
  matches=filterListings(data.results.filter(p=>p.PropertyType!=='Reservations Only'),filters);
  for(const p of matches)detailsCache.set(p.ListingKey,{Media:p.Media,PublicRemarks:p.PublicRemarks});
  renderCards(false);$('count').textContent=initialType?`${matches.length} initial ${initialType.toLowerCase()} · complete results loading`:`${Number(data.total).toLocaleString()} properties · first ${matches.length} shown`;
  $('mapnote').textContent='The complete map and location filters are loading.';
  $('timestamp').textContent=`First properties loaded in ${((performance.now()-started)/1000).toFixed(1)} seconds. Preparing all location choices...`;
 }).catch(()=>{});
 const loadingMethod='shared-snapshot';
 const response=await fetch('/api/search-pilot?mode=snapshot',{signal:AbortSignal.timeout(12000)});
 const data=await response.json();
 if(!response.ok)throw new Error(data.error||'The property search is temporarily unavailable.');
 const age=Date.now()-Date.parse(data.fetchedAt);
 if(data.complete!==true||!Array.isArray(data.results)||data.results.length!==data.total||new Set(data.results.map(p=>p.ListingKey)).size!==data.total||!Number.isFinite(age)||age>=3600000||age< -60000)throw new Error('A current complete inventory is not available. Please use standard FLEX search.');
 $('timestamp').dataset.cacheStatus=response.headers.get('x-vercel-cache')||'unknown';
 $('timestamp').dataset.inventorySource=response.headers.get('x-bir-inventory-source')||'unknown';
 rows=data.results;
 ready=true;clearTimeout(slowNotice);$('message').textContent='';
 if(!Array.isArray(rows))throw new Error('Invalid listing data');
 rows=rows.filter(p=>p.StandardStatus==='Active'&&p.InternetEntireListingDisplayYN!==false&&p.PropertyType!=='Reservations Only');
 controls.forEach(el=>el.disabled=false);
 options('construction',[...new Set(rows.map(p=>p.General_sp_Description_co_Construction).filter(Boolean))].sort(),'');options('PropertyType',[...new Set(rows.map(p=>p.PropertyType).filter(Boolean))].sort(),initialType);options('view',[...new Set(rows.map(p=>p.General_sp_Description_co_Primary_sp_View).filter(Boolean))].sort(),'');syncLocations();
 $('timestamp').textContent=`All filters ready in ${((performance.now()-started)/1000).toFixed(1)} seconds. ${rows.length.toLocaleString()} public active listings checked ${new Date(data.fetchedAt).toLocaleTimeString()}. Reload for updates.`;
 $('timestamp').dataset.loadingMethod=loadingMethod;
 if(age>=300000)$('timestamp').textContent+=' The latest inventory update is delayed. You can keep searching these last verified listings. Prices and availability may have changed. Reload for an update.';
 if(window.L){map=L.map('map',{zoomControl:false}).setView([23.05,-109.75],9);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);L.control.zoom({position:'topright'}).addTo(map);layer=L.layerGroup().addTo(map);map.on('zoomend',renderMap);}
 else $('map').textContent='Map could not load. You can still browse the matching listings below.';
 render();if(savedDialog.open)renderSaved();
 if(alertIds){
  const note=document.createElement('section');note.setAttribute('aria-label','Properties from your alert');note.style.cssText='padding:18px;margin:12px 0;background:#edf6f2;border:1px solid #b8d5cf;border-radius:8px';
  const heading=document.createElement('h2');heading.textContent='Properties from your alert';
  const message=document.createElement('p');message.textContent=validAlert?'Showing '+matches.length+' currently available properties from the '+alertIds.length+' listings in your email. Only listings from that alert are included.':'This alert link is incomplete or invalid. Please open the original link in your email.';
  note.append(heading,message);
  if(validAlert){const available=new Set(matches.map(p=>p.ListingId));const missing=alertIds.filter(id=>!available.has(id));if(missing.length){const unavailable=document.createElement('p');unavailable.textContent='No longer in the public active inventory: MLS '+missing.join(', ')+'. Ask your BIR agent for the latest status.';note.append(unavailable);}}
  $('count').closest('main').prepend(note);note.scrollIntoView({block:'start'});
 }
 const entry=new URLSearchParams(location.search),requestedMLS=entry.get('mls');
 if(requestedMLS&&requestedMLS.includes(',')){const ids=requestedMLS.split(',');if(ids.length<=50&&ids.every(id=>/^[\d-]{3,20}$/.test(id))){filters.query=ids.join(',');$('query').value=filters.query;shown=24;render();fitLocationMap();$('message').textContent='Shared favorites: showing '+matches.length+' currently available listings from '+ids.length+' shared MLS numbers.';$('count').scrollIntoView({block:'start'});}} 
 if(requestedMLS&&/^[\d-]{3,20}$/.test(requestedMLS)){
  const listing=rows.find(row=>row.ListingId===requestedMLS);
  if(listing)openListing({...listing,...detailsCache.get(listing.ListingKey)});
  else $('message').textContent='This property is no longer in the current public active inventory. You can explore other listings below.';
  if(entry.get('from')==='price-reductions'){
   const returnLink=document.createElement('a');returnLink.href='/#price-reductions';returnLink.textContent='Back to price reductions';returnLink.style.cssText='display:inline-block;padding:10px 14px;border:2px solid #b45309;border-radius:6px;background:#fff7ed;color:#78350f;font-weight:700;margin:8px 0';
   if(listing)listingDialog.querySelector('.gallery-heading').append(returnLink);
   else $('message').append(document.createElement('br'),returnLink);
  }
 }
}catch(error){failed=true;alternateSearch.hidden=false;clearTimeout(slowNotice);$('count').textContent='Complete search unavailable';$('timestamp').textContent='Please use standard FLEX search below. Any properties shown here are only the first page.';$('message').textContent=error.message;}



style.textContent+='#listing-gallery .gallery-heading button{border:2px solid #b45309;background:#fff7ed;color:#78350f;font-weight:700;flex-shrink:0}#listing-gallery .gallery-heading button:hover{background:#ffedd5;border-color:#92400e}#listing-gallery .gallery-heading button:focus-visible{outline:3px solid #12666a;outline-offset:3px}';

style.textContent+='main{min-width:0}.result-actions{display:flex;align-items:center;gap:20px;flex-wrap:wrap;flex:1}.saved-bar{margin:0 0 14px;padding:16px 20px;border:1px solid #b8d5cf;border-left:5px solid #12666a;border-radius:7px;background:#edf6f2}.saved-bar p{font-size:18px;line-height:1.5;margin:0}.saved-bar p>strong{display:block;font-size:21px;color:#124e52;margin-bottom:5px}.saved-bar p>span{display:block}.saved-bar small{display:block;font-size:14px;margin-top:8px;color:#425d59}@media(max-width:760px){.result-actions{flex:0 0 100%;width:100%;justify-content:center;text-align:center;gap:12px}.result-actions .saved-primary{width:100%}.saved-bar{padding:14px}.saved-bar p{font-size:17px}.saved-bar p>strong{font-size:20px}}';

style.textContent+='.saved-bar small{font-size:17px;line-height:1.5;padding:10px 12px;margin-top:12px;border:1px solid #8db7ae;border-radius:6px;background:#fff;color:#244b46}';

// Optional accounts load independently; the existing browser-only search stays usable.
import('./bir-account-ui.mjs').then(async({mountAccount})=>{
 const target=document.createElement('div');target.className='phone-account-explainer';savedBar.after(target);
 accountUI=await mountAccount(target,{
  ready:()=>ready, getFilters:()=>structuredClone(filters),
  setFavorites:(list,cloud)=>{accountMode=cloud;savedProperties=Array.isArray(list)?list:[];refreshSaveButtons();if(savedDialog.open)renderSaved();savedNote.querySelector('small').textContent=cloud?'Account favorites sync across your devices. Your browser-only favorites are kept separately.':'No signup required. Favorites stay saved in this browser; clearing browser data removes them.';},
  applyFilters:next=>{filters={...defaults(),...next};for(const [k,v]of Object.entries(filters)){const input=$(k);if(!input)continue;if(k==='financing')input.checked=v;else if(!locationFields.includes(k))input.value=v;}syncLocations();shown=24;render();fitLocationMap();}
 });
}).catch(()=>{});
// Compact phone search: clear routes to filters, listings and optional overview map.
style.textContent+='header .account-signout[hidden]{display:none!important}.phone-search-nav,.phone-search-intro,.phone-map-toggle{display:none}@media(max-width:760px){.phone-search-nav{display:flex;gap:8px;position:sticky;top:0;z-index:600;background:#fff;padding:10px 14px;border-bottom:1px solid #b8d5cf}.phone-search-nav button{flex:1;min-height:44px;font-size:16px;background:#12666a;color:#fff}.phone-search-intro{display:block!important}.search-heading>p:not(.phone-search-intro){display:none}.search-heading h1{font-size:25px}.layout>aside{position:static!important;max-height:none!important;height:auto!important;overflow:visible!important;padding:12px 15px}.layout>aside:not(.filters-open)>h2,.layout>aside:not(.filters-open)>p,.layout>aside:not(.filters-open) .filter-save-search{display:none}.layout>aside:not(.filters-open){padding:0 15px}.layout>aside .mobile-filter-toggle{width:100%;min-height:44px}.saved-bar,.phone-account-explainer{display:none!important}#map:not(.phone-map-open),#mapnote:not(.phone-map-open){display:none}.phone-map-toggle{display:block;min-height:44px;width:100%;margin:10px 0;font-size:16px}.buyer-panel input,.buyer-panel select,#filters input,#filters select{font-size:16px}.gallery-heading{flex-wrap:wrap}.gallery-heading h2{width:100%}#listing-gallery .gallery-heading{position:sticky;top:-12px;background:#fff;z-index:550;padding:8px 0}#listing-gallery,#inquiry,.saved-dialog{box-sizing:border-box;max-width:100vw}#cards{scroll-margin-top:75px}.layout>aside{scroll-margin-top:65px}}';
const phoneIntro=document.createElement('p');phoneIntro.className='phone-search-intro';phoneIntro.textContent='Browse all active Baja California Sur listings. Use Filters to narrow your search. No signup required.';document.querySelector('.search-heading')?.append(phoneIntro);
const phoneNav=document.createElement('nav');phoneNav.className='phone-search-nav';phoneNav.setAttribute('aria-label','Property search shortcuts');const phoneFilters=document.createElement('button'),phoneResults=document.createElement('button');phoneFilters.type=phoneResults.type='button';phoneFilters.textContent='Filters';phoneResults.textContent='See results';phoneNav.append(phoneFilters,phoneResults);document.querySelector('header').after(phoneNav);phoneFilters.onclick=()=>{const aside=document.querySelector('.layout>aside');if(!aside.classList.contains('filters-open'))filterToggle.click();aside.scrollIntoView({block:'start'});};phoneResults.onclick=()=>{const aside=document.querySelector('.layout>aside');if(aside.classList.contains('filters-open'))filterToggle.click();$('cards').scrollIntoView({block:'start'});};
const phoneMapToggle=document.createElement('button');phoneMapToggle.type='button';phoneMapToggle.className='phone-map-toggle';phoneMapToggle.textContent='Show results on map';phoneMapToggle.setAttribute('aria-expanded','false');phoneMapToggle.setAttribute('aria-controls','map');mapWrap.before(phoneMapToggle);phoneMapToggle.onclick=()=>{const open=$('map').classList.toggle('phone-map-open');$('mapnote').classList.toggle('phone-map-open',open);phoneMapToggle.textContent=open?'Hide results map':'Show results on map';phoneMapToggle.setAttribute('aria-expanded',String(open));if(open&&map)requestAnimationFrame(()=>{map.invalidateSize();fitLocationMap();});};

if(new URLSearchParams(location.search).has('editSearch')&&matchMedia('(max-width:760px)').matches&&!document.querySelector('.layout>aside').classList.contains('filters-open'))filterToggle.click();
// Keep the next step visible while choosing filters.
$('clear-location').remove();
const clearFiltersButton=document.querySelector('#filters button[type="reset"]');
clearFiltersButton.textContent='Clear filters';
clearFiltersButton.setAttribute('form','filters');
const filterFine=document.querySelector('aside .fine');
if(filterFine)filterFine.textContent='Results update as you change filters. Choose See results to browse matching properties.';
function seeMatchingResults(){
 const aside=document.querySelector('.layout>aside');
 if(matchMedia('(max-width:760px)').matches&&aside.classList.contains('filters-open'))filterToggle.click();
 $('cards').scrollIntoView({block:'start'});
 $('cards').setAttribute('tabindex','-1');$('cards').focus({preventScroll:true});
}
phoneResults.onclick=seeMatchingResults;
const filterResults=document.createElement('section');filterResults.className='filter-results-actions';filterResults.setAttribute('aria-label','Search results');
const filterCount=document.createElement('strong');filterCount.setAttribute('role','status');filterCount.textContent=$('count').textContent;
new MutationObserver(()=>{filterCount.textContent=$('count').textContent;}).observe($('count'),{childList:true,characterData:true,subtree:true});
const filterResultsButton=document.createElement('button');filterResultsButton.type='button';filterResultsButton.className='see-results-primary';filterResultsButton.textContent='See results';filterResultsButton.onclick=seeMatchingResults;
const filterActionRow=document.createElement('div');filterActionRow.append(filterResultsButton,clearFiltersButton);filterResults.append(filterCount,filterActionRow);document.querySelector('.layout>aside').append(filterResults);
const resultsSummary=document.createElement('div');resultsSummary.className='results-summary';$('count').before(resultsSummary);resultsSummary.append($('count'));
const summaryResultsButton=document.createElement('button');summaryResultsButton.type='button';summaryResultsButton.className='see-results-primary';summaryResultsButton.textContent='See results';summaryResultsButton.onclick=seeMatchingResults;resultsSummary.append(summaryResultsButton);
style.textContent+='.results-summary{display:flex;flex-direction:column;align-items:flex-start;gap:8px}.see-results-primary{background:#12666a!important;color:#fff!important;border:2px solid #12666a!important;font-size:18px!important;font-weight:700;min-height:48px;padding:12px 24px!important}.see-results-primary:hover{background:#0b4b50!important}.filter-results-actions{position:sticky;bottom:0;background:#fff;border-top:2px solid #b8d5cf;padding:12px 0;margin-top:16px;z-index:610}.filter-results-actions>strong{display:block;margin-bottom:8px;font-size:18px;color:#124e52}.filter-results-actions>div{display:flex;gap:10px;align-items:center}.filter-results-actions .see-results-primary{flex:1}.filter-results-actions button[type=reset]{background:#fff;color:#345b58;min-height:44px;padding:8px;border:1px solid #8db7ae}.phone-search-nav button:last-child{font-weight:700}@media(max-width:760px){.layout>aside:not(.filters-open) .filter-results-actions{display:none}.layout>aside.filters-open{padding-bottom:150px!important}.layout>aside.filters-open .filter-results-actions{position:fixed;bottom:0;left:0;right:0;padding:10px 14px calc(10px + env(safe-area-inset-bottom));margin:0;box-shadow:0 -3px 12px #0002}.results-summary{width:100%;align-items:stretch}.results-summary .see-results-primary{width:100%}#filters input,#filters select{scroll-margin-bottom:160px}}';
