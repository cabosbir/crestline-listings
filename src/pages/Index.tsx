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

const communityGuides = [
  {
    id: 'cabo-san-lucas', title: 'Cabo San Lucas', subtitle: 'Marina life, beaches and everyday convenience',
    intro: 'Cabo San Lucas brings together the marina, Médano Beach, restaurants and the dramatic coastline around Land’s End. It is a natural starting point for buyers who want an active setting and convenient access to things to do. The town also extends well beyond its visitor center, so the experience changes considerably from one neighborhood to another.',
    paragraphs: [
      'When exploring Cabo San Lucas homes and condos for sale, think about how you will spend an ordinary day. Would you rather walk to dinner and the marina, or have more separation from the busiest streets? An elevated view can be appealing, but it may come with a steeper drive and less walkability.',
      'Visit at different times of day to compare traffic, activity and noise. Check the actual route to the beach, parking, grocery shopping and any services you use regularly. For a condominium, review the building’s upkeep, shared amenities and rules as carefully as the unit itself. Cabo can suit very different lifestyles; choosing the right neighborhood matters as much as choosing the property.',
    ],
  },
  {
    id: 'san-jose-del-cabo', title: 'San José del Cabo', subtitle: 'Historic character, art and coastal living',
    intro: 'San José del Cabo offers a different introduction to Los Cabos: a historic center, a traditional plaza and an arts district with galleries, local work and places to eat. Beyond downtown, the coastline and marina add another side to the area. Buyers can explore a town-centered lifestyle while comparing residential settings farther from the historic streets.',
    paragraphs: [
      'A search for San José del Cabo real estate should begin with the kind of setting you prefer. Being close to galleries and restaurants is a different experience from choosing a coastal or golf-oriented community. Consider whether this will be your everyday home, a seasonal retreat or a property you intend to visit several times a year.',
      'Compare the routes to shopping, the airport and your favorite activities rather than relying on distances on a map. Ask what community fees include, which amenities are available to owners and what access actually comes with the property. The historic town, coastline and surrounding neighborhoods each deserve a visit before you decide which feels most like home.',
    ],
  },
  {
    id: 'los-cabos-corridor', title: 'Los Cabos Tourist Corridor', subtitle: 'Between Cabo San Lucas and San José del Cabo',
    intro: 'The Los Cabos Tourist Corridor connects Cabo San Lucas and San José del Cabo along the Sea of Cortez. Often called the Cabo–San José Corridor, this coastal stretch combines desert scenery, ocean views, resorts and golf. It is worth exploring if you want a residential base between the two towns rather than in either town center.',
    paragraphs: [
      'For buyers comparing Los Cabos Corridor homes and condos, the specific community makes a major difference. A property on the ocean side of the highway has a different approach and setting from one in the hills. Compare the actual entrance, driving route, beach access and the amenities included with ownership.',
      'Do not assume a nearby resort, golf course or beach club is included: ask about membership, access and additional charges. Think about which town you will visit more often and test that drive at the times you would normally travel. Ocean views and proximity to a beach do not necessarily mean a short walk to the sand. Choose the setting for the way you plan to live, not only the view from the terrace.',
    ],
  },
  {
    id: 'east-cape', title: 'East Cape', subtitle: 'Sea of Cortez scenery and room to explore',
    intro: 'The East Cape, also known as Cabo del Este, follows the Sea of Cortez beyond San José del Cabo toward Cabo Pulmo and the wider eastern coast. Beaches, fishing and outdoor exploration are central to its appeal. This is a broad region rather than a single neighborhood, and the distance from established services varies greatly between locations.',
    searchSteps: [
      'Open the MLS search, click Clear location, then select East Cape in ZONE to explore the listings grouped there.',
      'Use AREA and COMMUNITY to narrow the results, or clear the location and go directly to a known SUBDIVISION. Check the map position of each property rather than relying only on its MLS label.',
      'Compare the actual route to San José del Cabo or the nearest town, along with access to shopping and medical services. The East Cape zone is a search grouping, not a promise that every property offers the same lifestyle or convenience.',
    ],
    paragraphs: [
      'East Cape real estate attracts buyers who put a high value on the coastal setting and are willing to look beyond the two main towns. A home near an established community and a more secluded coastal property can offer very different daily routines. We cover these differences within one East Cape guide: the MLS zone name alone does not tell you how remote a property feels or how convenient everyday services will be. Decide how much driving, maintenance and planning you are comfortable with before narrowing your search.',
      'For each property, confirm road access, water supply, electricity, internet and the practical route to groceries and medical services. If you are considering land, investigate permitted uses and the cost and availability of connecting services before setting a building budget. Visit the exact location and ask about seasonal road conditions. The right fit depends on the individual property, not just an East Cape label.',
    ],
  },
  {
    id: 'pacific-south', title: 'Cabo San Lucas — Pacific Side', subtitle: 'Pedregal to Rolling Hills · Pacific living with Cabo close by',
    intro: 'From Pedregal to Rolling Hills, Cabo’s Pacific side offers an ocean-facing lifestyle with convenient access to Cabo San Lucas shopping, medical care, restaurants and everyday services. Based on our decades of experience living here, we group this stretch together because of how people use and enjoy it—not because it follows one MLS boundary. The particular neighborhood, access road and distance into town still make a difference.',
    searchSteps: [
      'Cabo’s Pacific side is spread across several MLS search categories, which can make it harder to find everything in one search. Try the three routes below separately, clicking Clear location before switching routes. Your price and other preferences stay selected.',
      'For Pedregal: ZONE → Cabo San Lucas; AREA → CSL-Beach & Marina; COMMUNITY → Pedregal CSL.',
      'For the Sunset Beach road area: ZONE → Cabo San Lucas; AREA → CSL-Centro; COMMUNITY → Saddles/Sunset Bch Rd. Use the map to focus on listings closest to the Pacific coast within this community.',
      'For the Pacific coast beyond town: ZONE → Pacific; AREA → Pacific South. This MLS area extends farther than our Cabo Pacific Side guide. Use the map to explore properties closest to Cabo, or choose a COMMUNITY to focus on a specific location.',
      'Already know the subdivision? You can choose it directly. For example, clear the location and select Rolling Hills in SUBDIVISION without choosing a zone or area first.',
    ],
    paragraphs: [
      'When comparing Pacific-side Cabo real estate, look at the particular community and the property’s position within it. Elevation, the approach road and surrounding development can change the experience substantially. Compare time spent driving into Cabo with the setting you gain at home, and visit the route rather than relying on a quoted number of minutes.',
      'Ask about water arrangements, road maintenance, community fees and access to shared facilities. For a lot, review building rules and available services before comparing prices with a completed home. An ocean view does not establish beach access or swimming conditions. This guide follows the coast from Pedregal to Rolling Hills; MLS zones, areas and communities divide it differently.',
    ],
  },
  {
    id: 'pacific-north', title: 'Pacific Coast — The Palm to Todos Santos', subtitle: 'A more rural coastal lifestyle, with small-town amenities farther north',
    intro: 'Starting at The Palm near KM 93 on Highway 19, this stretch introduces a different way of living: a more rural coastal setting, with more planning around everyday errands, continuing through the Pescadero and Cerritos area to Todos Santos and its small-town amenities. Our local experience is the basis for this grouping. It describes a lifestyle and a stretch of coast, not the MLS area called Pacific North.',
    searchSteps: [
      'This stretch of coast crosses more than one MLS search area. Try the routes below separately, clicking Clear location before switching. Your price and other preferences stay selected.',
      'For the coast south of Todos Santos: ZONE → Pacific; AREA → Pacific South; COMMUNITY → Pescadero/Cerritos, Elias Calles or Migrino Area. Choose one community at a time and use the map to check the location of each property.',
      'For Todos Santos: ZONE → Pacific; AREA → Pacific North; COMMUNITY → Todos Santos.',
      'To include Todos Santos listings entered under a different zone, click Clear location and choose Todos Santos directly in COMMUNITY, leaving ZONE and AREA at Any. Some MLS records place this community under La Paz.',
      'For the coast closer to The Palm, or a property between the named communities, explore the map or choose its SUBDIVISION directly if you know it. Check the map position of each listing; a community name alone does not establish that it falls within this guide.',
    ],
    paragraphs: [
      'Buyers exploring Todos Santos, Pescadero and Cerritos real estate may be drawn to the combination of coastal scenery, surfing and a smaller-town setting. Compare being close to the town’s restaurants and galleries with living nearer a beach or in a more rural location. The day-to-day tradeoffs can be more important than a similar asking price.',
      'Check the property’s road, water supply, power and internet individually, and consider the driving involved in your normal routine. Todos Santos and El Pescadero are in La Paz municipality; that does not mean living in La Paz city. Our guide uses The Palm as a recognizable starting landmark, not a surveyed municipal boundary. Confirm the jurisdiction and services for the particular property during your review.',
    ],
  },
  {
    id: 'la-paz', title: 'La Paz', subtitle: 'Bayfront living, the malecón and a city to call home',
    intro: 'La Paz offers another way to enjoy Baja California Sur: life around a broad bay, a waterfront malecón and an established city. The promenade is a natural gathering place for walks and time outdoors, while the Sea of Cortez adds opportunities for boating, snorkeling and exploring. For buyers, the appeal is combining a coastal setting with the routines of everyday city life.',
    paragraphs: [
      'When comparing La Paz homes and condos for sale, begin with the setting you want. Living near the malecón and downtown is different from choosing a residential neighborhood farther from the waterfront or a property around the wider bay. Consider access to shopping, medical appointments and the places you will visit regularly, along with parking, noise and how much you expect to drive.',
      'Separate a bay view from beach access when looking at listings. Popular beaches such as Balandra and El Tecolote are outings beyond the downtown waterfront, so check the actual route from each property. Visit at different times of day, review water and internet arrangements, and ask what condominium or community fees include. This guide focuses on La Paz city and its surroundings; the much larger municipality also includes places far from the city, including Todos Santos.',
    ],
    searchSteps: [
      'Open the MLS search, click Clear location, then select La Paz in ZONE.',
      'For properties in the city, choose La Paz City in AREA. Leave AREA at Any if you want to explore the wider La Paz zone, then narrow by COMMUNITY or SUBDIVISION.',
      'Check each listing on the map to confirm its position relative to the city and bay. The La Paz zone covers more than the city itself.',
    ],
  },
];

const communityWeather: Record<string, { seasons: [string, string][]; living: string; source: string; sourceName: string }> = {
  'cabo-san-lucas': {
    seasons: [
      ['Winter · December–February', 'Generally mild days and cooler evenings; bring a light layer for dinner outdoors.'],
      ['Spring · March–May', 'Mostly dry, with increasing daytime warmth. An exposed terrace can feel quite different from a sheltered street.'],
      ['Summer · June–August', 'Hotter days and warmer nights, with humidity increasing into late summer.'],
      ['Fall · September–November', 'September can remain hot and humid, with rain or tropical storms; conditions usually become more comfortable later in fall.'],
    ],
    living: 'At Land’s End, exposure matters. Compare the marina and bay setting with a Pacific-facing hillside rather than treating all of Cabo as one microclimate. Visit the outdoor spaces at the times you expect to use them.',
    source: 'https://www.visitloscabos.travel/plan/useful-information/weather/', sourceName: 'Los Cabos seasonal weather',
  },
  'san-jose-del-cabo': {
    seasons: [
      ['Winter · December–February', 'Mild afternoons and cooler nights suit time outdoors.'],
      ['Spring · March–May', 'Dry weather and rising temperatures make shade increasingly welcome.'],
      ['Summer · June–August', 'Expect heat and increasing humidity; check how well bedrooms cool overnight.'],
      ['Fall · September–November', 'Early fall retains summer heat and storm potential, followed by gradually cooler, drier weather.'],
    ],
    living: 'A downtown courtyard, an inland home and an open coastal balcony offer different exposure to sun and moving air. Compare the exact setting, not just a forecast for San José or its airport. Trees, shade and ventilation can change how comfortable a home feels.',
    source: 'https://www.visitloscabos.travel/plan/useful-information/', sourceName: 'Los Cabos climate overview',
  },
  'los-cabos-corridor': {
    seasons: [
      ['Winter · December–February', 'Mild days, with cooler evenings on open terraces.'],
      ['Spring · March–May', 'Generally dry and warming; compare sheltered patios with exposed viewpoints.'],
      ['Summer · June–August', 'Hotter and increasingly humid. Ocean views do not remove the need for shade and cooling.'],
      ['Fall · September–November', 'Summer warmth can linger through early fall, with rain and tropical-storm potential before the seasonal cooldown.'],
    ],
    living: 'The Corridor is a long coastal stretch, not one uniform climate. Hills, coves and building orientation affect wind and sun exposure. Check morning and afternoon conditions at the property; a breezy balcony and a sheltered pool area may feel different within the same development.',
    source: 'https://www.visitloscabos.travel/plan/useful-information/weather/', sourceName: 'Los Cabos seasonal weather',
  },
  'east-cape': {
    seasons: [
      ['Winter · December–February', 'Milder temperatures, but northerly winds can be a major part of coastal life. Around Los Barriles, the wind-sports season extends through March.'],
      ['Spring · March–May', 'Temperatures rise as winter gives way to summer; windy days can still affect beach and boating plans.'],
      ['Summer · June–August', 'Hot days and warm coastal water; humidity builds later in summer. Plan outdoor errands for cooler hours.'],
      ['Fall · September–November', 'Early fall can be hot and humid with storm-related rain. Later fall brings cooler conditions and the return of the winter wind pattern.'],
    ],
    living: 'The southern East Cape and the coast farther north do not share identical wind exposure. A sheltered site may feel very different from an open beach. Ask about the property’s seasonal breezes and how access roads handle heavy rain.',
    source: 'https://www.visitloscabos.travel/places-to-visit/surroundings/los-barriles/', sourceName: 'East Cape winter winds',
  },
  'pacific-south': {
    seasons: [
      ['Winter · December–February', 'Ocean-exposed properties can feel cool and breezy, especially after sunset.'],
      ['Spring · March–May', 'Pacific influence can soften the heat; a protected patio and an open hillside can feel noticeably different.'],
      ['Summer · June–August', 'Coastal airflow may provide relief, but summer still brings heat and increasing humidity.'],
      ['Fall · September–November', 'Late-summer warmth and storm-related rain can continue into early fall; evenings generally cool as winter approaches.'],
    ],
    living: 'From Pedregal to Rolling Hills, the direction a home faces and its shelter from ocean winds matter. Do not assume every Pacific-side property is equally cool. Compare wind protection, afternoon sun and comfortable outdoor seating at the individual home.',
    source: 'https://www.visitloscabos.travel/plan/useful-information/', sourceName: 'Regional climate background',
  },
  'pacific-north': {
    seasons: [
      ['Winter · December–February', 'Generally mild days with cool nights; ocean exposure can make evenings feel chilly.'],
      ['Spring · March–May', 'The Pacific moderates temperatures along this coast. Open sites may feel breezier than sheltered locations farther inland.'],
      ['Summer · June–August', 'Ocean moderation remains important, but heat and humidity still increase toward late summer.'],
      ['Fall · September–November', 'Late summer and early fall bring much of the region’s storm-related rainfall, followed by a gradual return to cooler conditions.'],
    ],
    living: 'The Palm, Migrino, Elías Calles, Pescadero, Cerritos and Todos Santos are not interchangeable microclimates. The Pacific’s moderating influence is documented around Todos Santos and El Pescadero; how much a particular home benefits depends on exposure and distance inland. Visit in more than one season if possible.',
    source: 'https://todossantos.csusystem.edu/wp-content/uploads/sites/11/2025/11/community-needs-assessment-2020-ACS.pdf', sourceName: 'Todos Santos & El Pescadero climate study (PDF)',
  },
  'la-paz': {
    seasons: [
      ['Winter · December–February', 'Generally dry, comfortable days and noticeably cooler nights. Breezy waterfront evenings may call for a jacket.'],
      ['Spring · March–May', 'Usually very dry, with daytime heat building substantially toward May.'],
      ['Summer · June–August', 'A long, very hot season with warm nights and rising humidity. Shade and effective air conditioning matter for everyday comfort.'],
      ['Fall · September–November', 'September remains hot and humid and is a wetter part of the year. Heat and humidity generally ease through October and November.'],
    ],
    living: 'La Paz city has a different seasonal feel from the Pacific coast near Todos Santos, even though both are in the same municipality. Check airflow, west-facing windows and afternoon shade at each property rather than relying on the municipality’s name.',
    source: 'https://weatherspark.com/y/2800/Average-Weather-in-La-Paz-Mexico-Year-Round', sourceName: 'La Paz seasonal climate',
  },
};

const communityActivities: Record<string, string> = {
  'cabo-san-lucas': 'The cooler months make marina walks, golf and time on a terrace easier to fit into the middle of the day. In summer, plan walks and exercise early, with shaded lunches or an indoor break during the hottest hours. For fishing and boat trips, use the day’s wind and sea forecast; sunshine on land does not guarantee calm water.',
  'san-jose-del-cabo': 'Mild winter and spring weather suits exploring the historic center, gallery visits and outdoor dining. As summer heats up, mornings and evenings become more appealing for walking, while shade and air conditioning matter during the afternoon. A covered patio can extend the hours you spend outside, and a light layer helps with cooler evening dinners in winter.',
  'los-cabos-corridor': 'Golf, beach walks and outdoor meals can fit comfortably into more of the day during the cooler season. Summer favors early tee times, shaded pool areas and a break from midday sun. Check how exposed a terrace is before planning year-round outdoor dining. For swimming or snorkeling, follow local beach flags and conditions rather than assuming a sheltered-looking bay is always safe.',
  'east-cape': 'Winter winds are a draw for kiteboarding and windsurfing around Los Barriles, but the same winds can interrupt fishing, snorkeling and small-boat outings. In hot weather, early starts make shore walks and outdoor chores more comfortable. A sheltered patio offers a useful alternative on windy days. After heavy rain, check road conditions before heading to a remote beach or property.',
  'pacific-south': 'Pacific airflow can make a shaded terrace pleasant, but an exposed outdoor dining area may need wind protection, particularly in cooler months. Plan beach walks around wind and sun, and compare how a patio feels in the morning and late afternoon. The ocean view is part of the appeal; swimming suitability is a separate question, and some Pacific beaches have dangerous surf and currents.',
  'pacific-north': 'The ocean’s moderating influence can suit outdoor meals, gardening and walks, although wind exposure changes the experience from one property to another. Cooler evenings often call for a layer. In late-summer heat and humidity, shift errands and exercise earlier. Surfing depends on the break, swell and ability; a popular surf beach is not automatically suitable for casual swimming.',
  'la-paz': 'Winter and the milder transition months favor malecón walks, cycling and outdoor dining. During the very hot summer, daily routines often work better with early errands, an afternoon break and evening waterfront time. Shade, cooling and a comfortable place to sleep become important home features. For kayaking, snorkeling and island trips, choose the day around wind, sea conditions and local operator advice.',
};

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
      <section aria-label="Cabo property buyer guide" className="border-y border-blue-200 bg-blue-50 py-6"><div className="container mx-auto px-4 max-w-6xl"><h2 className="text-xl sm:text-2xl font-bold text-blue-950">Buying in Cabo? Understand ownership, closing costs and property taxes.</h2><p className="mt-2 text-slate-700">Practical answers from Baja International Realty, with decades of local experience and real closing-cost examples.</p><nav aria-label="Buying guide topics" className="mt-4 flex flex-wrap gap-x-6 gap-y-3 font-semibold text-blue-900"><a className="underline" href="https://www.caborealestatepros.com/cabo-real-estate-buyers-guide.html#ownership" target="_blank" rel="noopener noreferrer">Can Americans or Canadians buy in Mexico?</a><a className="underline" href="https://www.caborealestatepros.com/cabo-real-estate-buyers-guide.html#costs" target="_blank" rel="noopener noreferrer">See closing-cost examples</a><a className="underline" href="https://www.caborealestatepros.com/cabo-real-estate-buyers-guide.html#annual-costs" target="_blank" rel="noopener noreferrer">Explore annual property taxes</a><a className="underline" href="https://www.caborealestatepros.com/cabo-real-estate-buyers-guide.html" target="_blank" rel="noopener noreferrer">Read the full buying guide ↗</a></nav><p className="mt-2 text-sm text-slate-600">Opens PROS in a new tab so you can keep browsing BIR.</p></div></section>
      <FloatingContact />

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
          <p className="text-slate-700 leading-relaxed">Explore <a className="text-blue-900 underline" href="#cabo-san-lucas">Cabo San Lucas</a> for marina life and everyday convenience, <a className="text-blue-900 underline" href="#san-jose-del-cabo">San José del Cabo</a> for its town center and surrounding coastal neighborhoods, and the <a className="text-blue-900 underline" href="#los-cabos-corridor">Los Cabos Corridor</a> for communities between the two towns. Our guides also explain the Pacific coast, East Cape and La Paz, including weather, access and how to find each area in the MLS.</p>
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
              <a className="inline-block mt-4 text-blue-900 underline font-semibold" href="https://www.caborealestatepros.com/fideicomiso-basics-for-foreign-ownership-los-cabos-real-property.html" target="_blank" rel="noopener noreferrer">Read about foreign ownership on Pros (opens a new tab)</a>
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
          <a className="inline-flex mt-7 items-center gap-2 text-blue-900 font-bold text-lg underline underline-offset-4" href="https://www.caborealestatepros.com/cabo-real-estate-buyers-guide.html" target="_blank" rel="noopener noreferrer">Read the full buying guide on Pros <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" /></a>
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
          <a className="inline-flex items-center gap-2 text-blue-900 font-bold text-lg underline underline-offset-4" href="https://www.caborealestatepros.com/selling-cabo-san-lucas-real-estate.html" target="_blank" rel="noopener noreferrer">Read the full selling guide on Pros <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" /></a>
          <p className="mt-2 text-sm text-muted-foreground">Opens in a new tab. You can read first and contact us whenever you’re ready.</p>
        </div>
      </section>

      <section id="cabo-communities" className="scroll-mt-24 py-14 sm:py-20 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
            <p className="text-blue-900 font-semibold mb-2">Explore Our Communities</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Explore communities in Los Cabos, La Paz and beyond</h2>
            <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">Where should you buy in Baja California Sur? Start with the way you want to live. Explore these seven areas, from Cabo San Lucas and San José del Cabo to the Tourist Corridor, East Cape, Pacific coast and La Paz. Each guide introduces the setting and the practical details worth comparing before choosing a home, condo or lot.</p>
            <p className="mt-5 rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-950 leading-relaxed">Based on our decades of experience living here, these guides group places by lifestyle and location. Names in the MLS search filters may differ. The two Pacific guides below include tips to help you find the right properties.</p>
            <div className="grid md:grid-cols-2 gap-5 my-8 items-start">
              {communityGuides.map(community => (
                <article key={community.id} id={community.id} className="scroll-mt-24 rounded-xl border border-blue-200 p-6 sm:p-7">
                  <h3 className="text-2xl font-bold text-blue-950 mb-2">{community.title}</h3>
                  <p className="text-blue-900 font-semibold mb-4">{community.subtitle}</p>
                  <p className="text-slate-700 leading-relaxed">{community.intro}</p>
                  <details className="mt-4 group">
                    <summary className="cursor-pointer text-blue-900 font-bold underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-900"><span className="group-open:hidden">Read more about {community.title}</span><span className="hidden group-open:inline">Show less about {community.title}</span></summary>
                    {community.paragraphs.map(paragraph => <p key={paragraph} className="mt-4 text-slate-700 leading-relaxed">{paragraph}</p>)}
                    <section aria-label={`Weather and seasons in ${community.title}`} className="mt-6 rounded-lg border border-amber-200 bg-amber-50/60 p-4 sm:p-5">
                      <h4 className="text-xl font-bold text-slate-900">Weather &amp; seasons</h4>
                      <dl className="mt-4 space-y-4">
                        {communityWeather[community.id].seasons.map(([season, description]) => <div key={season}><dt className="font-bold text-slate-900">{season}</dt><dd className="mt-1 text-slate-700 leading-relaxed">{description}</dd></div>)}
                      </dl>
                      <p className="mt-4 text-slate-700 leading-relaxed"><strong>Lifestyle &amp; activities:</strong> {communityActivities[community.id]}</p>
                      <p className="mt-4 text-slate-700 leading-relaxed"><strong>What this means for living here:</strong> {communityWeather[community.id].living}</p>
                      <p className="mt-4 text-sm text-slate-600 leading-relaxed">Typical seasonal patterns, not a forecast. Neighborhood exposure, elevation and the individual home can change how the weather feels. <a href={communityWeather[community.id].source} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{communityWeather[community.id].sourceName} (opens a new tab)</a>.</p>
                    </section>
                    {community.searchSteps && <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 p-4 sm:p-5">
                      <h4 className="text-lg font-bold text-blue-950">How to search for properties in this area</h4>
                      <ol className="mt-3 list-decimal pl-5 space-y-3 text-slate-700 leading-relaxed">{community.searchSteps.map(step => <li key={step}>{step}</li>)}</ol>
                      <a href="/property-search.html" className="inline-block mt-4 font-bold text-blue-900 underline underline-offset-4">Open Cabo MLS search</a>
                    </div>}
                  </details>
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
