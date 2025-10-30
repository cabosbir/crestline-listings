import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Phone, Mail, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "About", href: "/about" },
    { name: "Team", href: "/team" },
  ];

  const propertyLinks = [
    { name: "Featured Properties", href: "/properties" },
    { name: "Beachfront Villas", href: "/properties?type=villa" },
    { name: "Golf Communities", href: "/properties?type=golf" },
    { name: "Luxury Condos", href: "/properties?type=condo" },
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
            {/* Properties Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-foreground hover:text-accent transition-fast font-medium outline-none">
                Properties
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {propertyLinks.map((link) => (
                  <DropdownMenuItem key={link.name} asChild>
                    <Link
                      to={link.href}
                      className="cursor-pointer w-full"
                    >
                      {link.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Other Nav Links */}
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
              <a 
                href="tel:+526241435555" 
                className="text-muted-foreground hover:text-accent transition-fast"
                aria-label="Call Baja International Realty"
              >
                <Phone className="h-5 w-5" />
              </a>
              <a 
                href="mailto:info@bircabo.com" 
                className="text-muted-foreground hover:text-accent transition-fast"
                aria-label="Email Baja International Realty"
              >
                <Mail className="h-5 w-5" />
              </a>
              <Link to="/contact">
                <Button variant="luxury" size="sm">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-foreground hover:text-accent transition-fast"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              {/* Properties Section in Mobile */}
              <div className="px-2">
                <div className="text-foreground font-medium mb-2">Properties</div>
                <div className="flex flex-col space-y-2 pl-4">
                  {propertyLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.href}
                      className="text-muted-foreground hover:text-accent transition-fast text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Other Nav Links in Mobile */}
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
                <a 
                  href="tel:+526241435555" 
                  className="text-muted-foreground hover:text-accent transition-fast"
                  aria-label="Call us"
                >
                  <Phone className="h-5 w-5" />
                </a>
                <a 
                  href="mailto:info@bircabo.com" 
                  className="text-muted-foreground hover:text-accent transition-fast"
                  aria-label="Email us"
                >
                  <Mail className="h-5 w-5" />
                </a>
              </div>
              <Link to="/contact" onClick={() => setIsOpen(false)}>
                <Button variant="luxury" size="sm" className="w-full">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;