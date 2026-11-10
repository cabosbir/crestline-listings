import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderListings,createHandler,pagePath} from '../api/las-cascadas.js';
import {cascadasMarketSummary} from '../public/bir-cascadas-market.mjs';
const template=readFileSync(new URL('../templates'+pagePath,import.meta.url),'utf8');
const now=Date.parse('2026-11-10T18:00:00Z');
const listing=(id,changes={})=>({ListingKey:String(id),ListingId:'26-'+id,StandardStatus:'Active',PropertyType:'Condos',General_sp_Description_co_Construction:'Completed',City:'Cabo San Lucas',SubdivisionName:'Cascadas',ListPrice:500000,...changes});
const snapshot=(results,age=30000)=>({complete:true,total:results.length,results,fetchedAt:new Date(now-age).toISOString()});
const summary=html=>html.match(/<div id="cascadas-market-summary"[^>]*>([\s\S]*?)<\/div>/)[1];

test('hero count and price range use the same eligible inventory as the listings, before JavaScript',()=>{
 const data=snapshot([listing(1,{ListPrice:399000}),listing(2,{ListPrice:1249000}),listing(3,{ListPrice:1,StandardStatus:'Pending'}),listing(4,{ListPrice:2,InternetEntireListingDisplayYN:false}),listing(5,{ListPrice:3,SubdivisionName:'Other'})]);
 const result=renderListings(template,data,now),content=summary(result.html);
 assert.equal(result.rows.length,2);
 assert.match(content,/2 condos for sale/);assert.match(content,/Asking \$399,000–\$1,249,000 USD/);
 assert.match(content,/datetime="2026-11-10T17:59:30.000Z"/);
 assert.doesNotMatch(result.html,/BIR_CASCADAS_MARKET/);
 assert.equal(content,cascadasMarketSummary(result.rows,data.fetchedAt,false));
});

test('missing, zero and single prices have honest summaries without invented zero prices',()=>{
 for(const price of [null,0,-5]){
  const result=renderListings(template,snapshot([listing(1,{ListPrice:price})]),now);
  assert.match(summary(result.html),/1 condo for sale/);assert.match(summary(result.html),/Asking prices on request/);assert.doesNotMatch(summary(result.html),/\$0/);
 }
 const mixed=renderListings(template,snapshot([listing(1),listing(2,{ListPrice:null})]),now);
 assert.match(summary(mixed.html),/Asking \$500,000 USD · 1 additional price on request/);
});

test('verified empty inventory and feed failure do not reuse prices or make the same availability claim',()=>{
 const empty=summary(renderListings(template,snapshot([]),now).html);
 const failed=summary(renderListings(template,null,now).html);
 assert.match(empty,/No current public MLS listings/);assert.match(failed,/cannot confirm the latest/);
 assert.doesNotMatch(failed,/No current public MLS|\$/);assert.doesNotMatch(empty,/\$/);
 assert.equal(failed,cascadasMarketSummary(null));
});

test('delayed prices are labelled and expired snapshots fall back without hero prices',async()=>{
 assert.match(summary(renderListings(template,snapshot([listing(1)],300000),now).html),/Update delayed/);
 const handler=createHandler({template:async()=>template,now:()=>now,load:async()=>snapshot([listing(1)],3600000)});
 const res={setHeader(){},status(){return this;},send(html){this.html=html;return this;}};
 await handler({method:'GET'},res);
 assert.match(summary(res.html),/cannot confirm the latest/);assert.doesNotMatch(summary(res.html),/\$500,000/);
});
