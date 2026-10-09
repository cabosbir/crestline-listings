import { useEffect, useState } from "react";
const groups = [["Properties", [["Condos for sale", "/cabo-san-lucas-condos-for-sale.html"], ["Houses & Villas for sale", "/cabo-homes-for-sale.html"], ["Land & building lots", "/cabo-land-for-sale.html"], ["Ocean-view condos · Cabo San Lucas", "/ocean-view-condos-cabo-san-lucas.html"], ["Ocean-view Houses & Villas · Cabo San Lucas", "/ocean-view-homes-cabo-san-lucas.html"], ["Featured properties", "/#featured-properties"], ["Recent price reductions", "/#price-reductions"], ["Casa Oasis · Private pool house", "/casa-oasis.html"]]], ["Areas & Communities", [["Compare all areas", "/los-cabos-areas-communities.html"], ["Cabo San Lucas", "/cabo-san-lucas-real-estate.html"], ["El Tezal", "/el-tezal-real-estate.html"], ["Pedregal", "/pedregal-real-estate.html"], ["San José del Cabo", "/san-jose-del-cabo-real-estate.html"], ["Los Cabos Corridor", "/los-cabos-corridor-real-estate.html"], ["Cerritos Beach", "/cerritos-beach-real-estate.html"], ["El Pescadero", "/el-pescadero-real-estate.html"], ["Todos Santos", "/todos-santos-real-estate.html"], ["Cabo’s Pacific side", "/cabo-san-lucas-pacific-side-real-estate.html"], ["East Cape", "/east-cape-real-estate.html"], ["La Paz", "/la-paz-real-estate.html"]]], ["Buying", [["Buying property in Cabo", "/buying-property-in-cabo.html"], ["Buying costs & questions", "/buying-property-in-cabo.html#closing-costs"], ["Property owner resources", "/los-cabos-property-owner-resources.html"]]], ["Selling", [["Selling your property", "/selling-property-in-cabo.html"], ["Request a property evaluation", "/seller-evaluation"]]], ["Market Updates", "/los-cabos-real-estate-market.html"], ["About BIR", [["Our story", "/about"], ["Meet our team", "/team"], ["Don Weis · Broker", "/don"]]], ["Contact", "/contact"]] as const;
const Navbar = () => {
  const [isOpen,setIsOpen]=useState(false);
  const [accountEmail,setAccountEmail]=useState('');
  useEffect(() => {
    let active = true, revision = 0;
    let unsubscribe = () => {};
    const modulePath = '/bir-account-ui.mjs';
    import(/* @vite-ignore */ modulePath).then(async ({ connectAccount }) => {
      const { client } = await connectAccount();
      if (!active) return;
      const refresh = async () => {
        const stamp = ++revision;
        try {
          const { data, error } = await client.auth.getUser();
          if (active && stamp === revision) setAccountEmail(!error && data.user?.email_confirmed_at ? data.user.email || '' : '');
        } catch { if (active && stamp === revision) setAccountEmail(''); }
      };
      const { data } = client.auth.onAuthStateChange(() => { setTimeout(() => { if (active) void refresh(); }, 0); });
      unsubscribe = () => data.subscription.unsubscribe();
      void refresh();
    }).catch(() => { if (active) setAccountEmail(''); });
    return () => { active = false; unsubscribe(); };
  }, []);

  useEffect(()=>{
    const close=(event: MouseEvent)=>{if(!(event.target as Element).closest('.bir-header')){setIsOpen(false);document.querySelectorAll<HTMLDetailsElement>('.bir-header details[open]').forEach(d=>d.open=false);}};
    const escape=(event: KeyboardEvent)=>{if(event.key==='Escape'){const expanded=document.querySelector<HTMLDetailsElement>('.bir-header details[open]');if(expanded){expanded.open=false;expanded.querySelector('summary')?.focus();}else if(isOpen){setIsOpen(false);document.querySelector<HTMLButtonElement>('.bir-menu-toggle')?.focus();}}};
    document.addEventListener('click',close);document.addEventListener('keydown',escape);
    return()=>{document.removeEventListener('click',close);document.removeEventListener('keydown',escape);};
  },[isOpen]);
  const closeMenu=()=>{setIsOpen(false);document.querySelectorAll<HTMLDetailsElement>('.bir-header details[open]').forEach(d=>d.open=false);};
  return <header className="bir-header"><nav className="bir-nav" aria-label="Main navigation">
    <a href="/" className="bir-brand" aria-label="BIR home"><img src="/BIRLOGO.png" alt="Baja International Realty" width="124" height="72" /></a>
    <div id="bir-navigation-links" className={'bir-nav-links'+(isOpen?' is-open':'')}>
      {groups.map(([label,items])=>typeof items==='string'?<a key={label} className="bir-nav-link" href={items} onClick={closeMenu}>{label}</a>:<details key={label} className="bir-nav-group" onToggle={event=>{const current=event.currentTarget;if(current.open)document.querySelectorAll<HTMLDetailsElement>('.bir-nav-group[open]').forEach(d=>{if(d!==current)d.open=false;});}}><summary>{label} <span aria-hidden="true">⌄</span></summary><div className="bir-nav-dropdown">{items.map(([text,url])=><a key={text} href={url} onClick={closeMenu}>{text}</a>)}</div></details>)}
      <a className="bir-mobile-account" href="/buyer-account.html" onClick={closeMenu}>My Account</a>
    </div>
    <div className="bir-nav-actions"><a className="bir-mls-button" href="/property-search.html">Search MLS</a><a href="/buyer-account.html" className="bir-account-link">My Account{accountEmail&&<span role="status" title={accountEmail}>Welcome back</span>}</a><button type="button" className="bir-menu-toggle" onClick={()=>setIsOpen(!isOpen)} aria-expanded={isOpen} aria-controls="bir-navigation-links">{isOpen?'Close':'Menu'} <span aria-hidden="true">{isOpen?'×':'☰'}</span></button></div>
  </nav></header>;
};
export default Navbar;
