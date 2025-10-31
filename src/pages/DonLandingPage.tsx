import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, Award, Home, Users, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Don Weis - Founder & Broker of Baja International Realty
const agent = {
  id: 12,
  name: "Don Weis",
  title: "Founder & Broker",
  specialization: "Luxury Properties & Development",
  image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761604421/a-professional-portrait-photograph-of-a-_c8sIFPSGQYO0TQlApBAfFQ__16y8I8XSnO06Y6Tixti-Q_o4nhst.jpg",
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
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop",
    price: "$12,500,000",
    title: "Landmark Development Opportunity",
    location: "Pedregal, Cabo San Lucas",
    beds: 8,
    baths: 10,
    sqft: "12,500 sq ft",
    mlsNumber: "25-6234",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
    price: "$18,750,000",
    title: "Premier Beachfront Estate",
    location: "Medano Beach",
    beds: 10,
    baths: 12,
    sqft: "15,000 sq ft",
    mlsNumber: "25-6178",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&h=600&fit=crop",
    price: "$25,000,000",
    title: "Exclusive Resort Property",
    location: "Tourist Corridor",
    beds: 12,
    baths: 14,
    sqft: "20,000 sq ft",
    mlsNumber: "25-6312",
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
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    propertyInterest: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Lead data with agent attribution
    const leadData = {
      ...formData,
      agent: "don-weis",
      agentId: agent.id,
      source: "agent-landing-page",
      timestamp: new Date().toISOString()
    };

    console.log(`Lead submitted for ${agent.name}:`, leadData);

    toast({
      title: "Message Sent!",
      description: "Don will contact you within 24 hours.",
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
                    Call Don Now
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
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">About Don</h2>
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
            <p className="uppercase tracking-wider mb-2 font-medium" style={{ color: '#d4af37' }}>Featured by Don</p>
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

      {/* Contact Form */}
      <section id="contact-form" className="py-16" style={{ backgroundColor: '#102f74', color: 'white' }}>
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Get In Touch</h2>
              <p className="text-lg" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Ready to discuss your next investment? Let's start the conversation.
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
                    placeholder="Property Interest (e.g., development opportunity, luxury estate)"
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
                <Button type="submit" variant="luxury" size="lg" className="w-full">
                  Send Message to Don
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  By submitting, you agree to be contacted by Don Weis regarding your real estate inquiry.
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

export default DonLandingPage;
