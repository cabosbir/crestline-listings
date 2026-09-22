import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

const money = (price: number) => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(price);
const date = (value: string) => new Date(value).toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'America/Mazatlan'});

export default function PriceReductions() {
  const [data,setData]=useState<any>(null);
  const [failed,setFailed]=useState(false);
  const [visible,setVisible]=useState(6);
  const [attempt,setAttempt]=useState(0);
  useEffect(()=>{
    const abort=new AbortController();
    let live=true;
    setFailed(false);
    const timer=setTimeout(()=>abort.abort(),12000);
    fetch('/api/price-reductions',{signal:abort.signal}).then(async response=>{
      if(!response.ok) throw new Error('Unavailable');
      const result=await response.json();
      if(result.complete!==true || !Array.isArray(result.results)) throw new Error('Incomplete');
      if(live) setData(result);
    }).catch(()=>{if(live) setFailed(true);}).finally(()=>clearTimeout(timer));
    return()=>{live=false;clearTimeout(timer);abort.abort();};
  },[attempt]);
  return <section id="price-reductions" className="py-16 sm:py-20 bg-secondary">
    <div className="container mx-auto px-4">
      <div className="text-center max-w-3xl mx-auto mb-9">
        <p className="uppercase tracking-wider text-primary font-semibold mb-3">A fresh look at the market</p>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Cabo Real Estate Price Reductions</h2>
        <p className="text-xl font-semibold mb-3">Properties reduced in price during the last 7 days</p>
        <p className="text-lg text-muted-foreground">Explore homes, condos, land and commercial properties with recent price reductions in Los Cabos and across Baja California Sur. Updated daily at 5:00 a.m. Cabo time. No signup required.</p>
        {data && <p className="text-sm text-muted-foreground mt-3">Last updated {date(data.fetchedAt)} at {new Date(data.fetchedAt).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',timeZone:'America/Mazatlan'})} Cabo time · {data.total} properties</p>}
      </div>
      {failed ? <div className="text-center border border-border rounded-xl bg-white p-8"><p className="mb-4">We couldn't load the latest price reductions. You can still explore the full MLS search.</p><Button variant="outline" onClick={()=>setAttempt(n=>n+1)}>Try Again</Button></div> : !data ? <p role="status" className="text-center py-8">Loading recent price reductions…</p> : data.results.length===0 ? <p className="text-center py-8">No active listings are currently marked as price reduced within the last seven days. Check back after the next daily update.</p> : <>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.results.slice(0,visible).map((row:any)=><a key={row.ListingKey} href={`/property-search.html?mls=${encodeURIComponent(row.ListingId)}&from=price-reductions`} className="block overflow-hidden rounded-xl border border-border bg-white hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
            {row.Media?.[0]?.MediaURL ? <img src={row.Media[0].MediaURL} alt={row.UnparsedAddress||'Property photo'} loading="lazy" className="w-full aspect-[4/3] object-cover" /> : <div className="aspect-[4/3] bg-muted flex items-center justify-center">Photo unavailable</div>}
            <div className="p-5">
              <p className="text-sm font-semibold text-primary mb-2">Price reduced {date(row.PriceChangeTimestamp)}</p>
              <p className="text-2xl font-bold mb-2">{money(row.ListPrice)} <span className="text-sm font-normal">USD</span></p>
              <h3 className="text-lg font-semibold mb-2">{row.UnparsedAddress||row.SubdivisionName||'View property'}</h3>
              <p className="text-muted-foreground">{[row.SubdivisionName,row.City].filter(Boolean).join(' · ')}</p>
              <p className="mt-3 text-sm">{row.PropertyType}{Number(row.BedroomsTotal)>0?` · ${row.BedroomsTotal} beds`:''}{Number(row.BathroomsTotalDecimal)>0?` · ${row.BathroomsTotalDecimal} baths`:''} · MLS {row.ListingId}</p>
              <p className="mt-4 text-primary font-semibold underline">View property →</p>
            </div>
          </a>)}
        </div>
        {visible<data.results.length && <div className="text-center mt-7"><Button onClick={()=>setVisible(n=>n+12)} variant="outline">Show More Price Reductions ({data.results.length-visible} remaining)</Button></div>}
      </>}
      <div className="text-center mt-8"><Button asChild size="lg"><a href="/property-search.html">Explore All MLS Listings</a></Button></div>
    </div>
  </section>;
}
