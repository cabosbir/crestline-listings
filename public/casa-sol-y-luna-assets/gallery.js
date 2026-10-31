(()=>{
const dialog=document.querySelector('#sl-photo-viewer');if(!dialog)return;
const links=[...document.querySelectorAll('.sl-gallery a')],image=dialog.querySelector('img'),caption=dialog.querySelector('figcaption'),count=dialog.querySelector('[data-photo-count]');
let index=0,origin=null;
function show(n){index=(n+links.length)%links.length;image.src=links[index].href;image.alt=links[index].querySelector('img').alt;caption.textContent=image.alt;count.textContent=(index+1)+' / '+links.length;}
function close(){dialog.close();origin?.focus({preventScroll:true});}
links.forEach((link,n)=>link.addEventListener('click',event=>{event.preventDefault();origin=link;show(n);dialog.showModal();}));
dialog.querySelector('[data-photo-close]').addEventListener('click',close);
dialog.querySelector('[data-photo-prev]').addEventListener('click',()=>show(index-1));dialog.querySelector('[data-photo-next]').addEventListener('click',()=>show(index+1));
dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close();}});
dialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();show(index-1);}if(event.key==='ArrowRight'){event.preventDefault();show(index+1);}});
let touchX=null;image.addEventListener('touchstart',event=>{touchX=event.changedTouches[0].clientX;},{passive:true});image.addEventListener('touchend',event=>{if(touchX===null)return;const dx=event.changedTouches[0].clientX-touchX;if(Math.abs(dx)>60)show(index+(dx<0?1:-1));touchX=null;},{passive:true});
})();
