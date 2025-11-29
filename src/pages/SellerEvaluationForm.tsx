import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Upload, X, Image as ImageIcon } from "lucide-react";

// Agent data
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
  }
};

interface ImageFile {
  file: File;
  preview: string;
  base64?: string;
}

const SellerEvaluationForm = () => {
  const { toast } = useToast();
  const { agentSlug } = useParams<{ agentSlug?: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<ImageFile[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  // Get agent data from URL param or default to office
  const agent = agentSlug && agentsData[agentSlug as keyof typeof agentsData]
    ? agentsData[agentSlug as keyof typeof agentsData]
    : { id: 0, name: "BIR Office", email: "info@bircabo.com", phone: "+52 624 143 5555" };

  const [formData, setFormData] = useState({
    date: new Date().toLocaleDateString('en-CA'),
    lastName: "",
    firstName: "",
    cellPhone: "",
    personalEmail: "",
    
    // Agent Selection
    preferredAgentSlug: "",
    preferredAgentName: "",
    preferredAgentEmail: "",
    
    // Property Information
    propertyAddress: "",
    city: "",
    state: "",
    zipCode: "",
    propertyType: "",
    numberOfBedrooms: "",
    numberOfBathrooms: "",
    squareFootage: "",
    lotSize: "",
    yearBuilt: "",
    
    // Selling Details
    currentlyOccupied: "",
    reasonForSelling: "",
    desiredTimeframe: "",
    expectedPrice: "",
    recentUpgrades: "",
    
    // Additional Information
    additionalDetails: ""
  });

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check if adding these files would exceed the limit (10 images max)
    if (uploadedImages.length + files.length > 10) {
      toast({
        title: "Too Many Images",
        description: "You can upload a maximum of 10 images.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingImages(true);

    try {
      const newImages: ImageFile[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid File",
            description: `${file.name} is not an image file.`,
            variant: "destructive",
          });
          continue;
        }

        // Validate file size (max 5MB per image)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File Too Large",
            description: `${file.name} is larger than 5MB. Please compress it.`,
            variant: "destructive",
          });
          continue;
        }

        // Create preview URL
        const preview = URL.createObjectURL(file);

        // Convert to base64 for email attachment
        const base64 = await convertToBase64(file);

        newImages.push({
          file,
          preview,
          base64
        });
      }

      setUploadedImages([...uploadedImages, ...newImages]);
      
      toast({
        title: "Images Uploaded",
        description: `${newImages.length} image(s) added successfully.`,
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImages(false);
      // Reset input
      e.target.value = '';
    }
  };

  // Convert file to base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Remove image
  const removeImage = (index: number) => {
    const newImages = [...uploadedImages];
    URL.revokeObjectURL(newImages[index].preview); // Clean up preview URL
    newImages.splice(index, 1);
    setUploadedImages(newImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare images for email attachment
      const imageAttachments = uploadedImages.map((img, index) => ({
        filename: img.file.name,
        content: img.base64?.split(',')[1], // Remove data URL prefix
        encoding: 'base64',
        contentType: img.file.type
      }));

      // Determine which agent to send to (URL agent takes priority over selected agent)
      const finalAgent = agentSlug 
        ? agent 
        : (formData.preferredAgentSlug && agentsData[formData.preferredAgentSlug as keyof typeof agentsData])
          ? agentsData[formData.preferredAgentSlug as keyof typeof agentsData]
          : { id: 0, name: "BIR Office", email: "info@bircabo.com", phone: "+52 624 143 5555" };

      const submissionData = {
        // Seller info
        sellerName: `${formData.firstName} ${formData.lastName}`,
        sellerEmail: formData.personalEmail,
        sellerPhone: formData.cellPhone,
        
        // Property details
        propertyAddress: formData.propertyAddress,
        propertyCity: formData.city,
        propertyState: formData.state,
        propertyZip: formData.zipCode,
        propertyType: formData.propertyType,
        bedrooms: formData.numberOfBedrooms,
        bathrooms: formData.numberOfBathrooms,
        squareFootage: formData.squareFootage,
        lotSize: formData.lotSize,
        yearBuilt: formData.yearBuilt,
        
        // Selling information
        currentlyOccupied: formData.currentlyOccupied,
        reasonForSelling: formData.reasonForSelling,
        desiredTimeframe: formData.desiredTimeframe,
        expectedPrice: formData.expectedPrice,
        recentUpgrades: formData.recentUpgrades,
        additionalDetails: formData.additionalDetails,
        
        // Images
        images: imageAttachments,
        imageCount: uploadedImages.length,
        
        // Agent info (using final selected agent)
        agentName: finalAgent.name,
        agentEmail: finalAgent.email,
        agentId: finalAgent.id,
        
        // Metadata
        source: `Seller Evaluation Form - ${finalAgent.name}`,
        formType: 'seller-evaluation-form',
        timestamp: new Date().toISOString()
      };

      const response = await fetch('/api/contact/seller-evaluation', {
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
        description: `Thank you! ${finalAgent.name} will contact you soon with your free property evaluation.`,
      });

      // Reset form
      setFormData({
        date: new Date().toLocaleDateString('en-CA'),
        lastName: "",
        firstName: "",
        cellPhone: "",
        personalEmail: "",
        preferredAgentSlug: "",
        preferredAgentName: "",
        preferredAgentEmail: "",
        propertyAddress: "",
        city: "",
        state: "",
        zipCode: "",
        propertyType: "",
        numberOfBedrooms: "",
        numberOfBathrooms: "",
        squareFootage: "",
        lotSize: "",
        yearBuilt: "",
        currentlyOccupied: "",
        reasonForSelling: "",
        desiredTimeframe: "",
        expectedPrice: "",
        recentUpgrades: "",
        additionalDetails: ""
      });

      // Clean up image previews
      uploadedImages.forEach(img => URL.revokeObjectURL(img.preview));
      setUploadedImages([]);

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

          <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-2">
            FREE PROPERTY EVALUATION
          </h1>
          <p className="text-center text-gray-600 mb-2">Seller Information Form</p>
          <p className="text-center text-sm text-gray-500 mb-8">Agent: {agent.name}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Contact Information</h2>
              
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block uppercase">Cell Phone:</Label>
                  <Input
                    type="tel"
                    value={formData.cellPhone}
                    onChange={(e) => setFormData({...formData, cellPhone: e.target.value})}
                    required
                    className="w-full"
                    placeholder="+52 624 XXX XXXX"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block uppercase">Email Address:</Label>
                  <Input
                    type="email"
                    value={formData.personalEmail}
                    onChange={(e) => setFormData({...formData, personalEmail: e.target.value})}
                    required
                    className="w-full"
                  />
                </div>
              </div>

              {/* Preferred Agent Selection */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
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
                    <option value="cozbi">Cozbi Sanchez</option>
                    <option value="david">David Scott Piper</option>
                    <option value="don">Don Weis</option>
                    <option value="edgar">Edgar Pacheco</option>
                    <option value="erika">Erika Aispuro</option>
                    <option value="hector">Hector Mendoza</option>
                    <option value="marisol">Marisol Tort</option>
                    <option value="susu">Susu Vieira</option>
                  </select>
                )}
              </div>
            </div>

            {/* Property Information */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Property Information</h2>
              
              <div className="mb-4">
                <Label className="text-sm font-semibold text-gray-700 mb-2 block uppercase">Property Address:</Label>
                <Input
                  value={formData.propertyAddress}
                  onChange={(e) => setFormData({...formData, propertyAddress: e.target.value})}
                  required
                  className="w-full"
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block uppercase">City:</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    required
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
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block uppercase">Zip Code:</Label>
                  <Input
                    value={formData.zipCode}
                    onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Property Type */}
              <div className="mt-4">
                <Label className="text-sm font-semibold text-gray-700 mb-3 block uppercase">Property Type:</Label>
                <RadioGroup
                  value={formData.propertyType}
                  onValueChange={(value) => setFormData({...formData, propertyType: value})}
                  className="grid grid-cols-2 md:grid-cols-4 gap-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="CONDO" id="sell-condo" />
                    <Label htmlFor="sell-condo" className="font-normal cursor-pointer">CONDO</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="HOUSE" id="sell-house" />
                    <Label htmlFor="sell-house" className="font-normal cursor-pointer">HOUSE</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="VILLA" id="sell-villa" />
                    <Label htmlFor="sell-villa" className="font-normal cursor-pointer">VILLA</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="LAND" id="sell-land" />
                    <Label htmlFor="sell-land" className="font-normal cursor-pointer">LAND</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Property Details */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mt-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block uppercase">Bedrooms:</Label>
                  <Input
                    value={formData.numberOfBedrooms}
                    onChange={(e) => setFormData({...formData, numberOfBedrooms: e.target.value})}
                    className="w-full"
                    placeholder="e.g., 3"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block uppercase">Bathrooms:</Label>
                  <Input
                    value={formData.numberOfBathrooms}
                    onChange={(e) => setFormData({...formData, numberOfBathrooms: e.target.value})}
                    className="w-full"
                    placeholder="e.g., 2.5"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block uppercase">Year Built:</Label>
                  <Input
                    value={formData.yearBuilt}
                    onChange={(e) => setFormData({...formData, yearBuilt: e.target.value})}
                    className="w-full"
                    placeholder="e.g., 2015"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block uppercase">Square Footage:</Label>
                  <Input
                    value={formData.squareFootage}
                    onChange={(e) => setFormData({...formData, squareFootage: e.target.value})}
                    className="w-full"
                    placeholder="e.g., 2,500 sq ft"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block uppercase">Lot Size:</Label>
                  <Input
                    value={formData.lotSize}
                    onChange={(e) => setFormData({...formData, lotSize: e.target.value})}
                    className="w-full"
                    placeholder="e.g., 5,000 sq ft"
                  />
                </div>
              </div>
            </div>

            {/* Selling Details */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Selling Information</h2>
              
              <div className="mb-4">
                <Label className="text-sm font-semibold text-gray-700 mb-2 block uppercase">Currently Occupied:</Label>
                <RadioGroup
                  value={formData.currentlyOccupied}
                  onValueChange={(value) => setFormData({...formData, currentlyOccupied: value})}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="YES" id="occupied-yes" />
                    <Label htmlFor="occupied-yes" className="cursor-pointer">YES</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="NO" id="occupied-no" />
                    <Label htmlFor="occupied-no" className="cursor-pointer">NO</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block uppercase">Desired Timeframe:</Label>
                  <Input
                    value={formData.desiredTimeframe}
                    onChange={(e) => setFormData({...formData, desiredTimeframe: e.target.value})}
                    className="w-full"
                    placeholder="e.g., 3-6 months"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block uppercase">Expected Price:</Label>
                  <Input
                    value={formData.expectedPrice}
                    onChange={(e) => setFormData({...formData, expectedPrice: e.target.value})}
                    className="w-full"
                    placeholder="e.g., $850,000"
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label className="text-sm font-semibold text-gray-700 mb-2 block uppercase">Reason for Selling:</Label>
                <Input
                  value={formData.reasonForSelling}
                  onChange={(e) => setFormData({...formData, reasonForSelling: e.target.value})}
                  className="w-full"
                  placeholder="Optional"
                />
              </div>

              <div className="mt-4">
                <Label className="text-sm font-semibold text-gray-700 mb-2 block uppercase">Recent Upgrades/Renovations:</Label>
                <Textarea
                  value={formData.recentUpgrades}
                  onChange={(e) => setFormData({...formData, recentUpgrades: e.target.value})}
                  className="w-full"
                  placeholder="List any recent improvements, renovations, or upgrades..."
                  rows={3}
                />
              </div>
            </div>

            {/* Property Photos Upload */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Property Photos</h2>
              <p className="text-sm text-gray-600 mb-4">
                Upload photos of your property (optional, up to 10 images, max 5MB each)
              </p>

              {/* Upload Button */}
              <div className="mb-4">
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-700">Click to upload property photos</p>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG, or WebP (max 5MB per image)</p>
                  </div>
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isUploadingImages || uploadedImages.length >= 10}
                />
              </div>

              {/* Image Preview Grid */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.preview}
                        alt={`Property photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        {(image.file.size / 1024 / 1024).toFixed(1)}MB
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isUploadingImages && (
                <div className="text-center py-4">
                  <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-gray-600 mt-2">Processing images...</p>
                </div>
              )}
            </div>

            {/* Additional Details */}
            <div className="border-t pt-6">
              <Label className="text-sm font-semibold text-gray-700 mb-2 block uppercase">Additional Details / Notes:</Label>
              <Textarea
                value={formData.additionalDetails}
                onChange={(e) => setFormData({...formData, additionalDetails: e.target.value})}
                className="w-full min-h-[120px]"
                placeholder="Any additional information you'd like to share about your property..."
              />
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <Button
                type="submit"
                disabled={isSubmitting || isUploadingImages}
                className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? 'Submitting...' : 'Request Free Property Evaluation'}
              </Button>
              <p className="text-xs text-center text-gray-500 mt-3">
                By submitting this form, you agree to be contacted by Baja International Realty regarding your property evaluation.
              </p>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SellerEvaluationForm;