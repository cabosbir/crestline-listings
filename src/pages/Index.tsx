import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import PropertyCard from "@/components/PropertyCard";
import StatsSection from "@/components/StatsSection";
import AgentBioCard from "@/components/AgentBioCard";
import WhyWorkWithUs from "@/components/WhyWorkWithUs";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { fetchListings, convertMLSToPropertyCard, type MLSProperty } from "@/services/flexMlsService";

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
    paragraphs: [
      'East Cape real estate attracts buyers who put a high value on the coastal setting and are willing to look beyond the two main towns. A home near an established community and a more secluded coastal property can offer very different daily routines. Decide how much driving, maintenance and planning you are comfortable with before narrowing your search.',
      'For each property, confirm road access, water supply, electricity, internet and the practical route to groceries and medical services. If you are considering land, investigate permitted uses and the cost and availability of connecting services before setting a building budget. Visit the exact location and ask about seasonal road conditions. The right fit depends on the individual property, not just an East Cape label.',
    ],
  },
  {
    id: 'pacific-south', title: 'Cabo San Lucas — Pacific Side', subtitle: 'Pedregal to Rolling Hills · Pacific living with Cabo close by',
    intro: 'From Pedregal to Rolling Hills, Cabo’s Pacific side offers an ocean-facing lifestyle with convenient access to Cabo San Lucas shopping, medical care, restaurants and everyday services. Based on our decades of experience living here, we group this stretch together because of how people use and enjoy it—not because it follows one MLS boundary. The particular neighborhood, access road and distance into town still make a difference.',
    searchSteps: [
      'Open the MLS search and click Clear location so earlier choices do not hide the places you want. Your price and other preferences stay selected.',
      'For Pedregal, choose Pedregal CSL in Community. For Rolling Hills, choose Rolling Hills directly in Subdivision; you do not need to select a zone or area first.',
      'Explore other neighborhoods between those landmarks on the map, or choose a known community or subdivision by name. Clear location before switching to another part of the coast. One MLS area will not necessarily cover this whole guide.',
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
      'Open the MLS search and click Clear location. Leave Zone and Area at Any to begin, rather than choosing Pacific North because this guide travels north.',
      'Choose Pescadero/Cerritos in Community for that part of the coast, or Todos Santos for the town’s MLS community. Search them separately, clearing the location when you change communities.',
      'For the coast closer to The Palm, or a property between the named communities, explore the map or choose its subdivision directly if you know it. Check the map position of each listing; a community name alone does not establish that it falls within this guide.',
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
      'Open the MLS search, click Clear location, then select La Paz in Zone.',
      'For properties in the city, choose La Paz City in Area. Leave Area at Any if you want to explore the wider La Paz zone, then narrow by Community or Subdivision.',
      'Check each listing on the map to confirm its position relative to the city and bay. The La Paz zone covers more than the city itself.',
    ],
  },
];

const Index = () => {
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const canonicalUrl = 'https://www.bircabo.com/';

  // Fetch live properties on mount - OPTIMIZED with caching
  useEffect(() => {
    const loadFeaturedProperties = async () => {
      setLoading(true);
      try {
        // ⭐ CACHE IMPLEMENTATION - Check cache first for faster loading
        const cacheKey = 'homepage-featured-v2';
        const cacheTimeKey = `${cacheKey}-time`;
        const cached = localStorage.getItem(cacheKey);
        const cachedTime = localStorage.getItem(cacheTimeKey);
        
        const now = Date.now();
        const cacheLifetime = 2 * 60 * 1000; // Recheck current featured listings after two minutes.
        
        if (cached && cachedTime && (now - parseInt(cachedTime)) < cacheLifetime) {
          console.log('✅ Using cached featured properties');
          const cachedData = JSON.parse(cached);
          setFeaturedProperties(cachedData);
          setLoading(false);
          return;
        }
        
        console.log('📡 Loading featured properties from API...');
        
        // Fetch properties with no filters to get latest listings
        // OPTIMIZED: Reduced from 50 to 15 for faster loading (only need 3)
        const mlsProperties: MLSProperty[] = await fetchListings({ limit: 15 });
        console.log('✅ Received properties:', mlsProperties.length);
        
        // Convert to PropertyCard format
        const convertedProperties = mlsProperties.map(convertMLSToPropertyCard);
        
        // Shuffle and take first 3
        const shuffled = [...convertedProperties].sort(() => Math.random() - 0.5);
        const featured = shuffled.slice(0, 3);
        
        setFeaturedProperties(featured);
        
        // ⭐ Cache the results
        try {
          localStorage.setItem(cacheKey, JSON.stringify(featured));
          localStorage.setItem(cacheTimeKey, now.toString());
          console.log('💾 Cached featured properties');
        } catch (e) {
          console.error('Error caching featured properties:', e);
        }
      } catch (error) {
        console.error('❌ Error loading featured properties:', error);
        // Set empty array on error
        setFeaturedProperties([]);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedProperties();
  }, []);

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
        <title>Cabo Real Estate | MLS Search, Buying & Selling | Baja International Realty</title>
        <meta 
          name="description" 
          content="Explore Cabo San Lucas and Los Cabos real estate. Search public MLS listings without signup, save favorites, compare properties, and get local help when ready." 
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content="Cabo Real Estate | Search Freely, Buy & Sell With Local Help" />
        <meta property="og:description" content="Search Cabo MLS listings without signup. Understand buying, selling and foreign ownership, then explore Los Cabos communities at your own pace." />
        <meta property="og:type" content="website" />
      </Helmet>
      <Navbar />
      <Hero />
      <FloatingContact />

      <section id="buying-in-cabo" className="scroll-mt-24 py-14 sm:py-20 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <p className="text-blue-900 font-semibold mb-2">Understanding Buying</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">How do I buy property in Cabo San Lucas?</h2>
          <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">Start with how you want to use your property, the location and your total budget. Explore listings, compare your favorites and take time to understand ownership and the costs before making an offer.</p>
          <ol className="grid sm:grid-cols-3 gap-5 my-8 list-none">
            {[
              ['1. Find the right fit', 'Compare homes, condos or land. Look beyond the photos at access, community rules, upkeep and everyday convenience.'],
              ['2. Check before you commit', 'Review the title, property documents, condition and offer terms with your agent and qualified closing professionals.'],
              ['3. Plan your closing', 'Confirm the ownership structure, written closing-cost estimate, payment arrangements and the steps needed to complete and register the purchase.'],
            ].map(([title, body]) => <li key={title} className="rounded-xl border border-border p-6"><h3 className="text-xl font-bold mb-3">{title}</h3><p className="text-muted-foreground leading-relaxed">{body}</p></li>)}
          </ol>
          <div className="space-y-3">
            <details open className="rounded-xl border border-blue-200 bg-blue-50 p-5 sm:p-6">
              <summary className="cursor-pointer text-xl font-bold text-blue-950">Can Americans or Canadians buy property in Mexico?</summary>
              <p className="mt-4 leading-relaxed text-slate-700">Yes. Foreign buyers can purchase residential property in Cabo through a Mexican bank trust called a fideicomiso. Because Cabo is in Mexico’s coastal restricted zone, this differs from holding direct title: the bank acts as trustee and the buyer is the beneficiary. Confirm the appropriate arrangement for the specific property before buying.</p>
              <a className="inline-block mt-4 text-blue-900 underline font-semibold" href="https://www.caborealestatepros.com/fideicomiso-basics-for-foreign-ownership-los-cabos-real-property.html" target="_blank" rel="noopener noreferrer">Read about foreign ownership on Pros (opens a new tab)</a>
            </details>
            <details className="rounded-xl border border-border p-5 sm:p-6">
              <summary className="cursor-pointer text-xl font-bold">What are the closing costs when buying property in Cabo?</summary>
              <p className="mt-4 text-muted-foreground leading-relaxed">The purchase price is only part of your budget. Ask for a written estimate covering applicable acquisition taxes, notary and registration charges, trust costs and any other transaction fees. The total depends on the property and the purchase structure; a single percentage will not fit every purchase.</p>
            </details>
            <details className="rounded-xl border border-border p-5 sm:p-6">
              <summary className="cursor-pointer text-xl font-bold">Can I rent out my condo in Cabo?</summary>
              <p className="mt-4 text-muted-foreground leading-relaxed">Check before you buy. Review the condominium’s rental rules, any applicable local requirements and your tax obligations. Include management, maintenance, utilities and vacancy in your budget instead of assuming rental income will cover everything.</p>
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
            <div className="bg-white border border-border rounded-xl p-6"><h3 className="text-xl font-bold mb-3">What costs should I plan for when selling?</h3><p className="text-muted-foreground leading-relaxed">Request an estimate of your net proceeds that accounts for agreed selling fees, applicable taxes and closing expenses. Have your notary or tax adviser review your circumstances and supporting documents before relying on a final figure.</p></div>
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
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-accent uppercase tracking-wider mb-2 font-medium">
              Explore the Market
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Featured Properties
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A selection of MLS listings across Baja California Sur. Use our Cabo MLS search to find the location and property that suit you.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-accent mb-4" />
              <p className="text-muted-foreground">Loading featured properties...</p>
            </div>
          ) : featuredProperties.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground mb-4">Featured properties could not be loaded. You can still open the full MLS search.</p>
              <Link to="/search">
                <Button variant="outline">View All Properties</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {featuredProperties.map((property) => (
                  <PropertyCard key={property.id} {...property} />
                ))}
              </div>

              <div className="text-center">
                <Link to="/search">
                  <Button variant="luxury" size="lg">
                    View All Properties <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Stats Section */}
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
