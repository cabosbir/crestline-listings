export async function loadInventory(fetchPage, onProgress=()=>{}) {
  const records=new Map(), cursors=new Set();
  let cursor=null,total=null,received=0,fetchedAt;
  do {
    const page=await fetchPage(cursor);
    if(!Array.isArray(page.results)||!Number.isSafeInteger(page.received)||page.received<page.results.length)throw new Error('Invalid inventory page');
    if(page.total!==null){
      if(!Number.isSafeInteger(page.total)||page.total<0)throw new Error('Invalid inventory count');
      if(total!==null&&total!==page.total)throw new Error('Inventory changed while loading. Reload to get a consistent count.');
      total=page.total;
    }
    received+=page.received;
    for(const row of page.results){
      if(!row.ListingKey||records.has(row.ListingKey))throw new Error('The feed repeated a listing. Reload to retry.');
      records.set(row.ListingKey,row);
    }
    fetchedAt=page.fetchedAt;
    cursor=page.next;
    if(cursor){
      if(typeof cursor!=='string'||cursors.has(cursor)||!page.received)throw new Error('Inventory pagination did not advance.');
      cursors.add(cursor);
    }
    onProgress(records.size,total);
  } while(cursor);
  if(total===null||received!==total||records.size!==total)throw new Error('The feed did not return the expected public inventory. Totals have not been verified.');
  return {results:[...records.values()],fetchedAt};
}

export async function loadGroupedInventory(fetchPage,onProgress=()=>{}){
  const groups=['houses','condos','land','other'],progress=new Map();
  const results=await Promise.all(groups.map(group=>loadInventory(cursor=>fetchPage(cursor,group),(loaded,total)=>{
    progress.set(group,{loaded,total});
    onProgress([...progress.values()].reduce((sum,p)=>sum+p.loaded,0),progress.size===groups.length&&[...progress.values()].every(p=>p.total!==null)?[...progress.values()].reduce((sum,p)=>sum+p.total,0):null);
  })));
  const rows=results.flatMap(page=>page.results);
  if(new Set(rows.map(row=>row.ListingKey)).size!==rows.length)throw new Error('Inventory changed between groups. Reload to retry.');
  return {results:rows,fetchedAt:results.map(page=>page.fetchedAt).sort()[0]};
}
