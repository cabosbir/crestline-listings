import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const Hero = () => {
  const navigate = useNavigate();

  const handleSearchClick = () => {
    navigate('/properties');
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="https://res.cloudinary.com/dhwnr1pa5/video/upload/v1762094526/BIR_vmb1dc.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6 tracking-tight leading-tight mt-16 md:mt-24">
          BAJA INTERNATIONAL REALTY
        </h1>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-8 md:mb-12 max-w-4xl mx-auto px-2">
          Discover Your Dream Property in<br className="sm:hidden" /> Cabo San Lucas & Baja California Sur
        </p>

        {/* Call to Action Button */}
        <div className="flex justify-center items-center">
          <Button
            onClick={handleSearchClick}
            size="lg"
            className="h-14 bg-blue-900 hover:bg-blue-800 text-white font-semibold px-12 rounded-lg transition-all duration-300 shadow-2xl hover:shadow-blue-900/50 text-lg"
          >
            <Search className="w-6 h-6 mr-3" />
            Search Properties
          </Button>
        </div>

        {/* Key Features */}
        <div className="mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-w-2xl mx-auto px-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 md:p-6 border border-white/20">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">1850+</div>
            <div className="text-white/90 text-sm md:text-base">Properties Sold</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 md:p-6 border border-white/20">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">$1.2B+</div>
            <div className="text-white/90 text-sm md:text-base">In Sales</div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-8 h-8 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
};

export default Hero;