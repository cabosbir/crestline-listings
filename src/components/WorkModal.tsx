import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Users, Award, Lightbulb, CheckCircle, ArrowRight, Heart, TrendingUp, Globe } from "lucide-react";

interface WorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  workType: "family" | "experience" | "innovation" | null;
}

const WorkModal = ({ isOpen, onClose, workType }: WorkModalProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const handleContactClick = () => {
    onClose();
    navigate('/contact');
  };

  // Content for each "Work With Us" value
  const workContent = {
    "family": {
      title: "The Power of Family",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      tabs: [
        {
          name: "Our Story",
          content: {
            heading: "A Family-Run Real Estate Legacy",
            description: "Founded by a family passionate about helping others find their dream homes in Cabo San Lucas, we've built our business on trust, integrity, and genuine relationships.",
            benefits: [
              "Three generations of real estate expertise serving the Baja California Sur market",
              "Personal attention from owners who are actively involved in every transaction",
              "Long-term relationships built on trust – 70% of our business comes from referrals",
              "We treat your family's investment decisions as if they were our own",
              "Available 24/7 because family always answers when you need them"
            ]
          }
        },
        {
          name: "Client Relationships",
          content: {
            heading: "You're Part of Our Family",
            description: "When you work with us, you're not just a transaction number. You become part of the Baja International Realty family, with all the care and dedication that entails.",
            benefits: [
              "Personalized service tailored to your unique needs and preferences",
              "Direct access to decision-makers, not just junior associates",
              "Ongoing support even after closing – we're here for life",
              "Annual client appreciation events and community gatherings",
              "Exclusive access to pocket listings and pre-market opportunities"
            ]
          }
        },
        {
          name: "Family Values",
          content: {
            heading: "The Values We Live By",
            description: "Our family values guide everything we do, from how we treat clients to how we give back to the Los Cabos community.",
            benefits: [
              "Integrity in every interaction – honesty is non-negotiable",
              "Respect for your time, budget, and family priorities",
              "Commitment to the Cabo San Lucas community through local partnerships",
              "Work-life balance – we understand family comes first",
              "Generational knowledge passed down and continually updated"
            ]
          }
        }
      ]
    },
    "experience": {
      title: "The Power of Experience",
      icon: Award,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      tabs: [
        {
          name: "Our Expertise",
          content: {
            heading: "Decades of Proven Success",
            description: "Our team brings combined decades of luxury real estate experience from the US, Canada, and Mexico, with an unmatched track record in Baja California Sur.",
            benefits: [
              "85+ combined years of real estate experience across our team",
              "$800+ million in successful transactions since 1987",
              "2,200+ families helped find their perfect Cabo San Lucas property",
              "Licensed in multiple jurisdictions: US, Canada, and Mexico",
              "Specialized certifications: REALTOR®, CCIM, CRS designations"
            ]
          }
        },
        {
          name: "Market Knowledge",
          content: {
            heading: "Deep Los Cabos Market Intelligence",
            description: "Having worked through multiple market cycles, we understand the nuances of the Baja real estate market like no one else.",
            benefits: [
              "Intimate knowledge of every Los Cabos neighborhood and development",
              "Relationships with top developers, attorneys, and property managers",
              "Understanding of local regulations, including Fideicomiso trusts",
              "Fluency in English, Spanish, and French for seamless transactions",
              "Experience navigating complex international transactions"
            ]
          }
        },
        {
          name: "Proven Results",
          content: {
            heading: "Track Record of Excellence",
            description: "Our results speak louder than our words. We consistently deliver outcomes that exceed client expectations.",
            benefits: [
              "Average sale price 8% above market comparables",
              "Properties sell 40% faster than area average",
              "98% client satisfaction rating across all transactions",
              "Top producer awards every year since 2015",
              "Featured expert in Forbes, WSJ, and Robb Report"
            ]
          }
        }
      ]
    },
    "innovation": {
      title: "The Power of Innovation",
      icon: Lightbulb,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      tabs: [
        {
          name: "Technology",
          content: {
            heading: "Cutting-Edge Real Estate Technology",
            description: "We leverage the latest technology and AI-powered tools to give you a competitive advantage in the Los Cabos luxury market.",
            benefits: [
              "AI-powered property matching system finds your perfect home faster",
              "3D virtual tours and drone footage for remote property viewing",
              "Blockchain-based transaction tracking for complete transparency",
              "Advanced CRM ensures no detail is overlooked in your journey",
              "Real-time market data and analytics at your fingertips"
            ]
          }
        },
        {
          name: "Marketing Excellence",
          content: {
            heading: "World-Class Property Marketing",
            description: "Our specialized marketing team creates stunning campaigns that showcase your property to the right buyers, both locally and internationally.",
            benefits: [
              "Professional photography and videography for every listing",
              "Targeted digital advertising reaching high-net-worth buyers globally",
              "Featured placements in luxury lifestyle publications",
              "Social media campaigns with proven engagement rates",
              "Multi-language marketing materials for international appeal"
            ]
          }
        },
        {
          name: "Client Experience",
          content: {
            heading: "Seamless Digital Experience",
            description: "From your first search to closing day, our technology ensures a smooth, transparent, and stress-free experience.",
            benefits: [
              "Personalized client portal for 24/7 access to your transaction",
              "Digital document signing for convenience and speed",
              "Automated updates keep you informed at every milestone",
              "Virtual meeting capabilities for clients anywhere in the world",
              "Post-sale app for property management and concierge services"
            ]
          }
        }
      ]
    }
  };

  if (!workType || !isOpen) return null;

  const currentWork = workContent[workType];
  const Icon = currentWork.icon;
  const currentTab = currentWork.tabs[activeTab];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">{currentWork.title}</DialogTitle>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>

        {/* Header with Icon */}
        <div className={`${currentWork.bgColor} rounded-2xl p-8 mb-6`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-4 rounded-full bg-white`}>
              <Icon className={`h-8 w-8 ${currentWork.color}`} />
            </div>
            <h2 className="text-3xl font-bold text-foreground">{currentWork.title}</h2>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b overflow-x-auto">
          {currentWork.tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-6 py-3 text-sm font-semibold transition-colors whitespace-nowrap ${
                activeTab === index
                  ? `${currentWork.color} border-b-2 border-current`
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
                <CheckCircle className={`h-5 w-5 ${currentWork.color} flex-shrink-0 mt-0.5`} />
                <p className="text-foreground">{benefit}</p>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
            <Button 
              onClick={handleContactClick}
              className="flex-1"
            >
              Get Started Today <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                onClose();
                navigate('/team');
              }}
              className="flex-1"
            >
              Meet Our Team
            </Button>
          </div>

          {/* Agent selection hint */}
          <p className="text-xs text-center text-muted-foreground">
            Connect with us to experience the difference that family values, proven experience, and innovative technology can make
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkModal;
