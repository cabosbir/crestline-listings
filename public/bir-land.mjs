import {CABO_AREAS,matchesArea,sortByPrice,restoreCollectionFilters,rememberCollectionFilters} from './bir-collection-utils.mjs';
export {CABO_AREAS};
import {landDetailsHref,setupLandDetails} from './bir-land-details.mjs';

export const WATER_VIEWS=['Ocean','Oceanfront','Arch','Marina'];
export function eligibleLand(data, now=Date.now()) {
  const age=now-Date.parse(data.fetchedAt);
  if(data.complete!==true||!Array.isArray(data.results)||data.total!==data.results.length||new Set(data.results.map(x=>x.ListingKey)).size!==data.total||!Number.isFinite(age)||age< -60000||age>=3600000)throw Error('Current inventory unavailable');
  return data.results.filter(x=>x.StandardStatus==='Active'&&x.PropertyType==='Land'&&CABO_AREAS.includes(x.City)&&x.InternetEntireListingDisplayYN!==false).map(x=>({
    key:x.ListingKey,mls:x.ListingId,area:x.City,name:x.InternetAddressDisplayYN===false?'Land · address on request':x.UnparsedAddress||x.SubdivisionName||'Cabo land',
    community:x.InternetAddressDisplayYN===false?'Address on request':x.SubdivisionName||'Subdivision on request',
    price:Number.isFinite(x.ListPrice)&&x.ListPrice>0?x.ListPrice:null,lotM2:Number.isFinite(x.General_sp_Description_co_Lot_sp_M2)&&x.General_sp_Description_co_Lot_sp_M2>0?x.General_sp_Description_co_Lot_sp_M2:null,mlsCommunity:x.Address_co_Community2||'',
    view:x.General_sp_Description_co_Primary_sp_View==='Select One'?'':x.General_sp_Description_co_Primary_sp_View||'',office:x.ListOfficeName||''
  })).sort((a,b)=>(a.price??Infinity)-(b.price??Infinity)||String(a.mls).localeCompare(String(b.mls)));
}
export function filterLand(rows,{price='all',size='0',view='',area='',sort='price-asc'}={}){
  const range=price==='all'?null:price.split('-').map(Number);
  return sortByPrice(rows.filter(x=>(!range||(x.price!==null&&x.price>=range[0]&&x.price<range[1]))&&(!Number(size)||(x.lotM2!==null&&x.lotM2>=Number(size)))&&(!view||(view==='water'?WATER_VIEWS.includes(x.view):x.view===view))&&matchesArea(x,area)),sort);
}
export function shortlistPayload(form){
  return {name:String(form.get('name')||'').trim(),email:String(form.get('email')||'').trim(),phone:'',inquiryType:'buying',propertyType:'land',preferredAgent:'Don Weis',agentEmail:'don@bircabo.com',website:String(form.get('website')||''),
    message:`Cabo land shortlist\nSource: https://www.bircabo.com/cabo-land-for-sale.html\nBudget (USD): ${form.get('budget')||'Not specified'}\nIntended use: ${form.get('use')||'Not specified'}\nBuying timeframe: ${form.get('timing')||'Not specified'}\n\n${String(form.get('message')||'').trim()}`};
}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>n==null?'Price on request':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n)+' USD';

if(typeof document!=='undefined'){
  const grid=document.querySelector('#ov-grid'),status=document.querySelector('#ov-status'),more=document.querySelector('#ov-more'),empty=document.querySelector('#ov-empty'),filters=document.querySelector('#ov-filters');
  const details=setupLandDetails({returnLabel:'Back to Cabo land'});
  let rows=[],limit=12,busy=false,expiry,checkedAt='',version=0;const photos=new Map();
  const card=x=>`<article class="ov-card" data-mls="${esc(x.mls)}"><a class="ov-image-link" href="${esc(landDetailsHref(x.mls))}" data-land-details="${esc(x.mls)}" aria-label="Photos and details for ${esc(x.name)}">${photos.has(x.key)?`<img src="${esc(photos.get(x.key))}" alt="${esc(x.name)} — listing photo" width="600" height="400" loading="lazy">`:'<span>Loading property photo…</span>'}</a><div class="ov-card-body"><span class="ov-badge">Land${x.view?' · '+esc(x.view)+' view':''}</span><p class="ov-price">${money(x.price)}</p><h3><a href="${esc(landDetailsHref(x.mls))}" data-land-details="${esc(x.mls)}">${esc(x.name)}</a></h3><p>${x.lotM2===null?'Lot size on request':esc(x.lotM2.toLocaleString('en-US',{maximumFractionDigits:1}))+' m² lot'+(x.lotM2>=10000?' · '+esc((x.lotM2/10000).toLocaleString('en-US',{maximumFractionDigits:2}))+' ha':'')}</p><p>${esc(x.area)} · ${esc(x.community)}</p><p class="ov-office">Listing office: ${esc(x.office||'MLS BCS participant')}</p><div class="ov-card-foot"><span>MLS ${esc(x.mls)}</span><a href="${esc(landDetailsHref(x.mls))}" data-land-details="${esc(x.mls)}">Photos &amp; details →</a></div></div></article>`;
  const choices=()=>({price:document.querySelector('#ov-price').value,size:document.querySelector('#ov-size').value,view:document.querySelector('#ov-view').value,area:document.querySelector('#ov-area').value,sort:document.querySelector('#ov-sort').value});
  async function loadPhotos(visible,stamp){
    const missing=visible.filter(x=>!photos.has(x.key));
    for(let i=0;i<missing.length;i+=24){
      try{
        const requested=new Set(missing.slice(i,i+24).map(x=>x.key));
        const response=await fetch('/api/search-pilot?keys='+encodeURIComponent([...requested].join(',')),{signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error();
        const data=await response.json();
        for(const x of data.results||[]){
          if(!requested.has(x.ListingKey)||x.StandardStatus!=='Active'||x.InternetEntireListingDisplayYN===false||x.PropertyType!=='Land'||!CABO_AREAS.includes(x.City))continue;
          const src=x.Media?.[0]?.MediaURL;if(typeof src==='string'&&src.startsWith('https://'))photos.set(x.ListingKey,src);
        }
      }catch{/* Keep contact and detail options available when an image fails. */}
    }
    if(stamp!==version)return;
    for(const row of visible){const container=grid.querySelector(`[data-mls="${row.mls}"] .ov-image-link`);if(!container)continue;
      const src=photos.get(row.key);if(src&&!container.querySelector('img')){const img=document.createElement('img');img.src=src;img.alt=row.name+' — listing photo';img.width=600;img.height=400;img.loading='lazy';container.replaceChildren(img);}else if(!src){const span=container.querySelector('span');if(span)span.textContent='Open photos & details';}
    }
  }
  function render(){rememberCollectionFilters([["area", "ov-area", ""], ["price", "ov-price", "all"], ["size", "ov-size", "0"], ["view", "ov-view", ""], ["sort", "ov-sort", "price-asc"]]);const selected=filterLand(rows,choices()),visible=selected.slice(0,limit),stamp=++version;
    grid.innerHTML=visible.map(card).join('');more.hidden=selected.length<=limit;more.textContent=`Show ${Math.min(12,Math.max(0,selected.length-limit))} more land`;empty.hidden=selected.length!==0;
    status.innerHTML=`<span>${selected.length} matching land listings · Showing ${visible.length}</span><strong>${document.querySelector('#ov-sort').value==='price-desc'?'HIGHEST PRICE FIRST':'LOWEST PRICE FIRST'}</strong><span class="ov-checked">Availability checked ${esc(checkedAt)}.</span>`;
    void loadPhotos(visible,stamp);details.update(rows);
  }
  function clear(message){rows=[];version++;grid.replaceChildren();more.hidden=true;empty.hidden=true;status.textContent=message;details.update([]);}
  async function refresh(){if(busy)return;busy=true;
    try{const response=await fetch('/api/search-pilot?mode=snapshot',{signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error();const data=await response.json();rows=eligibleLand(data);
      checkedAt=new Date(data.fetchedAt).toLocaleString('en-US',{timeZone:'America/Mazatlan',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})+' Cabo time';
      if(Date.now()-Date.parse(data.fetchedAt)>=300000)checkedAt+=' (update delayed; confirm availability with Don)';render();clearTimeout(expiry);
      expiry=setTimeout(()=>clear('This availability check has expired. Reload to check again, or ask Don for current options.'),Math.max(0,3600000-(Date.now()-Date.parse(data.fetchedAt))));
    }catch{clear('We cannot confirm current land availability right now. Reload to try again, ask Don for a shortlist, or use the complete MLS search.');}finally{busy=false;}
  }
  restoreCollectionFilters([["area", "ov-area", ""], ["price", "ov-price", "all"], ["size", "ov-size", "0"], ["view", "ov-view", ""], ["sort", "ov-sort", "price-asc"]]);
  filters.addEventListener('submit',e=>e.preventDefault());filters.addEventListener('change',()=>{limit=12;render();});filters.addEventListener('reset',()=>setTimeout(()=>{limit=12;render();},0));more.addEventListener('click',()=>{limit+=12;render();});void refresh();setInterval(()=>{if(!document.hidden)void refresh();},300000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)void refresh();});

  const form=document.querySelector('#land-shortlist'),button=form.querySelector('button[type="submit"]'),formStatus=form.querySelector('.buyer-form-status');
  form.addEventListener('submit',async event=>{event.preventDefault();if(button.disabled)return;const payload=shortlistPayload(new FormData(form));button.disabled=true;button.textContent='Sending…';formStatus.textContent='';
    try{const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(25000)});const result=await response.json();if(!response.ok||result.success!==true)throw Error();
      document.dispatchEvent(new CustomEvent('bir-lead-result',{detail:{form:'general_contact',outcome:'success'}}));formStatus.textContent='Thank you. Your land shortlist request has been sent to Don at Baja International Realty.';button.textContent='Request sent';form.reset();
    }catch{document.dispatchEvent(new CustomEvent('bir-lead-result',{detail:{form:'general_contact',outcome:'error'}}));formStatus.replaceChildren(document.createTextNode('We could not confirm delivery. Your request is still here. '));const email=document.createElement('a');email.href='mailto:don@bircabo.com?subject='+encodeURIComponent('Cabo land shortlist')+'&body='+encodeURIComponent(payload.message);email.textContent='Email Don instead';formStatus.append(email);button.disabled=false;button.textContent='Try sending again';}
  });
}
