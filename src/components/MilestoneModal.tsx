// src/components/MilestoneModal.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tv, Building2, Scale } from "lucide-react";

interface MilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestoneType: "national-recognition" | "major-developments" | "industry-pioneer" | null;
}

const MilestoneModal = ({ isOpen, onClose, milestoneType }: MilestoneModalProps) => {
  const milestoneContent = {
    "national-recognition": {
      icon: Tv,
      title: "National Media Recognition",
      subtitle: "Pioneering Education in Mexican Real Estate",
      description: "In the late 1980s and early 1990s, founder Don Weis revolutionized how Americans and Canadians understood Mexican real estate investment. Through Pan America Ltd, he created groundbreaking educational seminars under the name 'Mexico Gold.'",
      highlights: [
        {
          title: "CNN Feature",
          content: "Don Weis and his Mexico Gold seminars were featured on CNN, bringing credibility and awareness to foreign investment opportunities in Baja California Sur to a national audience."
        },
        {
          title: "ABC's 20/20",
          content: "The educational program was profiled on ABC's prestigious investigative journalism show 20/20, highlighting the innovative approach to real estate education and investment in Mexico."
        },
        {
          title: "National Radio & TV",
          content: "Featured on numerous radio and television shows across the United States, Don became a recognized authority on Mexican real estate, helping thousands understand the opportunities and processes."
        },
        {
          title: "Educational Impact",
          content: "These seminars weren't just promotional - they were comprehensive educational programs teaching foreigners about Mexican real estate law, fideicomiso trusts, and safe investment practices in Baja."
        }
      ],
      impact: "This national exposure established Baja International Realty as the trusted authority on Baja real estate, building the foundation for 35+ years of success."
    },
    "major-developments": {
      icon: Building2,
      title: "Major Development Projects",
      subtitle: "Brokering Baja's Largest Real Estate Deals",
      description: "Baja International Realty has been the trusted broker behind some of the most significant real estate transactions in Los Cabos history, representing billions of dollars in development.",
      highlights: [
        {
          title: "RIU Hotels & Resorts",
          content: "Brokered multi-million dollar land acquisitions for RIU Hotels, one of the world's premier all-inclusive resort chains. These deals brought luxury hospitality to Los Cabos and created hundreds of jobs."
        },
        {
          title: "Cabo San Cristobal Resorts",
          content: "Negotiated land purchases for one of the largest planned resort projects in the world - featuring 8 luxury hotels, championship golf courses, professional polo fields, and a Formula One racetrack."
        },
        {
          title: "First World-Class Yacht Club",
          content: "Part of the Cabo San Cristobal project included the first true world-class yacht club in Cabo San Lucas, elevating the region's status as a premier yachting destination."
        },
        {
          title: "Developer Representation",
          content: "Represented major developers throughout Baja Norte and Baja Sur, facilitating residential, commercial, and mixed-use developments that shaped the region's growth."
        }
      ],
      impact: "These major transactions helped transform Los Cabos from a small fishing village into one of Mexico's premier luxury destinations, while maintaining our commitment to sustainable development."
    },
    "industry-pioneer": {
      icon: Scale,
      title: "Industry Pioneer & Standards",
      subtitle: "Setting the Foundation for Professional Real Estate in Baja",
      description: "Don Weis didn't just build a successful agency - he helped create the professional real estate infrastructure that protects buyers and sellers throughout Baja California Sur.",
      highlights: [
        {
          title: "MLS-BCS Founding Member",
          content: "As a founding member of MLS-BCS (Multiple Listing Service of Baja California Sur), Don helped establish the first organized, ethical framework for real estate transactions in the region."
        },
        {
          title: "Professional Standards",
          content: "Helped implement a strict code of ethics for real estate professionals in Baja, ensuring safe and secure transactions for both buyers and sellers. These standards are now industry-wide."
        },
        {
          title: "International Realtor® Certification",
          content: "Brought international real estate standards to Cabo San Lucas, becoming one of the first International Realtor® certified agencies in Baja California Sur."
        },
        {
          title: "AMPI Los Cabos Member",
          content: "Active member of AMPI® (Asociación Mexicana de Profesionales Inmobiliarios), the Mexican Association of Real Estate Professionals, maintaining the highest industry standards."
        },
        {
          title: "Education & Training",
          content: "Established training programs and best practices that are now standard throughout the region, ensuring professional service delivery across the industry."
        }
      ],
      impact: "This pioneering work created the professional foundation that allows foreign investors to purchase property in Mexico with confidence, transparency, and legal protection."
    }
  };

  const content = milestoneType ? milestoneContent[milestoneType] : null;

  if (!content) return null;

  const Icon = content.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-full bg-accent/10">
              <Icon className="h-6 w-6 text-accent" />
            </div>
            <div>
              <DialogTitle className="text-2xl">{content.title}</DialogTitle>
              <DialogDescription className="text-base mt-1">
                {content.subtitle}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Introduction */}
          <p className="text-muted-foreground leading-relaxed">
            {content.description}
          </p>

          {/* Highlights */}
          <div className="space-y-4">
            {content.highlights.map((highlight, index) => (
              <div 
                key={index}
                className="bg-secondary p-5 rounded-lg border border-border"
              >
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span className="text-accent">•</span>
                  {highlight.title}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {highlight.content}
                </p>
              </div>
            ))}
          </div>

          {/* Impact Statement */}
          <div className="bg-accent/10 p-5 rounded-lg border-l-4 border-accent">
            <h4 className="font-semibold text-foreground mb-2">Impact on Los Cabos</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {content.impact}
            </p>
          </div>

          {/* Call to Action */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-4">
              Experience the difference that 35+ years of expertise makes
            </p>
            <a 
              href="/contact" 
              className="inline-flex items-center justify-center px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-colors"
            >
              Work With Our Team
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MilestoneModal;
