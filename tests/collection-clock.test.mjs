import test from 'node:test';
import assert from 'node:assert/strict';
import {currentRows,snapshotResponseTime} from '../public/bir-property-pages.mjs';

const serverNow=Date.parse('2026-10-10T21:12:00Z');
const headers=(age=null,date=new Date(serverNow).toUTCString())=>new Headers({...(date===null?{}:{Date:date}),...(age===null?{}:{Age:age})});
const snapshot=()=>({complete:true,total:1,fetchedAt:new Date(serverNow-30000).toISOString(),results:[{
 ListingKey:'1',ListingId:'26-1',StandardStatus:'Active',PropertyType:'Condos',
 General_sp_Description_co_Construction:'Completed',City:'San Jose Corridor',
 Address_co_Community2:'Cabo Real-Inland',ListPrice:500000
}]});

test('fresh golf listings survive a visitor clock eight minutes behind or a day ahead',()=>{
 const data=snapshot(),config={golf:true};
 // Reproduce the former failure using the laptop clock as the reference.
 assert.throws(()=>currentRows(data,config,serverNow-8*60000));
 assert.throws(()=>currentRows(data,config,serverNow+86400000));
 const original=Date.now;
 try{
  for(const skew of [-8*60000,86400000]){
   Date.now=()=>serverNow+skew;
   const time=snapshotResponseTime(headers(),100);
   assert.equal(currentRows(data,config,time).length,1);
   assert.equal(3600000-(time-Date.parse(data.fetchedAt)),3569900);
  }
 }finally{Date.now=original;}
});

test('cache Age and request duration count toward the one-hour expiration',()=>{
 assert.equal(snapshotResponseTime(headers('120'),1500),serverNow+121500);
 const expired={...snapshot(),fetchedAt:new Date(serverNow-3590000).toISOString()};
 assert.throws(()=>currentRows(expired,{golf:true},snapshotResponseTime(headers('10'))));
 assert.throws(()=>currentRows(snapshot(),{golf:true},snapshotResponseTime(headers('3570'))));
});

test('the response time cannot silently fall back to an untrusted laptop clock',()=>{
 for(const h of [headers(null,null),headers(null,'invalid'),headers('-1'),headers('invalid'),headers('1.5')])assert.throws(()=>snapshotResponseTime(h));
 assert.throws(()=>snapshotResponseTime(headers(),-1));
});

test('future, incomplete and duplicated snapshots remain rejected',()=>{
 const data=snapshot(),time=snapshotResponseTime(headers());
 for(const bad of [{...data,complete:false},{...data,total:2},{...data,total:2,results:[...data.results,...data.results]},
  {...data,fetchedAt:new Date(serverNow+61000).toISOString()},
  {...data,fetchedAt:new Date(serverNow-3600000).toISOString()}])assert.throws(()=>currentRows(bad,{golf:true},time));
});

test('completed-only and golf-community restrictions remain intact',()=>{
 const data=snapshot(),time=snapshotResponseTime(headers());
 for(const changes of [{StandardStatus:'Closed'},{InternetEntireListingDisplayYN:false},
  {General_sp_Description_co_Construction:'Pre-Construction'},
  {Address_co_Community2:'Unrelated neighborhood'}]){
  assert.equal(currentRows({...data,results:[{...data.results[0],...changes}]},{golf:true},time).length,0);
 }
});
