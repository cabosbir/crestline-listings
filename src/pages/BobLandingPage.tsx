import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, Award, Home, Users, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Bob Van Patten - Baja International Realty Agent
const agent = {
  id: 1,
  name: "Bob Van Patten",
  title: "Senior Real Estate Advisor",
  specialization: "High Yield Investment Properties",
  image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761524592/work-photo-2025-10-27-1761524048537_jnodyu.png",
  phone: "+52 624 127 6012",
  email: "robertvanpatten2@gmail.com",
  yearsExperience: 9,
  propertiesSold: 85,
  bio: "With nine years of real estate experience in Mexico, I specialize in high-yield investment properties and have successfully sold over 85 properties, totaling more than $35 million in sales. My deep understanding of Cabo San Lucas's investment landscape and strong negotiation skills have earned me recognition as a top producer in the market. I'm passionate about helping clients identify profitable opportunities and guiding them through every stage of the investment process with transparency, precision, and trust.",
  certifications: ["MLS Member"],
  languages: ["English"],
};

// Bob's Featured Listings
const agentListings = [
  {
    id: 1,
    image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1762121002/20251017233106344278000000-o_mkittq.jpg",
    price: "$279,000",
    title: "Marina Cabo Plaza",
    location: "Paseo de la Marina, Cabo San Lucas",
    beds: 0,
    baths: 1,
    sqft: "422 sq ft",
    mlsNumber: "MLS# 103A",
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
    mlsNumber: "MLS# 24-2325",
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
    mlsNumber: "MLS# 24-2165",
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
    mlsNumber: "MLS# 24-2165",
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
    mlsNumber: "MLS# 23-3132",
    link: "https://www.flexmls.com/share/D1Crp/Casa-DE-Los-Suenos-A-25-Fray-Junipero-Serra-Cabo-Corridor-",
  },
];

// Client Testimonials
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

const BobLandingPage = () => {
  const { toast } = useToast();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    propertyInterest: ""
  });

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 400;
      const newScrollLeft = direction === 'left' 
        ? carouselRef.current.scrollLeft - scrollAmount
        : carouselRef.current.scrollLeft + scrollAmount;
      
      carouselRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Lead data with agent attribution
    const leadData = {
      ...formData,
      agent: "bob-van-patten",
      agentId: agent.id,
      source: "agent-landing-page",
      timestamp: new Date().toISOString()
    };

    console.log(`Lead submitted for ${agent.name}:`, leadData);

    toast({
      title: "Message Sent!",
      description: "Bob will contact you within 24 hours.",
    });

    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      message: "",
      propertyInterest: ""
    });
  };

  return (
    <div className="min-h-screen">
      <Navbar />

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
                    Call Bob Now
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
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">About Bob</h2>
            <p className="text-lg text-muted-foreground text-center mb-12 leading-relaxed">
              {agent.bio}
            </p>

            {/* Credentials */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

      {/* Current Listings - Scrollable Carousel */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="uppercase tracking-wider mb-2 font-medium" style={{ color: '#d4af37' }}>Featured by Bob</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">My Current Listings</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore exclusive properties I'm currently representing in Cabo San Lucas
            </p>
          </div>

          <div className="relative max-w-7xl mx-auto">
            {/* Navigation Buttons */}
            <button
              onClick={() => scrollCarousel('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors -ml-4 hidden md:block"
              style={{ border: '2px solid #102f74' }}
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-6 w-6" style={{ color: '#102f74' }} />
            </button>
            
            <button
              onClick={() => scrollCarousel('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors -mr-4 hidden md:block"
              style={{ border: '2px solid #102f74' }}
              aria-label="Scroll right"
            >
              <ChevronRight className="h-6 w-6" style={{ color: '#102f74' }} />
            </button>

            {/* Carousel Container */}
            <div 
              ref={carouselRef}
              className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory"
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              <style>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              {agentListings.map((property) => (
                <div key={property.id} className="flex-shrink-0 w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] snap-start">
                  <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow h-full flex flex-col">
                    <div className="relative h-64 overflow-hidden">
                      <img 
                        src={property.image} 
                        alt={property.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-semibold" style={{ color: '#102f74' }}>
                        {property.price}
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-xl font-bold mb-2" style={{ color: '#102f74' }}>{property.title}</h3>
                      <p className="text-muted-foreground mb-4">{property.location}</p>
                      <div className="flex gap-4 mb-4 text-sm text-muted-foreground">
                        <span>{property.beds} {property.beds === 1 ? 'Bed' : 'Beds'}</span>
                        <span>•</span>
                        <span>{property.baths} {property.baths === 1 ? 'Bath' : 'Baths'}</span>
                        <span>•</span>
                        <span>{property.sqft}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{property.mlsNumber}</p>
                      <div className="mt-auto">
                        <Button 
                          asChild 
                          className="w-full"
                          style={{ backgroundColor: '#102f74', color: 'white' }}
                        >
                          <a href={property.link} target="_blank" rel="noopener noreferrer">
                            View Property
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-8">
            <Link to="/properties">
              <Button size="lg" style={{ backgroundColor: '#d4af37', color: '#102f74' }} className="hover:opacity-90">
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

      {/* Contact Form */}
      <section id="contact-form" className="py-16" style={{ backgroundColor: '#102f74', color: 'white' }}>
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Get In Touch</h2>
              <p className="text-lg" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Ready to find your dream property? Let's start the conversation.
              </p>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <a 
                href={`tel:${agent.phone}`}
                className="flex items-center gap-3 backdrop-blur-sm p-4 rounded-lg transition-colors border-2 border-white/30 hover:border-white/50"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                <Phone className="h-6 w-6" style={{ color: '#d4af37' }} />
                <div>
                  <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Phone</div>
                  <div className="font-semibold text-white">{agent.phone}</div>
                </div>
              </a>
              <a 
                href={`mailto:${agent.email}`}
                className="flex items-center gap-3 backdrop-blur-sm p-4 rounded-lg transition-colors border-2 border-white/30 hover:border-white/50"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                <Mail className="h-6 w-6" style={{ color: '#d4af37' }} />
                <div>
                  <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Email</div>
                  <div className="font-semibold break-all text-white">{agent.email}</div>
                </div>
              </a>
            </div>

            {/* Contact Form */}
            <form onSubmit={handleSubmit} className="bg-background text-foreground p-6 md:p-8 rounded-2xl shadow-2xl">
              <div className="space-y-4">
                <div>
                  <Input
                    placeholder="Your Name *"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="h-12"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="email"
                    placeholder="Email *"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    className="h-12"
                  />
                  <Input
                    type="tel"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="h-12"
                  />
                </div>
                <div>
                  <Input
                    placeholder="Property Interest (e.g., 3-bed beachfront villa)"
                    value={formData.propertyInterest}
                    onChange={(e) => setFormData({...formData, propertyInterest: e.target.value})}
                    className="h-12"
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Your Message *"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    required
                    rows={5}
                  />
                </div>
                <Button type="submit" size="lg" className="w-full" style={{ backgroundColor: '#d4af37', color: '#102f74' }}>
                  Send Message to Bob
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  By submitting, you agree to be contacted by Bob Van Patten regarding your real estate inquiry.
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BobLandingPage;