import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import ValueModal from "@/components/ValueModal";
import MilestoneModal from "@/components/MilestoneModal";
import { Button } from "@/components/ui/button";
import { Award, Users, TrendingUp, Heart, ArrowRight, Tv, Building2, Scale } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const navigate = useNavigate();
  const [selectedValue, setSelectedValue] = useState<"client-first" | "excellence" | "expertise" | "integrity" | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<"national-recognition" | "major-developments" | "industry-pioneer" | null>(null);

  // Refs for counter animations
  const statsRefs = useRef<(HTMLDivElement | null)[]>([]);

  // ⭐ UPDATED: Team members with landing page slugs
  const teamMembers = [
    {
      id: 12,
      slug: "don",
      name: "Don Weis",
      title: "Founder & Broker",
      image: "/don-weis.jpg",
    },
    {
      id: 1,
      slug: "bob",
      name: "Bob Van Patten",
      title: "Senior Real Estate Advisor",
      image: "/bob-van-patten.jpg",
    },
    {
      id: 3,
      slug: "alfonso",
      name: "Alfonso Puente",
      title: "Sales Manager & Commercial Real Estate Expert",
      image: "/alfonso-puente.jpg",
    },
    {
      id: 8,
      slug: "david",
      name: "David Scott Piper",
      title: "Real Estate Advisor",
      image: "/david-scott-piper.jpg",
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
      description: "Decades of experience helping buyers and sellers navigate Cabo San Lucas real estate.",
      valueKey: "excellence" as const,
    },
    {
      icon: TrendingUp,
      title: "Market Expertise",
      description: "Local knowledge that connects property prices with access, amenities, microclimates, and everyday life.",
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
      description: "Land acquisition experience including RIU Hotels and Cabo San Cristobal Resorts",
      milestoneKey: "major-developments" as const,
    },
    {
      icon: Scale,
      title: "Industry Pioneer",
      description: "Founding member of MLS-BCS, setting professional standards in Baja California Sur real estate",
      milestoneKey: "industry-pioneer" as const,
    }
  ];

  // ⭐ UPDATED: Navigate to landing page if slug exists, otherwise bio page
  const handleTeamMemberClick = (member: typeof teamMembers[0]) => {
    if (member.slug) {
      navigate(`/${member.slug}`);
    } else {
      navigate(`/team/${member.id}`);
    }
  };

  useEffect(() => {
    // Hero Section - Fade in from bottom
    gsap.from(".about-hero-title", {
      y: 80,
      opacity: 0,
      duration: 1.2,
      ease: "power3.out",
      delay: 0.2
    });

    gsap.from(".about-hero-subtitle", {
      y: 60,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      delay: 0.4
    });

    // Story Section - Fade in from left and right
    gsap.from(".story-heading", {
      scrollTrigger: {
        trigger: ".story-section",
        start: "top 80%",
        toggleActions: "play none none reverse"
      },
      x: -80,
      opacity: 0,
      duration: 1.2,
      ease: "power3.out"
    });

    gsap.from(".story-text p", {
      scrollTrigger: {
        trigger: ".story-section",
        start: "top 80%",
        toggleActions: "play none none reverse"
      },
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: "power3.out"
    });

    gsap.from(".story-image", {
      scrollTrigger: {
        trigger: ".story-section",
        start: "top 80%",
        toggleActions: "play none none reverse"
      },
      x: 80,
      opacity: 0,
      duration: 1.2,
      ease: "power3.out"
    });

    // Milestones - Scale in with stagger
    gsap.from(".milestone-card", {
      scrollTrigger: {
        trigger: ".milestones-section",
        start: "top 80%",
        toggleActions: "play none none reverse"
      },
      scale: 0.8,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: "back.out(1.7)"
    });

    // Values Cards - Scale in with stagger
    gsap.from(".value-card", {
      scrollTrigger: {
        trigger: ".values-section",
        start: "top 80%",
        toggleActions: "play none none reverse"
      },
      scale: 0.8,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: "back.out(1.7)"
    });

    // Team Members - Stagger from bottom
    gsap.from(".team-member-card", {
      scrollTrigger: {
        trigger: ".team-section",
        start: "top 80%",
        toggleActions: "play none none reverse"
      },
      y: 60,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power3.out"
    });

    // Stats Counter Animations
    const animateCounter = (element: HTMLElement, endValue: number, prefix = "", suffix = "") => {
      const obj = { value: 0 };
      
      gsap.to(obj, {
        value: endValue,
        duration: 2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start: "top 85%",
          toggleActions: "play none none none"
        },
        onUpdate: () => {
          if (element) {
            element.textContent = prefix + Math.round(obj.value).toLocaleString() + suffix;
          }
        }
      });
    };

    // Animate each stat counter
    if (statsRefs.current[0]) animateCounter(statsRefs.current[0], 75, "", "+");
    if (statsRefs.current[1]) animateCounter(statsRefs.current[1], 1850, "", "+");
    if (statsRefs.current[2]) animateCounter(statsRefs.current[2], 800, "$", "M+");

    // Stats section fade in
    gsap.from(".stats-section", {
      scrollTrigger: {
        trigger: ".stats-section",
        start: "top 80%",
        toggleActions: "play none none reverse"
      },
      y: 60,
      opacity: 0,
      duration: 1,
      ease: "power3.out"
    });

    // Media logos stagger
    gsap.from(".media-logo", {
      scrollTrigger: {
        trigger: ".media-section",
        start: "top 85%",
        toggleActions: "play none none reverse"
      },
      scale: 0.8,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "back.out(1.7)"
    });

    // Founder Quote - Fade in with scale
    gsap.from(".founder-quote", {
      scrollTrigger: {
        trigger: ".founder-quote",
        start: "top 85%",
        toggleActions: "play none none reverse"
      },
      scale: 0.95,
      opacity: 0,
      duration: 1,
      ease: "power3.out"
    });

    gsap.from(".founder-image", {
      scrollTrigger: {
        trigger: ".founder-quote",
        start: "top 85%",
        toggleActions: "play none none reverse"
      },
      scale: 0.8,
      opacity: 0,
      duration: 0.8,
      ease: "back.out(1.7)"
    });

    // Section headings
    gsap.utils.toArray<HTMLElement>(".section-heading").forEach((heading) => {
      gsap.from(heading, {
        scrollTrigger: {
          trigger: heading,
          start: "top 85%",
          toggleActions: "play none none reverse"
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
      });
    });

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>About Baja International Realty | Cabo Real Estate Since 1987</title>
        <meta 
          name="description" 
          content="Meet Baja International Realty, led by Don Weis. Cabo real estate experience since 1987, local guidance for buyers and sellers, and MLS search with no signup required." 
        />
        <link rel="canonical" href="https://www.bircabo.com/about" />
        <meta property="og:url" content="https://www.bircabo.com/about" />
        <meta property="og:title" content="About Baja International Realty | Cabo San Lucas Real Estate Experts" />
        <meta property="og:image" content="https://www.bircabo.com/bir-office-plaza-nautica.jpg" />
        <meta property="og:type" content="website" />
        <meta property="og:description" content="35+ years of excellence in Cabo San Lucas luxury real estate. Founding MLS member, 1,850+ properties sold, $800M+ in sales." />
      </Helmet>
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
          <h1 className="about-hero-title text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            About Baja International Realty
          </h1>
          <p className="about-hero-subtitle text-xl text-muted-foreground max-w-3xl">
            Local experience since 1987. Straightforward answers. A friendly place to explore Cabo real estate at your own pace.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="story-section py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="story-heading text-4xl font-bold text-foreground mb-6">Our Story</h2>
              <div className="story-text space-y-5 text-lg text-muted-foreground leading-relaxed">
                <p>Baja International Realty's roots go back to 1987 and the work of founder and broker <strong className="text-foreground">Don Weis</strong>. Over the decades, Cabo has grown and changed. Our purpose has stayed simple: help people understand the market, the property, and the process before they make a decision.</p>
                <p>Education was part of that work from the beginning. Don's “Mexico Gold” real estate seminars received coverage on CNN, 20/20, and national media, helping introduce buyers to Mexican real estate and the ways foreigners could own property here.</p>
                <p>From those educational roots with Pan America Ltd, Don established Baja International to represent developers in Baja Norte. The business evolved through Land's End Realty into today's Baja International Realty. Its history includes land acquisitions for RIU Hotels and Cabo San Cristobal Resorts, as well as helping individual buyers and sellers with homes, condos, and land.</p>
                <p>As a founding member of <strong className="text-foreground">MLS-BCS</strong>, Don has been involved in the development of the region's real estate industry. Under his continued leadership, BIR combines that perspective with the practical knowledge that comes from living and working here.</p>
              </div>
            </div>
            <div className="story-image relative">
              <a 
                href="https://maps.app.goo.gl/DsyfVAHBARUKDJAX8" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block h-full group"
              >
                <img 
                  src="/bir-office-plaza-nautica.jpg"
                  width="4032" height="3024" 
                  alt="Baja International Realty office at Plaza Nautica in downtown Cabo San Lucas — click for directions" 
                  className="w-full h-auto rounded-2xl shadow-elegant group-hover:opacity-90 transition-opacity cursor-pointer"
                />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 bg-secondary">
        <div className="container mx-auto px-4 max-w-6xl grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-3xl font-bold mb-5">Explore first. Talk when you're ready.</h2>
            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
              <p>Some buyers know exactly what they want. Others spend weeks or months learning about Cabo before they are ready to speak with an agent. Both are welcome here.</p>
              <p>Our MLS search lets you explore public listings, use the map, save up to 50 favorites in your browser, and compare up to three properties. No signup is required. Your favorites stay in that browser unless its data is cleared.</p>
              <p>When you want advice, our team is here to help you understand the choices. Searching should be useful and comfortable, without pressure to take the next step.</p>
            </div>
            <Button asChild size="lg" className="mt-6"><a href="/property-search.html">Search Cabo MLS</a></Button>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-5">The details that make a place right for you</h2>
            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
              <p>A beautiful photo is only the beginning. Easy access to shopping and medical care, walking distance to restaurants, ocean breezes, seasonal heat, and a community's rules can all affect how a property fits your life.</p>
              <p>We help buyers consider those differences across Cabo San Lucas, San José del Cabo, the Corridor, the Pacific coast, East Cape, and La Paz. For rental buyers, we also discuss location, the guest experience, competing properties, and ongoing expenses.</p>
              <p>For sellers, our work starts with understanding your property and your goals. We can help you assess its place in the market, consider pricing and presentation, and plan your next steps.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Milestones */}
      <section className="milestones-section pt-12 pb-20 bg-muted/30">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="section-heading text-4xl md:text-5xl font-bold text-foreground mb-2">
              Key Milestones
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto mb-0">
              Click to explore 35+ years of pioneering real estate excellence
            </p>
          </div>
          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto -mt-2">
            {milestones.map((milestone, index) => {
              const Icon = milestone.icon;
              return (
                <div
                  key={index}
                  onClick={() => setSelectedMilestone(milestone.milestoneKey)}
                  className="milestone-card bg-background border border-border rounded-2xl p-6 hover:shadow-hover transition-all duration-300 cursor-pointer group"
                  style={{ opacity: 1, visibility: 'visible' }}
                >
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors">
                      <Icon className="h-7 w-7 text-accent" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2 text-center uppercase group-hover:text-accent transition-colors">
                    {milestone.title}
                  </h3>
                  <p className="text-muted-foreground text-center text-sm leading-relaxed mb-3">
                    {milestone.description}
                  </p>
                  <div className="text-center">
                    <span className="text-accent text-sm font-medium underline-offset-4 group-hover:underline">
                      Learn More →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Core Values */}
      <section className="values-section pt-12 pb-20 bg-background">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="section-heading text-4xl md:text-5xl font-bold text-foreground mb-2">
              Our Core Values
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto mb-0">
              Click on any value to learn more about our commitment to excellence
            </p>
          </div>
          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto -mt-2">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  onClick={() => setSelectedValue(value.valueKey)}
                  className="value-card bg-background border border-border rounded-2xl p-6 hover:shadow-hover transition-all duration-300 cursor-pointer group"
                  style={{ opacity: 1, visibility: 'visible' }}
                >
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors">
                      <Icon className="h-7 w-7 text-accent" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2 text-center uppercase group-hover:text-accent transition-colors">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground text-center text-sm leading-relaxed mb-3">
                    {value.description}
                  </p>
                  <div className="text-center">
                    <span className="text-accent text-sm font-medium underline-offset-4 group-hover:underline">
                      Learn More →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="team-section py-24 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="section-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
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
                onClick={() => handleTeamMemberClick(member)}
                className="team-member-card group cursor-pointer"
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
                      {member.slug ? 'View Profile →' : 'View Bio →'}
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
      <section className="stats-section py-24 bg-primary text-primary-foreground">
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
              <div ref={el => statsRefs.current[0] = el} className="text-5xl font-bold text-accent mb-2">0</div>
              <p className="text-primary-foreground/90">Combined Years of<br />Experience</p>
            </div>
            <div className="text-center">
              <div ref={el => statsRefs.current[1] = el} className="text-5xl font-bold text-accent mb-2">0</div>
              <p className="text-primary-foreground/90">Properties<br />Sold</p>
            </div>
            <div className="text-center">
              <div ref={el => statsRefs.current[2] = el} className="text-5xl font-bold text-accent mb-2">$0</div>
              <p className="text-primary-foreground/90">Total Sales<br />Volume</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-accent mb-2">MLS</div>
              <p className="text-primary-foreground/90">Founding<br />Member</p>
            </div>
          </div>

          {/* Media Recognition */}
          <div className="media-section mt-16 pt-16 border-t border-primary-foreground/20">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4">As Featured On</h3>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-12">
              <div className="media-logo text-center">
                <div className="text-3xl font-bold mb-1">CNN</div>
                <p className="text-sm text-primary-foreground/70">National Television</p>
              </div>
              <div className="media-logo text-center">
                <div className="text-3xl font-bold mb-1">20/20</div>
                <p className="text-sm text-primary-foreground/70">ABC News</p>
              </div>
              <div className="media-logo text-center">
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
          <div className="founder-quote max-w-4xl mx-auto text-center">
            <div className="founder-image mb-6">
              <img 
                src="/don-weis.jpg"
                alt="Don Weis - Founder & Broker"
                className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-accent shadow-lg"
              />
            </div>
            <h2 className="text-3xl font-bold mb-5">A personal connection to Cabo's real estate history</h2>
            <p className="text-lg text-muted-foreground mb-5 leading-relaxed">Don recalls Stewart approaching him in the late 1980s with an exclusive opportunity to offer title insurance throughout Mexico. He was unable to take it on because he needed to return to the San Francisco Bay Area to care for his terminally ill parents. That experience remains part of his connection to the years when foreign buyers were gaining confidence in Mexican property ownership.</p>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">Today, that history informs BIR's emphasis on clear explanations: how ownership works, what buying and selling involve, and what everyday life in each community can be like.</p>
            <div className="text-accent font-semibold text-lg">
              Don Weis
            </div>
            <div className="text-muted-foreground">
              Founder & Broker | Baja International Realty
            </div>
          </div>
        </div>
      </section>

      <section className="bg-secondary py-12">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Visit us at Plaza Nautica</h2>
          <p className="text-lg text-muted-foreground mb-5">Stop by our downtown Cabo office to introduce yourself or talk about what you have in mind.</p>
          <address className="not-italic text-lg leading-relaxed mb-6">Blvd. Marina 14<br />Plaza Nautica local A6<br />Colonia Centro<br />Cabo San Lucas, Baja California Sur<br />CP 23450</address>
          <Button asChild size="lg"><a href="/contact">Contact BIR</a></Button>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default About;
