import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";  
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Award, Home, Users, CheckCircle, MessageCircle, ChevronDown, Loader2, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchListings, convertMLSToPropertyCard } from "@/services/flexMlsService";

// ==================== AGENT CONFIGURATION ====================
const agent = {
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
  totalSales: "$95M+",
  bio: "A real estate professional by heritage, fluent in English and Spanish, with over 30 years of experience in Pedregal, Cabo San Lucas, and extensive knowledge of the entire area. This background allows me to offer a strategic and global approach when assisting my clients with buying, selling, or managing properties. I am passionate about real estate, specializing in identifying high-value opportunities and overseeing construction and renovation projects. I also have extensive experience managing luxury vacation rental properties in Pedregal, ensuring exceptional results and meticulous attention to detail. I work exclusively with top-tier professionals, offering 24/7 availability and delivering efficient, personalized service while always protecting my clients' best interests.",
  certifications: ["REALTOR®", "MLS Member", "Property Management Specialist"],
  languages: ["English", "Spanish"],
  agency: "Baja International Realty",
};

// ==================== LISTINGS CONFIGURATION ====================
// ⭐ AUTOMATIC LISTING DETECTION - No manual MLS numbers needed!
// The system automatically fetches all active listings for this agent

// Agent identifiers for API matching
const agentIdentifiers = {
  name: "Charles Jones",
  email: "cabocharlie79@gmail.com",
  phone: "+1 858 964 4629",
  mlsId: null,
  licenseNumber: null,
};

// Fallback data if API fails (will be replaced by API data)
const fallbackListings = [
  {
    id: 1,
    image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1762121002/20251017233106344278000000-o_mkittq.jpg",
    price: "$279,000",
    title: "Marina Cabo Plaza",
    location: "Paseo de la Marina, Cabo San Lucas",
    beds: 0,
    baths: 1,
    sqft: "422 sq ft",
    mlsNumber: "25-4668",
    link: "https://www.flexmls.com/share/D1Cgo/Marina-Cabo-Plaza-Paseo-de-la-Marina-103A-Cabo-San-Lucas-",
  },
  {
    id: 2,
    image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1762121555/20240509024323100469000000-o_km5cq0.jpg",
    price: "$429,000",
    title: "Terrasol Av Solmar 164",
    location: "Cabo San Lucas",
    beds: 2,
    baths: 2,
    sqft: "1,200 sq ft",
    mlsNumber: "25-5288",
    link: "https://www.flexmls.com/share/",
  },
];

// ==================== TESTIMONIALS ====================
const testimonials = [
  {
    name: "Patricia & Michael Rodriguez",
    text: "Charles's 30 years of experience in Pedregal and his deep knowledge of the area made finding our dream home effortless. His 24/7 availability and attention to detail exceeded our expectations.",
    rating: 5
  },
  {
    name: "Jennifer & Mark Stevens",
    text: "Working with Charles was exceptional! His strategic approach, construction expertise, and property management experience gave us complete confidence. He truly protects his clients' best interests.",
    rating: 5
  },
  {
    name: "Robert & Susan Martinez",
    text: "Charles's heritage in real estate and bilingual skills made the entire process smooth. His network of top-tier professionals and personalized service is unmatched in Cabo San Lucas.",
    rating: 5
  }
];

// ==================== PAGINATION CONFIG ====================
const ITEMS_PER_PAGE = 9;

// ==================== HELPER FUNCTIONS ====================
const getWhatsAppNumber = (phone: string) => {
  return phone.replace(/[^0-9]/g, '');
};

const getWhatsAppLink = (phone: string, agentName: string) => {
  const number = getWhatsAppNumber(phone);
  const message = encodeURIComponent(`Hi ${agentName}, I'm interested in Cabo real estate properties. Can you help me?`);
  return `https://wa.me/${number}?text=${message}`;
};

const getShuffledListings = (listings: any[], cacheKey: string) => {
  const cacheTimeKey = `${cacheKey}-time`;
  
  if (typeof window === 'undefined') return listings;
  
  const cached = localStorage.getItem(cacheKey);
  const cachedTime = localStorage.getItem(cacheTimeKey);
  
  const now = Date.now();
  const threeHours = 3 * 60 * 60 * 1000;
  
  if (cached && cachedTime && (now - parseInt(cachedTime)) < threeHours) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.error('Error parsing cached listings:', e);
    }
  }
  
  const shuffled = [...listings].sort(() => Math.random() - 0.5);
  
  try {
    localStorage.setItem(cacheKey, JSON.stringify(shuffled));
    localStorage.setItem(cacheTimeKey, now.toString());
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
  
  return shuffled;
};

// ==================== MAIN COMPONENT ====================
const CharlesLandingPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
   
  const location = useLocation();
  const canonicalUrl = 'https://www.bircabo.com/charles-jones';
  
  const getInitialPage = () => {
    if (typeof window !== 'undefined') {
      const returning = sessionStorage.getItem('returningFromProperty');
      if (returning === 'true') {
        const savedState = sessionStorage.getItem('charlesBrowseState');
        if (savedState) {
          try {
            const state = JSON.parse(savedState);
            const isRecent = (Date.now() - state.timestamp) < 30 * 60 * 1000;
            if (isRecent && state.url === window.location.pathname) {
              return state.currentPage || 1;
            }
          } catch (e) {}
        }
      }
    }
    return 1;
  };
  
  const getInitialTab = () => {
    if (typeof window !== 'undefined') {
      const returning = sessionStorage.getItem('returningFromProperty');
      if (returning === 'true') {
        const savedState = sessionStorage.getItem('charlesBrowseState');
        if (savedState) {
          try {
            const state = JSON.parse(savedState);
            const isRecent = (Date.now() - state.timestamp) < 30 * 60 * 1000;
            if (isRecent && state.url === window.location.pathname) {
              return state.activeTab === 'my-listings';
            }
          } catch (e) {}
        }
      }
    }
    return false;
  };
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showMyListings, setShowMyListings] = useState(getInitialTab());
  const [myListings, setMyListings] = useState(fallbackListings);
  const [featuredListings, setFeaturedListings] = useState([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);
  const [isLoadingMyListings, setIsLoadingMyListings] = useState(false);
  const [currentPage, setCurrentPage] = useState(getInitialPage());
  const [listingsSearchQuery, setListingsSearchQuery] = useState("");

  // ==================== SAVE/RESTORE STATE ====================
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const browseState = {
        url: window.location.pathname,
        scrollPosition: window.scrollY,
        activeTab: showMyListings ? 'my-listings' : 'featured',
        currentPage: currentPage,
        timestamp: Date.now()
      };
      sessionStorage.setItem('charlesBrowseState', JSON.stringify(browseState));
    }
  }, [showMyListings, currentPage]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const returning = sessionStorage.getItem('returningFromProperty');
      if (returning === 'true') {
        const savedState = sessionStorage.getItem('charlesBrowseState');
        if (savedState) {
          try {
            const state = JSON.parse(savedState);
            const isRecent = (Date.now() - state.timestamp) < 30 * 60 * 1000;
            if (state.url === window.location.pathname && isRecent) {
              setTimeout(() => {
                window.scrollTo({ top: state.scrollPosition || 0, behavior: 'smooth' });
                sessionStorage.removeItem('returningFromProperty');
              }, 100);
            }
          } catch (e) {
            console.error('Error restoring browse state:', e);
          }
        }
      }
    }
  }, []);

  // ==================== LOAD FEATURED LISTINGS ====================
  useEffect(() => {
    const loadFeaturedListings = async () => {
      setIsLoadingFeatured(true);
      
      try {
        const cacheKey = `${agent.slug}-featured-api-data`;
        const cacheTimeKey = `${cacheKey}-time`;
        const cached = localStorage.getItem(cacheKey);
        const cachedTime = localStorage.getItem(cacheTimeKey);
        
        const now = Date.now();
        const threeHours = 3 * 60 * 60 * 1000;
        
        if (cached && cachedTime && (now - parseInt(cachedTime)) < threeHours) {
          const cachedData = JSON.parse(cached);
          setFeaturedListings(cachedData);
          setIsLoadingFeatured(false);
          return;
        }
        
        console.log('🔄 Loading Featured Listings from API...');
        
        const mlsData = await fetchListings({
          limit: 500,
          city: 'Cabo San Lucas',
        });

        console.log('✅ Fetched featured listings:', mlsData.length);

        const birOnly = mlsData.filter((listing: any) => {
          const officeName = (listing.ListOfficeName || listing.OfficeName || '').toLowerCase();
          // Log unique office names for debugging
          const allOfficeNames = [...new Set(mlsData.map((l: any) => l.ListOfficeName || l.OfficeName || '').filter(Boolean))];
          console.log('🏢 All office names in results:', JSON.stringify(allOfficeNames));
          return officeName.includes('baja international');
        });
        console.log(`🏢 BIR office listings: ${birOnly.length} of ${mlsData.length} total`);
        const convertedListings = birOnly.map(convertMLSToPropertyCard);
        const shuffled = getShuffledListings(convertedListings, `${agent.slug}-featured-shuffle`);
        
        try {
          localStorage.setItem(cacheKey, JSON.stringify(shuffled));
          localStorage.setItem(cacheTimeKey, now.toString());
        } catch (e) {
          console.error('Error caching API data:', e);
        }
        
        setFeaturedListings(shuffled);
      } catch (error) {
        console.error('Failed to load featured listings:', error);
        toast({
          title: "Notice",
          description: "Showing available listings. Some listings may be loading.",
          variant: "default",
        });
        setFeaturedListings(fallbackListings);
      } finally {
        setIsLoadingFeatured(false);
      }
    };

    loadFeaturedListings();
  }, []);

  // ==================== LOAD MY LISTINGS ====================
  useEffect(() => {
    const loadMyListings = async () => {
      if (!showMyListings) return;
      
      setIsLoadingMyListings(true);
      
      try {
        const CACHE_VERSION = 1;
        const cacheKey = `${agent.slug}-my-listings-auto-v${CACHE_VERSION}`;
        const cacheTimeKey = `${cacheKey}-time`;
        const cached = localStorage.getItem(cacheKey);
        const cachedTime = localStorage.getItem(cacheTimeKey);
        
        const now = Date.now();
        const threeHours = 3 * 60 * 60 * 1000;
        
        if (cached && cachedTime && (now - parseInt(cachedTime)) < threeHours) {
          const cachedData = JSON.parse(cached);
          console.log(`✅ Using cached auto-detected listings (v${CACHE_VERSION}):`, cachedData.length);
          setMyListings(cachedData);
          setIsLoadingMyListings(false);
          return;
        }
        
        console.log('🤖 AUTO-DETECTING listings for:', agent.name);
        console.log('🔍 Searching by agent identifiers:', agentIdentifiers);
        
        const mlsData = await fetchListings({ 
          limit: 500,
          city: 'Cabo San Lucas'
        });
        
        console.log('🔍 Total API results:', mlsData.length);
        console.log('🎯 Filtering for agent:', agent.name);
        
        const agentListings = mlsData.filter(listing => {
          const listAgentName = listing.ListAgentFullName || listing.ListAgentName || listing.AgentName || '';
          const listAgentEmail = listing.ListAgentEmail || listing.AgentEmail || '';
          const listAgentPhone = listing.ListAgentPhone || listing.AgentPhone || '';
          
          const nameMatch = listAgentName.toLowerCase().includes('charles jones') || 
                           listAgentName.toLowerCase().includes('charles') && listAgentName.toLowerCase().includes('jones') ||
                           listAgentName.toLowerCase() === 'charles jones';
          
          const emailMatch = listAgentEmail.toLowerCase() === agentIdentifiers.email.toLowerCase();
          
          const cleanPhone = (phone: string) => phone.replace(/[^0-9]/g, '');
          const phoneMatch = cleanPhone(listAgentPhone) === cleanPhone(agentIdentifiers.phone);
          
          return nameMatch || emailMatch || phoneMatch;
        });
        
        console.log(`✅ Auto-detected ${agentListings.length} listings for ${agent.name}`);
        
        if (agentListings.length > 0) {
          console.log('📋 Found listings:', agentListings.map(l => ({
            mls: l.ListingId,
            address: l.UnparsedAddress,
            price: l.ListPrice,
            agent: l.ListAgentFullName || l.ListAgentName
          })));
        } else {
          console.warn('⚠️ No listings found - checking agent field names...');
          if (mlsData.length > 0) {
            const sample = mlsData[0];
            const agentFields = Object.keys(sample).filter(key => 
              /agent|broker|office|member/i.test(key)
            );
            console.log('📋 Available agent fields in MLS:', agentFields);
          }
        }
        
        const convertedListings = agentListings.map(convertMLSToPropertyCard);
        const finalListings = convertedListings.length > 0 ? convertedListings : fallbackListings;
        
        try {
          localStorage.setItem(cacheKey, JSON.stringify(finalListings));
          localStorage.setItem(cacheTimeKey, now.toString());
        } catch (e) {
          console.error('Error caching my listings:', e);
        }
        
        setMyListings(finalListings);
      } catch (error) {
        console.error('Failed to auto-detect listings:', error);
        setMyListings(fallbackListings);
      } finally {
        setIsLoadingMyListings(false);
      }
    };

    loadMyListings();
  }, [showMyListings, toast]);

  // ==================== PAGINATION ====================
  const filteredListings = showMyListings ? myListings : featuredListings;
  const searchFilteredListings = listingsSearchQuery.trim()
    ? filteredListings.filter(listing => {
        const query = listingsSearchQuery.toLowerCase();
        return (
          listing.title?.toLowerCase().includes(query) ||
          listing.location?.toLowerCase().includes(query) ||
          listing.mlsNumber?.toLowerCase().includes(query) ||
          listing.price?.toLowerCase().includes(query)
        );
      })
    : filteredListings;

  const allListings = searchFilteredListings;
  const totalPages = Math.ceil(allListings.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const displayedListings = allListings.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document.querySelector('.listings-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage <= 3) {
        pages.push(2, 3, 4);
        pages.push('ellipsis-end');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push('ellipsis-start');
        pages.push(totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push('ellipsis-start');
        pages.push(currentPage - 1, currentPage, currentPage + 1);
        pages.push('ellipsis-end');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Charles Jones - Luxury Property Specialist | Pedregal & Cabo San Lucas Expert | Baja International Realty</title>
        <meta 
          name="description" 
          content="Connect with Charles Jones, Luxury Property Specialist with 30 years experience in Pedregal and Cabo San Lucas. 250+ properties sold, $95M+ in sales. Expert in luxury vacation rentals and property management."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content="Charles Jones - Pedregal & Cabo San Lucas Luxury Real Estate Expert" />
        <meta property="og:description" content="30 years experience, 250+ properties sold. Specializing in Pedregal luxury properties and vacation rental management." />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content="https://www.bircabo.com/charles-jones.jpg" />
        <meta property="og:type" content="profile" />
        
        {/* Person Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": "Charles Jones",
            "jobTitle": "Luxury Property Specialist",
            "worksFor": {
              "@type": "Organization",
              "name": "Baja International Realty",
              "url": "https://www.bircabo.com"
            },
            "email": "cabocharlie79@gmail.com",
            "telephone": "+1 858 964 4629",
            "image": "https://www.bircabo.com/charles-jones.jpg",
            "url": canonicalUrl,
            "description": "A real estate professional by heritage, fluent in English and Spanish, with over 30 years of experience in Pedregal, Cabo San Lucas.",
            "knowsAbout": ["Luxury Real Estate", "Pedregal", "Vacation Rental Management", "Property Management", "Cabo San Lucas", "Los Cabos"],
            "award": "Top Producer"
          })}
        </script>
      </Helmet>
      <Navbar />

      <div className="container mx-auto px-4 pt-24">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/team')}
          className="mb-4 hover:bg-secondary"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Team
        </Button>
      </div>

      <a
        href={getWhatsAppLink(agent.phone, agent.name)}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-16 h-16 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-3xl group"
        style={{ backgroundColor: '#25D366' }}
        aria-label={`Contact ${agent.name} via WhatsApp`}
      >
        <MessageCircle className="h-8 w-8 text-white" />
        <span className="absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          Chat on WhatsApp
        </span>
        <span className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: '#25D366' }}></span>
      </a>

      <section className="relative pb-16 overflow-hidden" style={{ backgroundColor: 'white' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-white" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img 
                src={agent.image}
                alt={`${agent.name} - ${agent.title} at Baja International Realty`}
                className="w-full max-w-md mx-auto rounded-2xl shadow-2xl object-cover"
              />
            </div>

            <div className="order-1 lg:order-2 text-center lg:text-left">
              <p className="text-lg mb-2 font-medium" style={{ color: '#d4af37' }}>{agent.agency}</p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4" style={{ color: '#102f74' }}>
                {agent.name}
              </h1>
              <p className="text-xl md:text-2xl mb-6" style={{ color: '#666' }}>
                {agent.title}
              </p>
              <p className="text-lg mb-8 max-w-xl mx-auto lg:mx-0" style={{ color: '#666' }}>
                Specializing in {agent.specialization}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto lg:mx-0">
                <div className="backdrop-blur-sm rounded-lg p-4 text-center border-2" style={{ backgroundColor: '#f8f9fa', borderColor: '#102f74' }}>
                  <div className="text-3xl font-bold" style={{ color: '#d4af37' }}>{agent.yearsExperience}</div>
                  <div className="text-sm" style={{ color: '#666' }}>Years Experience</div>
                </div>
                <div className="backdrop-blur-sm rounded-lg p-4 text-center border-2" style={{ backgroundColor: '#f8f9fa', borderColor: '#102f74' }}>
                  <div className="text-3xl font-bold" style={{ color: '#d4af37' }}>{agent.propertiesSold}+</div>
                  <div className="text-sm" style={{ color: '#666' }}>Properties Sold</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  variant="default"
                  size="lg"
                  asChild
                  style={{ backgroundColor: '#102f74', color: 'white' }}
                  className="hover:opacity-90"
                >
                  <a href={`tel:${agent.phone}`}>
                    <Phone className="mr-2 h-5 w-5" />
                    Call {agent.name.split(' ')[0]} Now
                  </a>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  style={{ borderColor: '#102f74', color: '#102f74' }}
                  className="bg-transparent hover:bg-[#102f74] hover:text-white"
                  onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Mail className="mr-2 h-5 w-5" />
                  Send Message
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">About {agent.name.split(' ')[0]}</h2>
            <p className="text-lg text-muted-foreground text-center mb-12 leading-relaxed">
              {agent.bio}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <Award className="h-12 w-12 mx-auto mb-4" style={{ color: '#102f74' }} />
                <h3 className="font-bold mb-2">Certifications</h3>
                <div className="space-y-1">
                  {agent.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4" style={{ color: '#102f74' }} />
                      <span className="text-sm text-muted-foreground">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <Users className="h-12 w-12 mx-auto mb-4" style={{ color: '#102f74' }} />
                <h3 className="font-bold mb-2">Languages</h3>
                <div className="space-y-1">
                  {agent.languages.map((lang, index) => (
                    <div key={index} className="text-sm text-muted-foreground">{lang}</div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <Home className="h-12 w-12 mx-auto mb-4" style={{ color: '#102f74' }} />
                <h3 className="font-bold mb-2">Specialization</h3>
                <p className="text-sm text-muted-foreground">{agent.specialization}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="listings-section py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <p className="uppercase tracking-wider mb-2 font-medium" style={{ color: '#d4af37' }}>
              {showMyListings ? `Featured by ${agent.name.split(' ')[0]}` : `${agent.agency} Listings`}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {showMyListings ? 'My Listings' : 'Featured Listings'}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              {showMyListings 
                ? `Exclusive properties I'm currently representing in Cabo San Lucas`
                : 'Explore live properties from FlexMLS (refreshed every 3 hours)'}
            </p>

            <div className="flex justify-center gap-2 mb-8">
              <Button
                variant={showMyListings ? "luxury" : "outline"}
                onClick={() => setShowMyListings(true)}
              >
                My Listings ({myListings.length})
              </Button>
              <Button
                variant={!showMyListings ? "luxury" : "outline"}
                onClick={() => setShowMyListings(false)}
              >
                Featured ({featuredListings.length})
              </Button>
            </div>
          </div>

          {(isLoadingFeatured && !showMyListings) || (isLoadingMyListings && showMyListings) ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin mb-4" style={{ color: '#102f74' }} />
              <p className="text-lg text-muted-foreground">
                {showMyListings ? 'Auto-detecting agent listings...' : 'Loading featured properties...'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                {displayedListings.map((property) => (
                  <PropertyCard key={property.id} {...property} currentPage={currentPage} />
                ))}
              </div>

              {displayedListings.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">No listings available at this time.</p>
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex flex-col items-center gap-4 my-8">
                  <div className="text-sm text-muted-foreground">
                    Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, allListings.length)} of {allListings.length} properties
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="h-10 px-3"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="ml-1 hidden sm:inline">Previous</span>
                    </Button>
                    
                    {getPageNumbers().map((page, index) => {
                      if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                        return (
                          <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                            ...
                          </span>
                        );
                      }
                      
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "luxury" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page as number)}
                          className="h-10 w-10 p-0"
                        >
                          {page}
                        </Button>
                      );
                    })}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="h-10 px-3"
                    >
                      <span className="mr-1 hidden sm:inline">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="text-center">
            <Link to="/properties">
              <Button variant="luxury" size="lg">
                View All Properties
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Client Reviews</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-secondary/30 p-6 rounded-xl">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-xl" style={{ color: '#d4af37' }}>★</span>
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">"{testimonial.text}"</p>
                <p className="font-bold">– {testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact-form" className="py-20" style={{ backgroundColor: '#102f74', color: 'white' }}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
              <p className="text-xl mb-8" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                I will personally reach out to discuss your property goals.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <a 
                href={`tel:${agent.phone}`}
                className="flex items-center gap-4 backdrop-blur-sm p-6 rounded-xl transition-all hover:scale-105 border-2 border-white/30 hover:border-white/60"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#d4af37' }}>
                  <Phone className="h-7 w-7 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Call {agent.name.split(' ')[0]}</div>
                  <div className="text-xl font-bold text-white">{agent.phone}</div>
                </div>
              </a>

              <a 
                href={`mailto:${agent.email}`}
                className="flex items-center gap-4 backdrop-blur-sm p-6 rounded-xl transition-all hover:scale-105 border-2 border-white/30 hover:border-white/60"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#d4af37' }}>
                  <Mail className="h-7 w-7 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Email {agent.name.split(' ')[0]}</div>
                  <div className="text-lg font-bold text-white break-all">{agent.email}</div>
                </div>
              </a>
            </div>

            <div className="bg-white rounded-2xl p-8 md:p-12 text-center shadow-2xl">
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-900 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Looking to buy or sell?</h3>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                  Select the right form for your needs and {agent.name.split(' ')[0]} will personally reach out.
                </p>
              </div>

              <div className="relative max-w-md mx-auto">
                <Button 
                  size="lg"
                  className="w-full h-16 px-12 text-lg font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-105 flex items-center justify-between"
                  style={{ backgroundColor: '#102f74', color: 'white' }}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span>📋 Select a Form</span>
                  <ChevronDown className={`w-5 h-5 ml-2 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </Button>

                {isDropdownOpen && (
                  <div className="absolute w-full mt-2 bg-white rounded-xl shadow-2xl border-2 border-gray-200 overflow-hidden z-10">
                    <Link
                      to={`/agents/${agent.slug}/new-client`}
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100 text-left"
                    >
                      <div className="font-bold text-gray-900 text-lg mb-1">🏠 New Client Form</div>
                      <div className="text-sm text-gray-600">Looking to buy property in Cabo</div>
                    </Link>
                    <Link
                      to={`/agents/${agent.slug}/seller-evaluation`}
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-6 py-4 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="font-bold text-gray-900 text-lg mb-1">💰 Property Evaluation</div>
                      <div className="text-sm text-gray-600">Get a free property valuation</div>
                    </Link>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-500 mt-6">
                Takes only 2-3 minutes to complete • 100% confidential
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CharlesLandingPage;
