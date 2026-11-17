import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {cerritosInventorySummary,cerritosPreviews,renderCerritosGuide} from '../api/cerritos-guide.js';
const now=Date.parse('2026-11-17T18:30:00Z');
const row=(id,changes={})=>({ListingKey:String(id),ListingId:'26-'+id,StandardStatus:'Active',InternetEntireListingDisplayYN:true,PropertyType:'Condos',General_sp_Description_co_Construction:'Completed',City:'Pacific',Address_co_Community2:'Pescadero/Cerritos',SubdivisionName:'Cerritos Beach',ListPrice:350000,...changes});
const data=results=>({complete:true,total:results.length,results,fetchedAt:new Date(now-30000).toISOString()});
const template=readFileSync(new URL('../templates/cerritos-beach-real-estate.html',import.meta.url),'utf8');
test('completed Cerritos counts exclude preconstruction, broad locations and private/nonactive listings',()=>{
 const d=data([row(1),row(2,{PropertyType:'Houses',ListPrice:900000}),row(3,{PropertyType:'Land',General_sp_Description_co_Construction:null,ListPrice:100000}),row(4,{General_sp_Description_co_Construction:'Pre-Construction'}),row(5,{SubdivisionName:'Pescadero'}),row(6,{SubdivisionName:'Cerritos/Pesca-Genrl'}),row(7,{StandardStatus:'Pending'}),row(8,{InternetEntireListingDisplayYN:false}),row(9,{PropertyType:'Commercial'}),row(10,{City:'La Paz'})]);
 const s=cerritosInventorySummary(d,now);
 assert.deepEqual(s.completed.map(x=>x.mls),['26-1','26-2','26-3']);
 assert.equal(s.full.length,7); // Same community filter as full MLS, including different city label.
 assert.match(s.html,/MLS: 7 active homes, condos and lots/);
 assert.match(s.html,/\$350,000/);
 assert.ok(template.indexOf('id="find-properties"')<template.indexOf('id="featured-casa-sol-y-luna"'));
 assert.ok(renderCerritosGuide(template,d,now).html.includes('Current Cerritos property choices'));
});
test('no false zero when inventory unavailable, incomplete or expired',()=>{
 assert.match(renderCerritosGuide(template,null,now).html,/cannot confirm current inventory counts/);
 assert.throws(()=>cerritosInventorySummary({...data([row(1)]),complete:false},now));
 assert.throws(()=>cerritosInventorySummary({...data([row(1)]),fetchedAt:new Date(now-3600000).toISOString()},now));
 assert.throws(()=>cerritosInventorySummary(data([row(1),row(1)]),now));
});
test('missing prices do not become zero-priced properties; delayed data is labelled',()=>{
 const s=cerritosInventorySummary(data([row(1,{ListPrice:0}),row(2,{ListPrice:null}),row(3,{ListPrice:450000}),row(4,{ListPrice:600000})]),now);
 assert.match(s.html,/\$450,000–\$600,000 \(2 prices on request\)/);
 assert.doesNotMatch(s.html,/\$0\b/);
 const delayed=cerritosInventorySummary({...data([]),fetchedAt:new Date(now-600000).toISOString()},now);
 assert.match(delayed.html,/Update delayed/);
});
test('previews select one eligible example of each type and update prices from the snapshot',()=>{
 const d=data([row(4787,{ListPrice:430000,UnparsedAddress:'Seaside <401>'}),row(3880,{PropertyType:'Houses',ListPrice:480000}),row(4385,{PropertyType:'Land',ListPrice:109000,General_sp_Description_co_Lot_sp_M2:1450}),row(20,{PropertyType:'Houses',General_sp_Description_co_Construction:'Pre-Construction'}),row(21,{PropertyType:'Land',InternetEntireListingDisplayYN:false})]);
 const {completed}=cerritosInventorySummary(d,now),p=cerritosPreviews(completed);
 assert.deepEqual(p.selected.map(x=>x.mls),['26-4787','26-3880','26-4385']);
 assert.match(p.html,/\$430,000 USD/);
 assert.match(p.html,/Seaside &lt;401&gt;/);
 assert.match(p.html,/property-search.html\?mls=26-4385/);
 d.results[0].ListPrice=425000;
 assert.match(renderCerritosGuide(template,d,now).html,/\$425,000 USD/);
 d.results[0].StandardStatus='Pending';d.results.push(row(30,{ListPrice:300000}));d.total++;
 const replacement=cerritosPreviews(cerritosInventorySummary(d,now).completed);
 assert.deepEqual(replacement.selected.map(x=>x.mls),['26-30','26-3880','26-4385']);
 assert.doesNotMatch(replacement.html,/26-4787/);
 const rendered=renderCerritosGuide(template,d,now).html;
 assert.ok(rendered.indexOf('id="cerritos-preview-title"')>rendered.indexOf('id="cerritos-inventory-title"'));
 assert.ok(rendered.indexOf('id="cerritos-preview-title"')<rendered.indexOf('id="featured-casa-sol-y-luna"'));
 assert.doesNotMatch(renderCerritosGuide(template,null,now).html,/data-cerritos-preview/);
});
