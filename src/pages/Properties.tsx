import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";

const Properties = () => {
  const [mlsNumber, setMlsNumber] = useState("");
  
  const FLEXMLS_IFRAME_URL = "https://link.flexmls.com/u67gqp77eml,12";
  
  const handleMLSSearch = () => {
    if (mlsNumber.trim()) {
      window.open(`${FLEXMLS_IFRAME_URL}?search=${encodeURIComponent(mlsNumber)}`, '_blank');
    }
  };

  const handleOpenFullSearch = () => {
    window.open(FLEXMLS_IFRAME_URL, '_blank');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && mlsNumber.trim()) {
      handleMLSSearch();
    }
  };

  const handleViewProperty = () => {
    window.open(FLEXMLS_IFRAME_URL, '_blank');
  };

  // Featured Properties
  const featuredProperties = [
    {
      id: 1,
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761942726/20241014235115115464000000-o_hgb1vh.jpg",
      price: "$6,950,000",
      title: "Hacienda Beach Club",
      subtitle: "private pool & OWNER FINANCING 1-100",
      location: "Cabo San Lucas",
      mlsNumber: "24-4467",
    },
    {
      id: 2,
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761942802/20250321204529858183000-o_u9cpcn.jpg",
      price: "$499,000",
      title: "La Vista LARGE PRIVATE YARD B101",
      location: "Cabo Corridor",
      mlsNumber: "25-1679",
    },
    {
      id: 3,
      image: "https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761942708/20240426201812151546000000-o_zoqijd.jpg",
      price: "$3,795,800",
      title: "Casa Ducci Camino del Mar",
      location: "Cabo San Lucas",
      mlsNumber: "24-1981",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <FloatingContact />

      {/* Header Section */}
      <section className="pt-32 pb-8 bg-secondary">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
            Cabo San Lucas Properties
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mb-6">
            Search 4,370+ luxury properties across Baja California Sur including Cabo San Lucas, 
            San Jose del Cabo, Todos Santos, East Cape, and La Paz
          </p>

          {/* MLS Quick Search */}
          <div className="max-w-2xl">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by MLS # or IDX number..."
                  value={mlsNumber}
                  onChange={(e) => setMlsNumber(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10"
                />
              </div>
              <Button 
                variant="default"
                onClick={handleMLSSearch}
                disabled={!mlsNumber.trim()}
                className="px-6"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button 
                variant="outline" 
                onClick={handleOpenFullSearch}
                className="px-4"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Full Search
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Enter an MLS number for direct lookup, or browse all listings below
            </p>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">Featured Properties</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {featuredProperties.map((property) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {/* Property Image */}
                <div className="relative h-64">
                  <img 
                    src={property.image} 
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-md shadow-lg">
                    <span className="text-xl font-bold text-blue-900">{property.price}</span>
                  </div>
                </div>

                {/* Property Details */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {property.title}
                  </h3>
                  
                  {property.subtitle && (
                    <p className="text-sm text-gray-600 mb-2">
                      {property.subtitle}
                    </p>
                  )}
                  
                  <p className="text-gray-600 mb-4">{property.location}</p>
                  
                  <div className="mb-4">
                    <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded text-sm font-medium">
                      Active / {property.mlsNumber}
                    </span>
                  </div>

                  {/* View Property Button */}
                  <Button 
                    onClick={handleViewProperty}
                    className="w-full bg-blue-900 hover:bg-blue-800 text-white font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    View Property Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Live FlexMLS Feed */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">All Available Properties</h2>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-border">
            <iframe 
              src={FLEXMLS_IFRAME_URL}
              frameBorder="0"
              width="100%"
              height="1400"
              className="w-full"
              title="MLS BCS Property Listings - Cabo San Lucas"
              style={{ minHeight: '1400px' }}
              allow="geolocation"
            />
          </div>
          
          <div className="text-center mt-6 space-y-2">
            <Button 
              variant="outline"
              onClick={handleOpenFullSearch}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Window
            </Button>
            <p className="text-sm text-muted-foreground">
              All listings courtesy of MLS BCS (Multiple Listing Service of Baja California Sur)
            </p>
            <p className="text-xs text-gray-400">
              Showing properties in: Cabo San Lucas • San Jose del Cabo • Cabo Corridor • East Cape • 
              Los Barriles • Todos Santos • Pescadero • La Paz • Loreto
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Properties;