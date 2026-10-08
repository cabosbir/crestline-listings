(() => {
const header=document.querySelector('.bir-header');if(!header)return;
const menu=header.querySelector('.bir-nav-links'),toggle=header.querySelector('.bir-menu-toggle');
const close=()=>{menu.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');header.querySelectorAll('details[open]').forEach(d=>d.open=false);};
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));menu.classList.toggle('is-open',open);});
header.querySelectorAll('details').forEach(d=>d.addEventListener('toggle',()=>{if(d.open)header.querySelectorAll('details[open]').forEach(other=>{if(other!==d)other.open=false;});}));
header.addEventListener('click',e=>{if(e.target.closest('a'))close();});document.addEventListener('click',e=>{if(!header.contains(e.target))close();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&header.contains(document.activeElement)){const open=header.querySelector('details[open]');if(open){open.open=false;open.querySelector('summary').focus();}else{close();toggle.focus();}}});
})();