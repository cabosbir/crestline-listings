import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import PropertyCard from "@/components/PropertyCard";
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

const Properties = () => {
  const properties = [
    {
      image: property1,
      price: "$2,850,000",
      title: "Beachfront Paradise Villa",
      location: "Marina District",
      beds: 5,
      baths: 4,
      sqft: "4,500 sq ft",
    },
    {
      image: property2,
      price: "$3,200,000",
      title: "Golf Course Estate",
      location: "Sunset Hills",
      beds: 4,
      baths: 3,
      sqft: "3,800 sq ft",
    },
    {
      image: property3,
      price: "$4,500,000",
      title: "Oceanfront Penthouse",
      location: "Downtown Luxury",
      beds: 3,
      baths: 3,
      sqft: "3,200 sq ft",
    },
    {
      image: property1,
      price: "$1,950,000",
      title: "Modern Coastal Residence",
      location: "Beachfront",
      beds: 4,
      baths: 3,
      sqft: "3,500 sq ft",
    },
    {
      image: property2,
      price: "$2,450,000",
      title: "Luxury Villa with Pool",
      location: "Golf Communities",
      beds: 5,
      baths: 4,
      sqft: "4,200 sq ft",
    },
    {
      image: property3,
      price: "$3,750,000",
      title: "Exclusive Waterfront Estate",
      location: "Marina District",
      beds: 6,
      baths: 5,
      sqft: "5,800 sq ft",
    },
  ];

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

      {/* Filters */}
      <section className="py-8 border-b border-border sticky top-20 bg-background/95 backdrop-blur-md z-30">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-4 items-center">
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="condo">Condo</SelectItem>
                <SelectItem value="penthouse">Penthouse</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="marina">Marina District</SelectItem>
                <SelectItem value="golf">Golf Communities</SelectItem>
                <SelectItem value="beach">Beachfront</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="1m">Under $1M</SelectItem>
                <SelectItem value="2m">$1M - $2M</SelectItem>
                <SelectItem value="3m">$2M - $3M</SelectItem>
                <SelectItem value="5m">$3M - $5M</SelectItem>
                <SelectItem value="5m+">$5M+</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Bedrooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any</SelectItem>
                <SelectItem value="2">2+</SelectItem>
                <SelectItem value="3">3+</SelectItem>
                <SelectItem value="4">4+</SelectItem>
                <SelectItem value="5">5+</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="luxury" className="ml-auto">
              Apply Filters
            </Button>
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <p className="text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{properties.length}</span> properties
            </p>
            <Select>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property, index) => (
              <PropertyCard key={index} {...property} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-12">
            <div className="flex gap-2">
              <Button variant="outline">Previous</Button>
              <Button variant="luxury">1</Button>
              <Button variant="outline">2</Button>
              <Button variant="outline">3</Button>
              <Button variant="outline">Next</Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Properties;
