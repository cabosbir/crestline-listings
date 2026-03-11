import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Bed, Bath, Maximize, MapPin, ArrowLeft,
  ChevronLeft, ChevronRight, Phone, Mail, Share2
} from "lucide-react";

const officeListingsData = [
  {
    id: "marina-cabo-plaza",
    title: "Marina Cabo Plaza",
    address: "Paseo de la Marina 103, Cabo San Lucas",
    price: "$279,000",
    beds: 0,
    baths: 0,
    sqft: "421.58",
    mls: "25-4668",
    onOffer: true,
    images: [
      "/paseo-de-la-marina-1.jpg",
      "/paseo-de-la-marina-2.jpg",
      "/paseo-de-la-marina-3.jpg",
      "/paseo-de-la-marina-4.jpg",
      "/paseo-de-la-marina-5.jpg",
    ],
    description:
      "Great investment opportunity in a prime marina location. Just remodeled with new appliances and fresh paint. Walk out directly to the marina's best dining and night life. Enjoy the rooftop pool with stunning views of the city, the marina and direct access to fishing boats and ocean cruises.",
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
    images: [
      "/rivieri-positano-1.jpg",
      "/rivieri-positano-2.jpg",
      "/rivieri-positano-3.jpg",
      "/rivieri-positano-4.jpg",
      "/rivieri-positano-5.jpg",
    ],
    description:
      "Paradise in Cabo San Lucas! Independent Duplex with 2 Bedrooms, 2 Bathrooms, and Backyard at Rivieri Pueblo Mediterraneo. Contemporary Mediterranean style property in a secure gated community.",
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
    images: [
      "/las-cascadas-1.jpg",
      "/las-cascadas-2.jpg",
      "/las-cascadas-3.jpg",
      "/las-cascadas-4.jpg",
      "/las-cascadas-5.jpg",
    ],
    description:
      "Located within Cascadas Pedregal, one of the most sought after developments within Pedregal. Great Marina and ocean views. Outstanding amenities like infinity pool, large jacuzzi, state of the art gym. Seller financing available with 50% down and 3 years of annual payments of $100,000 plus 6% simple interest.",
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
    images: [
      "/la-vista-1.jpg",
      "/la-vista-2.jpg",
      "/la-vista-3.jpg",
      "/la-vista-4.jpg",
      "/la-vista-5.jpg",
    ],
    description:
      "Spacious Condo with Expansive Private Yard in Prime Cabo Location! This stunning condo offers 4,003 sq ft of living space, making it one of the most spacious options in its price range. Large covered patio, hurricane shutters included.",
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
    images: [
      "/blue-bay-1.jpg",
      "/blue-bay-2.jpg",
      "/blue-bay-3.jpg",
      "/blue-bay-4.jpg",
      "/blue-bay-5.jpg",
    ],
    description:
      "Located within the security gates of Pedregal with views of the bay, mountains and city lights at night. Short walk to town center. Full access to Pedregal amenities and semi-private Pacific beach. Very reasonable HOA dues that include water, propane and Pedregal security.",
  },
];

const PHONE = "+526241435555";
const EMAIL = "info@bircabo.com";

const OfficeListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [liveMLSData, setLiveMLSData] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (id === "marina-cabo-plaza") {
      fetch("/api/flexmls-listings?search=25-4668&limit=1")
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.results?.length > 0) {
            setLiveMLSData(data.results[0]);
          }
        })
        .catch(() => {});
    }
  }, [id]);

  const property = officeListingsData.find((p) => p.id === id);

  const displayProperty = property && liveMLSData
    ? {
        ...property,
        price: `$${Number(liveMLSData.ListPrice).toLocaleString()}`,
        beds: liveMLSData.BedroomsTotal ?? property.beds,
        baths: liveMLSData.BathroomsFull ?? property.baths,
        sqft: liveMLSData.LivingArea
          ? Number(liveMLSData.LivingArea).toFixed(2)
          : property.sqft,
        address: liveMLSData.UnparsedAddress ?? property.address,
        description: liveMLSData.PublicRemarks ?? property.description,
      }
    : property;

  const nextImage = () => {
    if (property) {
      setCurrentImageIndex((prev) =>
        prev === property.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (property) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? property.images.length - 1 : prev - 1
      );
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property?.title,
          text: `${property?.title} — ${property?.price}`,
          url: window.location.href,
        });
      } catch (_) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-4xl font-bold mb-4">Property Not Found</h1>
            <p className="text-muted-foreground mb-6">
              We couldn't find this listing. It may have been removed or the URL is incorrect.
            </p>
            <Button onClick={() => navigate("/office-listings")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Office Listings
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{`${displayProperty!.title} — ${displayProperty!.price} | Baja International Realty`}</title>
        <meta
          name="description"
          content={`${displayProperty!.title} for sale at ${displayProperty!.price}. ${displayProperty!.beds} bed, ${displayProperty!.baths} bath, ${displayProperty!.sqft} SF. MLS# ${displayProperty!.mls}. ${displayProperty!.description.substring(0, 120)}...`}
        />
      </Helmet>

      <Navbar />

      {/* Top nav bar */}
      <div className="container mx-auto px-4 pt-32 pb-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/office-listings")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Office Listings
          </Button>
          <Button variant="ghost" size="icon" onClick={handleShare} className="mb-4 hover:bg-accent/10">
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Image Carousel */}
      <section className="pb-12">
        <div className="container mx-auto px-4">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ height: "500px" }}>
            <img
              src={displayProperty!.images[currentImageIndex]}
              alt={`${displayProperty!.title} — photo ${currentImageIndex + 1}`}
              className="w-full h-full object-cover transition-opacity duration-300"
              onError={(e) => {
                e.currentTarget.src =
                  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&h=1000&fit=crop";
              }}
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
              <span className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold shadow-lg">
                Active
              </span>
              {displayProperty!.onOffer && (
                <span className="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg animate-pulse">
                  🔥 Price Reduced
                </span>
              )}
              <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold shadow-lg">
                For Sale
              </span>
              <span className="bg-accent text-accent-foreground px-4 py-2 rounded-lg font-semibold shadow-lg">
                MLS# {displayProperty!.mls}
              </span>
            </div>

            {/* Image counter */}
            <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-lg text-sm font-semibold">
              {currentImageIndex + 1} / {displayProperty!.images.length}
            </div>
          </div>

          {/* Navigation + Thumbnails */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button variant="outline" size="lg" onClick={prevImage} className="rounded-xl shadow-lg">
              <ChevronLeft className="h-6 w-6" />
              Previous
            </Button>

            <div className="flex gap-2">
              {displayProperty!.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    index === currentImageIndex
                      ? "bg-accent w-8"
                      : "bg-gray-300 hover:bg-gray-400 w-2.5"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>

            <Button variant="outline" size="lg" onClick={nextImage} className="rounded-xl shadow-lg">
              Next
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-5 gap-4 mt-6">
            {displayProperty!.images.map((img, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`relative h-24 rounded-lg overflow-hidden transition-all ${
                  index === currentImageIndex
                    ? "ring-4 ring-accent scale-105"
                    : "opacity-70 hover:opacity-100 hover:ring-2 ring-gray-300 hover:scale-105"
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=200&h=150&fit=crop";
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Property Details */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main content */}
            <div className="lg:col-span-2">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-4xl md:text-5xl font-bold mb-3">{displayProperty!.title}</h1>
                <div className="text-4xl font-bold text-accent mb-4">{displayProperty!.price}</div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-5 h-5 flex-shrink-0" />
                  <span className="text-lg">{displayProperty!.address}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-secondary border border-border rounded-xl p-4 text-center hover:shadow-lg transition-shadow">
                  <Bed className="w-6 h-6 mx-auto mb-2 text-accent" />
                  <div className="text-sm text-muted-foreground">Bedrooms</div>
                  <div className="text-2xl font-bold">{displayProperty!.beds}</div>
                </div>
                <div className="bg-secondary border border-border rounded-xl p-4 text-center hover:shadow-lg transition-shadow">
                  <Bath className="w-6 h-6 mx-auto mb-2 text-accent" />
                  <div className="text-sm text-muted-foreground">Bathrooms</div>
                  <div className="text-2xl font-bold">{displayProperty!.baths}</div>
                </div>
                <div className="bg-secondary border border-border rounded-xl p-4 text-center hover:shadow-lg transition-shadow">
                  <Maximize className="w-6 h-6 mx-auto mb-2 text-accent" />
                  <div className="text-sm text-muted-foreground">Size</div>
                  <div className="text-xl font-bold">{displayProperty!.sqft} SF</div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-4">About This Property</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {displayProperty!.description}
                </p>
              </div>

              {/* Additional details */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-6">Property Details</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-secondary rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">MLS Number</div>
                    <div className="font-semibold">{displayProperty!.mls}</div>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Status</div>
                    <div className="font-semibold text-purple-600">Active</div>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Size</div>
                    <div className="font-semibold">{displayProperty!.sqft} SF</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-32">
                <div className="bg-card border border-border rounded-2xl p-6 shadow-elegant">
                  <h3 className="text-2xl font-bold mb-2">Interested in this property?</h3>
                  <p className="text-muted-foreground mb-6">
                    Contact us today to schedule a viewing or request more information.
                  </p>

                  <div className="space-y-3 mb-6">
                    <a href={`tel:${PHONE}`} className="block">
                      <Button variant="luxury" size="lg" className="w-full">
                        <Phone className="w-4 h-4 mr-2" />
                        Call Us
                      </Button>
                    </a>

                    <a
                      href={`https://wa.me/${PHONE.replace("+", "")}?text=${encodeURIComponent(
                        `Hi! I'm interested in ${displayProperty!.title} (MLS# ${displayProperty!.mls}) listed at ${displayProperty!.price}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button variant="outline" size="lg" className="w-full border-green-500 text-green-600 hover:bg-green-50">
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        WhatsApp
                      </Button>
                    </a>

                    <a href={`mailto:${EMAIL}?subject=${encodeURIComponent(`Inquiry: ${displayProperty!.title} MLS# ${displayProperty!.mls}`)}&body=${encodeURIComponent(`Hi, I'm interested in ${displayProperty!.title} listed at ${displayProperty!.price} (MLS# ${displayProperty!.mls}). Please send me more information.`)}`} className="block">
                      <Button variant="outline" size="lg" className="w-full">
                        <Mail className="w-4 h-4 mr-2" />
                        Email Us
                      </Button>
                    </a>
                  </div>

                  <div className="border-t border-border pt-5 space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>MLS#</span>
                      <span className="font-semibold text-foreground">{displayProperty!.mls}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Price</span>
                      <span className="font-semibold text-foreground">{displayProperty!.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status</span>
                      <span className="font-semibold text-purple-600">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OfficeListingDetail;
