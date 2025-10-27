import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import AgentBioCard from "@/components/AgentBioCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Team = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const agentsPerPage = 6;

  const agents = [
    // PAGE 1 - Agents 1-6
    {
      id: 1,
      name: "Bob Van Patten",
      title: "Senior Real Estate Advisor",
      specialization: "Luxury Waterfront Properties",
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761524592/work-photo-2025-10-27-1761524048537_jnodyu.png",
      phone: "+52 624 127 6012",
      email: "robertvanpatten2@gmail.com",
      yearsExperience: 15,
      propertiesSold: 120,
      bio: "Bob specializes in luxury waterfront estates in Cabo San Lucas with over 15 years of experience in high-end real estate. His deep knowledge of Baja California Sur coastal properties and exceptional negotiation skills have earned him recognition as a top producer.",
      certifications: ["REALTOR®", "CRS", "CLHMS"],
      languages: ["English"]
    },
    {
      id: 2,
      name: "Erika Aispuro",
      title: "Luxury Property Specialist",
      specialization: "Oceanfront Estates",
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761528481/a-captivating-portrait-photograph-of-a-w_0i-UNv-eRnmu4VfpJsjInw_16HhuJljQfipqcXBRpW7Yw_mu9rbs.jpg",
      phone: "+52 624 109 7909",
      email: "Erika80@gmail.com",
      yearsExperience: 12,
      propertiesSold: 180,
      bio: "Erika's passion for luxury coastal living in Cabo San Lucas and her commitment to client satisfaction have made her one of the most sought-after agents in the region. She specializes in oceanfront estates and investment properties throughout Baja California Sur.",
      certifications: ["REALTOR®", "GRI", "ABR"],
      languages: ["English", "Spanish"]
    },
    {
      id: 3,
      name: "Alfonso Puente",
      title: "Commercial Real Estate Expert",
      specialization: "Commercial & Investment",
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761580623/WhatsApp_Image_2025-10-27_at_8.55.37_AM_uytmga.jpg",
      phone: "+52 624 188 8681",
      email: "alfonso@bircabo.com",
      yearsExperience: 18,
      propertiesSold: 205,
      bio: "With nearly two decades of experience in Cabo San Lucas, Alfonso excels in commercial real estate and investment properties. His strategic approach and deep market insights help clients maximize their real estate investments in Baja California Sur.",
      certifications: ["REALTOR®", "CCIM", "CPM"],
      languages: ["English", "Spanish"]
    },
    {
      id: 4,
      name: "Cozbi Sanchez",
      title: "Residential Specialist",
      specialization: "Family Homes & Condos",
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761529186/a-cinematic-portrait-photograph-of-a-wom_SYAgJzHOSaipBDiMYgqKLQ_l77_oUgEScSHf-1PFYhhAw_ct10gu.jpg",
      phone: "+52 624 118 9512",
      email: "Cozbi@bajainternationalrealty.com",
      yearsExperience: 8,
      propertiesSold: 105,
      bio: "Cozbi brings enthusiasm and dedication to every transaction in Cabo San Lucas. Specializing in family homes and condominiums, she guides first-time buyers and growing families through the home buying process with care and expertise.",
      certifications: ["REALTOR®", "ABR", "SRS"],
      languages: ["English", "Spanish"]
    },
    {
      id: 5,
      name: "Hector Mendoza",
      title: "Investment Property Advisor",
      specialization: "Investment & Portfolio",
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761582971/a-meticulously-crafted-portrait-photogra_mYQPdq9WQSWo-pvakiW_Yw_xsfP9GCST6CP-VnQtn3QSA_sybk55.jpg",
      phone: "+52 624 211 4879",
      email: "Hector@bajainternationalrealty.com",
      yearsExperience: 20,
      propertiesSold: 110,
      bio: "Hector is a seasoned investor and advisor with two decades of experience helping clients build successful real estate portfolios in Baja California Sur. His analytical approach and market knowledge deliver exceptional results.",
      certifications: ["REALTOR®", "CCIM", "CRS"],
      languages: ["English", "Spanish"]
    },
    {
      id: 6,
      name: "Cristy Cavazos",
      title: "Luxury Condo Specialist",
      specialization: "High-Rise & Penthouses",
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761588682/a-soft-natural-light-portrait-photograph_2oZCo8O8TSWRNzgLxLaLew_-RP-wvPgSnKeu7bWvJ_y8A_bknfmc.jpg",
      phone: "+52 624 178 0825",
      email: "Cristina.cavazos@grupoveq.com",
      yearsExperience: 10,
      propertiesSold: 240,
      bio: "Cristy's expertise in luxury high-rise condominiums and penthouses in Cabo San Lucas, combined with her exceptional marketing skills, consistently delivers outstanding results for her clients in the competitive urban luxury market.",
      certifications: ["REALTOR®", "CLHMS", "GRI"],
      languages: ["English", "Spanish"]
    },
    
    // PAGE 2 - Agents 7-12
    {
      id: 7,
      name: "Marisol Tort",
      title: "Real Estate Advisor",
      specialization: "Luxury Properties",
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761589425/489957143_122217993950221664_2036920343588971268_n_okhyf0.jpg",
      phone: "+52 624 264 3896",
      email: "mtortricardi@gmail.com",
      yearsExperience: 10,
      propertiesSold: 150,
      bio: "Marisol is an experienced real estate professional that brings dedication and expertise to every transaction in Cabo San Lucas. With a focus on client satisfaction and market knowledge, they help buyers and sellers achieve their real estate goals in Baja California Sur.",
      certifications: ["REALTOR®"],
      languages: ["English", "Spanish"]
    },
    {
      id: 8,
      name: "David Scott Piper",
      title: "Real Estate Advisor",
      specialization: "Luxury Properties",
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761590660/a-striking-studio-portrait-photograph-sh_XdBa8GIeSvu_EtlSaFtR3A_YErgX-IPT12aFV0KdYhrCw_tbcm32.jpg",
      phone: "+52 624 317 0297",
      email: "David@bajainternationalrealty.com",
      yearsExperience: 10,
      propertiesSold: 105,
      bio: "David is a seasoned investor and advisor with a decade of experience helping clients build successful real estate portfolios in Baja California Sur. His analytical approach and comprehensive market knowledge deliver exceptional results for investors seeking to maximize returns in the Cabo San Lucas luxury real estate market.",
      certifications: ["REALTOR®"],
      languages: ["English", "Spanish"]
    },
    {
      id: 9,
      name: "Zuzu Vieira",
      title: "Real Estate Advisor",
      specialization: "Luxury Properties",
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761593547/a-professional-studio-portrait-of-a-dist_3jguKwSiQZKYvX4c2UJkHg_UK7-M6V_Seq1iMZi4MEd-A_ubffdu.jpg",
      phone: "+1 808 226 6120",
      email: "Zuzu@bajainternationalrealty.com",
      yearsExperience: 10,
      propertiesSold: 150,
      bio: "Agent bio to be added...",
      certifications: ["REALTOR®"],
      languages: ["English", "Spanish"]
    },
    {
      id: 10,
      name: "Edgar Pacheco",
      title: "Real Estate & IT Advisor",
      specialization: "Luxury Properties",
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761591979/a-cinematic-portrait-photograph-of-a-man_7-TWoWUzTw2XtfR9N7flMg_TuXG-6x-QFu5RRhXBvCQWg_xetche.jpg",
      phone: "+52 612 169 8328",
      email: "Edgar@bajainternationalrealty.com",
      yearsExperience: 2,
      propertiesSold: 15,
      bio: "Agent bio to be added...",
      certifications: ["REALTOR®"],
      languages: ["English", "Spanish"]
    },
    {
      id: 11,
      name: "Agent 11 Name",
      title: "Real Estate Advisor",
      specialization: "Luxury Properties",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1200&fit=crop&crop=faces",
      phone: "+52 612 169 8328",
      email: "agent11@bajainternationalrealty.com",
      yearsExperience: 10,
      propertiesSold: 150,
      bio: "Agent bio to be added...",
      certifications: ["REALTOR®"],
      languages: ["English", "Spanish"]
    },
    {
      id: 12,
      name: "Don Weis",
      title: "Real Estate Broker",
      specialization: "Luxury Properties",
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761595234/a-striking-professional-portrait-photogr_l5VA-wc2QNShw3oqxpo-sw_EVxaU0fVTGmOEm-axYtq1Q_lmi7ch.jpg",
      phone: "+52 624 129 6245",
      email: "DonWeis@bajainternationalrealty.com",
      yearsExperience: 30,
      propertiesSold: 300,
      bio: "Agent bio to be added...",
      certifications: ["REALTOR®"],
      languages: ["English", "Spanish"]
    },
    
    // PAGE 3 - Agents 13-14
    {
      id: 13,
      name: "Agent 13 Name",
      title: "Real Estate Advisor",
      specialization: "Luxury Properties",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1200&fit=crop&crop=faces",
      phone: "+52 624 XXX XXXX",
      email: "agent13@bajainternationalrealty.com",
      yearsExperience: 10,
      propertiesSold: 150,
      bio: "Agent bio to be added. This experienced real estate professional brings dedication and expertise to every transaction in Cabo San Lucas. With a focus on client satisfaction and market knowledge, they help buyers and sellers achieve their real estate goals in Baja California Sur.",
      certifications: ["REALTOR®"],
      languages: ["English", "Spanish"]
    },
    {
      id: 14,
      name: "Agent 14 Name",
      title: "Real Estate Advisor",
      specialization: "Luxury Properties",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=1200&fit=crop&crop=faces",
      phone: "+52 624 XXX XXXX",
      email: "agent14@bajainternationalrealty.com",
      yearsExperience: 10,
      propertiesSold: 150,
      bio: "Agent bio to be added. This experienced real estate professional brings dedication and expertise to every transaction in Cabo San Lucas. With a focus on client satisfaction and market knowledge, they help buyers and sellers achieve their real estate goals in Baja California Sur.",
      certifications: ["REALTOR®"],
      languages: ["English", "Spanish"]
    },
  ];

  // Calculate pagination
  const totalPages = Math.ceil(agents.length / agentsPerPage);
  const indexOfLastAgent = currentPage * agentsPerPage;
  const indexOfFirstAgent = indexOfLastAgent - agentsPerPage;
  const currentAgents = agents.slice(indexOfFirstAgent, indexOfLastAgent);

  const handleViewBio = (agentId: number) => {
    console.log('handleViewBio called with agentId:', agentId);
    const agent = agents.find(a => a.id === agentId);
    console.log('Found agent:', agent?.name);
    
    try {
      navigate(`/team/${agentId}`);
      console.log('Navigation triggered to:', `/team/${agentId}`);
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = `/team/${agentId}`;
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
              <p className="text-sm text-muted-foreground mt-4">
                Showing {indexOfFirstAgent + 1}-{Math.min(indexOfLastAgent, agents.length)} of {agents.length} agents
              </p>
            </div>

            {/* Agents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {currentAgents.map((agent) => (
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

            {/* Horizontal Navigation Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-6 mt-12">
                {/* Previous Button */}
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handlePrevious}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 min-w-[140px]"
                >
                  <ChevronLeft className="h-5 w-5" />
                  Previous
                </Button>

                {/* Page Indicator */}
                <div className="flex items-center gap-2 px-6 py-3 bg-secondary rounded-lg border">
                  <span className="text-sm text-muted-foreground">Page</span>
                  <span className="text-2xl font-bold text-accent">{currentPage}</span>
                  <span className="text-sm text-muted-foreground">of {totalPages}</span>
                </div>

                {/* Next Button */}
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 min-w-[140px]"
                >
                  Next
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            )}

            {/* Optional: Progress Bar */}
            <div className="mt-8 max-w-md mx-auto">
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-accent to-accent-dark transition-all duration-300 ease-out"
                  style={{ width: `${(currentPage / totalPages) * 100}%` }}
                />
              </div>
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