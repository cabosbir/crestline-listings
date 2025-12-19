import { useState, useEffect } from "react";
import { Phone, Mail, MessageCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChat } from "@/contexts/ChatContext";

const FloatingContact = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { openChat } = useChat();

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 100px
      if (window.scrollY > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Desktop - Side Bar */}
      <div className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col gap-3 animate-in slide-in-from-right duration-500">
        <Button
          variant="default"
          size="icon"
          className="rounded-full shadow-hover"
          asChild
        >
          <a href="tel:+526241435555" title="Call Us">
            <Phone className="h-5 w-5" />
          </a>
        </Button>
        <Button
          variant="default"
          size="icon"
          className="rounded-full shadow-hover"
          asChild
        >
          <a href="mailto:info@bircabo.com" title="Email Us">
            <Mail className="h-5 w-5" />
          </a>
        </Button>
        <Button
          variant="luxury"
          size="icon"
          className="rounded-full shadow-gold relative"
          onClick={openChat}
          title="Property Search Assistant"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        </Button>
        <Button
          variant="default"
          size="icon"
          className="rounded-full shadow-hover"
          asChild
        >
          <a href="/contact" title="Schedule Showing">
            <Calendar className="h-5 w-5" />
          </a>
        </Button>
      </div>

      {/* Mobile - Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-primary/95 backdrop-blur-md border-t border-primary-light shadow-elegant animate-in slide-in-from-bottom duration-500">
        <div className="grid grid-cols-4 gap-2 p-3">
          <Button
            variant="ghost"
            size="sm"
            className="flex-col h-auto py-2 text-primary-foreground hover:text-accent"
            asChild
          >
            <a href="tel:+526241435555">
              <Phone className="h-4 w-4 mb-1" />
              <span className="text-xs">Call</span>
            </a>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-col h-auto py-2 text-primary-foreground hover:text-accent"
            asChild
          >
            <a href="mailto:info@bircabo.com">
              <Mail className="h-4 w-4 mb-1" />
              <span className="text-xs">Email</span>
            </a>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-col h-auto py-2 text-primary-foreground hover:text-accent relative"
            onClick={openChat}
          >
            <MessageCircle className="h-4 w-4 mb-1" />
            <span className="text-xs">Chat</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-col h-auto py-2 text-primary-foreground hover:text-accent"
            asChild
          >
            <a href="/contact">
              <Calendar className="h-4 w-4 mb-1" />
              <span className="text-xs">Contact</span>
            </a>
          </Button>
        </div>
      </div>
    </>
  );
};

export default FloatingContact;