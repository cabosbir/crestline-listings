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

// Cristy Cavazos - Baja International Realty Agent
const agent = {
  id: 6,
  name: "Cristy Cavazos",
  title: "Luxury Condo Specialist",
  specialization: "High-Rise & Penthouses",
  image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761588682/a-soft-natural-light-portrait-photograph_2oZCo8O8TSWRNzgLxLaLew_-RP-wvPgSnKeu7bWvJ_y8A_bknfmc.jpg",
  phone: "+52 624 178 0825",
  email: "Cristina.cavazos@grupoveq.com",
  yearsExperience: 11,
  propertiesSold: 108,
  bio: "I'm Cristy a Cabo San Lucas real estate expert specializing in luxury and coastal properties. I excel in selling land, high-rise condominiums, and oceanfront penthouses, combining deep market knowledge with exceptional marketing and negotiation skills. I'm passionate about connecting clients with the finest homes and investment opportunities in Cabo, delivering a seamless, personalized experience that reflects their lifestyle and goals.",
  certifications: ["REALTOR®", "CLHMS", "GRI", "MLS Member"],
  languages: ["English", "Spanish"],
};

// Cristy's Featured Listings
const agentListings = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
    price: "$3,850,000",
    title: "Oceanfront Penthouse Suite",
    location: "Marina District, Cabo San Lucas",
    beds: 3,
    baths: 4,
    sqft: "3,800 sq ft",
    mlsNumber: "25-4912",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop",
    price: "$2,950,000",
    title: "Luxury High-Rise Residence",
    location: "Golden Zone, San Jose",
    beds: 2,
    baths: 3,
    sqft: "2,600 sq ft",
    mlsNumber: "25-4823",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop",
    price: "$4,200,000",
    title: "Beachfront Tower Penthouse",
    location: "Medano Beach, Cabo San Lucas",
    beds: 4,
    baths: 4,
    sqft: "4,200 sq ft",
    mlsNumber: "25-4734",
  },
];

// Client Testimonials
const testimonials = [
  {
    name: "John & Elizabeth Morgan",
    text: "Cristy's expertise in luxury condos is unmatched! She helped us find the perfect penthouse with stunning ocean views. Her professionalism and market knowledge made the entire process seamless.",
    rating: 5
  },
  {
    name: "Michael Anderson",
    text: "Working with Cristy was exceptional. Her understanding of high-rise properties and investment opportunities helped me make the right decision. I highly recommend her services!",
    rating: 5
  },
  {
    name: "Sandra & Carlos Jimenez",
    text: "Cristy went above and beyond to find us our dream oceanfront condo. Her attention to detail and dedication to client satisfaction is remarkable. We couldn't be happier!",
    rating: 5
  }
];

const CristyLandingPage = () => {
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
      agent: "cristy-cavazos",
      agentId: agent.id,
      source: "agent-landing-page",
      timestamp: new Date().toISOString()
    };

    console.log(`Lead submitted for ${agent.name}:`, leadData);

    toast({
      title: "Message Sent!",
      description: "Cristy will contact you within 24 hours.",
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
                    Call Cristy Now
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
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">About Cristy</h2>
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
            <p className="uppercase tracking-wider mb-2 font-medium" style={{ color: '#d4af37' }}>Featured by Cristy</p>
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
                <Button type="submit" variant="luxury" size="lg" className="w-full">
                  Send Message to Cristy
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  By submitting, you agree to be contacted by Cristy Cavazos regarding your real estate inquiry.
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

export default CristyLandingPage;
