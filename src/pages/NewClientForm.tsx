import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const NewClientForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    lastName: "",
    firstName: "",
    city: "",
    state: "",
    cellPhone: "",
    workInCabo: "",
    personalEmail: "",
    yearsComingToCabo: "",
    stayingAt: "",
    propertyType: [] as string[],
    priceRange: "",
    numberOfBedrooms: "",
    numberOfBathrooms: "",
    otherSpecifications: "",
    investmentLocations: [] as string[],
    followUp: ""
  });

  const handlePropertyTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        propertyType: [...formData.propertyType, type]
      });
    } else {
      setFormData({
        ...formData,
        propertyType: formData.propertyType.filter(t => t !== type)
      });
    }
  };

  const handleInvestmentLocationChange = (location: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        investmentLocations: [...formData.investmentLocations, location]
      });
    } else {
      setFormData({
        ...formData,
        investmentLocations: formData.investmentLocations.filter(l => l !== location)
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare comprehensive additional notes
      const additionalNotes = `
CLIENT BACKGROUND:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
City/State: ${formData.city || 'Not specified'}, ${formData.state || 'Not specified'}
Years Coming to Cabo: ${formData.yearsComingToCabo || 'Not specified'}
Currently Staying At: ${formData.stayingAt || 'Not specified'}
Work in Cabo: ${formData.workInCabo || 'Not specified'}

PROPERTY REQUIREMENTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Property Type(s): ${formData.propertyType.length > 0 ? formData.propertyType.join(', ') : 'Not specified'}
Price Range: ${formData.priceRange || 'Not specified'}
Bedrooms: ${formData.numberOfBedrooms || 'Not specified'}
Bathrooms: ${formData.numberOfBathrooms || 'Not specified'}
Other Specifications: ${formData.otherSpecifications || 'None'}

PREFERRED LOCATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${formData.investmentLocations.length > 0 ? formData.investmentLocations.join(', ') : 'Not specified'}

FOLLOW-UP NOTES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${formData.followUp || 'No additional notes provided'}

SUBMISSION DATE: ${formData.date}
      `.trim();

      // Format data to match agent-new-client.js API expectations
      const submissionData = {
        // Client info
        clientName: `${formData.firstName} ${formData.lastName}`.trim(),
        clientEmail: formData.personalEmail,
        clientPhone: formData.cellPhone,
        clientAddress: `${formData.city}, ${formData.state}`.trim(),
        
        // Property preferences
        propertyType: formData.propertyType.join(', ') || 'Not specified',
        priceRange: formData.priceRange || 'Not specified',
        bedrooms: formData.numberOfBedrooms || 'Not specified',
        bathrooms: formData.numberOfBathrooms || 'Not specified',
        preferredAreas: formData.investmentLocations.join(', ') || 'Not specified',
        moveInTimeline: formData.yearsComingToCabo || 'Not specified',
        
        // Additional info
        additionalNotes: additionalNotes,
        howDidYouHear: 'New Client Form - Website',
        
        // Agent info - Send to Edgar by default
        agentName: 'Office Team',
        agentEmail: 'cabosbir@gmail.com',
        agentId: 'office',
        
        // Metadata
        source: 'new-client-form',
        timestamp: new Date().toISOString()
      };

      console.log('📤 Submitting to /api/contact/agent-new-client...');
      console.log('📋 Data:', submissionData);

      const response = await fetch('/api/contact/agent-new-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (response.ok) {
        console.log('✅ New Client Form submitted successfully!');
        console.log('📧 Response:', result);

        toast({
          title: "Form Submitted Successfully! ✓",
          description: result.message || "Thank you! we will contact you within 24 hours.",
        });

        // Reset form
        setFormData({
          date: new Date().toISOString().split('T')[0],
          lastName: "",
          firstName: "",
          city: "",
          state: "",
          cellPhone: "",
          workInCabo: "",
          personalEmail: "",
          yearsComingToCabo: "",
          stayingAt: "",
          propertyType: [],
          priceRange: "",
          numberOfBedrooms: "",
          numberOfBathrooms: "",
          otherSpecifications: "",
          investmentLocations: [],
          followUp: ""
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error(result.error || 'Submission failed');
      }

    } catch (error) {
      console.error('❌ Error submitting New Client Form:', error);
      
      toast({
        title: "Unable to Submit Form Online",
        description: "Please call us directly at +52 624 143 5555 or email cabosbir@gmail.com",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex justify-between items-start mb-8">
            <img 
              src="https://res.cloudinary.com/dhwnr1pa5/image/upload/v1762021536/Screenshot_2025-10-31_at_5.21.25_PM-removebg-preview_2_gndt9y.png"
              alt="BIR Logo"
              className="h-20 w-auto"
            />
            <div className="text-right">
              <label className="text-sm font-semibold text-gray-700">DATE:</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="mt-1 w-48"
              />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">NEW CLIENT FORM</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {/* City, State, Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <Label htmlFor="work-yes">YES</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="NO" id="work-no" />
                    <Label htmlFor="work-no">NO</Label>
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

            {/* Years Coming to Cabo & Staying At */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {/* Property Type */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-3 block uppercase">Type of Property:</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="condo"
                    checked={formData.propertyType.includes('CONDO')}
                    onCheckedChange={(checked) => handlePropertyTypeChange('CONDO', checked as boolean)}
                  />
                  <Label htmlFor="condo" className="font-normal cursor-pointer">CONDO</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="house"
                    checked={formData.propertyType.includes('HOUSE')}
                    onCheckedChange={(checked) => handlePropertyTypeChange('HOUSE', checked as boolean)}
                  />
                  <Label htmlFor="house" className="font-normal cursor-pointer">HOUSE</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="land"
                    checked={formData.propertyType.includes('LAND')}
                    onCheckedChange={(checked) => handlePropertyTypeChange('LAND', checked as boolean)}
                  />
                  <Label htmlFor="land" className="font-normal cursor-pointer">LAND</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="commercial"
                    checked={formData.propertyType.includes('COMMERCIAL')}
                    onCheckedChange={(checked) => handlePropertyTypeChange('COMMERCIAL', checked as boolean)}
                  />
                  <Label htmlFor="commercial" className="font-normal cursor-pointer">COMMERCIAL</Label>
                </div>
              </div>
            </div>

            {/* Price Range & Bedrooms/Bathrooms */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            {/* Where Would You Invest */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-3 block uppercase">Where Would You Invest?</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="cabo-san-lucas"
                    checked={formData.investmentLocations.includes('CABO SAN LUCAS')}
                    onCheckedChange={(checked) => handleInvestmentLocationChange('CABO SAN LUCAS', checked as boolean)}
                  />
                  <Label htmlFor="cabo-san-lucas" className="font-normal cursor-pointer">CABO SAN LUCAS</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="corridor"
                    checked={formData.investmentLocations.includes('CORRIDOR')}
                    onCheckedChange={(checked) => handleInvestmentLocationChange('CORRIDOR', checked as boolean)}
                  />
                  <Label htmlFor="corridor" className="font-normal cursor-pointer">CORRIDOR</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="san-jose"
                    checked={formData.investmentLocations.includes('SAN JOSE')}
                    onCheckedChange={(checked) => handleInvestmentLocationChange('SAN JOSE', checked as boolean)}
                  />
                  <Label htmlFor="san-jose" className="font-normal cursor-pointer">SAN JOSE</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pacific-side"
                    checked={formData.investmentLocations.includes('PACIFIC SIDE')}
                    onCheckedChange={(checked) => handleInvestmentLocationChange('PACIFIC SIDE', checked as boolean)}
                  />
                  <Label htmlFor="pacific-side" className="font-normal cursor-pointer">PACIFIC SIDE</Label>
                </div>
              </div>
            </div>

            {/* Follow Up */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block uppercase">Follow Up:</Label>
              <Textarea
                value={formData.followUp}
                onChange={(e) => setFormData({...formData, followUp: e.target.value})}
                className="w-full min-h-[150px]"
                placeholder="Additional notes, preferences, or questions..."
              />
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 text-lg font-semibold"
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