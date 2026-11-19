// Share only public listing responses. Never cache a rejection or extend a
// listing's checked timestamp when serving it again.
export function createListingReadCache({shared, now=Date.now, sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms)), report=()=>{}}={}) {
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
        try {
          const sharedCooldown=await shared?.get('cooldown');
          if(Number.isFinite(sharedCooldown))cooldownUntil=Math.max(cooldownUntil,sharedCooldown);
        } catch { report('cache-read-unavailable'); }
        if(now()<cooldownUntil)throw Object.assign(new Error('Listing provider cooling down'),{status:429,retryAfter:Math.max(1,Math.ceil((cooldownUntil-now())/1000))});
        if(now()-started>=10000)throw Object.assign(new Error('Listing queue busy'),{status:503,retryAfter:2});
        try {
          const data=await load({timeoutMs:Math.max(1,20000-(now()-started))});
          const entry={data,savedAt:now()};
          remember(id,entry);
          await save(id,entry,60);
          return {data,source:'provider'};
        } catch(error) {
          if(error?.status===429){
            const retryAfter=Math.max(1,Number(error.retryAfter)||300);
            cooldownUntil=now()+retryAfter*1000;
            await save('cooldown',cooldownUntil,retryAfter);
            report('provider-rate-limited');
            // Another function may already be completing this exact request.
            // Recheck its shared result without retrying the throttled provider.
            await sleep(1000);
            const completed=await lookup(id);
            if(completed)return completed;
          }
          throw error;
        }
      });
      tail=run.catch(()=>{});
      return run;
    })();
    pending.set(id,operation);
    operation.finally(()=>pending.delete(id)).catch(()=>{});
    return operation;
  };
}
