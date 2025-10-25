import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Award } from "lucide-react";

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
  return (
    <Card className="group relative overflow-hidden border-border hover:shadow-hover transition-smooth cursor-pointer h-[500px]">
      {/* Agent Photo */}
      <img 
        src={image || `https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&h=1200&fit=crop&crop=faces`} 
        alt={name}
        className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
        onError={(e) => {
          const target = e.currentTarget;
          target.style.display = 'none';
          const fallbackDiv = document.createElement('div');
          fallbackDiv.className = 'w-full h-full flex items-center justify-center bg-gradient-to-br from-accent/20 to-accent/10';
          fallbackDiv.innerHTML = `<div class="text-6xl font-bold text-accent">${name.charAt(0)}</div>`;
          target.parentElement?.appendChild(fallbackDiv);
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-smooth" />
      
      {/* Stats Badge - Always Visible */}
      {(propertiesSold || yearsExperience) && (
        <div className="absolute top-4 right-4 bg-accent/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex gap-3">
            {yearsExperience && (
              <div className="text-center">
                <div className="text-2xl font-bold">{yearsExperience}</div>
                <div className="text-xs opacity-90">Years</div>
              </div>
            )}
            {propertiesSold && (
              <div className="text-center border-l border-white/30 pl-3">
                <div className="text-2xl font-bold">{propertiesSold}+</div>
                <div className="text-xs opacity-90">Sold</div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Agent Info - Always Visible */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-primary-foreground bg-gradient-to-t from-primary/80 to-transparent">
        <h3 className="text-2xl font-bold mb-1">{name}</h3>
        <p className="text-primary-foreground/90 mb-2 text-lg">{title}</p>
        
        {specialization && (
          <div className="flex items-center gap-2 text-sm text-primary-foreground/80 mb-3">
            <Award className="w-4 h-4" />
            <span>{specialization}</span>
          </div>
        )}
      </div>
      
      {/* Hover Content - Contact Info & Actions */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-smooth">
        <div className="bg-white/95 backdrop-blur-md rounded-xl p-5 shadow-2xl space-y-3 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
          
          {/* Contact Info */}
          <div className="space-y-2 text-sm text-foreground/80">
            {phone && (
              <a 
                href={`tel:${phone}`} 
                className="flex items-center gap-2 hover:text-accent transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Phone className="w-4 h-4" />
                <span>{phone}</span>
              </a>
            )}
            
            {email && (
              <a 
                href={`mailto:${email}`} 
                className="flex items-center gap-2 hover:text-accent transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Mail className="w-4 h-4" />
                <span className="truncate">{email}</span>
              </a>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="luxury"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onViewBio?.();
              }}
            >
              View Full Bio
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = '/contact';
              }}
            >
              Contact
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AgentBioCard;
