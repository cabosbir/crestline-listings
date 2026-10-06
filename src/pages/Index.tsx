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
        <title>Cabo Real Estate &amp; MLS Search | Complete Los Cabos Inventory | BIR</title>
        <meta 
          name="description" 
          content="Search the complete Los Cabos MLS inventory of homes, condos and land. No signup required. Save favorites, compare properties and explore recent price reductions." 
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content="Cabo Real Estate | Search Freely, Buy & Sell With Local Help" />
        <meta property="og:description" content="Search the complete Los Cabos MLS inventory of homes, condos and land. No signup required. Save favorites, compare properties and explore recent price reductions." />
        <meta property="og:type" content="website" />
      </Helmet>
      <Navbar />
      <Hero />
      <section aria-label="Cabo property buyer guide" className="border-y border-blue-200 bg-blue-50 py-6"><div className="container mx-auto px-4 max-w-6xl"><h2 className="text-xl sm:text-2xl font-bold text-blue-950">Can foreigners buy property in Cabo?</h2><p className="mt-2 text-slate-700">Yes. Americans, Canadians and other foreign buyers can buy homes and condos in Cabo. For residential property in the coastal restricted zone, the usual route is a Mexican bank trust called a <em>fideicomiso</em>. The bank holds title as trustee, and you hold the beneficial rights to the property.</p><nav aria-label="Buying guide topics" className="mt-4 flex flex-wrap gap-x-6 gap-y-3 font-semibold text-blue-900"><a className="underline" href="https://www.caborealestatepros.com/cabo-real-estate-buyers-guide.html#ownership" target="_blank" rel="noopener">How foreign ownership works ↗</a><a className="underline" href="https://www.caborealestatepros.com/cabo-real-estate-buyers-guide.html#costs" target="_blank" rel="noopener">See closing-cost examples</a><a className="underline" href="https://www.caborealestatepros.com/cabo-real-estate-buyers-guide.html#annual-costs" target="_blank" rel="noopener">Explore annual property taxes</a><a className="underline" href="https://www.caborealestatepros.com/cabo-real-estate-buyers-guide.html" target="_blank" rel="noopener">Read the full buying guide ↗</a></nav><p className="mt-2 text-sm text-slate-600">Opens PROS in a new tab so you can keep browsing BIR.</p></div></section>
      <FloatingContact />

      <section id="property-resources" aria-labelledby="property-resources-title" className="scroll-mt-24 border-b border-blue-200 bg-white py-10 sm:py-14">
        <div className="container mx-auto max-w-6xl px-4">
          <p className="mb-2 font-semibold text-blue-900">Useful local tools</p>
          <h2 id="property-resources-title" className="text-2xl sm:text-3xl font-bold text-blue-950">Resources for Property Owners, Buyers &amp; Sellers</h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-slate-700">Whether you own a property, are preparing to sell or are researching a purchase, these government resources can help you find useful property information.</p>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <article className="rounded-xl border border-blue-200 bg-blue-50 p-5 sm:p-6">
              <h3 className="text-xl font-bold text-blue-950">Los Cabos property-tax statement (Predial)</h3>
              <p className="mt-3 leading-relaxed text-slate-700">Look up the municipal property-tax account using the property's <em>clave catastral</em> (cadastral identification number). Useful for owners checking their account, sellers gathering documents and buyers reviewing a property.</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">Enter the clave catastral and select <strong>Buscar</strong> (Search) to view the account statement. If browser translation displays “Enter password,” enter the property’s cadastral identification number in that field.</p>
              <a className="mt-5 inline-flex font-bold text-blue-900 underline underline-offset-4" href="https://www.tesoreria.loscabos.gob.mx/pagos/consultatupredial/consulta-predial.php" target="_blank" rel="noopener noreferrer">Check a property-tax statement ↗</a>
            </article>
            <article className="rounded-xl border border-blue-200 bg-blue-50 p-5 sm:p-6">
              <h3 className="text-xl font-bold text-blue-950">BCS government map</h3>
              <p className="mt-3 leading-relaxed text-slate-700">Explore the Los Cabos area with the state government's interactive mapping tool. Owners, sellers and buyers can use it as a reference when researching locations and surrounding areas.</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">The map opens centered on Los Cabos. Zoom in and explore the available layers. For a purchase or sale, have the property's legal boundaries confirmed separately.</p>
              <a className="mt-5 inline-flex font-bold text-blue-900 underline underline-offset-4" href="http://sig.bcs.gob.mx/iclusterbcs/?v=bGF0OjIzLjAzODY3LGxvbjotMTA5Ljc1NjY3LHo6NyxsOmNpbXAxMDB8Y2ltcDEwMXxjaW1wMTAyfGNpbXAxMDN8Y2ltcDEwNXxjaW1wMTA2" target="_blank" rel="noopener noreferrer">Open the government map ↗</a>
            </article>
          </div>
          <p className="mt-4 text-sm text-slate-600">Both government tools open in a new tab, keeping BIR available. For English, use your browser’s Translate option.</p>
          <p className="mt-5 text-slate-700">Need help preparing to buy or sell? <a className="font-semibold text-blue-900 underline underline-offset-4" href="/don">Contact Don Weis</a> for local guidance.</p>
        </div>
      </section>


      <section id="cabo-real-estate" className="py-14 bg-slate-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Cabo real estate: find the property that fits your life</h2>
          <p className="text-lg text-slate-700 leading-relaxed max-w-4xl">Compare homes, condos and land for sale in Cabo San Lucas, San José del Cabo and the surrounding Los Cabos communities. Start with how you plan to use the property: everyday living, a vacation home, rental income or a place to build. Baja International Realty combines a complete MLS search with decades of local experience to help you compare the choices.</p>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <article className="rounded-xl border bg-white p-6"><h3 className="text-xl font-bold mb-3">Cabo homes for sale</h3><p className="text-slate-700 leading-relaxed">A house offers room to consider private outdoor space, guests and the layout you want. Compare upkeep, access and neighborhood rules alongside bedrooms and views. A hillside home, a marina-area property and a coastal villa can offer very different daily routines.</p><a className="inline-block mt-4 text-blue-900 font-semibold underline" href="/property-search.html?type=houses">Search homes and villas for sale</a></article>
            <article className="rounded-xl border bg-white p-6"><h3 className="text-xl font-bold mb-3">Cabo condos for sale</h3><p className="text-slate-700 leading-relaxed">For a vacation home or year-round base, compare the building as carefully as the condo. Look at HOA dues, maintenance, parking, rental rules and which amenities are included. Verify the actual walk to the beach or restaurants rather than judging convenience from a view.</p><a className="inline-block mt-4 text-blue-900 font-semibold underline" href="/property-search.html?type=condos">Search condos for sale</a></article>
            <article className="rounded-xl border bg-white p-6"><h3 className="text-xl font-bold mb-3">Cabo land for sale</h3><p className="text-slate-700 leading-relaxed">Buying land starts with what you want to build. Compare access, slope, available services and community building rules before comparing price alone. A lower purchase price may come with additional site preparation or infrastructure costs.</p><a className="inline-block mt-4 text-blue-900 font-semibold underline" href="/property-search.html?type=land">Search land and building lots</a></article>
          </div>
          <h3 className="text-xl font-bold mt-8 mb-3">Choose your location before narrowing your list</h3>
          <p className="text-slate-700 leading-relaxed">Explore <a className="text-blue-900 underline" href="/cabo-san-lucas-real-estate.html">Cabo San Lucas</a> for marina life and everyday convenience, <a className="text-blue-900 underline" href="/san-jose-del-cabo-real-estate.html">San José del Cabo</a> for its town center and surrounding coastal neighborhoods, and the <a className="text-blue-900 underline" href="/los-cabos-corridor-real-estate.html">Los Cabos Corridor</a> for communities between the two towns. Our guides also explain the Pacific coast, East Cape and La Paz, including weather, access and how to find each area in the MLS.</p>
        </div>
      </section>


      <section id="buying-in-cabo" className="scroll-mt-24 py-14 sm:py-20 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <p className="text-blue-900 font-semibold mb-2">Understanding Buying</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">How do I buy property in Cabo San Lucas?</h2>
          <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">Start with how you want to use your property, the location and your total budget. Explore listings, compare your favorites and take time to understand ownership and the costs before making an offer.</p>

          <div className="space-y-3 mt-8">
            <details open className="rounded-xl border border-blue-200 bg-blue-50 p-5 sm:p-6">
              <summary className="cursor-pointer text-xl font-bold text-blue-950">Can Americans or Canadians buy property in Mexico?</summary>
              <p className="mt-4 leading-relaxed text-slate-700"><strong>Yes. Americans and Canadians have been buying homes in Cabo for decades.</strong> Foreign ownership through a Mexican bank trust called a fideicomiso is an established process. Buyers can enjoy their property, sell it or pass their rights on to designated beneficiaries through the trust.</p>
              <p className="mt-4 leading-relaxed text-slate-700"><strong>Today’s terms:</strong> These trusts have terms of up to 50 years and can be renewed upon request. Mexico’s 1993 Foreign Investment Law established this longer term. Because Cabo is in Mexico’s coastal restricted zone, the bank holds legal title as trustee and the buyer holds the beneficial rights. Your notary and trustee bank can explain the property documents, beneficiary designations and renewal steps for your purchase. <strong>The trust is renewable through the trustee bank. Mexican regulations provide that renewal shall be granted when the trust’s conditions continue to be met and the required application is submitted.</strong></p>
              <h3 className="mt-6 text-lg font-bold text-blue-950">A trust offers benefits beyond meeting ownership requirements</h3>
              <p className="mt-3 leading-relaxed text-slate-700">Mexican families also choose fideicomisos for inheritance and estate planning. For foreign buyers in Cabo, the property trust provides an established ownership structure and allows you to name successor beneficiaries—helping make the eventual transfer of your property rights to loved ones simpler.</p>
              <p className="mt-4 leading-relaxed text-slate-700">When properly structured, the trust can avoid the ordinary inheritance proceedings for the property rights covered by its beneficiary provisions, potentially reducing delays and expenses. Your beneficiaries still need to complete the trustee bank’s documentation and any applicable transfer formalities. Although the trust involves setup and annual fees, it also serves a useful purpose for you and your family.</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">Learn more: <a className="underline" href="https://www.bbva.mx/empresas/productos/fideicomisos/fideicomiso-zona-restringida.html" target="_blank" rel="noopener noreferrer">BBVA’s coastal property trust and successor beneficiaries</a>; <a className="underline" href="https://www.bbva.mx/personas/productos/patrimonial-y-privada/fideicomiso/testamentario.html" target="_blank" rel="noopener noreferrer">estate-planning trusts used in Mexico</a>.</p>
              <h3 className="mt-6 text-lg font-bold text-blue-950">Why the late 1980s were a turning point</h3>
              <p className="mt-3 leading-relaxed text-slate-700">The May 1989 regulations provided a route for a 30-year trust to continue through a new trust over the same property, subject to the required permits and conditions. Buyers often described this as “30 plus 30.” When a property sold to a different beneficiary, a new trust could begin a fresh term of up to 30 years, with renewal available under the rules. A sale alone did not automatically restart the term.</p>
              <p className="mt-4 leading-relaxed text-slate-700"><strong>BIR’s connection to that history:</strong> Don Weis recalls Stewart approaching him in the late 1980s and offering him the exclusive rights to offer title insurance throughout Mexico. He remembers the trust changes as major news for foreign buyers. In his experience, renewable trust terms and the availability of title insurance helped build buyer confidence and contributed to Cabo’s growing real estate market.</p>
              <p className="mt-4 leading-relaxed text-slate-700">Another milestone came in January 2002, when Stewart opened its Mexican subsidiary, Stewart Title Guaranty de México. It was the first Mexican title insurance underwriter licensed by Mexico’s Comisión Nacional de Seguros y Fianzas (CNSF) to issue title insurance policies in Mexico.</p>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">Historical and legal references: <a className="underline" href="https://tesiunamdocumentos.dgb.unam.mx/ppt1997/0223646/0223646.pdf#page=109" target="_blank" rel="noopener noreferrer">1989 regulations, Articles 20–21 (reproduced in a UNAM thesis, pp. 105–107; PDF in Spanish)</a>; <a className="underline" href="https://www.ordenjuridico.gob.mx/Documentos/Federal/html/wo14.html" target="_blank" rel="noopener noreferrer">Foreign Investment Law, Article 13</a>; <a className="underline" href="https://www.stewart.com/en/mexico/about-us" target="_blank" rel="noopener noreferrer">Stewart’s Mexican underwriting history</a>.</p>
              <a className="inline-block mt-4 text-blue-900 underline font-semibold" href="https://www.caborealestatepros.com/cabo-real-estate-buyers-guide.html#ownership" target="_blank" rel="noopener">Read about foreign ownership on Pros (opens a new tab)</a>
            </details>
            <details className="rounded-xl border border-border p-5 sm:p-6">
              <summary className="cursor-pointer text-xl font-bold">What are the closing costs when buying property in Cabo?</summary>
              <p className="mt-4 text-muted-foreground leading-relaxed">Closing costs in Cabo can be higher than buyers initially expect. A major part is the property acquisition tax, known as ISABI: Los Cabos has a 3% rate, applied to the applicable taxable value. Notary fees, public registration, appraisals and certificates also contribute. For foreign buyers using a new fideicomiso, the trust permit, bank setup and first annual trust fee add to the upfront cost.</p>
              <h3 className="mt-6 text-lg font-bold">Real closing-cost examples</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">These three new-trust estimates, prepared by Loyalty Consulting on September 21, 2026, illustrate how costs can vary with the purchase price. All amounts are in US dollars.</p>
              <p className="mt-4 font-semibold text-blue-950">Click a purchase price below to see the full breakdown. You can open more than one to compare.</p>
              <div className="mt-4 space-y-3">
                {[
                  { price: '$300,000', total: '$19,534', share: '6.51%', appraisal: '$360', certificates: '$543', tax: '$9,300', registry: '$1,320', taxes: '$10,620', notary: ['$2,500', '$2,900'], closing: ['$2,000', '$2,320'], expenses: ['$350', '$406'], services: ['$4,850', '$5,626'], advance: '$6,014' },
                  { price: '$750,000', total: '$39,339', share: '5.25%', appraisal: '$900', certificates: '$1,083', tax: '$23,250', registry: '$3,300', taxes: '$26,550', notary: ['$4,875', '$5,655'], closing: ['$2,500', '$2,900'], expenses: ['$350', '$406'], services: ['$7,725', '$8,961'], advance: '$7,134' },
                  { price: '$1,500,000', total: '$73,169', share: '4.88%', appraisal: '$1,800', certificates: '$1,983', tax: '$46,500', registry: '$6,600', taxes: '$53,100', notary: ['$9,275', '$10,759'], closing: ['$3,500', '$4,060'], expenses: ['$450', '$522'], services: ['$13,225', '$15,341'], advance: '$9,310' },
                ].map(estimate => (
                  <details key={estimate.price} className="group rounded-lg border-2 border-blue-200 bg-white">
                    <summary className="cursor-pointer rounded-lg bg-blue-50 p-4 text-blue-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-900">
                      <span className="font-bold text-lg">{estimate.price} purchase</span>
                      <span className="block mt-1">Estimated closing costs: <strong>{estimate.total}</strong> · {estimate.share} of price</span>
                      <span className="block mt-2 font-semibold underline group-open:hidden">View full breakdown</span>
                      <span className="hidden mt-2 font-semibold underline group-open:block">Close breakdown</span>
                    </summary>
                    <div className="p-4 sm:p-5 text-slate-700">
                      <p className="text-sm">Good faith estimate · New trust · September 21, 2026 · All amounts in USD</p>
                      {[
                        { title: 'Bank fees', rows: [['New trust permit (SRE)', '$1,585'], ['Acceptance by trustee bank', '$580'], ["First year’s management fee", '$580']], total: '$2,745' },
                        { title: 'Certificates and appraisal', rows: [['Certificate of no liens', '$43'], ['Manifestation', '$10'], ['Certificate of no property-tax debt', '$100'], ['Certificate of no water debt', '$30'], ['Government appraisal', estimate.appraisal]], total: estimate.certificates },
                        { title: 'Taxes and public registration', rows: [['Acquisition tax (ISABI), as quoted', estimate.tax], ['Public Registry fee', estimate.registry]], total: estimate.taxes },
                      ].map(section => (
                        <section key={section.title} className="mt-5">
                          <h4 className="font-bold text-blue-950">{section.title}</h4>
                          <dl className="mt-2 divide-y divide-slate-100">{section.rows.map(([label, amount]) => <div key={label} className="flex justify-between gap-4 py-2"><dt>{label}</dt><dd className="shrink-0 tabular-nums">{amount}</dd></div>)}<div className="flex justify-between gap-4 py-2 font-bold"><dt>Subtotal</dt><dd>{section.total}</dd></div></dl>
                        </section>
                      ))}
                      <h4 className="mt-5 font-bold text-blue-950">Service fees and 16% IVA</h4>
                      <div className="mt-2 overflow-x-auto"><table className="w-full text-left text-sm sm:text-base"><caption className="sr-only">Service fees for a {estimate.price} purchase</caption><thead><tr className="border-b"><th scope="col" className="py-2 pr-3">Service</th><th scope="col" className="p-2 text-right">Before IVA</th><th scope="col" className="py-2 pl-3 text-right">With IVA</th></tr></thead><tbody>{[['Notary public', ...estimate.notary], ['Promissory agreement & closing service', ...estimate.closing], ['Expenses', ...estimate.expenses], ['Service subtotal', ...estimate.services]].map(([label, base, amount]) => <tr key={label} className="border-b last:font-bold"><th scope="row" className="py-2 pr-3 font-inherit">{label}</th><td className="p-2 text-right whitespace-nowrap">{base}</td><td className="py-2 pl-3 text-right whitespace-nowrap">{amount}</td></tr>)}</tbody></table></div>
                      <p className="mt-5 flex justify-between gap-4 rounded-lg bg-blue-50 p-3 font-bold text-blue-950"><span>Total estimated closing costs</span><span className="shrink-0">{estimate.total}</span></p>
                      <p className="mt-3"><strong>Advance payment included in total closing costs:</strong> {estimate.advance}. This deposit covers miscellaneous fees due before closing. It is part of the total estimated closing costs above, not an additional charge.</p>
                      <p className="mt-3 text-sm leading-relaxed">Transcribed from Loyalty Consulting’s estimate, prepared by Lic. Jose Eduardo Garibay Perez. Amounts are estimates subject to change, including exchange-rate changes; the provider states that final amounts are supplied after registration. Some payment receipts may be issued in the seller’s name while the property remains registered to the seller. This sample is for information only and does not authorize payments or engage a closing provider.</p>
                    </div>
                  </details>
                ))}
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">Illustrative estimates, not fixed quotes. Totals reproduce the preparer’s figures; the acquisition-tax amounts in these samples equal 3.1% of the stated prices, so that calculation needs clarification in your individual quote. Costs depend on the taxable value, exchange rate, trust arrangement and services required. Confirm whether escrow, inspections, title insurance or financing costs apply and are included.</p>
              <p className="mt-4 text-muted-foreground leading-relaxed">Some charges are fixed or do not rise in direct proportion to the price, which can make closing costs a smaller percentage on a higher-priced purchase. Ask us for a written, itemized estimate for the property you are considering.</p>
              <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 sm:p-5">
                <h3 className="text-lg font-bold text-blue-950">The good news: look beyond the closing costs</h3>
                <section aria-label="Annual property tax example for a 500,000 US dollar home" className="mt-5 rounded-xl border-2 border-blue-300 bg-white p-4 sm:p-6">
                  <h4 className="text-xl sm:text-2xl font-bold text-blue-950">A $500,000 home: what could yearly property tax look like?</h4>
                  <p className="mt-3 text-slate-700 leading-relaxed">For this illustration, assume the municipal assessed value (valor catastral) equals US $500,000, or MXN $8,855,000 at <strong>17.7100 pesos per US dollar</strong>, Banco de México’s latest available FIX rate, dated September 25, 2026. Your actual assessed value can differ from the purchase price.</p>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <article className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                      <h5 className="text-lg font-bold text-blue-950">Exclusively residential, occupied by its owner</h5>
                      <p className="mt-2 text-sm text-slate-700">Annual base rate: 0.115331% of assessed value</p>
                      <p className="mt-4 text-slate-700">Without discount</p><p className="text-3xl font-bold text-blue-950">US $577 / year</p><p className="text-sm text-slate-600">Approximately MXN $10,213</p>
                      <p className="mt-4 text-slate-700">With a 20% early-payment discount</p><p className="text-3xl font-bold text-blue-950">US $461 / year</p><p className="text-sm text-slate-600">Approximately MXN $8,170</p>
                    </article>
                    <article className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                      <h5 className="text-lg font-bold text-blue-950">Residential rental or mixed use</h5>
                      <p className="mt-2 text-sm text-slate-700">Annual base rate: 0.22997% of assessed value</p>
                      <p className="mt-4 text-slate-700">Without discount</p><p className="text-3xl font-bold text-blue-950">US $1,150 / year</p><p className="text-sm text-slate-600">Approximately MXN $20,364</p>
                      <p className="mt-4 text-slate-700">With a 20% early-payment discount</p><p className="text-3xl font-bold text-blue-950">US $920 / year</p><p className="text-sm text-slate-600">Approximately MXN $16,291</p>
                    </article>
                  </div>
                  <p className="mt-4 text-sm text-slate-700 leading-relaxed">Illustrative base predial only, rounded to whole dollars and pesos; excludes other charges or arrears. The 20% discount was available in January and February 2026 and is not a current September offer. Future discounts depend on municipal approval. Use the property’s actual assessed value, classification and tax bill for your budget; a vacation home or short-term rental may have a different classification.</p>
                  <p className="mt-3 text-sm text-slate-600">Sources: <a className="underline" href="https://www.tesoreria.loscabos.gob.mx/wp-content/uploads/2025/03/LEY-DE-HACIENDA-PARA-EL-MUNICIPIO-DE-LOS-CABOS.pdf" target="_blank" rel="noopener noreferrer">Los Cabos tax law, Article 29</a>; <a className="underline" href="https://www.banxico.org.mx/tipcamb/tipCamMIAction.do?idioma=en" target="_blank" rel="noopener noreferrer">Banco de México FIX exchange rate</a>; <a className="underline" href="https://www.loscabos.gob.mx/anuncia-tesoreria-municipal-descuentos-en-el-pago-del-impuesto-predial-2026-en-los-cabos/" target="_blank" rel="noopener noreferrer">2026 early-payment discounts</a>.</p>
                </section>
                <p className="mt-3 leading-relaxed text-slate-700">Many buyers find their annual property taxes considerably lower than they are accustomed to in the United States or Canada. The local property tax, called predial, is based on the municipal assessed value and property classification. We can help you review the property’s actual tax bill alongside HOA fees, insurance, maintenance, utilities and annual trust fees, so you understand the ongoing ownership costs before buying.</p>
                <p className="mt-3 leading-relaxed text-slate-700">Early-payment discounts may also help. For 2026, Los Cabos offered 20% off annual predial in January and February and 10% in March; future discounts depend on the municipality’s announcements.</p>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Official references: <a className="underline" href="https://www.cbcs.gob.mx/index.php/boletines-2024/8156-aprueban-reformas-a-la-ley-hacendaria-de-los-cabos-para-fortalecer-el-saneamiento-ambiental" target="_blank" rel="noopener noreferrer">Los Cabos acquisition-tax reform</a>; <a className="underline" href="https://www.tesoreria.loscabos.gob.mx/wp-content/uploads/2025/03/LEY-DE-HACIENDA-PARA-EL-MUNICIPIO-DE-LOS-CABOS.pdf" target="_blank" rel="noopener noreferrer">municipal property-tax rules</a>; <a className="underline" href="https://www.loscabos.gob.mx/anuncia-tesoreria-municipal-descuentos-en-el-pago-del-impuesto-predial-2026-en-los-cabos/" target="_blank" rel="noopener noreferrer">2026 early-payment discounts</a>.</p>
            </details>
            <details className="rounded-xl border border-border p-5 sm:p-6">
              <summary className="cursor-pointer text-xl font-bold">Can I rent out my home or condo in Cabo?</summary>
              <p className="mt-4 text-muted-foreground leading-relaxed">Yes—in many cases, you can enjoy your Cabo property yourself and rent it when you are away. Foreign ownership through a fideicomiso can accommodate rental income. The key is choosing a property whose rules fit your plans.</p>
              <h3 className="mt-6 text-lg font-bold">Location comes first</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">Start with the experience your guests are looking for. Beachfront attracts people willing to pay a premium for being right on the water, although you will usually pay more to buy that location too. A beachfront home can perform very differently from a home directly behind it. Compare actual rental histories and purchase costs rather than assuming similar homes will earn similar income.</p>
              <p className="mt-3 text-muted-foreground leading-relaxed">For fishing visitors, convenient access to the marina can be a major attraction. Other guests want to walk to restaurants, bars and town activities without arranging taxis or renting a car. Think about the guests you want to attract and how easily they can enjoy the things they came to Cabo to do.</p>
              <h3 className="mt-6 text-lg font-bold">Give guests a reason to choose your property</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">When many nearby rentals offer essentially the same experience, guests can shop next door for a lower price. A distinctive property gives them reasons to choose yours beyond price alone. That applies at every budget, from an affordable retreat to an expensive beachfront home: thoughtful design, a memorable outdoor space, useful amenities and personal touches can help create an experience guests want to return to.</p>
              <h3 className="mt-6 text-lg font-bold">Repeat guests are a valuable part of the business</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">Based on our decades of local experience, building a base of returning guests is an important part of a successful rental. When guests choose to book future stays directly with you or your manager, you can reduce booking-platform fees and commissions. Agree with your manager how repeat bookings are handled and what fees still apply, and honor any existing booking-platform terms. Make it easy for guests who want to return to stay in touch.</p>
              <h3 className="mt-6 text-lg font-bold">A great property manager delivers the experience</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">The property needs to meet the expectations created by its photos and description—or exceed them. A great manager makes that happen through a clean, well-maintained home, clear communication, a smooth arrival and prompt help when something goes wrong. That consistency helps earn trust, recommendations and return visits. Choose a manager for the guest experience they deliver as well as the fee they charge.</p>
              <h3 className="mt-6 text-lg font-bold">Choose the rental approach that suits you</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">Vacation rentals can leave room for your own visits, while a longer-term rental commits the property to a tenant for the agreed period. Before buying, check whether the community permits your intended rental arrangement, including minimum stays, guest access and any rental-management requirements.</p>
              <h3 className="mt-6 text-lg font-bold">Understand your rental income and expenses</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">Ask for a realistic estimate that includes vacancies, management and booking fees, cleaning, utilities, maintenance, insurance and taxes. Your own visits also affect the number of nights available to rent. If a property already has a rental history, ask to review actual income and expenses rather than relying only on projections.</p>
              <p className="mt-5 rounded-lg border border-blue-200 bg-blue-50 p-4 font-semibold leading-relaxed text-blue-950">Tell us how you hope to use the property, and we can help you identify the rental questions to resolve before you buy.</p>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">Useful references: <a className="underline" href="https://www.ordenjuridico.gob.mx/Documentos/Federal/html/wo14.html" target="_blank" rel="noopener noreferrer">Foreign Investment Law, Article 12</a>; <a className="underline" href="https://www.sat.gob.mx/minisitio/PlataformasTecnologicas/PersonasFisicas/documentos/PreguntasFrecuentes_pf_con_act_emp.pdf" target="_blank" rel="noopener noreferrer">SAT guidance on platform income</a>; <a className="underline" href="https://tramites.bcs.gob.mx/catX/pago-del-impuesto-sobre-la-prestacion-de-servicios-de-hospedaje/" target="_blank" rel="noopener noreferrer">BCS lodging tax</a>; <a className="underline" href="https://www.tesoreria.loscabos.gob.mx/saneamiento-ambiental/" target="_blank" rel="noopener noreferrer">Los Cabos environmental sanitation charge</a>.</p>
            </details>
          </div>
          <a className="inline-flex mt-7 items-center gap-2 text-blue-900 font-bold text-lg underline underline-offset-4" href="https://www.caborealestatepros.com/cabo-real-estate-buyers-guide.html" target="_blank" rel="noopener">Read the full buying guide on Pros <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" /></a>
          <p className="mt-2 text-sm text-muted-foreground">Our Cabo Real Estate Pros guide opens in a new tab, so you can keep exploring Bircabo.</p>
        </div>
      </section>

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

      <section className="container mx-auto px-4 py-12 space-y-5" id="specialist-community-guides"><h2 className="text-2xl font-bold">Explore communities by the property you want</h2><p>Compare the same location through the practical questions that matter for a house, condo or building lot. Our specialist guides cover everyday services, water, views and the setting around each property.</p><div className="grid gap-6 md:grid-cols-3"><article><h3 className="text-lg font-semibold">El Tezal</h3><p><a className="text-blue-900 underline" href="https://www.cabo-homes.com/home-developments.html#el-tezal" target="_blank" rel="noopener">House guide ↗</a> · <a className="text-blue-900 underline" href="https://cabo-condos.com/condo-development.html#el-tezal" target="_blank" rel="noopener">Condo guide ↗</a> · <a className="text-blue-900 underline" href="https://cabo-land.com/communities.html#el-tezal" target="_blank" rel="noopener">Land guide ↗</a></p></article><article><h3 className="text-lg font-semibold">Pedregal</h3><p><a className="text-blue-900 underline" href="https://www.cabo-homes.com/home-developments.html#pedregal" target="_blank" rel="noopener">House guide ↗</a> · <a className="text-blue-900 underline" href="https://cabo-condos.com/condo-development.html#pedregal" target="_blank" rel="noopener">Condo guide ↗</a> · <a className="text-blue-900 underline" href="https://cabo-land.com/communities.html#pedregal-csl" target="_blank" rel="noopener">Land guide ↗</a></p></article><article><h3 className="text-lg font-semibold">Cerritos, Pescadero &amp; El Gavilan</h3><p><a className="text-blue-900 underline" href="https://www.cabo-homes.com/home-developments.html#cerritos-pescadero" target="_blank" rel="noopener">House guide ↗</a> · <a className="text-blue-900 underline" href="https://cabo-condos.com/condo-development.html#cerritos-pescadero" target="_blank" rel="noopener">Condo guide ↗</a> · <a className="text-blue-900 underline" href="https://cabo-land.com/communities.html#pescadero-cerritos" target="_blank" rel="noopener">Land guide ↗</a></p></article></div><p><small>Each guide opens in a new tab, keeping this page open.</small></p></section>
      <section id="cabo-communities" className="scroll-mt-24 py-14 sm:py-20 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
            <p className="text-blue-900 font-semibold mb-2">Explore Our Communities</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Explore communities in Los Cabos, La Paz and beyond</h2>
            <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">Where should you buy in Baja California Sur? Start with the way you want to live. Explore these seven areas, from Cabo San Lucas and San José del Cabo to the Tourist Corridor, East Cape, Pacific coast and La Paz. Each guide introduces the setting and the practical details worth comparing before choosing a home, condo or lot.</p>
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

      <Footer />
    </div>
  );
};

export default Index;
