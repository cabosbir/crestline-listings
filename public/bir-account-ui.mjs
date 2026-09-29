import {buyerAccount} from './account-client.mjs';
import {savedSearch} from './preferences.mjs';
let connection;
export function connectAccount(){
 return connection??=import('https://esm.sh/@supabase/supabase-js@2.57.4').then(({createClient})=>{
  const client=createClient('https://uhgruwbaweepkhpydkxa.supabase.co','sb_publishable_r1OGEb7OoMOugnxNtymj6A_fYo6ttVg',{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'implicit'}});
  return {client,api:buyerAccount(client)};
 });
}
const el=(tag,text)=>{const n=document.createElement(tag);if(text)n.textContent=text;return n;};
const button=(text,run)=>{const n=el('button',text);n.type='button';n.onclick=run;return n;};
function localFavorites(){try{return JSON.parse(localStorage.getItem('bir-saved-properties-v1')||'[]');}catch{return [];}}
export async function mountAccount(target,hooks={}){
 const style=el('style');style.textContent='.buyer-panel{margin:16px 0;padding:18px;border:1px solid #b8d5cf;border-radius:8px;background:white}.buyer-panel h2{font-size:22px;margin:0 0 8px}.buyer-panel p{font-size:15px;margin:8px 0}.buyer-actions{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0}.buyer-panel li{margin:12px 0;overflow-wrap:anywhere}.buyer-panel li button{margin-left:10px}.buyer-panel [hidden]{display:none!important}.buyer-panel input:not([type=checkbox]),.buyer-panel select{box-sizing:border-box;width:100%;padding:10px;font:inherit}.buyer-panel label{display:block;margin:12px 0 6px}.buyer-panel input[type=checkbox]{width:auto;margin-right:8px}.buyer-panel summary{font-weight:700;cursor:pointer}.buyer-status{min-height:1.5em}.buyer-panel button:disabled{opacity:.5;cursor:wait}';document.head.append(style);
 const panel=el('section');panel.className='buyer-panel';panel.setAttribute('aria-label','Free buyer account');target.append(panel);
 const title=el('h2','Your free buyer account'),intro=el('p','Keep your saved properties and searches across devices. Signing in is optional.');
 const status=el('p');status.className='buyer-status';status.setAttribute('role','status');
 const signedOut=el('div'),link=el('a','Sign in or create a free account');link.href='/buyer-account.html';signedOut.append(link,el('p','Without an account, your favorites stay in this browser.'));
 const signedIn=el('div');signedIn.hidden=true;panel.append(title,intro,status,signedOut,signedIn);
 let client,api,current=null,busy=false,version=0,cloud=[],searches=[];
 const tell=t=>status.textContent=t;
 async function action(run){if(busy)return;busy=true;panel.querySelectorAll('button').forEach(b=>b.disabled=true);try{await run();}catch(e){tell(e.message||'Your change could not be saved. Please try again.');}finally{busy=false;panel.querySelectorAll('button').forEach(b=>b.disabled=false);}}
 const displayFavorites=()=>hooks.setFavorites?.(cloud.map(p=>({key:p.listing_key,mls:p.mls_number})),true);
 async function load(){
  const stamp=++version;
  const {data,error}=await client.auth.getUser();
  if(stamp!==version)return;
  const u=!error&&data.user?.email_confirmed_at?data.user:null;
  if(!u){current=null;cloud=[];searches=[];signedIn.replaceChildren();signedIn.hidden=true;signedOut.hidden=false;hooks.setFavorites?.(localFavorites(),false);tell('');return;}
  if(current!==u.id){cloud=[];hooks.setFavorites?.([],true);}
  current=u.id;signedOut.hidden=true;signedIn.hidden=false;tell('Loading your account…');
  const [f,s,p]=await Promise.all([api.listFavorites(),api.listSearches(),api.getPreferences()]);
  if(stamp!==version||current!==u.id)return;
  cloud=f;searches=s;displayFavorites();draw(u,p);tell('Signed in as '+u.email);
 }
 function draw(u,p){
  signedIn.replaceChildren();const actions=el('div');actions.className='buyer-actions';
  const local=localFavorites();if(Array.isArray(local)&&local.length)actions.append(button('Copy browser favorites to account',()=>action(async()=>{await api.importFavorites(local);await load();tell('Browser favorites copied to your account. Your browser copy is unchanged.');})));
  actions.append(button('Refresh saved items',()=>action(load)),button('Sign out',()=>action(async()=>{await api.signOut();current=null;await load();})));
  signedIn.append(actions);
  if(!hooks.setFavorites){
   const details=el('details');details.open=true;details.append(el('summary',`Saved properties (${cloud.length})`));const list=el('ul');
   for(const f of cloud){const li=el('li'),a=el('a','MLS '+f.mls_number);a.href='/property-search.html?mls='+encodeURIComponent(f.mls_number);li.append(a,button('Remove',()=>action(async()=>{await api.removeFavorite(f.listing_key);await load();})));list.append(li);}details.append(cloud.length?list:el('p','Save properties while browsing, or copy your existing browser favorites above.'));signedIn.append(details);
  }
  const searchBox=el('details');searchBox.open=true;searchBox.append(el('summary',`Saved searches (${searches.length})`));
  if(hooks.getFilters){const form=el('form'),label=el('label','Name this search'),input=el('input');input.required=true;input.maxLength=80;input.placeholder='For example: El Tezal condos';input.id='buyer-search-name';label.htmlFor=input.id;const save=el('button','Save current search');save.type='submit';form.append(label,input,save);form.onsubmit=e=>{e.preventDefault();action(async()=>{if(!hooks.ready())throw Error('Wait for the full search to load before saving.');await api.addSearch(input.value,hooks.getFilters());await load();tell('Search saved to your account.');});};searchBox.append(form);}
  const list=el('ul');for(const s of searches){const li=el('li');if(hooks.applyFilters)li.append(button(s.name,()=>action(async()=>{if(!hooks.ready())throw Error('Wait for the full search to load.');hooks.applyFilters(savedSearch(s.name,s.filters).filters);tell('Showing '+s.name);})));
   else{const a=el('a',s.name);a.href='/property-search.html?saved='+encodeURIComponent(s.id);li.append(a);}li.append(button('Delete search',()=>action(async()=>{await api.removeSearch(s.id);await load();})));list.append(li);}
  searchBox.append(searches.length?list:el('p','No saved searches yet. Choose filters on the property search page, then save your search.'));signedIn.append(searchBox);
  const pref=el('details');pref.append(el('summary','Email alert preferences'));
  const form=el('form'),label=el('label','How often would you like updates?'),select=el('select');select.id='buyer-frequency';label.htmlFor=select.id;
  for(const [value,text] of [['none','No alerts'],['daily','Daily'],['weekly','Weekly']])select.append(new Option(text,value));select.value=p?.frequency||'none';
  const topics=[];for(const [name,text] of [['new_matches','New listings matching my saved searches'],['favorite_changes','Price or public availability changes to my saved properties']]){const l=el('label'),c=el('input');c.type='checkbox';c.name=name;c.checked=p?.[name]===true;l.append(c,document.createTextNode(text));topics.push([name,c,l]);}
  const save=el('button','Save alert preferences');save.type='submit';
  form.append(label,select,...topics.map(t=>t[2]),el('p','Alerts are off unless you choose a frequency and at least one topic. You can turn them off here at any time.'),save);
  form.onsubmit=e=>{e.preventDefault();action(async()=>{await api.setPreferences({frequency:select.value,...Object.fromEntries(topics.map(([n,c])=>[n,c.checked]))});await load();tell('Your email preference is saved.');});};pref.append(form);signedIn.append(pref);
  const requested=new URLSearchParams(location.search).get('saved');if(requested&&hooks.applyFilters&&hooks.ready()){const s=searches.find(s=>s.id===requested);if(s){hooks.applyFilters(savedSearch(s.name,s.filters).filters);history.replaceState(null,'',location.pathname);}}
 }
 try{({client,api}=await connectAccount());await load();client.auth.onAuthStateChange((event)=>{if(event==='SIGNED_OUT'||event==='SIGNED_IN')setTimeout(()=>load().catch(()=>tell('Account connection interrupted. Refresh to try again.')),0);});}
 catch{tell('Account connection is unavailable. Your browser favorites are still available.');hooks.setFavorites?.(localFavorites(),false);}
 return {active:()=>!!current, async toggle(p){await action(async()=>{const identity=current;if(!identity)throw Error('Please sign in again.');const key=String(p.ListingKey);if(cloud.some(f=>f.listing_key===key))await api.removeFavorite(key);else await api.importFavorites([{key,mls:String(p.ListingId||'')}]);if(current!==identity)return;await load();tell('Your account favorites are saved across devices.');});}};
}
