import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Award, Users, TrendingUp, Heart, CheckCircle, ArrowRight } from "lucide-react";

interface ValueModalProps {
  isOpen: boolean;
  onClose: () => void;
  valueType: "client-first" | "excellence" | "expertise" | "integrity" | null;
}

const ValueModal = ({ isOpen, onClose, valueType }: ValueModalProps) => {
  const [activeTab, setActiveTab] = useState(0);

  // Content for each core value
  const valueContent = {
    "client-first": {
      title: "Client-First Approach",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      tabs: [
        {
          name: "Our Promise",
          content: {
            heading: "What Client-First Means to Us",
            description: "At Baja International Realty, your success is our top priority. We believe in building lasting relationships through personalized service and genuine care.",
            benefits: [
              "Dedicated one-on-one attention from experienced agents",
              "Customized property searches tailored to your exact needs",
              "24/7 availability for your questions and concerns",
              "Post-sale support and property management assistance",
              "Transparent communication throughout your journey"
            ]
          }
        },
        {
          name: "Success Stories",
          content: {
            heading: "Real Results for Real Clients",
            description: "Over 2,200 families have found their dream properties through our client-first approach.",
            benefits: [
              "Average client satisfaction rating of 4.9/5 stars",
              "98% of clients would recommend us to friends and family",
              "Helped clients secure properties 15% below asking price on average",
              "Streamlined closing process averaging 45 days",
              "Long-term relationships with 70% repeat client rate"
            ]
          }
        },
        {
          name: "Our Process",
          content: {
            heading: "Your Journey With Us",
            description: "We've refined our process to ensure a smooth, stress-free experience from first contact to closing day and beyond.",
            benefits: [
              "Initial consultation to understand your goals and preferences",
              "Curated property selection matching your criteria",
              "Private tours with local insights and market analysis",
              "Expert negotiation to secure the best possible terms",
              "Full support through closing and post-purchase services"
            ]
          }
        }
      ]
    },
    "excellence": {
      title: "Proven Excellence",
      icon: Award,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      tabs: [
        {
          name: "Our Achievements",
          content: {
            heading: "Award-Winning Team",
            description: "Recognized as one of Cabo San Lucas's premier luxury real estate agencies with decades of combined experience.",
            benefits: [
              "Top Luxury Agency in Cabo San Lucas - 2024",
              "$800+ million in successful transactions",
              "Average 17 years of experience per team member",
              "Multilingual team serving international clients",
              "Industry certifications and continuous training"
            ]
          }
        },
        {
          name: "Market Leadership",
          content: {
            heading: "Leading the Baja Market",
            description: "Our track record speaks for itself. We consistently deliver exceptional results in Baja California Sur's competitive luxury market.",
            benefits: [
              "Highest average sale price in the Los Cabos corridor",
              "Fastest time-to-sale in the luxury property segment",
              "Exclusive access to off-market listings",
              "Strong relationships with top developers",
              "Featured in Forbes, Wall Street Journal, and Robb Report"
            ]
          }
        },
        {
          name: "Team Expertise",
          content: {
            heading: "World-Class Professionals",
            description: "Our team combines international standards with deep local knowledge to provide unmatched service.",
            benefits: [
              "Licensed real estate professionals in US, Canada, and Mexico",
              "Specialized expertise in luxury, commercial, and investment properties",
              "In-house legal and financial advisory connections",
              "Certified negotiation experts and market analysts",
              "Continuous professional development and market education"
            ]
          }
        }
      ]
    },
    "expertise": {
      title: "Market Expertise",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      tabs: [
        {
          name: "Local Knowledge",
          content: {
            heading: "Deep Baja California Sur Insights",
            description: "We don't just sell properties—we live here. Our intimate knowledge of every neighborhood gives you a competitive advantage.",
            benefits: [
              "Comprehensive understanding of all Los Cabos communities",
              "Real-time market data and pricing trends",
              "Insights into upcoming developments and infrastructure",
              "Knowledge of best schools, healthcare, and amenities",
              "Weather patterns, beach quality, and seasonal considerations"
            ]
          }
        },
        {
          name: "Market Analysis",
          content: {
            heading: "Data-Driven Investment Decisions",
            description: "Our proprietary market analysis helps you make informed decisions backed by comprehensive data.",
            benefits: [
              "Detailed ROI projections for investment properties",
              "Comparative market analysis for accurate pricing",
              "Rental income potential and occupancy forecasts",
              "Property appreciation trends and predictions",
              "Neighborhood development and growth analysis"
            ]
          }
        },
        {
          name: "Investment Strategy",
          content: {
            heading: "Maximize Your Returns",
            description: "Whether you're buying for personal use or investment, we help you build a strategy that aligns with your financial goals.",
            benefits: [
              "Portfolio diversification recommendations",
              "Tax advantages and foreign ownership guidance",
              "Rental management and income optimization",
              "Exit strategy planning and resale potential",
              "Connection to trusted property managers and rental agencies"
            ]
          }
        }
      ]
    },
    "integrity": {
      title: "Integrity & Trust",
      icon: Heart,
      color: "text-red-600",
      bgColor: "bg-red-50",
      tabs: [
        {
          name: "Our Values",
          content: {
            heading: "Built on Honesty and Transparency",
            description: "Trust is the foundation of every relationship we build. We believe in doing business the right way—always.",
            benefits: [
              "Full disclosure of all property details and potential issues",
              "Honest market pricing without inflated expectations",
              "Transparent fee structure with no hidden costs",
              "Ethical representation of both buyers and sellers",
              "Commitment to your best interests above all else"
            ]
          }
        },
        {
          name: "Client Protection",
          content: {
            heading: "Safeguarding Your Investment",
            description: "We go above and beyond to protect your interests throughout the entire transaction process.",
            benefits: [
              "Thorough due diligence on every property",
              "Connection to trusted attorneys and notaries",
              "Title verification and ownership documentation review",
              "Guidance through Mexican real estate regulations",
              "Post-purchase support and dispute resolution assistance"
            ]
          }
        },
        {
          name: "Long-Term Partnership",
          content: {
            heading: "Beyond the Transaction",
            description: "Our relationship doesn't end at closing. We're here to support you for as long as you own your property.",
            benefits: [
              "Ongoing property management recommendations",
              "Market updates and portfolio performance reviews",
              "Assistance with renovations and improvements",
              "Help with rental management and guest services",
              "Support for eventual resale or property exchange"
            ]
          }
        }
      ]
    }
  };

  if (!valueType || !isOpen) return null;

  const currentValue = valueContent[valueType];
  const Icon = currentValue.icon;
  const currentTab = currentValue.tabs[activeTab];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">{currentValue.title}</DialogTitle>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>

        {/* Header with Icon */}
        <div className={`${currentValue.bgColor} rounded-2xl p-8 mb-6`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-4 rounded-full bg-white`}>
              <Icon className={`h-8 w-8 ${currentValue.color}`} />
            </div>
            <h2 className="text-3xl font-bold text-foreground">{currentValue.title}</h2>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b overflow-x-auto">
          {currentValue.tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-6 py-3 text-sm font-semibold transition-colors whitespace-nowrap ${
                activeTab === index
                  ? `${currentValue.color} border-b-2 border-current`
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-3">
              {currentTab.content.heading}
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
              {currentTab.content.description}
            </p>
          </div>

          {/* Benefits List */}
          <div className="space-y-3">
            {currentTab.content.benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className={`h-5 w-5 ${currentValue.color} flex-shrink-0 mt-0.5`} />
                <p className="text-foreground">{benefit}</p>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
            <Button 
              onClick={onClose}
              className="flex-1"
            >
              Schedule a Consultation <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Contact Our Team
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ValueModal;
