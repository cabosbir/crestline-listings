import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {createHandler} from './las-cascadas.js';
import {storedSnapshot,createVisitorInventory} from './search-pilot.js';

// All guides in a warm function share one public snapshot read. Preserve its
// original checked time and never fall back to direct MLS-provider requests.
// The public snapshot is roughly 3.7 MB; cold concurrent readers need more than
// the interactive search's short deadline to finish transferring it.
export function createCommunityInventory(loadStored=()=>storedSnapshot(fetch,Date.now,12000),now=Date.now){
 const inventory=createVisitorInventory(loadStored,async()=>{throw new Error('Waiting for public inventory');},now);
 return async()=>(await inventory()).data;
}
const load=createCommunityInventory();

// Only these public community guides can select a bundled template.
export const pagePaths=[
  "/rolling-hills-real-estate.html",
  "/el-tezal-real-estate.html",
  "/el-tezal-condos-for-sale-under-500k.html",
  "/el-tezal-houses-for-sale-under-750k.html",
  "/es/departamentos-en-venta-el-tezal.html",
  "/es/terrenos-en-venta-el-tezal.html",
  "/pedregal-real-estate.html",
  "/cabo-del-sol-real-estate.html",
  "/cabo-real-real-estate.html",
  "/cabo-san-lucas-country-club-real-estate.html",
  "/chileno-bay-real-estate.html",
  "/club-campestre-san-jose-real-estate.html",
  "/condos-los-cabos-golf-communities.html",
  "/costa-palmas-real-estate.html",
  "/diamante-real-estate.html",
  "/el-dorado-real-estate.html",
  "/houses-villas-los-cabos-golf-communities.html",
  "/land-los-cabos-golf-communities.html",
  "/los-cabos-golf-properties.html",
  "/palmilla-real-estate.html",
  "/puerto-los-cabos-real-estate.html",
  "/querencia-real-estate.html",
  "/quivira-real-estate.html",
  "/rancho-san-lucas-real-estate.html",
  "/san-jose-golf-district-real-estate.html",
  "/twin-dolphin-real-estate.html"
];
const handlers=new Map(pagePaths.map(page=>{
 let pending;
 const template=()=>pending??=readFile(join(process.cwd(),'templates',page.slice(1)),'utf8').catch(error=>{pending=null;throw error;});
 return [page,createHandler({template,load})];
}));
export default function handler(req,res){
 const page=req.query?.guide;
 if(typeof page!=='string'||!handlers.has(page)){
  res.setHeader('Cache-Control','no-store');return res.status(404).send('Page not found.');
 }
 return handlers.get(page)(req,res);
}
