import test from 'node:test';
import assert from 'node:assert/strict';
import {propertyDetails,publicListing} from '../api/search-pilot.js';

const facts=row=>Object.fromEntries((propertyDetails(row).find(g=>g.heading==='Property facts')?.items||[]).map(i=>[i.label,i.value]));

test('facts include bedrooms, total bathrooms and full/half counts, including zero',()=>{
 assert.deepEqual(facts({BedroomsTotal:3,BathroomsTotalDecimal:3.5,BathroomsFull:3,BathroomsHalf:1}),
  {Bedrooms:3,'Bathrooms (total)':3.5,'Full bathrooms':3,'Half bathrooms':1});
 assert.equal(facts({BedroomsTotal:0,BathroomsHalf:0}).Bedrooms,0);
 assert.equal(facts({BedroomsTotal:0,BathroomsHalf:0})['Half bathrooms'],0);
});

test('custom bedroom/bath labels fall back without duplicating standard facts',()=>{
 const row={BedroomsTotal:3,General_sp_Description_co_Total_sp_Bedrooms:3,
  General_sp_Description_co_Full_sp_Baths:2,'General_sp_Description_co_1_sl_2_sp_Bath':1};
 assert.deepEqual(facts(row),{Bedrooms:3,'Full bathrooms':2,'Half bathrooms':1});
 assert.equal(propertyDetails(row)[0].items.filter(i=>i.label==='Bedrooms').length,1);
});

test('deck/patio fields accept encoded slash variants and keep their supplied units',()=>{
 for(const separator of ['_slash_','_sl_','_fs_','/','']){
  assert.deepEqual(facts({
   ['General_sp_Description_co_Decks'+separator+'Patios_sp_M2']:35.84,
   ['General_sp_Description_co_Decks'+separator+'Patios_sp_SqFt']:385.64
  }),{'Deck / patio area (m²)':35.84,'Deck / patio area (sq ft)':385.64});
 }
});

test('missing deck measurements are not inferred from total minus indoor area',()=>{
 const result=facts({General_sp_Description_co_Total_sp_M2:201.47,General_sp_Description_co_AC_sp_M2:165.63,
  General_sp_Description_co_Decks_slash_Patios_sp_M2:null});
 assert(!Object.keys(result).some(k=>/deck/i.test(k)));
});

test('private fields and unapproved deck-like labels remain excluded',()=>{
 const result=propertyDetails({
  General_sp_Description_co_Decks_slash_Patios_sp_M2:35.84,
  General_sp_Description_co_Decks_private_Patios_sp_M2:999,
  General_sp_Description_co_Decks_slash_Patios_sp_Contact:'private',
  General_sp_Description_co_Lockbox:'private',
  Private_sp_Remarks_co_Text:'private',
  General_sp_Description_co_Unapproved:'private'
 });
 assert.deepEqual(result,[{heading:'Property facts',items:[{label:'Deck / patio area (m²)',value:35.84}]}]);
});

test('generic area labels identify declared units and do not guess missing units',()=>{
 assert.equal(facts({BuildingAreaTotal:2167.82,BuildingAreaUnits:'Square Feet'})['Building area (sq ft)'],2167.82);
 assert.equal(facts({LivingArea:165.63,LivingAreaUnits:'Square Meters'})['Living area (m²)'],165.63);
 assert.equal(facts({BuildingAreaTotal:2167.82})['Building area (unit not supplied)'],2167.82);
});

test('new facts appear only in full detail responses and preserve listing visibility rules',()=>{
 const row={ListingKey:'123',StandardStatus:'Active',BedroomsTotal:3,BathroomsTotalDecimal:3.5,
  General_sp_Description_co_Decks_slash_Patios_sp_M2:35.84,SecretField:'private'};
 const inventory=publicListing(row),gallery=publicListing(row,true);
 assert.equal(inventory.PropertyDetails,undefined);
 assert.equal(inventory.General_sp_Description_co_Decks_slash_Patios_sp_M2,undefined);
 assert.equal(gallery.SecretField,undefined);
 assert(gallery.PropertyDetails[0].items.some(i=>i.label==='Deck / patio area (m²)'&&i.value===35.84));
 assert.equal(publicListing({...row,InternetEntireListingDisplayYN:false},true),null);
 assert.equal(publicListing({...row,StandardStatus:'Closed'},true),null);
});
