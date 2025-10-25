import { Users, Award, Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";

const WhyWorkWithUs = () => {
  const values = [
    {
      icon: Users,
      title: "THE POWER OF FAMILY",
      description: "We're a family-run business committed to creating lasting relationships. Our personalized approach means you're not just a client – you're part of our real estate family. We treat every transaction with the care and dedication we'd give our own family.",
      link: "Our Family",
      href: "/about",
    },
    {
      icon: Award,
      title: "THE POWER OF EXPERIENCE",
      description: "Our licensed agents bring decades of combined real estate expertise. With successful careers in the US and Canada, we understand luxury markets inside and out. Our track record speaks for itself with thousands of successful transactions and satisfied clients.",
      link: "Our Team",
      href: "/about",
    },
    {
      icon: Lightbulb,
      title: "THE POWER OF INNOVATION",
      description: "We leverage cutting-edge technology and AI-powered tools to deliver exceptional results. Our specialized marketing team creates stunning campaigns, while our advanced CRM ensures you receive personalized, timely service at every step of your real estate journey.",
      link: "Learn More",
      href: "/contact",
    },
  ];

  return (
    <section className="py-24 bg-secondary">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-16 bg-border" />
            <p className="text-muted-foreground uppercase tracking-wider text-sm">Why</p>
            <div className="h-px w-16 bg-border" />
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-foreground">
            WORK WITH US
          </h2>
        </div>

        {/* Value Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <Card 
                key={index}
                className="p-8 bg-background border-border hover:shadow-hover transition-smooth"
              >
                <div className="flex justify-center mb-6">
                  <div className="p-4 rounded-full bg-accent/10">
                    <Icon className="h-8 w-8 text-accent" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4 text-center uppercase">
                  {value.title}
                </h3>
                <p className="text-muted-foreground text-center mb-6 leading-relaxed">
                  {value.description}
                </p>
                <div className="text-center">
                  <a 
                    href={value.href}
                    className="text-accent hover:text-accent-light transition-fast font-medium underline-offset-4 hover:underline"
                  >
                    {value.link} →
                  </a>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyWorkWithUs;
