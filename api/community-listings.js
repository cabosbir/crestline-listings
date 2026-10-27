import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {createHandler} from './las-cascadas.js';

// Only these public community guides can select a bundled template.
export const pagePaths=[
  "/rolling-hills-real-estate.html",
  "/el-tezal-real-estate.html",
  "/el-tezal-condos-for-sale-under-500k.html",
  "/el-tezal-houses-for-sale-under-750k.html",
  "/es/departamentos-en-venta-el-tezal.html",
  "/es/terrenos-en-venta-el-tezal.html"
];
const handlers=new Map(pagePaths.map(page=>{
 let pending;
 const template=()=>pending??=readFile(join(process.cwd(),'templates',page.slice(1)),'utf8').catch(error=>{pending=null;throw error;});
 return [page,createHandler({template})];
}));
export default function handler(req,res){
 const page=req.query?.guide;
 if(typeof page!=='string'||!handlers.has(page)){
  res.setHeader('Cache-Control','no-store');return res.status(404).send('Page not found.');
 }
 return handlers.get(page)(req,res);
}
