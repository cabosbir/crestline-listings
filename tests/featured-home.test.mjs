import test from 'node:test';
import assert from 'node:assert/strict';
import {renderFeaturedHome} from '../api/featured-home.js';
const now=Date.parse('2026-10-31T18:00:00Z');
const template='<!doctype html><head><!--FEATURE_SCHEMA--></head><main><!--FEATURE_PRICE--><!--FEATURE_REDUCTION--><!--FEATURE_CHECKED--><div>PRIVATE_PHOTOS</div></main>';
const listing={ListingId:'26-4457',StandardStatus:'Active',InternetEntireListingDisplayYN:true,InternetAddressDisplayYN:true,ListPrice:995000,BedroomsTotal:5,BathroomsTotalDecimal:5};
const snapshot=rows=>({complete:true,results:rows,fetchedAt:new Date(now-60000).toISOString()});
test('current MLS price and original checked time appear in visible HTML and structured data',()=>{
 const html=renderFeaturedHome(template,snapshot([listing]),now);assert.match(html,/US\$995,000/);assert.match(html,/US\$305,000 lower/);assert.match(html,/"price":995000/);assert.match(html,/10:59 AM Cabo time/);assert.doesNotMatch(html,/FEATURE_/);
});
test('a later price change updates the visible price, reduction and offer together',()=>{
 const html=renderFeaturedHome(template,snapshot([{...listing,ListPrice:975000}]),now);assert.match(html,/US\$975,000/);assert.match(html,/US\$325,000 lower/);assert.match(html,/"price":975000/);assert.doesNotMatch(html,/995000|995,000/);
});
test('removed, inactive or display-restricted records do not retain an active offer or photos',()=>{
 for(const rows of [[],[{...listing,StandardStatus:'Closed'}],[{...listing,InternetEntireListingDisplayYN:false}],[{...listing,InternetAddressDisplayYN:false}]]){const html=renderFeaturedHome(template,snapshot(rows),now);assert.match(html,/not currently confirmed/);assert.doesNotMatch(html,/PRIVATE_PHOTOS|InStock|US\$/);}
});
test('expired or incomplete inventory cannot provide a current asking price',()=>{
 assert.throws(()=>renderFeaturedHome(template,{...snapshot([listing]),fetchedAt:new Date(now-3600000).toISOString()},now));assert.throws(()=>renderFeaturedHome(template,{...snapshot([listing]),complete:false},now));
});
