import test from 'node:test';
import assert from 'node:assert/strict';
import {storedSnapshot} from '../api/search-pilot.js';
const now=Date.parse('2026-09-19T20:00:00Z');
const valid=()=>({complete:true,total:1,fetchedAt:new Date(now-120000).toISOString(),results:[{ListingKey:'1',StandardStatus:'Active',InternetEntireListingDisplayYN:true,PrivateField:'omit'}]});
const fetcher=data=>async()=>({ok:true,text:async()=>JSON.stringify(data)});
test('stored snapshot keeps original freshness and reapplies public projection',async()=>{
 const data=await storedSnapshot(fetcher(valid()),()=>now);
 assert.equal(data.fetchedAt,valid().fetchedAt);assert.equal(data.results[0].PrivateField,undefined);
});
test('stored snapshot rejects stale, future, partial, duplicate, hidden and failed responses',async()=>{
 const variants=[{...valid(),fetchedAt:new Date(now-300000).toISOString()},{...valid(),fetchedAt:new Date(now+61000).toISOString()},{...valid(),total:2},{...valid(),complete:false},{...valid(),total:2,results:[...valid().results,...valid().results]},{...valid(),results:[{...valid().results[0],InternetEntireListingDisplayYN:false}]}];
 for(const data of variants)await assert.rejects(storedSnapshot(fetcher(data),()=>now));
 await assert.rejects(storedSnapshot(async()=>({ok:false}),()=>now));
});
