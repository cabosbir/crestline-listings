import test from 'node:test';
import assert from 'node:assert/strict';
import {buildSnapshot,createInventoryCache} from '../api/search-pilot.js';
const row=id=>({ListingKey:id,StandardStatus:'Active',InternetEntireListingDisplayYN:true,UnparsedAddress:'Public address'});
const ok=data=>({ok:true,json:async()=>data});
test('snapshot consumes all pages, projects public fields, and validates total',async()=>{
 let calls=0;
 const data=await buildSnapshot('https://example.com/Property','test',async()=>++calls===1?ok({'@odata.count':2,value:[{...row('1'),SecretField:'hidden'}],'@odata.nextLink':'?page=2'}):ok({value:[row('2')]}));
 assert.equal(calls,2);assert.equal(data.total,2);assert.equal(data.complete,true);assert.equal(data.results[0].SecretField,undefined);
});
test('partial, duplicate, changed counts and external continuations never become snapshots',async()=>{
 for(const first of [
 {'@odata.count':2,value:[row('1')]},
 {'@odata.count':2,value:[row('1'),row('1')]},
 {'@odata.count':1,value:[row('1')],'@odata.nextLink':'https://other.example/Property'},
 {'@odata.count':1,value:[{...row('1'),InternetEntireListingDisplayYN:false}]}
 ])await assert.rejects(buildSnapshot('https://example.com/Property','test',async()=>ok(first)));
 let calls=0;await assert.rejects(buildSnapshot('https://example.com/Property','test',async()=>++calls===1?ok({'@odata.count':2,value:[row('1')],'@odata.nextLink':'?page=2'}):ok({'@odata.count':3,value:[row('2')]})));
});
test('concurrent visitors share one refresh, successful snapshot is reused',async()=>{
 let calls=0,time=0,finish;
 const get=createInventoryCache(()=>{calls++;return new Promise(resolve=>finish=resolve)},()=>time);
 const first=get(),second=get();await Promise.resolve();finish({complete:true,total:4});
 assert.deepEqual(await first,await second);assert.equal(calls,1);await get();assert.equal(calls,1);
 time=60001;const next=get();await Promise.resolve();finish({complete:true,total:5});assert.equal((await next).total,5);assert.equal(calls,2);
});
test('failed refresh is not cached as success and cannot create a retry storm',async()=>{
 let calls=0,time=0;
 const get=createInventoryCache(async()=>{calls++;throw new Error('429')},()=>time);
 await assert.rejects(get());await assert.rejects(get());assert.equal(calls,1);
 time=30001;await assert.rejects(get());assert.equal(calls,2);
});
