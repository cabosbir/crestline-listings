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
import { MapPin, Phone, Mail, Clock } from "lucide-react";

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
    { id: 1, name: "Michael Chen", email: "michael@luxurycoastal.com" },
    { id: 2, name: "Sarah Johnson", email: "sarah@luxurycoastal.com" },
    { id: 3, name: "David Martinez", email: "david@luxurycoastal.com" },
    { id: 4, name: "Emily Thompson", email: "emily@luxurycoastal.com" },
    { id: 5, name: "Robert Kim", email: "robert@luxurycoastal.com" },
    { id: 6, name: "Jessica Rodriguez", email: "jessica@luxurycoastal.com" }
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
            Let's discuss your real estate goals. Our team is ready to help you find your perfect property.
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
                  Whether you're looking to buy, sell, or invest in luxury real estate, we're here to help. Reach out today for a consultation.
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
                    <p className="text-muted-foreground text-sm">
                      123 Ocean Drive<br />
                      Paradise City, PC 12345
                    </p>
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
                      US: +1 (234) 567-8900<br />
                      Local: +52 (123) 456-7890
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
                    <p className="text-muted-foreground text-sm">
                      info@luxurycoastal.com
                    </p>
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
                      Monday - Friday: 9:00 AM - 6:00 PM<br />
                      Saturday: 10:00 AM - 4:00 PM<br />
                      Sunday: By Appointment
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="bg-card p-8 rounded-2xl border border-border shadow-elegant">
                <h2 className="text-2xl font-bold text-foreground mb-6">Send Us a Message</h2>
                
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
                    <p className="text-sm mt-1">Please call us at +1 (234) 567-8900 or email info@luxurycoastal.com</p>
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
                      placeholder="+1 (234) 567-8900"
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
                        <SelectItem value="villa">Villa</SelectItem>
                        <SelectItem value="condo">Condo</SelectItem>
                        <SelectItem value="penthouse">Penthouse</SelectItem>
                        <SelectItem value="estate">Estate</SelectItem>
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
                    placeholder="Tell us about your real estate needs..."
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
                  <Button type="button" variant="outline" size="lg">
                    Schedule Call
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground mt-4">
                  * Required fields. We'll respond within 24 hours.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="bg-muted rounded-2xl overflow-hidden" style={{ height: "400px" }}>
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MapPin className="h-16 w-16 mx-auto mb-4 text-accent" />
                <p className="font-medium">Interactive Map</p>
                <p className="text-sm">123 Ocean Drive, Paradise City</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;