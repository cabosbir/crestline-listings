import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, Award, Home, Users, CheckCircle, MessageCircle } from "lucide-react";
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

// Edgar Pacheco - Baja International Realty Agent
const agent = {
  id: 10,
  name: "Edgar Pacheco",
  title: "Real Estate Advisor",
  specialization: "Luxury Properties",
  image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761598127/a-professional-studio-portrait-photograp_dnE69CqgQwKMvDj_boYW5A_sWO9IE8FSuKtnjTWshya2g_lvnjuh.jpg",
  phone: "+52 612 169 8328",
  email: "Edgar@BIRCabo.com",
  yearsExperience: 1,
  propertiesSold: 4,
  bio: "Looking to invest in Cabo San Lucas? I'm your insider advantage. With a unique blend of analytical precision and real estate expertise developed under the guidance of industry veteran Bob Van Patten, I transform complex market data into clear, actionable investment opportunities. I've pioneered innovative digital platforms that give my clients unmatched transparency into property values, market trends, and investment potential across Cabo and Baja California Sur. My approach is simple: I empower you with the knowledge, insights, and local connections you need to invest confidently and smart in paradise.",
  certifications: ["REALTOR®", "MLS Member"],
  languages: ["English", "Spanish"],
};

// Edgar's Featured Listings
const agentListings = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop",
    price: "$5,750,000",
    title: "Exclusive Estate Investment",
    location: "Pedregal, Cabo San Lucas",
    beds: 6,
    baths: 7,
    sqft: "7,200 sq ft",
    mlsNumber: "25-5134",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
    price: "$4,200,000",
    title: "Luxury Portfolio Property",
    location: "Cabo Corridor",
    beds: 5,
    baths: 5,
    sqft: "5,500 sq ft",
    mlsNumber: "25-5045",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&h=600&fit=crop",
    price: "$6,500,000",
    title: "Premier Investment Villa",
    location: "Palmilla, San Jose del Cabo",
    beds: 7,
    baths: 8,
    sqft: "8,500 sq ft",
    mlsNumber: "25-5178",
  },
];

// Client Testimonials
const testimonials = [
  {
    name: "Andrew & Michelle Carter",
    text: "Edgar's analytical approach and innovative digital tools gave us complete confidence in our investment. His market insights are exceptional and his guidance was invaluable.",
    rating: 5
  },
  {
    name: "James Morrison",
    text: "Working with Edgar was refreshing. His tech-savvy approach combined with deep local knowledge made finding the perfect property seamless. Highly recommend!",
    rating: 5
  },
  {
    name: "Laura & David Richardson",
    text: "Edgar's transparency and data-driven insights set him apart. He empowered us with the knowledge we needed to make smart investment decisions in Cabo.",
    rating: 5
  }
];

const EdgarLandingPage = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    propertyInterest: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Prepare data with timestamp
    const timestamp = new Date().toISOString();
    
    // Data for agent-inquiry endpoint (Edgar's specific system)
    const agentInquiryData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      message: formData.message,
      propertyInterest: formData.propertyInterest,
      agentName: agent.name,
      agentEmail: agent.email,
      agentId: agent.id,
      agent: "edgar-pacheco",
      source: "edgar-pacheco-landing-page",
      timestamp: timestamp
    };

    // Data for general contact endpoint (Office system)
    const contactData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      message: formData.message,
      inquiryType: "general",
      propertyType: formData.propertyInterest || "luxury-property",
      preferredAgent: agent.name,
      agentEmail: agent.email
    };

    try {
      // Send to both endpoints simultaneously for redundancy
      const [agentResponse, contactResponse] = await Promise.allSettled([
        fetch('/api/contact/agent-inquiry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(agentInquiryData)
        }),
        fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contactData)
        })
      ]);

      // Check if at least one succeeded
      const agentSuccess = agentResponse.status === 'fulfilled' && agentResponse.value.ok;
      const contactSuccess = contactResponse.status === 'fulfilled' && contactResponse.value.ok;

      if (agentSuccess || contactSuccess) {
        toast({
          title: "Message Sent Successfully!",
          description: "Edgar will contact you within 24 hours. Check your email for confirmation.",
        });

        // Reset form on success
        setFormData({
          name: "",
          email: "",
          phone: "",
          message: "",
          propertyInterest: ""
        });

        // Log success for debugging
        console.log('✅ Lead submitted successfully for Edgar Pacheco');
        if (agentSuccess && contactSuccess) {
          console.log('   Both systems confirmed delivery');
        } else if (agentSuccess) {
          console.log('   Agent system confirmed (Contact system failed)');
        } else {
          console.log('   Contact system confirmed (Agent system failed)');
        }
      } else {
        throw new Error('Both email systems failed to deliver');
      }

      // Log any partial failures
      if (!agentSuccess && agentResponse.status === 'fulfilled') {
        console.warn('⚠️ Agent inquiry endpoint failed:', agentResponse.value.statusText);
      }
      if (!contactSuccess && contactResponse.status === 'fulfilled') {
        console.warn('⚠️ Contact endpoint failed:', contactResponse.value.statusText);
      }

    } catch (error) {
      console.error('❌ Form submission error:', error);
      toast({
        title: "Unable to Send Message",
        description: `Please call Edgar directly at ${agent.phone} or email ${agent.email}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
        aria-label="Contact Edgar via WhatsApp"
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
                    Call Edgar Now
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
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">About Edgar</h2>
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

      {/* Current Listings */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="uppercase tracking-wider mb-2 font-medium" style={{ color: '#d4af37' }}>Featured by Edgar</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">My Current Listings</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore exclusive properties I'm currently representing in Cabo San Lucas
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
                    className="h-12"
                  />
                  <Input
                    type="tel"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    disabled={isSubmitting}
                    className="h-12"
                  />
                </div>
                <div>
                  <Input
                    placeholder="Property Interest (e.g., 3-bed beachfront villa)"
                    value={formData.propertyInterest}
                    onChange={(e) => setFormData({...formData, propertyInterest: e.target.value})}
                    disabled={isSubmitting}
                    className="h-12"
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Your Message *"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    required
                    disabled={isSubmitting}
                    rows={5}
                  />
                </div>
                <Button 
                  type="submit" 
                  variant="luxury" 
                  size="lg" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message to Edgar'}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  By submitting, you agree to be contacted by Edgar Pacheco regarding your real estate inquiry.
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

export default EdgarLandingPage;