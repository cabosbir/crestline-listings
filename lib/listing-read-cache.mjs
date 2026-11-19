import {randomUUID} from 'node:crypto';

// Share only public listing responses. Never cache a rejection or extend a
// listing's checked timestamp when serving it again.
export function createListingReadCache({shared, now=Date.now, sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms)), leaseWait=ms=>new Promise(resolve=>setTimeout(resolve,ms)), report=()=>{}}={}) {
  const memory=new Map(), pending=new Map();
  let tail=Promise.resolve(), cooldownUntil=0;
  const usable=entry=>entry && Number.isFinite(entry.savedAt) && now()-entry.savedAt>=0 && now()-entry.savedAt<60000 && Array.isArray(entry.data?.results);
  const remember=(id,entry)=>{
    memory.delete(id); memory.set(id,entry);
    while(memory.size>128)memory.delete(memory.keys().next().value);
  };
  const lookup=async id=>{
    const local=memory.get(id);
    if(usable(local))return {data:local.data,source:'memory'};
    memory.delete(id);
    try {
      const entry=await shared?.get(id);
      if(usable(entry)){remember(id,entry);return {data:entry.data,source:'shared'};}
    } catch { report('cache-read-unavailable'); }
    return null;
  };
  const save=async(id,value,ttl)=>{
    try { await shared?.set(id,value,{ttl}); } catch { report('cache-write-unavailable'); }
  };
  const checkCooldown=async()=>{
    try {
      const sharedCooldown=await shared?.get('cooldown');
      if(Number.isFinite(sharedCooldown))cooldownUntil=Math.max(cooldownUntil,sharedCooldown);
    } catch { report('cache-read-unavailable'); }
    if(now()<cooldownUntil)throw Object.assign(new Error('Listing provider cooling down'),{status:429,retryAfter:Math.max(1,Math.ceil((cooldownUntil-now())/1000))});
  };
  // Coordinate cold function instances before they contact Spark. Runtime
  // Cache has no atomic lock operation: this is a cooperative, short lease,
  // not a strict distributed mutex. Confirm ownership after a settling delay;
  // keep the local queue and provider cooldown as independent safeguards.
  const sharedSlot=async(id,started)=>{
    if(!shared)return {release:async()=>{}};
    const token=randomUUID();
    // Cache leases are advisory: delayed visibility or unrelated requests must
    // never turn this optimization into a ten-second gallery outage.
    const stopWaiting=Math.min(started+10000,now()+1500);
    while(now()<stopWaiting){
      const cached=await lookup(id);
      if(cached)return {cached,release:async()=>{}};
      await checkCooldown();
      try {
        const current=await shared.get('provider-lease');
        if(current&&typeof current.token==='string'&&Number.isFinite(current.expires)&&current.expires>now()&&current.expires<=now()+30000){
          await leaseWait(150);continue;
        }
        // The lease outlives the bounded provider call, but expires after a
        // crashed invocation. Only its owner can release it early.
        const claim={token,expires:now()+25000};
        await shared.set('provider-lease',claim,{ttl:25});
        await leaseWait(150);
        if((await shared.get('provider-lease'))?.token!==token)continue;
        return {release:async()=>{
          try {if((await shared.get('provider-lease'))?.token===token)await shared.set('provider-lease',{token,expires:0},{ttl:1});}
          catch {report('cache-write-unavailable');}
        }};
      } catch {report('cache-lease-unavailable');return {release:async()=>{}};}
    }
    return {release:async()=>{}};
  };
  return function read(id,load){
    if(pending.has(id))return pending.get(id).then(result=>({...result,source:'coalesced'}));
    const started=now();
    const operation=(async()=>{
      const cached=await lookup(id);
      if(cached)return cached;
      if(pending.size>=32)throw Object.assign(new Error('Listing queue busy'),{status:503,retryAfter:2});
      const run=tail.catch(()=>{}).then(async()=>{
        const recent=await lookup(id);
        if(recent)return recent;
        await checkCooldown();
        if(now()-started>=10000)throw Object.assign(new Error('Listing queue busy'),{status:503,retryAfter:2});
        const slot=await sharedSlot(id,started);
        try {
          if(slot.cached)return slot.cached;
          const completed=await lookup(id);
          if(completed)return completed;
          await checkCooldown();
          const data=await load({timeoutMs:Math.max(1,20000-(now()-started))});
          const entry={data,savedAt:now()};
          remember(id,entry);
          await save(id,entry,60);
          return {data,source:'provider'};
        } catch(error) {
          if(error?.status===429){
            // A racing copy can succeed even while this copy is throttled.
            // Reuse that exact fresh result before imposing a global cooldown
            // on unrelated galleries that have not failed.
            await sleep(1000);
            const completed=await lookup(id);
            if(completed)return completed;
            const retryAfter=Math.max(1,Number(error.retryAfter)||300);
            cooldownUntil=now()+retryAfter*1000;
            await save('cooldown',cooldownUntil,retryAfter);
            report('provider-rate-limited');
          }
          throw error;
        } finally {await slot.release();}
      });
      tail=run.catch(()=>{});
      return run;
    })();
    pending.set(id,operation);
    operation.finally(()=>pending.delete(id)).catch(()=>{});
    return operation;
  };
}
