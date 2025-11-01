import { useState, useEffect, useRef } from "react";
import statsBackground from "@/assets/stats-bg.jpg";

const StatsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  const sectionRef = useRef<HTMLElement>(null);

  const stats = [
    { number: 75, label: "Combined Years of\nExperience", suffix: "" },
    { number: 1850, label: "Homes & Properties\nSold", suffix: "+" },
    { number: 100, label: "Committed to\nOur Clients", suffix: "%" },
    { number: 1.2, label: "Combined Sales\nSince 1987", suffix: "B+", prefix: "$", isDecimal: true },
  ];

  // Intersection Observer to detect when section is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { 
        threshold: 0.1, // Trigger when just 10% of section is visible
        rootMargin: '50px' // Start 50px before section enters viewport
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [isVisible]);

  // Animated counting effect
  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000; // 2 seconds
    const steps = 60; // 60 frames
    const increment = duration / steps;

    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      const progress = frame / steps;
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      setCounts(stats.map(stat => stat.number * easeOutQuart));

      if (frame >= steps) {
        clearInterval(interval);
        // Set final values
        setCounts(stats.map(stat => stat.number));
      }
    }, increment);

    return () => clearInterval(interval);
  }, [isVisible]);

  const formatNumber = (num: number, index: number) => {
    const stat = stats[index];
    
    // For decimal numbers (like 1.2B), format with one decimal place
    if (stat.isDecimal) {
      const formattedNum = num.toFixed(1);
      return `${stat.prefix || ""}${formattedNum}${stat.suffix || ""}`;
    }
    
    // For whole numbers, use standard formatting
    const formattedNum = Math.floor(num).toLocaleString();
    return `${stat.prefix || ""}${formattedNum}${stat.suffix || ""}`;
  };

  return (
    <section 
      ref={sectionRef}
      className="relative py-24 bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${statsBackground})` }}
    >
      <div className="absolute inset-0 bg-primary/80" />
      
      <div className="relative z-10 container mx-auto px-4">
        <h2 className="text-5xl md:text-6xl font-bold text-primary-foreground text-center mb-16">
          IT'S KNOWLEDGE
        </h2>

        <div className="flex flex-wrap justify-center gap-8 md:gap-16 lg:gap-20 max-w-7xl mx-auto">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="text-center animate-in fade-in slide-in-from-bottom-4 duration-1000 min-w-[140px] md:min-w-[180px]"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-5xl md:text-6xl lg:text-7xl font-bold text-accent mb-4 tabular-nums">
                {formatNumber(counts[index], index)}
              </div>
              <p className="text-primary-foreground uppercase text-sm md:text-base tracking-wide font-medium whitespace-pre-line leading-relaxed">
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