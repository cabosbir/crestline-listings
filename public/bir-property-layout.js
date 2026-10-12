/* Make restored advanced filters visible; the existing MLS module owns all filtering. */
(()=>{
 const disclosure=document.getElementById('property-more-filters');
 if(!disclosure)return;
 const params=new URL(location.href).searchParams;
 if(['mlsArea','mlsCommunity','subdivision','community','view'].some(key=>params.get(key)))disclosure.open=true;
 const panel=document.getElementById('property-filter-panel');
 const narrow=matchMedia('(max-width:900px)');
 const hasFilters=['area','price','beds','size','kind','golf','sort','mlsArea','mlsCommunity','subdivision','community','view'].some(key=>params.get(key));
 if(narrow.matches&&!hasFilters)panel.open=false;
 narrow.addEventListener('change',event=>{if(!event.matches)panel.open=true;});
})();
