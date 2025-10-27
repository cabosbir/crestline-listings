import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Award, Globe, ArrowLeft, Home } from "lucide-react";

const AgentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Aggressive scroll to top when page loads
  useEffect(() => {
    // Method 1: Immediate scroll
    window.scrollTo(0, 0);
    
    // Method 2: Document scroll
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
    
    // Method 3: After render
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 0);
    
    // Method 4: After all content loads
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 100);
  }, [id]);

  // Agent data - MUST MATCH Team.tsx exactly
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
      bio: "Bob specializes in luxury waterfront estates in Cabo San Lucas with over 15 years of experience in high-end real estate. His deep knowledge of Baja California Sur coastal properties and exceptional negotiation skills have earned him recognition as a top producer. He has successfully closed deals worth over $150M and has been consistently ranked as a top performer in the luxury real estate market.",
      certifications: ["REALTOR®", "CRS", "CLHMS"],
      languages: ["English"]
    },
    {
      id: 2,
      name: "Erika Johnson",
      title: "Luxury Property Specialist",
      specialization: "Oceanfront Estates",
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761528481/a-captivating-portrait-photograph-of-a-w_0i-UNv-eRnmu4VfpJsjInw_16HhuJljQfipqcXBRpW7Yw_mu9rbs.jpg",
      phone: "+52 612 169 8328",
      email: "Erika@bajainternationalrealty.com",
      yearsExperience: 12,
      propertiesSold: 180,
      bio: "Erika's passion for luxury coastal living in Cabo San Lucas and her commitment to client satisfaction have made her one of the most sought-after agents in the region. She specializes in oceanfront estates and investment properties throughout Baja California Sur, providing comprehensive market analysis and personalized service to every client.",
      certifications: ["REALTOR®", "GRI", "ABR"],
      languages: ["English", "Spanish"]
    },
    {
      id: 3,
      name: "Alfonso Puente",
      title: "Commercial Real Estate Expert",
      specialization: "Commercial & Investment",
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761527627/a-professional-studio-portrait-of-a-man-_S6bglg3cQJWT-QOkKh1KJA_v9luvyZPR_enll2ChvpwPg_yaa5rv.jpg",
      phone: "+52 624 188 8681",
      email: "alfonso@bircabo.com",
      yearsExperience: 18,
      propertiesSold: 205,
      bio: "With nearly two decades of experience in Cabo San Lucas, Alfonso excels in commercial real estate and investment properties. His strategic approach and deep market insights help clients maximize their real estate investments in Baja California Sur and build successful portfolios.",
      certifications: ["REALTOR®", "CCIM", "CPM"],
      languages: ["English", "Spanish"]
    },
    {
      id: 4,
      name: "Cozbi Sanchez",
      title: "Residential Specialist",
      specialization: "Family Homes & Condos",
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761529186/a-cinematic-portrait-photograph-of-a-wom_SYAgJzHOSaipBDiMYgqKLQ_l77_oUgEScSHf-1PFYhhAw_ct10gu.jpg",
      phone: "+52 612 169 8328",
      email: "Cozbi@bajainternationalrealty.com",
      yearsExperience: 8,
      propertiesSold: 105,
      bio: "Cozbi brings enthusiasm and dedication to every transaction in Cabo San Lucas. Specializing in family homes and condominiums, she guides first-time buyers and growing families through the home buying process with care and expertise. Her warm approach and attention to detail ensure a smooth experience for all her clients.",
      certifications: ["REALTOR®", "ABR", "SRS"],
      languages: ["English", "Spanish"]
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
      bio: "Robert is a seasoned investor and advisor with two decades of experience helping clients build successful real estate portfolios in Baja California Sur. His analytical approach and comprehensive market knowledge deliver exceptional results for investors seeking to maximize returns in the Cabo San Lucas luxury real estate market.",
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
      bio: "Jessica's expertise in luxury high-rise condominiums and penthouses in Cabo San Lucas, combined with her exceptional marketing skills, consistently delivers outstanding results for her clients in the competitive urban luxury market. Her network and negotiation prowess ensure the best deals for buyers and sellers alike.",
      certifications: ["REALTOR®", "CLHMS", "GRI"],
      languages: ["English", "Spanish"]
    },
    
    // PAGE 2 - Agents 7-12 (TODO: Fill in these 6 agents)
    {
      id: 7,
      name: "Agent 7 Name", // TODO: Fill in
      title: "Real Estate Advisor", // TODO: Fill in
      specialization: "Luxury Properties", // TODO: Fill in
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1200&fit=crop&crop=faces", // TODO: Replace with Cloudinary
      phone: "+52 612 169 8328", // TODO: Fill in
      email: "agent7@bajainternationalrealty.com", // TODO: Fill in
      yearsExperience: 10, // TODO: Fill in
      propertiesSold: 150, // TODO: Fill in
      bio: "Agent bio to be added. This experienced real estate professional brings dedication and expertise to every transaction in Cabo San Lucas. With a focus on client satisfaction and market knowledge, they help buyers and sellers achieve their real estate goals in Baja California Sur.", // TODO: Fill in
      certifications: ["REALTOR®"], // TODO: Fill in
      languages: ["English", "Spanish"] // TODO: Fill in
    },
    {
      id: 8,
      name: "Agent 8 Name", // TODO: Fill in
      title: "Real Estate Advisor", // TODO: Fill in
      specialization: "Luxury Properties", // TODO: Fill in
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&h=1200&fit=crop&crop=faces", // TODO: Replace with Cloudinary
      phone: "+52 612 169 8328", // TODO: Fill in
      email: "agent8@bajainternationalrealty.com", // TODO: Fill in
      yearsExperience: 10, // TODO: Fill in
      propertiesSold: 150, // TODO: Fill in
      bio: "Agent bio to be added. This experienced real estate professional brings dedication and expertise to every transaction in Cabo San Lucas. With a focus on client satisfaction and market knowledge, they help buyers and sellers achieve their real estate goals in Baja California Sur.", // TODO: Fill in
      certifications: ["REALTOR®"], // TODO: Fill in
      languages: ["English", "Spanish"] // TODO: Fill in
    },
    {
      id: 9,
      name: "Agent 9 Name", // TODO: Fill in
      title: "Real Estate Advisor", // TODO: Fill in
      specialization: "Luxury Properties", // TODO: Fill in
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=1200&fit=crop&crop=faces", // TODO: Replace with Cloudinary
      phone: "+52 612 169 8328", // TODO: Fill in
      email: "agent9@bajainternationalrealty.com", // TODO: Fill in
      yearsExperience: 10, // TODO: Fill in
      propertiesSold: 150, // TODO: Fill in
      bio: "Agent bio to be added. This experienced real estate professional brings dedication and expertise to every transaction in Cabo San Lucas. With a focus on client satisfaction and market knowledge, they help buyers and sellers achieve their real estate goals in Baja California Sur.", // TODO: Fill in
      certifications: ["REALTOR®"], // TODO: Fill in
      languages: ["English", "Spanish"] // TODO: Fill in
    },
    {
      id: 10,
      name: "Agent 10 Name", // TODO: Fill in
      title: "Real Estate Advisor", // TODO: Fill in
      specialization: "Luxury Properties", // TODO: Fill in
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=1200&fit=crop&crop=faces", // TODO: Replace with Cloudinary
      phone: "+52 612 169 8328", // TODO: Fill in
      email: "agent10@bajainternationalrealty.com", // TODO: Fill in
      yearsExperience: 10, // TODO: Fill in
      propertiesSold: 150, // TODO: Fill in
      bio: "Agent bio to be added. This experienced real estate professional brings dedication and expertise to every transaction in Cabo San Lucas. With a focus on client satisfaction and market knowledge, they help buyers and sellers achieve their real estate goals in Baja California Sur.", // TODO: Fill in
      certifications: ["REALTOR®"], // TODO: Fill in
      languages: ["English", "Spanish"] // TODO: Fill in
    },
    {
      id: 11,
      name: "Agent 11 Name", // TODO: Fill in
      title: "Real Estate Advisor", // TODO: Fill in
      specialization: "Luxury Properties", // TODO: Fill in
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1200&fit=crop&crop=faces", // TODO: Replace with Cloudinary
      phone: "+52 612 169 8328", // TODO: Fill in
      email: "agent11@bajainternationalrealty.com", // TODO: Fill in
      yearsExperience: 10, // TODO: Fill in
      propertiesSold: 150, // TODO: Fill in
      bio: "Agent bio to be added. This experienced real estate professional brings dedication and expertise to every transaction in Cabo San Lucas. With a focus on client satisfaction and market knowledge, they help buyers and sellers achieve their real estate goals in Baja California Sur.", // TODO: Fill in
      certifications: ["REALTOR®"], // TODO: Fill in
      languages: ["English", "Spanish"] // TODO: Fill in
    },
    {
      id: 12,
      name: "Agent 12 Name", // TODO: Fill in
      title: "Real Estate Advisor", // TODO: Fill in
      specialization: "Luxury Properties", // TODO: Fill in
      image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=800&h=1200&fit=crop&crop=faces", // TODO: Replace with Cloudinary
      phone: "+52 612 169 8328", // TODO: Fill in
      email: "agent12@bajainternationalrealty.com", // TODO: Fill in
      yearsExperience: 10, // TODO: Fill in
      propertiesSold: 150, // TODO: Fill in
      bio: "Agent bio to be added. This experienced real estate professional brings dedication and expertise to every transaction in Cabo San Lucas. With a focus on client satisfaction and market knowledge, they help buyers and sellers achieve their real estate goals in Baja California Sur.", // TODO: Fill in
      certifications: ["REALTOR®"], // TODO: Fill in
      languages: ["English", "Spanish"] // TODO: Fill in
    },
  ];

  const agent = agents.find(a => a.id === parseInt(id || "0"));

  if (!agent) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Agent Not Found</h1>
            <p className="text-muted-foreground mb-6">The agent you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/team')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Team
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <FloatingContact />

      {/* Back Button */}
      <div className="container mx-auto px-4 pt-32">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/team')}
          className="mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Team
        </Button>
      </div>

      {/* Hero Section with Agent Info */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-5 gap-12 items-start">
              {/* Agent Photo */}
              <div className="md:col-span-2">
                <div className="sticky top-32">
                  <img 
                    src={agent.image}
                    alt={agent.name}
                    className="w-full h-[600px] object-cover rounded-2xl shadow-2xl"
                  />
                  
                  {/* Quick Contact Card */}
                  <div className="mt-6 bg-gradient-to-br from-primary to-primary-dark text-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold mb-4">Contact {agent.name.split(' ')[0]}</h3>
                    <div className="space-y-3">
                      <a 
                        href={`tel:${agent.phone}`}
                        className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <Phone className="w-5 h-5" />
                        <span>{agent.phone}</span>
                      </a>
                      <a 
                        href={`mailto:${agent.email}`}
                        className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <Mail className="w-5 h-5" />
                        <span className="text-sm">{agent.email}</span>
                      </a>
                    </div>
                    <Button 
                      className="w-full mt-4 bg-white text-primary hover:bg-gray-100"
                      onClick={() => navigate('/contact')}
                    >
                      Schedule Consultation
                    </Button>
                  </div>
                </div>
              </div>

              {/* Agent Details */}
              <div className="md:col-span-3">
                <div className="mb-8">
                  <h1 className="text-5xl font-bold mb-3">{agent.name}</h1>
                  <p className="text-2xl text-muted-foreground mb-4">{agent.title}</p>
                  
                  <div className="flex items-center gap-3 text-accent mb-6">
                    <Award className="w-6 h-6" />
                    <span className="text-lg font-semibold">{agent.specialization}</span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-secondary border border-border rounded-xl p-6 text-center">
                      <div className="text-5xl font-bold text-accent mb-2">{agent.yearsExperience}</div>
                      <div className="text-sm text-muted-foreground">Years Experience</div>
                    </div>
                    <div className="bg-secondary border border-border rounded-xl p-6 text-center">
                      <div className="text-5xl font-bold text-accent mb-2">{agent.propertiesSold}+</div>
                      <div className="text-sm text-muted-foreground">Properties Sold</div>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="mb-8">
                  <h2 className="text-3xl font-bold mb-4">About {agent.name.split(' ')[0]}</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {agent.bio}
                  </p>
                </div>

                {/* Expertise Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {/* Certifications */}
                  <div className="bg-secondary border border-border rounded-xl p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-accent" />
                      Certifications
                    </h3>
                    <ul className="space-y-2">
                      {agent.certifications.map((cert, index) => (
                        <li key={index} className="flex items-center gap-2 text-muted-foreground">
                          <div className="w-2 h-2 bg-accent rounded-full"></div>
                          <span>{cert}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Languages */}
                  <div className="bg-secondary border border-border rounded-xl p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-accent" />
                      Languages
                    </h3>
                    <ul className="space-y-2">
                      {agent.languages.map((lang, index) => (
                        <li key={index} className="flex items-center gap-2 text-muted-foreground">
                          <div className="w-2 h-2 bg-accent rounded-full"></div>
                          <span>{lang}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-br from-accent to-accent-dark text-white rounded-2xl p-8">
                  <h3 className="text-3xl font-bold mb-3">Ready to Get Started?</h3>
                  <p className="text-lg mb-6 opacity-90">
                    Work with {agent.name.split(' ')[0]} to find your dream property or sell your home for the best price.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      size="lg"
                      className="flex-1 bg-white text-accent hover:bg-gray-100"
                      onClick={() => navigate('/contact')}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Get in Touch
                    </Button>
                    <Button 
                      size="lg"
                      variant="outline"
                      className="flex-1 border-white text-white hover:bg-white/10"
                      onClick={() => navigate('/properties')}
                    >
                      <Home className="w-4 h-4 mr-2" />
                      View Properties
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AgentDetail;