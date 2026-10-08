import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import PriceReductions from "@/components/PriceReductions";
import StatsSection from "@/components/StatsSection";
import AgentBioCard from "@/components/AgentBioCard";
import WhyWorkWithUs from "@/components/WhyWorkWithUs";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";

// Full community guides are served as individual HTML pages in public/.
const communityGuides = [
  {
    "id": "cabo-san-lucas",
    "title": "Cabo San Lucas",
    "subtitle": "Marina life, beaches and everyday convenience",
    "intro": "Cabo San Lucas brings together the marina, Médano Beach, restaurants and the dramatic coastline around Land’s End. It is a natural starting point for buyers who want an active setting and convenient access to things to do. The town also extends well beyond its visitor center, so the experience changes considerably from one neighborhood to another.",
    "href": "/cabo-san-lucas-real-estate.html"
  },
  {
    "id": "san-jose-del-cabo",
    "title": "San José del Cabo",
    "subtitle": "Historic character, art and coastal living",
    "intro": "San José del Cabo offers a different introduction to Los Cabos: a historic center, a traditional plaza and an arts district with galleries, local work and places to eat. Beyond downtown, the coastline and marina add another side to the area. Buyers can explore a town-centered lifestyle while comparing residential settings farther from the historic streets.",
    "href": "/san-jose-del-cabo-real-estate.html"
  },
  {
    "id": "los-cabos-corridor",
    "title": "Los Cabos Tourist Corridor",
    "subtitle": "Between Cabo San Lucas and San José del Cabo",
    "intro": "The Los Cabos Tourist Corridor connects Cabo San Lucas and San José del Cabo along the Sea of Cortez. Often called the Cabo–San José Corridor, this coastal stretch combines desert scenery, ocean views, resorts and golf. It is worth exploring if you want a residential base between the two towns rather than in either town center.",
    "href": "/los-cabos-corridor-real-estate.html"
  },
  {
    "id": "east-cape",
    "title": "East Cape",
    "subtitle": "Sea of Cortez scenery and room to explore",
    "intro": "The East Cape, also known as Cabo del Este, follows the Sea of Cortez beyond San José del Cabo toward Cabo Pulmo and the wider eastern coast. Beaches, fishing and outdoor exploration are central to its appeal. This is a broad region rather than a single neighborhood, and the distance from established services varies greatly between locations.",
    "href": "/east-cape-real-estate.html"
  },
  {
    "id": "pacific-south",
    "title": "Cabo San Lucas — Pacific Side",
    "subtitle": "Pedregal to Rolling Hills · Pacific living with Cabo close by",
    "intro": "From Pedregal to Rolling Hills, Cabo’s Pacific side offers an ocean-facing lifestyle with convenient access to Cabo San Lucas shopping, medical care, restaurants and everyday services. Based on our decades of experience living here, we group this stretch together because of how people use and enjoy it—not because it follows one MLS boundary. The particular neighborhood, access road and distance into town still make a difference.",
    "href": "/cabo-san-lucas-pacific-side-real-estate.html"
  },
  {
    "id": "pacific-north",
    "title": "Pacific Coast — The Palm to Todos Santos",
    "subtitle": "A more rural coastal lifestyle, with small-town amenities farther north",
    "intro": "Starting at The Palm near KM 93 on Highway 19, this stretch introduces a different way of living: a more rural coastal setting, with more planning around everyday errands, continuing through the Pescadero and Cerritos area to Todos Santos and its small-town amenities. Our local experience is the basis for this grouping. It describes a lifestyle and a stretch of coast, not the MLS area called Pacific North.",
    "href": "/pacific-coast-todos-santos-real-estate.html"
  },
  {
    "id": "la-paz",
    "title": "La Paz",
    "subtitle": "Bayfront living, the malecón and a city to call home",
    "intro": "La Paz offers another way to enjoy Baja California Sur: life around a broad bay, a waterfront malecón and an established city. The promenade is a natural gathering place for walks and time outdoors, while the Sea of Cortez adds opportunities for boating, snorkeling and exploring. For buyers, the appeal is combining a coastal setting with the routines of everyday city life.",
    "href": "/la-paz-real-estate.html"
  }
];

const featuredPhotoOrder = ['26-1759','24-4467','26-3083','26-3891','25-5698','26-811'];
const handPickedMLS = new Set(['26-3891','26-1759','26-1326','25-3456','26-481','25-678','26-811','25-2758','26-616','26-246','26-3488','26-3314','26-1965']);
const isFeaturedListing = (row: any) => String(row.ListOfficeName || '').trim().toLowerCase() === 'baja international realty' || handPickedMLS.has(row.ListingId);

const Index = () => {
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState(false);
  const [featuredAttempt, setFeaturedAttempt] = useState(0);
  const [featuredVisible, setFeaturedVisible] = useState(6);
  const [featuredSort, setFeaturedSort] = useState('featured');
  const canonicalUrl = 'https://www.bircabo.com/';

  useEffect(() => {
    const abort = new AbortController();
    let live = true;
    setLoading(true);
    setFeaturedError(false);
    const timer = setTimeout(() => abort.abort(), 15000);
    fetch('/api/search-pilot?mode=snapshot', { signal: abort.signal })
      .then(async response => {
        if (!response.ok) throw new Error('Inventory unavailable');
        const data = await response.json();
        const age = Date.now() - Date.parse(data.fetchedAt);
        if (data.complete !== true || !Array.isArray(data.results) || data.total !== data.results.length || !Number.isFinite(age) || age >= 3600000 || age < -60000) throw new Error('Incomplete or outdated inventory');
        const office = data.results.filter((row: any) =>
          row.StandardStatus === 'Active' && row.InternetEntireListingDisplayYN !== false &&
          isFeaturedListing(row)
        );
        const batches = [];
        for (let i = 0; i < office.length; i += 24) batches.push(office.slice(i, i + 24));
        const detailed = await Promise.all(batches.map(async batch => {
          const response = await fetch('/api/search-pilot?keys=' + encodeURIComponent(batch.map((row: any) => row.ListingKey).join(',')), { signal: abort.signal });
          if (!response.ok) throw new Error('Photos unavailable');
          const result = await response.json();
          if (!Array.isArray(result.results) || !Number.isSafeInteger(result.total) || result.results.length !== result.total) throw new Error('Incomplete details');
          const requested = new Set(batch.map((row: any) => row.ListingKey));
          return result.results.filter((row: any) => requested.has(row.ListingKey) && row.StandardStatus === 'Active' && row.InternetEntireListingDisplayYN !== false && isFeaturedListing(row));
        }));
        if (live) setFeaturedProperties(detailed.flat());
      })
      .catch(() => { if (live) setFeaturedError(true); })
      .finally(() => { clearTimeout(timer); if (live) setLoading(false); });
    return () => { live = false; clearTimeout(timer); abort.abort(); };
  }, [featuredAttempt]);

  const sortedFeatured = [...featuredProperties].sort((a, b) => {
    if (featuredSort === 'featured') {
      const rank = (id: string) => { const index = featuredPhotoOrder.indexOf(id); return index < 0 ? featuredPhotoOrder.length : index; };
      const difference = rank(a.ListingId) - rank(b.ListingId);
      if (difference) return difference;
    }
    if (featuredSort === 'low') return Number(a.ListPrice) - Number(b.ListPrice);
    if (featuredSort === 'high') return Number(b.ListPrice) - Number(a.ListPrice);
    return String(b.ModificationTimestamp || '').localeCompare(String(a.ModificationTimestamp || '')) || String(a.ListingId).localeCompare(String(b.ListingId));
  });
  const featuredMoney = (price: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);

  // Team members - Updated with slugs for landing page routing
  const teamMembers = [
    {
      id: 12,
      slug: "don",
      name: "Don Weis",
      title: "Founder & Broker",
      image: "/don-weis.jpg",
    },
    {
      id: 1,
      slug: "bob",
      name: "Bob Van Patten",
      title: "Senior Real Estate Advisor",
      image: "/bob-van-patten.jpg",
    },
    {
      id: 3,
      slug: "alfonso",
      name: "Alfonso Puente",
      title: "Sales Manager & Commercial Real Estate Expert",
      image: "/alfonso-puente.jpg",
    },
    {
      id: 8,
      slug: "david",
      name: "David Scott Piper",
      title: "Real Estate Advisor",
      image: "/david-scott-piper.jpg",
    },
  ];

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Los Cabos Real Estate | Homes, Condos &amp; Land | BIR</title>
        <meta 
          name="description" 
          content="Find homes, condos and land in Los Cabos. Compare Cabo San Lucas, San José del Cabo, Cerritos, El Pescadero and Todos Santos with Baja International Realty." 
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content="Los Cabos Real Estate | Homes, Condos &amp; Land | BIR" />
        <meta property="og:description" content="Find homes, condos and land in Los Cabos. Compare Cabo San Lucas, San José del Cabo, Cerritos, El Pescadero and Todos Santos with Baja International Realty." />
        <meta property="og:type" content="website" />
      </Helmet>
      <Navbar />
      <main id="main-content">
      <Hero />
      <section id="cabo-real-estate" className="scroll-mt-24 py-12 sm:py-16 bg-slate-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Cabo real estate: find the property that fits your life</h2>
          <p className="text-lg text-slate-700 leading-relaxed max-w-4xl">Compare homes, condos and land for sale in Cabo San Lucas, San José del Cabo and the surrounding Los Cabos communities. Start with how you plan to use the property: everyday living, a vacation home, rental income or a place to build. Baja International Realty combines a complete MLS search with decades of local experience to help you compare the choices.</p>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <article id="cabo-homes" className="scroll-mt-24 rounded-xl border bg-white p-6"><h3 className="text-xl font-bold mb-3">Cabo homes for sale</h3><p className="text-slate-700 leading-relaxed">A house offers room to consider private outdoor space, guests and the layout you want. Compare upkeep, access and neighborhood rules alongside bedrooms and views. A hillside home, a marina-area property and a coastal villa can offer very different daily routines.</p><a className="inline-block mt-4 text-blue-900 font-semibold underline" href="/property-search.html?type=houses">Search homes and villas for sale</a></article>
            <article className="rounded-xl border bg-white p-6"><h3 className="text-xl font-bold mb-3">Cabo condos for sale</h3><p className="text-slate-700 leading-relaxed">For a vacation home or year-round base, compare the building as carefully as the condo. Look at HOA dues, maintenance, parking, rental rules and which amenities are included. Verify the actual walk to the beach or restaurants rather than judging convenience from a view.</p><a className="inline-block mt-4 text-blue-900 font-semibold underline" href="/cabo-san-lucas-condos-for-sale.html">Explore Cabo San Lucas condos</a></article>
            <article id="cabo-land" className="scroll-mt-24 rounded-xl border bg-white p-6"><h3 className="text-xl font-bold mb-3">Cabo land for sale</h3><p className="text-slate-700 leading-relaxed">Buying land starts with what you want to build. Compare access, slope, available services and community building rules before comparing price alone. A lower purchase price may come with additional site preparation or infrastructure costs.</p><a className="inline-block mt-4 text-blue-900 font-semibold underline" href="/property-search.html?type=land">Search land and building lots</a></article>
          </div>
          <h3 className="text-xl font-bold mt-8 mb-3">Choose your location before narrowing your list</h3>
          <p className="text-slate-700 leading-relaxed">Explore <a className="text-blue-900 underline" href="/cabo-san-lucas-real-estate.html">Cabo San Lucas</a> for marina life and everyday convenience, <a className="text-blue-900 underline" href="/san-jose-del-cabo-real-estate.html">San José del Cabo</a> for its town center and surrounding coastal neighborhoods, and the <a className="text-blue-900 underline" href="/los-cabos-corridor-real-estate.html">Los Cabos Corridor</a> for communities between the two towns. Our guides also explain the Pacific coast, East Cape and La Paz, including weather, access and how to find each area in the MLS.</p>
        </div>
      </section>
      <section id="cabo-communities" className="scroll-mt-24 py-14 sm:py-20 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
            <p className="text-blue-900 font-semibold mb-2">Explore Our Communities</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Explore communities in Los Cabos, La Paz and beyond</h2>
            <p className="text-lg text-slate-700 max-w-3xl leading-relaxed">Where should you buy in Baja California Sur? Start with the way you want to live. Explore these areas, from Cabo San Lucas and San José del Cabo to the Tourist Corridor, East Cape, Pacific coast and La Paz. Each guide introduces the setting and the practical details worth comparing before choosing a home, condo or lot.</p>
            <p className="mt-5 rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-950 leading-relaxed">Based on our decades of experience living here, these guides group places by lifestyle and location. Names in the MLS search filters may differ. The two Pacific guides below include tips to help you find the right properties.</p>
            <div className="grid md:grid-cols-2 gap-5 my-8 items-start">
              {communityGuides.map(community => (
                <article key={community.id} id={community.id} className="scroll-mt-24 rounded-xl border border-blue-200 p-6 sm:p-7">
                  <h3 className="text-2xl font-bold text-blue-950 mb-2"><a href={community.href} className="hover:underline underline-offset-4">{community.title}</a></h3>
                  <p className="text-blue-900 font-semibold mb-4">{community.subtitle}</p>
                  <p className="text-slate-700 leading-relaxed">{community.intro}</p>
                  <a href={community.href} className="inline-flex items-center gap-2 mt-5 text-blue-900 font-bold underline underline-offset-4">Read the full community guide <ArrowRight className="h-4 w-4" aria-hidden="true" /><span className="sr-only">: {community.title}</span></a>
                </article>
              ))}
          </div>
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-6">
            <h3 className="text-xl font-bold text-blue-950">Know a subdivision already? Go straight to it.</h3>
            <p className="mt-2 mb-5 text-slate-700 leading-relaxed">Our MLS search lets you start with a zone and narrow down to area, community and subdivision—or choose a subdivision directly. Use the map, save up to 50 favorites and compare up to three properties side by side.</p>
            <Button asChild size="lg" className="bg-blue-900 hover:bg-blue-800 text-white"><a href="/property-search.html">Explore the MLS Map <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" /></a></Button>
            <p className="mt-4 text-base text-slate-700">No signup required. Favorites stay saved in this browser; clearing browser data removes them.</p>
          </div>
        </div>
      </section>

      <section id="pacific-coast" className="scroll-mt-24 bg-blue-950 text-white py-12 sm:py-16"><div className="container mx-auto px-4 max-w-6xl">
        <p className="text-blue-100 font-semibold mb-3">EXPLORE THE PACIFIC COAST</p><h2 className="text-white text-3xl sm:text-4xl mb-4">Cerritos, El Pescadero &amp; Todos Santos</h2>
        <p className="max-w-3xl text-lg leading-relaxed text-blue-50">Three places to consider, each with different choices for your home, daily routine and access to the coast. Start with the questions that matter to you, then compare properties with BIR.</p>
        <div className="grid md:grid-cols-3 gap-5 mt-7">{[
          ['Cerritos Beach','Beach-area homes, condos and land. Compare the actual route to the beach and the services available at each property.','/cerritos-beach-real-estate.html'],
          ['El Pescadero','Explore a rural coastal setting and compare homes and lots by access, water, utilities and your everyday routine.','/el-pescadero-real-estate.html'],
          ['Todos Santos','Compare living close to town with coastal and outlying neighborhoods, and decide what fits the way you want to live.','/todos-santos-real-estate.html']
        ].map(([title,note,url])=><a key={url} href={url} className="rounded-lg border border-white/30 p-6 hover:bg-white/10"><h3 className="text-white text-2xl mb-3">{title}</h3><p className="text-blue-50 leading-relaxed">{note}</p><span className="inline-block mt-4 font-bold underline underline-offset-4">Explore {title} →</span></a>)}</div>
      </div></section>

      <section id="casa-oasis" aria-labelledby="casa-oasis-title" className="scroll-mt-24 bg-slate-50 py-12 sm:py-16"><div className="container mx-auto px-4 max-w-6xl grid md:grid-cols-2 gap-8 items-center"><a href="/casa-oasis.html" aria-label="Explore Casa Oasis"><img src="https://cabo-homes.com/casa-oasis-assets/casa-oasis-01.jpg" alt="Casa Oasis private pool and tropical courtyard in Cabo San Lucas" width="1920" height="1280" loading="lazy" className="w-full rounded-2xl aspect-[3/2] object-cover" /></a><div><p className="text-blue-900 font-semibold">New pocket listing · Cabo San Lucas</p><h2 id="casa-oasis-title" className="text-3xl sm:text-4xl font-bold mt-3">Casa Oasis</h2><p className="text-2xl font-bold text-blue-950 mt-4">US$549,000</p><p className="font-semibold mt-3">3 bedrooms · 2 bathrooms · Private pool · No HOA dues</p><p className="mt-4 text-slate-700 leading-relaxed">A walled tropical courtyard, quiet dead-end street and the convenience of Cabo close at hand. Explore the photos and video, then contact Don for a private showing.</p><a href="/casa-oasis.html" className="inline-flex mt-6 rounded-lg bg-blue-950 text-white font-semibold px-6 py-3">View Casa Oasis →</a></div></div></section>

      <section aria-label="Cabo property buyer guide" className="border-y border-blue-200 bg-blue-50 py-6"><div className="container mx-auto px-4 max-w-6xl"><h2 className="text-xl sm:text-2xl font-bold text-blue-950">Can foreigners buy property in Cabo?</h2><p className="mt-2 text-slate-700">Yes. Americans, Canadians and other foreign buyers can buy homes and condos in Cabo. For residential property in the coastal restricted zone, the usual route is a Mexican bank trust called a <em>fideicomiso</em>. The bank holds title as trustee, and you hold the beneficial rights to the property.</p><nav aria-label="Buying guide topics" className="mt-4 flex flex-wrap gap-x-6 gap-y-3 font-semibold text-blue-900"><a className="underline" href="/buying-property-in-cabo.html#ownership">How foreign ownership works</a><a className="underline" href="/buying-property-in-cabo.html#closing-costs">See closing-cost examples</a><a className="underline" href="/buying-property-in-cabo.html#annual-costs">Explore annual property taxes</a><a className="underline" href="/buying-property-in-cabo.html">Read the full buying guide →</a></nav><p className="mt-2 text-sm text-slate-600">Ownership, costs and buying questions, together on BIR.</p></div></section>
      <FloatingContact />

      <section id="los-cabos-market-guide" aria-labelledby="market-guide-title" className="border-b border-blue-200 bg-slate-50 py-10 sm:py-14">
        <div className="container mx-auto max-w-6xl px-4">
          <p className="mb-2 font-semibold text-blue-900">Local experience, current market context</p>
          <h2 id="market-guide-title" className="text-2xl sm:text-3xl font-bold text-blue-950">Los Cabos real estate market: what buyers should know</h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-slate-700">Understand recent market activity, compare asking prices and ownership costs, and learn what Don Weis looks for when evaluating completed property and preconstruction.</p>
          <a className="mt-5 inline-flex font-bold text-blue-900 underline underline-offset-4" href="/los-cabos-real-estate-market.html">Read our October 2026 market guide →</a>
        </div>
      </section>

      <section id="property-resources" className="scroll-mt-24 border-b border-blue-200 bg-white py-10 sm:py-14"><div className="container mx-auto max-w-6xl px-4"><p className="mb-2 font-semibold text-blue-900">Useful local tools</p><h2 className="text-2xl sm:text-3xl font-bold text-blue-950">Los Cabos Property Owner Resources</h2><p className="mt-3 max-w-3xl leading-relaxed text-slate-700">Find the official property-tax statement lookup and government map, with instructions for using your cadastral number and browser translation.</p><a className="mt-5 inline-flex font-bold text-blue-900 underline underline-offset-4" href="/los-cabos-property-owner-resources.html">Open property owner resources →</a></div></section>

      <section id="buying-in-cabo" className="scroll-mt-24 py-14 sm:py-20 bg-background"><div className="container mx-auto px-4 max-w-6xl"><p className="text-blue-900 font-semibold mb-2">Understanding Buying</p><h2 className="text-3xl sm:text-4xl font-bold mb-4">How do I buy property in Cabo San Lucas?</h2><p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">Compare homes, condos and land with a clear understanding of ownership, closing costs and ongoing expenses. Our buying guide brings the questions and detailed cost examples together on one page.</p><nav aria-label="Buying guide topics" className="mt-5 flex flex-wrap gap-x-6 gap-y-3 font-semibold text-blue-900"><a className="underline" href="/buying-property-in-cabo.html">Read the buying guide →</a><a className="underline" href="/buying-property-in-cabo.html#closing-costs">Explore buying costs</a></nav></div></section>

      <section id="selling-in-cabo" className="scroll-mt-24 py-14 sm:py-20 bg-slate-50 border-y border-border">
        <div className="container mx-auto px-4 max-w-6xl">
          <p className="text-blue-900 font-semibold mb-2">Understanding Selling</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">How do I sell my property in Cabo San Lucas?</h2>
          <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">Start with a realistic valuation and an estimate of what you would receive after selling costs. Then prepare the property and documents, agree on a marketing plan, review offers and work through closing.</p>
          <div className="grid sm:grid-cols-2 gap-5 my-8">
            <div className="bg-white border border-border rounded-xl p-6"><h3 className="text-xl font-bold mb-3">What is my Cabo property worth?</h3><p className="text-muted-foreground leading-relaxed">Asking prices are a starting point. Recent comparable sales, location, condition, views and competing listings help establish a realistic price. A local evaluation can explain how your property compares.</p><Link className="inline-block mt-4 text-blue-900 font-semibold underline" to="/seller-evaluation">Request a property evaluation</Link></div>
            <div className="bg-white border border-border rounded-xl p-6"><h3 className="text-xl font-bold mb-3">What costs should I plan for when selling?</h3><p className="text-muted-foreground leading-relaxed">Request an estimate of your net proceeds that accounts for agreed selling fees, applicable taxes and closing expenses. If your agent does not want to start by reviewing your title, find another agent. Your title contains important information your agent needs to evaluate to give you an estimated breakdown of the net money you would receive. Your agent should provide this upfront, as part of evaluating your listing price.</p></div>
          </div>
          <a className="inline-flex items-center gap-2 text-blue-900 font-bold text-lg underline underline-offset-4" href="https://www.caborealestatepros.com/selling-los-cabos-mexico-real-estate.html" target="_blank" rel="noopener">Read the full selling guide on Pros <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" /></a>
          <p className="mt-2 text-sm text-muted-foreground">Opens in a new tab. You can read first and contact us whenever you’re ready.</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 space-y-5" id="specialist-community-guides"><h2 className="text-2xl font-bold">Explore communities by the property you want</h2><p>Compare the same location through the practical questions that matter for a house, condo or building lot. Our specialist guides cover everyday services, water, views and the setting around each property.</p><div className="grid gap-6 md:grid-cols-3"><article><h3 className="text-lg font-semibold">El Tezal</h3><p><a className="text-blue-900 underline" href="https://www.cabo-homes.com/home-developments.html#el-tezal" target="_blank" rel="noopener">House guide ↗</a> · <a className="text-blue-900 underline" href="https://cabo-condos.com/condo-development.html#el-tezal" target="_blank" rel="noopener">Condo guide ↗</a> · <a className="text-blue-900 underline" href="https://cabo-land.com/communities.html#el-tezal" target="_blank" rel="noopener">Land guide ↗</a></p><div id="el-tezal-storage" className="mt-4 scroll-mt-24 rounded-lg border border-slate-200 bg-slate-50 p-4"><h4 className="font-semibold">Need storage in El Tezal?</h4><p className="mt-2 text-sm leading-relaxed"><a className="text-blue-900 underline" href="https://eltezalselfstorage.com/" target="_blank" rel="noopener">El Tezal Self Storage ↗</a>, where Don Weis is an owner/partner, offers residential storage next door to Plaza Novva, with access from behind Costco. Store belongings while moving, renovating or settling into your Cabo property.</p></div></article><article><h3 className="text-lg font-semibold">Pedregal</h3><p><a className="text-blue-900 underline" href="https://www.cabo-homes.com/home-developments.html#pedregal" target="_blank" rel="noopener">House guide ↗</a> · <a className="text-blue-900 underline" href="https://cabo-condos.com/condo-development.html#pedregal" target="_blank" rel="noopener">Condo guide ↗</a> · <a className="text-blue-900 underline" href="https://cabo-land.com/communities.html#pedregal-csl" target="_blank" rel="noopener">Land guide ↗</a></p></article><article><h3 className="text-lg font-semibold">Cerritos, Pescadero &amp; El Gavilan</h3><p><a className="text-blue-900 underline" href="https://www.cabo-homes.com/home-developments.html#cerritos-pescadero" target="_blank" rel="noopener">House guide ↗</a> · <a className="text-blue-900 underline" href="https://cabo-condos.com/condo-development.html#cerritos-pescadero" target="_blank" rel="noopener">Condo guide ↗</a> · <a className="text-blue-900 underline" href="https://cabo-land.com/communities.html#pescadero-cerritos" target="_blank" rel="noopener">Land guide ↗</a></p></article></div><p><small>Each guide opens in a new tab, keeping this page open.</small></p></section>


      {/* Featured Properties */}
      <section id="featured-properties" className="py-16 sm:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mb-8">
            <p className="text-accent uppercase tracking-wider mb-3 font-semibold">Explore our featured selection</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Properties</h2>
            <p className="text-lg text-muted-foreground">Explore featured homes, condos and land, including active BIR office listings and properties hand-picked by Don. Open any property for photos and full details, then save your favorites and compare. No signup required.</p>
          </div>
          {loading ? <div role="status" className="flex items-center gap-3 py-10"><Loader2 className="h-6 w-6 animate-spin" />Loading featured listings…</div>
          : featuredError ? <div role="status" className="p-8 border border-border rounded-xl"><p className="mb-4">We couldn't load featured listings. Please try again or explore the MLS search below.</p><Button variant="outline" onClick={() => setFeaturedAttempt(n => n + 1)}>Try Again</Button></div>
          : featuredProperties.length === 0 ? <p className="py-8">There are no active featured listings available in the public feed right now. Explore the full MLS search below.</p>
          : <>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <p className="font-semibold" aria-live="polite">{featuredProperties.length} active featured listings</p>
              <label className="flex items-center gap-2 font-medium">Sort by
                <select className="border border-border rounded-lg p-3 bg-background" value={featuredSort} onChange={event => { setFeaturedSort(event.target.value); setFeaturedVisible(6); }}>
                  <option value="featured">Featured picks</option><option value="updated">Recently updated</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option>
                </select>
              </label>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedFeatured.slice(0, featuredVisible).map(property => <a key={property.ListingKey} href={`/property-search.html?mls=${encodeURIComponent(property.ListingId)}`} className="group block rounded-2xl overflow-hidden border border-border bg-card hover:shadow-lg transition-shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
                <div className="relative">
                  {property.Media?.[0]?.MediaURL ? <img src={property.Media[0].MediaURL} alt={property.UnparsedAddress || 'BIR property'} loading="lazy" className="w-full aspect-[4/3] object-cover" /> : <div className="aspect-[4/3] bg-muted flex items-center justify-center">Photo coming soon</div>}
                  <span className="absolute top-3 left-3 bg-white text-primary rounded-full px-3 py-1 text-sm font-semibold shadow-sm">{property.PropertyType}</span>
                </div>
                <div className="p-5">
                  <p className="text-2xl font-bold mb-2">{featuredMoney(property.ListPrice)} <span className="text-sm font-normal">USD</span></p>
                  <h3 className="text-lg font-semibold leading-snug mb-2">{property.UnparsedAddress || property.SubdivisionName || 'View property'}</h3>
                  <p className="text-muted-foreground">{[property.SubdivisionName, property.City].filter(Boolean).join(' · ')}</p>
                  <p className="text-sm mt-3">{Number(property.BedroomsTotal) > 0 ? `${property.BedroomsTotal} beds · ` : ''}{Number(property.BathroomsTotalDecimal) > 0 ? `${property.BathroomsTotalDecimal} baths · ` : ''}MLS {property.ListingId}</p>
                  <p className="text-primary font-semibold mt-5 group-hover:underline">View photos &amp; details →</p>
                </div>
              </a>)}
            </div>
            {featuredVisible < featuredProperties.length && <div className="text-center mt-8"><Button variant="outline" size="lg" className="max-w-full whitespace-normal h-auto py-3 px-4" onClick={() => setFeaturedVisible(n => n + 6)}>Show More Featured Properties ({featuredProperties.length - featuredVisible} remaining)</Button></div>}
          </>}
          <div className="mt-8 text-center"><Button asChild size="lg"><a href="/property-search.html">Search All MLS Properties <ArrowRight className="ml-2 h-5 w-5" /></a></Button></div>
        </div>
      </section>

      {/* Stats Section */}
      <PriceReductions />

      <StatsSection />

      {/* Team Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px w-16 bg-border" />
              <p className="text-muted-foreground uppercase tracking-wider text-sm">
                Our Rockstar
              </p>
              <div className="h-px w-16 bg-border" />
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-foreground">
              TEAM
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {teamMembers.map((member) => (
              <Link to={member.slug ? `/${member.slug}` : `/team/${member.id}`} key={member.id}>
                <AgentBioCard
                  {...member}
                  showStats={false}
                  landingPageSlug={member.slug}
                />
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link to="/team">
              <Button variant="outline" size="lg">
                Meet Our Full Team <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Work With Us */}
      <WhyWorkWithUs />

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Buyers */}
            <div className="text-center p-8 bg-primary-foreground/10 rounded-2xl backdrop-blur-sm border border-primary-foreground/20">
              <h3 className="text-3xl font-bold mb-4">Ready to Buy?</h3>
              <p className="text-primary-foreground/80 mb-6">
                Let us help you find your dream property with expert guidance and personalized service.
              </p>
              <Link to="/search">
                <Button variant="hero" size="lg" className="w-full">
                  Start Your Search
                </Button>
              </Link>
            </div>

            {/* Sellers */}
            <div className="text-center p-8 bg-accent/90 rounded-2xl backdrop-blur-sm shadow-gold">
              <h3 className="text-3xl font-bold mb-4 text-accent-foreground">Ready to Sell?</h3>
              <p className="text-accent-foreground/80 mb-6">
                Get a free property evaluation and discover how we can maximize your home's value.
              </p>
              <Link to="/seller-evaluation">
                <Button variant="default" size="lg" className="w-full">
                  Free Home Evaluation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      </main>
      <Footer />
    </div>
  );
};

export default Index;
