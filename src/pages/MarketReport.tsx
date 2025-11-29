import { useEffect, useRef, useState } from "react";
import { Chart, ChartConfiguration, registerables } from "chart.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, ArrowLeftRight } from "lucide-react";

// Register Chart.js components
Chart.register(...registerables);

const MarketReport = () => {
  const priceChartRef = useRef<HTMLCanvasElement>(null);
  const daysChartRef = useRef<HTMLCanvasElement>(null);
  const inventoryChartRef = useRef<HTMLCanvasElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  
  // Currency converter state
  const [usdAmount, setUsdAmount] = useState("100000");
  const [mxnAmount, setMxnAmount] = useState("");
  const [exchangeRate, setExchangeRate] = useState(20.5);
  const [lastUpdated, setLastUpdated] = useState("");

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
        // Fallback to default rate
        setMxnAmount((parseFloat(usdAmount) * exchangeRate).toFixed(2));
        setLastUpdated(new Date().toLocaleString());
      }
    };

    fetchExchangeRate();
  }, []);

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

  useEffect(() => {
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
                data: [315000, 325000, 330000, 325000, 320000, 315000],
                backgroundColor: '#3b82f6',
                barThickness: 40
              },
              {
                label: 'Sold Median Price',
                data: [310000, 320000, 325000, 320000, 315000, 310000],
                backgroundColor: '#10b981',
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
              data: [150, 155, 170, 180, 190, 185],
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
                data: [80, 95, 65, 70, 50, 90],
                backgroundColor: '#8b5cf6',
                barThickness: 30
              },
              {
                label: 'Sold Listings',
                data: [75, 88, 60, 65, 48, 85],
                backgroundColor: '#ec4899',
                barThickness: 30
              }
            ]
          },
          options: chartOptions
        } as ChartConfiguration);
      }
    }
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for subscribing! You will receive monthly market reports.');
    setName('');
    setEmail('');
  };

  const slideLeft = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slideRight = () => {
    if (currentSlide < 2) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  return (
    <div className="bg-white min-h-screen">
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

      {/* MODERNIZED Overview Section */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-10 mb-12 md:mb-16">
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Overview - Last 30 Days</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Median Price Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-xl transition-all">
            <h3 className="text-lg font-semibold text-gray-700 mb-6">Median Price</h3>
            <div className="flex items-start mb-6">
              <span className="text-6xl text-gray-400 mr-4">$</span>
              <div>
                <div className="text-2xl font-bold text-gray-900 mb-2">New $486,000</div>
                <div className="text-lg text-gray-700">Active $351,071.43</div>
              </div>
            </div>
          </div>

          {/* Median Days on Site Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-xl transition-all">
            <h3 className="text-lg font-semibold text-gray-700 mb-6">Median Days on Site</h3>
            <div className="flex items-start mb-6">
              <span className="text-6xl text-gray-400 mr-4">📅</span>
              <div className="flex items-center">
                <div className="text-3xl font-bold text-gray-900">Active 189</div>
              </div>
            </div>
          </div>

          {/* Inventory Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-xl transition-all">
            <h3 className="text-lg font-semibold text-gray-700 mb-6">Inventory</h3>
            <div className="flex items-start mb-6">
              <span className="text-6xl text-gray-400 mr-4">🏠</span>
              <div>
                <div className="text-2xl font-bold text-gray-900 mb-2">New 83</div>
                <div className="text-lg text-gray-700">Active 650</div>
              </div>
            </div>
          </div>
        </div>
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
        <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 mb-6 md:mb-8">
          <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4 md:mb-5">Median Price - Last 6 Months *</h3>
          <div className="relative h-[250px] md:h-[300px]">
            <canvas ref={priceChartRef}></canvas>
          </div>
          <p className="text-xs text-gray-600 italic mt-3 md:mt-4">* Data on active listings begins accruing on report creation. History will grow over time.</p>
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
      </section>

      {/* Listings Section - MOBILE OPTIMIZED */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-10 mb-12 md:mb-16">
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">New Listings - Last 30 Days</h2>
          <a href="/properties" className="text-blue-900 font-semibold text-xs md:text-sm hover:underline">View all</a>
        </div>

        {/* Mobile: Stack vertically, Desktop: Slider */}
        <div className="md:hidden space-y-6">
          {/* Listing 1 */}
          <a 
            href="https://www.flexmls.com/share/D0rH7/Hacienda-Beach-Club-private-pool-OWNER-FINANCING-1-100-Cabo-San-Lucas-"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all"
          >
            <div className="relative h-48 overflow-hidden">
              <img 
                src="https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761942726/20241014235115115464000000-o_hgb1vh.jpg"
                alt="Hacienda Beach Club"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded text-xs font-bold">
                ACTIVE
              </span>
            </div>
            <div className="p-4">
              <div className="text-xl font-bold text-gray-900 mb-2">$6,950,000</div>
              <div className="font-semibold text-gray-900 mb-2">Hacienda Beach Club</div>
              <div className="flex gap-3 text-xs text-gray-600 mb-2">
                <span>🛏 4 Beds</span>
                <span>🛁 4 Baths</span>
              </div>
              <div className="text-xs text-gray-600 mb-1">Private pool & OWNER FINANCING</div>
              <div className="text-xs text-gray-600 mb-1">Cabo San Lucas</div>
              <div className="text-xs text-gray-500">#24-4467 • House</div>
            </div>
          </a>

          {/* Listing 2 */}
          <a 
            href="https://www.flexmls.com/share/D0rFY/Casa-Ducci-Camino-del-Mar-Cabo-San-Lucas-"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all"
          >
            <div className="relative h-48 overflow-hidden">
              <img 
                src="https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761942708/20240426201812151546000000-o_zoqijd.jpg"
                alt="Casa Ducci Camino del Mar"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded text-xs font-bold">
                ACTIVE
              </span>
            </div>
            <div className="p-4">
              <div className="text-xl font-bold text-gray-900 mb-2">$3,795,800</div>
              <div className="font-semibold text-gray-900 mb-2">Casa Ducci Camino del Mar</div>
              <div className="flex gap-3 text-xs text-gray-600 mb-2">
                <span>🛏 4 Beds</span>
                <span>🛁 4.5 Baths</span>
                <span>📏 350.23 m²</span>
              </div>
              <div className="text-xs text-gray-600 mb-1">Cabo San Lucas</div>
              <div className="text-xs text-gray-500">#24-1981 • House</div>
            </div>
          </a>

          {/* Listing 3 */}
          <a 
            href="https://www.flexmls.com/share/D0rHM/La-Vista-LARGE-PRIVATE-YARD-B101-Cabo-Corridor-"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all"
          >
            <div className="relative h-48 overflow-hidden">
              <img 
                src="https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761942441/20250321204529858183000000-o_ganlni.jpg"
                alt="La Vista LARGE PRIVATE YARD"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded text-xs font-bold">
                ACTIVE
              </span>
            </div>
            <div className="p-4">
              <div className="text-xl font-bold text-gray-900 mb-2">$499,000</div>
              <div className="font-semibold text-gray-900 mb-2">La Vista LARGE PRIVATE YARD</div>
              <div className="flex gap-3 text-xs text-gray-600 mb-2">
                <span>🛏 3 Beds</span>
                <span>🛁 3 Baths</span>
                <span>📏 372.06 m²</span>
              </div>
              <div className="text-xs text-gray-600 mb-1">Cabo Corridor</div>
              <div className="text-xs text-gray-500">#25-1679 • House</div>
            </div>
          </a>
        </div>

        {/* Desktop Slider */}
        <div className="hidden md:block relative overflow-hidden">
          <div 
            className="flex gap-5 transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 33.333}%)` }}
          >
            {/* Desktop listings - same as before */}
            <a 
              href="https://www.flexmls.com/share/D0rH7/Hacienda-Beach-Club-private-pool-OWNER-FINANCING-1-100-Cabo-San-Lucas-"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 w-[calc(33.333%-14px)] bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer"
            >
              <div className="relative h-60 overflow-hidden">
                <img 
                  src="https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761942726/20241014235115115464000000-o_hgb1vh.jpg"
                  alt="Hacienda Beach Club"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-4 left-4 bg-green-500 text-white px-3.5 py-1.5 rounded text-xs font-bold tracking-wide">
                  ACTIVE
                </span>
              </div>
              <div className="p-6">
                <div className="text-2xl font-bold text-gray-900 mb-3">$6,950,000</div>
                <div className="font-semibold text-gray-900 mb-2">Hacienda Beach Club</div>
                <div className="flex gap-4 text-sm text-gray-600 mb-2.5">
                  <span>🛏 4 Beds</span>
                  <span>🛁 4 Baths</span>
                </div>
                <div className="text-sm text-gray-600 mb-2">Private pool & OWNER FINANCING</div>
                <div className="text-sm text-gray-600 mb-2">Cabo San Lucas</div>
                <div className="text-xs text-gray-600">#24-4467 • House</div>
              </div>
            </a>

            <a 
              href="https://www.flexmls.com/share/D0rFY/Casa-Ducci-Camino-del-Mar-Cabo-San-Lucas-"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 w-[calc(33.333%-14px)] bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer"
            >
              <div className="relative h-60 overflow-hidden">
                <img 
                  src="https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761942708/20240426201812151546000000-o_zoqijd.jpg"
                  alt="Casa Ducci Camino del Mar"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-4 left-4 bg-green-500 text-white px-3.5 py-1.5 rounded text-xs font-bold tracking-wide">
                  ACTIVE
                </span>
              </div>
              <div className="p-6">
                <div className="text-2xl font-bold text-gray-900 mb-3">$3,795,800</div>
                <div className="font-semibold text-gray-900 mb-2">Casa Ducci Camino del Mar</div>
                <div className="flex gap-4 text-sm text-gray-600 mb-2.5">
                  <span>🛏 4 Beds</span>
                  <span>🛁 4.5 Baths</span>
                  <span>📏 350.23 m²</span>
                </div>
                <div className="text-sm text-gray-600 mb-2">Cabo San Lucas</div>
                <div className="text-xs text-gray-600">#24-1981 • House</div>
              </div>
            </a>

            <a 
              href="https://www.flexmls.com/share/D0rHM/La-Vista-LARGE-PRIVATE-YARD-B101-Cabo-Corridor-"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 w-[calc(33.333%-14px)] bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer"
            >
              <div className="relative h-60 overflow-hidden">
                <img 
                  src="https://res.cloudinary.com/dhwnr1pa5/image/upload/v1761942441/20250321204529858183000000-o_ganlni.jpg"
                  alt="La Vista LARGE PRIVATE YARD"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-4 left-4 bg-green-500 text-white px-3.5 py-1.5 rounded text-xs font-bold tracking-wide">
                  ACTIVE
                </span>
              </div>
              <div className="p-6">
                <div className="text-2xl font-bold text-gray-900 mb-3">$499,000</div>
                <div className="font-semibold text-gray-900 mb-2">La Vista LARGE PRIVATE YARD</div>
                <div className="flex gap-4 text-sm text-gray-600 mb-2.5">
                  <span>🛏 3 Beds</span>
                  <span>🛁 3 Baths</span>
                  <span>📏 372.06 m²</span>
                </div>
                <div className="text-sm text-gray-600 mb-2">Cabo Corridor</div>
                <div className="text-xs text-gray-600">#25-1679 • House</div>
              </div>
            </a>
          </div>

          <div className="flex justify-center gap-2.5 mt-8">
            <button 
              onClick={slideLeft}
              className="w-10 h-10 border border-gray-200 bg-white rounded-full cursor-pointer flex items-center justify-center hover:bg-gray-50 hover:border-gray-900 transition-all"
            >
              ←
            </button>
            <button 
              onClick={slideRight}
              className="w-10 h-10 border border-gray-200 bg-white rounded-full cursor-pointer flex items-center justify-center hover:bg-gray-50 hover:border-gray-900 transition-all"
            >
              →
            </button>
          </div>
        </div>
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