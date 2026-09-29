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
 const style=el('style');style.textContent='.buyer-panel{margin:16px 0;padding:18px;border:1px solid #b8d5cf;border-radius:8px;background:white}.buyer-panel h2{font-size:22px;margin:0 0 8px}.buyer-panel p{font-size:15px;margin:8px 0}.buyer-actions{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0}.buyer-panel li{margin:12px 0;overflow-wrap:anywhere}.buyer-panel li button{margin-left:10px}.buyer-panel .buyer-favorites{list-style:none;padding:0;width:100%;max-width:320px}.buyer-panel .buyer-favorites li{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:16px}.buyer-panel .buyer-favorites li button{margin-left:0}.buyer-panel [hidden]{display:none!important}.buyer-panel input:not([type=checkbox]),.buyer-panel select{box-sizing:border-box;width:100%;padding:10px;font:inherit}.buyer-panel label{display:block;margin:12px 0 6px}.buyer-panel input[type=checkbox]{width:auto;margin-right:8px}.buyer-panel summary{font-weight:700;cursor:pointer}.buyer-status{min-height:1.5em}.buyer-panel button:disabled{opacity:.5;cursor:wait}';document.head.append(style);
 const panel=el('section');panel.className='buyer-panel';panel.setAttribute('aria-label','Free buyer account');target.append(panel);
 const title=el('h2','Save your way — always free'),intro=el('p','Save on this device without signing in, or use a free account to keep favorites and named searches across devices.');
 const status=el('p');status.className='buyer-status';status.setAttribute('role','status');
 const signedOut=el('div'),link=el('a','Sign in or create a free account');link.href='/buyer-account.html';signedOut.append(link,el('p','No account needed for this device. Choose an account only if you want your saved items on other devices.'));
 const topNav=document.querySelector('header nav');
 const welcome=el('p');welcome.setAttribute('role','status');welcome.hidden=true;welcome.style.cssText='flex-basis:100%;margin:8px 0 0;font-weight:600;font-size:15px;overflow-wrap:anywhere';if(topNav){topNav.parentElement.style.flexWrap='wrap';topNav.parentElement.append(welcome);}
 const topSignOut=topNav&&!document.getElementById('signout')?button('Sign out',()=>action(async()=>{await api.signOut();await load();})):null;
 if(topSignOut){topSignOut.className='account-signout';topSignOut.hidden=true;topNav.append(topSignOut);}
 const signedIn=el('div');signedIn.hidden=true;panel.append(title,intro,status,signedOut,signedIn);
 let client,api,current=null,busy=false,version=0,cloud=[],searches=[],syncProblem='';

 const searchWidget=hooks.getFilters&&document.getElementById('filters')?el('section'):null;
 let searchForm,searchInput,searchGuest,searchHelp,searchFeedback,searchOpen,searchSaving=false;
 if(searchWidget){
  searchWidget.className='filter-save-search';searchWidget.setAttribute('aria-label','Save this search');
  style.textContent+='.filter-save-search{margin:14px 0;padding:14px;border:1px solid #b8d5cf;border-radius:8px;background:#f3faf8}.filter-save-search [hidden]{display:none!important}.filter-save-search p{font-size:14px;margin:8px 0}.filter-save-search button{width:100%}.filter-save-search label{display:block;margin:8px 0}.filter-save-search input{box-sizing:border-box;width:100%;padding:10px;margin-bottom:10px}.filter-save-search a{font-weight:600}';
  searchHelp=el('p','Requires a free account.');
  searchGuest=el('div');const signup=el('a','Create a free account or sign in');signup.href='/buyer-account.html#signin';signup.target='_blank';signup.rel='noopener';
  searchGuest.append(signup,el('p','Opens a new tab so your search stays here. After signing in, return here to save it.'));
  searchForm=el('form');searchForm.hidden=true;searchForm.id='filter-save-search-form';
  const label=el('label','Name this search');searchInput=el('input');searchInput.id='filter-search-name';label.htmlFor=searchInput.id;searchInput.required=true;searchInput.maxLength=80;searchInput.placeholder='For example: El Tezal condos';
  const submit=el('button','Save search');submit.type='submit';searchForm.append(label,searchInput,submit);
  searchFeedback=el('p');searchFeedback.setAttribute('role','status');
  searchOpen=button('Save this search',()=>{if(current){searchForm.hidden=false;searchOpen.setAttribute('aria-expanded','true');searchInput.focus();}else{searchFeedback.textContent='Create a free account or sign in using the link above to save this search.';signup.focus();}});
  searchOpen.setAttribute('aria-controls',searchForm.id);searchOpen.setAttribute('aria-expanded','false');
  searchForm.onsubmit=async e=>{e.preventDefault();if(searchSaving)return;searchSaving=true;submit.disabled=true;searchFeedback.textContent='Saving your search…';try{if(!current)throw Error('Please sign in to save this search.');if(!hooks.ready())throw Error('Wait for the full search to load before saving.');const name=searchInput.value.trim();if(!name)throw Error('Please give your search a name.');await api.addSearch(name,hooks.getFilters());searchInput.value='';await load();searchFeedback.textContent='Search saved to your account. Find it under My Account → Saved searches.';}catch(e){searchFeedback.textContent=e.message||'Your search could not be saved. Please try again.';}finally{searchSaving=false;submit.disabled=false;}};
  searchWidget.append(searchOpen,searchHelp,searchGuest,searchForm,searchFeedback);document.getElementById('filters').before(searchWidget);
 }
 function updateSearchWidget(u){if(!searchWidget)return;searchGuest.hidden=!!u;searchHelp.textContent=u?'Save your current filters with a name.':'Requires a free account.';if(!u){searchForm.hidden=true;searchOpen.setAttribute('aria-expanded','false');}}

 const tell=t=>status.textContent=t;
 async function action(run){if(busy)return;busy=true;panel.querySelectorAll('button').forEach(b=>b.disabled=true);try{await run();}catch(e){tell(e.message||'Your change could not be saved. Please try again.');}finally{busy=false;panel.querySelectorAll('button').forEach(b=>b.disabled=false);}}
 const displayFavorites=()=>hooks.setFavorites?.(cloud.map(p=>({key:p.listing_key,mls:p.mls_number})),true);
 async function load(){
  const stamp=++version;
  const {data,error}=await client.auth.getUser();
  if(stamp!==version)return;
  const u=!error&&data.user?.email_confirmed_at?data.user:null;
  updateSearchWidget(u);
  if(topSignOut)topSignOut.hidden=!u;welcome.hidden=!u;welcome.textContent=u?'Welcome back, '+u.email+' — you are signed in.':'';
  if(u)document.getElementById('save-account-offer')?.remove();
  if(!u){title.textContent='Save your way — always free';intro.textContent='Save on this device without signing in, or use a free account to keep favorites and named searches across devices.';current=null;cloud=[];searches=[];signedIn.replaceChildren();signedIn.hidden=true;signedOut.hidden=false;hooks.setFavorites?.(localFavorites(),false);tell('');return;}
  if(current!==u.id){cloud=[];hooks.setFavorites?.([],true);}
  title.textContent='My Account';intro.textContent='Manage your saved properties and searches here.';current=u.id;signedOut.hidden=true;signedIn.hidden=false;tell('Loading your account…');
  const [f,s,p]=await Promise.all([api.listFavorites(),api.listSearches(),api.getPreferences()]);
  if(stamp!==version||current!==u.id)return;
  cloud=f;searches=s;syncProblem='';
  const local=localFavorites();
  if(Array.isArray(local)&&local.length){
   try{
    const pending=local.filter(x=>!cloud.some(c=>c.listing_key===x.key));
    if(pending.length)await api.importFavorites(pending);
    const updated=await api.listFavorites();
    if(stamp!==version||current!==u.id)return;
    cloud=updated;
    const confirmed=new Set(cloud.map(x=>x.listing_key));
    const latest=localFavorites();
    if(Array.isArray(latest))localStorage.setItem('bir-saved-properties-v1',JSON.stringify(latest.filter(x=>!confirmed.has(x.key))));
   }catch{syncProblem='Some favorites are still saved only on this device. We could not add them to your account. Click Retry saving favorites. If your account already has 50 favorites, remove one first.';}
  }
  if(stamp!==version||current!==u.id)return;
  displayFavorites();draw(u,p);tell(syncProblem||'Signed in as '+u.email+'. Your favorites are saved to your account.');
 }
 function draw(u,p){
  signedIn.replaceChildren();const actions=el('div');actions.className='buyer-actions';if(syncProblem)actions.append(button('Retry saving favorites',()=>action(load)));
  actions.append(button('Refresh saved items',()=>action(load)),button('Sign out',()=>action(async()=>{await api.signOut();current=null;await load();})));
  signedIn.append(actions);
  if(!hooks.setFavorites){
   const details=el('details');details.open=true;details.append(el('summary',`Saved properties (${cloud.length})`));const list=el('ul');list.className='buyer-favorites';
   for(const f of cloud){const li=el('li'),a=el('a','MLS '+f.mls_number);a.href='/property-search.html?mls='+encodeURIComponent(f.mls_number);li.append(a,button('Remove',()=>action(async()=>{await api.removeFavorite(f.listing_key);await load();})));list.append(li);}details.append(cloud.length?list:el('p','Save properties while browsing. Favorites saved on this device before signing in are added to your account automatically.'));signedIn.append(details);
  }
  const searchBox=el('details');searchBox.open=true;searchBox.append(el('summary',`Saved searches (${searches.length})`));
  if(searchWidget)searchBox.append(button('Save this search',()=>{searchOpen.click();searchWidget.scrollIntoView({block:'center',behavior:'smooth'});}));
  const list=el('ul');for(const s of searches){const li=el('li');if(hooks.applyFilters)li.append(button(s.name,()=>action(async()=>{if(!hooks.ready())throw Error('Wait for the full search to load.');hooks.applyFilters(savedSearch(s.name,s.filters).filters);tell('Showing '+s.name);})));
   else{const a=el('a',s.name);a.href='/property-search.html?saved='+encodeURIComponent(s.id);li.append(a);}li.append(button('Delete search',()=>action(async()=>{await api.removeSearch(s.id);await load();})));list.append(li);}
  searchBox.append(searches.length?list:el('p','No saved searches yet. Choose filters on the property search page, then save your search.'));signedIn.append(searchBox);
  const pref=el('details');pref.append(el('summary','Email alert preferences'),el('p','Choose daily, weekly or no email alerts. Updates are sent only when there are changes matching the topics you select.'));
  const form=el('form'),label=el('label','How often would you like updates?'),select=el('select');select.id='buyer-frequency';label.htmlFor=select.id;
  for(const [value,text] of [['none','No alerts'],['daily','Daily'],['weekly','Weekly']]){const option=new Option(text,value);select.append(option);}select.value=p?.frequency||'none';
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
