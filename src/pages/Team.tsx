import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import AgentBioCard from "@/components/AgentBioCard";
import { Button } from "@/components/ui/button";

const Team = () => {
  const navigate = useNavigate();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const agents = [
    {
      id: 1,
      name: "Michael Chen",
      title: "Senior Real Estate Advisor",
      specialization: "Luxury Waterfront Properties",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1200&fit=crop&crop=faces",
      phone: "+52 612 169 8328",
      email: "michael@bajainternationalrealty.com",
      yearsExperience: 15,
      propertiesSold: 320,
      bio: "Michael specializes in luxury waterfront estates in Cabo San Lucas with over 15 years of experience in high-end real estate. His deep knowledge of Baja California Sur coastal properties and exceptional negotiation skills have earned him recognition as a top producer.",
      certifications: ["REALTOR®", "CRS", "CLHMS"],
      languages: ["English", "Mandarin", "Cantonese", "Spanish"]
    },
    {
      id: 2,
      name: "Sarah Johnson",
      title: "Luxury Property Specialist",
      specialization: "Oceanfront Estates",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=1200&fit=crop&crop=faces",
      phone: "+52 612 169 8328",
      email: "sarah@bajainternationalrealty.com",
      yearsExperience: 12,
      propertiesSold: 280,
      bio: "Sarah's passion for luxury coastal living in Cabo San Lucas and her commitment to client satisfaction have made her one of the most sought-after agents in the region. She specializes in oceanfront estates and investment properties throughout Baja California Sur.",
      certifications: ["REALTOR®", "GRI", "ABR"],
      languages: ["English", "Spanish"]
    },
    {
      id: 3,
      name: "David Martinez",
      title: "Commercial Real Estate Expert",
      specialization: "Commercial & Investment",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&h=1200&fit=crop&crop=faces",
      phone: "+52 612 169 8328",
      email: "david@bajainternationalrealty.com",
      yearsExperience: 18,
      propertiesSold: 450,
      bio: "With nearly two decades of experience in Cabo San Lucas, David excels in commercial real estate and investment properties. His strategic approach and deep market insights help clients maximize their real estate investments in Baja California Sur.",
      certifications: ["REALTOR®", "CCIM", "CPM"],
      languages: ["English", "Spanish", "Portuguese"]
    },
    {
      id: 4,
      name: "Emily Thompson",
      title: "Residential Specialist",
      specialization: "Family Homes & Condos",
      image: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=800&h=1200&fit=crop&crop=faces",
      phone: "+52 612 169 8328",
      email: "emily@bajainternationalrealty.com",
      yearsExperience: 8,
      propertiesSold: 195,
      bio: "Emily brings enthusiasm and dedication to every transaction in Cabo San Lucas. Specializing in family homes and condominiums, she guides first-time buyers and growing families through the home buying process with care and expertise.",
      certifications: ["REALTOR®", "ABR", "SRS"],
      languages: ["English", "French", "Spanish"]
    },
    {
      id: 5,
      name: "Robert Kim",
      title: "Investment Property Advisor",
      specialization: "Investment & Portfolio",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&h=1200&fit=crop&crop=faces",
      phone: "+52 612 169 8328",
      email: "robert@bajainternationalrealty.com",
      yearsExperience: 20,
      propertiesSold: 510,
      bio: "Robert is a seasoned investor and advisor with two decades of experience helping clients build successful real estate portfolios in Baja California Sur. His analytical approach and market knowledge deliver exceptional results.",
      certifications: ["REALTOR®", "CCIM", "CRS"],
      languages: ["English", "Korean", "Japanese", "Spanish"]
    },
    {
      id: 6,
      name: "Jessica Rodriguez",
      title: "Luxury Condo Specialist",
      specialization: "High-Rise & Penthouses",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&h=1200&fit=crop&crop=faces",
      phone: "+52 612 169 8328",
      email: "jessica@bajainternationalrealty.com",
      yearsExperience: 10,
      propertiesSold: 240,
      bio: "Jessica's expertise in luxury high-rise condominiums and penthouses in Cabo San Lucas, combined with her exceptional marketing skills, consistently delivers outstanding results for her clients in the competitive urban luxury market.",
      certifications: ["REALTOR®", "CLHMS", "GRI"],
      languages: ["English", "Spanish"]
    }
  ];

  const handleViewBio = (agentId: number) => {
    console.log('handleViewBio called with agentId:', agentId);
    const agent = agents.find(a => a.id === agentId);
    console.log('Found agent:', agent?.name);
    
    try {
      // Navigate to individual agent detail page
      navigate(`/team/${agentId}`);
      console.log('Navigation triggered to:', `/team/${agentId}`);
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to window.location if navigate fails
      window.location.href = `/team/${agentId}`;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <FloatingContact />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-primary via-primary-dark to-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            Meet Our Team
          </h1>
          <p className="text-xl max-w-3xl mx-auto text-primary-foreground/90">
            Our experienced team of real estate professionals is dedicated to helping you find your dream property in Cabo San Lucas. 
            With decades of combined experience, we provide unparalleled expertise in Baja California Sur luxury real estate.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-secondary border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-accent mb-2">85</div>
              <div className="text-sm text-muted-foreground">Years Combined<br />Experience</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-accent mb-2">2,200+</div>
              <div className="text-sm text-muted-foreground">Properties<br />Sold</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-accent mb-2">100%</div>
              <div className="text-sm text-muted-foreground">Committed to<br />Our Clients</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-accent mb-2">$800M+</div>
              <div className="text-sm text-muted-foreground">Combined Sales<br />Since 2014</div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-4">Our Expert Advisors</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Each member of our team brings unique expertise and a commitment to exceptional service in Cabo San Lucas
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {agents.map((agent) => (
                <AgentBioCard
                  key={agent.id}
                  name={agent.name}
                  title={agent.title}
                  image={agent.image}
                  phone={agent.phone}
                  email={agent.email}
                  specialization={agent.specialization}
                  propertiesSold={agent.propertiesSold}
                  yearsExperience={agent.yearsExperience}
                  onViewBio={() => handleViewBio(agent.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-gradient-to-br from-accent via-accent-dark to-accent text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Work With Us?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Let us help you find your dream property in Cabo San Lucas or sell your current home for the best possible price.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="hero" 
              size="lg"
              onClick={() => window.location.href = '/contact'}
            >
              Contact Our Team
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="bg-white/10 hover:bg-white/20 border-white text-white"
              onClick={() => window.location.href = '/properties'}
            >
              View Properties
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Team;