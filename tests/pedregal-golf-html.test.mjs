import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,existsSync} from 'node:fs';
import {pagePaths} from '../api/community-listings.js';import {renderListings} from '../api/las-cascadas.js';import {SCOPES,GOLF_COMMUNITIES} from '../public/bir-property-scopes.mjs';
const paths=pagePaths.filter(p=>!(/rolling-hills|el-tezal/.test(p))),now=Date.parse('2026-10-27T01:00:00Z');
const templates=Object.fromEntries(paths.map(p=>[p,readFileSync(new URL('../templates'+p,import.meta.url),'utf8')]));
const config=h=>JSON.parse(h.match(/<script id="bir-page-config" type="application\/json">([\s\S]*?)<\/script>/)[1]);
const fields={city:'City',area:'MLSAreaMajor',community:'Address_co_Community2',subdivision:'SubdivisionName'};
function row(scope,kind,id,changes={}){const rule=SCOPES[scope].rules[0],loc={};for(const [k,v]of Object.entries(rule)){if(fields[k])loc[fields[k]]=v[0];if(k==='subdivisionContains')loc.SubdivisionName=v[0];}return {ListingKey:String(id),ListingId:'26-'+id,PropertyType:kind,StandardStatus:'Active',General_sp_Description_co_Construction:'Completed',UnparsedAddress:'Example '+id,ListPrice:100000+id,BedroomsTotal:3,BathroomsTotalDecimal:2,General_sp_Description_co_Lot_sp_M2:1600,ListOfficeName:'Example office',...loc,...changes};}
const data=results=>({complete:true,total:results.length,results,fetchedAt:new Date(now-30000).toISOString()});
test('Pedregal lists all three property types and excludes wrong-city, private, pending and unfinished properties',()=>{
 const good=['Condos','Houses','Land'].map((k,i)=>row('1.4',k,i+1));
 const bad=[row('1.4','Condos',4,{City:'La Paz'}),row('1.4','Houses',5,{InternetEntireListingDisplayYN:false}),row('1.4','Houses',6,{StandardStatus:'Pending'}),row('1.4','Condos',7,{General_sp_Description_co_Construction:'Pre-Construction'})];
 const result=renderListings(templates['/pedregal-real-estate.html'],data([...good,...bad]),now);
 assert.deepEqual(result.rows.map(x=>x.mls),['26-3','26-2','26-1']);assert.match(result.html,/3 bedrooms · 2 bathrooms/);assert.match(result.html,/1,600 m² lot/);
 for(const id of [1,2,3])assert.ok(result.html.includes('/pedregal-real-estate.html?property=26-'+id+'#properties'));
});
test('golf hub and property-type pages include all eligible communities and keep type restrictions',()=>{
 const rows=GOLF_COMMUNITIES.flatMap((s,i)=>['Condos','Houses','Land'].map((k,j)=>row(s,k,i*3+j+100)));
 rows.push(row('1.4','Houses',900),row('2.5','Houses',901,{StandardStatus:'Pending'}));
 const expected={'/los-cabos-golf-properties.html':45,'/condos-los-cabos-golf-communities.html':15,'/houses-villas-los-cabos-golf-communities.html':15,'/land-los-cabos-golf-communities.html':15};
 for(const [p,count]of Object.entries(expected)){const r=renderListings(templates[p],data(rows),now);assert.equal(r.rows.length,count,p);assert.equal((r.html.match(/class="ov-card"/g)||[]).length,count);assert.ok(r.rows.every(x=>x.mls!=='26-900'&&x.mls!=='26-901'));}
});
test('every individual golf guide uses its exact existing community scope and includes prices before JavaScript',()=>{
 const singles=paths.filter(p=>GOLF_COMMUNITIES.includes(config(templates[p]).scope));assert.equal(singles.length,15);
 for(const p of singles){const c=config(templates[p]);const good=['Condos','Houses','Land'].map((k,i)=>row(c.scope,k,i+1));const r=renderListings(templates[p],data([...good,row(c.scope,'Houses',9,{City:'UNRELATED CITY'})]),now);assert.equal(r.rows.length,3,p);assert.match(r.html,/\$100,003 USD/);assert.match(r.html,/datetime="2026-10-27T00:59:30.000Z"/);assert.doesNotMatch(r.html,/BIR_LISTING_|Checking current availability/);}
});
test('all twenty routes retain complete guides and distinguish zero inventory from a feed failure',()=>{
 assert.equal(paths.length,20);const routing=JSON.parse(readFileSync(new URL('../vercel.json',import.meta.url),'utf8'));const robots=readFileSync(new URL('../public/robots.txt',import.meta.url),'utf8');
 for(const p of paths){assert.ok(routing.rewrites.some(r=>r.source===p&&r.destination==='/api/community-listings?guide='+p));assert.equal(existsSync(new URL('../public'+p,import.meta.url)),false);assert.ok(templates[p].includes('https://www.bircabo.com'+p));assert.ok(robots.includes('Allow: '+p));const empty=renderListings(templates[p],data([]),now),failed=renderListings(templates[p],null,now);assert.match(empty.html,/0 available properties/);assert.match(failed.html,/cannot confirm current availability/);assert.doesNotMatch(failed.html,/class="ov-card"/);assert.match(failed.html,/<h1/);assert.equal(failed.headers['Cache-Control'],'no-store');}
});
test('Pedregal preserves its existing guide, full MLS choices and shared inquiry dialog',()=>{
 const h=templates['/pedregal-real-estate.html'];for(const s of ['id="living"','id="pedregal-comparison"','id="explore-rolling-hills"','id="questions"','id="local-help"','community=Pedregal+CSL','data-bir-inquiry','bir-contact-options.js','bir-property-layout.js','id="ov-filters"'])assert.ok(h.includes(s),s);
 assert.equal((h.match(/id="ov-grid"/g)||[]).length,1);assert.equal((h.match(/id="bir-page-config"/g)||[]).length,1);
});
