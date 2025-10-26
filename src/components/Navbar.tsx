import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Properties", href: "/properties" },
    { name: "Communities", href: "/communities" },
    { name: "About", href: "/about" },
    { name: "Team", href: "/team" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-elegant">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex flex-col">
            <h1 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">
              <span className="text-accent">B</span>I<span className="text-accent">R</span>
            </h1>
            <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider -mt-1">
              Baja International Realty
            </p>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-foreground hover:text-accent transition-fast font-medium"
              >
                {link.name}
              </Link>
            ))}
            <div className="flex items-center space-x-4 ml-4">
              <a href="tel:+526121698328" className="text-muted-foreground hover:text-accent transition-fast">
                <Phone className="h-5 w-5" />
              </a>
              <a href="mailto:cabosbir@gmail.com" className="text-muted-foreground hover:text-accent transition-fast">
                <Mail className="h-5 w-5" />
              </a>
              <Button variant="luxury" size="sm">
                Schedule Call
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-foreground hover:text-accent transition-fast"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-foreground hover:text-accent transition-fast font-medium px-2"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex items-center space-x-4 px-2 pt-4">
                <a href="tel:+526121698328" className="text-muted-foreground hover:text-accent transition-fast">
                  <Phone className="h-5 w-5" />
                </a>
                <a href="mailto:cabosbir@gmail.com" className="text-muted-foreground hover:text-accent transition-fast">
                  <Mail className="h-5 w-5" />
                </a>
              </div>
              <Button variant="luxury" size="sm" className="w-full">
                Schedule Call
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;