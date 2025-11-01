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

  // Agent data - ORGANIZED SAME AS Team.tsx
  const agents = [
    {
      id: 12,
      name: "Don Weis",
      title: "Founder & Broker",
      specialization: "Luxury Properties & Development",
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761932929/WhatsApp_Image_2025-10-30_at_10.26.08_AM_cvcznx.jpg",
      phone: "+52 624 143 5555",
      email: "Don@bircabo.com",
      yearsExperience: 35,
      propertiesSold: 2200,
      bio: "Don Weis is the visionary founder and broker of Baja International Realty, pioneering luxury real estate in Cabo San Lucas since the late 1980s...",
      certifications: [
        "Real Estate Broker",
        "International Realtor®",
        "MLS-BCS Founding Member",
        "AMPI® Member"
      ],
      languages: ["English", "Spanish"]
    },
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
      bio: "With nine years of real estate experience in Mexico, I specialize in high-yield investment properties and have successfully sold over 85 properties, totaling more than $35 million in sales. My deep understanding of Cabo San Lucas's investment landscape and strong negotiation skills have earned me recognition as a top producer in the market. I'm passionate about helping clients identify profitable opportunities and guiding them through every stage of the investment process with transparency, precision, and trust.",
      certifications: ["MLS Member"],
      languages: ["English"]
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
      bio: "As a sales manager with a strong track record of leading high-performing commercial teams and achieving exceptional closing rates, I specialize in real estate developments in progress and detailed market analysis to help clients reach their investment goals. My leadership is grounded in clear communication, collaboration, and a results-driven approach that consistently delivers outstanding outcomes for investors throughout Baja California Sur.",
      certifications: ["REALTOR®", "CCIM", "CPM", "MLS Member"],
      languages: ["English", "Spanish"]
    },
    {
      id: 8,
      name: "David Scott Piper",
      title: "International Real Estate Specialist",
      specialization: "Resort & Second-Home Properties",
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761614075/WhatsApp_Image_2025-10-27_at_6.09.43_PM_neaig7.jpg",
      phone: "+52 624 317 0297",
      email: "David@bircabo.com",
      yearsExperience: 25,
      propertiesSold: 50,
      bio: "David has over 25 years of experience in the real estate industry, working in many aspects of the business throughout his distinguished career. Licensed in both California and Mexico, his analytical approach and comprehensive market knowledge deliver exceptional results in the Cabo San Lucas luxury real estate market. As a Certified International Property Specialist (C.I.P.S.®), Accredited Buyer's Representative (A.B.R.®), and Resort and Second-Home Property Specialist (R.S.P.S.®), David brings unparalleled expertise to every transaction. As David states: 'As an Ironman triathlete and marathon runner, you can be sure I will go the extra mile for you.'",
      certifications: ["REALTOR®", "NAR® Member", "C.I.P.S.®", "A.B.R.®", "R.S.P.S.®", "MLS Member"],
      languages: ["English"]
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
      bio: "I'm Cristy a Cabo San Lucas real estate expert specializing in luxury and coastal properties. I excel in selling land, high-rise condominiums, and oceanfront penthouses, combining deep market knowledge with exceptional marketing and negotiation skills. I'm passionate about connecting clients with the finest homes and investment opportunities in Cabo, delivering a seamless, personalized experience that reflects their lifestyle and goals.",
      certifications: ["REALTOR®", "CLHMS", "GRI", "MLS Member"],
      languages: ["English", "Spanish"]
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
      bio: "My passion for luxury coastal living in Cabo San Lucas and my commitment to client satisfaction have made me one of the most sought-after agents in the region. I specialize in oceanfront estates and investment properties throughout Baja California Sur, offering comprehensive market analysis and personalized service to ensure every client finds the perfect property to match their vision and lifestyle.",
      certifications: ["REALTOR®", "GRI", "ABR", "MLS Member"],
      languages: ["English", "Spanish"]
    },
    {
      id: 5,
      name: "Hector Mendoza",
      title: "Investment Property Advisor",
      specialization: "Investment & Portfolio",
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761582971/a-meticulously-crafted-portrait-photogra_mYQPdq9WQSWo-pvakiW_Yw_xsfP9GCST6CP-VnQtn3QSA_sybk55.jpg",
      phone: "+52 624 211 4879",
      email: "Hector@bircabo.com",
      yearsExperience: 2,
      propertiesSold: 12,
      bio: "Real estate in Mexico should feel exciting, not overwhelming. I take pride in making every transaction simple, personal, and rewarding. With my background in numbers and market knowledge, I help clients see that buying a home is often better than keeping money in the bank, it's an investment that grows in value and brings lasting satisfaction. From our first conversation to handing you the keys, I'll be by your side with clear communication, data driven insight, and honest guidance to help you invest with confidence.",
      certifications: ["REALTOR®", "CCIM", "CRS", "MLS Member"],
      languages: ["English", "Spanish"]
    },
    {
      id: 9,
      name: "Susu Vieira",
      title: "Real Estate Advisor",
      specialization: "Luxury Properties",
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761788188/a-professional-studio-portrait-photograp_RGKPNo0jRji9CJIPZrgVGA_liMa2FOqRO-PViqgwfupEw_cleanup_ga5cgy.png",
      phone: "+1 (808) 226-6120",
      phoneSecondary: "+52 612 120 5289",
      email: "Susu@bircabo.com",
      yearsExperience: 11,
      propertiesSold: 101,
      bio: "Agent bio to be added. This experienced real estate professional brings dedication and expertise to every transaction in Cabo San Lucas. With a focus on client satisfaction and market knowledge, they help buyers and sellers achieve their real estate goals in Baja California Sur.",
      certifications: ["REALTOR®", "MLS Member"],
      languages: ["English", "Spanish"]
    },
    {
      id: 7,
      name: "Marisol Tort",
      title: "Real Estate Advisor",
      specialization: "Luxury Properties",
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761668403/WhatsApp_Image_2025-10-27_at_9.24.29_PM_uajiar.jpg",
      phone: "+52 624 264 3896",
      email: "mtortricardi@gmail.com",
      yearsExperience: 6,
      propertiesSold: 50,
      bio: "As a trusted real estate advisor in Cabo San Lucas, Marisol specializes in identifying profitable investment and luxury property opportunities. Her data-driven approach and sharp negotiation skills give clients an edge in one of Mexico's most desirable markets. Investors turn to Marisol for guidance, confidence, and results that make every deal count.",
      certifications: ["REALTOR®", "MLS Member"],
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
      bio: "I bring a strong track record of leading high performance, dedication, and genuine care to every real estate transaction in Cabo San Lucas. Specializing in family homes and condominiums, I guide first time buyers and growing families through each step of the home buying process with patience and expertise. My warm, client focused approach and meticulous attention to detail ensure a smooth, stress free experience from start to finish.",
      certifications: ["REALTOR®", "ABR", "SRS", "MLS Member"],
      languages: ["English", "Spanish"]
    },
    {
      id: 10,
      name: "Edgar Pacheco",
      title: "Real Estate & IT Advisor",
      specialization: "Luxury Properties",
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761598127/a-professional-studio-portrait-photograp_dnE69CqgQwKMvDj_boYW5A_sWO9IE8FSuKtnjTWshya2g_lvnjuh.jpg",
      phone: "+52 612 169 8328",
      email: "Edgar@bircabo.com",
      yearsExperience: 1,
      propertiesSold: 4,
      bio: "Looking to invest in Cabo San Lucas? I'm your insider advantage. With a unique blend of analytical precision and real estate expertise developed under the guidance of industry veteran Bob Van Patten, I transform complex market data into clear, actionable investment opportunities. I've pioneered innovative digital platforms that give my clients unmatched transparency into property values, market trends, and investment potential across Cabo and Baja California Sur. My approach is simple: I empower you with the knowledge, insights, and local connections you need to invest confidently and smart in paradise.",
      certifications: ["REALTOR®", "MLS Member"],
      languages: ["English", "Spanish"]
    }
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
                      {/* Primary Phone */}
                      <a 
                        href={`tel:${agent.phone}`}
                        className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <Phone className="w-5 h-5" />
                        <div>
                          <span className="block">{agent.phone}</span>
                          {agent.phoneSecondary && <span className="text-xs opacity-75">US Number</span>}
                        </div>
                      </a>
                      
                      {/* Secondary Phone (if exists) */}
                      {agent.phoneSecondary && (
                        <a 
                          href={`tel:${agent.phoneSecondary}`}
                          className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        >
                          <Phone className="w-5 h-5" />
                          <div>
                            <span className="block">{agent.phoneSecondary}</span>
                            <span className="text-xs opacity-75">Mexico Number</span>
                          </div>
                        </a>
                      )}
                      
                      {/* Email */}
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