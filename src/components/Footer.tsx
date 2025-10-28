import { Facebook, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h2 className="text-3xl font-bold mb-4">
              BAJA INTERNATIONAL <span className="text-accent">REALTY</span>
            </h2>
            <p className="text-primary-foreground/80 mb-6 max-w-md">
              Your trusted partner for luxury real estate in Cabo San Lucas and Baja California Sur.
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
                  Blvd. Marina, Cabo San Lucas, BCS, Mexico
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-accent flex-shrink-0" />
                <a href="tel:+526121698328" className="text-sm text-primary-foreground/80 hover:text-accent transition-fast">
                  +52 612 169 8328
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-accent flex-shrink-0" />
                <a href="mailto:cabosbir@gmail.com" className="text-sm text-primary-foreground/80 hover:text-accent transition-fast">
                  cabosbir@gmail.com
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

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Stay Updated</h3>
            <p className="text-primary-foreground/80 text-sm mb-4">
              Subscribe to our newsletter for exclusive listings and market insights.
            </p>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Your email" 
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
              />
              <Button variant="luxury" size="default">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-primary-foreground/20 pt-8 text-center text-sm text-primary-foreground/60">
          <p>© 2025 BAJA INTERNATIONAL REALTY. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;