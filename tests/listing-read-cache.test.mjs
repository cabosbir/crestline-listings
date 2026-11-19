import test from 'node:test';
import assert from 'node:assert/strict';
import {createListingReadCache} from '../lib/listing-read-cache.mjs';
const data=n=>({results:[{ListingId:'26-'+n,ListPrice:100000}],total:1,next:null,fetchedAt:'2026-11-19T04:00:00Z'});
const store=()=>{const values=new Map();return {get:async id=>values.get(id),set:async(id,value)=>values.set(id,value)};};
const tick=()=>new Promise(resolve=>setImmediate(resolve));

test('desktop and mobile duplicates share one provider call per batch',async()=>{
  const read=createListingReadCache({shared:store()}); let calls=0,release,started;
  const gate=new Promise(resolve=>release=resolve);
  const loading=new Promise(resolve=>started=resolve);
  const load=async()=>{calls++;started();await gate;return data(1);};
  const requests=[read('batch1',load),read('batch1',load),read('batch2',load),read('batch2',load)];
  await loading;assert.equal(calls,1);release();
  const result=await Promise.all(requests);assert.equal(calls,2);
  assert.equal(result[1].source,'coalesced');assert.equal(result[3].source,'coalesced');
});

test('another function instance uses shared public data with its original timestamp',async()=>{
  const shared=store(),first=createListingReadCache({shared}),second=createListingReadCache({shared});
  await first('same',async()=>data(1));
  const result=await second('same',async()=>{throw Error('must not call provider');});
  assert.equal(result.source,'shared');assert.deepEqual(result.data,data(1));
});

test('two cold instances coordinate a duplicate load before either has cached data',async()=>{
  const shared=store(),first=createListingReadCache({shared}),second=createListingReadCache({shared});
  let calls=0;
  const load=async()=>{calls++;await new Promise(r=>setTimeout(r,250));return data(1);};
  const results=await Promise.all([first('same-cold-query',load),second('same-cold-query',load)]);
  assert.equal(calls,1);assert.deepEqual(results[0].data,results[1].data);
  assert.ok(results.some(r=>r.source==='shared'));
});

test('cold instances coordinate different initial and gallery loads and release their slot',async()=>{
  const shared=store(),first=createListingReadCache({shared}),second=createListingReadCache({shared});
  let active=0,peak=0,calls=0;
  const load=async()=>{calls++;active++;peak=Math.max(peak,active);await new Promise(r=>setTimeout(r,150));active--;return data(calls);};
  await Promise.all([first('initial',load),second('gallery',load)]);
  assert.equal(calls,2);assert.equal(peak,1);
  assert.equal((await shared.get('provider-lease')).expires,0);
});

test('a crashed holder cannot leave an indefinite provider lease',async()=>{
  const shared=store();let time=1000,calls=0;
  await shared.set('provider-lease',{token:'crashed-instance',expires:1250});
  const read=createListingReadCache({shared,now:()=>time,leaseWait:async ms=>{time+=ms;}});
  const result=await read('gallery',async()=>{calls++;return data(1);});
  assert.equal(calls,1);assert.equal(result.source,'provider');assert.ok(time>=1250);
});

test('a failed load releases its lease and does not block another query',async()=>{
  const shared=store(),first=createListingReadCache({shared}),second=createListingReadCache({shared});
  await assert.rejects(first('bad',async()=>{throw Error('bad response');}));
  assert.equal((await shared.get('provider-lease')).expires,0);
  assert.equal((await second('valid',async()=>data(1))).source,'provider');
});

test('a persistently busy or stale shared lease cannot fail a healthy gallery',async()=>{
  const shared=store();let time=1000,calls=0;
  await shared.set('provider-lease',{token:'busy-or-stale',expires:26000});
  const read=createListingReadCache({shared,now:()=>time,leaseWait:async ms=>{time+=ms;}});
  const result=await read('gallery',async()=>{calls++;return data(1);});
  assert.equal(calls,1);assert.equal(result.source,'provider');assert.equal(time,2500);
  assert.equal((await shared.get('provider-lease')).token,'busy-or-stale');
});

test('a cache that silently drops lease writes cannot prevent healthy listing reads',async()=>{
  let time=1000,calls=0;
  const shared={get:async()=>null,set:async()=>{}};
  const read=createListingReadCache({shared,now:()=>time,leaseWait:async ms=>{time+=ms;}});
  assert.equal((await read('gallery',async()=>{calls++;return data(1);})).source,'provider');
  assert.equal(calls,1);assert.equal(time,2500);
});

test('a cached result expires after one minute and does not perpetuate old prices',async()=>{
  let time=0,calls=0;const read=createListingReadCache({shared:store(),now:()=>time});
  const load=async()=>data(++calls);
  await read('x',load);time=59999;assert.equal((await read('x',load)).source,'memory');
  time=60000;assert.equal((await read('x',load)).data.results[0].ListingId,'26-2');
  assert.equal(calls,2);
});

test('a throttled instance can use a successful parallel result without retrying the provider',async()=>{
  const shared=store();let calls=0;
  const read=createListingReadCache({shared,now:()=>1000,sleep:async()=>shared.set('x',{savedAt:1000,data:data(1)})});
  const result=await read('x',async()=>{calls++;throw Object.assign(Error('limited'),{status:429,retryAfter:30});});
  assert.equal(calls,1);assert.equal(result.source,'shared');assert.deepEqual(result.data,data(1));
  assert.equal(await shared.get('cooldown'),undefined);
});

test('provider cooldown is shared and obeyed, while fresh cached data stays available',async()=>{
  const shared=store();let time=1000,calls=0;
  const options={shared,now:()=>time,sleep:async()=>{}};
  const first=createListingReadCache(options);
  await first('valid',async()=>data(1));
  await assert.rejects(first('rejected',async()=>{calls++;throw Object.assign(Error('limited'),{status:429,retryAfter:30});}),{status:429});
  const second=createListingReadCache(options);
  assert.equal((await second('valid',async()=>{throw Error('unnecessary');})).source,'shared');
  await assert.rejects(second('other',async()=>{calls++;return data(2);}),{status:429});assert.equal(calls,1);
  time=31001;assert.equal((await second('other',async()=>{calls++;return data(2);})).source,'provider');assert.equal(calls,2);
});

test('delayed visibility of a successful duplicate recovers without a provider retry or global cooldown',async()=>{
  const shared=store();let time=1000,calls=0;const waits=[],events=[];
  const read=createListingReadCache({shared,now:()=>time,leaseWait:async ms=>{time+=ms;},sleep:async ms=>{waits.push(ms);time+=ms;if(waits.reduce((a,b)=>a+b,0)>=1750)await shared.set('gallery',{savedAt:time,data:data(7)});},report:event=>events.push(event)});
  const result=await read('gallery',async()=>{calls++;throw Object.assign(Error('limited'),{status:429,retryAfter:30});});
  assert.equal(calls,1);assert.equal(result.source,'shared');assert.deepEqual(result.data,data(7));
  assert.deepEqual(waits,[250,500,1000]);assert.equal(await shared.get('cooldown'),undefined);
  assert.ok(events.includes('provider-rate-limit-recovered'));
});

test('an unrecovered throttle has bounded cache-only waits and preserves the provider cooldown',async()=>{
  const shared=store();let time=1000,calls=0;const waits=[];
  const read=createListingReadCache({shared,now:()=>time,leaseWait:async ms=>{time+=ms;},sleep:async ms=>{waits.push(ms);time+=ms;}});
  await assert.rejects(read('gallery',async()=>{calls++;throw Object.assign(Error('limited'),{status:429,retryAfter:30});}),{status:429});
  assert.equal(calls,1);assert.equal(waits.reduce((a,b)=>a+b,0),3750);
  assert.equal(await shared.get('cooldown'),time+30000);
  await assert.rejects(read('another',async()=>{calls++;return data(8);}),{status:429});assert.equal(calls,1);
});

test('failed requests are not cached as valid inventory and cache outages do not hide successful data',async()=>{
  let calls=0;const read=createListingReadCache({shared:{get:async()=>{throw Error('offline');},set:async()=>{throw Error('offline');}}});
  await assert.rejects(read('x',async()=>{calls++;throw Error('provider outage');}));
  const result=await read('x',async()=>{calls++;return data(1);});assert.equal(calls,2);assert.deepEqual(result.data,data(1));
});

test('expired queued requests stop before making another provider call',async()=>{
  let time=0,release;const gate=new Promise(resolve=>release=resolve);
  const read=createListingReadCache({now:()=>time});
  const first=read('first',async()=>{await gate;return data(1);});
  const second=read('second',async()=>{throw Error('should not execute');});
  await tick();time=11000;release();await first;await assert.rejects(second,{status:503});
});

test('the real handler shares duplicate public detail reads and preserves MLS visibility rules',async()=>{
  const {default:handler}=await import('../api/search-pilot.js');
  const originalFetch=globalThis.fetch,oldKey=process.env.FLEXMLS_API_KEY,oldBase=process.env.FLEXMLS_BASE_URL;
  process.env.FLEXMLS_API_KEY='test-public-cache';process.env.FLEXMLS_BASE_URL='https://example.com/reso';let calls=0;
  globalThis.fetch=async()=>{
    calls++;await tick();
    return new Response(JSON.stringify({'@odata.count':2,value:[{ListingKey:'1',ListingId:'26-1',StandardStatus:'Active',ListPrice:123,PrivateRemarks:'never publish',Media:[]},{ListingKey:'2',ListingId:'26-2',StandardStatus:'Closed',Media:[]}]}),{status:200});
  };
  const run=async()=>{const res={headers:{},setHeader(k,v){this.headers[k]=v;},status(s){this.code=s;return this;},json(v){this.body=v;return this;}};await handler({method:'GET',query:{keys:'1,2'}},res);return res;};
  try{
    const results=await Promise.all([run(),run()]);
    assert.equal(calls,1);
    for(const result of results){assert.equal(result.code,200);assert.equal(result.body.results.length,1);assert.equal(result.body.results[0].PrivateRemarks,undefined);assert.equal(result.body.results[0].ListingId,'26-1');}
    const again=await run();assert.equal(calls,1);assert.equal(again.headers['X-BIR-Listing-Source'],'memory');assert.equal(again.body.fetchedAt,results[0].body.fetchedAt);
  }finally{globalThis.fetch=originalFetch;if(oldKey===undefined)delete process.env.FLEXMLS_API_KEY;else process.env.FLEXMLS_API_KEY=oldKey;if(oldBase===undefined)delete process.env.FLEXMLS_BASE_URL;else process.env.FLEXMLS_BASE_URL=oldBase;}
});
