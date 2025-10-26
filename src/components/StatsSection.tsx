import statsBackground from "@/assets/stats-bg.jpg";

const StatsSection = () => {
  const stats = [
    { number: "85", label: "Combined Years of\nExperience" },
    { number: "2,200+", label: "Homes & Properties\nSold" },
    { number: "65K", label: "Total Email\nSubscribers" },
    { number: "100%", label: "Committed to\nOur Clients" },
    { number: "$800M+", label: "Combined Sales\nSince 2014" },
  ];

  return (
    <section 
      className="relative py-24 bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${statsBackground})` }}
    >
      <div className="absolute inset-0 bg-primary/80" />
      
      <div className="relative z-10 container mx-auto px-4">
        <h2 className="text-5xl md:text-6xl font-bold text-primary-foreground text-center mb-16">
          IT'S KNOWLEDGE
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="text-center animate-in fade-in slide-in-from-bottom-4 duration-1000"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-5xl md:text-6xl font-bold text-accent mb-4">
                {stat.number}
              </div>
              <p className="text-primary-foreground uppercase text-xs md:text-sm tracking-wide font-medium whitespace-pre-line leading-relaxed">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;