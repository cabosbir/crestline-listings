import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Award, Home, Users, CheckCircle, MessageCircle, ChevronDown, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchListings, convertMLSToPropertyCard } from "@/services/flexMlsService";

// ==================== START: HELPER FUNCTIONS ====================

const getWhatsAppNumber = (phone) => {
  return phone.replace(/[^0-9]/g, '');
};

const getWhatsAppLink = (phone, agentName) => {
  const number = getWhatsAppNumber(phone);
  const message = encodeURIComponent(`Hi ${agentName}, I'm interested in Cabo real estate properties. Can you help me?`);
  return `https://wa.me/${number}?text=${message}`;
};

const getShuffledListings = (listings, cacheKey) => {
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

// ==================== END: HELPER FUNCTIONS ====================

// ==================== START: AGENT DATA ====================

const agent = {
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
  bio: "With nine years of real estate experience in Mexico, I specialize in high-yield investment properties and have successfully sold over 85 properties, totaling more than $35 million in sales. My deep understanding of Cabo San Lucas's investment landscape and strong negotiation skills have earned me recognition as a top producer in the market. I'm passionate about helping clients identify profitable opportunities and guiding them through every stage of the investment process with transparency, precision, and trust.",
  certifications: ["MLS Member"],
  languages: ["English"],
};

// ==================== END: AGENT DATA ====================

// ==================== START: LISTINGS DATA ====================

// My Listings - MLS numbers to fetch from API (maintains this exact order)
const myListingMLSNumbers = [
  "25-4668",  // Marina Cabo Plaza - $279,000 (Active)
  "25-5288",  // Terrasol Av Solmar 164 - $429,000 (Active - New Listing)
  "24-2073",  // Bahia del Tezal I 503B - $194,000 (Pending)
  "24-2325",  // Bahia del Tezal I 605B - $289,000 (Withdrawn)
  "24-804",   // Solaria E-102 - $625,000 (Withdrawn)
  "25-4323",  // Lumaria C-414 - $749,000 (Withdrawn)
];

// Fallback data if API fails
const originalMyListings = [
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
    price: "$289,000",
    title: "Bahia del Tezal #605B",
    location: "Cabo Corridor, BCS",
    beds: 2,
    baths: 2,
    sqft: "986 sq ft",
    mlsNumber: "24-2325",
    link: "https://www.flexmls.com/share/D1Cl1/Bahia-del-Tezal-I-605B-Cabo-Corridor-",
  },
  {
    id: 3,
    image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1762121628/20240220004726875249000000-o_vnrw0g.jpg",
    price: "$389,000",
    title: "Solaria E-102",
    location: "Cabo Corridor",
    beds: 2,
    baths: 2,
    sqft: "2,551 sq ft",
    mlsNumber: "24-804",
    link: "https://www.flexmls.com/share/D1Clv/Solaria-E-102-Cabo-Corridor-",
  },
  {
    id: 4,
    image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1762121874/20240502181138791362000000-o_thhaws.jpg",
    price: "$389,000",
    title: "Solaria 2 Bed w/Pool, Bonus",
    location: "Cabo Corridor",
    beds: 2,
    baths: 2,
    sqft: "2,551 sq ft",
    mlsNumber: "24-2165",
    link: "https://www.flexmls.com/share/D1CpK/Solaria-2-Bed-w-Pool-Bonus-C-104-Cabo-Corridor-",
  },
  {
    id: 5,
    image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1762122034/20230303214614152294000000-o_qmucg4.jpg",
    price: "$995,000",
    title: "Casa DE Los Suenos",
    location: "Cabo Corridor BCS",
    beds: 5,
    baths: 5,
    sqft: "0 sq ft",
    mlsNumber: "23-3132",
    link: "https://www.flexmls.com/share/D1Crp/Casa-DE-Los-Suenos-A-25-Fray-Junipero-Serra-Cabo-Corridor-",
  },
];

// ==================== END: LISTINGS DATA ====================

// ==================== START: TESTIMONIALS DATA ====================

const testimonials = [
  {
    name: "Gregory & Patricia Hamilton",
    text: "Bob's expertise in high-yield investments is exceptional. His $35M+ sales track record and deep market knowledge helped us find the perfect investment property in Cabo.",
    rating: 5
  },
  {
    name: "Charles Bennett",
    text: "Working with Bob was outstanding. His transparency, precision, and strong negotiation skills made our investment process seamless. A true top producer!",
    rating: 5
  },
  {
    name: "Michelle & Daniel Rogers",
    text: "Bob guided us through every stage with professionalism and trust. His understanding of Cabo's investment landscape is unmatched. Highly recommend!",
    rating: 5
  }
];

// ==================== END: TESTIMONIALS DATA ====================

// ==================== START: MAIN COMPONENT ====================

const BobLandingPage = () => {
  const { toast } = useToast();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showMyListings, setShowMyListings] = useState(false);
  const [myListings, setMyListings] = useState(originalMyListings);
  const [featuredListings, setFeaturedListings] = useState([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);
  const [isLoadingMyListings, setIsLoadingMyListings] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  // ==================== START: LOAD FEATURED LISTINGS ====================
  useEffect(() => {
    const loadFeaturedListings = async () => {
      // Only load when on Featured tab
      if (showMyListings) return;
      
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
          city: 'Cabo San Lucas',
        });
        
        console.log('✅ Fetched listings for Featured:', mlsData.length);
        
        const convertedListings = mlsData.map(convertMLSToPropertyCard);
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
        setFeaturedListings(originalMyListings);
      } finally {
        setIsLoadingFeatured(false);
      }
    };

    loadFeaturedListings();
  }, [showMyListings, toast]);
  // ==================== END: LOAD FEATURED LISTINGS ====================

  // ==================== START: LOAD MY LISTINGS FROM API ====================
  useEffect(() => {
    const loadMyListings = async () => {
      if (!showMyListings) return;
      
      setIsLoadingMyListings(true);
      
      try {
        const cacheKey = `${agent.slug}-my-listings-api-data`;
        const cacheTimeKey = `${cacheKey}-time`;
        const cached = localStorage.getItem(cacheKey);
        const cachedTime = localStorage.getItem(cacheTimeKey);
        
        const now = Date.now();
        const threeHours = 3 * 60 * 60 * 1000;
        
        // Check cache first
        if (cached && cachedTime && (now - parseInt(cachedTime)) < threeHours) {
          const cachedData = JSON.parse(cached);
          setMyListings(cachedData);
          setIsLoadingMyListings(false);
          return;
        }
        
        // Fetch all listings from API (only once)
        const mlsData = await fetchListings({
          city: 'Cabo San Lucas',
        });
        
        console.log('✅ Fetched listings for My Listings:', mlsData.length);
        
        // Filter and sort by our MLS numbers (maintains exact order)
        const orderedListings = myListingMLSNumbers
          .map(mlsNumber => {
            // Try to find by ListingId or MlsNumber field
            const listing = mlsData.find(item => 
              item.ListingId === mlsNumber || 
              item.MlsNumber === mlsNumber ||
              item.mlsNumber === mlsNumber
            );
            
            if (!listing) {
              console.warn(`⚠️ MLS ${mlsNumber} not found in API results`);
              return null;
            }
            
            return convertMLSToPropertyCard(listing);
          })
          .filter(Boolean); // Remove any null values if MLS not found
        
        console.log('✅ Matched listings:', orderedListings.length, 'out of', myListingMLSNumbers.length);
        
        // Use fetched data if we got results, otherwise fallback
        const finalListings = orderedListings.length > 0 ? orderedListings : originalMyListings;
        
        // Cache the results
        try {
          localStorage.setItem(cacheKey, JSON.stringify(finalListings));
          localStorage.setItem(cacheTimeKey, now.toString());
        } catch (e) {
          console.error('Error caching my listings:', e);
        }
        
        setMyListings(finalListings);
      } catch (error) {
        console.error('Failed to load my listings from API:', error);
        // Fallback to static data
        setMyListings(originalMyListings);
      } finally {
        setIsLoadingMyListings(false);
      }
    };

    loadMyListings();
  }, [showMyListings]);
  // ==================== END: LOAD MY LISTINGS FROM API ====================

  // ==================== START: RESET PAGE ON TAB SWITCH ====================
  useEffect(() => {
    setCurrentPage(1);
  }, [showMyListings]);
  // ==================== END: RESET PAGE ON TAB SWITCH ====================

  // ==================== START: PAGINATION LOGIC ====================
  // IMPORTANT: My Listings maintain exact order (no shuffling)
  // Featured Listings get shuffled (handled in useEffect above)
  const allListings = showMyListings ? myListings : featuredListings;
  const totalPages = Math.ceil(allListings.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const displayedListings = allListings.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    document.querySelector('.listings-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Smart pagination: show max 7 page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage <= 3) {
        // Near beginning: show 1,2,3,4,...,last
        pages.push(2, 3, 4);
        pages.push('ellipsis-end');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near end: show 1,...,last-3,last-2,last-1,last
        pages.push('ellipsis-start');
        pages.push(totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        // Middle: show 1,...,current-1,current,current+1,...,last
        pages.push('ellipsis-start');
        pages.push(currentPage - 1, currentPage, currentPage + 1);
        pages.push('ellipsis-end');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };
  // ==================== END: PAGINATION LOGIC ====================

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ==================== START: WHATSAPP FLOATING BUTTON ==================== */}
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
      {/* ==================== END: WHATSAPP FLOATING BUTTON ==================== */}

      {/* ==================== START: HERO SECTION ==================== */}
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
      {/* ==================== END: HERO SECTION ==================== */}

      {/* ==================== START: ABOUT SECTION ==================== */}
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
      {/* ==================== END: ABOUT SECTION ==================== */}

      {/* ==================== START: LISTINGS SECTION ==================== */}
      <section className="listings-section py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <p className="uppercase tracking-wider mb-2 font-medium" style={{ color: '#d4af37' }}>
              {showMyListings ? `Featured by ${agent.name.split(' ')[0]}` : 'Office Listings'}
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
                My Listings ({myListingMLSNumbers.length})
              </Button>
              <Button
                variant={!showMyListings ? "luxury" : "outline"}
                onClick={() => setShowMyListings(false)}
              >
                Featured {!isLoadingFeatured && `(${featuredListings.length})`}
              </Button>
            </div>
          </div>

          {(isLoadingFeatured && !showMyListings) || (isLoadingMyListings && showMyListings) ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin mb-4" style={{ color: '#102f74' }} />
              <p className="text-lg text-muted-foreground">
                {showMyListings ? 'Loading my listings from FlexMLS...' : 'Loading featured properties from FlexMLS...'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                {displayedListings.map((property) => (
                  <PropertyCard key={property.id} {...property} />
                ))}
              </div>

              {displayedListings.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">No listings available at this time.</p>
                </div>
              )}

              {/* ==================== START: PAGINATION ==================== */}
              {totalPages > 1 && (
                <div className="flex flex-col items-center gap-4 my-8">
                  {/* Page Info */}
                  <div className="text-sm text-muted-foreground">
                    Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, allListings.length)} of {allListings.length} properties
                  </div>
                  
                  {/* Pagination Controls */}
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
                          onClick={() => handlePageChange(page)}
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
              {/* ==================== END: PAGINATION ==================== */}
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
      {/* ==================== END: LISTINGS SECTION ==================== */}

      {/* ==================== START: TESTIMONIALS SECTION ==================== */}
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
      {/* ==================== END: TESTIMONIALS SECTION ==================== */}

      {/* ==================== START: CONTACT SECTION ==================== */}
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
      {/* ==================== END: CONTACT SECTION ==================== */}

      <Footer />
    </div>
  );
};

export default BobLandingPage;
// ==================== END: MAIN COMPONENT ====================