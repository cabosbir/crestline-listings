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
import PropertyChatBot from "@/components/PropertyChatBot";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const navLinks = [
    { name: "About", href: "/about" },
  ];

  const propertyLinks = [
    { name: "View All Properties", href: "/search" },
  ];

  const teamLinks: Array<{ name: string; href?: string; action?: string }> = [
    { name: "View Our Agents", href: "/team" },
    { name: "24/7 BIR Assistant", action: "openChat" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-elegant">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src="/BIRLOGO.png" 
              alt="Baja International Realty" 
              className="h-16 md:h-20 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {/* Properties Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-foreground hover:text-accent transition-fast font-heading text-lg outline-none">
                Properties
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {propertyLinks.map((link) => (
                  <DropdownMenuItem key={link.name} asChild>
                    <Link
                      to={link.href}
                      className="cursor-pointer w-full font-heading"
                    >
                      {link.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Team Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-foreground hover:text-accent transition-fast font-heading text-lg outline-none">
                Team
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {teamLinks.map((link) => (
                  <DropdownMenuItem
                    key={link.name}
                    asChild={link.href ? true : false}
                    onClick={link.action === "openChat" ? () => setIsChatOpen(true) : undefined}
                  >
                    {link.href ? (
                      <Link
                        to={link.href}
                        className="cursor-pointer w-full font-heading"
                      >
                        {link.name}
                      </Link>
                    ) : (
                      <div className="cursor-pointer w-full font-heading">
                        {link.name}
                      </div>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Other Nav Links */}
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-foreground hover:text-accent transition-fast font-heading text-lg"
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
                <div className="text-foreground font-heading text-lg mb-2">Properties</div>
                <div className="flex flex-col space-y-2 pl-4">
                  {propertyLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.href}
                      className="text-muted-foreground hover:text-accent transition-fast font-heading"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Team Section in Mobile */}
              <div className="px-2">
                <div className="text-foreground font-heading text-lg mb-2">Team</div>
                <div className="flex flex-col space-y-2 pl-4">
                  {teamLinks.map((link) => (
                    link.href ? (
                      <Link
                        key={link.name}
                        to={link.href}
                        className="text-muted-foreground hover:text-accent transition-fast font-heading"
                        onClick={() => setIsOpen(false)}
                      >
                        {link.name}
                      </Link>
                    ) : (
                      <button
                        key={link.name}
                        className="text-left text-muted-foreground hover:text-accent transition-fast font-heading"
                        onClick={() => {
                          setIsOpen(false);
                          setIsChatOpen(true);
                        }}
                      >
                        {link.name}
                      </button>
                    )
                  ))}
                </div>
              </div>

              {/* Other Nav Links in Mobile */}
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-foreground hover:text-accent transition-fast font-heading text-lg px-2"
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

      {/* Property Search Assistant Modal */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center lg:justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsChatOpen(false)}
          />

          {/* Chat Container */}
          <div className="relative w-full lg:w-[800px] h-[90vh] lg:h-[700px] bg-background border border-border rounded-t-2xl lg:rounded-2xl shadow-2xl animate-in slide-in-from-bottom duration-300 overflow-hidden">
            <PropertyChatBot onClose={() => setIsChatOpen(false)} />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;