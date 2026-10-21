import { useState, useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Helmet } from "react-helmet-async";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const agents = [
  {
    "id": 12,
    "slug": "don",
    "name": "Don Weis",
    "email": "Don@bircabo.com"
  },
  {
    "id": 1,
    "slug": "bob",
    "name": "Bob Van Patten",
    "email": "robertvanpatten2@gmail.com"
  },
  {
    "id": 3,
    "slug": "alfonso",
    "name": "Alfonso Puente",
    "email": "alfonso@bircabo.com"
  },
  {
    "id": 8,
    "slug": "david",
    "name": "David Scott Piper",
    "email": "David@bircabo.com"
  },
  {
    "id": 16,
    "slug": "kenny",
    "name": "Kenneth “Kenny” Gehlhoff",
    "email": "sweetdreamsbaja@gmail.com"
  },
  {
    "id": 17,
    "slug": "matt",
    "name": "Matthew “Matt” Rosenberg",
    "email": "mattyrose88@gmail.com"
  },
  {
    "id": 5,
    "slug": "hector",
    "name": "Hector Mendoza",
    "email": "Hector@bircabo.com"
  },
  {
    "id": 7,
    "slug": "marisol",
    "name": "Marisol Tort",
    "email": "mtortricardi@gmail.com"
  },
  {
    "id": 4,
    "slug": "cozbi",
    "name": "Cozbi Sanchez",
    "email": "Cozbi@bajainternationalrealty.com"
  },
  {
    "id": 10,
    "slug": "edgar",
    "name": "Edgar Pacheco",
    "email": "Edgar@bircabo.com"
  },
  {
    "id": 11,
    "slug": "fernando-cabrera",
    "name": "Fernando Cabrera",
    "email": "fernando@bircabo.com"
  },
  {
    "id": 15,
    "slug": "humberto",
    "name": "Humberto Escoto",
    "email": "humberto@bircabo.com"
  }
];

const Contact = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: 'general',
    propertyType: '',
    preferredAgent: '',
    message: ''
  });

  const [website, setWebsite] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  // Accept both current agent names and slugs preserved by old registration links.
  useEffect(() => {
    const requested = searchParams.get('agent') || '';
    const selected = agents.find(a => a.slug === requested || a.name === requested);
    const property = location.state;
    const propertyMessage = property?.propertyAddress
      ? `I would like more information about ${property.propertyAddress}${property.mlsNumber ? ' (MLS ' + property.mlsNumber + ')' : ''}.`
      : '';
    setFormData(prev => ({...prev, preferredAgent: selected?.name || '', message: propertyMessage}));
  }, [searchParams, location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('');
    
    try {
      // Find selected agent's email
      const selectedAgent = agents.find(a => a.name === formData.preferredAgent);
      const agentEmail = selectedAgent?.email;

      const response = await fetch('/api/send-contact-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          website,
          agentEmail, // Include agent email for routing
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        document.dispatchEvent(new CustomEvent('bir-lead-result', {detail: {form: 'general_contact', outcome: 'success'}}));
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          inquiryType: 'general',
          propertyType: '',
          preferredAgent: selectedAgent?.name || '',
          message: ''
        });
      } else {
        setSubmitStatus('error');
        document.dispatchEvent(new CustomEvent('bir-lead-result', {detail: {form: 'general_contact', outcome: 'error'}}));
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
        document.dispatchEvent(new CustomEvent('bir-lead-result', {detail: {form: 'general_contact', outcome: 'error'}}));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="min-h-screen bg-background">
  {/* ⭐ ADD THIS ENTIRE HELMET BLOCK */}
  <Helmet>
    <title>Contact Baja International Realty | Cabo San Lucas Real Estate Experts</title>
    <meta 
      name="description" 
      content="Contact Baja International Realty in Cabo San Lucas. Use WhatsApp or send an inquiry directly from our website."
    />
    <link rel="canonical" href="https://www.bircabo.com/contact" />
    <meta property="og:title" content="Contact Baja International Realty | Cabo Real Estate" />
    <meta property="og:description" content="Ask our Cabo real estate team a question using WhatsApp or the inquiry form. No email app or registration needed." />
    <meta property="og:url" content="https://www.bircabo.com/contact" />
    <meta property="og:type" content="website" />
    
    {/* Local Business Schema */}
    <script type="application/ld+json">
      {JSON.stringify({
        "@context": "https://schema.org",
        "@type": "RealEstateAgent",
        "name": "Baja International Realty",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Blvd. Marina 14, Plaza Nautica local A6, Colonia Centro",
          "addressLocality": "Cabo San Lucas",
          "addressRegion": "Baja California Sur",
          "postalCode": "23450",
          "addressCountry": "MX"
        },
        "telephone": "+52-624-143-5555",
        "openingHours": "Mo-Fr 09:00-18:00, Sa-Su 10:00-16:00",
        "url": "https://www.bircabo.com"
      })}
    </script>
  </Helmet>
  {/* ⭐ END OF HELMET BLOCK */}

  <Navbar />
  <FloatingContact />

      {/* Header */}
      <section className="pt-28 pb-8 md:pt-32 md:pb-12 bg-secondary">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Contact Baja International Realty
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Let's discuss your real estate goals. Our team is ready to help you find your perfect property in Cabo San Lucas.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Information */}
            <div className="space-y-8 min-w-0 order-2 lg:order-1">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">Get in Touch</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Whether you're looking to buy, sell, or invest in luxury real estate in Cabo San Lucas, we're here to help. Reach out today for a consultation.
                </p>
              </div>

              {/* Contact Details */}
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="p-3 rounded-full bg-accent/10">
                      <MapPin className="h-6 w-6 text-accent" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Office Address</h3>
                    <a 
                      href="https://www.google.com/maps/search/?api=1&query=Baja+International+Realty&query_place_id=ChIJcTwoxOVKr4YRS3pyN5KCw3E" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-muted-foreground text-sm hover:text-accent transition-fast"
                    >
                      Blvd. Marina 14<br />
                  Plaza Nautica local A6<br />
                  Colonia Centro<br />
                      Cabo San Lucas, Baja California Sur<br />
                      CP 23450
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="p-3 rounded-full bg-accent/10">
                      <Phone className="h-6 w-6 text-accent" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">WhatsApp</h3>
                    <p className="text-muted-foreground text-sm">
                      <a href="https://wa.me/526241296245" target="_blank" rel="noopener" className="hover:text-accent transition-fast">
                        WhatsApp
                      </a>
                      <br />
                      Message Don on WhatsApp
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="p-3 rounded-full bg-accent/10">
                      <Mail className="h-6 w-6 text-accent" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Send an inquiry</h3>
                    <a 
                      href="#bir-inquiry" data-bir-inquiry 
                      className="text-muted-foreground text-sm hover:text-accent transition-fast"
                    >
                      Send an inquiry
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="p-3 rounded-full bg-accent/10">
                      <Clock className="h-6 w-6 text-accent" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Office Hours</h3>
                    <p className="text-muted-foreground text-sm">
                      Monday - Friday: 9:00 AM - 6:00 PM PT<br />
                      Saturday: 10:00 AM - 4:00 PM PT<br />
                      Sunday: 10:00 AM - 4:00 PM PT
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2 min-w-0 order-1 lg:order-2">
              <form id="inquiry-form" data-bir-lead-form="general_contact" onSubmit={handleSubmit} className="bg-card p-5 sm:p-8 rounded-2xl border border-border shadow-elegant min-w-0">
                <div aria-hidden="true" style={{position:'absolute',left:'-10000px',width:1,height:1,overflow:'hidden'}}><label>Leave this field empty<input name="website" value={website} onChange={e=>setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" /></label></div>
                <h2 className="text-2xl font-bold text-foreground mb-3">Send an inquiry</h2>
                <p className="text-muted-foreground mb-3">Send your inquiry right here. No email app, WhatsApp or registration needed.</p>
                <p className="text-sm text-muted-foreground mb-6">{formData.preferredAgent && formData.preferredAgent !== 'no-preference' && formData.preferredAgent !== 'Don Weis' ? `Your inquiry will go to ${formData.preferredAgent}, with a copy to Don Weis.` : 'Your inquiry will go directly to Don Weis.'}</p>
                
                {submitStatus === 'success' && (
                  <div role="status" className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                    <strong>✓ Message sent successfully!</strong>
                    <p className="text-sm mt-1">
                      {formData.preferredAgent 
                        ? `${formData.preferredAgent} will respond within 24 hours.` 
                        : "We'll respond within 24 hours."
                      } Check your email for confirmation.
                    </p>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div role="alert" className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                    <strong>✗ Failed to send message.</strong>
                    <p className="text-sm mt-1">Please try again, or use WhatsApp to contact Don.</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                      Full Name *
                    </label>
                    <Input 
                      id="name"
                      name="name"
                      autoComplete="name"
                      maxLength={160} 
                      required 
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      Email Address *
                    </label>
                    <Input 
                      id="email"
                      name="email"
                      autoComplete="email"
                      maxLength={254} 
                      type="email" 
                      required 
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                      Phone Number (optional)
                    </label>
                    <Input 
                      id="phone"
                      name="phone"
                      autoComplete="tel"
                      maxLength={60} 
                      type="tel" 
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label htmlFor="preferred-agent" className="block text-sm font-medium text-foreground mb-2">
                      Preferred Agent (optional)
                    </label>
                    <Select
                      value={formData.preferredAgent}
                      onValueChange={(value) => setFormData({...formData, preferredAgent: value})}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="preferred-agent">
                        <SelectValue placeholder="Select an agent (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-preference">No Preference</SelectItem>
                        {agents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.name}>
                            {agent.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                    Message *
                  </label>
                  <Textarea 
                    id="message"
                    name="message"
                    minLength={3}
                    maxLength={6000} 
                    required 
                    placeholder="Tell us about your real estate needs in Cabo San Lucas..."
                    className="min-h-32"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    type="submit" 
                    variant="luxury" 
                    size="lg" 
                    className="w-full sm:flex-1 min-w-0"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send inquiry'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="lg"
                    className="w-full sm:w-auto"
                    onClick={() => window.location.href = 'https://wa.me/526241296245'}
                  >
                    WhatsApp Don
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground mt-4">
                  * Required fields. We'll respond within 24 hours during business hours.
                </p>
              <p className="bir-contact-call">Prefer to call Don? <a href="tel:+526241296245">+52 624 129 6245</a></p>
                  </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Visit Our Office</h2>
          <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-elegant">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.234567890123!2d-109.9120108!3d22.8824834!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x86af4ae5c4283c71%3A0x71c3829237727a4b!2sBaja%20International%20Realty!5e0!3m2!1sen!2smx!4v1234567890123!5m2!1sen!2smx"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Baja International Realty Office Location"
            />
          </div>
          <div className="text-center mt-6">
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=Baja+International+Realty&destination_place_id=ChIJcTwoxOVKr4YRS3pyN5KCw3E"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-accent hover:text-accent/80 font-semibold transition-fast"
            >
              <MapPin className="h-5 w-5" />
              Get Directions to Our Office
            </a>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Conveniently located in the heart of Downtown Cabo San Lucas, just steps from the Marina, our office is easy to find and always ready to assist you. Visit us during regular business hours, or contact us to schedule a private appointment at your convenience.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
