/* BIR public-site measurement v1. No form values, emails, search terms or saved items. */
(() => {
  if (!['bircabo.com','www.bircabo.com'].includes(location.hostname)) return;
  if (window.__birAnalytics || /buyer-account|auth\/|unsubscribe/.test(location.pathname)) return;
  if (navigator.doNotTrack === '1' || navigator.globalPrivacyControl === true) return;
  window.__birAnalytics = true;
  const id = 'G-9ETKPFN3KG';
  const domains = ['bircabo.com','caborealestatepros.com','cabo-homes.com','cabo-condos.com','cabo-land.com'];
  const clean = value => {
    try { const u = new URL(value); return /^https?:$/.test(u.protocol) ? u.origin + u.pathname : ''; }
    catch { return ''; }
  };
  const debug = new URLSearchParams(location.search).get('bir_debug') === '1';
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
  const tag = window.gtag;
  tag('set','linker',{domains,decorate_forms:false});
  tag('js',new Date());
  tag('config',id,{
    send_page_view:false,
    page_location:clean(location.href),page_referrer:clean(document.referrer),
    allow_google_signals:false,allow_ad_personalization_signals:false,
    ...(debug ? {debug_mode:true} : {})
  });
  const emit = (name, details = {}) => tag('event',name,{
    send_to:id,site_host:location.hostname,page_location:clean(location.href),
    page_referrer:clean(document.referrer),...details,...(debug ? {debug_mode:true} : {})
  });
  emit('page_view',{page_title:document.title});
  const loader=document.createElement('script');loader.async=true;
  loader.src='https://www.googletagmanager.com/gtag/js?id='+id;
  document.head.append(loader);
  if (location.pathname === '/property-search.html') emit('mls_search_visit');
  document.addEventListener('click',event=>{
    const a=event.target.closest?.('a[href]');
    if (!a) return;
    const u=new URL(a.href,location.href);
    if (u.protocol === 'mailto:') emit('contact_click',{contact_method:'email'});
    else if (u.protocol === 'tel:') emit('contact_click',{contact_method:'phone'});
    else if (u.hostname === 'wa.me' || u.hostname === 'api.whatsapp.com') emit('contact_click',{contact_method:'whatsapp'});
    else if (u.hostname.replace(/^www\./,'') === 'bircabo.com' && ['/property-search.html','/search'].includes(u.pathname)) emit('mls_search_click');
    else if (u.pathname === '/contact' || u.pathname === '/contact.html') emit('contact_click',{contact_method:'contact_page'});
  },true);
  const filters=new Set(['PropertyType','query','City','MLSAreaMajor','Address_co_Community2','SubdivisionName','construction','areaUnit','minLot','maxLot','minTotal','maxTotal','minAC','maxAC','minPrice','maxPrice','beds','view','financing']);
  let timer;
  document.addEventListener('input',event=>{
    const field=event.target;
    if (!field.closest?.('#filters') || !filters.has(field.id)) return;
    clearTimeout(timer);
    timer=setTimeout(()=>emit('mls_filter_change',{filter_name:field.id}),1000);
  });
  // Observe only dialog visibility; never read listing, account or inquiry contents.
  const openStates=new Map();
  const observer=new MutationObserver(records=>{
    for (const record of records) {
      const el=record.target;
      if (!['listing-gallery','inquiry'].includes(el.id)) continue;
      const open=el.hasAttribute('open');
      if (open && !openStates.get(el.id)) {
        if (el.id==='listing-gallery') emit('property_detail_view');
        else emit('contact_click',{contact_method:'inquiry_dialog'});
      }
      openStates.set(el.id,open);
    }
  });
  observer.observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
})();
