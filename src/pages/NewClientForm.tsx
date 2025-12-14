import { useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Agent data - you can move this to a separate file later
const agentsData = {
  susu: {
    id: 9,
    name: "Susu Vieira",
    email: "Susu@BIRCabo.com",
    phone: "+1 (808) 226-6120"
  },
  bob: {
    id: 1,
    name: "Bob Van Patten",
    email: "robertvanpatten2@gmail.com",
    phone: "+52 624 127 6012"
  },
  alfonso: {
    id: 3,
    name: "Alfonso Puente",
    email: "alfonso@bircabo.com",
    phone: "+52 664 188 8681"
  },
  david: {
    id: 8,
    name: "David Scott Piper",
    email: "David@bircabo.com",
    phone: "+52 624 317 0297"
  },
  erika: {
    id: 2,
    name: "Erika Aispuro",
    email: "eaispuro80@gmail.com",
    phone: "+52 624 109 7909"
  },
  hector: {
    id: 5,
    name: "Hector Mendoza",
    email: "Hector@bircabo.com",
    phone: "+52 624 211 4879"
  },
  marisol: {
    id: 7,
    name: "Marisol Tort",
    email: "mtortricardi@gmail.com",
    phone: "+52 624 264 3896"
  },
  cozbi: {
    id: 4,
    name: "Cozbi Sanchez",
    email: "Cozbi@bajainternationalrealty.com",
    phone: "+52 624 118 9512"
  },
  edgar: {
    id: 10,
    name: "Edgar Pacheco",
    email: "Edgar@bircabo.com",
    phone: "+52 612 169 8328"
  },
  don: {
    id: 12,
    name: "Don Weis",
    email: "Don@bircabo.com",
    phone: "+52 624 143 5555"
  },
  "fernando-cabrera": {
    id: 11,
    name: "Fernando Cabrera",
    email: "fernando@bircabo.com",
    phone: "+52 624 135 8900"
  },
"bonnie-renee": {
  id: 15,
  name: "Bonnie Renee G.",
  email: "bonnie@bircabo.com",
  phone: "+52 1 624 127 6012"
},
  "erika-graciano": {
  id: 14,
  name: "Erika Graciano",
  email: "erikag@bircabo.com",
  phone: "+52 624 157 2154"
},
  "charles-jones": {
    id: 13,
    name: "Charles Jones",
    email: "cabocharlie79@gmail.com",
    phone: "+1 858 964 4629"
  }
};

const NewClientForm = () => {
  const { toast } = useToast();
  const { agentSlug } = useParams<{ agentSlug?: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get agent data from URL param or default to office
  const agent = agentSlug && agentsData[agentSlug as keyof typeof agentsData]
    ? agentsData[agentSlug as keyof typeof agentsData]
    : { id: 0, name: "BIR Office", email: "info@bircabo.com", phone: "+52 624 143 5555" };

  const [formData, setFormData] = useState({
    date: new Date().toLocaleDateString('en-CA'),
    lastName: "",
    firstName: "",
    city: "",
    state: "",
    cellPhone: "",
    workInCabo: "",
    personalEmail: "",
    
    // Agent Selection
    preferredAgentSlug: "",
    preferredAgentName: "",
    preferredAgentEmail: "",
    
    yearsComingToCabo: "",
    stayingAt: "",
    propertyType: "",
    priceRange: "",
    numberOfBedrooms: "",
    numberOfBathrooms: "",
    otherSpecifications: "",
    investmentLocation: "",
    followUp: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Determine which agent to send to (URL agent takes priority over selected agent)
      const finalAgent = agentSlug 
        ? agent 
        : (formData.preferredAgentSlug && agentsData[formData.preferredAgentSlug as keyof typeof agentsData])
          ? agentsData[formData.preferredAgentSlug as keyof typeof agentsData]
          : { id: 0, name: "BIR Office", email: "info@bircabo.com", phone: "+52 624 143 5555" };

      // Map form fields to API expected field names
      const submissionData = {
        // Client info
        clientName: `${formData.firstName} ${formData.lastName}`,
        clientEmail: formData.personalEmail,
        clientPhone: formData.cellPhone,
        clientAddress: formData.city && formData.state ? `${formData.city}, ${formData.state}` : "",
        
        // Property preferences
        propertyType: formData.propertyType,
        priceRange: formData.priceRange,
        bedrooms: formData.numberOfBedrooms,
        bathrooms: formData.numberOfBathrooms,
        preferredAreas: formData.investmentLocation,
        moveInTimeline: formData.yearsComingToCabo,
        
        // Additional info
        additionalNotes: `Work in Cabo: ${formData.workInCabo}\nStaying At: ${formData.stayingAt}\nOther Specifications: ${formData.otherSpecifications}\n\nFollow Up Notes:\n${formData.followUp}`,
        howDidYouHear: "New Client Form",
        
        // Agent info (using final selected agent)
        agentName: finalAgent.name,
        agentEmail: finalAgent.email,
        agentId: finalAgent.id,
        
        // Metadata
        source: `New Client Form - ${finalAgent.name}`,
        formType: 'new-client-form',
        timestamp: new Date().toISOString()
      };

      const response = await fetch('/api/contact/new-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      toast({
        title: "Form Submitted Successfully! ✓",
        description: `Thank you! ${finalAgent.name} will contact you soon.`,
      });

      // Reset form
      setFormData({
        date: new Date().toLocaleDateString('en-CA'),
        lastName: "",
        firstName: "",
        city: "",
        state: "",
        cellPhone: "",
        workInCabo: "",
        personalEmail: "",
        preferredAgentSlug: "",
        preferredAgentName: "",
        preferredAgentEmail: "",
        yearsComingToCabo: "",
        stayingAt: "",
        propertyType: "",
        priceRange: "",
        numberOfBedrooms: "",
        numberOfBathrooms: "",
        otherSpecifications: "",
        investmentLocation: "",
        followUp: ""
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error Submitting Form",
        description: `Please try again or call ${agent.name} at ${agent.phone}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
  <div className="min-h-screen bg-gray-50">
    <Helmet>
      <title>New Client Form | Work with Baja International Realty | Cabo San Lucas</title>
      <meta 
        name="description" 
        content="Start your Cabo San Lucas real estate journey. Complete our client form to connect with expert agents and find your dream property." 
      />
      <link rel="canonical" href="https://www.bircabo.com/new-client" />
      <meta property="og:url" content="https://www.bircabo.com/new-client" />
      <meta property="og:title" content="New Client Registration | Baja International Realty" />
      <meta property="og:description" content="Register as a new client with Baja International Realty. Get personalized service from our expert Cabo San Lucas agents." />
      <meta property="og:type" content="website" />
      <meta name="robots" content="noindex, follow" />
    </Helmet>
    
    <Navbar />

    <div className="container mx-auto px-4 py-8 sm:py-16 max-w-4xl">
      
      <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <img
            src="/BIRLOGO.png"
            alt="BIR Logo"
            className="h-16 sm:h-20 w-auto"
          />

          <div className="text-center sm:text-right">
            <label className="text-sm font-semibold text-gray-700">DATE:</label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="mt-1 w-full sm:w-48"
            />
          </div>
        </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-2">NEW CLIENT FORM</h1>
          <p className="text-center text-gray-600 mb-8">For {agent.name}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block uppercase">Last Name:</Label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block uppercase">First Name(s):</Label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  required
                  className="w-full"
                />
              </div>
            </div>

            {/* City & State */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block uppercase">City:</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block uppercase">State:</Label>
                <Input
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  className="w-full"
                />
              </div>
            </div>

            {/* Cell Phone & Work in Cabo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block uppercase">Cell Phone:</Label>
                <Input
                  type="tel"
                  value={formData.cellPhone}
                  onChange={(e) => setFormData({...formData, cellPhone: e.target.value})}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block uppercase">Work in Cabo:</Label>
                <RadioGroup
                  value={formData.workInCabo}
                  onValueChange={(value) => setFormData({...formData, workInCabo: value})}
                  className="flex gap-6 mt-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="YES" id="work-yes" />
                    <Label htmlFor="work-yes" className="cursor-pointer">YES</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="NO" id="work-no" />
                    <Label htmlFor="work-no" className="cursor-pointer">NO</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Email */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block uppercase">Personal Email:</Label>
              <Input
                type="email"
                value={formData.personalEmail}
                onChange={(e) => setFormData({...formData, personalEmail: e.target.value})}
                required
                className="w-full"
              />
            </div>

            {/* Preferred Agent Selection */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Label className="text-sm font-semibold text-gray-700 mb-2 block uppercase">
                Preferred Agent (Optional):
              </Label>
              <p className="text-sm text-gray-600 mb-3">
                {agentSlug ? `Assigned to: ${agent.name}` : 'Select an agent to work with, or leave blank for office assignment'}
              </p>
              {!agentSlug && (
                <select
                  value={formData.preferredAgentSlug}
                  onChange={(e) => {
                    const selectedSlug = e.target.value;
                    if (selectedSlug && agentsData[selectedSlug as keyof typeof agentsData]) {
                      const selectedAgent = agentsData[selectedSlug as keyof typeof agentsData];
                      setFormData({
                        ...formData, 
                        preferredAgentSlug: selectedSlug,
                        preferredAgentName: selectedAgent.name,
                        preferredAgentEmail: selectedAgent.email
                      });
                    } else {
                      setFormData({
                        ...formData, 
                        preferredAgentSlug: '',
                        preferredAgentName: '',
                        preferredAgentEmail: ''
                      });
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">No Preference - Office Will Assign</option>
                <option value="alfonso">Alfonso Puente</option>
                <option value="bob">Bob Van Patten</option>
                <option value="charles-jones">Charles Jones</option>
                <option value="cozbi">Cozbi Sanchez</option>
                <option value="erika-graciano">Erika Graciano</option>
                <option value="david">David Scott Piper</option>
                <option value="don">Don Weis</option>
                <option value="edgar">Edgar Pacheco</option>
                <option value="erika">Erika Aispuro</option>
                <option value="fernando-cabrera">Fernando Cabrera</option>
                <option value="bonnie-renee">Bonnie Renee G.</option>
                <option value="hector">Hector Mendoza</option>
                <option value="marisol">Marisol Tort</option>
                <option value="susu">Susu Vieira</option>
                </select>
              )}
            </div>

            {/* Years Coming to Cabo & Staying At */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block uppercase">Years Coming to Cabo:</Label>
                <Input
                  value={formData.yearsComingToCabo}
                  onChange={(e) => setFormData({...formData, yearsComingToCabo: e.target.value})}
                  className="w-full"
                  placeholder="e.g., 5 years"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block uppercase">Staying At:</Label>
                <Input
                  value={formData.stayingAt}
                  onChange={(e) => setFormData({...formData, stayingAt: e.target.value})}
                  className="w-full"
                  placeholder="Hotel/Resort name"
                />
              </div>
            </div>

            {/* Property Type - RADIO BUTTONS */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-3 block uppercase">Type of Property:</Label>
              <RadioGroup
                value={formData.propertyType}
                onValueChange={(value) => setFormData({...formData, propertyType: value})}
                className="grid grid-cols-2 md:grid-cols-4 gap-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="CONDO" id="condo" />
                  <Label htmlFor="condo" className="font-normal cursor-pointer">CONDO</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="HOUSE" id="house" />
                  <Label htmlFor="house" className="font-normal cursor-pointer">HOUSE</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="LAND" id="land" />
                  <Label htmlFor="land" className="font-normal cursor-pointer">LAND</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="COMMERCIAL" id="commercial" />
                  <Label htmlFor="commercial" className="font-normal cursor-pointer">COMMERCIAL</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Price Range & Bedrooms/Bathrooms */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block uppercase">Price Range:</Label>
                <Input
                  value={formData.priceRange}
                  onChange={(e) => setFormData({...formData, priceRange: e.target.value})}
                  className="w-full"
                  placeholder="e.g., $500K - $1M"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block uppercase">Number of Bedrooms:</Label>
                <Input
                  value={formData.numberOfBedrooms}
                  onChange={(e) => setFormData({...formData, numberOfBedrooms: e.target.value})}
                  className="w-full"
                  placeholder="e.g., 3"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block uppercase">Number of Bathrooms:</Label>
                <Input
                  value={formData.numberOfBathrooms}
                  onChange={(e) => setFormData({...formData, numberOfBathrooms: e.target.value})}
                  className="w-full"
                  placeholder="e.g., 2.5"
                />
              </div>
            </div>

            {/* Other Specifications */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block uppercase">Other Specifications:</Label>
              <Input
                value={formData.otherSpecifications}
                onChange={(e) => setFormData({...formData, otherSpecifications: e.target.value})}
                className="w-full"
                placeholder="Pool, ocean view, garage, etc."
              />
            </div>

            {/* Where Would You Invest - RADIO BUTTONS */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-3 block uppercase">Where Would You Invest?</Label>
              <RadioGroup
                value={formData.investmentLocation}
                onValueChange={(value) => setFormData({...formData, investmentLocation: value})}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="CABO SAN LUCAS" id="cabo-san-lucas" />
                  <Label htmlFor="cabo-san-lucas" className="font-normal cursor-pointer">CABO SAN LUCAS</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="CORRIDOR" id="corridor" />
                  <Label htmlFor="corridor" className="font-normal cursor-pointer">CORRIDOR</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="SAN JOSE" id="san-jose" />
                  <Label htmlFor="san-jose" className="font-normal cursor-pointer">SAN JOSE</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="PACIFIC SIDE" id="pacific-side" />
                  <Label htmlFor="pacific-side" className="font-normal cursor-pointer">PACIFIC SIDE</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Follow Up */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block uppercase">Follow Up:</Label>
              <Textarea
                value={formData.followUp}
                onChange={(e) => setFormData({...formData, followUp: e.target.value})}
                className="w-full min-h-[150px]"
                placeholder="Additional notes, mls number, preferences, or questions..."
              />
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold"
                style={{ backgroundColor: '#102f74', color: 'white' }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit New Client Form'}
              </Button>
              <p className="text-xs text-center text-gray-500 mt-3">
                By submitting this form, you agree to be contacted by Baja International Realty regarding your property interests.
              </p>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default NewClientForm;