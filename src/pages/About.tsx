import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import ValueModal from "@/components/ValueModal";
import MilestoneModal from "@/components/MilestoneModal";
import { Button } from "@/components/ui/button";
import { Award, Users, TrendingUp, Heart, ArrowRight, Tv, Building2, Scale } from "lucide-react";

const About = () => {
  const navigate = useNavigate();
  const [selectedValue, setSelectedValue] = useState<"client-first" | "excellence" | "expertise" | "integrity" | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<"national-recognition" | "major-developments" | "industry-pioneer" | null>(null);

  // Updated team members with IDs matching Team.tsx
  const teamMembers = [
    {
      id: 12,
      name: "Don Weis",
      title: "Founder & Broker",
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761932929/WhatsApp_Image_2025-10-30_at_10.26.08_AM_cvcznx.jpg",
    },
    {
      id: 1,
      name: "Bob Van Patten",
      title: "Senior Real Estate Advisor",
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761524592/work-photo-2025-10-27-1761524048537_jnodyu.png",
    },
    {
      id: 3,
      name: "Alfonso Puente",
      title: "Sales Manager & Commercial Real Estate Expert",
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761580623/WhatsApp_Image_2025-10-27_at_8.55.37_AM_uytmga.jpg",
    },
    {
      id: 8,
      name: "David Scott Piper",
      title: "Real Estate Advisor",
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761614075/WhatsApp_Image_2025-10-27_at_6.09.43_PM_neaig7.jpg",
    },
  ];

  const values = [
    {
      icon: Users,
      title: "Client-First Approach",
      description: "Your success is our priority. We provide personalized service tailored to your unique needs and goals.",
      valueKey: "client-first" as const,
    },
    {
      icon: Award,
      title: "Proven Excellence",
      description: "Award-winning team with decades of combined experience in Cabo San Lucas luxury real estate.",
      valueKey: "excellence" as const,
    },
    {
      icon: TrendingUp,
      title: "Market Expertise",
      description: "Deep local knowledge of Baja California Sur and cutting-edge market insights to give you a competitive advantage.",
      valueKey: "expertise" as const,
    },
    {
      icon: Heart,
      title: "Integrity & Trust",
      description: "Built on honesty, transparency, and genuine care for every client we serve.",
      valueKey: "integrity" as const,
    },
  ];

  const milestones = [
    {
      icon: Tv,
      title: "National Recognition",
      description: "Featured on CNN, 20/20, and national media for pioneering Mexican real estate education",
      milestoneKey: "national-recognition" as const,
    },
    {
      icon: Building2,
      title: "Major Developments",
      description: "Brokered acquisitions for RIU Hotels and Cabo San Cristobal Resorts - one of the world's largest planned resort projects",
      milestoneKey: "major-developments" as const,
    },
    {
      icon: Scale,
      title: "Industry Pioneer",
      description: "Founding member of MLS-BCS, setting professional standards in Baja California Sur real estate",
      milestoneKey: "industry-pioneer" as const,
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <FloatingContact />
      
      {/* Modals */}
      <ValueModal 
        isOpen={selectedValue !== null}
        onClose={() => setSelectedValue(null)}
        valueType={selectedValue}
      />
      
      <MilestoneModal 
        isOpen={selectedMilestone !== null}
        onClose={() => setSelectedMilestone(null)}
        milestoneType={selectedMilestone}
      />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            About Baja International Realty
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Pioneering luxury real estate in Cabo San Lucas since the late 1980s
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Founded in the late 1980s by visionary broker <span className="font-semibold text-foreground">Don Weis</span>, Baja International Realty has been a pioneering force in Cabo San Lucas real estate for over 35 years. Don's groundbreaking "Mexico Gold" real estate education seminars were featured on <span className="font-semibold text-foreground">CNN, 20/20, and national media</span>, helping establish foreign investor confidence in Baja real estate.
                </p>
                <p>
                  From those educational roots with Pan America Ltd, Don established Baja International to represent developers in the Baja Norte region, which evolved into Land's End Realty and eventually today's Baja International Realty. Our firm has brokered some of the most significant real estate transactions in Cabo history, including multi-million dollar land acquisitions for <span className="font-semibold text-foreground">RIU Hotels</span> and <span className="font-semibold text-foreground">Cabo San Cristobal Resorts</span> - one of the largest planned resort projects in the world with 8 hotels, championship golf courses, polo fields, and a Formula One racetrack.
                </p>
                <p>
                  As a <span className="font-semibold text-foreground">founding member of MLS-BCS</span> (Multiple Listing Service of Baja California Sur), we've successfully helped over <span className="font-semibold text-foreground">2,200 families</span> find their perfect property in paradise, managing over <span className="font-semibold text-foreground">$1.2 billion</span> in sales. Today, under Don's continued leadership, our team of International Realtors® combines 35+ years of local expertise with international standards of service.
                </p>
              </div>
            </div>
            <div className="relative h-96 lg:h-full min-h-[400px]">
              <a 
                href="https://maps.app.goo.gl/DsyfVAHBARUKDJAX8" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block h-full group"
              >
                <img 
                  src="https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761585102/work-photo-2025-10-27-1761585093635_tsub0p.png" 
                  alt="Baja International Realty storefront - Click for directions" 
                  className="w-full h-full object-cover rounded-2xl shadow-elegant group-hover:opacity-90 transition-opacity cursor-pointer"
                />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Key Milestones - NOW CLICKABLE! */}
      <section className="py-24 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Key Milestones
            </h2>
            <p className="text-muted-foreground">
              Click to explore 35+ years of pioneering real estate excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {milestones.map((milestone, index) => {
              const Icon = milestone.icon;
              return (
                <div 
                  key={index}
                  onClick={() => setSelectedMilestone(milestone.milestoneKey)}
                  className="bg-background p-8 rounded-xl border border-border hover:shadow-hover transition-smooth cursor-pointer group"
                >
                  <div className="flex justify-center mb-6">
                    <div className="p-4 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors">
                      <Icon className="h-8 w-8 text-accent" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3 text-center group-hover:text-accent transition-colors">
                    {milestone.title}
                  </h3>
                  <p className="text-sm text-muted-foreground text-center leading-relaxed mb-4">
                    {milestone.description}
                  </p>
                  <p className="text-accent text-sm font-semibold text-center group-hover:underline">
                    Learn More →
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Our Core Values
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Click on any value to learn more about our commitment to excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div 
                  key={index}
                  onClick={() => setSelectedValue(value.valueKey)}
                  className="bg-card p-8 rounded-xl border border-border hover:shadow-hover transition-smooth cursor-pointer group"
                >
                  <div className="flex justify-center mb-6">
                    <div className="p-4 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors">
                      <Icon className="h-8 w-8 text-accent" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3 text-center group-hover:text-accent transition-colors">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground text-center text-sm leading-relaxed mb-4">
                    {value.description}
                  </p>
                  <p className="text-accent text-sm font-semibold text-center group-hover:underline">
                    Learn More →
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Meet Our Team
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experienced professionals dedicated to your real estate success in Cabo San Lucas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                onClick={() => navigate(`/team/${member.id}`)}
                className="group cursor-pointer"
              >
                <div className="bg-background rounded-xl overflow-hidden border border-border hover:shadow-hover transition-smooth">
                  <div className="aspect-[3/4] overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-accent transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{member.title}</p>
                    <div className="mt-4 text-accent text-sm font-semibold group-hover:underline">
                      View Profile →
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/team">
              <Button variant="outline" size="lg">
                Meet Our Full Team <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats & Recognition */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Our Track Record
            </h2>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto">
              35+ years of excellence in Baja California Sur luxury real estate
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="text-5xl font-bold text-accent mb-2">75+</div>
              <p className="text-primary-foreground/90">Combined Years of<br />Experience</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-accent mb-2">1,850+</div>
              <p className="text-primary-foreground/90">Families<br />Served</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-accent mb-2">$1.2B+</div>
              <p className="text-primary-foreground/90">Total Sales<br />Volume</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-accent mb-2">MLS</div>
              <p className="text-primary-foreground/90">Founding<br />Member</p>
            </div>
          </div>

          {/* Media Recognition */}
          <div className="mt-16 pt-16 border-t border-primary-foreground/20">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4">As Featured On</h3>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-12">
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">CNN</div>
                <p className="text-sm text-primary-foreground/70">National Television</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">20/20</div>
                <p className="text-sm text-primary-foreground/70">ABC News</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">National Radio</div>
                <p className="text-sm text-primary-foreground/70">Multiple Shows</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Quote */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6">
              <img 
                src="https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761604421/a-professional-portrait-photograph-of-a-_c8sIFPSGQYO0TQlApBAfFQ__16y8I8XSnO06Y6Tixti-Q_o4nhst.jpg"
                alt="Don Weis - Founder & Broker"
                className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-accent shadow-lg"
              />
            </div>
            <blockquote className="text-2xl md:text-3xl font-light text-foreground italic mb-6 leading-relaxed">
              "Our mission has always been to educate, guide, and empower clients to make confident real estate decisions in Baja California Sur. Three decades later, that commitment remains stronger than ever."
            </blockquote>
            <div className="text-accent font-semibold text-lg">
              Don Weis
            </div>
            <div className="text-muted-foreground">
              Founder & Broker | Baja International Realty
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;