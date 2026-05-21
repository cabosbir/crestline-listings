import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { fetchListings, convertMLSToPropertyCard } from "@/services/flexMlsService";

const CACHE_KEY = "pacifico-heights-listings-v1";
const CACHE_TIME_KEY = `${CACHE_KEY}-time`;
const CACHE_TTL = 3 * 60 * 60 * 1000;
const ITEMS_PER_PAGE = 9;

const HERO_IMAGES = [
  "/pacifico-heights-1.jpg",
  "/pacifico-heights-2.jpg",
  "/pacifico-heights-3.jpg",
];

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&h=900&fit=crop";


const PacificoHeights = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextImage = () => setCurrentImageIndex(prev => (prev + 1) % HERO_IMAGES.length);
  const prevImage = () => setCurrentImageIndex(prev => (prev === 0 ? HERO_IMAGES.length - 1 : prev - 1));

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

        const mlsData = await fetchListings({ subdivisions: 'Pacifico Heights', limit: 500 });
        const converted = mlsData.map(convertMLSToPropertyCard);

        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(converted));
          localStorage.setItem(CACHE_TIME_KEY, now.toString());
        } catch (_) {}

        setListings(converted);
      } catch (error) {
        console.error("Failed to load Pacifico Heights listings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadListings();
  }, []);

  // Pagination
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
      for (let i = 1; i <= totalPages; i++) pages.push(i);
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
        <title>Pacifico Heights | Baja International Realty</title>
        <meta
          name="description"
          content="Explore available properties in Pacifico Heights, Pacific zone. Prime development land and luxury listings by Baja International Realty."
        />
      </Helmet>
      <Navbar />

      {/* ==================== HERO CAROUSEL ==================== */}
      <section className="pt-20">
        <div className="relative overflow-hidden" style={{ height: "600px" }}>
          <img
            src={HERO_IMAGES[currentImageIndex]}
            alt={`Pacifico Heights — photo ${currentImageIndex + 1}`}
            className="w-full h-full object-cover transition-opacity duration-500"
            onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Title overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
            <p className="text-accent uppercase tracking-widest mb-3 font-medium text-sm">
              Pacific Zone · Baja California Sur
            </p>
            <h1 className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-lg">
              Pacifico Heights
            </h1>
            <p className="text-xl text-white/90 max-w-2xl drop-shadow">
              Premier development land and luxury properties with breathtaking Pacific Ocean views
            </p>
          </div>

          {/* Prev / Next */}
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {HERO_IMAGES.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`rounded-full transition-all ${
                  index === currentImageIndex
                    ? "bg-white w-8 h-2.5"
                    : "bg-white/50 w-2.5 h-2.5 hover:bg-white/80"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>

          {/* Image counter */}
          <div className="absolute bottom-6 right-6 bg-black/60 text-white px-3 py-1.5 rounded-lg text-sm font-semibold">
            {currentImageIndex + 1} / {HERO_IMAGES.length}
          </div>
        </div>
      </section>

      {/* ==================== LISTINGS ==================== */}
      <section className="listings-section pt-20 pb-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-accent uppercase tracking-wider mb-2 font-medium">
              Available Now
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Pacifico Heights Properties
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Development land and luxury properties in one of Baja's most sought-after Pacific-facing communities
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin mb-4 text-accent" />
              <p className="text-lg text-muted-foreground">Loading Pacifico Heights listings...</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground">No listings available at this time.</p>
            </div>
          ) : (
            <>
              <p className="text-center text-sm text-muted-foreground mb-8">
                {listings.length} active listing{listings.length !== 1 ? "s" : ""}
              </p>
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
                    <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="h-10 px-3">
                      <ChevronLeft className="h-4 w-4" />
                      <span className="ml-1 hidden sm:inline">Previous</span>
                    </Button>
                    {getPageNumbers().map((page, index) => {
                      if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                        return <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">...</span>;
                      }
                      return (
                        <Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" onClick={() => handlePageChange(page as number)} className="h-10 w-10 p-0">
                          {page}
                        </Button>
                      );
                    })}
                    <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="h-10 px-3">
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

export default PacificoHeights;
