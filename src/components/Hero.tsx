import { Search, MapPin, Home, Bed, Bath, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import heroImage from "@/assets/hero-luxury-villa.jpg";

const Hero = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 gradient-overlay" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        {/* Main Heading - Mobile Responsive */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-primary-foreground mb-4 md:mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 leading-tight">
          BAJA INTERNATIONAL REALTY
        </h1>
        
        {/* Subheading - Mobile Responsive with line break */}
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-primary-foreground/90 mb-8 md:mb-12 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200 px-2">
          Discover Your Dream Property in <br className="sm:hidden" />
          Cabo San Lucas & Baja California Sur
        </p>

        {/* Search Bar */}
        <div className="bg-background/95 backdrop-blur-md p-4 md:p-6 lg:p-8 rounded-2xl shadow-hover max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
            {/* Location */}
            <Select>
              <SelectTrigger className="h-11 md:h-12">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Location" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="downtown">Downtown Cabo</SelectItem>
                <SelectItem value="beachfront">Beachfront</SelectItem>
                <SelectItem value="golf">Golf Communities</SelectItem>
                <SelectItem value="marina">Marina District</SelectItem>
                <SelectItem value="corridor">Tourist Corridor</SelectItem>
                <SelectItem value="sanjose">San José del Cabo</SelectItem>
              </SelectContent>
            </Select>

            {/* Property Type */}
            <Select>
              <SelectTrigger className="h-11 md:h-12">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Property Type" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="condo">Condo</SelectItem>
                <SelectItem value="penthouse">Penthouse</SelectItem>
                <SelectItem value="estate">Estate</SelectItem>
              </SelectContent>
            </Select>

            {/* Bedrooms */}
            <Select>
              <SelectTrigger className="h-11 md:h-12">
                <div className="flex items-center gap-2">
                  <Bed className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Bedrooms" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1+ Bed</SelectItem>
                <SelectItem value="2">2+ Beds</SelectItem>
                <SelectItem value="3">3+ Beds</SelectItem>
                <SelectItem value="4">4+ Beds</SelectItem>
                <SelectItem value="5">5+ Beds</SelectItem>
              </SelectContent>
            </Select>

            {/* Price Range */}
            <Select>
              <SelectTrigger className="h-11 md:h-12">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Price Range" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="500k">Under $500K</SelectItem>
                <SelectItem value="1m">$500K - $1M</SelectItem>
                <SelectItem value="2m">$1M - $2M</SelectItem>
                <SelectItem value="5m">$2M - $5M</SelectItem>
                <SelectItem value="5m+">$5M+</SelectItem>
              </SelectContent>
            </Select>

            {/* Search Button */}
            <Button variant="luxury" size="lg" className="h-11 md:h-12 md:col-span-2 lg:col-span-1">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden sm:block">
        <div className="w-6 h-10 border-2 border-primary-foreground/50 rounded-full p-1">
          <div className="w-1.5 h-3 bg-primary-foreground/50 rounded-full mx-auto" />
        </div>
      </div>
    </section>
  );
};

export default Hero;