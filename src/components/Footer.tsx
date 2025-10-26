import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  const footerLinks = {
    properties: [
      { name: "Featured Properties", href: "/properties" },
      { name: "Beachfront Villas", href: "/properties?type=villa" },
      { name: "Golf Communities", href: "/properties?type=golf" },
      { name: "Luxury Condos", href: "/properties?type=condo" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Our Team", href: "/about#team" },
      { name: "Careers", href: "/careers" },
      { name: "Contact", href: "/contact" },
    ],
    resources: [
      { name: "Blog", href: "/blog" },
      { name: "Market Reports", href: "/reports" },
      { name: "Buyer's Guide", href: "/buyers-guide" },
      { name: "Seller's Guide", href: "/sellers-guide" },
    ],
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
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
                <span className="text-sm text-primary-foreground/80">
                  Blvd. Marina, Cabo San Lucas, BCS, Mexico
                </span>
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

            {/* Social Media */}
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-primary-foreground/10 rounded-full hover:bg-accent transition-smooth">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-primary-foreground/10 rounded-full hover:bg-accent transition-smooth">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-primary-foreground/10 rounded-full hover:bg-accent transition-smooth">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Properties */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Properties</h3>
            <ul className="space-y-2">
              {footerLinks.properties.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="text-primary-foreground/80 hover:text-accent transition-fast text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="text-primary-foreground/80 hover:text-accent transition-fast text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="text-primary-foreground/80 hover:text-accent transition-fast text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-primary-foreground/20 pt-8 mb-8">
          <div className="max-w-md">
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
        <div className="border-t border-primary-foreground/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-primary-foreground/60">
          <p>© 2025 BAJA INTERNATIONAL REALTY. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-accent transition-fast">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-accent transition-fast">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;