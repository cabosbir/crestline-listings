const viewLabel=v=>({Ocean:'Vista al mar',Oceanfront:'Frente al mar',Arch:'Vista al Arco',Marina:'Vista a la marina','Golf Course':'Vista al campo de golf',City:'Vista a la ciudad',Mountain:'Vista a la montaña',Territory:'Vista al entorno',Local:'Vista local'}[v]||v);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=value=>Number.isFinite(value)&&value>0?new Intl.NumberFormat('es-MX',{style:'currency',currency:'USD',currencyDisplay:'narrowSymbol',maximumFractionDigits:0}).format(value)+' USD':'Precio a solicitud';
const safeImage=value=>{try{const u=new URL(value);return u.protocol==='https:'?u.href:'';}catch{return '';}};

export function propertyDetailsHref(mls){
 const url=new URL(location.href);url.searchParams.set('property',mls);url.hash=document.querySelector('#ov-grid')?'properties':'properties';return url.pathname+url.search+url.hash;
}

export function setupPropertyDetails({completedOnly=false,returnLabel='Volver a tus resultados'}={}){
 let rows=[],dialog,active='',photos=[],photoIndex=0,requestNumber=0,controller,origin,scrollBefore=0,overflowBefore='',pending='';
 const anchor=document.querySelector('#ov-grid')?'properties':'properties';
 const isOpen=()=>Boolean(dialog?.open);
 function create(){
  if(dialog)return;
  dialog=document.createElement('dialog');dialog.className='cd-dialog';dialog.setAttribute('aria-labelledby','cd-title');
  dialog.innerHTML=`<div class="cd-panel"><header class="cd-header"><button type="button" class="cd-back">← ${esc(returnLabel)}</button><span>Baja International Realty · Detalles de la propiedad</span></header><div class="cd-content"><h2 id="cd-title">Detalles de la propiedad</h2><div id="cd-body" aria-live="polite"></div></div></div>`;
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
  const target=origin?.isConnected?origin:document.querySelector(`[data-property-details="${origin?.dataset?.homeDetails||''}"]`);
  target?.focus({preventScroll:true});
 }
 function close(){
  if(history.state?.birPropertyOverlay){history.back();return;}
  const url=new URL(location.href);url.searchParams.delete('property');url.hash=anchor;history.replaceState(history.state,'',url);dismiss();
 }
 function inquiry(row,title){
  const url=new URL(propertyDetailsHref(row.mls),location.href);url.searchParams.delete('bir_internal');
  const message=`Hola Don, me interesa ${title} (MLS ${row.mls}). Quisiera información actualizada o coordinar una visita.\n${url.href}`;
  return `<section class="cd-contact"><h3>¿Te interesa esta propiedad?</h3><p>Pide información actualizada a Don, compara esta propiedad con otras opciones o coordina una visita.</p><div class="cd-actions"><a class="button" href="https://wa.me/526241296245?text=${encodeURIComponent(message)}" target="_blank" rel="noopener">WhatsApp a Don ↗</a><a class="cd-email" href="mailto:don@bircabo.com?subject=${encodeURIComponent(title+' · MLS '+row.mls)}&body=${encodeURIComponent(message)}">Correo a Don</a><a class="cd-email" href="tel:+526241296245">Llamar a Don</a></div></section>`;
 }
 function showPhoto(index){
  if(!photos.length||!isOpen())return;photoIndex=(index+photos.length)%photos.length;
  const photo=photos[photoIndex],img=dialog.querySelector('.cd-main-photo');
  img.src=photo.url;img.alt=`${dialog.querySelector('#cd-title').textContent} — foto ${photoIndex+1} de ${photos.length}`;
  dialog.querySelector('.cd-photo-count').textContent=`Foto ${photoIndex+1} de ${photos.length}`;
  dialog.querySelector('.cd-caption').textContent=photo.caption;
  for(const button of dialog.querySelectorAll('[data-photo]'))button.setAttribute('aria-current',Number(button.dataset.photo)===photoIndex?'true':'false');
 }
 function render(row,listing){
  const privateAddress=listing.InternetAddressDisplayYN===false,title=privateAddress?'Detalles de la propiedad':row.name;
  dialog.querySelector('#cd-title').textContent=title;
  photos=(Array.isArray(listing.Media)?listing.Media:[]).map(x=>({url:safeImage(x.MediaURL),caption:String(x.caption||'')})).filter(x=>x.url);
  const facts=[];const lot=listing.General_sp_Description_co_Lot_sp_M2;if(row.kind==='Land'&&Number.isFinite(lot)&&lot>0)facts.push(`${lot.toLocaleString('es-MX')} m² de terreno`);const beds=listing.BedroomsTotal,baths=listing.BathroomsTotalDecimal??listing.BathroomsFull;
  if(row.kind!=='Land'&&beds!=null)facts.push(`${beds} ${beds===1?'recámara':'recámaras'}`);if(row.kind!=='Land'&&baths!=null)facts.push(`${baths} ${baths===1?'baño':'baños'}`);
  const sqft=listing.General_sp_Description_co_AC_sp_SqFt;if(Number.isFinite(sqft)&&sqft>0)facts.push(`${Math.round(sqft).toLocaleString('es-MX')} pies² interiores`);
  const view=listing.General_sp_Description_co_Primary_sp_View;if(view)facts.push(`${viewLabel(view)}`);
  const construction=listing.General_sp_Description_co_Construction;if(construction)facts.push(`Construcción: ${construction==='Completed'?'Terminada':construction}`);
  const gallery=photos.length?`<section class="cd-gallery" aria-label="Fotos de la propiedad"><div class="cd-photo-stage"><img class="cd-main-photo" alt="" width="1200" height="800"></div><div class="cd-photo-controls"><button type="button" class="cd-previous" aria-label="Foto anterior de la propiedad" ${photos.length<2?'disabled':''}>← Anterior</button><span class="cd-photo-count" aria-live="polite"></span><button type="button" class="cd-next" aria-label="Siguiente foto de la propiedad" ${photos.length<2?'disabled':''}>Siguiente →</button></div><p class="cd-caption"></p><div class="cd-thumbs" aria-label="Elige una foto">${photos.map((p,i)=>`<button type="button" data-photo="${i}" aria-label="Ver foto ${i+1}" aria-current="false"><img src="${esc(p.url)}" alt="" width="96" height="64" loading="lazy"></button>`).join('')}</div></section>`:'<p>Pide fotos actuales de la propiedad a Don.</p>';
  const remarks=privateAddress?'':String(listing.PublicRemarks||'');
  dialog.querySelector('#cd-body').innerHTML=`<p class="cd-price">${esc(money(listing.ListPrice))}</p><p class="cd-location">${privateAddress?'Dirección disponible a solicitud':esc(listing.UnparsedAddress||listing.City||'')}</p><ul class="cd-facts">${facts.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>${gallery}${remarks?`<section class="cd-description"><h3>Descripción del anuncio</h3><p class="cd-original-language">Texto original de la inmobiliaria anunciante; puede estar en inglés. Pide a BIR una explicación en español de los detalles que te interesan.</p><p>${esc(remarks)}</p></section>`:''}${inquiry(row,title)}<p class="cd-disclosure">MLS ${esc(row.mls)} · Inmobiliaria anunciante: ${esc(listing.ListOfficeName||'Participante de MLS BCS')}<br>La inmobiliaria anunciante proporciona los datos y la descripción a través de MLS BCS. La información se considera confiable, pero no está garantizada. Los precios y la disponibilidad pueden cambiar; confirma los detalles con Don.</p>`;
  if(photos.length){showPhoto(0);dialog.querySelector('.cd-previous').addEventListener('click',()=>showPhoto(photoIndex-1));dialog.querySelector('.cd-next').addEventListener('click',()=>showPhoto(photoIndex+1));for(const button of dialog.querySelectorAll('[data-photo]'))button.addEventListener('click',()=>showPhoto(Number(button.dataset.photo)));}
 }
 async function open(row,push=false){
  create();controller?.abort();controller=new AbortController();const thisRequest=++requestNumber;active=row.mls;pending='';
  if(!isOpen()){origin=document.activeElement;scrollBefore=window.scrollY;overflowBefore=document.body.style.overflow;document.body.style.overflow='hidden';dialog.showModal();}
  if(push)history.pushState({...history.state,birPropertyOverlay:true},'',propertyDetailsHref(row.mls));
  dialog.querySelector('#cd-title').textContent=row.name;dialog.querySelector('#cd-body').innerHTML='<p role="status">Cargando fotos y detalles de esta propiedad…</p>';dialog.scrollTop=0;photos=[];
  try{
   const response=await fetch('/api/search-pilot?mode=gallery&keys='+encodeURIComponent(row.key),{signal:AbortSignal.any([controller.signal,AbortSignal.timeout(20000)])});if(!response.ok)throw Error('unavailable');
   const data=await response.json(),listing=data.results?.find(x=>x.ListingId===row.mls&&x.ListingKey===row.key);
   if(thisRequest!==requestNumber)return;
   if(!listing||listing.StandardStatus!=='Active'||listing.InternetEntireListingDisplayYN===false||listing.PropertyType!==row.kind||(completedOnly&&row.kind!=='Land'&&listing.General_sp_Description_co_Construction!=='Completed'))throw Error('unavailable');
   render(row,listing);
  }catch{
   if(thisRequest!==requestNumber)return;
   dialog.querySelector('#cd-title').textContent='Detalles actuales de la propiedad';dialog.querySelector('#cd-body').innerHTML=`<p role="status">No podemos confirmar los datos actuales de esta propiedad. Pide información a Don o vuelve a tus resultados.</p>${inquiry(row,'Propiedad MLS '+row.mls)}`;
  }
 }
 function sync(){
  const mls=new URL(location.href).searchParams.get('property');
  if(!mls){dismiss();return;}
  const row=rows.find(x=>x.mls===mls);if(row&&active!==mls)open(row);else if(!row)pending=mls;
 }
 document.addEventListener('click',event=>{
  const link=event.target.closest('a[data-property-details]');if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const row=rows.find(x=>x.mls===link.dataset.propertyDetails);if(!row)return;event.preventDefault();open(row,true);
 });
 window.addEventListener('popstate',sync);
 return {update(nextRows){rows=nextRows;if(active&&!rows.some(row=>row.mls===active)){dismiss();}if(!active||pending)sync();}};
}
