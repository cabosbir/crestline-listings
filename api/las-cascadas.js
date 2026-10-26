import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {storedSnapshot, snapshotCacheHeaders} from './search-pilot.js';
import {currentRows, filterRows} from '../public/bir-property-pages.mjs';
import {listingCard} from '../public/bir-listing-card.mjs';

export const pagePath='/las-cascadas-de-pedregal-condos-for-sale.html';
const templatePath=join(process.cwd(),'templates',pagePath.slice(1));
const unavailable='We cannot confirm current availability right now. Please ask Don for the latest Las Cascadas listings or try again shortly.';
const noListings='There are no current public MLS listings in this Cascadas selection. Ask Don about other available condos, including any private offerings.';
let templatePromise;
const loadTemplate=()=>templatePromise??=readFile(templatePath,'utf8').catch(error=>{templatePromise=null;throw error;});

// Reuse the browser's complete-snapshot validation and exact community rules.
// No provider credentials, additional provider requests or bot-specific content.
export function renderListings(template,data,now=Date.now()){
 const config=JSON.parse(template.match(/<script id="bir-page-config" type="application\/json">([\s\S]*?)<\/script>/)[1]);
 let rows=[],status=unavailable,headers={'Cache-Control':'no-store','Vercel-CDN-Cache-Control':'no-store'};
 if(data){
  rows=filterRows(currentRows(data,config,now),{sort:'price-asc'});
  const checked=new Date(data.fetchedAt).toLocaleString('en-US',{timeZone:'America/Mazatlan',year:'numeric',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
  const delayed=now-Date.parse(data.fetchedAt)>=300000?' Update delayed; confirm current availability and prices with Don.':'';
  status=`${rows.length} available ${rows.length===1?'condo':'condos'} · Availability checked <time datetime="${new Date(data.fetchedAt).toISOString()}">${checked} Cabo time</time>.${delayed}`;
  headers=snapshotCacheHeaders(data,false,()=>now);
 }
 const cards=rows.map(row=>listingCard(row,{href:pagePath+'?property='+encodeURIComponent(row.mls)+'#properties'})).join('');
 let html=template.replace('<!--BIR_LISTING_STATUS-->',()=>status).replace('<!--BIR_LISTING_CARDS-->',()=>cards);
 if(data&&rows.length===0)html=html.replace(/(<p id="ov-empty"[^>]*?) hidden><\/p>/,`$1>${noListings}</p>`);
 return {html,headers,rows};
}

export function createHandler({load=storedSnapshot,template=loadTemplate,now=Date.now}={}){
 return async(req,res)=>{
  res.setHeader('Content-Type','text/html; charset=utf-8');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Cache-Control','no-store');
  res.setHeader('Vercel-CDN-Cache-Control','no-store');
  if(!['GET','HEAD'].includes(req.method)){
   res.setHeader('Allow','GET, HEAD');return res.status(405).end();
  }
  let html;
  try{html=await template();}catch{return res.status(503).send('This page is temporarily unavailable. Please try again shortly.');}
  let result;
  try{result=renderListings(html,await load(),now());}
  catch{result=renderListings(html,null,now());}
  for(const [key,value] of Object.entries(result.headers))res.setHeader(key,value);
  res.status(200);
  return req.method==='HEAD'?res.end():res.send(result.html);
 };
}
export default createHandler();
