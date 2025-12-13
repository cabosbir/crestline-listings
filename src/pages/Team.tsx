import { useState, useEffect, useRef, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import AgentBioCard from "@/components/AgentBioCard";
import { Button } from "@/components/ui/button";

// ⚡ OPTIMIZATION 1: Move static data outside component to prevent re-creation
const statsData = [
  { number: 75, label: "Years Combined\nExperience", suffix: "" },
  { number: 1850, label: "Properties\nSold", suffix: "+" },
  { number: 100, label: "Committed to\nOur Clients", suffix: "%" },
  { number: 800, label: "Combined Sales\nSince 1987", suffix: "M+", prefix: "$" },
];

const agents = [
  {
    id: 12,
    slug: "don",
    name: "Don Weis",
    title: "Founder & Broker",
    specialization: "Luxury Properties & Development",
    image: "/don-weis.jpg",
    phone: "+52 624 143 5555",
    email: "Don@bircabo.com",
    yearsExperience: 35,
    propertiesSold: 2200,
    bio: "Don Weis is the visionary founder and broker of Baja International Realty, pioneering luxury real estate in Cabo San Lucas since the late 1980s...",
    certifications: [
      "Real Estate Broker",
      "International Realtor®",
      "MLS-BCS Founding Member",
      "AMPI® Member"
    ],
    languages: ["English", "Spanish"]
  },
  {
    id: 1,
    slug: "bob",
    name: "Bob Van Patten",
    title: "Senior Real Estate Advisor",
    specialization: "High Yield Investment Properties",
    image: "/bob-van-patten.jpg",
    phone: "+52 624 127 6012",
    email: "robertvanpatten2@gmail.com",
    yearsExperience: 9,
    propertiesSold: 85,
    bio: "With nine years of real estate experience in Mexico, I specialize in high-yield investment properties and have successfully sold over 85 properties, totaling more than $35 million in sales.",
    certifications: ["MLS Member"],
    languages: ["English"]
  },
  {
    id: 3,
    slug: "alfonso",
    name: "Alfonso Puente",
    title: "Sales Manager & Commercial Real Estate Expert",
    specialization: "Real Estate Developments & Market Analysis",
    image: "/alfonso-puente.jpg",
    phone: "+52 664 188 8681",
    email: "alfonso@bircabo.com",
    yearsExperience: 18,
    propertiesSold: 890,
    bio: "Alfonso is a sales manager with a proven track record of leading high-performing commercial teams and achieving exceptional closing rates.",
    certifications: ["REALTOR®", "CCIM", "CPM", "MLS Member"],
    languages: ["English", "Spanish"]
  },
  {
    id: 8,
    slug: "david",
    name: "David Scott Piper",
    title: "Real Estate Advisor",
    specialization: "Luxury Properties",
    image: "/david-scott-piper.jpg",
    phone: "+52 624 317 0297",
    email: "David@bircabo.com",
    yearsExperience: 10,
    propertiesSold: 50,
    bio: "David is a seasoned investor and advisor with a decade of experience helping clients build successful real estate portfolios.",
    certifications: ["REALTOR®", "MLS Member"],
    languages: ["English", "Spanish"]
  },
  {
    id: 2,
    slug: "erika",
    name: "Erika Aispuro",
    title: "Luxury Property Specialist",
    specialization: "Oceanfront Estates",
    image: "/erika-aispuro.jpg",
    phone: "+52 624 109 7909",
    email: "eaispuro80@gmail.com",
    yearsExperience: 8,
    propertiesSold: 60,
    bio: "My passion for luxury coastal living in Cabo San Lucas has made me one of the most sought-after agents in the region.",
    certifications: ["REALTOR®", "GRI", "ABR", "MLS Member"],
    languages: ["English", "Spanish"]
  },
  {
    id: 5,
    slug: "hector",
    name: "Hector Mendoza",
    title: "Investment Property Advisor",
    specialization: "Investment & Portfolio",
    image: "/hector-mendoza.jpg",
    phone: "+52 624 211 4879",
    email: "Hector@bircabo.com",
    yearsExperience: 2,
    propertiesSold: 12,
    bio: "Real estate in Mexico should feel exciting, not overwhelming. I take pride in making every transaction simple, personal, and rewarding.",
    certifications: ["REALTOR®", "CCIM", "CRS", "MLS Member"],
    languages: ["English", "Spanish"]
  },
  {
    id: 9,
    slug: "susu",
    name: "Susu Vieira",
    title: "Luxury Real Estate",
    specialization: "Staging and Design",
    image: "/susu-vieira.jpg",
    phone: "+1 (808) 226 6120",
    phoneSecondary: "+52 (612) 120 5289",
    email: "Susu@bircabo.com",
    yearsExperience: 11,
    propertiesSold: 101,
    bio: "With decades of experience in Real Estate, Susu brings unmatched expertise and dedication to every client relationship.",
    certifications: ["REALTOR®", "MLS Member"],
    languages: ["English", "Spanish"]
  },
  {
    id: 14,
    slug: "erika-graciano",
    name: "Erika Graciano",
    title: "Real Estate Agent & Administrative Specialist",
    specialization: "Client Relations & Property Management",
    image: "/ErikaGraciano.jpg",
    phone: "+52 624 157 2154",
    email: "erikag@bircabo.com",
    yearsExperience: 15,
    propertiesSold: 150,
    bio: "Professional with extensive experience in administrative tasks and organizational skills. With solid knowledge of document management and customer service, Erika brings a unique perspective to real estate in Cabo San Lucas. Her background in administrative management and HR positions her perfectly to guide clients through the complex process of buying or selling property in Los Cabos.",
    certifications: ["Real Estate Agent", "AMPI® Member", "Administrative Management Specialist"],
    languages: ["Spanish", "English"]
  },
  {
    id: 7,
    slug: "marisol",
    name: "Marisol Tort",
    title: "Real Estate Advisor",
    specialization: "Luxury Properties",
    image: "/marisol-tort.jpg",
    phone: "+52 624 264 3896",
    email: "mtortricardi@gmail.com",
    yearsExperience: 12,
    propertiesSold: 50,
    bio: "As a trusted real estate advisor in Cabo San Lucas, Marisol specializes in identifying profitable investment opportunities.",
    certifications: ["REALTOR®", "MLS Member"],
    languages: ["English", "Spanish"]
  },
  {
    id: 4,
    slug: "cozbi",
    name: "Cozbi Sanchez",
    title: "Residential Specialist",
    specialization: "Family Homes & Condos",
    image: "/cozbi-sanchez.png",
    phone: "+52 624 118 9512",
    email: "Cozbi@bajainternationalrealty.com",
    yearsExperience: 8,
    propertiesSold: 105,
    bio: "I bring dedication and genuine care to every real estate transaction in Cabo San Lucas.",
    certifications: ["REALTOR®", "ABR", "SRS", "MLS Member"],
    languages: ["English", "Spanish"]
  },
  {
    id: 10,
    slug: "edgar",
    name: "Edgar Pacheco",
    title: "Real Estate Advisor",
    specialization: "Luxury Properties",
    image: "/edgar-pacheco.jpg",
    phone: "+52 612 169 8328",
    email: "Edgar@bircabo.com",
    yearsExperience: 1,
    propertiesSold: 4,
    bio: "Looking to invest in Cabo San Lucas? I'm your insider advantage with analytical precision and real estate expertise.",
    certifications: ["REALTOR®", "MLS Member"],
    languages: ["English", "Spanish"]
  },
  {
    id: 11,
    slug: "fernando-cabrera",
    name: "Fernando Cabrera",
    title: "Real Estate Advisor",
    specialization: "Residential Properties & Vacation Homes",
    image: "/fernando-cabrera.jpg",
    phone: "+52 624 135 8900",
    email: "fernando@bircabo.com",
    yearsExperience: 5,
    propertiesSold: 40,
    bio: "I'm a former professional tennis player, and now a passionate real-estate advisor in Los Cabos. I know how important it is to feel confident and comfortable when choosing a home. I love meeting new people, listening to their needs, and helping them find the best options available. My goal is simple: to make every client feel supported, informed, and excited about their real estate journey.",
    certifications: ["MLS Member", "NAR Member"],
    languages: ["English", "Spanish"]
  },
  {
    id: 13,
    slug: "charles-jones",
    name: "Charles Jones",
    title: "Luxury Property Specialist",
    specialization: "Pedregal & Luxury Vacation Rentals",
    image: "/charles-jones.jpg",
    phone: "+1 858 964 4629",
    email: "cabocharlie79@gmail.com",
    yearsExperience: 30,
    propertiesSold: 250,
    bio: "A real estate professional by heritage, fluent in English and Spanish, with over 30 years of experience in Pedregal, Cabo San Lucas, and extensive knowledge of the entire area. This background allows me to offer a strategic and global approach when assisting my clients with buying, selling, or managing properties.",
    certifications: ["REALTOR®", "MLS Member", "Property Management Specialist"],
    languages: ["English", "Spanish"]
  },
];

const Team = () => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [statsVisible, setStatsVisible] = useState(false);
  const [statCounts, setStatCounts] = useState([0, 0, 0, 0]);

  // ⚡ OPTIMIZATION 2: Memoize format function
  const formatStatNumber = useMemo(() => {
    return (num: number, index: number) => {
      const stat = statsData[index];
      const formattedNum = num.toLocaleString();
      return `${stat.prefix || ""}${formattedNum}${stat.suffix || ""}`;
    };
  }, []);

  // ⚡ OPTIMIZATION 3: Debounce scroll check
  const checkScrollButtons = useMemo(() => {
    let timeout: NodeJS.Timeout;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (scrollContainerRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
          const atStart = scrollLeft <= 10;
          const atEnd = scrollLeft >= scrollWidth - clientWidth - 10;
          
          setCanScrollLeft(!atStart);
          setCanScrollRight(!atEnd);
        }
      }, 50);
    };
  }, []);

  // Intersection Observer for stats animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !statsVisible) {
          setStatsVisible(true);
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, [statsVisible]);

  // Animated counting effect for stats
  useEffect(() => {
    if (!statsVisible) return;

    const duration = 2000;
    const steps = 60;
    const increment = duration / steps;

    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      const progress = frame / steps;
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      setStatCounts(statsData.map(stat => Math.floor(stat.number * easeOutQuart)));

      if (frame >= steps) {
        clearInterval(interval);
        setStatCounts(statsData.map(stat => stat.number));
      }
    }, increment);

    return () => clearInterval(interval);
  }, [statsVisible]);

  const handleViewBio = useMemo(() => {
    return (agentId: number) => {
      navigate(`/team/${agentId}`);
    };
  }, [navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkScrollButtons();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [checkScrollButtons]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollAmount = 350;
    
    if (direction === 'left') {
      container.scrollLeft -= scrollAmount;
    } else {
      container.scrollLeft += scrollAmount;
    }
    
    setTimeout(() => {
      checkScrollButtons();
    }, 100);
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
            Our expert team is here to help you find the perfect property in Cabo San Lucas.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-16 bg-secondary border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {statsData.map((stat, index) => (
              <div 
                key={index}
                className="text-center"
                style={{ 
                  animation: statsVisible ? `fadeInUp 0.6s ease-out ${index * 0.1}s both` : 'none'
                }}
              >
                <div className="text-4xl md:text-5xl font-bold text-accent mb-2 tabular-nums">
                  {formatStatNumber(statCounts[index], index)}
                </div>
                <div className="text-sm text-muted-foreground whitespace-pre-line">
                  {stat.label}
                </div>
              </div>
            ))}
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
                Each member of our team brings unique expertise<br />and a commitment to exceptional service in Cabo San Lucas
              </p>
              <p className="text-sm text-muted-foreground">
                {agents.length} expert agents ready to assist you
              </p>
            </div>

            {/* Navigation Arrows */}
            <div className="flex justify-center items-center gap-6 mb-8">
              <button
                onClick={() => handleScroll('left')}
                disabled={!canScrollLeft}
                className="h-14 w-14 rounded-full shadow-lg bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center border border-gray-200 transition-all hover:scale-105"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-7 w-7 text-gray-700" />
              </button>

              <button
                onClick={() => handleScroll('right')}
                disabled={!canScrollRight}
                className="h-14 w-14 rounded-full shadow-lg bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center border border-gray-200 transition-all hover:scale-105"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-7 w-7 text-gray-700" />
              </button>
            </div>

            {/* Scrollable Agent Cards */}
            <div className="relative">
              <div 
                ref={scrollContainerRef}
                onScroll={checkScrollButtons}
                className="flex gap-6 overflow-x-scroll scroll-smooth px-4"
                style={{ 
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                {agents.map((agent) => (
                  <div key={agent.id} className="flex-shrink-0 w-[320px]">
                    <AgentBioCard
                      name={agent.name}
                      title={agent.title}
                      image={agent.image}
                      phone={agent.phone}
                      phone2={agent.phoneSecondary}
                      email={agent.email}
                      specialization={agent.specialization}
                      propertiesSold={agent.propertiesSold}
                      yearsExperience={agent.yearsExperience}
                      onViewBio={() => handleViewBio(agent.id)}
                      showStats={false}
                      landingPageSlug={agent.slug}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Scroll Hint */}
            <div className="text-center mt-8 text-sm text-muted-foreground">
              <p>Use arrows to explore all our team members</p>
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

      <style>{`
        .overflow-x-scroll::-webkit-scrollbar {
          display: none;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Team;