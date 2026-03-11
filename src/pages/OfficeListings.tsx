import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { fetchListings, convertMLSToPropertyCard } from "@/services/flexMlsService";

const CACHE_KEY = "office-listings-auto-v9";
const CACHE_TIME_KEY = `${CACHE_KEY}-time`;
const CACHE_TTL = 3 * 60 * 60 * 1000; // 3 hours
const ITEMS_PER_PAGE = 9;

// Exact emails of every BIR agent — no false positives possible
// Sourced from each agent's landing page agentIdentifiers.email
const BIR_AGENT_EMAILS = new Set([
  'don@bircabo.com',
  'eaispuro80@gmail.com',        // Erika Aispuro
  'erikag@bircabo.com',          // Erika Graciano
  'robertvanpatten2@gmail.com',  // Bob Van Patten
  'alfonso@bircabo.com',
  'bonnie@bircabo.com',
  'cabocharlie79@gmail.com',     // Charles Jones
  'cozbi@bajainternationalrealty.com',
  'david@bircabo.com',
  'edgar@bircabo.com',
  'fernando@bircabo.com',
  'hector@bircabo.com',
  'mtortricardi@gmail.com',      // Marisol Tort
  'susu@bircabo.com',
]);

const cleanPhone = (p: string) => p.replace(/[^0-9]/g, '');

// Exact phones as fallback (some agents may not have email in MLS)
const BIR_AGENT_PHONES = new Set([
  '18082266120',   // Alfonso
  '18589644629',   // Bob Van Patten
  '18582043115',   // Bob Van Patten alt
  '526121205289',  // Cozbi
  '526241276012',  // Don / Edgar alt
  '526121698328',  // Fernando
  '526241097909',  // Hector
  '526241189512',  // Erika Aispuro
  '526241435555',  // Don Weis
  '526241572154',  // Erika Graciano
  '526242114879',  // Marisol
  '526242643896',  // Susu
  '526243170297',  // Bonnie Renee
  '526641888681',  // David Scott Piper
  '526241358900',  // Charles Jones (cabocharlie)
  '5216241276012', // Edgar alt (+52 1 624...)
].map(cleanPhone));

const isBIR = (listing: any) => {
  // 1. Office name match (most reliable primary signal)
  const office = (listing.ListOfficeName || listing.OfficeName || '').toLowerCase();
  const coOffice = (listing.CoListOfficeName || '').toLowerCase();
  if (office.includes('baja international') || coOffice.includes('baja international')) return true;

  // 2. Exact email match — no false positives (same method each agent page uses)
  const email = (listing.ListAgentEmail || listing.AgentEmail || '').toLowerCase();
  if (BIR_AGENT_EMAILS.has(email)) return true;

  // 3. Exact phone match — fallback for when email is absent
  const phone = cleanPhone(listing.ListAgentPhone || listing.AgentPhone || '');
  if (phone && BIR_AGENT_PHONES.has(phone)) return true;

  return false;
};

const OfficeListings = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

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

        // Parallel fetch per zone — each zone gets its own limit:500 pool
        // Mirrors agent pages exactly (Erika/Don use city:'Cabo San Lucas' and get 12/11)
        const [cslData, corridorData, sjdData, sjdCorrData, eastCapeData] = await Promise.all([
          fetchListings({ limit: 500, city: 'Cabo San Lucas' }),
          fetchListings({ limit: 500, city: 'Cabo Corridor' }),
          fetchListings({ limit: 500, city: 'San Jose del Cabo' }),
          fetchListings({ limit: 200, city: 'San Jose Corridor' }),
          fetchListings({ limit: 200, city: 'East Cape' }),
        ]);

        // Merge all zones and deduplicate by ListingKey
        const seen = new Set<string>();
        const merged: any[] = [];
        for (const listing of [...cslData, ...corridorData, ...sjdData, ...sjdCorrData, ...eastCapeData]) {
          if (!seen.has(listing.ListingKey)) {
            seen.add(listing.ListingKey);
            merged.push(listing);
          }
        }

        // Filter client-side for BIR office — same technique as agent landing pages
        const birListings = merged.filter(isBIR);
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

  // ==================== PAGINATION ====================
  const totalPages = Math.ceil(listings.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const displayedListings = listings.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document.querySelector('.listings-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage <= 3) {
        pages.push(2, 3, 4);
        pages.push('ellipsis-end');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push('ellipsis-start');
        pages.push(totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push('ellipsis-start');
        pages.push(currentPage - 1, currentPage, currentPage + 1);
        pages.push('ellipsis-end');
        pages.push(totalPages);
      }
    }

    return pages;
  };

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

      <section className="listings-section pt-32 pb-24 bg-background">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                {displayedListings.map((property) => (
                  <PropertyCard key={property.id} {...property} currentPage={currentPage} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex flex-col items-center gap-4 my-8">
                  <div className="text-sm text-muted-foreground">
                    Showing {indexOfFirstItem + 1}–{Math.min(indexOfLastItem, listings.length)} of {listings.length} properties
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="h-10 px-3"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="ml-1 hidden sm:inline">Previous</span>
                    </Button>

                    {getPageNumbers().map((page, index) => {
                      if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                        return <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">...</span>;
                      }
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page as number)}
                          className="h-10 w-10 p-0"
                        >
                          {page}
                        </Button>
                      );
                    })}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="h-10 px-3"
                    >
                      <span className="mr-1 hidden sm:inline">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OfficeListings;
