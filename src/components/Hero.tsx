import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const Hero = () => {
  const [searchParams, setSearchParams] = useState({
    location: "",
    propertyType: "",
    bedrooms: "",
    priceRange: ""
  });

  const FLEXMLS_URL = "https://link.flexmls.com/u67gqp77eml,12";

  const handleSearch = () => {
    // Build search query parameters
    let searchQuery = "";
    
    if (searchParams.location) {
      searchQuery += `&City=${encodeURIComponent(searchParams.location)}`;
    }
    if (searchParams.propertyType) {
      searchQuery += `&PropertyType=${encodeURIComponent(searchParams.propertyType)}`;
    }
    if (searchParams.bedrooms) {
      searchQuery += `&BedsTotal=${searchParams.bedrooms}`;
    }
    if (searchParams.priceRange) {
      const [min, max] = searchParams.priceRange.split('-');
      if (min) searchQuery += `&ListPriceMin=${min}`;
      if (max) searchQuery += `&ListPriceMax=${max}`;
    }

    // Open FlexMLS with search parameters
    window.open(`${FLEXMLS_URL}${searchQuery}`, '_blank');
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&h=1080&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
          BAJA INTERNATIONAL REALTY
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto">
          Discover Your Dream Property in Cabo San Lucas & Baja California Sur
        </p>

        {/* Search Bar */}
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Location */}
            <div className="relative">
              <select
                value={searchParams.location}
                onChange={(e) => setSearchParams({...searchParams, location: e.target.value})}
                className="w-full h-12 px-4 pr-10 bg-white border-2 border-gray-200 rounded-lg appearance-none cursor-pointer hover:border-blue-900 focus:border-blue-900 focus:outline-none transition-colors"
              >
                <option value="">Location</option>
                <option value="Cabo San Lucas">Cabo San Lucas</option>
                <option value="San Jose del Cabo">San Jose del Cabo</option>
                <option value="Cabo Corridor">Cabo Corridor</option>
                <option value="Todos Santos">Todos Santos</option>
                <option value="East Cape">East Cape</option>
                <option value="La Paz">La Paz</option>
                <option value="Loreto">Loreto</option>
              </select>
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Property Type */}
            <div className="relative">
              <select
                value={searchParams.propertyType}
                onChange={(e) => setSearchParams({...searchParams, propertyType: e.target.value})}
                className="w-full h-12 px-4 pr-10 bg-white border-2 border-gray-200 rounded-lg appearance-none cursor-pointer hover:border-blue-900 focus:border-blue-900 focus:outline-none transition-colors"
              >
                <option value="">Property Type</option>
                <option value="House">House</option>
                <option value="Condo">Condo</option>
                <option value="Villa">Villa</option>
                <option value="Land">Land</option>
                <option value="Commercial">Commercial</option>
              </select>
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Bedrooms */}
            <div className="relative">
              <select
                value={searchParams.bedrooms}
                onChange={(e) => setSearchParams({...searchParams, bedrooms: e.target.value})}
                className="w-full h-12 px-4 pr-10 bg-white border-2 border-gray-200 rounded-lg appearance-none cursor-pointer hover:border-blue-900 focus:border-blue-900 focus:outline-none transition-colors"
              >
                <option value="">Bedrooms</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </select>
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Price Range */}
            <div className="relative">
              <select
                value={searchParams.priceRange}
                onChange={(e) => setSearchParams({...searchParams, priceRange: e.target.value})}
                className="w-full h-12 px-4 pr-10 bg-white border-2 border-gray-200 rounded-lg appearance-none cursor-pointer hover:border-blue-900 focus:border-blue-900 focus:outline-none transition-colors"
              >
                <option value="">Price Range</option>
                <option value="0-500000">Under $500K</option>
                <option value="500000-1000000">$500K - $1M</option>
                <option value="1000000-2000000">$1M - $2M</option>
                <option value="2000000-5000000">$2M - $5M</option>
                <option value="5000000-">$5M+</option>
              </select>
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Search Button */}
            <Button
              onClick={handleSearch}
              className="h-12 bg-blue-900 hover:bg-blue-800 text-white font-semibold px-8 rounded-lg transition-colors shadow-lg"
            >
              <Search className="w-5 h-5 mr-2" />
              Search
            </Button>
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