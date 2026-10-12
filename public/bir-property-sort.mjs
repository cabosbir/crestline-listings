// The collection owns filtering; this control changes its existing sort selector.
export function priceSortButton(sort){
 return `<button type="button" class="ov-sort-toggle" aria-controls="ov-grid">${sort==='price-desc'?'SORT Lowest to Highest':'SORT Highest to Lowest'}</button>`;
}
export function setupPriceSort(status,select){
 for(const option of select.options)option.defaultSelected=option.value==='price-desc';
 select.value='price-desc';
 status.addEventListener('click',event=>{
  if(!event.target.closest('.ov-sort-toggle'))return;
  select.value=select.value==='price-desc'?'price-asc':'price-desc';
  select.dispatchEvent(new Event('change',{bubbles:true}));
  status.querySelector('.ov-sort-toggle')?.focus({preventScroll:true});
 });
}
