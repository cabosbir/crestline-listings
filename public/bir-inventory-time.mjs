// The visitor's clock may be wrong. Date plus HTTP cache Age gives the server
// reference time; include request duration conservatively in freshness checks.
export function snapshotResponseTime(headers,elapsedMs=0){
 const serverTime=Date.parse(headers.get('date')||''),ageText=headers.get('age');
 const age=ageText===null?0:/^\d+$/.test(ageText.trim())?Number(ageText):NaN;
 if(!Number.isFinite(serverTime)||!Number.isSafeInteger(age)||age<0||!Number.isFinite(elapsedMs)||elapsedMs<0)throw Error('Inventory response time unavailable');
 return serverTime+age*1000+elapsedMs;
}
