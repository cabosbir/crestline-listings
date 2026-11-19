import test from 'node:test';
import assert from 'node:assert/strict';
import {defaults,filterListings,searchEntryFilters,locationOptions,changeLocation,ALL_CABO_LOCATIONS,CABO_CORRIDORS,HOMES_CONDOS_LAND} from '../public/bir-pilot-search.mjs';
import {mlsPageRows} from '../api/mls-page.js';
const zones={'all-cabo':['Cabo San Lucas','San Jose del Cabo','Cabo Corridor','San Jose Corridor'],'cabo-san-lucas':['Cabo San Lucas'],'san-jose-del-cabo':['San Jose del Cabo'],corridor:['Cabo Corridor','San Jose Corridor']};
const types={'homes-condos-land':['Houses','Condos','Land'],homes:['Houses'],condos:['Condos'],land:['Land']};
const rows=[];
for(const City of [...zones['all-cabo'],'Pacific','La Paz'])for(const PropertyType of ['Houses','Condos','Land','Commercial','Reservations Only']){
 const id=String(rows.length+1);rows.push({ListingKey:id,ListingId:'26-'+id,City,PropertyType,MLSAreaMajor:City+' area',Address_co_Community2:City+' community',SubdivisionName:City+' subdivision',StandardStatus:'Active',ListPrice:200000});
}
rows.push({...rows[0],ListingKey:'private',InternetEntireListingDisplayYN:false},{...rows[0],ListingKey:'pending',StandardStatus:'Pending'});
const now=Date.parse('2026-11-19T18:00:00Z'),data={results:rows,total:rows.length,complete:true,fetchedAt:new Date(now-1000).toISOString()};
const ids=r=>r.map(x=>x.ListingKey).sort();
test('all 16 PROS location/type combinations match the same public inventory in server and browser',()=>{
 for(const [zone,cities] of Object.entries(zones))for(const [type,kinds] of Object.entries(types)){
  const q={zone,type},f=searchEntryFilters(q);
  const expected=rows.filter(x=>x.StandardStatus==='Active'&&x.InternetEntireListingDisplayYN!==false&&cities.includes(x.City)&&kinds.includes(x.PropertyType));
  assert.deepEqual(ids(mlsPageRows(data,q,now)),ids(expected),JSON.stringify(q));
  assert.deepEqual(ids(filterListings(rows,f)),ids(expected),JSON.stringify(q));
  assert.ok(locationOptions(rows,f,'City').includes(f.City));
  assert.deepEqual(locationOptions(rows,f,'MLSAreaMajor'),cities.map(x=>x+' area').sort());
 }
});
test('clearing the location preserves type; resetting restores every public statewide property type',()=>{
 const selected=searchEntryFilters({zone:'corridor',type:'condos'});
 const cleared=changeLocation(selected,'City','');
 assert.equal(cleared.PropertyType,'Condos');assert.equal(filterListings(rows,cleared).length,6);
 const all=mlsPageRows(data,{},now);assert.equal(all.length,24);assert.ok(all.some(x=>x.City==='Pacific'&&x.PropertyType==='Commercial'));
 assert.equal(filterListings(rows.filter(x=>x.PropertyType!=='Reservations Only'),defaults()).length,24);
});
test('invalid and prototype parameter values do not inject filters or crash; existing community and MLS links remain usable',()=>{
 for(const q of [{zone:['corridor'],type:['condos']},{zone:'__proto__',type:'constructor'},{zone:'<script>',type:'toString'}])assert.deepEqual(searchEntryFilters(q),defaults());
 const f=searchEntryFilters({type:'Condo',community:'Pedregal CSL',subdivision:'Cascadas',mls:'26-100,26-101'});
 assert.equal(f.PropertyType,'Condos');assert.equal(f.Address_co_Community2,'Pedregal CSL');assert.equal(f.SubdivisionName,'Cascadas');assert.equal(f.query,'26-100,26-101');
 assert.equal(searchEntryFilters({zone:'all-cabo',type:'homes-condos-land'}).City,ALL_CABO_LOCATIONS);
 assert.equal(searchEntryFilters({zone:'corridor'}).City,CABO_CORRIDORS);
 assert.equal(searchEntryFilters({type:'homes-condos-land'}).PropertyType,HOMES_CONDOS_LAND);
});
