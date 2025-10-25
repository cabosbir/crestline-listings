import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Award } from "lucide-react";

interface AgentBioCardProps {
  name: string;
  title: string;
  image: string;
  phone?: string;
  email?: string;
  specialization?: string;
  propertiesSold?: number;
  yearsExperience?: number;
  onViewBio?: () => void;
}

const AgentBioCard = ({ 
  name, 
  title, 
  image,
  phone,
  email,
  specialization,
  propertiesSold,
  yearsExperience,
  onViewBio
}: AgentBioCardProps) => {
  
  const handleViewBioClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('View Bio clicked for:', name);
    if (onViewBio) {
      onViewBio();
    }
  };

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  const handleEmailClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (email) {
      // Option 1: Direct mailto
      window.location.href = `mailto:${email}?subject=Inquiry from Luxury Coastal Real Estate&body=Hello ${name.split(' ')[0]}, I would like to discuss...`;
      
      // Option 2: Navigate to contact page with agent pre-filled (you can implement this later)
      // window.location.href = `/contact?agent=${encodeURIComponent(name)}`;
    }
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Navigate to contact page with agent pre-selected
    window.location.href = `/contact?agent=${encodeURIComponent(name)}&email=${encodeURIComponent(email || '')}`;
  };

  return (
    <Card className="group relative overflow-hidden border rounded-xl cursor-pointer h-[500px] hover:shadow-2xl transition-all duration-300">
      {/* Agent Photo */}
      <img 
        src={image || `https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&h=1200&fit=crop&crop=faces`} 
        alt={name}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
      
      {/* Dark Gradient Overlay on Hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      {/* Stats Badge - Always Visible */}
      {(propertiesSold || yearsExperience) && (
        <div className="absolute top-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg z-10 pointer-events-none">
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
      
      {/* Agent Info - Always Visible at Bottom */}
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
      
      {/* Hover Content - Contact & Buttons */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 pointer-events-none group-hover:pointer-events-auto">
        <div className="bg-white rounded-xl p-5 shadow-2xl space-y-3 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
          
          {/* Contact Info */}
          {(phone || email) && (
            <div className="space-y-2 text-sm text-gray-700">
              {phone && (
                <button
                  onClick={handlePhoneClick}
                  className="w-full flex items-center gap-2 hover:text-yellow-600 transition-colors text-left"
                >
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>{phone}</span>
                </button>
              )}
              
              {email && (
                <button
                  onClick={handleEmailClick}
                  className="w-full flex items-center gap-2 hover:text-yellow-600 transition-colors text-left"
                >
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{email}</span>
                </button>
              )}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleViewBioClick}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-md transition-colors text-sm"
            >
              View Full Bio
            </button>
            <button
              onClick={handleContactClick}
              className="flex-1 border border-gray-300 hover:bg-gray-100 font-medium py-2 px-4 rounded-md transition-colors text-sm"
            >
              Contact
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AgentBioCard;