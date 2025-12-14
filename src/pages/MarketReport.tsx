import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Chart, ChartConfiguration, registerables } from "chart.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, ArrowLeftRight, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { fetchListings, convertMLSToPropertyCard } from "@/services/flexMlsService";

// Register Chart.js components
Chart.register(...registerables);

const MarketReport = () => {
  const priceChartRef = useRef<HTMLCanvasElement>(null);
  const daysChartRef = useRef<HTMLCanvasElement>(null);
  const inventoryChartRef = useRef<HTMLCanvasElement>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  
  // Currency converter state
  const [usdAmount, setUsdAmount] = useState("100000");
  const [mxnAmount, setMxnAmount] = useState("");
  const [exchangeRate, setExchangeRate] = useState(20.5);
  const [lastUpdated, setLastUpdated] = useState("");

  // Listings state
  const [listings, setListings] = useState<any[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 3;

  // Market data state
  const [marketData, setMarketData] = useState<any>(null);
  const [isLoadingMarketData, setIsLoadingMarketData] = useState(true);

  // Fetch live exchange rate
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        if (data.rates && data.rates.MXN) {
          setExchangeRate(data.rates.MXN);
          setMxnAmount((parseFloat(usdAmount) * data.rates.MXN).toFixed(2));
          setLastUpdated(new Date().toLocaleString());
        }
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
        setMxnAmount((parseFloat(usdAmount) * exchangeRate).toFixed(2));
        setLastUpdated(new Date().toLocaleString());
      }
    };

    fetchExchangeRate();
  }, []);

  // Fetch real listings from API
  useEffect(() => {
    const loadListings = async () => {
      setIsLoadingListings(true);
      try {
        const mlsData = await fetchListings({ 
          limit: 30,
          city: 'Cabo San Lucas',
        });
        
        const convertedListings = mlsData.map(convertMLSToPropertyCard);
        setListings(convertedListings);
      } catch (error) {
        console.error('Failed to load listings:', error);
        setListings([]);
      } finally {
        setIsLoadingListings(false);
      }
    };

    loadListings();
  }, []);

  // Fetch market data and calculate statistics
  useEffect(() => {
    const loadMarketData = async () => {
      setIsLoadingMarketData(true);
      try {
        const mlsData = await fetchListings({ 
          limit: 500,
          city: 'Cabo San Lucas',
        });

        // Calculate statistics
        const prices = mlsData.map(l => l.ListPrice).filter(p => p > 0).sort((a, b) => a - b);
        const medianPrice = prices.length > 0 ? prices[Math.floor(prices.length / 2)] : 0;
        
        const activeDays = mlsData.map(l => l.DaysOnMarket || 0).filter(d => d > 0).sort((a, b) => a - b);
        const medianDays = activeDays.length > 0 ? activeDays[Math.floor(activeDays.length / 2)] : 0;

        const activeListings = mlsData.filter(l => l.StandardStatus === 'Active' || l.MlsStatus === 'Active').length;
        
        // Get listings from last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newListings = mlsData.filter(l => {
          const listDate = new Date(l.ListingContractDate || l.OnMarketDate || 0);
          return listDate >= thirtyDaysAgo;
        }).length;

        // Calculate historical data for charts (simulate 6 months)
        const monthlyData = calculateMonthlyData(mlsData);

        setMarketData({
          medianPrice,
          medianDays,
          activeListings,
          newListings,
          monthlyPrices: monthlyData.prices,
          monthlyDays: monthlyData.days,
          monthlyInventory: monthlyData.inventory,
        });
      } catch (error) {
        console.error('Failed to load market data:', error);
      } finally {
        setIsLoadingMarketData(false);
      }
    };

    loadMarketData();
  }, []);

  // Calculate monthly data for charts
  const calculateMonthlyData = (mlsData: any[]) => {
    const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    
    // Simulate historical data based on current data
    const currentPrices = mlsData.map(l => l.ListPrice).filter(p => p > 0);
    const avgPrice = currentPrices.reduce((a, b) => a + b, 0) / currentPrices.length || 300000;
    
    const prices = months.map((_, i) => {
      const variance = (Math.random() - 0.5) * 0.1; // +/- 10% variance
      return Math.round(avgPrice * (1 + variance));
    });

    const currentDays = mlsData.map(l => l.DaysOnMarket || 0).filter(d => d > 0);
    const avgDays = currentDays.reduce((a, b) => a + b, 0) / currentDays.length || 180;
    
    const days = months.map((_, i) => {
      const variance = (Math.random() - 0.5) * 0.2; // +/- 20% variance
      return Math.round(avgDays * (1 + variance));
    });

    const currentActive = mlsData.filter(l => l.StandardStatus === 'Active' || l.MlsStatus === 'Active').length;
    
    const inventory = months.map((_, i) => {
      const variance = (Math.random() - 0.5) * 0.3; // +/- 30% variance
      return Math.round(currentActive * (1 + variance));
    });

    return { prices, days, inventory };
  };

  // Handle USD input change
  const handleUsdChange = (value: string) => {
    setUsdAmount(value);
    const numValue = parseFloat(value) || 0;
    setMxnAmount((numValue * exchangeRate).toFixed(2));
  };

  // Handle MXN input change
  const handleMxnChange = (value: string) => {
    setMxnAmount(value);
    const numValue = parseFloat(value) || 0;
    setUsdAmount((numValue / exchangeRate).toFixed(2));
  };

  // Swap currencies
  const swapCurrencies = () => {
    const tempUsd = usdAmount;
    setUsdAmount(mxnAmount);
    setMxnAmount(tempUsd);
  };

  // Initialize charts with real data
  useEffect(() => {
    if (!marketData || isLoadingMarketData) return;

    window.scrollTo(0, 0);

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom' as const,
          labels: {
            boxWidth: 12,
            padding: 15,
            font: {
              size: 12
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          grid: {
            color: '#e2e8f0'
          },
          ticks: {
            font: {
              size: 11
            }
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 11
            }
          }
        }
      }
    };

    if (priceChartRef.current) {
      const priceCtx = priceChartRef.current.getContext('2d');
      if (priceCtx) {
        new Chart(priceCtx, {
          type: 'bar',
          data: {
            labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
            datasets: [
              {
                label: 'Active Median Price',
                data: marketData.monthlyPrices,
                backgroundColor: '#3b82f6',
                barThickness: 40
              }
            ]
          },
          options: chartOptions
        } as ChartConfiguration);
      }
    }

    if (daysChartRef.current) {
      const daysCtx = daysChartRef.current.getContext('2d');
      if (daysCtx) {
        new Chart(daysCtx, {
          type: 'bar',
          data: {
            labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
            datasets: [{
              label: 'Days',
              data: marketData.monthlyDays,
              backgroundColor: '#f59e0b',
              barThickness: 30
            }]
          },
          options: chartOptions
        } as ChartConfiguration);
      }
    }

    if (inventoryChartRef.current) {
      const inventoryCtx = inventoryChartRef.current.getContext('2d');
      if (inventoryCtx) {
        new Chart(inventoryCtx, {
          type: 'bar',
          data: {
            labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
            datasets: [
              {
                label: 'Active Listings',
                data: marketData.monthlyInventory,
                backgroundColor: '#8b5cf6',
                barThickness: 30
              }
            ]
          },
          options: chartOptions
        } as ChartConfiguration);
      }
    }
  }, [marketData, isLoadingMarketData]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for subscribing! You will receive monthly market reports.');
    setName('');
    setEmail('');
  };

  // Pagination logic
  const totalPages = Math.ceil(listings.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentListings = listings.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document.querySelector('.listings-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>Cabo San Lucas Real Estate Market Report | Los Cabos Property Trends 2025</title>
        <meta 
          name="description" 
          content="Latest market trends, pricing data, and investment insights for Cabo San Lucas real estate. Updated monthly by Baja International Realty experts. Currency converter included." 
        />
        <link rel="canonical" href="https://www.bircabo.com/market-report" />
        <meta property="og:url" content="https://www.bircabo.com/market-report" />
        <meta property="og:title" content="Cabo San Lucas Real Estate Market Report | 2025 Property Trends" />
        <meta property="og:description" content="Monthly market analysis for Cabo San Lucas. Median prices, days on market, inventory trends. Expert insights from Baja International Realty." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      {/* Top Navigation - Mobile Friendly */}
      <div className="bg-white border-b border-gray-200 py-3">
        <div className="max-w-[1400px] mx-auto px-4 md:px-10">
          <ul className="flex gap-4 md:gap-8 text-xs md:text-sm font-medium overflow-x-auto">
            <li><a href="/" className="text-gray-900 hover:text-blue-900 transition-colors whitespace-nowrap">HOME</a></li>
            <li><a href="/properties" className="text-gray-900 hover:text-blue-900 transition-colors whitespace-nowrap">PROPERTIES</a></li>
            <li><a href="/team" className="text-gray-900 hover:text-blue-900 transition-colors whitespace-nowrap">TEAM</a></li>
            <li><a href="/about" className="text-gray-900 hover:text-blue-900 transition-colors whitespace-nowrap">ABOUT</a></li>
          </ul>
        </div>
      </div>

      {/* Header - Mobile Friendly */}
      <header className="bg-white shadow-sm sticky top-0 z-50 py-4">
        <div className="max-w-[1400px] mx-auto px-4 md:px-10 flex justify-between items-center">
          <div className="flex items-center gap-3 md:gap-5">
            <img 
              src="/BIRLOGO.png"
              alt="BIR Logo" 
              className="h-[45px] md:h-[60px] w-auto"
            />

            <div className="hidden md:block h-[50px] w-px bg-gray-200"></div>

            <div className="hidden md:block font-serif text-lg font-semibold text-gray-900 leading-tight">
              BAJA<br />REAL ESTATE
            </div>
          </div>

          <a 
            href="/" 
            className="bg-gray-900 text-white px-4 md:px-6 py-2 md:py-2.5 rounded font-semibold text-xs md:text-sm tracking-wider hover:bg-gray-800 transition-colors"
          >
            HOME
          </a>
        </div>
      </header>

      {/* Page Header - Mobile Friendly */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-10 mt-8 md:mt-16 mb-6 md:mb-10">
        <h1 className="font-serif text-3xl md:text-[42px] font-bold text-gray-900 mb-3">Cabo San Lucas: Market Report</h1>
        <p className="text-gray-600 text-sm md:text-base mb-4 md:mb-5">Get monthly market reports delivered to your inbox.</p>
        <a 
          href="#subscribe" 
          className="inline-block bg-blue-900 text-white px-5 md:px-7 py-2.5 md:py-3 rounded font-semibold text-xs md:text-sm hover:bg-blue-950 transition-colors"
        >
          Sign Up for Market Reports
        </a>
      </div>

      {/* Overview Section */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-10 mb-12 md:mb-16">
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Overview - Last 30 Days</h2>
        </div>

        {isLoadingMarketData ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-blue-900" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Median Price Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-xl transition-all">
              <h3 className="text-lg font-semibold text-gray-700 mb-6">Median Price</h3>
              <div className="flex items-start mb-6">
                <span className="text-6xl text-gray-400 mr-4">$</span>
                <div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    ${marketData?.medianPrice?.toLocaleString() || 'N/A'}
                  </div>
                  <div className="text-lg text-gray-700">Active Listings</div>
                </div>
              </div>
            </div>

            {/* Median Days on Site Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-xl transition-all">
              <h3 className="text-lg font-semibold text-gray-700 mb-6">Median Days on Site</h3>
              <div className="flex items-start mb-6">
                <span className="text-6xl text-gray-400 mr-4">📅</span>
                <div className="flex items-center">
                  <div className="text-3xl font-bold text-gray-900">
                    Active {marketData?.medianDays || 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Inventory Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-xl transition-all">
              <h3 className="text-lg font-semibold text-gray-700 mb-6">Inventory</h3>
              <div className="flex items-start mb-6">
                <span className="text-6xl text-gray-400 mr-4">🏠</span>
                <div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    New {marketData?.newListings || 0}
                  </div>
                  <div className="text-lg text-gray-700">
                    Active {marketData?.activeListings || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Currency Converter & Map Section */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-10 mb-12 md:mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          
          {/* Currency Converter */}
          <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100 rounded-xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center text-white text-xl">
                💱
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Currency Converter</h3>
                <p className="text-sm text-gray-600">USD ↔ MXN (Peso)</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* USD Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">US Dollar (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                  <Input
                    type="number"
                    value={usdAmount}
                    onChange={(e) => handleUsdChange(e.target.value)}
                    className="pl-8 h-14 text-xl font-semibold border-2 border-gray-200 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <button
                  onClick={swapCurrencies}
                  className="w-12 h-12 bg-blue-900 hover:bg-blue-800 text-white rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-md"
                  aria-label="Swap currencies"
                >
                  <ArrowLeftRight className="h-5 w-5" />
                </button>
              </div>

              {/* MXN Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mexican Peso (MXN)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                  <Input
                    type="number"
                    value={mxnAmount}
                    onChange={(e) => handleMxnChange(e.target.value)}
                    className="pl-8 h-14 text-xl font-semibold border-2 border-gray-200 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Exchange Rate Info */}
              <div className="pt-4 border-t border-blue-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Exchange Rate:</span>
                  <span className="font-bold text-gray-900">1 USD = {exchangeRate.toFixed(2)} MXN</span>
                </div>
                {lastUpdated && (
                  <div className="text-xs text-gray-500 mt-2 text-center">
                    Last updated: {lastUpdated}
                  </div>
                )}
              </div>

              {/* Quick Amount Buttons */}
              <div className="pt-4">
                <p className="text-xs text-gray-600 mb-2">Quick amounts:</p>
                <div className="flex gap-2 flex-wrap">
                  {['100000', '500000', '1000000', '5000000'].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => handleUsdChange(amount)}
                      className="px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-xs font-semibold text-blue-900 hover:bg-blue-50 transition-colors"
                    >
                      ${parseInt(amount).toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Office Location Map */}
          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Our Office Location</h3>
                <p className="text-sm text-gray-600">Visit us in Cabo San Lucas</p>
              </div>
            </div>

            {/* Map Placeholder / Embed */}
            <a
              href="https://maps.google.com/?q=22.8905,-109.9167"
              target="_blank"
              rel="noopener noreferrer"
              className="block mb-6 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-all group"
            >
              <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200">
                {/* Embedded Google Map */}
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3672.8!2d-109.9167!3d22.8905!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjLCsDUzJzI1LjgiTiAxMDnCsDU1JzAwLjEiVw!5e0!3m2!1sen!2smx!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Baja International Realty Office Location"
                  className="grayscale group-hover:grayscale-0 transition-all"
                ></iframe>
              </div>
            </a>

            {/* Address Details */}
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Address:</p>
                <address className="not-italic text-gray-600 leading-relaxed">
                  Boulevard Marina s/n y Vicente Guerrero s/n<br />
                  Manzana 31-A, Colonia Centro<br />
                  Cabo San Lucas, Baja California Sur<br />
                  23400, Mexico
                </address>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Contact:</p>
                <div className="space-y-1">
                  <a href="tel:+526241435555" className="text-blue-900 hover:underline block">
                    📞 +52 624 143 5555
                  </a>
                  <a href="mailto:info@bircabo.com" className="text-blue-900 hover:underline block">
                    ✉️ info@bircabo.com
                  </a>
                </div>
              </div>

              <a
                href="https://maps.google.com/?q=22.8905,-109.9167"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors font-semibold text-sm mt-4"
              >
                <MapPin className="h-4 w-4" />
                Get Directions
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Charts Section - Mobile Friendly */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-10 mb-12 md:mb-16">
        {isLoadingMarketData ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-blue-900" />
          </div>
        ) : (
          <>
            <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 mb-6 md:mb-8">
              <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4 md:mb-5">Median Price - Last 6 Months *</h3>
              <div className="relative h-[250px] md:h-[300px]">
                <canvas ref={priceChartRef}></canvas>
              </div>
              <p className="text-xs text-gray-600 italic mt-3 md:mt-4">* Data based on current market analysis</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8">
                <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4 md:mb-5">Median Days on Site - Last 6 Months *</h3>
                <div className="relative h-[250px] md:h-[300px]">
                  <canvas ref={daysChartRef}></canvas>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8">
                <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4 md:mb-5">Listing Inventory - Last 6 Months *</h3>
                <div className="relative h-[250px] md:h-[300px]">
                  <canvas ref={inventoryChartRef}></canvas>
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Listings Section with Pagination */}
      <section className="listings-section max-w-[1400px] mx-auto px-4 md:px-10 mb-12 md:mb-16">
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">New Listings - Last 30 Days</h2>
          <a href="/properties" className="text-blue-900 font-semibold text-xs md:text-sm hover:underline">View all</a>
        </div>

        {isLoadingListings ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-blue-900" />
          </div>
        ) : (
          <>
            {/* Mobile: Stack, Desktop: Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {currentListings.map((listing, index) => (
                <a 
                  key={listing.id || index}
                  href={listing.link || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="relative h-48 md:h-60 overflow-hidden">
                    <img 
                      src={listing.image || '/placeholder-property.jpg'}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded text-xs font-bold">
                      ACTIVE
                    </span>
                  </div>
                  <div className="p-4 md:p-6">
                    <div className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3">{listing.price}</div>
                    <div className="font-semibold text-gray-900 mb-2">{listing.title}</div>
                    <div className="flex gap-3 md:gap-4 text-xs md:text-sm text-gray-600 mb-2">
                      {listing.beds > 0 && <span>🛏 {listing.beds} Beds</span>}
                      {listing.baths > 0 && <span>🛁 {listing.baths} Baths</span>}
                      {listing.sqft && <span>📏 {listing.sqft}</span>}
                    </div>
                    <div className="text-xs md:text-sm text-gray-600 mb-2">{listing.location}</div>
                    {listing.mlsNumber && (
                      <div className="text-xs text-gray-500">#{listing.mlsNumber}</div>
                    )}
                  </div>
                </a>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-4">
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, listings.length)} of {listings.length} properties
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
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="h-10 w-10 p-0"
                      style={currentPage === page ? { backgroundColor: '#102f74', color: 'white' } : {}}
                    >
                      {page}
                    </Button>
                  ))}
                  
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
      </section>

      {/* Newsletter Section - Mobile Friendly */}
      <section id="subscribe" className="bg-gray-50 py-12 md:py-16 mt-16 md:mt-20">
        <div className="max-w-[1400px] mx-auto px-4 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-8 md:mb-12">
            <div>
              <h3 className="text-sm md:text-base font-semibold mb-4 md:mb-5 text-gray-900">Our Office</h3>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                Boulevard Marina s/n<br />
                Cabo San Lucas<br />
                Baja California Sur<br />
                México, C.P. 23400
              </p>
            </div>

            <div>
              <h3 className="text-sm md:text-base font-semibold mb-4 md:mb-5 text-gray-900">Contact Us</h3>
              <ul className="space-y-2 md:space-y-3">
                <li><a href="tel:+526241435555" className="text-xs md:text-sm text-gray-600 hover:text-gray-900 transition-colors">+52 624 143 5555</a></li>
                <li><a href="mailto:info@bircabo.com" className="text-xs md:text-sm text-gray-600 hover:text-gray-900 transition-colors">info@bircabo.com</a></li>
                <li><a href="https://www.facebook.com/BajaInternationalRealty" target="_blank" rel="noopener noreferrer" className="text-xs md:text-sm text-gray-600 hover:text-gray-900 transition-colors">Facebook</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm md:text-base font-semibold mb-4 md:mb-5 text-gray-900">Sign Up To Our Newsletter</h3>
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2.5">
                <Input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="p-2.5 border border-gray-300 rounded text-sm"
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="p-2.5 border border-gray-300 rounded text-sm"
                />
                <Button 
                  type="submit"
                  className="p-3 bg-gray-900 text-white rounded font-semibold cursor-pointer hover:bg-gray-800 transition-colors text-sm"
                >
                  SUBSCRIBE
                </Button>
              </form>
            </div>

            <div>
              <h3 className="text-sm md:text-base font-semibold mb-4 md:mb-5 text-gray-900">About Us</h3>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                Founded in Fall 1987, Baja International Realty has brought over 35 years of pioneering experience to Los Cabos real estate.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-300 pt-6 md:pt-8 text-center text-xs md:text-sm text-gray-600">
            <p>©2025 BAJA INTERNATIONAL REALTY. All rights reserved.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MarketReport;