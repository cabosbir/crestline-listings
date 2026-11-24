import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {createHandler} from './las-cascadas.js';
import {createCommunityInventory} from './community-listings.js';
import {snapshotCacheHeaders} from './search-pilot.js';
import {currentRows} from '../public/bir-property-pages.mjs';
import {mlsPageRows} from './mls-page.js';

const money=n=>'$'+Math.round(n).toLocaleString('en-US');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const choices=[['Condos','Completed condos','condos-for-sale-todos-santos.html'],['Houses','Completed houses &amp; villas','houses-villas-for-sale-todos-santos.html'],['Land','Land &amp; lots','land-for-sale-todos-santos.html']];
const previewChoices=[['Condos','Completed condo','25-686'],['Houses','Completed house','26-4843'],['Land','Land &amp; lot','26-3833']];
export function todosSantosPreviews(completed){
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
  return '<article class="buyer-box" data-todos-santos-preview="'+esc(x.mls)+'"><p class="eyebrow">'+x.label+'</p><h4><a href="'+href+'">'+esc(x.name)+'</a></h4><p><strong>'+money(x.price)+' USD</strong></p><p>'+esc(facts)+'</p><p>'+esc(x.community)+' · MLS '+esc(x.mls)+'</p><p>Listing office: '+esc(x.office||'MLS BCS participant')+'</p><a class="button secondary" href="'+href+'">View photos &amp; MLS details →</a></article>';
 }).join('');
 return {selected,html:cards?'<section aria-labelledby="todos-santos-preview-title" id="todos-santos-mls-previews"><h3 id="todos-santos-preview-title">Explore current Todos Santos MLS listings</h3><p>A completed condo, a completed house and a lot from the Todos Santos and Todos Santos North collections above, when available. Asking prices are in USD; these examples use the same availability check as the summary.</p><div class="buyer-columns">'+cards+'</div><p class="buyer-note">Examples refresh with active public MLS availability. Listings may be represented by other offices. All information is deemed reliable but not guaranteed; confirm price, availability and property details with your agent.</p></section>':''};
}
const budgets=[
 {limit:300000,preferred:'26-1122'},
 {limit:500000,preferred:'25-5459'},
 {limit:1000000,preferred:'26-228'}
];
export function todosSantosBudgets(completed){
 const used=new Set();
 const groups=budgets.map(({limit,preferred},index)=>{
  const rows=completed===null?null:completed.filter(x=>x.kind==='Houses'&&Number.isFinite(x.price)&&x.price>0&&x.price<limit);
  const candidates=(rows||[]).filter(x=>/^\d{2}-\d+$/.test(x.mls)&&!used.has(x.mls));
  const floor=index?budgets[index-1].limit:0;
  const band=candidates.filter(x=>x.price>=floor);
  const example=band.find(x=>x.mls===preferred)||band.sort((a,b)=>b.price-a.price||a.mls.localeCompare(b.mls))[0]||candidates.sort((a,b)=>b.price-a.price||a.mls.localeCompare(b.mls))[0]||null;
  if(example)used.add(example.mls);
  return {limit,count:rows===null?null:rows.length,example,href:'/houses-villas-for-sale-todos-santos.html?price=0-'+limit+'#ov-status'};
 });
 const cards=groups.map(({limit,count,example:x,href})=>{
  const countText=count===null?'Current availability cannot be confirmed.':count+' completed '+(count===1?'house':'houses')+' currently listed below this budget.';
  const facts=x?[x.beds==null?null:x.beds+' '+(x.beds===1?'bedroom':'bedrooms'),x.baths==null?null:x.baths+' '+(x.baths===1?'bathroom':'bathrooms')].filter(Boolean).join(' · '):'';
  const example=x?'<div data-todos-santos-budget-example="'+esc(x.mls)+'"><p class="eyebrow">Current MLS example</p><h4><a href="/property-search.html?mls='+encodeURIComponent(x.mls)+'">'+esc(x.name)+'</a></h4><p><strong>'+money(x.price)+' USD</strong> · MLS '+esc(x.mls)+'</p><p>'+esc(facts)+'</p><p>'+esc(x.community)+' · '+esc(x.mlsCommunity)+'</p><p class="buyer-note">Completed house · Listing office: '+esc(x.office||'MLS BCS participant')+'</p></div>':count===null?'':count===0?'<p>No completed houses currently match this price limit. Open the search to check for new listings.</p>':'<p>Open the search to compare the matching houses.</p>';
  return '<article class="buyer-box" data-todos-santos-budget="'+limit+'"><h3>Under '+money(limit)+' USD</h3><p><strong>'+countText+'</strong></p>'+example+'<a class="button secondary" href="'+href+'">Search houses under '+money(limit)+'</a></article>';
 }).join('');
 return {groups,html:'<section id="budget-comparison" aria-labelledby="todos-santos-budget-title"><h2 id="todos-santos-budget-title">What can you buy in Todos Santos under $300K, $500K or $1M?</h2><p>Compare completed houses and villas in Todos Santos and Todos Santos North. Each search includes every priced house below its limit, across all views and bedroom counts. The limits overlap: the under-$500K search also includes homes under $300K.</p><div class="buyer-columns">'+cards+'</div><p class="buyer-note">Counts and examples use the MLS availability check above and refresh together. Examples illustrate individual asking prices, not sold values or a neighborhood average. A higher budget does not guarantee a particular view, location or condition. Confirm the listing details and availability with Don.</p><p>These budgets are for the asking price only. Allow separately for <a href="/buying-property-in-cabo.html#closing-costs">buying and closing costs</a>, any repairs, and ongoing ownership expenses. Compare the actual neighborhood, road access, utilities and maintenance needs before choosing.</p><p>Looking for a different property type? Browse <a href="/condos-for-sale-todos-santos.html">completed condos</a>, <a href="/land-for-sale-todos-santos.html">land and lots</a>, or the <a href="/property-search.html?community=Todos%20Santos%20%2B%20Todos%20Santos%20North">full Todos Santos + Todos Santos North MLS, including preconstruction</a>.</p></section>'};
}
export function todosSantosInventorySummary(data,now=Date.now()){
 if(!data)throw Error('Inventory unavailable');
 // The same Pacific North / Todos Santos and Todos Santos North scope as the collections.
 const completed=currentRows(data,{scope:'7',types:['Condos','Houses','Land']},now);
 const all=mlsPageRows(data,{community:'Todos Santos + Todos Santos North'},now),full=all.filter(x=>['Condos','Houses','Land'].includes(x.PropertyType));
 const table=choices.map(([kind,label,path])=>{
  const rows=completed.filter(x=>x.kind===kind),prices=rows.map(x=>x.price).filter(x=>Number.isFinite(x)&&x>0);
  const range=prices.length?(Math.min(...prices)===Math.max(...prices)?money(prices[0]):money(Math.min(...prices))+'–'+money(Math.max(...prices))):'Price on request';
  const missing=rows.length-prices.length;
  return '<tr><th scope="row"><a href="/'+path+'#ov-status">'+label+'</a></th><td>'+rows.length+'</td><td>'+range+(missing?' ('+missing+' price'+(missing===1?'':'s')+' on request)':'')+'</td></tr>';
 }).join('');
 const stamp=new Date(data.fetchedAt),checked=stamp.toLocaleString('en-US',{timeZone:'America/Mazatlan',year:'numeric',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
 const delayed=now-stamp.getTime()>=300000?' Update delayed; confirm availability and prices with Don.':'';
 return {completed,full,html:'<aside class="todos-santos-inventory" aria-labelledby="todos-santos-inventory-title"><h3 id="todos-santos-inventory-title">Current Todos Santos property choices</h3><p>Active public MLS listings in the MLS communities Todos Santos and Todos Santos North, with no price or bedroom limits.</p><table><caption>Todos Santos + Todos Santos North collections · all views</caption><thead><tr><th scope="col">Property type</th><th scope="col">Listings</th><th scope="col">Asking prices · USD</th></tr></thead><tbody>'+table+'</tbody></table><p><strong>Full Todos Santos + Todos Santos North MLS: '+all.length.toLocaleString('en-US')+' active public listings across all property types, including '+full.length.toLocaleString('en-US')+' homes, condos and lots.</strong> This search covers the same two MLS communities and includes preconstruction and other construction stages. The collections above show completed residences and land only.</p><p class="buyer-note">Availability checked <time datetime="'+stamp.toISOString()+'">'+checked+' Cabo time</time>.'+delayed+' Counts refresh from the MLS; asking prices and availability can change. Private and off-market listings are not included.</p></aside>'};
}
export function renderTodosSantosGuide(template,data,now=Date.now()){
 let summary='<aside class="todos-santos-inventory"><h3>Current Todos Santos property choices</h3><p>We cannot confirm current inventory counts or asking prices right now. Open a search below or ask Don for the latest availability.</p></aside>';
 let headers={'Cache-Control':'no-store','Vercel-CDN-Cache-Control':'no-store'},rows=[];
 if(data){const result=todosSantosInventorySummary(data,now);summary=result.html+todosSantosPreviews(result.completed).html+todosSantosBudgets(result.completed).html;rows=result.completed;headers=snapshotCacheHeaders(data,false,()=>now);}
 else summary+=todosSantosBudgets(null).html;
 return {html:template.replace('<!--BIR_TODOS_SANTOS_INVENTORY-->',()=>summary),headers,rows};
}
let pending;
const template=()=>pending??=readFile(join(process.cwd(),'templates/todos-santos-real-estate.html'),'utf8').catch(error=>{pending=null;throw error;});
export default createHandler({load:createCommunityInventory(),template,render:renderTodosSantosGuide});

