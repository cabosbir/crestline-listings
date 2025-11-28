import { Card } from "@/components/ui/card";
import { Phone, Mail, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AgentBioCardProps {
  name: string;
  title: string;
  image: string;
  phone?: string;
  phone2?: string;
  email?: string;
  specialization?: string;
  propertiesSold?: number;
  yearsExperience?: number;
  onViewBio?: () => void;
  showStats?: boolean;
  landingPageSlug?: string; // ⭐ Landing page slug (e.g., "bob", "susu")
}

const AgentBioCard = ({ 
  name, 
  title, 
  image,
  phone,
  phone2,
  email,
  specialization,
  propertiesSold,
  yearsExperience,
  onViewBio,
  showStats = true,
  landingPageSlug
}: AgentBioCardProps) => {
  const navigate = useNavigate();
  
  // ⭐ UPDATED: Single button handler - routes to landing page if available
  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (landingPageSlug) {
      // Route to landing page
      navigate(`/${landingPageSlug}`);
    } else if (onViewBio) {
      // Fallback to bio modal
      onViewBio();
    }
  };

  return (
    <Card className="group relative overflow-hidden border rounded-xl cursor-pointer h-[500px] hover:shadow-2xl transition-all duration-300">
      {/* Agent Photo */}
      <img 
        src={image || `https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&h=1200&fit=crop&crop=faces`} 
        alt={name}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
      
      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      {/* Stats Badge - Conditionally Visible */}
      {showStats && (propertiesSold || yearsExperience) && (
        <div className="absolute top-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg z-10">
          <div className="flex gap-3 text-center">
            {yearsExperience && (
              <div>
                <div className="text-2xl font-bold">{yearsExperience}</div>
                <div className="text-xs">Years</div>
              </div>
            )}
            {propertiesSold && (
              <div className="border-l border-white/30 pl-3">
                <div className="text-2xl font-bold">{propertiesSold}+</div>
                <div className="text-xs">Sold</div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Agent Info - Always Visible */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none">
        <h3 className="text-2xl font-bold mb-1">{name}</h3>
        <p className="text-white/90 mb-2 text-lg">{title}</p>
        {specialization && (
          <div className="flex items-center gap-2 text-sm text-white/80 mb-3">
            <Award className="w-4 h-4" />
            <span>{specialization}</span>
          </div>
        )}
      </div>
      
      {/* Hover Content - Contact & Button */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all duration-300 z-50">
        <div className="bg-white rounded-xl p-5 shadow-2xl space-y-3 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 relative z-50">
          
          {/* Contact Info */}
          {(phone || phone2 || email) && (
            <div className="space-y-2 text-sm text-gray-700">
              {phone && (
                <a 
                  href={`tel:${phone}`} 
                  className="flex items-center gap-2 hover:text-yellow-600 transition-colors pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Phone className="w-4 h-4" />
                  <span>{phone}</span>
                </a>
              )}
              {phone2 && (
                <a 
                  href={`tel:${phone2}`} 
                  className="flex items-center gap-2 hover:text-yellow-600 transition-colors pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Phone className="w-4 h-4" />
                  <span>{phone2}</span>
                </a>
              )}
              {email && (
                <a 
                  href={`mailto:${email}`} 
                  className="flex items-center gap-2 hover:text-yellow-600 transition-colors pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{email}</span>
                </a>
              )}
            </div>
          )}
          
          {/* ⭐ UPDATED: Single Action Button */}
          <div className="pt-2">
            <button
              onClick={handleButtonClick}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-4 rounded-md transition-colors text-sm pointer-events-auto cursor-pointer"
            >
              {landingPageSlug ? 'View Profile' : 'View Full Bio'}
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AgentBioCard;