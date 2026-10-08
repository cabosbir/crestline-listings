const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=value=>Number.isFinite(value)&&value>0?new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(value)+' USD':'Price on request';
const safeImage=value=>{try{const u=new URL(value);return u.protocol==='https:'?u.href:'';}catch{return '';}};

export function homeDetailsHref(mls){
 const url=new URL(location.href);url.searchParams.set('home',mls);url.hash=document.querySelector('#ov-grid')?'homes':'featured-homes';return url.pathname+url.search+url.hash;
}

export function setupHomeDetails({completedOnly=false,returnLabel='Back to featured homes'}={}){
 let rows=[],dialog,active='',photos=[],photoIndex=0,requestNumber=0,controller,origin,scrollBefore=0,overflowBefore='',pending='';
 const anchor=document.querySelector('#ov-grid')?'homes':'featured-homes';
 const isOpen=()=>Boolean(dialog?.open);
 function create(){
  if(dialog)return;
  dialog=document.createElement('dialog');dialog.className='cd-dialog';dialog.setAttribute('aria-labelledby','cd-title');
  dialog.innerHTML=`<div class="cd-panel"><header class="cd-header"><button type="button" class="cd-back">← ${esc(returnLabel)}</button><span>Baja International Realty · Cabo homes</span></header><div class="cd-content"><h2 id="cd-title">Home details</h2><div id="cd-body" aria-live="polite"></div></div></div>`;
  document.body.append(dialog);
  dialog.querySelector('.cd-back').addEventListener('click',close);
  dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
  dialog.addEventListener('click',event=>{if(event.target===dialog)close();});
  dialog.addEventListener('keydown',event=>{if(!photos.length||/INPUT|TEXTAREA|SELECT/.test(event.target.tagName))return;if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();showPhoto(photoIndex+(event.key==='ArrowLeft'?-1:1));}});
 }
 function dismiss(){
  requestNumber++;controller?.abort();active='';pending='';photos=[];
  if(!isOpen())return;
  dialog.close();document.body.style.overflow=overflowBefore;window.scrollTo({top:scrollBefore,behavior:'instant'});
  const target=origin?.isConnected?origin:document.querySelector(`[data-home-details="${origin?.dataset?.homeDetails||''}"]`);
  target?.focus({preventScroll:true});
 }
 function close(){
  if(history.state?.birHomeOverlay){history.back();return;}
  const url=new URL(location.href);url.searchParams.delete('home');url.hash=anchor;history.replaceState(history.state,'',url);dismiss();
 }
 function inquiry(row,title){
  const url=new URL(homeDetailsHref(row.mls),location.href);url.searchParams.delete('bir_internal');
  const message=`Hello Don, I am interested in ${title} (MLS ${row.mls}). Please send current details or help arrange a showing.\n${url.href}`;
  return `<section class="cd-contact"><h3>Interested in this home?</h3><p>Ask Don for current details, compare it with your favorites, or arrange a showing.</p><div class="cd-actions"><a class="button" href="https://wa.me/526241296245?text=${encodeURIComponent(message)}" target="_blank" rel="noopener">WhatsApp Don ↗</a><a class="cd-email" href="mailto:don@bircabo.com?subject=${encodeURIComponent(title+' · MLS '+row.mls)}&body=${encodeURIComponent(message)}">Email Don</a><a class="cd-email" href="tel:+526241296245">Call Don</a></div></section>`;
 }
 function showPhoto(index){
  if(!photos.length||!isOpen())return;photoIndex=(index+photos.length)%photos.length;
  const photo=photos[photoIndex],img=dialog.querySelector('.cd-main-photo');
  img.src=photo.url;img.alt=`${dialog.querySelector('#cd-title').textContent} — photo ${photoIndex+1} of ${photos.length}`;
  dialog.querySelector('.cd-photo-count').textContent=`Photo ${photoIndex+1} of ${photos.length}`;
  dialog.querySelector('.cd-caption').textContent=photo.caption;
  for(const button of dialog.querySelectorAll('[data-photo]'))button.setAttribute('aria-current',Number(button.dataset.photo)===photoIndex?'true':'false');
 }
 function render(row,listing){
  const privateAddress=listing.InternetAddressDisplayYN===false,title=privateAddress?'Home details':row.name;
  dialog.querySelector('#cd-title').textContent=title;
  photos=(Array.isArray(listing.Media)?listing.Media:[]).map(x=>({url:safeImage(x.MediaURL),caption:String(x.caption||'')})).filter(x=>x.url);
  const facts=[];const beds=listing.BedroomsTotal,baths=listing.BathroomsTotalDecimal??listing.BathroomsFull;
  if(beds!=null)facts.push(`${beds} ${beds===1?'bedroom':'bedrooms'}`);if(baths!=null)facts.push(`${baths} ${baths===1?'bathroom':'bathrooms'}`);
  const sqft=listing.General_sp_Description_co_AC_sp_SqFt;if(Number.isFinite(sqft)&&sqft>0)facts.push(`${Math.round(sqft).toLocaleString('en-US')} sq ft interior`);
  const view=listing.General_sp_Description_co_Primary_sp_View;if(view)facts.push(`${view} view`);
  const construction=listing.General_sp_Description_co_Construction;if(construction)facts.push(`Construction: ${construction}`);
  const gallery=photos.length?`<section class="cd-gallery" aria-label="Property photos"><div class="cd-photo-stage"><img class="cd-main-photo" alt="" width="1200" height="800"></div><div class="cd-photo-controls"><button type="button" class="cd-previous" aria-label="Previous property photo" ${photos.length<2?'disabled':''}>← Previous</button><span class="cd-photo-count" aria-live="polite"></span><button type="button" class="cd-next" aria-label="Next property photo" ${photos.length<2?'disabled':''}>Next →</button></div><p class="cd-caption"></p><div class="cd-thumbs" aria-label="Choose a property photo">${photos.map((p,i)=>`<button type="button" data-photo="${i}" aria-label="View photo ${i+1}" aria-current="false"><img src="${esc(p.url)}" alt="" width="96" height="64" loading="lazy"></button>`).join('')}</div></section>`:'<p>Ask Don for current property photos.</p>';
  const remarks=privateAddress?'':String(listing.PublicRemarks||'');
  dialog.querySelector('#cd-body').innerHTML=`<p class="cd-price">${esc(money(listing.ListPrice))}</p><p class="cd-location">${privateAddress?'Address available on request':esc(listing.UnparsedAddress||listing.City||'')}</p><ul class="cd-facts">${facts.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>${gallery}${remarks?`<section class="cd-description"><h3>Listing description</h3><p>${esc(remarks)}</p></section>`:''}${inquiry(row,title)}<p class="cd-disclosure">MLS ${esc(row.mls)} · Listing office: ${esc(listing.ListOfficeName||'MLS BCS participant')}<br>Listing details and description supplied by the listing office through MLS BCS. Information is deemed reliable but not guaranteed. Prices and availability may change; confirm details with Don.</p>`;
  if(photos.length){showPhoto(0);dialog.querySelector('.cd-previous').addEventListener('click',()=>showPhoto(photoIndex-1));dialog.querySelector('.cd-next').addEventListener('click',()=>showPhoto(photoIndex+1));for(const button of dialog.querySelectorAll('[data-photo]'))button.addEventListener('click',()=>showPhoto(Number(button.dataset.photo)));}
 }
 async function open(row,push=false){
  create();controller?.abort();controller=new AbortController();const thisRequest=++requestNumber;active=row.mls;pending='';
  if(!isOpen()){origin=document.activeElement;scrollBefore=window.scrollY;overflowBefore=document.body.style.overflow;document.body.style.overflow='hidden';dialog.showModal();}
  if(push)history.pushState({...history.state,birHomeOverlay:true},'',homeDetailsHref(row.mls));
  dialog.querySelector('#cd-title').textContent=row.name;dialog.querySelector('#cd-body').innerHTML='<p role="status">Loading this home’s photos and details…</p>';dialog.scrollTop=0;photos=[];
  try{
   const response=await fetch('/api/search-pilot?mode=gallery&keys='+encodeURIComponent(row.key),{signal:AbortSignal.any([controller.signal,AbortSignal.timeout(20000)])});if(!response.ok)throw Error('unavailable');
   const data=await response.json(),listing=data.results?.find(x=>x.ListingId===row.mls&&x.ListingKey===row.key);
   if(thisRequest!==requestNumber)return;
   if(!listing||listing.StandardStatus!=='Active'||listing.InternetEntireListingDisplayYN===false||listing.PropertyType!=='Houses'||(completedOnly&&listing.General_sp_Description_co_Construction!=='Completed'))throw Error('unavailable');
   render(row,listing);
  }catch{
   if(thisRequest!==requestNumber)return;
   dialog.querySelector('#cd-title').textContent='Current home details';dialog.querySelector('#cd-body').innerHTML=`<p role="status">We cannot confirm this home’s current details right now. Ask Don for an update, or return to your selection.</p>${inquiry(row,'Home MLS '+row.mls)}`;
  }
 }
 function sync(){
  const mls=new URL(location.href).searchParams.get('home');
  if(!mls){dismiss();return;}
  const row=rows.find(x=>x.mls===mls);if(row&&active!==mls)open(row);else if(!row)pending=mls;
 }
 document.addEventListener('click',event=>{
  const link=event.target.closest('a[data-home-details]');if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const row=rows.find(x=>x.mls===link.dataset.homeDetails);if(!row)return;event.preventDefault();open(row,true);
 });
 window.addEventListener('popstate',sync);
 return {update(nextRows){rows=nextRows;if(!active||pending)sync();}};
}
