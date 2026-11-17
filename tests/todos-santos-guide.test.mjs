import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {todosSantosInventorySummary,todosSantosPreviews,renderTodosSantosGuide} from '../api/todos-santos-guide.js';
import {defaults,filterListings,locationOptions,changeLocation,TODOS_SANTOS_COMMUNITIES} from '../public/bir-pilot-search.mjs';
import {mlsPageRows} from '../api/mls-page.js';
const now=Date.parse('2026-11-17T22:00:00Z');
const row=(id,changes={})=>({ListingKey:String(id),ListingId:'26-'+id,StandardStatus:'Active',InternetEntireListingDisplayYN:true,PropertyType:'Houses',General_sp_Description_co_Construction:'Completed',City:'Pacific',MLSAreaMajor:'Pacific North',Address_co_Community2:'Todos Santos',SubdivisionName:'Las Tunas',ListPrice:500000,...changes});
const data=results=>({complete:true,total:results.length,results,fetchedAt:new Date(now-30000).toISOString()});
const template=readFileSync(new URL('../templates/todos-santos-real-estate.html',import.meta.url),'utf8');
const sample=data([row(1,{PropertyType:'Condos'}),row(2,{Address_co_Community2:'Todos Santos North',SubdivisionName:'Las Playitas'}),row(3,{PropertyType:'Land',General_sp_Description_co_Construction:null}),row(4,{General_sp_Description_co_Construction:'Pre-Construction'}),row(5,{PropertyType:'Commercial'}),row(6,{Address_co_Community2:'Pescadero/Cerritos'}),row(7,{MLSAreaMajor:'Pacific South'}),row(8,{StandardStatus:'Pending'}),row(9,{InternetEntireListingDisplayYN:false})]);
test('full search includes both communities and all construction stages with the same server/browser scope',()=>{
 const filters={...defaults(),Address_co_Community2:TODOS_SANTOS_COMMUNITIES};
 assert.deepEqual(filterListings(sample.results,filters).map(x=>x.ListingId),['26-1','26-2','26-3','26-4','26-5']);
 assert.deepEqual(mlsPageRows(sample,{community:TODOS_SANTOS_COMMUNITIES},now).map(x=>x.ListingId).sort(),['26-1','26-2','26-3','26-4','26-5']);
 const s=todosSantosInventorySummary(sample,now);
 assert.deepEqual(s.completed.map(x=>x.mls),['26-1','26-2','26-3']);
 assert.equal(s.full.length,4); // Three public buyer types; all-type search also has commercial.
});
test('combined community exposes subdivisions from both areas and remains compatible with normal location changes',()=>{
 const f={...defaults(),Address_co_Community2:TODOS_SANTOS_COMMUNITIES};
 assert.deepEqual(locationOptions(sample.results,f,'SubdivisionName'),['Las Playitas','Las Tunas']);
 assert.ok(locationOptions(sample.results,defaults(),'Address_co_Community2').includes(TODOS_SANTOS_COMMUNITIES));
 assert.ok(!locationOptions(sample.results,{...defaults(),City:'Cabo San Lucas'},'Address_co_Community2').includes(TODOS_SANTOS_COMMUNITIES));
 assert.equal(changeLocation(f,'City','Cabo San Lucas').Address_co_Community2,'');
 assert.equal(filterListings(sample.results,{...f,SubdivisionName:'Las Playitas'}).length,1);
 assert.equal(filterListings(sample.results,{...defaults(),Address_co_Community2:'Pescadero/Cerritos'}).length,1);
});
test('previews are current completed residences and land, with matching prices and MLS links',()=>{
 const s=todosSantosInventorySummary(sample,now),p=todosSantosPreviews(s.completed);
 assert.deepEqual(p.selected.map(x=>x.kind),['Condos','Houses','Land']);
 assert.match(p.html,/\$500,000 USD/);
 assert.match(p.html,/property-search.html\?mls=26-2/);
 const h=renderTodosSantosGuide(template,sample,now).html;
 assert.ok(h.indexOf('id="todos-santos-inventory-title"')<h.indexOf('id="todos-santos-mls-previews"'));
 assert.ok(h.indexOf('id="todos-santos-mls-previews"')<h.indexOf('id="living"'));
 assert.match(h,/community=Todos%20Santos%20%2B%20Todos%20Santos%20North/);
 assert.ok(!h.includes('<!--BIR_TODOS_SANTOS_INVENTORY-->'));
});
test('incomplete, expired and duplicate snapshots cannot publish stale previews',()=>{
 assert.throws(()=>todosSantosInventorySummary({...sample,complete:false},now));
 assert.throws(()=>todosSantosInventorySummary({...sample,fetchedAt:new Date(now-3600000).toISOString()},now));
 assert.throws(()=>todosSantosInventorySummary(data([row(1),row(1)]),now));
 assert.doesNotMatch(renderTodosSantosGuide(template,null,now).html,/data-todos-santos-preview/);
 assert.match(renderTodosSantosGuide(template,null,now).html,/cannot confirm current inventory counts/);
});
