import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card } from "@/components/ui/card";
import { Bed, Bath, Maximize, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const officeProperties = [
  {
    id: "marina-cabo-plaza",
    title: "Marina Cabo Plaza",
    address: "Paseo de la Marina 103, Marina Cabo Plaza, Cabo San Lucas",
    price: "$279,000",
    beds: 0,
    baths: 0,
    sqft: "421.58",
    mls: "25-4668",
    image: "/paseo-de-la-marina-1.jpg",
    onOffer: true,
  },
  {
    id: "rivieri-positano",
    title: "RIVIERI Positano Garden",
    address: "50-A, Cabo Corridor",
    price: "$235,000",
    beds: 2,
    baths: 2,
    sqft: "1,872.24",
    mls: "25-684",
    image: "/rivieri-positano-1.jpg",
  },
  {
    id: "las-cascadas-pedregal",
    title: "Las Cascadas de Pedregal",
    address: "Camino de la Piedrera 403, Cabo San Lucas",
    price: "$599,000",
    beds: 2,
    baths: 2,
    sqft: "1,678.56",
    mls: "25-5877",
    image: "/las-cascadas-1.jpg",
  },
  {
    id: "la-vista-b101",
    title: "La Vista",
    address: "B101, Cabo Corridor",
    price: "$449,000",
    beds: 3,
    baths: 3,
    sqft: "4,003.37",
    mls: "25-1679",
    image: "/la-vista-1.jpg",
  },
  {
    id: "blue-bay",
    title: "Blue Bay",
    address: "Camino Colegio 101-B, Cabo San Lucas",
    price: "$359,000",
    beds: 2,
    baths: 2,
    sqft: "1,420.32",
    mls: "25-1684",
    image: "/blue-bay-1.jpg",
  },
];

const OfficeListings = () => {
  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Active Office Listings | Baja International Realty</title>
        <meta
          name="description"
          content="Browse our active office listings in Cabo San Lucas and the Cabo Corridor. Properties for sale by Baja International Realty."
        />
      </Helmet>
      <Navbar />

      <section className="pt-32 pb-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-accent uppercase tracking-wider mb-2 font-medium">
              Currently Available
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Active Office Listings
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore properties currently listed through our office in Cabo San Lucas and the Cabo Corridor
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {officeProperties.map((property) => (
              <Link key={property.id} to={`/office-listings/${property.id}`}>
                <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-0">
                  <div className="relative overflow-hidden" style={{ height: "400px" }}>
                    <img
                      src={property.image}
                      alt={property.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Purple Active badge — top left */}
                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                      <span className="bg-purple-600 text-white px-4 py-1.5 rounded text-sm font-semibold shadow-lg">
                        Active
                      </span>
                      {property.onOffer && (
                        <span className="bg-orange-500 text-white px-4 py-1.5 rounded text-sm font-bold shadow-lg animate-pulse">
                          🔥 Price Reduced
                        </span>
                      )}
                    </div>

                    {/* Red diagonal FOR SALE ribbon — top right */}
                    <div className="absolute top-0 right-0 w-28 h-28 overflow-hidden z-10">
                      <div className="absolute top-[22px] right-[-30px] w-[140px] bg-red-600 text-white text-[11px] font-bold text-center py-1.5 rotate-45 tracking-widest shadow-md">
                        FOR SALE
                      </div>
                    </div>

                    {/* Gradient overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/60 via-black/30 to-transparent pointer-events-none" />

                    {/* Property details */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
                      <div className="text-4xl font-bold mb-3">{property.price}</div>

                      <div className="flex items-center gap-4 mb-3 text-lg flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <Bed className="w-5 h-5" />
                          <span className="font-semibold">{property.beds} Beds</span>
                        </div>
                        <span className="text-white/60">•</span>
                        <div className="flex items-center gap-1.5">
                          <Bath className="w-5 h-5" />
                          <span className="font-semibold">{property.baths} Baths</span>
                        </div>
                        <span className="text-white/60">•</span>
                        <div className="flex items-center gap-1.5">
                          <Maximize className="w-5 h-5" />
                          <span className="font-semibold">{property.sqft} SF</span>
                        </div>
                      </div>

                      <div className="text-base mb-1 line-clamp-1 flex items-center gap-2">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        {property.title}
                      </div>
                      <div className="text-sm text-white/80">{property.address}</div>
                      <div className="text-xs text-white/60 mt-1">MLS# {property.mls}</div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OfficeListings;
