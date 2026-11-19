import test from 'node:test';
import assert from 'node:assert/strict';
import {loadFeaturedListings} from '../src/lib/featured-listings.mjs';
const checked='2026-11-19T03:00:00.000Z';
const row=n=>({ListingKey:String(n),ListingId:'26-'+n,StandardStatus:'Active',InternetEntireListingDisplayYN:true,ListOfficeName:'Baja International Realty',PropertyType:'Condos',ListPrice:500000,UnparsedAddress:'Condo '+n});
const ok=data=>({ok:true,headers:new Headers({date:new Date(checked).toUTCString()}),json:async()=>data});
const inventory=results=>ok({complete:true,total:results.length,results,fetchedAt:checked});
const options=fetcher=>({fetcher,clock:()=>0,onRows:()=>{}});

test('publishes current facts before either photo request completes and retains them if both fail',async()=>{
 const rows=Array.from({length:25},(_,i)=>row(i+1)), updates=[]; let finish;
 const pending=new Promise(resolve=>finish=resolve);
 const load=loadFeaturedListings({...options(async url=>url.includes('mode=snapshot')?inventory(rows):(await pending,{ok:false})),onRows:result=>updates.push(result)});
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(updates.length,1); assert.equal(updates[0].length,25); assert.equal(updates[0][0].ListPrice,500000);
 finish(); assert.equal((await load).length,25); assert.equal(updates.length,1);
});

test('one failed batch does not discard another batch or its successful photos',async()=>{
 const rows=Array.from({length:25},(_,i)=>row(i+1));
 const final=await loadFeaturedListings(options(async url=>url.includes('mode=snapshot')?inventory(rows):url.endsWith('keys=25')?ok({total:1,results:[{...row(25),Media:[{MediaURL:'https://example.com/photo.jpg'}]}]}):{ok:false}));
 assert.equal(final.length,25);assert.equal(final[24].Media[0].MediaURL,'https://example.com/photo.jpg');assert.equal(final[0].ListingId,'26-1');
});

test('successful detail results remove listings no longer active or public',async()=>{
 const final=await loadFeaturedListings(options(async url=>url.includes('mode=snapshot')?inventory([row(1),row(2),row(3),row(4)]):ok({total:3,results:[{...row(1),ListPrice:490000},{...row(2),StandardStatus:'Closed'},{...row(3),InternetEntireListingDisplayYN:false}]})));
 assert.deepEqual(final.map(r=>r.ListingKey),['1']);assert.equal(final[0].ListPrice,490000);
});

test('malformed or unrelated detail responses cannot replace verified facts',async()=>{
 for(const data of [{total:2,results:[row(1)]},{total:1,results:[row(99)]},{total:2,results:[row(1),row(1)]},{total:1,results:[row(1)],next:'another-page'}]){
  const final=await loadFeaturedListings(options(async url=>url.includes('mode=snapshot')?inventory([row(1)]):ok(data)));
  assert.deepEqual(final,[row(1)]);
 }
});

test('expired, incomplete or duplicated snapshots fail before publishing listings',async()=>{
 for(const data of [{complete:false,total:1,results:[row(1)],fetchedAt:checked},{complete:true,total:2,results:[row(1),row(1)],fetchedAt:checked},{complete:true,total:1,results:[row(1)],fetchedAt:'2026-11-19T01:00:00Z'}]){
  let updates=0;
  await assert.rejects(loadFeaturedListings({...options(async()=>ok(data)),onRows:()=>updates++})); assert.equal(updates,0);
 }
});

test('optional request timeout leaves valid listing facts available',async()=>{
 const abort=new AbortController();
 const final=await loadFeaturedListings({...options(async(url,{signal})=>url.includes('mode=snapshot')?inventory([row(1)]):new Promise((resolve,reject)=>{signal.addEventListener('abort',()=>reject(new Error('Aborted')),{once:true});abort.abort();})),signal:abort.signal});
 assert.deepEqual(final,[row(1)]);
});
