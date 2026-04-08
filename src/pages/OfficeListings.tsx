import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { fetchListings, convertMLSToPropertyCard } from "@/services/flexMlsService";

const CACHE_KEY = "office-listings-auto-v16";
const CACHE_TIME_KEY = `${CACHE_KEY}-time`;
const CACHE_TTL = 3 * 60 * 60 * 1000; // 3 hours
const ITEMS_PER_PAGE = 9;

// Primary: office name (confirmed via live API — all BIR listings have this)
// Fallback: exact email + phone per agent landing page (catches edge cases)
const BIR_AGENT_EMAILS = new Set([
  'don@bircabo.com',
  'erika@bircabo.com',
  'erikag@bircabo.com',
  'robertvanpatten2@gmail.com',
  'alfonso@bircabo.com',
  'bonnie@bircabo.com',
  'cabocharlie79@gmail.com',
  'cozbi@bajainternationalrealty.com',
  'david@bircabo.com',
  'edgar@bircabo.com',
  'fernando@bircabo.com',
  'hector@bircabo.com',
  'mtortricardi@gmail.com',
  'susu@bircabo.com',
]);

const cleanPhone = (p: string) => p.replace(/[^0-9]/g, '');

const BIR_AGENT_PHONES = new Set([
  '18082266120',
  '18589644629',
  '18582043115',
  '526121205289',
  '526241276012',
  '526121698328',
  '526241097909',
  '526241189512',
  '526241435555',
  '526241572154',
  '526242114879',
  '526242643896',
  '526243170297',
  '526641888681',
  '526241358900',
  '5216241276012',
].map(cleanPhone));

const FORCED_MLS_IDS = new Set([
  "25-3710", "25-4668", "25-4085", "25-5868", "26-1009",
  "24-2158", "25-4323", "25-5698", "25-4759", "25-4760",
  "24-1981", "24-5127", "25-5877", "25-1679", "25-3174",
  "24-4467", "25-2477", "25-2566",
]);

const isBIR = (listing: any) => {
  if (FORCED_MLS_IDS.has(listing.ListingId)) return true;

  const office = (listing.ListOfficeName || listing.OfficeName || '').toLowerCase();
  const coOffice = (listing.CoListOfficeName || '').toLowerCase();
  if (office.includes('baja international') || coOffice.includes('baja international')) return true;

  const email = (listing.ListAgentEmail || listing.AgentEmail || '').toLowerCase();
  if (email && BIR_AGENT_EMAILS.has(email)) return true;

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

        // Parallel fetch per zone — each gets its own pool so BIR listings aren't crowded out
        // Pacific zone added: confirmed BIR listings #24-2158, #25-5868, #25-5698, #25-2566 live there
        const [cslData, corridorData, sjdData, sjdCorrData, pacificData, eastCapeData] = await Promise.all([
          fetchListings({ limit: 500, city: 'Cabo San Lucas' }),
          fetchListings({ limit: 500, city: 'Cabo Corridor' }),
          fetchListings({ limit: 500, city: 'San Jose del Cabo' }),
          fetchListings({ limit: 200, city: 'San Jose Corridor' }),
          fetchListings({ limit: 200, city: 'Pacific' }),
          fetchListings({ limit: 200, city: 'East Cape' }),
        ]);

        // Merge all zones and deduplicate by ListingKey
        const seen = new Set<string>();
        const merged: any[] = [];
        for (const listing of [...cslData, ...corridorData, ...sjdData, ...sjdCorrData, ...pacificData, ...eastCapeData]) {
          if (!seen.has(listing.ListingKey)) {
            seen.add(listing.ListingKey);
            merged.push(listing);
          }
        }

        // Filter client-side for BIR office
        const birListings = merged.filter(isBIR);

        // Find which forced MLS IDs are missing from results and fetch them individually
        const foundIds = new Set(birListings.map((l: any) => l.ListingId));
        const missingIds = [...FORCED_MLS_IDS].filter(id => !foundIds.has(id));

        if (missingIds.length > 0) {
          const missingFetches = await Promise.all(
            missingIds.map(id => fetchListings({ search: id, limit: 1, allowInactive: true }))
          );
          const foundKeys = new Set(birListings.map((l: any) => l.ListingKey));
          for (const results of missingFetches) {
            for (const l of results) {
              if (!foundKeys.has(l.ListingKey)) {
                birListings.push(l);
                foundKeys.add(l.ListingKey);
              }
            }
          }
        }

        const converted = birListings.map((l: any) => ({
          ...convertMLSToPropertyCard(l),
          onOffer: l.ListingId === "25-4668"
        }));

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
