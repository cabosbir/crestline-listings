import {SCOPES} from './bir-property-scopes.mjs';

// This lifestyle guide spans two MLS zones; other collection scopes stay unchanged.
export const PACIFIC_GUIDE_SCOPE={name:'Pacific Side of Cabo San Lucas',rules:[
 {city:['Cabo San Lucas'],community:['Pedregal CSL','Saddles/Sunset Bch Rd']},
 {city:['Cabo San Lucas'],subdivision:['Terrasol']},
 {city:['Pacific'],community:['Quivira','Diamante Cabo San Lucas','Rancho San Lucas','San Cristobal']}
]};
SCOPES['pacific-guide']=PACIFIC_GUIDE_SCOPE;
if(typeof document!=='undefined')await import('./bir-property-pages.mjs');
