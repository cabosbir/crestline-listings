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
     specialization: "High Yield Investment Properties",
     image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761524592/work-photo-2025-10-27-1761524048537_jnodyu.png",
     phone: "+52 624 127 6012",
     email: "robertvanpatten2@gmail.com",
     yearsExperience: 9,
     propertiesSold: 85,
     bio: "Bob specializes in high yield investment properties with 9 years of experience in Mexico, having sold 85 properties with total sales of $35 million. His deep knowledge of investment opportunities and exceptional negotiation skills have earned him recognition as a top producer in the Cabo San Lucas market.",
     certifications: ["MLS Member"],
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
      yearsExperience: 8,
      propertiesSold: 60,
      bio: "Erika's passion for luxury coastal living in Cabo San Lucas and her commitment to client satisfaction have made her one of the most sought-after agents in the region. She specializes in oceanfront estates and investment properties throughout Baja California Sur, providing comprehensive market analysis and personalized service to every client.",
      certifications: ["REALTOR®", "GRI", "ABR", "MLS Member"],
      languages: ["English", "Spanish"]
    },
    {
     id: 3,
     name: "Alfonso Puente",
     title: "Sales Manager & Commercial Real Estate Expert",
     specialization: "Real Estate Developments & Market Analysis",
     image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761580623/WhatsApp_Image_2025-10-27_at_8.55.37_AM_uytmga.jpg",
     phone: "+52 624 188 8681",
     email: "alfonso@bircabo.com",
     yearsExperience: 18,
     propertiesSold: 205,
     bio: "Alfonso is a sales manager with a strong track record of leading large commercial teams and achieving high closing rates. He specializes in real estate developments in progress and market analysis to help clients achieve expected success. His leadership is based on clear communication, collaborative work, and a results-oriented vision that consistently delivers exceptional outcomes for investors in Baja California Sur.",
     certifications: ["REALTOR®", "CCIM", "CPM", "MLS Member"],
     languages: ["English", "Spanish"]
    },
    {
      id: 4,
      name: "Cozbi Sanchez",
      title: "Residential Specialist",
      specialization: "Family Homes & Condos",
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761612891/WhatsApp_Image_2025-10-27_at_5.53.29_PM_dz7y0g.jpg",
      phone: "+52 624 118 9512",
      email: "Cozbi@bajainternationalrealty.com",
      yearsExperience: 8,
      propertiesSold: 105,
      bio: "Cozbi brings enthusiasm and dedication to every transaction in Cabo San Lucas. Specializing in family homes and condominiums, she guides first-time buyers and growing families through the home buying process with care and expertise. Her warm approach and attention to detail ensure a smooth experience for all her clients.",
      certifications: ["REALTOR®", "ABR", "SRS", "MLS Member"],
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
      yearsExperience: 2,
      propertiesSold: 12,
      bio: "Real estate in Mexico should feel exciting, not overwhelming. I take pride in making every transaction simple, personal, and rewarding. With my background in numbers and market knowledge, I help clients see that buying a home is often better than keeping money in the bank, it’s an investment that grows in value and brings lasting satisfaction. From our first conversation to handing you the keys, I’ll be by your side with clear communication, data driven insight, and honest guidance to help you invest with confidence.",
      certifications: ["REALTOR®", "CCIM", "CRS", "MLS Member"],
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
      yearsExperience: 11,
      propertiesSold: 108,
      bio: "I’m Cristy a Cabo San Lucas real estate expert specializing in luxury and coastal properties. I excel in selling land, high-rise condominiums, and oceanfront penthouses, combining deep market knowledge with exceptional marketing and negotiation skills. I’m passionate about connecting clients with the finest homes and investment opportunities in Cabo, delivering a seamless, personalized experience that reflects their lifestyle and goals.",
      certifications: ["REALTOR®", "CLHMS", "GRI", "MLS Member"],
      languages: ["English", "Spanish"]
    },
    
    // PAGE 2 - Agents 7-12 (TODO: Fill in these 6 agents)
    {
      id: 7,
      name: "Marisol Tort", // TODO: Fill in
      title: "Real Estate Advisor", // TODO: Fill in
      specialization: "Luxury Properties", // TODO: Fill in
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761668403/WhatsApp_Image_2025-10-27_at_9.24.29_PM_uajiar.jpg", // TODO: Replace with Cloudinary
      phone: "+52 624 264 3896", // TODO: Fill in
      email: "mtortricardi@gmail.com", // TODO: Fill in
      yearsExperience: 6, // TODO: Fill in
      propertiesSold: 50, // TODO: Fill in
      bio: "As a trusted real estate advisor in Cabo San Lucas, Marisol specializes in identifying profitable investment and luxury property opportunities. Her data-driven approach and sharp negotiation skills give clients an edge in one of Mexico’s most desirable markets. Investors turn to Marisol for guidance, confidence, and results that make every deal count.", // TODO: Fill in
      certifications: ["REALTOR®", "MLS Member"], // TODO: Fill in
      languages: ["English", "Spanish"] // TODO: Fill in
    },
    {
     id: 8,
     name: "David Scott Piper",
     title: "International Real Estate Specialist",
     specialization: "Resort & Second-Home Properties",
     image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761614075/WhatsApp_Image_2025-10-27_at_6.09.43_PM_neaig7.jpg",
     phone: "+52 624 317 0297",
     email: "David@BIRCabo.com",
     yearsExperience: 25,
     propertiesSold: +50,
     bio: "David has over 25 years of experience in the real estate industry, working in many aspects of the business throughout his distinguished career. Licensed in both California and Mexico, his analytical approach and comprehensive market knowledge deliver exceptional results in the Cabo San Lucas luxury real estate market. As a Certified International Property Specialist (C.I.P.S.®), Accredited Buyer's Representative (A.B.R.®), and Resort and Second-Home Property Specialist (R.S.P.S.®), David brings unparalleled expertise to every transaction. As David states: 'As an Ironman triathlete and marathon runner, you can be sure I will go the extra mile for you.'",
     certifications: ["REALTOR®", "NAR® Member", "C.I.P.S.®", "A.B.R.®", "R.S.P.S.®", "MLS Member"],
     languages: ["English"]
   },
    {
      id: 9,
      name: "Zuzu Vieira", // TODO: Fill in
      title: "Real Estate Advisor", // TODO: Fill in
      specialization: "Luxury Properties", // TODO: Fill in
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761593547/a-professional-studio-portrait-of-a-dist_3jguKwSiQZKYvX4c2UJkHg_UK7-M6V_Seq1iMZi4MEd-A_ubffdu.jpg", // TODO: Replace with Cloudinary
      phone: "+1 808 226 6120", // TODO: Fill in
      email: "Zuzubajainternationalrealty.com", // TODO: Fill in
      yearsExperience: 11, // TODO: Fill in
      propertiesSold: 101, // TODO: Fill in
      bio: "Agent bio to be added. This experienced real estate professional brings dedication and expertise to every transaction in Cabo San Lucas. With a focus on client satisfaction and market knowledge, they help buyers and sellers achieve their real estate goals in Baja California Sur.", // TODO: Fill in
      certifications: ["REALTOR®", "MLS Member"], // TODO: Fill in
      languages: ["English", "Spanish"] // TODO: Fill in
    },
    {
      id: 10,
      name: "Edgar Pacheco", // TODO: Fill in
      title: "Real Estate & IT Advisor", // TODO: Fill in
      specialization: "Luxury Properties", // TODO: Fill in
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761598127/a-professional-studio-portrait-photograp_dnE69CqgQwKMvDj_boYW5A_sWO9IE8FSuKtnjTWshya2g_lvnjuh.jpg", // TODO: Replace with Cloudinary
      phone: "+52 612 169 8328", // TODO: Fill in
      email: "Edgar@bajainternationalrealty.com", // TODO: Fill in
      yearsExperience: 1, // TODO: Fill in
      propertiesSold: 4, // TODO: Fill in
      bio: "Looking to invest in Cabo San Lucas? Edgar is your insider advantage. With a unique blend of analytical precision and real estate expertise developed under industry veteran Bob Van Patten, he transforms complex market data into clear investment opportunities. Edgar has pioneered innovative digital platforms that give his clients unprecedented transparency into property values, market trends, and investment potential across Cabo and Baja California Sur. His approach is simple: arm you with the knowledge, insights, and local connections you need to invest confidently in paradise.", // TODO: Fill in
      certifications: ["REALTOR®", "MLS Member"], // TODO: Fill in
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
      name: "Don Weis", // TODO: Fill in
      title: "Real Estate Broker", // TODO: Fill in
      specialization: "Luxury Properties", // TODO: Fill in
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761604421/a-professional-portrait-photograph-of-a-_c8sIFPSGQYO0TQlApBAfFQ__16y8I8XSnO06Y6Tixti-Q_o4nhst.jpg", // TODO: Replace with Cloudinary
      phone: "+52 624 129 6245", // TODO: Fill in
      email: "Don@bajainternationalrealty.com", // TODO: Fill in
      yearsExperience: 30, // TODO: Fill in
      propertiesSold: 300, // TODO: Fill in
      bio: "Agent bio to be added. This experienced real estate professional brings dedication and expertise to every transaction in Cabo San Lucas. With a focus on client satisfaction and market knowledge, they help buyers and sellers achieve their real estate goals in Baja California Sur.", // TODO: Fill in
      certifications: ["REALTOR®", "MLS Member"], // TODO: Fill in
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
                      Credentials
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