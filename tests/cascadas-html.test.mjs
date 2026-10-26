import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {renderListings,createHandler,pagePath} from '../api/las-cascadas.js';
import {currentRows,filterRows} from '../public/bir-property-pages.mjs';
const template=readFileSync(new URL('../templates'+pagePath,import.meta.url),'utf8');
const now=Date.parse('2026-10-26T22:00:00Z');
const listing=(id,changes={})=>({ListingKey:String(id),ListingId:'26-'+id,StandardStatus:'Active',PropertyType:'Condos',General_sp_Description_co_Construction:'Completed',City:'Cabo San Lucas',SubdivisionName:'Cascadas',UnparsedAddress:'Condo '+id,ListPrice:400000+id,BedroomsTotal:2,BathroomsTotalDecimal:2,ListOfficeName:'Example listing office',...changes});
const snapshot=(results=[listing(1)],age=30000)=>({complete:true,total:results.length,results,fetchedAt:new Date(now-age).toISOString()});
const grid=html=>html.match(/<div id="ov-grid" class="ov-grid">([\s\S]*?)<\/div><p id="ov-empty"/)[1];
function response(){return {headers:{},statusCode:0,body:'',setHeader(k,v){this.headers[k]=v;},status(n){this.statusCode=n;return this;},send(s){this.body=s;return this;},end(){return this;}};}

test('all listings, prices, bed/bath counts and attribution exist without executing JavaScript',()=>{
 const data=snapshot(Array.from({length:14},(_,i)=>listing(i+1)));
 const {html,rows}=renderListings(template,data,now),content=grid(html);
 assert.equal(rows.length,14);assert.equal((content.match(/class="ov-card"/g)||[]).length,14);
 assert.match(content,/\$400,001 USD/);assert.match(content,/2 bedrooms · 2 bathrooms/);
 assert.match(content,/Listing office: Example listing office/);assert.match(content,/MLS 26-14/);
 assert.match(content,/\?property=26-1#properties/);assert.match(html,/datetime="2026-10-26T21:59:30.000Z"/);
 assert.doesNotMatch(html,/Checking current availability|BIR_LISTING_/);
});
test('the server and browser select the same active public completed Cascadas condos in price order',()=>{
 const data=snapshot([listing(1,{ListPrice:700000}),listing(2,{ListPrice:500000}),listing(3,{StandardStatus:'Pending'}),listing(4,{InternetEntireListingDisplayYN:false}),listing(5,{General_sp_Description_co_Construction:'Pre-Construction'}),listing(6,{SubdivisionName:'Other community'}),listing(7,{PropertyType:'Houses'})]);
 const actual=renderListings(template,data,now).rows;
 assert.deepEqual(actual.map(r=>r.mls),['26-2','26-1']);
 assert.deepEqual(actual,filterRows(currentRows(data,{scope:'1.5',types:['Condos']},now),{sort:'price-asc'}));
});
test('withheld addresses and untrusted MLS text cannot leak or become page markup',()=>{
 const {html}=renderListings(template,snapshot([listing(1,{InternetAddressDisplayYN:false,UnparsedAddress:'SECRET ADDRESS'}),listing(2,{UnparsedAddress:'<script>alert(1)</script>',ListOfficeName:'<img src=x onerror=alert(1)>'})]),now);
 const content=grid(html);assert.doesNotMatch(content,/SECRET ADDRESS|<script|<img/);
 assert.match(content,/address on request/);assert.match(content,/&lt;script&gt;/);assert.match(content,/&lt;img/);
});
test('missing prices and counts are on request, never zero',()=>{
 const {html}=renderListings(template,snapshot([listing(1,{ListPrice:null,BedroomsTotal:null,BathroomsTotalDecimal:null})]),now);
 assert.match(grid(html),/Price on request/);assert.match(grid(html),/Bedrooms on request · Baths on request/);
});
test('invalid, incomplete, repeated, future and expired snapshots are rejected',()=>{
 const data=snapshot();for(const bad of [{...data,complete:false},{...data,total:2},{...data,total:2,results:[...data.results,...data.results]},snapshot(undefined,-61000),snapshot(undefined,3600000)])assert.throws(()=>renderListings(template,bad,now));
});
test('a verified zero result differs from a feed failure and neither shows old prices',()=>{
 const empty=renderListings(template,snapshot([]),now).html;
 assert.match(empty,/0 available condos/);assert.match(empty,/<p id="ov-empty"[^>]*>There are no current public/);
 const failed=renderListings(template,null,now);
 assert.match(failed.html,/cannot confirm current availability/);assert.equal(grid(failed.html),'');
 assert.doesNotMatch(failed.html,/>There are no current public/);assert.equal(failed.headers['Cache-Control'],'no-store');
});
test('HTML caching is bounded by original snapshot age, delayed data is marked and not cached',()=>{
 const fresh=renderListings(template,snapshot(),now);assert.match(fresh.headers['Vercel-CDN-Cache-Control'],/s-maxage=90, stale-while-revalidate=180/);
 const delayed=renderListings(template,snapshot(undefined,300000),now);
 assert.match(delayed.html,/Update delayed; confirm/);assert.equal(delayed.headers['Vercel-CDN-Cache-Control'],'no-store');
});
test('handler serves the full guide during outages, handles HEAD and rejects writes without loading MLS',async()=>{
 let calls=0;const handler=createHandler({template:async()=>template,now:()=>now,load:async()=>{calls++;throw Error('private provider diagnostic');}});
 const get=response();await handler({method:'GET'},get);
 assert.equal(get.statusCode,200);assert.match(get.body,/<h1/);assert.match(get.body,/cannot confirm current availability/);assert.doesNotMatch(get.body,/private provider diagnostic/);
 const head=response();await handler({method:'HEAD'},head);assert.equal(head.statusCode,200);assert.equal(head.body,'');
 const post=response();await handler({method:'POST'},post);assert.equal(post.statusCode,405);assert.equal(calls,2);
});
test('the public URL routes to its bundled template and retains search and contact features',()=>{
 const config=JSON.parse(readFileSync(new URL('../vercel.json',import.meta.url),'utf8'));
 assert.deepEqual(config.rewrites[0],{source:pagePath,destination:'/api/las-cascadas'});
 assert.equal(existsSync(new URL('../public'+pagePath,import.meta.url)),false);
 assert.equal(config.functions['api/las-cascadas.js'].includeFiles,'templates'+pagePath);
 assert.match(template,new RegExp('rel="canonical" href="https://www.bircabo.com'+pagePath));
 for(const value of ['bir-property-pages.mjs','bir-cascadas.js','bir-contact-options.js','id="property-shortlist"','id="bir-page-config"'])assert.ok(template.includes(value));
});
