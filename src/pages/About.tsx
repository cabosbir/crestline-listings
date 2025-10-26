import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import TeamMemberCard from "@/components/TeamMemberCard";
import { Award, Users, TrendingUp, Heart } from "lucide-react";

import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";

const About = () => {
  const teamMembers = [
    {
      name: "Sarah Martinez",
      title: "Founder & Lead Agent",
      image: property1,
    },
    {
      name: "Michael Chen",
      title: "Senior Real Estate Advisor",
      image: property2,
    },
    {
      name: "Elena Rodriguez",
      title: "Luxury Property Specialist",
      image: property3,
    },
    {
      name: "David Thompson",
      title: "International Sales Director",
      image: property1,
    },
  ];

  const values = [
    {
      icon: Users,
      title: "Client-First Approach",
      description: "Your success is our priority. We provide personalized service tailored to your unique needs and goals.",
    },
    {
      icon: Award,
      title: "Proven Excellence",
      description: "Award-winning team with decades of combined experience in Cabo San Lucas luxury real estate.",
    },
    {
      icon: TrendingUp,
      title: "Market Expertise",
      description: "Deep local knowledge of Baja California Sur and cutting-edge market insights to give you a competitive advantage.",
    },
    {
      icon: Heart,
      title: "Integrity & Trust",
      description: "Built on honesty, transparency, and genuine care for every client we serve.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <FloatingContact />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            About Baja International Realty
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Your trusted partner in luxury real estate in Cabo San Lucas & Baja California Sur since 2014
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
                  Founded in 2014, Baja International Realty was born from a passion for connecting people with their dream properties in Cabo San Lucas and throughout Baja California Sur. What started as a boutique agency has grown into one of the region's most respected luxury real estate firms.
                </p>
                <p>
                  Our founders, who relocated from the United States and Canada, brought with them decades of real estate expertise and a vision to create a client-focused agency that combines intimate local knowledge with international standards of service.
                </p>
                <p>
                  Today, we've successfully helped over 2,200 families find their perfect property in paradise, managing over $800 million in sales. But beyond the numbers, we're most proud of the lasting relationships we've built and the trust our clients place in us throughout their Baja real estate journey.
                </p>
              </div>
            </div>
            <div className="relative h-96 lg:h-full min-h-[400px]">
              <img 
                src={property1} 
                alt="Cabo San Lucas luxury property" 
                className="w-full h-full object-cover rounded-2xl shadow-elegant"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-24 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Our Core Values
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div 
                  key={index}
                  className="bg-background p-8 rounded-xl border border-border hover:shadow-hover transition-smooth"
                >
                  <div className="flex justify-center mb-6">
                    <div className="p-4 rounded-full bg-accent/10">
                      <Icon className="h-8 w-8 text-accent" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3 text-center">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground text-center text-sm leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Meet Our Team
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experienced professionals dedicated to your real estate success in Cabo San Lucas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <TeamMemberCard key={index} {...member} />
            ))}
          </div>
        </div>
      </section>

      {/* Awards & Recognition */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Awards & Recognition
            </h2>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto">
              Recognized for excellence in Baja California Sur luxury real estate
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-5xl font-bold text-accent mb-2">2024</div>
              <p className="text-primary-foreground/90">Top Luxury Agency<br />Cabo San Lucas</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-accent mb-2">A+</div>
              <p className="text-primary-foreground/90">Client Service<br />Rating</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-accent mb-2">5★</div>
              <p className="text-primary-foreground/90">Client Satisfaction<br />Score</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;