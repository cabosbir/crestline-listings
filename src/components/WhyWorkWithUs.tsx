import { useState, useEffect } from "react";
import { Users, Award, Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";
import WorkModal from "@/components/WorkModal";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const WhyWorkWithUs = () => {
  const [selectedWork, setSelectedWork] = useState<"family" | "experience" | "innovation" | null>(null);

  const values = [
    {
      icon: Users,
      title: "THE POWER OF FAMILY",
      description: "We're a family-run business committed to creating lasting relationships. Our personalized approach means you're not just a client – you're part of our real estate family. We treat every transaction with the care and dedication we'd give our own family.",
      workKey: "family" as const,
    },
    {
      icon: Award,
      title: "THE POWER OF EXPERIENCE",
      description: "Our licensed agents bring decades of combined real estate expertise. With successful careers in the US and Canada, we understand luxury markets inside and out. Our track record speaks for itself with thousands of successful transactions and satisfied clients.",
      workKey: "experience" as const,
    },
    {
      icon: Lightbulb,
      title: "THE POWER OF INNOVATION",
      description: "We leverage cutting-edge technology and AI-powered tools to deliver exceptional results. Our specialized marketing team creates stunning campaigns, while our advanced CRM ensures you receive personalized, timely service at every step of your real estate journey.",
      workKey: "innovation" as const,
    },
  ];

  useEffect(() => {
    // Header decorative lines - fade in from sides
    gsap.from(".work-header-line-left", {
      scrollTrigger: {
        trigger: ".work-section",
        start: "top 80%",
        toggleActions: "play none none reverse"
      },
      scaleX: 0,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out"
    });

    gsap.from(".work-header-line-right", {
      scrollTrigger: {
        trigger: ".work-section",
        start: "top 80%",
        toggleActions: "play none none reverse"
      },
      scaleX: 0,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out"
    });

    // Header text - fade in from bottom
    gsap.from(".work-header-label", {
      scrollTrigger: {
        trigger: ".work-section",
        start: "top 80%",
        toggleActions: "play none none reverse"
      },
      y: 20,
      opacity: 0,
      duration: 0.6,
      ease: "power3.out"
    });

    gsap.from(".work-header-title", {
      scrollTrigger: {
        trigger: ".work-section",
        start: "top 80%",
        toggleActions: "play none none reverse"
      },
      y: 40,
      opacity: 0,
      duration: 0.8,
      delay: 0.2,
      ease: "power3.out"
    });

    gsap.from(".work-header-subtitle", {
      scrollTrigger: {
        trigger: ".work-section",
        start: "top 80%",
        toggleActions: "play none none reverse"
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      delay: 0.3,
      ease: "power3.out"
    });

    // Value Cards - Scale in with stagger
    gsap.from(".work-value-card", {
      scrollTrigger: {
        trigger: ".work-cards-grid",
        start: "top 80%",
        toggleActions: "play none none reverse"
      },
      scale: 0.8,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: "back.out(1.7)"
    });

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <>
      <WorkModal 
        isOpen={selectedWork !== null}
        onClose={() => setSelectedWork(null)}
        workType={selectedWork}
      />
      
      <section className="work-section py-24 bg-secondary">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="work-header-line-left h-px w-16 bg-border" />
              <p className="work-header-label text-muted-foreground uppercase tracking-wider text-sm">Why</p>
              <div className="work-header-line-right h-px w-16 bg-border" />
            </div>
            <h2 className="work-header-title text-5xl md:text-6xl font-bold text-foreground mb-4">
              WORK WITH US
            </h2>
            <p className="work-header-subtitle text-muted-foreground max-w-2xl mx-auto">
              Click on any card to discover what makes us different
            </p>
          </div>

          {/* Value Cards */}
          <div className="work-cards-grid grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card 
                  key={index}
                  onClick={() => setSelectedWork(value.workKey)}
                  className="work-value-card p-8 bg-background border-border hover:shadow-hover transition-smooth cursor-pointer group"
                >
                  <div className="flex justify-center mb-6">
                    <div className="p-4 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors">
                      <Icon className="h-8 w-8 text-accent" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-4 text-center uppercase group-hover:text-accent transition-colors">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground text-center mb-6 leading-relaxed">
                    {value.description}
                  </p>
                  <div className="text-center">
                    <span className="text-accent group-hover:text-accent-light transition-fast font-medium underline-offset-4 group-hover:underline">
                      Learn More →
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
};

export default WhyWorkWithUs;