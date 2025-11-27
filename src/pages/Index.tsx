import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
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

const Index = () => {
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch live properties on mount
  useEffect(() => {
    const loadFeaturedProperties = async () => {
      setLoading(true);
      try {
        console.log('📡 Loading featured properties from API...');
        
        // Fetch properties with no filters to get latest listings
        const mlsProperties: MLSProperty[] = await fetchListings({ limit: 50 });
        console.log('✅ Received properties:', mlsProperties.length);
        
        // Convert to PropertyCard format
        const convertedProperties = mlsProperties.map(convertMLSToPropertyCard);
        
        // Shuffle and take first 3
        const shuffled = [...convertedProperties].sort(() => Math.random() - 0.5);
        const featured = shuffled.slice(0, 3);
        
        setFeaturedProperties(featured);
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
      <Navbar />
      <Hero />
      <FloatingContact />

      {/* Featured Properties */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-accent uppercase tracking-wider mb-2 font-medium">
              Handpicked Selection
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Featured Properties
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our curated collection of the finest luxury oceanfront properties available
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-accent mb-4" />
              <p className="text-muted-foreground">Loading featured properties...</p>
            </div>
          ) : featuredProperties.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground mb-4">No properties available at the moment.</p>
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
              <Link to={`/team/${member.id}`} key={member.id}>
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
              <Link to="/new-client">
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
