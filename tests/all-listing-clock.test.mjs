import test from 'node:test';
import assert from 'node:assert/strict';
import {snapshotResponseTime} from '../public/bir-inventory-time.mjs';
import {eligibleCondos} from '../public/bir-condos.mjs';
import {eligibleHomes} from '../public/bir-homes.mjs';
import {eligibleLand} from '../public/bir-land.mjs';
import {eligibleCondos as oceanCondos} from '../public/bir-ocean-condos.mjs';
import {eligibleHomes as oceanHomes} from '../public/bir-ocean-homes.mjs';
const time=Date.parse('2026-10-10T21:00:00Z');
const headers=new Headers({date:new Date(time).toUTCString(),age:'15'});
const source=type=>({complete:true,total:1,fetchedAt:new Date(time-30000).toISOString(),results:[{ListingKey:'1',ListingId:'26-1',StandardStatus:'Active',PropertyType:type,City:'Cabo San Lucas',General_sp_Description_co_Construction:'Completed',General_sp_Description_co_Primary_sp_View:'Ocean',ListPrice:500000}]});
for(const [name,fn,type] of [['condos',eligibleCondos,'Condos'],['houses',eligibleHomes,'Houses'],['land',eligibleLand,'Land'],['ocean condos',oceanCondos,'Condos'],['ocean houses',oceanHomes,'Houses']]){
 test(`${name}: laptop clock cannot hide fresh listings; expired and incomplete still rejected`,()=>{
  const original=Date.now;try{
   for(const skew of [-480000,86400000]){
    Date.now=()=>time+skew;
    assert.throws(()=>fn(source(type)));
    const now=snapshotResponseTime(headers,100);
    assert.equal(fn(source(type),now).length,1);
    for(const bad of [{...source(type),complete:false},{...source(type),total:2},{...source(type),fetchedAt:new Date(time-3600000).toISOString()}])assert.throws(()=>fn(bad,now));
   }
  }finally{Date.now=original;}
 });
}
