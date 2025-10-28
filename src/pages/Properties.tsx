// src/pages/Properties.tsx - Updated with Advanced Filters

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import PropertyCard from "@/components/PropertyCard";
import AdvancedPropertyFilters from "@/components/AdvancedPropertyFilters";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";

// Uncomment when FlexMLS is ready
// import { fetchListings, convertMLSToPropertyCard } from "@/services/flexMlsService";

const Properties = () => {
  // Mock data - will be replaced by FlexMLS
  const mockProperties = [
    {
      id: 1,
      image: property1,
      price: "$2,850,000",
      title: "Beachfront Paradise Villa",
      location: "Marina District",
      beds: 5,
      baths: 4,
      sqft: "4,500 sq ft",
    },
    {
      id: 2,
      image: property2,
      price: "$3,200,000",
      title: "Golf Course Estate",
      location: "Sunset Hills",
      beds: 4,
      baths: 3,
      sqft: "3,800 sq ft",
    },
    {
      id: 3,
      image: property3,
      price: "$4,500,000",
      title: "Oceanfront Penthouse",
      location: "Downtown Luxury",
      beds: 3,
      baths: 3,
      sqft: "3,200 sq ft",
    },
    {
      id: 4,
      image: property1,
      price: "$1,950,000",
      title: "Modern Coastal Residence",
      location: "Beachfront",
      beds: 4,
      baths: 3,
      sqft: "3,500 sq ft",
    },
    {
      id: 5,
      image: property2,
      price: "$2,450,000",
      title: "Luxury Villa with Pool",
      location: "Golf Communities",
      beds: 5,
      baths: 4,
      sqft: "4,200 sq ft",
    },
    {
      id: 6,
      image: property3,
      price: "$3,750,000",
      title: "Exclusive Waterfront Estate",
      location: "Marina District",
      beds: 6,
      baths: 5,
      sqft: "5,800 sq ft",
    },
  ];

  const [properties, setProperties] = useState(mockProperties);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [currentFilters, setCurrentFilters] = useState<any>(null);

  // Load properties with filters
  const loadProperties = async (filters?: any) => {
    setLoading(true);
    try {
      // TODO: Uncomment when FlexMLS is configured
      /*
      const mlsListings = await fetchListings({
        // Map advanced filters to FlexMLS API
        city: filters?.city?.join(','),
        propertyType: filters?.propertyType?.join(','),
        minPrice: filters?.minPrice,
        maxPrice: filters?.maxPrice,
        bedrooms: filters?.minBeds,
        bathrooms: filters?.minBaths,
        minSqft: filters?.minSqft,
        maxSqft: filters?.maxSqft,
        waterfront: filters?.waterfront,
        oceanView: filters?.oceanView,
        pool: filters?.pool,
        listedAfter: filters?.listedAfter,
        listedBefore: filters?.listedBefore,
        yearBuiltMin: filters?.yearBuiltMin,
        yearBuiltMax: filters?.yearBuiltMax,
        mlsNumber: filters?.mlsNumber,
        keywords: filters?.keywords,
      });
      const convertedProperties = mlsListings.map(convertMLSToPropertyCard);
      setProperties(convertedProperties);
      */
      
      // For now, use mock data
      setProperties(mockProperties);
    } catch (error) {
      console.error('Error loading properties:', error);
      setProperties(mockProperties);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadProperties();
  }, []);

  const handleApplyFilters = (filters: any) => {
    setCurrentFilters(filters);
    loadProperties(filters);
  };

  const handleResetFilters = () => {
    setCurrentFilters(null);
    loadProperties();
  };

  const handleSort = (value: string) => {
    setSortBy(value);
    
    const sorted = [...properties].sort((a, b) => {
      switch (value) {
        case 'price-low':
          return parseFloat(a.price.replace(/[$,]/g, '')) - parseFloat(b.price.replace(/[$,]/g, ''));
        case 'price-high':
          return parseFloat(b.price.replace(/[$,]/g, '')) - parseFloat(a.price.replace(/[$,]/g, ''));
        case 'beds':
          return b.beds - a.beds;
        case 'newest':
        default:
          return 0;
      }
    });
    
    setProperties(sorted);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <FloatingContact />

      {/* Header */}
      <section className="pt-32 pb-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
            Luxury Properties
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Discover exceptional oceanfront villas, elegant condos, and exclusive estates in the most desirable locations
          </p>
        </div>
      </section>

      {/* Advanced Filters */}
      <section className="py-8 border-b border-border sticky top-20 bg-background/95 backdrop-blur-md z-30">
        <div className="container mx-auto px-4">
          <AdvancedPropertyFilters
            onApplyFilters={handleApplyFilters}
            onReset={handleResetFilters}
          />
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <p className="text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{properties.length}</span> properties
            </p>
            <Select onValueChange={handleSort} value={sortBy}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="beds">Most Bedrooms</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground">Loading properties...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground">No properties found matching your criteria</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={handleResetFilters}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property, index) => (
                <PropertyCard key={property.id || index} {...property} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {properties.length > 0 && (
            <div className="flex justify-center mt-12">
              <div className="flex gap-2">
                <Button variant="outline">Previous</Button>
                <Button variant="luxury">1</Button>
                <Button variant="outline">2</Button>
                <Button variant="outline">3</Button>
                <Button variant="outline">Next</Button>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Properties;