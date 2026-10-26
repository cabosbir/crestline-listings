import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import handler,{pagePaths} from '../api/community-listings.js';
import {renderListings,createHandler} from '../api/las-cascadas.js';
import * as english from '../public/bir-property-pages.mjs';
import * as spanish from '../public/bir-property-pages-es.mjs';
import * as land from '../public/bir-development-land-es.mjs';
const now=Date.parse('2026-10-26T23:30:00Z');
const templates=Object.fromEntries(pagePaths.map(p=>[p,readFileSync(new URL('../templates'+p,import.meta.url),'utf8')]));
const row=(id,changes={})=>({ListingKey:String(id),ListingId:'26-'+id,StandardStatus:'Active',PropertyType:'Condos',General_sp_Description_co_Construction:'Completed',City:'Cabo Corridor',Address_co_Community2:'El Tezal-East',SubdivisionName:'Example',UnparsedAddress:'Example '+id,ListPrice:400000+id,BedroomsTotal:2,BathroomsTotalDecimal:2,ListOfficeName:'Example office',...changes});
const rolling={City:'Pacific',Address_co_Community2:'San Cristobal',SubdivisionName:'Rolling Hills',PropertyType:'Houses'};
const data=results=>({complete:true,total:results.length,results,fetchedAt:new Date(now-30000).toISOString()});
const sample=data([row(1,rolling),row(2,{...rolling,PropertyType:'Land',General_sp_Description_co_Lot_sp_M2:1450}),row(3,{...rolling,SubdivisionName:'Elsewhere'}),row(4),row(5,{ListPrice:500000}),row(6,{PropertyType:'Houses',ListPrice:749999}),row(7,{PropertyType:'Houses',ListPrice:750000}),row(8,{PropertyType:'Land',General_sp_Description_co_Lot_sp_M2:25000}),row(9,{General_sp_Description_co_Construction:'Pre-Construction'}),row(10,{StandardStatus:'Pending'}),row(11,{InternetEntireListingDisplayYN:false}),row(12,{PropertyType:'Land',General_sp_Description_co_Lot_sp_M2:19999})]);
const expected=[['26-2','26-1'],['26-5','26-4'],['26-4'],['26-6'],['26-5','26-4'],['26-8']];
for(const [i,p] of pagePaths.entries())test('initial HTML retains the exact community/type/price restrictions: '+p,()=>{
 const {html,rows}=renderListings(templates[p],sample,now);
 assert.deepEqual(rows.map(r=>r.mls),expected[i]);
 const config=JSON.parse(templates[p].match(/<script id="bir-page-config" type="application\/json">([\s\S]*?)<\/script>/)[1]);
 const engine=p===pagePaths[5]?land:p.startsWith('/es/')?spanish:english;
 assert.deepEqual(rows,engine.filterRows(engine.currentRows(sample,config,now),{sort:'price-desc'}));
 assert.equal((html.match(/class="ov-card"/g)||[]).length,rows.length);
 assert.match(html,/datetime="2026-10-26T23:29:30.000Z"/);
 for(const r of rows){assert.ok(html.includes('href="'+p+'?property='+r.mls+'#properties"'));assert.ok(html.includes('MLS '+r.mls));}
 assert.doesNotMatch(html,/BIR_LISTING_|Checking current availability|Consultando disponibilidad actual/);
 if(i===0)assert.match(html,/1,450 m² lot/);
 if(p.startsWith('/es/'))assert.match(html,/Disponibilidad consultada/);
});
test('large inventories include every eligible listing, beyond the browser first twelve',()=>{
 const d=data(Array.from({length:65},(_,i)=>row(i+100)));
 const {html}=renderListings(templates[pagePaths[1]],d,now);
 assert.equal((html.match(/class="ov-card"/g)||[]).length,65);
 assert.match(html,/65 available properties/);
});
test('empty and unavailable states stay distinct in English and Spanish',()=>{
 for(const p of pagePaths){
  const empty=renderListings(templates[p],data([]),now).html;
  const paragraph=empty.match(/<p\b(?=[^>]*\bid="ov-empty")[^>]*>[\s\S]*?<\/p>/)[0];
  assert.doesNotMatch(paragraph,/ hidden/);assert.doesNotMatch(paragraph,/Cascadas/);
  const failed=renderListings(templates[p],null,now);
  assert.equal(failed.headers['Cache-Control'],'no-store');assert.doesNotMatch(failed.html,/class="ov-card"/);
  assert.match(failed.html,p.startsWith('/es/')?/No podemos confirmar/:/cannot confirm/);
 }
});
test('each public URL has a bundled template and no static file shadowing its route',()=>{
 const config=JSON.parse(readFileSync(new URL('../vercel.json',import.meta.url),'utf8'));
 const robots=readFileSync(new URL('../public/robots.txt',import.meta.url),'utf8');
 for(const p of pagePaths){
  assert.ok(config.rewrites.some(r=>r.source===p&&r.destination==='/api/community-listings?guide='+p));
  assert.equal(existsSync(new URL('../public'+p,import.meta.url)),false);
  assert.ok(templates[p].includes('https://www.bircabo.com'+p));
  assert.ok(robots.includes('Allow: '+p));
  for(const token of ['bir-contact-options.js','id="property-shortlist"','id="ov-filters"'])assert.ok(templates[p].includes(token));
 }
 assert.equal(config.functions['api/community-listings.js'].includeFiles,'templates/**/*.html');
});
test('unknown or malicious template selectors are rejected without exposing files',async()=>{
 for(const guide of [undefined,'/../../package.json',['/rolling-hills-real-estate.html'],'/contact']){
  const res={headers:{},setHeader(k,v){this.headers[k]=v;},status(n){this.code=n;return this;},send(s){this.body=s;}};
  await handler({method:'GET',query:{guide}},res);
  assert.equal(res.code,404);assert.equal(res.body,'Page not found.');
 }
});
