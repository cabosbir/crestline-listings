import { ArrowRight, BookOpen, Home, MapPin, Search } from "lucide-react";
import heroImage from "@/assets/hero-luxury-villa.jpg";

const Hero = () => (
  <section className="relative overflow-hidden bg-slate-950 pt-28 pb-10 sm:pt-36 sm:pb-16">
    <img src={heroImage} alt="" aria-hidden="true" fetchPriority="high" loading="eager" width="1920" height="1080" className="absolute inset-0 h-full w-full object-cover object-[60%_center] sm:object-center" />
    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/50 to-slate-950/20" />
    <div className="relative container mx-auto px-4 sm:px-6 max-w-6xl">
      <p className="text-white/90 font-semibold tracking-wide text-sm sm:text-base mb-3">Baja International Realty · Local experience since 1987</p>
      <h1 className="text-white text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight max-w-3xl">Find your place in Cabo.</h1>
      <p className="text-white/90 text-lg sm:text-xl mt-4 max-w-2xl">Search freely. Understand your options. Get local help when you’re ready.</p>
      <nav aria-label="What would you like to do?" className="mt-7 sm:mt-9 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <a href="/property-search.html" className="sm:col-span-3 flex items-center justify-between gap-4 rounded-xl bg-white p-5 sm:p-7 text-blue-950 shadow-lg hover:bg-blue-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-400">
          <span className="flex items-center gap-3 sm:gap-4 min-w-0"><Search className="hidden sm:block h-8 w-8 shrink-0" aria-hidden="true" /><span><span className="block text-2xl sm:text-3xl font-bold">Search Properties</span><span className="block mt-2 text-base sm:text-lg leading-relaxed">Search Cabo MLS. Save favorites and compare properties at your own pace—<strong>no signup required.</strong></span></span></span>
          <ArrowRight className="h-7 w-7 shrink-0" aria-hidden="true" />
        </a>
        {[
          { href: '#buying-in-cabo', title: 'Understanding Buying', note: 'Ownership, steps and costs', Icon: BookOpen },
          { href: '#selling-in-cabo', title: 'Understanding Selling', note: 'Pricing, preparation and closing', Icon: Home },
          { href: '#cabo-communities', title: 'Explore Our Communities', note: 'Los Cabos, La Paz & beyond', Icon: MapPin },
        ].map(({ href, title, note, Icon }) => (
          <a key={href} href={href} className="flex items-center gap-3 rounded-xl border border-white/60 bg-slate-950/70 p-4 sm:p-5 text-white hover:bg-blue-950 focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-400">
            <Icon className="h-6 w-6 shrink-0" aria-hidden="true" /><span><span className="block text-lg sm:text-xl font-bold leading-snug">{title}</span><span className="block mt-1 text-sm text-white/90">{note}</span></span>
          </a>
        ))}
      </nav>
    </div>
  </section>
);

export default Hero;
