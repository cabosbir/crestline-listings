import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { fetchListings, convertMLSToPropertyCard } from "@/services/flexMlsService";

const CACHE_KEY = "office-listings-auto-v4";
const CACHE_TIME_KEY = `${CACHE_KEY}-time`;
const CACHE_TTL = 3 * 60 * 60 * 1000; // 3 hours

const OfficeListings = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadListings = async () => {
      setIsLoading(true);

      try {
        const cached = localStorage.getItem(CACHE_KEY);
        const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
        const now = Date.now();

        if (cached && cachedTime && now - parseInt(cachedTime) < CACHE_TTL) {
          setListings(JSON.parse(cached));
          setIsLoading(false);
          return;
        }

        // Fetch a large batch of active listings, then filter client-side by office name
        const mlsData = await fetchListings({ limit: 500 });

        const birListings = mlsData.filter((listing: any) => {
          const listOfficeName = listing.ListOfficeName || listing.OfficeName || '';
          const coListOfficeName = listing.CoListOfficeName || '';
          return (
            listOfficeName.toLowerCase().includes('baja international') ||
            coListOfficeName.toLowerCase().includes('baja international')
          );
        });

        const converted = birListings.map(convertMLSToPropertyCard);

        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(converted));
          localStorage.setItem(CACHE_TIME_KEY, now.toString());
        } catch (_) {}

        setListings(converted);
      } catch (error) {
        console.error("Failed to load office listings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadListings();
  }, []);

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
              Explore properties currently listed through our office in Cabo San
              Lucas and the Cabo Corridor
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin mb-4 text-accent" />
              <p className="text-lg text-muted-foreground">
                Loading office listings...
              </p>
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground">
                No listings available at this time.
              </p>
            </div>
          ) : (
            <>
              <p className="text-center text-sm text-muted-foreground mb-8">
                {listings.length} active listing
                {listings.length !== 1 ? "s" : ""}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {listings.map((property) => (
                  <PropertyCard key={property.id} {...property} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OfficeListings;
