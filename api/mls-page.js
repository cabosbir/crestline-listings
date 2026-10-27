import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {createHandler} from './las-cascadas.js';
import {createCommunityInventory} from './community-listings.js';
import {snapshotCacheHeaders} from './search-pilot.js';
import {defaults,filterListings} from '../public/bir-pilot-search.mjs';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>Number.isFinite(n)&&n>0?'$'+Math.round(n).toLocaleString('en-US')+' USD':'Price on request';
export function mlsPageRows(data,query={},now=Date.now()){
 const age=now-Date.parse(data.fetchedAt);
 if(data.complete!==true||!Array.isArray(data.results)||data.total!==data.results.length||new Set(data.results.map(x=>x.ListingKey)).size!==data.total||!Number.isFinite(age)||age< -60000||age>=3600000)throw Error('Current inventory unavailable');
 const type=({land:'Land',houses:'Houses',house:'Houses',homes:'Houses',condos:'Condos',condo:'Condos'})[String(query.type||'').toLowerCase()]||'';
 const community=['El Tezal-East','El Tezal-West','Pedregal CSL','Pescadero/Cerritos'].includes(query.community)?query.community:'';
 const subdivision=query.subdivision==='Cascadas'?'Cascadas':'';
 const mls=typeof query.mls==='string'&&query.mls.split(',').length<=50&&query.mls.split(',').every(id=>/^[\d-]{3,20}$/.test(id))?query.mls:'';
 return filterListings(data.results.filter(p=>p.PropertyType!=='Reservations Only'),{...defaults(),PropertyType:type,Address_co_Community2:community,SubdivisionName:subdivision,query:mls}).sort((a,b)=>String(b.ModificationTimestamp||'').localeCompare(String(a.ModificationTimestamp||'')));
}
export function renderMlsPage(template,data,now=Date.now(),req={}){
 let rows=[],count='We cannot confirm current availability right now. Please try again shortly or send Don an inquiry.',timestamp='',cards='',headers={'Cache-Control':'no-store','Vercel-CDN-Cache-Control':'no-store'};
 if(data){rows=mlsPageRows(data,req.query,now);headers=snapshotCacheHeaders(data,false,()=>now);count=rows.length.toLocaleString('en-US')+' matching properties · Showing '+Math.min(24,rows.length);
 timestamp='Availability checked <time datetime="'+new Date(data.fetchedAt).toISOString()+'">'+new Date(data.fetchedAt).toLocaleString('en-US',{timeZone:'America/Mazatlan',year:'numeric',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})+' Cabo time</time>.'+(now-Date.parse(data.fetchedAt)>=300000?' Update delayed; confirm current prices and availability with Don.':'');
 cards=rows.slice(0,24).map(p=>{const href='/property-search.html?mls='+encodeURIComponent(p.ListingId),name=p.InternetAddressDisplayYN===false?'Property · address on request':p.UnparsedAddress||p.SubdivisionName||'Property details';const size=Number(p.General_sp_Description_co_Lot_sp_M2);const facts=p.PropertyType==='Land'?(size>0?size.toLocaleString('en-US')+' m² lot':'Lot size on request'):(p.BedroomsTotal==null?'Bedrooms on request':p.BedroomsTotal+' bedrooms')+' · '+((p.BathroomsTotalDecimal??p.BathroomsFull)==null?'Baths on request':(p.BathroomsTotalDecimal??p.BathroomsFull)+' bathrooms');return '<article class="card" data-mls="'+esc(p.ListingId)+'"><div class="photo-placeholder">Open photos and details</div><div class="content"><h2><a href="'+esc(href)+'">'+esc(name)+'</a></h2><strong>'+money(p.ListPrice)+'</strong><p>'+esc(p.PropertyType)+' · '+esc(p.General_sp_Description_co_Construction||'')+'</p><p>'+esc(facts)+'</p><p>'+esc(p.City)+' · MLS '+esc(p.ListingId)+'</p><p>Listing office: '+esc(p.ListOfficeName||'MLS BCS participant')+'</p><a href="'+esc(href)+'">Photos and details →</a></div></article>';}).join('');
 }
 return {html:template.replace('<!--BIR_MLS_COUNT-->',()=>count).replace('<!--BIR_MLS_TIMESTAMP-->',()=>timestamp).replace('<!--BIR_MLS_CARDS-->',()=>cards),rows,headers};
}
let pending;
const template=()=>pending??=readFile(join(process.cwd(),'templates/property-search.html'),'utf8').catch(error=>{pending=null;throw error;});
export default createHandler({load:createCommunityInventory(),template,render:renderMlsPage});
