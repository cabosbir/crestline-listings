import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Award, Home, Users, CheckCircle, MessageCircle, ChevronDown, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchListings, convertMLSToPropertyCard } from "@/services/flexMlsService";

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

// ==================== AGENT CONFIGURATION ====================
const agent = {
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
  totalSales: "$1.5M+",
  bio: "Looking to invest in Cabo San Lucas? I'm your insider advantage with analytical precision and real estate expertise. As a dedicated advisor at Baja International Realty, I combine data-driven market analysis with personalized service to help clients make informed investment decisions. My commitment to excellence and attention to detail ensures that every transaction is smooth, transparent, and aligned with your goals.",
  certifications: ["REALTOR®", "MLS Member"],
  languages: ["English", "Spanish"],
};

// ==================== LISTINGS CONFIGURATION ====================
const agentIdentifiers = {
  name: "Edgar Pacheco",
  email: "Edgar@bircabo.com",
  phone: "+52 612 169 8328",
  mlsId: null,
  licenseNumber: null,
};

const fallbackListings = [
  {
    id: 1,
    image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1762566328/20251107181410108190000000-o_ungrql.jpg",
    price: "$162,000",
    title: "Two in One Home Fixer Upper",
    location: "Cabo San Lucas",
    beds: 4,
    baths: 2,
    sqft: "1,722 sq ft",
    mlsNumber: "25-4981",
    link: "https://www.flexmls.com/share/D2qrW/",
  },
  {
    id: 2,
    image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1762632941/20250816215705384679000000-o_dpx9ui.jpg",
    price: "$193,000",
    title: "La Colina Town Home THTH2A",
    location: "CSL North-West 19, Cabo San Lucas",
    beds: 2,
    baths: 2,
    sqft: "1,399 sq ft",
    mlsNumber: "25-3933",
    link: "https://www.flexmls.com/share/D30em/",
  },
  {
    id: 3,
    image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761942708/20240426201812151546000000-o_zoqijd.jpg",
    price: "$3,795,800",
    title: "Casa Ducci Camino del Mar",
    location: "Cabo San Lucas",
    beds: 4,
    baths: 4.5,
    sqft: "3,770 sq ft",
    mlsNumber: "24-1981",
    link: "https://www.flexmls.com/share/D0rFY/",
  },
];

// Premium featured listings
const premiumFeaturedListings = [
  {
    id: 1,
    image: "https://res.cloudinary.com/dgixosra8/image/upload/v1763171689/20250903162058154584000000-o_1_dtusih.jpg",
    price: "$29,900,000",
    title: "La Montaña 7",
    location: "San Jose Corridor",
    beds: 6,
    baths: 6,
    sqft: "N/A",
    mlsNumber: "25-1563",
  },
  {
    id: 2,
    image: "https://res.cloudinary.com/dgixosra8/image/upload/v1763171868/20241126184008646051000000-o_lv9fbu.jpg",
    price: "$21,000,000",
    title: "Espiritu del Mar, Casa Luna Escondida",
    location: "San Jose Corridor",
    beds: 10,
    baths: 11,
    sqft: "22,596 sq ft",
    mlsNumber: "24-5344",
  },
  {
    id: 3,
    image: "https://res.cloudinary.com/dgixosra8/image/upload/v1763171913/20251030154706212946000000-o_erpyxt.jpg",
    price: "$19,850,000",
    title: "Casa R Caleta Palmilla, Beachfront",
    location: "Caleta Palmilla",
    beds: 7,
    baths: 6,
    sqft: "12,860 sq ft",
    mlsNumber: "25-4826",
  },
  {
    id: 4,
    image: "https://res.cloudinary.com/dgixosra8/image/upload/v1763171969/20251010184556773187000000-o_hq2fyv.jpg",
    price: "$17,900,000",
    title: "Casita 11, Casa Amore",
    location: "San Jose Corridor",
    beds: 5,
    baths: 4,
    sqft: "12,819 sq ft",
    mlsNumber: "25-4958",
  },
  {
    id: 5,
    image: "https://res.cloudinary.com/dgixosra8/image/upload/v1763172032/20251010204002587235000000-o_xs4xu1.jpg",
    price: "$15,900,000",
    title: "Casita 10, Villa Laura",
    location: "San Jose Corridor",
    beds: 8,
    baths: 8,
    sqft: "10,874 sq ft",
    mlsNumber: "25-4500",
  },
  {
    id: 6,
    image: "https://res.cloudinary.com/dgixosra8/image/upload/v1763172108/20250516213428349054000000-o_upkws3.jpg",
    price: "$12,900,000",
    title: "Hacienda 505",
    location: "San Jose Corridor",
    beds: 5,
    baths: 5,
    sqft: "N/A",
    mlsNumber: "25-2623",
  },
  {
    id: 7,
    image: "https://res.cloudinary.com/dgixosra8/image/upload/v1763172188/20251107153452735555000000-o_lnsjug.jpg",
    price: "$11,900,000",
    title: "Estate Villa 496",
    location: "San Jose Corridor",
    beds: 5,
    baths: 6,
    sqft: "8,102 sq ft",
    mlsNumber: "25-3280",
  },
  {
    id: 8,
    image: "https://res.cloudinary.com/dgixosra8/image/upload/v1763172532/20250520183535938188000000-o_hywmj2.jpg",
    price: "$8,500,000",
    title: "Casita 382",
    location: "San Jose Corridor",
    beds: 4,
    baths: 4,
    sqft: "5,724 sq ft",
    mlsNumber: "25-2575",
  },
  {
    id: 9,
    image: "https://res.cloudinary.com/dgixosra8/image/upload/v1763172428/20251010043244963405000000-o_1_kexihr.jpg",
    price: "$8,500,000",
    title: "Casa Abejas",
    location: "Palmilla",
    beds: 7,
    baths: 8,
    sqft: "6,101 sq ft",
    mlsNumber: "25-4970",
  },
];

const testimonials = [
  {
    name: "James & Patricia Wilson",
    text: "Edgar's analytical approach and market expertise helped us make confident investment decisions. His attention to detail and commitment to our goals made the entire process seamless.",
    rating: 5
  },
  {
    name: "Michael Rodriguez",
    text: "Working with Edgar was exceptional. His data-driven insights and personalized service gave us the insider advantage we needed in the Cabo real estate market.",
    rating: 5
  },
  {
    name: "Lisa & Thomas Chen",
    text: "Edgar's dedication to excellence and transparent communication made our property purchase stress-free. We highly recommend his professional services!",
    rating: 5
  }
];

const ITEMS_PER_PAGE = 9;

// ==================== MAIN COMPONENT ====================
const EdgarLandingPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // ⭐ Initialize from saved state if returning
  const getInitialPage = () => {
    if (typeof window !== 'undefined') {
      const returning = sessionStorage.getItem('returningFromProperty');
      if (returning === 'true') {
        const savedState = sessionStorage.getItem('edgarBrowseState');
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
        const savedState = sessionStorage.getItem('edgarBrowseState');
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
    return false; // Default to "featured" for Edgar
  };
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showMyListings, setShowMyListings] = useState(getInitialTab());
  const [myListings, setMyListings] = useState(fallbackListings);
  const [featuredListings, setFeaturedListings] = useState([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(false);
  const [isLoadingMyListings, setIsLoadingMyListings] = useState(false);
  const [currentPage, setCurrentPage] = useState(getInitialPage());

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
      sessionStorage.setItem('edgarBrowseState', JSON.stringify(browseState));
    }
  }, [showMyListings, currentPage]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const returning = sessionStorage.getItem('returningFromProperty');
      if (returning === 'true') {
        const savedState = sessionStorage.getItem('edgarBrowseState');
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
        const cacheKey = 'edgar-featured-api-data-v1';
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
        
        const mlsData = await fetchListings({ 
          limit: 50,
          city: 'Cabo San Lucas',
        });
        
        const convertedListings = mlsData.map(convertMLSToPropertyCard);
        const shuffled = getShuffledListings(convertedListings, 'edgar-featured-shuffle-v1');
        
        try {
          localStorage.setItem(cacheKey, JSON.stringify(shuffled));
          localStorage.setItem(cacheTimeKey, now.toString());
        } catch (e) {
          console.error('Error caching API data:', e);
        }
        
        setFeaturedListings(shuffled);
      } catch (error) {
        console.error('Failed to load featured listings:', error);
        setFeaturedListings(fallbackListings);
      } finally {
        setIsLoadingFeatured(false);
      }
    };

    loadFeaturedListings();
  }, []); // Load once on mount

  // ==================== LOAD MY LISTINGS (AUTO DETECTION) ====================
  useEffect(() => {
    const loadMyListings = async () => {
      if (!showMyListings) return;
      
      setIsLoadingMyListings(true);
      
      try {
        const CACHE_VERSION = 1;
        const cacheKey = `edgar-my-listings-auto-v${CACHE_VERSION}`;
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
        
        console.log('🤖 AUTO-DETECTING listings for Baja International Realty');
        
        const mlsData = await fetchListings({ 
          limit: 500,
          city: 'Cabo San Lucas'
        });
        
        console.log('🔍 Total API results:', mlsData.length);
        
        // Search for Edgar Pacheco OR Baja International Realty agents
        const agentListings = mlsData.filter(listing => {
          const listAgentName = listing.ListAgentFullName || listing.ListAgentName || listing.AgentName || '';
          const listAgentEmail = listing.ListAgentEmail || listing.AgentEmail || '';
          const listAgentPhone = listing.ListAgentPhone || listing.AgentPhone || '';
          const listOfficeName = listing.ListOfficeName || listing.OfficeName || '';
          
          // Match Edgar specifically
          const nameMatch = listAgentName.toLowerCase().includes('pacheco') || 
                           listAgentName.toLowerCase().includes('edgar');
          const emailMatch = listAgentEmail.toLowerCase() === agentIdentifiers.email.toLowerCase();
          const cleanPhone = (phone: string) => phone.replace(/[^0-9]/g, '');
          const phoneMatch = cleanPhone(listAgentPhone) === cleanPhone(agentIdentifiers.phone);
          
          // Match Baja International Realty office (must include "international" to avoid "House of Baja")
          const officeMatch = (listOfficeName.toLowerCase().includes('baja') && 
                              listOfficeName.toLowerCase().includes('international')) ||
                             listOfficeName.toLowerCase().includes('baja international realty');
          
          return nameMatch || emailMatch || phoneMatch || officeMatch;
        });
        
        console.log(`✅ Auto-detected ${agentListings.length} listings for Baja International Realty`);
        
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
  const allListings = showMyListings ? myListings : featuredListings;
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
      <Navbar />

      {/* ==================== BACK TO TEAM BUTTON ==================== */}
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

      {/* ==================== WHATSAPP FLOATING BUTTON ==================== */}
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

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative pb-16 overflow-hidden" style={{ backgroundColor: 'white' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-white" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img 
                src={agent.image}
                alt={agent.name}
                className="w-full max-w-md mx-auto rounded-2xl shadow-2xl object-cover"
              />
            </div>

            <div className="order-1 lg:order-2 text-center lg:text-left">
              <p className="text-lg mb-2 font-medium" style={{ color: '#d4af37' }}>Your Real Estate Expert</p>
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

      {/* ==================== ABOUT SECTION ==================== */}
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

      {/* ==================== LISTINGS SECTION ==================== */}
      <section className="listings-section py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <p className="uppercase tracking-wider mb-2 font-medium" style={{ color: '#d4af37' }}>
              {showMyListings ? 'Baja International Realty Portfolio' : 'Office Listings'}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {showMyListings ? 'My Listings' : 'Featured Listings'}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              {showMyListings 
                ? `Exclusive properties from Baja International Realty`
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

              {/* ==================== PAGINATION ==================== */}
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

      {/* ==================== TESTIMONIALS SECTION ==================== */}
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

      {/* ==================== CONTACT SECTION ==================== */}
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

export default EdgarLandingPage;