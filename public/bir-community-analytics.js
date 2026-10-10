/* BIR measurement v3: no names, email addresses, form text or saved properties. */
(() => {
  const domains = ['bircabo.com','caborealestatepros.com','cabo-homes.com','cabo-condos.com','cabo-land.com'];
  const own = host => domains.includes(host.replace(/^www\./,''));
  if (!own(location.hostname) || window.__birAnalytics) return;
  window.__birAnalytics = true;
  const id = 'G-9ETKPFN3KG', params = new URLSearchParams(location.search);
  let internal = params.get('bir_internal') === '1';
  try {
    if (params.has('bir_internal') && ['0','1'].includes(params.get('bir_internal'))) localStorage.setItem('bir_internal',params.get('bir_internal'));
    internal = internal || localStorage.getItem('bir_internal') === '1';
  } catch {}
  const privatePage = () => /buyer-account|auth\/|unsubscribe|alert-preferences|analytics-settings/.test(location.pathname);
  const blocked = () => internal || navigator.doNotTrack === '1' || navigator.globalPrivacyControl === true || privatePage();
  // Carry testing exclusion only between this family's five public websites.
  if (internal) {
    const mark = a => { try { const u=new URL(a.href,location.href); if(/^https?:$/.test(u.protocol)&&own(u.hostname)) {u.searchParams.set('bir_internal','1');a.href=u.href;} } catch {} };
    document.querySelectorAll('a[href]').forEach(mark);
    document.addEventListener('click',e=>{const a=e.target.closest?.('a[href]');if(a)mark(a);},true);
    const note=document.createElement('p');note.id='bir-testing-notice';note.textContent='Testing browser: visits and contact actions are excluded from Analytics.';note.style.cssText='position:fixed;bottom:0;left:0;right:0;z-index:99999;background:#183d49;color:white;padding:8px 12px;margin:0;font:12px system-ui;text-align:center;pointer-events:none';document.body.append(note);
    return;
  }
  if (blocked()) return;
  const clean = value => {try {const u=new URL(value);return /^https?:$/.test(u.protocol)?u.origin+u.pathname:'';}catch{return '';}};
  // Only our published, non-personal campaign labels are retained; other query data stays private.
  const knownCampaigns=new Set(['completed_ocean_view_20261006','completed_ocean_view_homes_20261006','mls_search_20261006']);
  const campaign=params.get('utm_source')==='facebook'&&params.get('utm_medium')==='social'&&knownCampaigns.has(params.get('utm_campaign'))
    ? {campaign_source:'facebook',campaign_medium:'social',campaign_name:params.get('utm_campaign')} : {};
  const debug=params.get('bir_debug')==='1';
  window.dataLayer=window.dataLayer||[];
  window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};
  const tag=window.gtag;
  tag('set','linker',{domains,decorate_forms:false});tag('js',new Date());
  tag('config',id,{send_page_view:false,page_location:clean(location.href),page_referrer:clean(document.referrer),allow_google_signals:false,allow_ad_personalization_signals:false,...campaign,...(debug?{debug_mode:true}:{})});
  const emit=(name,details={})=>{if(blocked())return;tag('event',name,{send_to:id,site_host:location.hostname,page_location:clean(location.href),page_referrer:clean(document.referrer),...details,...(debug?{debug_mode:true}:{})});};
  let lastPath='';
  const page=()=>{if(location.pathname===lastPath)return;lastPath=location.pathname;if(blocked())return;emit('page_view',{page_title:document.title});if(location.pathname==='/property-search.html')emit('mls_search_visit');if(['/casa-oasis.html','/pacifico-heights.html'].includes(location.pathname))emit('property_detail_view');};
  page();
  for(const method of ['pushState','replaceState']) {const original=history[method];history[method]=function(...args){const result=original.apply(this,args);setTimeout(page,0);return result;};}
  window.addEventListener('popstate',()=>setTimeout(page,0));
  const loader=document.createElement('script');loader.async=true;loader.src='https://www.googletagmanager.com/gtag/js?id='+id;document.head.append(loader);
  document.addEventListener('click',event=>{
    const a=event.target.closest?.('a[href]');if(!a)return;
    const u=new URL(a.href,location.href);let method;
    if(u.protocol==='mailto:')method='email';else if(u.protocol==='tel:')method='phone';else if(['wa.me','api.whatsapp.com'].includes(u.hostname))method='whatsapp';else if(['/contact','/contact.html'].includes(u.pathname))method='contact_page';
    if(method)emit('contact_click',{contact_method:method});
    if(u.hostname.replace(/^www\./,'')==='bircabo.com'&&['/property-search.html','/search'].includes(u.pathname))emit('mls_search_click',{entry_type:a.closest('[data-featured-properties]')?'featured_property':'search_link'});
  },true);
  const filters=new Set(['PropertyType','query','City','MLSAreaMajor','Address_co_Community2','SubdivisionName','construction','areaUnit','minLot','maxLot','minTotal','maxTotal','minAC','maxAC','minPrice','maxPrice','beds','view','financing']);let timer;
  const started=new WeakSet();
  document.addEventListener('input',event=>{
    const field=event.target,form=field.closest?.('form');
    if(form&&form.id!=='filters'&&(['inquiry-form','inquiry-draft'].includes(form.id)||form.hasAttribute('data-bir-lead-form'))&&!started.has(form)){started.add(form);emit('lead_form_start',{form_name:form.id==='inquiry-form'?'mls_inquiry':form.getAttribute('data-bir-lead-form')==='seller_inquiry'?'seller_inquiry':'general_contact'});}
    if(!field.closest?.('#filters')||!filters.has(field.id))return;clearTimeout(timer);timer=setTimeout(()=>emit('mls_filter_change',{filter_name:field.id}),1000);
  });
  document.addEventListener('change',event=>{const field=event.target;if(field.closest?.('#ov-filters')&&['ov-price','ov-beds','ov-community','ov-kind','ov-golf','ov-area','ov-mls-area','ov-mls-community','ov-subdivision','ov-size','ov-view','ov-sort'].includes(field.id))emit('property_filter_change',{filter_name:field.id});});
  // Explicit success comes only from the form's successful server response.
  document.addEventListener('bir-lead-result',event=>{
    const detail=event.detail||{};
    if(!['mls_inquiry','general_contact','seller_inquiry'].includes(detail.form))return;
    if(detail.outcome==='success')emit('generate_lead',{form_name:detail.form,contact_method:'website_form'});
    else if(detail.outcome==='error')emit('lead_form_error',{form_name:detail.form});
  });
  const openStates=new WeakMap();new MutationObserver(records=>{for(const record of records){const el=record.target;const property=el.id==='listing-gallery'||el.matches?.('dialog.cd-dialog');if(!property&&el.id!=='inquiry')continue;const open=el.hasAttribute('open');if(open&&!openStates.get(el))emit(property?'property_detail_view':'contact_click',property?{}:{contact_method:'inquiry_dialog'});openStates.set(el,open);}}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
})();
