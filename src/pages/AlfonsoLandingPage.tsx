import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, Award, Home, Users, CheckCircle, Loader2, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Helper function to format phone number for WhatsApp (removes all non-digits)
const getWhatsAppNumber = (phone) => {
  return phone.replace(/[^0-9]/g, '');
};

// Helper function to create WhatsApp link with pre-filled message
const getWhatsAppLink = (phone, agentName) => {
  const number = getWhatsAppNumber(phone);
  const message = encodeURIComponent(`Hi ${agentName}, I'm interested in Cabo real estate properties. Can you help me?`);
  return `https://wa.me/${number}?text=${message}`;
};

// Alfonso Puente - Baja International Realty Agent
const agent = {
  id: 3,
  name: "Alfonso Puente",
  title: "Sales Manager & Commercial Real Estate Expert",
  specialization: "Real Estate Developments & Market Analysis",
  image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761580623/WhatsApp_Image_2025-10-27_at_8.55.37_AM_uytmga.jpg",
  phone: "+52 664 188 8681",
  email: "alfonso@bircabo.com",
  yearsExperience: 18,
  propertiesSold: 890,
  bio: "Alfonso is a sales manager with a proven track record of leading high-performing commercial teams and achieving exceptional closing rates. Specializing in real estate developments in progress and detailed market analysis, Alfonso helps developers reach their investment goals through clear communication, collaboration, and a results-driven approach that consistently delivers outstanding outcomes for investors throughout Baja California Sur.",
  certifications: ["REALTOR®", "CCIM", "CPM", "MLS Member"],
  languages: ["English", "Spanish"],
};

// Featured Listings
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
    name: "Jonathan & Rebecca Miller",
    text: "Alfonso's expertise in commercial real estate and market analysis was invaluable. His leadership and results-driven approach made our investment in Cabo a tremendous success.",
    rating: 5
  },
  {
    name: "Marcus Davidson",
    text: "Working with Alfonso was exceptional. His 18 years of experience and track record of 200+ closings speak for themselves. A true professional who delivers results!",
    rating: 5
  },
  {
    name: "Susan & Richard Torres",
    text: "Alfonso's detailed market analysis and clear communication gave us complete confidence in our development investment. His expertise is unmatched in Baja California Sur.",
    rating: 5
  }
];

const AlfonsoLandingPage = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    propertyInterest: "",
    inquiryType: "general",
    propertyType: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare data for both API endpoints
      const timestamp = new Date().toISOString();
      
      // Try primary agent inquiry endpoint first
      const agentInquiryData = {
        ...formData,
        agent: "alfonso-puente",
        agentId: agent.id,
        agentName: agent.name,
        agentEmail: agent.email,
        source: "agent-landing-page",
        timestamp: timestamp
      };

      let primarySuccess = false;
      
      try {
        const primaryResponse = await fetch('/api/contact/agent-inquiry', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(agentInquiryData)
        });

        if (primaryResponse.ok) {
          primarySuccess = true;
          console.log('✅ Primary API (agent-inquiry) successful');
        }
      } catch (primaryError) {
        console.log('Primary API failed, will try backup:', primaryError.message);
      }

      // Try backup general contact endpoint
      const generalContactData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        inquiryType: formData.inquiryType || "general",
        propertyType: formData.propertyType || "",
        preferredAgent: agent.name,
        agentEmail: agent.email
      };

      let backupSuccess = false;

      try {
        const backupResponse = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(generalContactData)
        });

        if (backupResponse.ok) {
          backupSuccess = true;
          console.log('✅ Backup API (general contact) successful');
        }
      } catch (backupError) {
        console.log('Backup API also failed:', backupError.message);
      }

      // Check if at least one API succeeded
      if (primarySuccess || backupSuccess) {
        toast({
          title: "Message Sent Successfully!",
          description: `Alfonso will contact you within 24 hours at ${formData.email}`,
        });

        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          message: "",
          propertyInterest: "",
          inquiryType: "general",
          propertyType: ""
        });

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error('Both API endpoints failed');
      }

    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error Sending Message",
        description: `Please call Alfonso directly at ${agent.phone} or email ${agent.email}`,
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
        aria-label="Contact Alfonso via WhatsApp"
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
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                {/* Phone Call Button */}
                <Button 
                  variant="default"
                  size="lg"
                  asChild
                  style={{ backgroundColor: '#102f74', color: 'white' }}
                  className="hover:opacity-90 w-full sm:w-auto"
                >
                  <a href={`tel:${agent.phone}`}>
                    <Phone className="mr-2 h-5 w-5" />
                    Call Now
                  </a>
                </Button>

                {/* Email/Form Button */}
                <Button 
                  variant="outline" 
                  size="lg"
                  style={{ borderColor: '#102f74', color: '#102f74' }}
                  className="bg-transparent hover:bg-[#102f74] hover:text-white w-full sm:w-auto"
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
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">About Alfonso</h2>
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
            <p className="uppercase tracking-wider mb-2 font-medium" style={{ color: '#d4af37' }}>Featured by Alfonso</p>
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

      {/* Contact Section - New Client Form */}
      <section id="contact-form" className="py-20" style={{ backgroundColor: '#102f74', color: 'white' }}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
              <p className="text-xl mb-8" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                Fill out our New Client Form and I will personally reach out to discuss your property goals.
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
                  <div className="text-sm font-medium" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Call Alfonso</div>
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
                  <div className="text-sm font-medium" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Email Alfonso</div>
                  <div className="text-lg font-bold text-white break-all">{agent.email}</div>
                </div>
              </a>
            </div>

            {/* New Client Form CTA */}
            <div className="bg-white rounded-2xl p-8 md:p-12 text-center shadow-2xl">
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-900 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Complete Our New Client Form</h3>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                  Share your property preferences, investment goals, and timeline with Alfonso. This helps us provide you with the most relevant listings and personalized service.
                </p>
              </div>

              <Link to="/agents/alfonso/new-client">
                <Button 
                  size="lg"
                  className="h-16 px-12 text-lg font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                  style={{ backgroundColor: '#102f74', color: 'white' }}
                >
                  📋 Fill Out New Client Form
                </Button>
              </Link>

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

export default AlfonsoLandingPage;