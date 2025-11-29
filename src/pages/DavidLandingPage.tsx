import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Award, Home, Users, CheckCircle, MessageCircle, ChevronDown, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchListings, convertMLSToPropertyCard, type MLSProperty } from "@/services/flexMlsService";

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

const agent = {
  id: 8,
  slug: "david",
  name: "David Scott Piper",
  title: "International Real Estate Specialist",
  specialization: "Resort & Second-Home Properties",
  image: "/david-scott-piper.jpg",
  phone: "+52 624 317 0297",
  email: "David@bircabo.com",
  yearsExperience: 25,
  propertiesSold: 50,
  bio: "David has over 25 years of experience in the real estate industry, working in many aspects of the business throughout his distinguished career. Licensed in both California and Mexico, his analytical approach and comprehensive market knowledge deliver exceptional results in the Cabo San Lucas luxury real estate market. As a Certified International Property Specialist (C.I.P.S.®), Accredited Buyer's Representative (A.B.R.®), and Resort and Second-Home Property Specialist (R.S.P.S.®), David brings unparalleled expertise to every transaction. As David states: 'As an Ironman triathlete and marathon runner, you can be sure I will go the extra mile for you.'",
  certifications: ["REALTOR®", "NAR® Member", "C.I.P.S.®", "A.B.R.®", "R.S.P.S.®", "MLS Member"],
  languages: ["English"]
};

// ⭐ AUTOMATIC AGENT DETECTION
const agentIdentifiers = {
  name: "David Scott Piper",
  email: "David@bircabo.com",
  phone: "+52 624 317 0297",
  mlsId: null,
  licenseNumber: null,
};

// Fallback listings if no MLS listings found
const fallbackListings = [
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
    sqft: "372.06 m²",
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
    sqft: "350.23 m²",
    mlsNumber: "24-1981",
    link: "https://www.flexmls.com/share/D0rFY/Casa-Ducci-Camino-del-Mar-Cabo-San-Lucas-",
  },
];

const testimonials = [
  {
    name: "William & Catherine Roberts",
    text: "David's investment expertise helped us build an incredible real estate portfolio in Cabo. His market knowledge and strategic guidance have been invaluable to our success.",
    rating: 5
  },
  {
    name: "Thomas Henderson",
    text: "Working with David was a game-changer for our investment strategy. His decades of experience and professional approach made the entire process seamless and profitable.",
    rating: 5
  },
  {
    name: "Patricia & James Wilson",
    text: "David's dedication to helping us find the right luxury property was exceptional. His expertise in the Cabo market and commitment to our goals made all the difference.",
    rating: 5
  }
];

const DavidLandingPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'my' | 'featured'>('my');
  const [myListings, setMyListings] = useState<any[]>([]);
  const [featuredListings, setFeaturedListings] = useState<any[]>([]);
  const [isLoadingMyListings, setIsLoadingMyListings] = useState(true);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  // ⭐ SAVE STATE
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const browseState = {
        url: window.location.pathname + window.location.search,
        scrollPosition: window.scrollY,
        currentPage: currentPage,
        activeTab: activeTab,
        timestamp: Date.now()
      };
      sessionStorage.setItem('davidBrowseState', JSON.stringify(browseState));
    }
  }, [currentPage, activeTab]);

  // ⭐ RESTORE STATE
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const returning = sessionStorage.getItem('returningFromProperty');
      if (returning === 'true') {
        const savedState = sessionStorage.getItem('davidBrowseState');
        if (savedState) {
          try {
            const state = JSON.parse(savedState);
            const isRecent = (Date.now() - state.timestamp) < 30 * 60 * 1000;
            const urlMatches = state.url === (window.location.pathname + window.location.search);
            
            if (urlMatches && isRecent) {
              console.log('🔄 Restoring browse state:', state);
              setCurrentPage(state.currentPage || 1);
              setActiveTab(state.activeTab || 'my');
              
              setTimeout(() => {
                window.scrollTo({
                  top: state.scrollPosition || 0,
                  behavior: 'smooth'
                });
              }, 100);
            }
          } catch (e) {
            console.error('Error restoring browse state:', e);
          }
        }
        sessionStorage.removeItem('returningFromProperty');
      }
    }
  }, []);

  // ⭐ AUTO-DETECT AGENT'S LISTINGS
  useEffect(() => {
    const loadMyListings = async () => {
      setIsLoadingMyListings(true);
      
      try {
        const cacheKey = 'david-my-listings-auto-v1';
        const cacheTimeKey = `${cacheKey}-time`;
        const cached = localStorage.getItem(cacheKey);
        const cachedTime = localStorage.getItem(cacheTimeKey);
        
        const now = Date.now();
        const threeHours = 3 * 60 * 60 * 1000;
        
        if (cached && cachedTime && (now - parseInt(cachedTime)) < threeHours) {
          const cachedData = JSON.parse(cached);
          setMyListings(cachedData);
          setIsLoadingMyListings(false);
          return;
        }
        
        console.log('🤖 AUTO-DETECTING listings for:', agentIdentifiers.name);
        
        const mlsData = await fetchListings({ 
          limit: 500,
          city: 'Cabo San Lucas'
        });
        
        const agentListings = mlsData.filter((property: any) => {
          const nameFields = ['ListAgentFullName', 'ListAgentName', 'AgentName', 'CoListAgentFullName'];
          const emailFields = ['ListAgentEmail', 'AgentEmail', 'ListOfficeEmail'];
          const phoneFields = ['ListAgentPhone', 'AgentPhone', 'ListOfficePhone'];
          
          let matchesName = false;
          let matchesEmail = false;
          let matchesPhone = false;
          
          nameFields.forEach(field => {
            if (property[field]) {
              const fieldValue = String(property[field]).toLowerCase();
              if (fieldValue.includes('piper') || fieldValue.includes('david scott')) {
                matchesName = true;
              }
            }
          });
          
          if (agentIdentifiers.email) {
            emailFields.forEach(field => {
              if (property[field] && String(property[field]).toLowerCase() === agentIdentifiers.email.toLowerCase()) {
                matchesEmail = true;
              }
            });
          }
          
          if (agentIdentifiers.phone) {
            const cleanSearchPhone = agentIdentifiers.phone.replace(/[^0-9]/g, '');
            phoneFields.forEach(field => {
              if (property[field]) {
                const cleanPropertyPhone = String(property[field]).replace(/[^0-9]/g, '');
                if (cleanPropertyPhone === cleanSearchPhone) {
                  matchesPhone = true;
                }
              }
            });
          }
          
          return matchesName || matchesEmail || matchesPhone;
        });
        
        console.log(`✅ Auto-detected ${agentListings.length} listings for ${agentIdentifiers.name}`);
        
        if (agentListings.length > 0) {
          const convertedListings = agentListings.map(convertMLSToPropertyCard);
          
          try {
            localStorage.setItem(cacheKey, JSON.stringify(convertedListings));
            localStorage.setItem(cacheTimeKey, now.toString());
          } catch (e) {
            console.error('Error caching listings:', e);
          }
          
          setMyListings(convertedListings);
        } else {
          console.log('⚠️ No listings found - using fallback listings');
          setMyListings(fallbackListings);
        }
      } catch (error) {
        console.error('Failed to load agent listings:', error);
        setMyListings(fallbackListings);
      } finally {
        setIsLoadingMyListings(false);
      }
    };

    loadMyListings();
  }, []);

  // Load featured listings
  useEffect(() => {
    const loadFeaturedListings = async () => {
      if (activeTab !== 'featured' || featuredListings.length > 0) return;
      
      setIsLoadingFeatured(true);
      
      try {
        const cacheKey = 'david-featured-api-data-v1';
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
        const shuffled = getShuffledListings(convertedListings, 'david-featured-shuffle-v1');
        
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
  }, [activeTab]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const allListings = activeTab === 'my' ? myListings : featuredListings;
  const isLoading = activeTab === 'my' ? isLoadingMyListings : isLoadingFeatured;
  const totalPages = Math.ceil(allListings.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const displayedListings = allListings.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document.querySelector('.listings-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Back to Team Button */}
      <div className="fixed top-20 left-4 z-40">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/team')}
          className="bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
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

      <section className="relative pt-24 pb-16 overflow-hidden" style={{ backgroundColor: 'white' }}>
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
              <p className="text-lg mb-2 font-medium" style={{ color: '#d4af37' }}>Your Luxury Real Estate Expert</p>
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
                <h3 className="font-bold mb-3">Certifications</h3>
                <div className="space-y-2">
                  {agent.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4 flex-shrink-0" style={{ color: '#102f74' }} />
                      <span className="text-sm text-muted-foreground">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <Users className="h-12 w-12 mx-auto mb-4" style={{ color: '#102f74' }} />
                <h3 className="font-bold mb-3">Languages</h3>
                <div className="space-y-1">
                  {agent.languages.map((lang, index) => (
                    <div key={index} className="text-sm text-muted-foreground">{lang}</div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <Home className="h-12 w-12 mx-auto mb-4" style={{ color: '#102f74' }} />
                <h3 className="font-bold mb-3">Specialization</h3>
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
              {activeTab === 'my' ? `Featured by ${agent.name.split(' ')[0]}` : 'Office Listings'}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {activeTab === 'my' ? 'My Listings' : 'Featured Listings'}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              {activeTab === 'my' 
                ? `Exclusive properties I'm currently representing in Cabo San Lucas`
                : 'Explore live properties from FlexMLS (refreshed every 3 hours)'}
            </p>

            <div className="flex justify-center gap-2 mb-8">
              <Button
                variant={activeTab === 'my' ? "luxury" : "outline"}
                onClick={() => setActiveTab('my')}
              >
                My Listings {!isLoadingMyListings && `(${myListings.length})`}
              </Button>
              <Button
                variant={activeTab === 'featured' ? "luxury" : "outline"}
                onClick={() => setActiveTab('featured')}
              >
                Featured {activeTab === 'featured' && !isLoadingFeatured && `(${featuredListings.length})`}
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin mb-4" style={{ color: '#102f74' }} />
              <p className="text-lg text-muted-foreground">
                {activeTab === 'my' ? 'Auto-detecting agent listings...' : 'Loading featured properties...'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                {displayedListings.map((property, index) => (
                  <div 
                    key={property.id || index}
                    onClick={() => {
                      sessionStorage.setItem('returningFromProperty', 'true');
                    }}
                  >
                    <PropertyCard {...property} />
                  </div>
                ))}
              </div>

              {displayedListings.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">No listings available at this time.</p>
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 my-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                      <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                        ...
                      </span>
                    ) : (
                      <Button
                        key={page}
                        variant={currentPage === page ? "luxury" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page as number)}
                      >
                        {page}
                      </Button>
                    )
                  ))}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div className="text-center text-sm text-muted-foreground mb-4">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, allListings.length)} of {allListings.length} properties
              </div>
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

export default DavidLandingPage;