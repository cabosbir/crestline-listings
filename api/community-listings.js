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
  "/twin-dolphin-real-estate.html",
  "/beachfront-condos-for-sale-los-cabos.html",
  "/beachfront-houses-villas-for-sale-los-cabos.html",
  "/beachfront-land-for-sale-los-cabos.html",
  "/beachfront-properties-for-sale-los-cabos.html",
  "/buena-vista-real-estate.html",
  "/cabo-homes-for-sale.html",
  "/cabo-land-for-sale.html",
  "/cabo-pulmo-real-estate.html",
  "/cabo-san-lucas-condos-for-sale-under-500k.html",
  "/cabo-san-lucas-condos-for-sale.html",
  "/cabo-san-lucas-corridor-real-estate.html",
  "/cabo-san-lucas-marina-condos-for-sale.html",
  "/cabo-san-lucas-pacific-side-real-estate.html",
  "/casa-del-mar-condos-for-sale.html",
  "/condos-for-sale-cabo-san-lucas-corridor.html",
  "/condos-for-sale-cabo-san-lucas-pacific-side.html",
  "/condos-for-sale-cabo-san-lucas.html",
  "/condos-for-sale-cerritos-beach.html",
  "/condos-for-sale-east-cape.html",
  "/condos-for-sale-el-pescadero.html",
  "/condos-for-sale-san-jose-del-cabo-corridor.html",
  "/condos-for-sale-san-jose-del-cabo.html",
  "/condos-for-sale-todos-santos.html",
  "/costa-azul-real-estate.html",
  "/es/casas-en-venta-los-cabos.html",
  "/es/departamentos-en-venta-los-cabos.html",
  "/es/terrenos-en-venta-los-cabos.html",
  "/hacienda-beach-club-condos-for-sale.html",
  "/houses-villas-for-sale-cabo-san-lucas-corridor.html",
  "/houses-villas-for-sale-cabo-san-lucas-pacific-side.html",
  "/houses-villas-for-sale-cabo-san-lucas.html",
  "/houses-villas-for-sale-cerritos-beach.html",
  "/houses-villas-for-sale-east-cape.html",
  "/houses-villas-for-sale-el-pescadero.html",
  "/houses-villas-for-sale-san-jose-del-cabo-corridor.html",
  "/houses-villas-for-sale-san-jose-del-cabo.html",
  "/houses-villas-for-sale-todos-santos.html",
  "/la-fortuna-east-cape-real-estate.html",
  "/la-ribera-real-estate.html",
  "/land-for-sale-cabo-san-lucas-corridor.html",
  "/land-for-sale-cabo-san-lucas-pacific-side.html",
  "/land-for-sale-cabo-san-lucas.html",
  "/land-for-sale-cerritos-beach.html",
  "/land-for-sale-east-cape.html",
  "/land-for-sale-el-pescadero.html",
  "/land-for-sale-san-jose-del-cabo-corridor.html",
  "/land-for-sale-san-jose-del-cabo.html",
  "/land-for-sale-todos-santos.html",
  "/las-mananitas-condos-for-sale.html",
  "/las-tunas-todos-santos-real-estate.html",
  "/los-barriles-real-estate.html",
  "/misiones-del-cabo-condos-for-sale.html",
  "/ocean-view-condos-cabo-san-lucas.html",
  "/ocean-view-condos-for-sale-cabo-san-lucas-corridor.html",
  "/ocean-view-condos-for-sale-cabo-san-lucas-pacific-side.html",
  "/ocean-view-condos-for-sale-cerritos-beach.html",
  "/ocean-view-condos-for-sale-east-cape.html",
  "/ocean-view-condos-for-sale-el-pescadero.html",
  "/ocean-view-condos-for-sale-los-barriles.html",
  "/ocean-view-condos-for-sale-san-jose-del-cabo-corridor.html",
  "/ocean-view-condos-for-sale-san-jose-del-cabo.html",
  "/ocean-view-condos-for-sale-todos-santos.html",
  "/ocean-view-homes-cabo-san-lucas.html",
  "/ocean-view-houses-villas-for-sale-cabo-san-lucas-corridor.html",
  "/ocean-view-houses-villas-for-sale-cabo-san-lucas-pacific-side.html",
  "/ocean-view-houses-villas-for-sale-cerritos-beach.html",
  "/ocean-view-houses-villas-for-sale-east-cape.html",
  "/ocean-view-houses-villas-for-sale-el-pescadero.html",
  "/ocean-view-houses-villas-for-sale-los-barriles.html",
  "/ocean-view-houses-villas-for-sale-san-jose-del-cabo-corridor.html",
  "/ocean-view-houses-villas-for-sale-san-jose-del-cabo.html",
  "/ocean-view-houses-villas-for-sale-todos-santos.html",
  "/ocean-view-land-for-sale-cabo-san-lucas-corridor.html",
  "/ocean-view-land-for-sale-cabo-san-lucas-pacific-side.html",
  "/ocean-view-land-for-sale-cabo-san-lucas.html",
  "/ocean-view-land-for-sale-cerritos-beach.html",
  "/ocean-view-land-for-sale-east-cape.html",
  "/ocean-view-land-for-sale-el-pescadero.html",
  "/ocean-view-land-for-sale-los-barriles.html",
  "/ocean-view-land-for-sale-san-jose-del-cabo-corridor.html",
  "/ocean-view-land-for-sale-san-jose-del-cabo.html",
  "/ocean-view-land-for-sale-todos-santos.html",
  "/san-jose-del-cabo-condos-for-sale-under-750k.html",
  "/san-jose-del-cabo-corridor-real-estate.html",
  "/san-jose-del-cabo-houses-for-sale-under-2-5-million.html",
  "/san-jose-del-cabo-land-for-sale-under-500k.html",
  "/zacatitos-real-estate.html"
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
