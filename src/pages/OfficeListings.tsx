import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { fetchListings, convertMLSToPropertyCard } from "@/services/flexMlsService";

const CACHE_KEY = "office-listings-auto-v8";
const CACHE_TIME_KEY = `${CACHE_KEY}-time`;
const CACHE_TTL = 3 * 60 * 60 * 1000; // 3 hours
const ITEMS_PER_PAGE = 9;

// Known BIR agent last names — catches listings where ListOfficeName is blank/different
// Same technique agent landing pages use with nameMatch
// All BIR agent identifiers — last names or first-name keywords matching each landing page's nameMatch
const BIR_AGENT_NAMES = [
  'weis',       // Don Weis
  'aispuro',    // Erika Aispuro
  'graciano',   // Erika Graciano
  'van patten', // Bob Van Patten
  'vanpatten',  // Bob Van Patten (no space variant)
  'puente',     // Alfonso Puente
  'bonnie',     // Bonnie Renee G.
  'renee',      // Bonnie Renee G.
  'jones',      // Charles Jones
  'sanchez',    // Cozbi Sanchez
  'piper',      // David Scott Piper
  'pacheco',    // Edgar Pacheco
  'cabrera',    // Fernando Cabrera
  'mendoza',    // Hector Mendoza
  'tort',       // Marisol Tort
  'vieira',     // Susu Vieira
];

const isBIR = (listing: any) => {
  const office = (listing.ListOfficeName || listing.OfficeName || '').toLowerCase();
  const coOffice = (listing.CoListOfficeName || '').toLowerCase();
  const agentName = (listing.ListAgentFullName || listing.ListAgentName || listing.AgentName || '').toLowerCase();
  const coAgentName = (listing.CoListAgentFullName || '').toLowerCase();

  const officeMatch = office.includes('baja international') || coOffice.includes('baja international');
  const agentMatch = BIR_AGENT_NAMES.some(n => agentName.includes(n) || coAgentName.includes(n));

  return officeMatch || agentMatch;
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
