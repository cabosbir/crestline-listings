import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Phone, Mail, Clock, UserPlus } from "lucide-react";

const Contact = () => {
  const [searchParams] = useSearchParams();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: '',
    propertyType: '',
    preferredAgent: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  // Pre-fill agent if coming from agent page
  useEffect(() => {
    const agentFromUrl = searchParams.get('agent');
    if (agentFromUrl) {
      setFormData(prev => ({
        ...prev,
        preferredAgent: agentFromUrl,
        message: `I would like to discuss properties with ${agentFromUrl}.`
      }));
    }
  }, [searchParams]);

  // List of agents - matches Team.tsx
  const agents = [
    { id: 1, name: "Bob Van Patten", email: "robertvanpatten2@gmail.com" },
    { id: 2, name: "Erika Aispuro", email: "Erika80@gmail.com" },
    { id: 3, name: "Alfonso Puente", email: "alfonso@bircabo.com" },
    { id: 4, name: "Cozbi Sanchez", email: "Cozbi@bajainternationalrealty.com" },
    { id: 5, name: "Hector Mendoza", email: "Hector@bircabo.com" },
    { id: 6, name: "Cristy Cavazos", email: "Cristina.cavazos@grupoveq.com" },
    { id: 7, name: "Marisol Tort", email: "mtortricardi@gmail.com" },
    { id: 8, name: "David Scott Piper", email: "David@bircabo.com" },
    { id: 9, name: "Susu Vieira", email: "Susu@bircabo.com" },
    { id: 10, name: "Edgar Pacheco", email: "Edgar@bircabo.com" },
    { id: 12, name: "Don Weis", email: "Don@bircabo.com" }
  ];

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
          agentEmail, // Include agent email for routing
        })
      });

      const data = await response.json();

      if (data.success) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          inquiryType: '',
          propertyType: '',
          preferredAgent: '',
          message: ''
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <FloatingContact />

      {/* Header */}
      <section className="pt-32 pb-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Let's discuss your real estate goals. Our team is ready to help you find your perfect property in Cabo San Lucas.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
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
                      href="https://maps.app.goo.gl/DsyfVAHBARUKDJAX8" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-muted-foreground text-sm hover:text-accent transition-fast"
                    >
                      Boulevard Marina s/n y Vicente Guerrero s/n<br />
                      Manzana 31-A, Colonia Centro<br />
                      Cabo San Lucas, Baja California Sur<br />
                      México, C.P. 23400
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
                    <h3 className="font-semibold text-foreground mb-1">Phone</h3>
                    <p className="text-muted-foreground text-sm">
                      <a href="tel:+526241435555" className="hover:text-accent transition-fast">
                        +52 624 143 5555
                      </a>
                      <br />
                      Office Main Line
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
                    <h3 className="font-semibold text-foreground mb-1">Email</h3>
                    <a 
                      href="mailto:info@bircabo.com" 
                      className="text-muted-foreground text-sm hover:text-accent transition-fast"
                    >
                      info@bircabo.com
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
            <div className="lg:col-span-2">
              {/* New Client Registration Banner */}
              <div className="mb-6 bg-gradient-to-r from-accent/10 to-accent/5 p-6 rounded-2xl border-2 border-accent/20">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="p-3 rounded-full bg-accent/20">
                      <UserPlus className="h-6 w-6 text-accent" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      New Client? Register Here
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Complete our New Client Registration form for personalized service. Select your preferred agent and share your property preferences.
                    </p>
                    <Button 
                      variant="luxury" 
                      size="lg"
                      onClick={() => window.location.href = '/new-client'}
                    >
                      📋 Complete New Client Form
                    </Button>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="bg-card p-8 rounded-2xl border border-border shadow-elegant">
                <h2 className="text-2xl font-bold text-foreground mb-6">Send Us a General Message</h2>
                
                {submitStatus === 'success' && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
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
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                    <strong>✗ Failed to send message.</strong>
                    <p className="text-sm mt-1">Please call us at +52 624 143 5555 or email info@bircabo.com</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                      Full Name *
                    </label>
                    <Input 
                      id="name" 
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
                      Phone Number
                    </label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label htmlFor="inquiry-type" className="block text-sm font-medium text-foreground mb-2">
                      Inquiry Type *
                    </label>
                    <Select 
                      required
                      value={formData.inquiryType}
                      onValueChange={(value) => setFormData({...formData, inquiryType: value})}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="inquiry-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buying">Buying</SelectItem>
                        <SelectItem value="selling">Selling</SelectItem>
                        <SelectItem value="renting">Renting</SelectItem>
                        <SelectItem value="investment">Investment Opportunity</SelectItem>
                        <SelectItem value="general">General Inquiry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="property-type" className="block text-sm font-medium text-foreground mb-2">
                      Property Type of Interest
                    </label>
                    <Select
                      value={formData.propertyType}
                      onValueChange={(value) => setFormData({...formData, propertyType: value})}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="property-type">
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="oceanfront-villa">Oceanfront Villa</SelectItem>
                        <SelectItem value="beachfront-condo">Beachfront Condo</SelectItem>
                        <SelectItem value="penthouse">Penthouse</SelectItem>
                        <SelectItem value="luxury-estate">Luxury Estate</SelectItem>
                        <SelectItem value="investment-property">Investment Property</SelectItem>
                        <SelectItem value="land">Land/Lot</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label htmlFor="preferred-agent" className="block text-sm font-medium text-foreground mb-2">
                      Preferred Agent
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
                    required 
                    placeholder="Tell us about your real estate needs in Cabo San Lucas..."
                    className="min-h-32"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    variant="luxury" 
                    size="lg" 
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="lg"
                    onClick={() => window.open('tel:+526241435555')}
                  >
                    Call Now
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground mt-4">
                  * Required fields. We'll respond within 24 hours during business hours.
                </p>
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
              href="https://maps.app.goo.gl/DsyfVAHBARUKDJAX8"
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