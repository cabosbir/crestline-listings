import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {storedSnapshot,createVisitorInventory} from './search-pilot.js';

const listingId='26-4457',page='https://www.bircabo.com/casa-sol-y-luna-cerritos.html';
const inventory=createVisitorInventory(()=>storedSnapshot(fetch,Date.now,12000),async()=>{throw new Error('Public inventory unavailable');});
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=value=>'US$'+new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(value);
export function renderFeaturedHome(template,data,now=Date.now()){
  const age=now-Date.parse(data?.fetchedAt);
  if(data?.complete!==true||!Array.isArray(data.results)||!Number.isFinite(age)||age < -60000||age>=3600000)throw new Error('Current inventory unavailable');
  const listing=data.results.find(row=>row.ListingId===listingId&&row.StandardStatus==='Active'&&row.InternetEntireListingDisplayYN!==false&&row.InternetAddressDisplayYN!==false);
  if(!listing||!Number.isFinite(listing.ListPrice)||listing.ListPrice<=0){
    return template.replace(/<main[\s\S]*?<\/main>/,'<main id="main"><section class="sl-section sl-wrap"><p class="sl-eyebrow">Casa Sol y Luna · MLS 26-4457</p><h1>Ask about current availability.</h1><p>This property is not currently confirmed in our active public MLS feed. Contact Don for its status and suitable alternatives.</p><a class="sl-button" href="#bir-inquiry" data-bir-inquiry data-bir-inquiry-context="Casa Sol y Luna — MLS 26-4457">Send an inquiry</a></section></main>').replace('<!--FEATURE_SCHEMA-->','').replace(/<!--FEATURE_[A-Z_]+-->/g,'');
  }
  const price=money(listing.ListPrice);
  const checked=new Intl.DateTimeFormat('en-US',{timeZone:'America/Mazatlan',dateStyle:'medium',timeStyle:'short'}).format(new Date(data.fetchedAt));
  const reduction=listing.ListPrice<1300000?'<p class="sl-previous">Previously listed at US$1,300,000 · <strong>'+escape(money(1300000-listing.ListPrice))+' lower</strong></p>':'';
  const schema={'@context':'https://schema.org','@graph':[{'@type':'RealEstateListing','@id':page+'#listing',url:page,name:'Casa Sol y Luna — El Gavilán, Pescadero/Cerritos',datePosted:'2026-10-31',offers:{'@type':'Offer',price:listing.ListPrice,priceCurrency:'USD',availability:'https://schema.org/InStock',url:page},about:{'@type':'SingleFamilyResidence',name:'Casa Sol y Luna',numberOfBedrooms:listing.BedroomsTotal,numberOfBathroomsTotal:listing.BathroomsTotalDecimal,address:{'@type':'PostalAddress',addressLocality:'El Gavilán, Pescadero',addressRegion:'Baja California Sur',addressCountry:'MX'}},image:page.replace('casa-sol-y-luna-cerritos.html','casa-sol-y-luna-assets/photo-03.webp'),publisher:{'@type':'Organization',name:'Baja International Realty',url:'https://www.bircabo.com/'}},{'@type':'VideoObject',name:'Casa Sol y Luna property tour',description:'A 96-second tour of the casitas, terraces, pool and Pacific coast setting.',thumbnailUrl:'https://www.bircabo.com/casa-sol-y-luna-assets/photo-50.webp',contentUrl:'https://www.bircabo.com/casa-sol-y-luna-assets/tour.mp4',uploadDate:'2026-10-31T10:00:00-07:00',duration:'PT1M36S'}]};
  return template.replaceAll('<!--FEATURE_PRICE-->',escape(price)).replaceAll('<!--FEATURE_REDUCTION-->',reduction).replaceAll('<!--FEATURE_CHECKED-->',escape('Active MLS listing · Availability checked '+checked+' Cabo time.')).replace('<!--FEATURE_SCHEMA-->','<script type="application/ld+json">'+JSON.stringify(schema).replaceAll('<','\\u003c')+'</script>');
}
export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store, max-age=0');res.setHeader('Vercel-CDN-Cache-Control','no-store');res.setHeader('Content-Type','text/html; charset=utf-8');
  try{
    const [template,{data}]=await Promise.all([readFile(join(process.cwd(),'templates/casa-sol-y-luna-cerritos.html'),'utf8'),inventory()]);
    return res.status(200).send(renderFeaturedHome(template,data));
  }catch{
    res.setHeader('Retry-After','60');
    return res.status(503).send('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Casa Sol y Luna | BIR</title><body><main><h1>Casa Sol y Luna</h1><p>Current listing information is temporarily unavailable. Please try again shortly or send Don an inquiry.</p><p><a href="/contact">Send an inquiry</a> · <a href="/cerritos-beach-real-estate.html">Explore Cerritos</a></p></main></body></html>');
  }
}
