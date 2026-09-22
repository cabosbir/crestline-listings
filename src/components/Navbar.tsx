import { useState } from "react";
import { Menu, X, Phone, Mail, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const primaryLinks = [
  { name: "Search Properties", href: "/property-search.html" },
  { name: "Recent Price Reductions", href: "/#price-reductions" },
];
const exploreLinks = [
  { name: "Featured Properties", href: "/#featured-properties" },
  { name: "Explore Our Communities", href: "/#cabo-communities" },
  { name: "Understanding Buying", href: "/#buying-in-cabo" },
  { name: "Understanding Selling", href: "/#selling-in-cabo" },
  { name: "Free Property Evaluation", href: "/seller-evaluation" },
];
const companyLinks = [
  { name: "Our Team", href: "/team" },
  { name: "About BIR", href: "/about" },
  { name: "Contact Us", href: "/contact" },
];
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  return <nav aria-label="Main navigation" className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-elegant">
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between h-20 gap-4">
        <a href="/" aria-label="BIR — Home" title="Home" className="flex items-center shrink-0">
          <img src="/BIRLOGO.png" alt="Baja International Realty" className="h-16 md:h-20 w-auto" />
        </a>
        <div className="hidden lg:flex items-center gap-4 xl:gap-6">
          {primaryLinks.map(link=><a key={link.href} href={link.href} className="text-foreground hover:text-accent font-heading text-base font-semibold">{link.name}</a>)}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-foreground hover:text-accent font-heading text-base">Explore<ChevronDown className="h-4 w-4" /></DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              {exploreLinks.map(link=><DropdownMenuItem key={link.href} asChild><a href={link.href} className="cursor-pointer w-full py-2">{link.name}</a></DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>
          {companyLinks.map(link=><a key={link.href} href={link.href} className="text-foreground hover:text-accent font-heading text-base">{link.name}</a>)}
          <div className="hidden xl:flex items-center gap-3">
            <a href="tel:+526241435555" aria-label="Call Baja International Realty" className="hover:text-accent"><Phone className="h-5 w-5" /></a>
            <a href="mailto:info@bircabo.com" aria-label="Email Baja International Realty" className="hover:text-accent"><Mail className="h-5 w-5" /></a>
          </div>
        </div>
        <button type="button" onClick={()=>setIsOpen(!isOpen)} className="lg:hidden p-2 text-foreground hover:text-accent" aria-label={isOpen?'Close menu':'Open menu'} aria-expanded={isOpen} aria-controls="bir-mobile-menu">{isOpen?<X className="h-6 w-6" />:<Menu className="h-6 w-6" />}</button>
      </div>
      {isOpen&&<div id="bir-mobile-menu" className="lg:hidden py-4 border-t border-border max-h-[calc(100dvh-5rem)] overflow-y-auto">
        <div className="flex flex-col gap-1">
          {primaryLinks.map(link=><a key={link.href} href={link.href} onClick={()=>setIsOpen(false)} className="px-2 py-3 font-heading text-lg font-semibold text-primary">{link.name}</a>)}
          {exploreLinks.map(link=><a key={link.href} href={link.href} onClick={()=>setIsOpen(false)} className="px-2 py-3 font-heading text-lg hover:text-accent">{link.name}</a>)}
          <div className="border-t border-border mt-2 pt-2 flex flex-col">
            {companyLinks.map(link=><a key={link.href} href={link.href} onClick={()=>setIsOpen(false)} className="px-2 py-3 font-heading text-lg hover:text-accent">{link.name}</a>)}
          </div>
        </div>
      </div>}
    </div>
  </nav>;
};
export default Navbar;
