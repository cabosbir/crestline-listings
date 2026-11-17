import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {createHandler} from './las-cascadas.js';
import {createCommunityInventory} from './community-listings.js';
import {snapshotCacheHeaders} from './search-pilot.js';
import {currentRows} from '../public/bir-property-pages.mjs';
import {mlsPageRows} from './mls-page.js';

const money=n=>'$'+Math.round(n).toLocaleString('en-US');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const choices=[['Condos','Completed condos','condos-for-sale-cerritos-beach.html'],['Houses','Completed houses &amp; villas','houses-villas-for-sale-cerritos-beach.html'],['Land','Land &amp; lots','land-for-sale-cerritos-beach.html']];
const previewChoices=[['Condos','Completed condo','26-4787'],['Houses','Completed house','26-3880'],['Land','Land &amp; lot','26-4385']];
export function cerritosPreviews(completed){
 // Preferred examples remain only while active, public and in the same collection.
 // If an example leaves the selection, use a current priced listing of that type.
 const selected=previewChoices.flatMap(([kind,label,preferred])=>{
  const eligible=completed.filter(x=>x.kind===kind&&Number.isFinite(x.price)&&x.price>0&&/^\d{2}-\d+$/.test(x.mls));
  const row=eligible.find(x=>x.mls===preferred)||eligible.sort((a,b)=>String(b.modifiedAt||'').localeCompare(String(a.modifiedAt||''))||a.mls.localeCompare(b.mls))[0];
  return row?[{...row,label}]:[];
 });
 const cards=selected.map(x=>{
  const href='/property-search.html?mls='+encodeURIComponent(x.mls);
  const facts=x.kind==='Land'?(x.lotM2?x.lotM2.toLocaleString('en-US')+' m² lot':'Lot size on request'):[x.beds==null?'Bedrooms on request':x.beds+' bedrooms',x.baths==null?'Bathrooms on request':x.baths+' bathrooms'].join(' · ');
  return '<article class="buyer-box" data-cerritos-preview="'+esc(x.mls)+'"><p class="eyebrow">'+x.label+'</p><h4><a href="'+href+'">'+esc(x.name)+'</a></h4><p><strong>'+money(x.price)+' USD</strong></p><p>'+esc(facts)+'</p><p>'+esc(x.community)+' · MLS '+esc(x.mls)+'</p><p>Listing office: '+esc(x.office||'MLS BCS participant')+'</p><a class="button secondary" href="'+href+'">View photos &amp; MLS details →</a></article>';
 }).join('');
 return {selected,html:cards?'<section aria-labelledby="cerritos-preview-title" id="cerritos-mls-previews"><h3 id="cerritos-preview-title">Explore current Cerritos MLS listings</h3><p>A completed condo, a completed house and a lot from the focused Cerritos collections above, when available. Asking prices are in USD; these examples use the same availability check as the summary.</p><div class="buyer-columns">'+cards+'</div><p class="buyer-note">Examples refresh with active public MLS availability. Listings may be represented by other offices. All information is deemed reliable but not guaranteed; confirm price, availability and property details with your agent.</p></section>':''};
}
export function cerritosInventorySummary(data,now=Date.now()){
 if(!data)throw Error('Inventory unavailable');
 // Exactly the same completed-property and location rules as the six collections.
 const completed=currentRows(data,{scope:'5',types:['Condos','Houses','Land']},now);
 const full=mlsPageRows(data,{community:'Pescadero/Cerritos'},now).filter(x=>['Condos','Houses','Land'].includes(x.PropertyType));
 const table=choices.map(([kind,label,path])=>{
  const rows=completed.filter(x=>x.kind===kind),prices=rows.map(x=>x.price).filter(x=>Number.isFinite(x)&&x>0);
  const range=prices.length?(Math.min(...prices)===Math.max(...prices)?money(prices[0]):money(Math.min(...prices))+'–'+money(Math.max(...prices))):'Price on request';
  const missing=rows.length-prices.length;
  return '<tr><th scope="row"><a href="/'+path+'#ov-status">'+label+'</a></th><td>'+rows.length+'</td><td>'+range+(missing?' ('+missing+' price'+(missing===1?'':'s')+' on request)':'')+'</td></tr>';
 }).join('');
 const stamp=new Date(data.fetchedAt),checked=stamp.toLocaleString('en-US',{timeZone:'America/Mazatlan',year:'numeric',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
 const delayed=now-stamp.getTime()>=300000?' Update delayed; confirm availability and prices with Don.':'';
 return {completed,full,html:'<aside class="cerritos-inventory" aria-labelledby="cerritos-inventory-title"><h3 id="cerritos-inventory-title">Current Cerritos property choices</h3><p>Active public MLS listings matching our focused Cerritos collections, with no price or bedroom limits.</p><table><caption>Focused Cerritos collections · all views</caption><thead><tr><th scope="col">Property type</th><th scope="col">Listings</th><th scope="col">Asking prices · USD</th></tr></thead><tbody>'+table+'</tbody></table><p><strong>Wider Pescadero/Cerritos MLS: '+full.length.toLocaleString('en-US')+' active homes, condos and lots.</strong> This broader community includes Pescadero and El Gavilán, as well as Cerritos, and includes preconstruction and other construction stages. It is a different selection from the focused collections above.</p><p class="buyer-note">Availability checked <time datetime="'+stamp.toISOString()+'">'+checked+' Cabo time</time>.'+delayed+' Counts refresh from the MLS; asking prices and availability can change. Private and off-market listings are not included.</p></aside>'};
}
export function renderCerritosGuide(template,data,now=Date.now()){
 let summary='<aside class="cerritos-inventory"><h3>Current Cerritos property choices</h3><p>We cannot confirm current inventory counts or asking prices right now. Open a search below or ask Don for the latest availability.</p></aside>';
 let headers={'Cache-Control':'no-store','Vercel-CDN-Cache-Control':'no-store'},rows=[];
 if(data){const result=cerritosInventorySummary(data,now);summary=result.html+cerritosPreviews(result.completed).html;rows=result.completed;headers=snapshotCacheHeaders(data,false,()=>now);}
 return {html:template.replace('<!--BIR_CERRITOS_INVENTORY-->',()=>summary),headers,rows};
}
let pending;
const template=()=>pending??=readFile(join(process.cwd(),'templates/cerritos-beach-real-estate.html'),'utf8').catch(error=>{pending=null;throw error;});
export default createHandler({load:createCommunityInventory(),template,render:renderCerritosGuide});
