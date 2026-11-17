import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {createHandler} from './las-cascadas.js';
import {createCommunityInventory} from './community-listings.js';
import {snapshotCacheHeaders} from './search-pilot.js';
import {currentRows} from '../public/bir-property-pages.mjs';
import {mlsPageRows} from './mls-page.js';

const money=n=>'$'+Math.round(n).toLocaleString('en-US');
const choices=[['Condos','Completed condos','condos-for-sale-cerritos-beach.html'],['Houses','Completed houses &amp; villas','houses-villas-for-sale-cerritos-beach.html'],['Land','Land &amp; lots','land-for-sale-cerritos-beach.html']];
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
 if(data){const result=cerritosInventorySummary(data,now);summary=result.html;rows=result.completed;headers=snapshotCacheHeaders(data,false,()=>now);}
 return {html:template.replace('<!--BIR_CERRITOS_INVENTORY-->',()=>summary),headers,rows};
}
let pending;
const template=()=>pending??=readFile(join(process.cwd(),'templates/cerritos-beach-real-estate.html'),'utf8').catch(error=>{pending=null;throw error;});
export default createHandler({load:createCommunityInventory(),template,render:renderCerritosGuide});
