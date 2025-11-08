import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Award, Home, Users, CheckCircle, MessageCircle, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Helper function to format phone number for WhatsApp (removes all non-digits)
const getWhatsAppNumber = (phone: string) => {
  return phone.replace(/[^0-9]/g, '');
};

// Helper function to create WhatsApp link with pre-filled message
const getWhatsAppLink = (phone: string, agentName: string) => {
  const number = getWhatsAppNumber(phone);
  const message = encodeURIComponent(`Hi ${agentName}, I'm interested in Cabo real estate properties. Can you help me?`);
  return `https://wa.me/${number}?text=${message}`;
};

// Don Weis - Founder & Broker of Baja International Realty
const agent = {
  id: 12,
  slug: "don", // ⭐ IMPORTANT: Change this for each agent
  name: "Don Weis",
  title: "Founder & Broker",
  specialization: "Luxury Properties & Development",
  image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761932929/WhatsApp_Image_2025-10-30_at_10.26.08_AM_cvcznx.jpg",
  phone: "+52 624 143 5555",
  email: "Don@BIRCabo.com",
  yearsExperience: 35,
  propertiesSold: 2200,
  bio: "Born and raised in San Mateo, California, Don Weis was first introduced to Mexico in the late 1980s, where he developed a strong interest in foreign real estate ownership. He founded Pan America Ltd., producing real estate investment seminars under the name Mexico Gold to educate international buyers about opportunities in Mexico. The program's success drew national attention, with features on CNN, ABC's 20/20, and numerous radio and television shows. Don later established Baja International, representing major developers in the Baja Norte region.",
  bio2: "Following several family tragedies, Don returned to San Mateo, where he founded and served as CEO of a successful manufacturing company for 14 years. His enduring passion for Mexico eventually brought him back to Cabo San Lucas, where he took a two-year sabbatical before reentering the real estate industry.",
  bio3: "Don founded his own companies — Land's End Realty of Los Cabos, Baja International Realty, and Baja International Real Estate & Development, a private investment firm. Under his leadership, these firms have brokered numerous landmark transactions, including several multi-million-dollar land acquisitions for major resort developments.",
  bio4: "Notably, Don represented Cabo San Cristobal Resorts, one of the largest planned resort communities in the world, featuring four hotels, multiple golf courses, polo fields, a Formula One racetrack, and Cabo's first world-class yacht club. His firm also managed a complex 75-acre acquisition on Medano Beach for Riu Hotels.",
  bio5: "With more than $250 million USD in personal real estate sales in the Los Cabos market, Don Weis has built a trusted reputation for professionalism, market insight, and results that continue to shape the region's development landscape. Don also founded the very popular Cabo Cantina restaurant/bar in 2007 which is located next-door to BIR office.",
  certifications: ["Real Estate Broker", "International Realtor®", "MLS-BCS Founding Member", "AMPI® Member"],
  languages: ["English", "Spanish"],
};

// Don's Featured Listings
const agentListings = [
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

// Client Testimonials
const testimonials = [
  {
    name: "Resort Development Group",
    text: "Don's expertise in large-scale development transactions is unparalleled. His guidance on our resort project was instrumental to its success. A true visionary in Cabo real estate.",
    rating: 5
  },
  {
    name: "International Investment Partners",
    text: "Working with Don Weis was a masterclass in luxury real estate. His decades of experience and market knowledge made our multi-million dollar acquisition seamless and profitable.",
    rating: 5
  },
  {
    name: "Private Estate Buyer",
    text: "Don's professionalism and reputation in Cabo San Lucas is legendary. He helped us navigate complex transactions with ease. We couldn't have found a better advisor.",
    rating: 5
  }
];

const DonLandingPage = () => {
  const { toast } = useToast();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* 🆕 FLOATING WHATSAPP BUTTON */}
      <a
        href={getWhatsAppLink(agent.phone, agent.name)}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-16 h-16 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-3xl group"
        style={{ backgroundColor: '#25D366' }}
        aria-label={`Contact ${agent.name} via WhatsApp`}
      >
        <MessageCircle className="h-8 w-8 text-white" />
        
        {/* Tooltip */}
        <span className="absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          Chat on WhatsApp
        </span>
        
        {/* Pulse animation */}
        <span className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: '#25D366' }}></span>
      </a>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden" style={{ backgroundColor: 'white' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-white" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Agent Photo */}
            <div className="order-2 lg:order-1">
              <img 
                src={agent.image}
                alt={agent.name}
                className="w-full max-w-md mx-auto rounded-2xl shadow-2xl object-cover"
              />
            </div>

            {/* Agent Info */}
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <p className="text-lg mb-2 font-medium" style={{ color: '#d4af37' }}>Founder & Visionary Leader</p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4" style={{ color: '#102f74' }}>
                {agent.name}
              </h1>
              <p className="text-xl md:text-2xl mb-6" style={{ color: '#666' }}>
                {agent.title}
              </p>
              <p className="text-lg mb-8 max-w-xl mx-auto lg:mx-0" style={{ color: '#666' }}>
                Specializing in {agent.specialization}
              </p>

              {/* Quick Stats */}
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

              {/* CTA Buttons */}
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

      {/* About Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">About {agent.name.split(' ')[0]}</h2>
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>{agent.bio}</p>
              <p>{agent.bio2}</p>
              <p>{agent.bio3}</p>
              <p>{agent.bio4}</p>
              <p>{agent.bio5}</p>
            </div>

            {/* Credentials */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {/* Certifications */}
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

              {/* Languages */}
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto mb-4" style={{ color: '#102f74' }} />
                <h3 className="font-bold mb-2">Languages</h3>
                <div className="space-y-1">
                  {agent.languages.map((lang, index) => (
                    <div key={index} className="text-sm text-muted-foreground">{lang}</div>
                  ))}
                </div>
              </div>

              {/* Expertise */}
              <div className="text-center">
                <Home className="h-12 w-12 mx-auto mb-4" style={{ color: '#102f74' }} />
                <h3 className="font-bold mb-2">Specialization</h3>
                <p className="text-sm text-muted-foreground">{agent.specialization}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Current Listings */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="uppercase tracking-wider mb-2 font-medium" style={{ color: '#d4af37' }}>Featured by {agent.name.split(' ')[0]}</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Landmark Properties</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore exclusive development opportunities and premier estates in Cabo San Lucas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {agentListings.map((property) => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>

          <div className="text-center">
            <Link to="/properties">
              <Button variant="luxury" size="lg">
                View All Properties
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
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

      {/* Contact Section - UPDATED WITH DROPDOWN */}
      <section id="contact-form" className="py-20" style={{ backgroundColor: '#102f74', color: 'white' }}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
              <p className="text-xl mb-8" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                I will personally reach out to discuss your property goals.
              </p>
            </div>

            {/* Contact Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {/* Phone Card */}
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

              {/* Email Card */}
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

            {/* ⭐ NEW: Form Selector with Dropdown */}
            <div className="bg-white rounded-2xl p-8 md:p-12 text-center shadow-2xl">
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-900 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Looking to buy or sell?</h3>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                  Select the right form for your needs and {agent.name.split(' ')[0]} will personally reach out to you.
                </p>
              </div>

              {/* Dropdown Button */}
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

                {/* Dropdown Menu */}
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

export default DonLandingPage;