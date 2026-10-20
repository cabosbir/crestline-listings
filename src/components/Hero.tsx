import heroImage from "@/assets/hero-luxury-villa.jpg";
const Hero = () => <section className="relative overflow-hidden bg-slate-950 py-14 sm:py-20">
  <img src={heroImage} alt="" aria-hidden="true" fetchPriority="high" loading="eager" width="1920" height="1080" className="absolute inset-0 h-full w-full object-cover object-[60%_center] sm:object-center" />
  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/65 to-slate-950/25" />
  <div className="relative container mx-auto px-5 max-w-6xl">
    <p className="text-white/90 font-semibold text-sm tracking-wide mb-4">BAJA INTERNATIONAL REALTY · LOCAL EXPERIENCE SINCE 1987</p>
    <h1 className="text-white text-4xl sm:text-5xl lg:text-6xl leading-tight max-w-3xl">Los Cabos real estate.<br />Find your place here.</h1>
    <p className="text-white/95 text-lg sm:text-xl mt-5 max-w-2xl leading-relaxed">Search current MLS listings for houses, condos and land in Cabo San Lucas, San José del Cabo and beyond. Compare properties yourself, or tell Don your budget and plans for help narrowing the choices.</p>
    <div className="flex flex-wrap gap-3 mt-7"><a href="/property-search.html" className="rounded-md bg-white text-blue-950 px-6 py-4 font-bold text-lg hover:bg-blue-50">Search Cabo MLS listings →</a><a href="#bir-inquiry" data-bir-inquiry="" data-bir-inquiry-context="BIR buyer inquiry — help finding a property" className="rounded-md border border-white/70 text-white px-6 py-4 font-semibold text-lg hover:bg-white/10">Send an inquiry</a></div>
    <p className="text-white/85 mt-3 text-sm">Browse freely. Save favorites and compare. No signup required. Include your budget, preferred area and buying timeframe when you inquire.</p>
    <nav className="flex flex-wrap gap-x-6 gap-y-3 mt-8 text-white font-semibold" aria-label="Start with a property type"><a href="/cabo-homes-for-sale.html" className="underline underline-offset-4">Houses &amp; Villas for sale</a><a href="/cabo-san-lucas-condos-for-sale.html" className="underline underline-offset-4">Condos for sale</a><a href="/cabo-land-for-sale.html" className="underline underline-offset-4">Land for sale</a><a href="#price-reductions" className="underline underline-offset-4">Recent price reductions</a></nav>
  </div>
</section>;
export default Hero;
