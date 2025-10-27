import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Award, Home, TrendingUp, Users, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Bob Van Patten's data
const agent = {
  id: 1,
  name: "Bob Van Patten",
  title: "Senior Real Estate Advisor",
  specialization: "Luxury Waterfront Properties",
  image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761524592/work-photo-2025-10-27-1761524048537_jnodyu.png",
  phone: "+52 624 127 6012",
  email: "robertvanpatten2@gmail.com",
  yearsExperience: 15,
  propertiesSold: 120,
  bio: "Bob specializes in luxury waterfront estates in Cabo San Lucas with over 15 years of experience in high-end real estate. His deep knowledge of Baja California Sur coastal properties and exceptional negotiation skills have earned him recognition as a top producer in the luxury market.",
  certifications: ["REALTOR®", "CRS", "CLHMS"],
  languages: ["English", "Spanish"],
  socialMedia: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    linkedin: "https://linkedin.com"
  }
};

// Sample listings - These would come from your properties database filtered by agent
const bobsListings = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop",
    price: "$2,850,000",
    title: "Oceanfront Villa Paradise",
    location: "Marina District",
    beds: 5,
    baths: 4,
    sqft: "4,500 sq ft",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop",
    price: "$3,200,000",
    title: "Beachfront Estate",
    location: "Tourist Corridor",
    beds: 4,
    baths: 3,
    sqft: "3,800 sq ft",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
    price: "$4,500,000",
    title: "Luxury Waterfront Penthouse",
    location: "Marina",
    beds: 3,
    baths: 3,
    sqft: "3,200 sq ft",
  },
];

const testimonials = [
  {
    name: "John & Mary Smith",
    text: "Bob helped us find our dream beachfront property in Cabo. His knowledge of the market and attention to detail made the entire process smooth and enjoyable.",
    rating: 5
  },
  {
    name: "David Chen",
    text: "Working with Bob was exceptional. He understood exactly what we were looking for and negotiated a great deal on our villa. Highly recommend!",
    rating: 5
  },
  {
    name: "Sarah Johnson",
    text: "Bob's expertise in luxury waterfront properties is unmatched. He guided us through every step and we couldn't be happier with our investment.",
    rating: 5
  }
];

const BobLandingPage = () => {
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
    
    // This would send to your backend with agent attribution
    const leadData = {
      ...formData,
      agent: "bob-van-patten",
      agentId: 1,
      source: "agent-landing-page",
      timestamp: new Date().toISOString()
    };

    console.log("Lead submitted for Bob:", leadData);

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

      {/* Hero Section - Agent Introduction */}
      <section className="relative pt-24 pb-16 bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left: Agent Photo */}
            <div className="order-2 lg:order-1">
              <img 
                src={agent.image}
                alt={agent.name}
                className="w-full max-w-md mx-auto rounded-2xl shadow-2xl"
              />
            </div>

            {/* Right: Agent Info */}
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <p className="text-accent text-lg mb-2 font-medium">Your Luxury Real Estate Expert</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                {agent.name}
              </h1>
              <p className="text-xl md:text-2xl text-primary-foreground/90 mb-6">
                {agent.title}
              </p>
              <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto lg:mx-0">
                Specializing in {agent.specialization}
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto lg:mx-0">
                <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-accent">{agent.yearsExperience}</div>
                  <div className="text-sm text-primary-foreground/80">Years Experience</div>
                </div>
                <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-accent">{agent.propertiesSold}+</div>
                  <div className="text-sm text-primary-foreground/80">Properties Sold</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  variant="hero" 
                  size="lg"
                  asChild
                >
                  <a href={`tel:${agent.phone}`}>
                    <Phone className="mr-2 h-5 w-5" />
                    Call Now
                  </a>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
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
                <Award className="h-12 w-12 text-accent mx-auto mb-4" />
                <h3 className="font-bold mb-2">Certifications</h3>
                <div className="space-y-1">
                  {agent.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4 text-accent" />
                      <span className="text-sm text-muted-foreground">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div className="text-center">
                <Users className="h-12 w-12 text-accent mx-auto mb-4" />
                <h3 className="font-bold mb-2">Languages</h3>
                <div className="space-y-1">
                  {agent.languages.map((lang, index) => (
                    <div key={index} className="text-sm text-muted-foreground">{lang}</div>
                  ))}
                </div>
              </div>

              {/* Expertise */}
              <div className="text-center">
                <Home className="h-12 w-12 text-accent mx-auto mb-4" />
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
            <p className="text-accent uppercase tracking-wider mb-2 font-medium">Featured by Bob</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">My Current Listings</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore exclusive properties I'm currently representing in Cabo San Lucas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {bobsListings.map((property) => (
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
                    <span key={i} className="text-accent text-xl">★</span>
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
      <section id="contact-form" className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Get In Touch</h2>
              <p className="text-primary-foreground/80 text-lg">
                Ready to find your dream property? Let's start the conversation.
              </p>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <a 
                href={`tel:${agent.phone}`}
                className="flex items-center gap-3 bg-primary-foreground/10 backdrop-blur-sm p-4 rounded-lg hover:bg-primary-foreground/20 transition-colors"
              >
                <Phone className="h-6 w-6 text-accent" />
                <div>
                  <div className="text-sm text-primary-foreground/70">Phone</div>
                  <div className="font-semibold">{agent.phone}</div>
                </div>
              </a>
              <a 
                href={`mailto:${agent.email}`}
                className="flex items-center gap-3 bg-primary-foreground/10 backdrop-blur-sm p-4 rounded-lg hover:bg-primary-foreground/20 transition-colors"
              >
                <Mail className="h-6 w-6 text-accent" />
                <div>
                  <div className="text-sm text-primary-foreground/70">Email</div>
                  <div className="font-semibold break-all">{agent.email}</div>
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
