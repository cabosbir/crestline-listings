import test from 'node:test';
import assert from 'node:assert/strict';
import handler, {encodeCursor} from '../api/search-pilot.js';

const tick=()=>new Promise(resolve=>setImmediate(resolve));
const row=(key='1')=>({ListingKey:key,ListingId:'26-'+key,StandardStatus:'Active',InternetEntireListingDisplayYN:true,UnparsedAddress:'Public home',ListPrice:123000,PrivateRemarks:'never publish',Media:[{MediaURL:'https://example.com/one.jpg',Permission:'Public',Order:1},{MediaURL:'https://example.com/two.jpg',Permission:'Public',Order:2},{MediaURL:'https://example.com/private.jpg',Permission:'Private',Order:3}]});
const response=(rows=[row()])=>new Response(JSON.stringify({'@odata.count':rows.length,value:rows}),{status:200});
const run=async query=>{
  const res={headers:{},setHeader(k,v){this.headers[k]=v;},status(code){this.code=code;return this;},json(body){this.body=body;return this;}};
  await handler({method:'GET',query},res);return res;
};
async function fixture(name,fetcher,check){
  const previous={fetch:globalThis.fetch,key:process.env.FLEXMLS_API_KEY,base:process.env.FLEXMLS_BASE_URL};
  process.env.FLEXMLS_API_KEY='test-read-modes-'+name;
  process.env.FLEXMLS_BASE_URL='https://example.com/reso';
  globalThis.fetch=fetcher;
  try{await check();}finally{
    globalThis.fetch=previous.fetch;
    for(const [name,value] of [['FLEXMLS_API_KEY',previous.key],['FLEXMLS_BASE_URL',previous.base]]){
      if(value===undefined)delete process.env[name];else process.env[name]=value;
    }
  }
}

test('initial requests share one load, retain their timestamp and exclude private/inactive listings',async()=>{
  let calls=0;
  await fixture('initial',async()=>{calls++;await tick();return response([row(),{...row('2'),StandardStatus:'Closed'},{...row('3'),InternetEntireListingDisplayYN:false},{...row('4'),PropertyType:'Reservations Only'},{...row('5'),InternetAddressDisplayYN:false,Latitude:23,Longitude:-109}]);},async()=>{
    const results=await Promise.all([run({mode:'first'}),run({mode:'first'})]);
    assert.equal(calls,1);
    for(const r of results){
      assert.equal(r.code,200);assert.equal(r.body.results.length,2);
      assert.equal(r.body.results[0].PrivateRemarks,undefined);
      assert.equal(r.body.results[0].Media.length,1);
      assert.equal(r.body.results[1].UnparsedAddress,'Address available on request');
      assert.equal(r.body.results[1].Latitude,null);
    }
    const again=await run({mode:'first'});assert.equal(calls,1);
    assert.equal(again.headers['X-BIR-Listing-Source'],'memory');
    assert.equal(again.body.fetchedAt,results[0].body.fetchedAt);
  });
});

test('gallery duplicates share a complete public gallery without mixing it with thumbnail details',async()=>{
  let calls=0;
  await fixture('gallery',async()=>{calls++;await tick();return response();},async()=>{
    const [details,gallery,duplicate]=await Promise.all([run({keys:'1'}),run({mode:'gallery',keys:'1'}),run({mode:'gallery',keys:'1'})]);
    assert.equal(calls,2);assert.equal(details.body.results[0].Media.length,1);
    for(const r of [gallery,duplicate]){assert.equal(r.code,200);assert.equal(r.body.results[0].Media.length,2);assert.equal(r.body.results[0].PrivateRemarks,undefined);}
    const again=await run({mode:'gallery',keys:'1'});assert.equal(calls,2);
    assert.equal(again.headers['X-BIR-Listing-Source'],'memory');
    assert.equal(again.body.fetchedAt,gallery.body.fetchedAt);
    assert.notDeepEqual(details.body.results[0].Media,gallery.body.results[0].Media);
  });
});

test('different initial, keyed and gallery reads use one provider queue',async()=>{
  let active=0,peak=0,calls=0;
  await fixture('queue',async()=>{calls++;active++;peak=Math.max(peak,active);await tick();active--;return response();},async()=>{
    const results=await Promise.all([run({mode:'first'}),run({keys:'1'}),run({mode:'gallery',keys:'1'})]);
    assert.equal(calls,3);assert.equal(peak,1);assert.ok(results.every(r=>r.code===200));
  });
});

test('initial-load throttling stops later uncached galleries while a fresh gallery remains usable',async()=>{
  let calls=0,limited=false;
  await fixture('cooldown',async()=>{calls++;return limited?new Response('{}',{status:429,headers:{'Retry-After':'30'}}):response();},async()=>{
    assert.equal((await run({mode:'gallery',keys:'1'})).code,200);
    limited=true;
    const first=await run({mode:'first'});assert.equal(first.code,429);assert.equal(first.headers['Retry-After'],'30');
    const cached=await run({mode:'gallery',keys:'1'});assert.equal(cached.code,200);
    const another=await run({mode:'gallery',keys:'2'});assert.equal(another.code,429);
    assert.equal(another.headers['Cache-Control'],'no-store');assert.equal(calls,2);
  });
});

test('incomplete and malformed galleries are never cached as successful results',async()=>{
  let calls=0;
  await fixture('incomplete',async()=>{calls++;return calls===1?response([{...row(),'Media@odata.nextLink':'?page=2'}]):calls===2?new Response('{"value":null}',{status:200}):response();},async()=>{
    for(let i=0;i<2;i++){const r=await run({mode:'gallery',keys:'1'});assert.equal(r.code,502);assert.equal(r.headers['Cache-Control'],'no-store');}
    const valid=await run({mode:'gallery',keys:'1'});assert.equal(valid.code,200);assert.equal(valid.body.results[0].Media.length,2);assert.equal(calls,3);
  });
});

test('bulk inventory and signed continuation requests keep their original uncached path',async()=>{
  let calls=0;
  await fixture('bulk',async()=>{calls++;return response();},async()=>{
    const cursor=encodeCursor('https://example.com/reso/Property?$skip=24',process.env.FLEXMLS_API_KEY);
    for(const query of [{mode:'inventory'},{cursor}]){
      for(let i=0;i<2;i++){const r=await run(query);assert.equal(r.code,200);assert.equal(r.headers['X-BIR-Listing-Source'],undefined);assert.equal(r.headers['Cache-Control'],'no-store');}
    }
    assert.equal(calls,4);
  });
});

test('invalid gallery keys fail before contacting the provider',async()=>{
  let calls=0;
  await fixture('invalid',async()=>{calls++;return response();},async()=>{
    for(const keys of [undefined,'1,2','bad'])assert.equal((await run({mode:'gallery',keys})).code,400);
    assert.equal(calls,0);
  });
});
