import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {todosSantosInventorySummary,todosSantosPreviews,todosSantosBudgets,renderTodosSantosGuide} from '../api/todos-santos-guide.js';
import {filterRows} from '../public/bir-property-pages.mjs';
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

test('budget counts match destination filters with strict ceilings and completed public houses only',()=>{
 const fixture=data([row(11,{ListPrice:299999}),row(12,{ListPrice:300000}),row(13,{ListPrice:499999}),row(14,{ListPrice:500000}),row(15,{ListPrice:999999,Address_co_Community2:'Todos Santos North',SubdivisionName:'Las Playitas'}),row(16,{ListPrice:1000000}),row(17,{ListPrice:1,PropertyType:'Condos'}),row(18,{ListPrice:200000,General_sp_Description_co_Construction:'Pre-Construction'}),row(19,{ListPrice:250000,StandardStatus:'Pending'}),row(20,{ListPrice:null}),row(21,{ListPrice:200000,Address_co_Community2:'Pescadero/Cerritos'}),row(22,{ListPrice:100000,InternetEntireListingDisplayYN:false})]);
 const completed=todosSantosInventorySummary(fixture,now).completed;
 const budget=todosSantosBudgets(completed);
 assert.deepEqual(budget.groups.map(x=>x.count),[1,3,5]);
 for(const group of budget.groups){
  assert.equal(group.count,filterRows(completed,{kind:'Houses',price:'0-'+group.limit}).length);
  assert.ok(group.example.price<group.limit);
 }
 assert.equal(budget.groups[2].example.mlsCommunity,'Todos Santos North');
 const html=renderTodosSantosGuide(template,fixture,now).html;
 assert.ok(html.indexOf('id="budget-comparison"')<html.indexOf('id="neighborhoods"'));
 const searchTemplate=readFileSync(new URL('../templates/houses-villas-for-sale-todos-santos.html',import.meta.url),'utf8');
 for(const limit of [300000,500000,1000000])assert.ok(searchTemplate.includes('value="0-'+limit+'"'));
});

test('budget examples change when a preferred listing leaves its budget and never repeat',()=>{
 const rows=todosSantosInventorySummary(data([row(1122,{ListingId:'26-1122',ListPrice:239000}),row(5459,{ListingId:'25-5459',ListPrice:468000}),row(228,{ListingId:'26-228',ListPrice:800000})]),now).completed;
 assert.deepEqual(todosSantosBudgets(rows).groups.map(x=>x.example.mls),['26-1122','25-5459','26-228']);
 rows[1].price=1000001;
 const updated=todosSantosBudgets(rows).groups;
 assert.equal(updated[1].example,null);
 assert.equal(updated[1].count,1);
 assert.equal(updated[2].example.mls,'26-228');
});

test('unavailable inventory retains budget searches without invented zero counts or stale examples',()=>{
 const html=renderTodosSantosGuide(template,null,now).html;
 assert.match(html,/Current availability cannot be confirmed/);
 assert.doesNotMatch(html,/data-todos-santos-budget-example|0 completed houses/);
 for(const limit of [300000,500000,1000000])assert.ok(html.includes('?price=0-'+limit+'#ov-status'));
 assert.deepEqual(todosSantosBudgets([]).groups.map(x=>x.count),[0,0,0]);
});

