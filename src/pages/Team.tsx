import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import AgentBioCard from "@/components/AgentBioCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Team = () => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const agents = [
    {
      id: 1,
      name: "Bob Van Patten",
      title: "Senior Real Estate Advisor",
      specialization: "High Yield Investment Properties",
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761524592/work-photo-2025-10-27-1761524048537_jnodyu.png",
      phone: "+52 624 127 6012",
      email: "robertvanpatten2@gmail.com",
      yearsExperience: 9,
      propertiesSold: 85,
      bio: "Bob specializes in high yield investment properties with 9 years of experience in Mexico, having sold 85 properties with total sales of $35 million.",
      certifications: ["MLS Member"],
      languages: ["English"]
    },
    {
      id: 2,
      name: "Erika Aispuro",
      title: "Luxury Property Specialist",
      specialization: "Oceanfront Estates",
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761528481/a-captivating-portrait-photograph-of-a-w_0i-UNv-eRnmu4VfpJsjInw_16HhuJljQfipqcXBRpW7Yw_mu9rbs.jpg",
      phone: "+52 624 109 7909",
      email: "Erika80@gmail.com",
      yearsExperience: 12,
      propertiesSold: 180,
      bio: "Erika's passion for luxury coastal living in Cabo San Lucas and her commitment to client satisfaction have made her one of the most sought-after agents.",
      certifications: ["REALTOR®", "GRI", "ABR"],
      languages: ["English", "Spanish"]
    },
    {
      id: 3,
      name: "Alfonso Puente",
      title: "Sales Manager & Commercial Real Estate Expert",
      specialization: "Real Estate Developments & Market Analysis",
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761580623/WhatsApp_Image_2025-10-27_at_8.55.37_AM_uytmga.jpg",
      phone: "+52 624 188 8681",
      email: "alfonso@bircabo.com",
      yearsExperience: 18,
      propertiesSold: 205,
      bio: "Alfonso is a sales manager with a strong track record of leading large commercial teams and achieving high closing rates. He specializes in real estate developments in progress and market analysis to help clients achieve expected success through strategic execution and results-oriented leadership.",
      certifications: ["REALTOR®", "CCIM", "CPM"],
      languages: ["English", "Spanish"]
    },
    {
      id: 4,
      name: "Cozbi Sanchez",
      title: "Residential Specialist",
      specialization: "Family Homes & Condos",
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761612891/WhatsApp_Image_2025-10-27_at_5.53.29_PM_dz7y0g.jpg",
      phone: "+52 624 118 9512",
      email: "Cozbi@bajainternationalrealty.com",
      yearsExperience: 8,
      propertiesSold: 105,
      bio: "Cozbi brings enthusiasm and dedication to every transaction in Cabo San Lucas. Specializing in family homes and condominiums.",
      certifications: ["REALTOR®", "ABR", "SRS"],
      languages: ["English", "Spanish"]
    },
    {
      id: 5,
      name: "Hector Mendoza",
      title: "Investment Property Advisor",
      specialization: "Investment & Portfolio",
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761582971/a-meticulously-crafted-portrait-photogra_mYQPdq9WQSWo-pvakiW_Yw_xsfP9GCST6CP-VnQtn3QSA_sybk55.jpg",
      phone: "+52 624 211 4879",
      email: "Hector@bajainternationalrealty.com",
      yearsExperience: 20,
      propertiesSold: 110,
      bio: "Hector is a seasoned investor and advisor with two decades of experience helping clients build successful real estate portfolios.",
      certifications: ["REALTOR®", "CCIM", "CRS"],
      languages: ["English", "Spanish"]
    },
    {
      id: 6,
      name: "Cristy Cavazos",
      title: "Luxury Condo Specialist",
      specialization: "High-Rise & Penthouses",
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761588682/a-soft-natural-light-portrait-photograph_2oZCo8O8TSWRNzgLxLaLew_-RP-wvPgSnKeu7bWvJ_y8A_bknfmc.jpg",
      phone: "+52 624 178 0825",
      email: "Cristina.cavazos@grupoveq.com",
      yearsExperience: 10,
      propertiesSold: 240,
      bio: "Cristy's expertise in luxury high-rise condominiums and penthouses in Cabo San Lucas consistently delivers outstanding results.",
      certifications: ["REALTOR®", "CLHMS", "GRI"],
      languages: ["English", "Spanish"]
    },
    {
      id: 7,
      name: "Marisol Tort",
      title: "Real Estate Advisor",
      specialization: "Luxury Properties",
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761668403/WhatsApp_Image_2025-10-27_at_9.24.29_PM_uajiar.jpg",
      phone: "+52 624 264 3896",
      email: "mtortricardi@gmail.com",
      yearsExperience: 10,
      propertiesSold: 150,
      bio: "As a trusted real estate advisor in Cabo San Lucas, Marisol specializes in identifying profitable investment and luxury property opportunities. Her data-driven approach and sharp negotiation skills give clients an edge in one of Mexico’s most desirable markets. Investors turn to Marisol for guidance, confidence, and results that make every deal count.",
      certifications: ["REALTOR®"],
      languages: ["English", "Spanish"]
    },
    {
      id: 8,
      name: "David Scott Piper",
      title: "Real Estate Advisor",
      specialization: "Luxury Properties",
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761614075/WhatsApp_Image_2025-10-27_at_6.09.43_PM_neaig7.jpg",
      phone: "+52 624 317 0297",
      email: "David@bajainternationalrealty.com",
      yearsExperience: 10,
      propertiesSold: 105,
      bio: "David is a seasoned investor and advisor with a decade of experience helping clients build successful real estate portfolios.",
      certifications: ["REALTOR®"],
      languages: ["English", "Spanish"]
    },
    {
      id: 9,
      name: "Zuzu Vieira",
      title: "Real Estate Advisor",
      specialization: "Luxury Properties",
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761593547/a-professional-studio-portrait-of-a-dist_3jguKwSiQZKYvX4c2UJkHg_UK7-M6V_Seq1iMZi4MEd-A_ubffdu.jpg",
      phone: "+1 808 226 6120",
      email: "Zuzu@bajainternationalrealty.com",
      yearsExperience: 10,
      propertiesSold: 150,
      bio: "Agent bio to be added...",
      certifications: ["REALTOR®"],
      languages: ["English", "Spanish"]
    },
    {
      id: 10,
      name: "Edgar Pacheco",
      title: "Real Estate & IT Advisor",
      specialization: "Luxury Properties",
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761598127/a-professional-studio-portrait-photograp_dnE69CqgQwKMvDj_boYW5A_sWO9IE8FSuKtnjTWshya2g_lvnjuh.jpg",
      phone: "+52 612 169 8328",
      email: "Edgar@bajainternationalrealty.com",
      yearsExperience: 2,
      propertiesSold: 15,
      bio: "Looking to invest in Cabo San Lucas? Edgar is your insider advantage. With a unique blend of analytical precision and real estate expertise developed under industry veteran Bob Van Patten, he transforms complex market data into clear investment opportunities. Edgar has pioneered innovative digital platforms that give his clients unprecedented transparency into property values, market trends, and investment potential across Cabo and Baja California Sur. His approach is simple: arm you with the knowledge, insights, and local connections you need to invest confidently in paradise.",
      certifications: ["REALTOR®"],
      languages: ["English", "Spanish"]
    },
    {
      id: 11,
      name: "Agent 11 Name",
      title: "Real Estate Advisor",
      specialization: "Luxury Properties",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1200&fit=crop&crop=faces",
      phone: "+52 612 169 8328",
      email: "agent11@bajainternationalrealty.com",
      yearsExperience: 10,
      propertiesSold: 150,
      bio: "Agent bio to be added...",
      certifications: ["REALTOR®"],
      languages: ["English", "Spanish"]
    },
    {
      id: 12,
      name: "Don Weis",
      title: "Real Estate Broker",
      specialization: "Luxury Properties",
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761604421/a-professional-portrait-photograph-of-a-_c8sIFPSGQYO0TQlApBAfFQ__16y8I8XSnO06Y6Tixti-Q_o4nhst.jpg",
      phone: "+52 624 129 6245",
      email: "DonWeis@bajainternationalrealty.com",
      yearsExperience: 30,
      propertiesSold: 300,
      bio: "Agent bio to be added...",
      certifications: ["REALTOR®"],
      languages: ["English", "Spanish"]
    },
    {
      id: 13,
      name: "Agent 13 Name",
      title: "Real Estate Advisor",
      specialization: "Luxury Properties",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1200&fit=crop&crop=faces",
      phone: "+52 624 XXX XXXX",
      email: "agent13@bajainternationalrealty.com",
      yearsExperience: 10,
      propertiesSold: 150,
      bio: "Agent bio to be added...",
      certifications: ["REALTOR®"],
      languages: ["English", "Spanish"]
    },
    {
      id: 14,
      name: "Agent 14 Name",
      title: "Real Estate Advisor",
      specialization: "Luxury Properties",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=1200&fit=crop&crop=faces",
      phone: "+52 624 XXX XXXX",
      email: "agent14@bajainternationalrealty.com",
      yearsExperience: 10,
      propertiesSold: 150,
      bio: "Agent bio to be added...",
      certifications: ["REALTOR®"],
      languages: ["English", "Spanish"]
    },
  ];

  const handleViewBio = (agentId: number) => {
    console.log('handleViewBio called with agentId:', agentId);
    const agent = agents.find(a => a.id === agentId);
    console.log('Found agent:', agent?.name);
    
    try {
      navigate(`/team/${agentId}`);
      console.log('Navigation triggered to:', `/team/${agentId}`);
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = `/team/${agentId}`;
    }
  };

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const newScrollLeft = direction === 'left' 
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
      
      setTimeout(checkScrollButtons, 300);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <FloatingContact />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-primary via-primary-dark to-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            Meet Our Team
          </h1>
          <p className="text-xl max-w-3xl mx-auto text-primary-foreground/90">
            Our experienced team of real estate professionals is dedicated to helping you find your dream property in Cabo San Lucas. 
            With decades of combined experience, we provide unparalleled expertise in Baja California Sur luxury real estate.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-secondary border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-accent mb-2">85</div>
              <div className="text-sm text-muted-foreground">Years Combined<br />Experience</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-accent mb-2">2,200+</div>
              <div className="text-sm text-muted-foreground">Properties<br />Sold</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-accent mb-2">100%</div>
              <div className="text-sm text-muted-foreground">Committed to<br />Our Clients</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-accent mb-2">$800M+</div>
              <div className="text-sm text-muted-foreground">Combined Sales<br />Since 2014</div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Carousel */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-4">Our Expert Advisors</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-2">
                Each member of our team brings unique expertise and a commitment to exceptional service in Cabo San Lucas
              </p>
              <p className="text-sm text-muted-foreground">
                {agents.length} expert agents ready to assist you
              </p>
            </div>

            {/* Horizontal Scroll Container */}
            <div className="relative">
              {/* Left Arrow */}
              <Button
                variant="outline"
                size="lg"
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-16 w-16 rounded-full shadow-xl bg-white hover:bg-gray-50 disabled:opacity-30"
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>

              {/* Scrollable Agent Cards */}
              <div 
                ref={scrollContainerRef}
                onScroll={checkScrollButtons}
                className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth px-16"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {agents.map((agent) => (
                  <div key={agent.id} className="flex-shrink-0 w-[320px]">
                    <AgentBioCard
                      name={agent.name}
                      title={agent.title}
                      image={agent.image}
                      phone={agent.phone}
                      email={agent.email}
                      specialization={agent.specialization}
                      propertiesSold={agent.propertiesSold}
                      yearsExperience={agent.yearsExperience}
                      onViewBio={() => handleViewBio(agent.id)}
                      showStats={false}
                    />
                  </div>
                ))}
              </div>

              {/* Right Arrow */}
              <Button
                variant="outline"
                size="lg"
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-16 w-16 rounded-full shadow-xl bg-white hover:bg-gray-50 disabled:opacity-30"
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </div>

            {/* Scroll Hint */}
            <div className="text-center mt-8 text-sm text-muted-foreground">
              <p>← Scroll to explore all our team members →</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-gradient-to-br from-accent via-accent-dark to-accent text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Work With Us?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Let us help you find your dream property in Cabo San Lucas or sell your current home for the best possible price.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="hero" 
              size="lg"
              onClick={() => window.location.href = '/contact'}
            >
              Contact Our Team
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="bg-white/10 hover:bg-white/20 border-white text-white"
              onClick={() => window.location.href = '/properties'}
            >
              View Properties
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Team;