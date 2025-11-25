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
import { ArrowRight } from "lucide-react";

const Index = () => {
  // Shuffle function with localStorage cache (refreshes every 3 hours)
  // Shuffle function with localStorage cache (refreshes every 3 hours)
  const getShuffledListings = (listings: any[], cacheKey: string) => {
    const cacheTimeKey = `${cacheKey}-time`;
    
    // Check if we're in browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return [...listings].sort(() => Math.random() - 0.5);
    }
    
    try {
      const cached = localStorage.getItem(cacheKey);
      const cachedTime = localStorage.getItem(cacheTimeKey);
      
      const now = Date.now();
      const threeHours = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
      
      // Check if cache is still valid
      if (cached && cachedTime && (now - parseInt(cachedTime)) < threeHours) {
        return JSON.parse(cached);
      }
      
      // Create new shuffle
      const shuffled = [...listings].sort(() => Math.random() - 0.5);
      
      // Save to localStorage
      localStorage.setItem(cacheKey, JSON.stringify(shuffled));
      localStorage.setItem(cacheTimeKey, now.toString());
      
      return shuffled;
    } catch (e) {
      console.error('Error with localStorage:', e);
      // Fallback to simple shuffle
      return [...listings].sort(() => Math.random() - 0.5);
    }
  };

  const originalFeaturedProperties = [
    {
      id: 1,
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761942726/20241014235115115464000000-o_hgb1vh.jpg",
      price: "$6,950,000",
      title: "Hacienda Beach Club",
      location: "Cabo San Lucas",
      beds: 4,
      baths: 4,
      sqft: "Private pool & OWNER FINANCING",
      mlsNumber: "24-4467",
      link: "https://www.flexmls.com/share/D0rH7/Hacienda-Beach-Club-private-pool-OWNER-FINANCING-1-100-Cabo-San-Lucas-",
    },
    {
      id: 2,
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761942441/20250321204529858183000000-o_ganlni.jpg",
      price: "$499,000",
      title: "La Vista LARGE PRIVATE YARD B101",
      location: "Cabo San Lucas",
      beds: 3,
      baths: 3,
      totalM2: "372.06",
      mlsNumber: "25-1679",
      link: "https://www.flexmls.com/share/D0rHM/La-Vista-LARGE-PRIVATE-YARD-B101-Cabo-Corridor-",
    },
    {
      id: 3,
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761942708/20240426201812151546000000-o_zoqijd.jpg",
      price: "$3,795,800",
      title: "Casa Ducci Camino del Mar",
      location: "Cabo San Lucas",
      beds: 4,
      baths: 4.5,
      totalM2: "350.23",
      mlsNumber: "24-1981",
      link: "https://www.flexmls.com/share/D0rFY/Casa-Ducci-Camino-del-Mar-Cabo-San-Lucas-",
    },
  ];

  // State for shuffled properties
  const [featuredProperties, setFeaturedProperties] = useState(originalFeaturedProperties);

  // Shuffle on mount
  useEffect(() => {
    const shuffled = getShuffledListings(originalFeaturedProperties, 'featured-properties-shuffle');
    setFeaturedProperties(shuffled);
  }, []);

  // Team members - Updated with slugs for landing page routing
  const teamMembers = [
    {
      id: 12,
      slug: "don",
      name: "Don Weis",
      title: "Founder & Broker",
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761932929/WhatsApp_Image_2025-10-30_at_10.26.08_AM_cvcznx.jpg",
    },
    {
      id: 1,
      slug: "bob",
      name: "Bob Van Patten",
      title: "Senior Real Estate Advisor",
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761524592/work-photo-2025-10-27-1761524048537_jnodyu.png",
    },
    {
      id: 3,
      slug: "alfonso",
      name: "Alfonso Puente",
      title: "Sales Manager & Commercial Real Estate Expert",
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761580623/WhatsApp_Image_2025-10-27_at_8.55.37_AM_uytmga.jpg",
    },
    {
      id: 8,
      slug: "david",
      name: "David Scott Piper",
      title: "Real Estate Advisor",
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761614075/WhatsApp_Image_2025-10-27_at_6.09.43_PM_neaig7.jpg",
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>

          <div className="text-center">
            <Link to="/properties">
              <Button variant="luxury" size="lg">
                View All Properties <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
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