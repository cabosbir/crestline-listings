import { Facebook, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  const handleMarketReportClick = () => {
    navigate('/market-report');
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h2 className="text-3xl font-bold mb-4">
              <span style={{ color: '#3b6299' }}>BAJA</span>{' '}
              INTERNATIONAL{' '}
              <span style={{ color: '#3b6299' }}>REALTY</span>
            </h2>
            <p className="text-primary-foreground/80 mb-6 max-w-md">
              Your trusted partner for luxury real estate in Cabo San Lucas and Baja California Sur since the 1980s.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <a 
                  href="https://maps.app.goo.gl/DsyfVAHBARUKDJAX8" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary-foreground/80 hover:text-accent transition-fast"
                >
                  Boulevard Marina s/n y Vicente Guerrero s/n<br />
                  Manzana 31-A, Colonia Centro<br />
                  Cabo San Lucas, Baja California Sur<br />
                  México, C.P. 23400
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-accent flex-shrink-0" />
                <a 
                  href="tel:+526241435555" 
                  className="text-sm text-primary-foreground/80 hover:text-accent transition-fast"
                >
                  +52 624 143 5555
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-accent flex-shrink-0" />
                <a 
                  href="mailto:info@bircabo.com" 
                  className="text-sm text-primary-foreground/80 hover:text-accent transition-fast"
                >
                  info@bircabo.com
                </a>
              </div>
            </div>

            {/* Social Media - Facebook only */}
            <div className="flex gap-4">
              <a 
                href="https://www.facebook.com/BajaInternationalRealty" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-primary-foreground/10 rounded-full hover:bg-accent transition-smooth"
                aria-label="Visit our Facebook page"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Newsletter Section - Updated */}
          <div className="bg-primary-foreground/5 rounded-lg p-8 backdrop-blur-sm">
            <h3 className="font-bold text-2xl mb-3 text-primary-foreground">Stay Updated</h3>
            <p className="text-primary-foreground/80 text-base mb-6 leading-relaxed">
              Subscribe to our newsletter for exclusive listings and market insights in Cabo San Lucas
            </p>
            
            <Button 
              onClick={handleMarketReportClick}
              variant="luxury" 
              size="lg"
              className="w-full sm:w-auto px-8 py-6 text-base font-semibold"
            >
              Subscribe
            </Button>
            
            <p className="text-primary-foreground/70 text-sm mt-4">
              Join 2,200+ clients who trust us with their Baja real estate journey.
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-primary-foreground/20 pt-8 text-center text-sm text-primary-foreground/60">
          <p>
            © 2025 BAJA INTERNATIONAL REALTY All rights reserved.
          </p>
          <p className="mt-2 text-xs">
            Don Weis, Broker | MLS-BCS Founding Member | International Realtor®
          </p>
          <p className="mt-1 text-[10px] opacity-50">
            To hire the architect of this website call:{' '}
            <a 
              href="tel:+526121698328" 
              className="hover:opacity-100 transition-opacity"
            >
              +52 612 169 8328
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;