import { useEffect, useRef, useState } from "react";
import { Chart, ChartConfiguration, registerables } from "chart.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Register Chart.js components
Chart.register(...registerables);

const MarketReport = () => {
  const priceChartRef = useRef<HTMLCanvasElement>(null);
  const daysChartRef = useRef<HTMLCanvasElement>(null);
  const inventoryChartRef = useRef<HTMLCanvasElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

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
              src="https://res.cloudinary.com/dhwnr1pa5/image/upload/v1762021536/Screenshot_2025-10-31_at_5.21.25_PM-removebg-preview_2_gndt9y.png" 
              alt="BIR Logo" 
              className="h-[45px] md:h-[60px] w-auto"
            />
            <div className="hidden md:block h-[50px] w-px bg-gray-200"></div>
            <div className="hidden md:block font-serif text-lg font-semibold text-gray-900 leading-tight">
              BAJA<br />REAL ESTATE
            </div>
          </div>
          <a href="/" className="bg-gray-900 text-white px-4 md:px-6 py-2 md:py-2.5 rounded font-semibold text-xs md:text-sm tracking-wider hover:bg-gray-800 transition-colors">
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

      {/* Overview Section - Mobile Friendly */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-10 mb-12 md:mb-16">
        <div className="mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">Overview - Last 30 Days</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
          <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 hover:shadow-lg hover:-translate-y-0.5 transition-all">
            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-5">
              <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-gray-50 rounded-lg text-xl md:text-2xl">💰</div>
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Median Price</div>
            </div>
            <div className="text-2xl md:text-[32px] font-bold text-gray-900 mb-2">$484,000</div>
            <div className="text-xs md:text-sm text-gray-600">Active: $353,071.43</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 hover:shadow-lg hover:-translate-y-0.5 transition-all">
            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-5">
              <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-gray-50 rounded-lg text-xl md:text-2xl">📅</div>
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Days on Site</div>
            </div>
            <div className="text-2xl md:text-[32px] font-bold text-gray-900 mb-2">Active 169</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 hover:shadow-lg hover:-translate-y-0.5 transition-all">
            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-5">
              <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-gray-50 rounded-lg text-xl md:text-2xl">🏠</div>
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Inventory</div>
            </div>
            <div className="text-2xl md:text-[32px] font-bold text-gray-900 mb-2">New: 83</div>
            <div className="text-xs md:text-sm text-gray-600">Active: 650</div>
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