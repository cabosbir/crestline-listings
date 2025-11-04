import { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Home, DollarSign, Bed, Bath, Calendar, MessageSquare, Info } from 'lucide-react';

// Agent data - matches your actual team
const agentData = {
  don: { 
    name: "Don Weis", 
    email: "Don@bircabo.com", 
    id: "don",
    title: "Founder & Broker"
  },
  bob: { 
    name: "Bob Van Patten", 
    email: "robertvanpatten2@gmail.com", 
    id: "bob",
    title: "Senior Real Estate Advisor"
  },
  alfonso: { 
    name: "Alfonso Puente", 
    email: "alfonso@bircabo.com", 
    id: "alfonso",
    title: "Sales Manager & Commercial Real Estate Expert"
  },
  david: { 
    name: "David Scott Piper", 
    email: "David@bircabo.com", 
    id: "david",
    title: "International Real Estate Specialist"
  },
  cristy: { 
    name: "Cristy Cavazos", 
    email: "Cristina.cavazos@grupoveq.com", 
    id: "cristy",
    title: "Luxury Condo Specialist"
  },
  erika: { 
    name: "Erika Aispuro", 
    email: "eaispuro80@gmail.com", 
    id: "erika",
    title: "Luxury Property Specialist"
  },
  hector: { 
    name: "Hector Mendoza", 
    email: "Hector@bircabo.com", 
    id: "hector",
    title: "Investment Property Advisor"
  },
  susu: { 
    name: "Susu Vieira", 
    email: "Susu@bircabo.com", 
    id: "susu",
    title: "Real Estate Advisor"
  },
  marisol: { 
    name: "Marisol Tort", 
    email: "mtortricardi@gmail.com", 
    id: "marisol",
    title: "Real Estate Advisor"
  },
  cozbi: { 
    name: "Cozbi Sanchez", 
    email: "Cozbi@bajainternationalrealty.com", 
    id: "cozbi",
    title: "Residential Specialist"
  },
  edgar: { 
    name: "Edgar Pacheco", 
    email: "Edgar@bircabo.com", 
    id: "edgar",
    title: "Real Estate Advisor"
  },
};

const AgentNewClientForm = () => {
  const { agentId } = useParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get agent info
  const agent = agentId ? agentData[agentId.toLowerCase()] : null;

  // Form state
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    propertyType: '',
    priceRange: '',
    bedrooms: '',
    bathrooms: '',
    preferredAreas: '',
    moveInTimeline: '',
    additionalNotes: '',
    howDidYouHear: '',
  });

  // If invalid agent, redirect to 404
  if (!agent) {
    return <Navigate to="/404" replace />;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact/agent-new-client.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          agentName: agent.name,
          agentEmail: agent.email,
          agentId: agent.id,
          source: 'Agent New Client Form',
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Registration Successful! 🎉",
          description: data.message,
          duration: 5000,
        });

        // Reset form
        setFormData({
          clientName: '',
          clientEmail: '',
          clientPhone: '',
          clientAddress: '',
          propertyType: '',
          priceRange: '',
          bedrooms: '',
          bathrooms: '',
          preferredAreas: '',
          moveInTimeline: '',
          additionalNotes: '',
          howDidYouHear: '',
        });
      } else {
        throw new Error(data.error || 'Failed to submit form');
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again or contact us directly.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-2">New Client Registration</h1>
          <p className="text-blue-200 text-lg">{agent.name}</p>
          <p className="text-blue-300 text-sm">{agent.title}</p>
          <p className="text-blue-300 text-sm mt-2">Baja International Realty</p>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-xl p-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h2>
            <p className="text-gray-600">Please provide your information so {agent.name} can serve you better.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
              
              <div>
                <Label htmlFor="clientName" className="required">Full Name *</Label>
                <div className="relative mt-1">
                  <Input
                    id="clientName"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    required
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="clientEmail" className="required">Email Address *</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="clientEmail"
                    name="clientEmail"
                    type="email"
                    value={formData.clientEmail}
                    onChange={handleInputChange}
                    required
                    placeholder="john@example.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="clientPhone">Phone Number</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="clientPhone"
                    name="clientPhone"
                    type="tel"
                    value={formData.clientPhone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="clientAddress">Current Address</Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="clientAddress"
                    name="clientAddress"
                    value={formData.clientAddress}
                    onChange={handleInputChange}
                    placeholder="City, State/Province, Country"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Property Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Property Preferences</h3>
              
              <div>
                <Label htmlFor="propertyType">Property Type</Label>
                <div className="relative mt-1">
                  <Home className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <select
                    id="propertyType"
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select property type</option>
                    <option value="Condo">Condo</option>
                    <option value="House">House</option>
                    <option value="Villa">Villa</option>
                    <option value="Townhouse">Townhouse</option>
                    <option value="Land">Land</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="priceRange">Price Range</Label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <select
                    id="priceRange"
                    name="priceRange"
                    value={formData.priceRange}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select price range</option>
                    <option value="Under $200K">Under $200K</option>
                    <option value="$200K - $500K">$200K - $500K</option>
                    <option value="$500K - $1M">$500K - $1M</option>
                    <option value="$1M - $2M">$1M - $2M</option>
                    <option value="$2M - $5M">$2M - $5M</option>
                    <option value="Over $5M">Over $5M</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <div className="relative mt-1">
                    <Bed className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <select
                      id="bedrooms"
                      name="bedrooms"
                      value={formData.bedrooms}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Any</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5+">5+</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <div className="relative mt-1">
                    <Bath className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <select
                      id="bathrooms"
                      name="bathrooms"
                      value={formData.bathrooms}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Any</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5+">5+</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="preferredAreas">Preferred Areas/Neighborhoods</Label>
                <Input
                  id="preferredAreas"
                  name="preferredAreas"
                  value={formData.preferredAreas}
                  onChange={handleInputChange}
                  placeholder="e.g., Pedregal, Puerto Los Cabos, San Jose"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="moveInTimeline">Move-in Timeline</Label>
                <div className="relative mt-1">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <select
                    id="moveInTimeline"
                    name="moveInTimeline"
                    value={formData.moveInTimeline}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select timeline</option>
                    <option value="Immediately">Immediately</option>
                    <option value="1-3 months">1-3 months</option>
                    <option value="3-6 months">3-6 months</option>
                    <option value="6-12 months">6-12 months</option>
                    <option value="1+ years">1+ years</option>
                    <option value="Just browsing">Just browsing</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Additional Information</h3>
              
              <div>
                <Label htmlFor="additionalNotes">Additional Notes or Requirements</Label>
                <div className="relative mt-1">
                  <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Textarea
                    id="additionalNotes"
                    name="additionalNotes"
                    value={formData.additionalNotes}
                    onChange={handleInputChange}
                    placeholder="Tell us more about what you're looking for..."
                    rows={4}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="howDidYouHear">How did you hear about us?</Label>
                <div className="relative mt-1">
                  <Info className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <select
                    id="howDidYouHear"
                    name="howDidYouHear"
                    value={formData.howDidYouHear}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select an option</option>
                    <option value="Referral">Referral from friend/family</option>
                    <option value="Online Search">Online Search</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Previous Client">Previous Client</option>
                    <option value="Website">Website</option>
                    <option value="Event">Event/Open House</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white py-6 text-lg"
              >
                {isSubmitting ? 'Submitting...' : 'Complete Registration'}
              </Button>
              <p className="text-sm text-gray-500 text-center mt-4">
                By submitting this form, you agree to be contacted by {agent.name} from Baja International Realty.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AgentNewClientForm;
