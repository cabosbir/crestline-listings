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
    // Scroll to top when component mounts
    window.scrollTo(0, 0);

    // Chart options configuration
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

    // Price Chart
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
                backgroundColor: '#64748b',
                barThickness: 40
              },
              {
                label: 'Sold Median Price',
                data: [310000, 320000, 325000, 320000, 315000, 310000],
                backgroundColor: '#94a3b8',
                barThickness: 40
              }
            ]
          },
          options: chartOptions
        } as ChartConfiguration);
      }
    }

    // Days Chart
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
              backgroundColor: '#64748b',
              barThickness: 30
            }]
          },
          options: chartOptions
        } as ChartConfiguration);
      }
    }

    // Inventory Chart
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
                backgroundColor: '#64748b',
                barThickness: 30
              },
              {
                label: 'Sold Listings',
                data: [75, 88, 60, 65, 48, 85],
                backgroundColor: '#94a3b8',
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
    console.log('Subscription data:', { name, email });
    // Add your subscription logic here
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
    if (currentSlide < 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  return (
    <div className="bg-white">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 py-3">
        <div className="max-w-[1400px] mx-auto px-10">
          <ul className="flex gap-8 text-sm font-medium">
            <li><a href="#" className="text-gray-900 hover:text-blue-900 transition-colors">PROPERTY SEARCH</a></li>
            <li><a href="#" className="text-gray-900 hover:text-blue-900 transition-colors">LUXURY LISTINGS</a></li>
            <li><a href="#" className="text-gray-900 hover:text-blue-900 transition-colors">EXCLUSIVE LISTINGS</a></li>
            <li><a href="#" className="text-gray-900 hover:text-blue-900 transition-colors">POPULAR AREAS</a></li>
          </ul>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 py-5">
        <div className="max-w-[1400px] mx-auto px-10 flex justify-between items-center">
          <div className="flex items-center gap-5">
            <img 
              src="https://res.cloudinary.com/dhwnr1pa5/image/upload/v1762021536/Screenshot_2025-10-31_at_5.21.25_PM-removebg-preview_2_gndt9y.png" 
              alt="BIR Logo" 
              className="h-[60px] w-auto"
            />
            <div className="h-[50px] w-px bg-gray-200"></div>
            <div className="font-serif text-lg font-semibold text-gray-900 leading-tight">
              BAJA<br />REAL ESTATE
            </div>
          </div>
          <a href="#" className="bg-gray-900 text-white px-6 py-2.5 rounded font-semibold text-sm tracking-wider hover:bg-gray-800 transition-colors">
            LOG IN
          </a>
        </div>
      </header>

      {/* Page Header */}
      <div className="max-w-[1400px] mx-auto px-10 mt-16 mb-10">
        <h1 className="font-serif text-[42px] font-bold text-gray-900 mb-3">Cabo San Lucas: Market Report</h1>
        <p className="text-gray-600 text-base mb-5">Get monthly market reports delivered to your inbox.</p>
        <a 
          href="#subscribe" 
          className="inline-block bg-blue-900 text-white px-7 py-3 rounded font-semibold text-sm hover:bg-blue-950 transition-colors"
        >
          Sign Up for Market Reports
        </a>
      </div>

      {/* Overview Section */}
      <section className="max-w-[1400px] mx-auto px-10 mb-16">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Overview - Last 30 Days</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg hover:-translate-y-0.5 transition-all">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-lg text-2xl">💰</div>
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Median Price</div>
            </div>
            <div className="text-[32px] font-bold text-gray-900 mb-2">$484,000</div>
            <div className="text-sm text-gray-600">Active: $353,071.43</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg hover:-translate-y-0.5 transition-all">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-lg text-2xl">📅</div>
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Median Days on Site</div>
            </div>
            <div className="text-[32px] font-bold text-gray-900 mb-2">Active 169</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg hover:-translate-y-0.5 transition-all">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-lg text-2xl">🏠</div>
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Inventory</div>
            </div>
            <div className="text-[32px] font-bold text-gray-900 mb-2">New: 83</div>
            <div className="text-sm text-gray-600">Active: 650</div>
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section className="max-w-[1400px] mx-auto px-10 mb-16">
        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
          <h3 className="text-base font-semibold text-gray-900 mb-5">Median Price - Last 6 Months *</h3>
          <div className="relative h-[300px]">
            <canvas ref={priceChartRef}></canvas>
          </div>
          <p className="text-xs text-gray-600 italic mt-4">* Data on active listings begins accruing on report creation. History will grow over time.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <h3 className="text-base font-semibold text-gray-900 mb-5">Median Days on Site - Last 6 Months *</h3>
            <div className="relative h-[300px]">
              <canvas ref={daysChartRef}></canvas>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <h3 className="text-base font-semibold text-gray-900 mb-5">Listing Inventory - Last 6 Months *</h3>
            <div className="relative h-[300px]">
              <canvas ref={inventoryChartRef}></canvas>
            </div>
          </div>
        </div>
      </section>

      {/* Listings Section */}
      <section className="max-w-[1400px] mx-auto px-10 mb-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold text-gray-900">New Listings - Last 30 Days</h2>
          <a href="#" className="text-blue-900 font-semibold text-sm hover:underline">View all new listings</a>
        </div>

        <div className="relative overflow-hidden">
          <div 
            className="flex gap-5 transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 33.333}%)` }}
          >
            {/* Listing 1 */}
            <div className="flex-shrink-0 w-[calc(33.333%-14px)] bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer">
              <div className="relative h-60 bg-gradient-to-br from-indigo-500 to-purple-600">
                <span className="absolute top-4 left-4 bg-green-500 text-white px-3.5 py-1.5 rounded text-xs font-bold tracking-wide">
                  ACTIVE
                </span>
                <div className="absolute top-4 right-4 w-9 h-9 bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                  ♡
                </div>
              </div>
              <div className="p-6">
                <div className="text-2xl font-bold text-gray-900 mb-3">$6,700,000</div>
                <div className="flex gap-4 text-sm text-gray-600 mb-2.5">
                  <span>🛏 4 Beds</span>
                  <span>🛁 3 Baths</span>
                  <span>📏 7,261 SqFt.</span>
                </div>
                <div className="text-sm text-gray-600 mb-2">125 Camino Del Mar 1/23 m/4</div>
                <div className="text-sm text-gray-600 mb-2">Cabo San Lucas, BS</div>
                <div className="text-xs text-gray-600">#25-4876 • House</div>
              </div>
            </div>

            {/* Listing 2 */}
            <div className="flex-shrink-0 w-[calc(33.333%-14px)] bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer">
              <div className="relative h-60 bg-gradient-to-br from-blue-500 to-cyan-600">
                <span className="absolute top-4 left-4 bg-green-500 text-white px-3.5 py-1.5 rounded text-xs font-bold tracking-wide">
                  ACTIVE
                </span>
                <div className="absolute top-4 right-4 w-9 h-9 bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                  ♡
                </div>
              </div>
              <div className="p-6">
                <div className="text-2xl font-bold text-gray-900 mb-3">$4,495,000</div>
                <div className="flex gap-4 text-sm text-gray-600 mb-2.5">
                  <span>🛏 4 Beds</span>
                  <span>🛁 5 Baths</span>
                  <span>📏 7,862 SqFt.</span>
                </div>
                <div className="text-sm text-gray-600 mb-2">425 Camino Bonito Oriente Pedregal</div>
                <div className="text-sm text-gray-600 mb-2">Cabo San Lucas, BS</div>
                <div className="text-xs text-gray-600">#25-1616 • House</div>
              </div>
            </div>

            {/* Listing 3 */}
            <div className="flex-shrink-0 w-[calc(33.333%-14px)] bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer">
              <div className="relative h-60 bg-gradient-to-br from-purple-500 to-pink-600">
                <span className="absolute top-4 left-4 bg-green-500 text-white px-3.5 py-1.5 rounded text-xs font-bold tracking-wide">
                  ACTIVE
                </span>
                <div className="absolute top-4 right-4 w-9 h-9 bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                  ♡
                </div>
              </div>
              <div className="p-6">
                <div className="text-2xl font-bold text-gray-900 mb-3">$3,950,000</div>
                <div className="text-sm text-gray-600 mb-2.5">
                  <span>Unrivaled Location Lot 19 De La Marina</span>
                </div>
                <div className="text-sm text-gray-600 mb-2">Cabo San Lucas, BS</div>
                <div className="text-xs text-gray-600">#25-4641 • Lots / Land</div>
              </div>
            </div>
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

      {/* Newsletter Section */}
      <section id="subscribe" className="bg-gray-50 py-16 mt-20">
        <div className="max-w-[1400px] mx-auto px-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="text-base font-semibold mb-5 text-gray-900">Our Offices</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Los Cabos<br />
                Calle Miguel Hidalgo 6 Ignacio<br />
                Zaragoza Plaza Mijares Local 4,<br />
                Centro, 23400 San José del Cabo,<br />
                B.C.S
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold mb-5 text-gray-900">Contact Us</h3>
              <ul className="space-y-3">
                <li><a href="tel:+526241435555" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">+52 624 143 5555</a></li>
                <li><a href="mailto:info@bircabo.com" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">info@bircabo.com</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Facebook</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-base font-semibold mb-5 text-gray-900">Sign Up To Our Newsletter</h3>
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2.5">
                <Input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="p-2.5 border border-gray-300 rounded"
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="p-2.5 border border-gray-300 rounded"
                />
                <Button 
                  type="submit"
                  className="p-3 bg-gray-900 text-white rounded font-semibold cursor-pointer hover:bg-gray-800 transition-colors"
                >
                  SUBSCRIBE
                </Button>
              </form>
            </div>

            <div>
              <h3 className="text-base font-semibold mb-5 text-gray-900">About Us</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                At our inception in the Fall of 2021, the Founding Partners of Baja International Realty represented over 60 years of experience and expertise in the Real Estate Market of Los Cabos.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-300 pt-8 text-center text-sm text-gray-600">
            <p>©2024 BIR Affiliates, LLC. An independently owned and operated franchisee of BIR Affiliates.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MarketReport;
