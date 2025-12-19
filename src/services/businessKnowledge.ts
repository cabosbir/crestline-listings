// ====================================================================
// BUSINESS KNOWLEDGE BASE
// Safe, public business information for AI chatbot responses
// ====================================================================

export interface AgentInfo {
  name: string;
  title: string;
  specialization: string;
  yearsExperience: number;
  propertiesSold: number;
  phone: string;
  phoneSecondary?: string;
  email: string;
  slug: string;
  languages: string[];
  certifications: string[];
  bio: string;
}

export interface CompanyInfo {
  name: string;
  shortName: string;
  alternateNames: string[];
  founded: string;
  yearsInBusiness: string;
  phone: string;
  email: string;
  website: string;
  address: {
    street: string;
    unit: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    googleMapsLink: string;
  };
  officeHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
    formatted: string;
  };
  social: {
    facebook: string;
  };
  stats: {
    combinedYearsExperience: string;
    propertiesSold: string;
    totalSalesVolume: string;
    familiesServed: string;
    totalAgents: number;
  };
  memberships: string[];
  mediaFeatures: string[];
  founderBio: string;
}

export const COMPANY_INFO: CompanyInfo = {
  name: "Baja International Realty",
  shortName: "BIR",
  alternateNames: ["BIR Cabo", "Baja International Realty Cabo"],
  founded: "Late 1980s (circa 1987)",
  yearsInBusiness: "35+",
  phone: "+52 624 143 5555",
  email: "info@bircabo.com",
  website: "bircabo.com",
  address: {
    street: "Boulevard Marina s/n y Vicente Guerrero s/n",
    unit: "Manzana 31-A, Colonia Centro",
    city: "Cabo San Lucas",
    state: "Baja California Sur",
    country: "México",
    postalCode: "23400",
    googleMapsLink: "https://maps.app.goo.gl/DsyfVAHBARUKDJAX8"
  },
  officeHours: {
    monday: "8:00 AM - 9:00 PM PT",
    tuesday: "8:00 AM - 9:00 PM PT",
    wednesday: "8:00 AM - 9:00 PM PT",
    thursday: "8:00 AM - 9:00 PM PT",
    friday: "8:00 AM - 9:00 PM PT",
    saturday: "8:00 AM - 9:00 PM PT",
    sunday: "8:00 AM - 9:00 PM PT",
    formatted: "Monday-Sunday: 8AM-9PM PT"
  },
  social: {
    facebook: "https://www.facebook.com/BajaInternationalRealty"
  },
  stats: {
    combinedYearsExperience: "75+",
    propertiesSold: "1,850+",
    totalSalesVolume: "$800M+",
    familiesServed: "2,200+",
    totalAgents: 13
  },
  memberships: [
    "MLS-BCS Founding Member (Multiple Listing Service of Baja California Sur)",
    "AMPI (Mexican Association of Real Estate Professionals)",
    "International Realtor®"
  ],
  mediaFeatures: ["CNN", "ABC 20/20", "National Radio Shows"],
  founderBio: "Founded by visionary broker Don Weis. Don's groundbreaking 'Mexico Gold' real estate education seminars were featured on CNN, 20/20, and national media."
};

export const TEAM_INFO: AgentInfo[] = [
  {
    name: "Don Weis",
    title: "Founder & Broker",
    specialization: "Luxury Properties & Development",
    yearsExperience: 35,
    propertiesSold: 2200,
    phone: "+52 624 143 5555",
    email: "Don@bircabo.com",
    slug: "don",
    languages: ["English", "Spanish"],
    certifications: ["Real Estate Broker", "International Realtor®", "MLS-BCS Founding Member", "AMPI® Member"],
    bio: "Visionary founder and broker of Baja International Realty, pioneering luxury real estate in Cabo San Lucas since the late 1980s."
  },
  {
    name: "Bob Van Patten",
    title: "Senior Real Estate Advisor",
    specialization: "High Yield Investment Properties",
    yearsExperience: 9,
    propertiesSold: 85,
    phone: "+52 624 127 6012",
    email: "robertvanpatten2@gmail.com",
    slug: "bob",
    languages: ["English"],
    certifications: ["MLS Member"],
    bio: "Specializes in high-yield investment properties with over $35 million in sales."
  },
  {
    name: "Alfonso Puente",
    title: "Sales Manager & Commercial Real Estate Expert",
    specialization: "Real Estate Developments & Market Analysis",
    yearsExperience: 18,
    propertiesSold: 890,
    phone: "+52 664 188 8681",
    email: "alfonso@bircabo.com",
    slug: "alfonso",
    languages: ["English", "Spanish"],
    certifications: ["REALTOR®", "CCIM", "CPM", "MLS Member"],
    bio: "Sales manager with exceptional track record leading commercial teams."
  },
  {
    name: "David Scott Piper",
    title: "Real Estate Advisor",
    specialization: "Luxury Properties",
    yearsExperience: 10,
    propertiesSold: 50,
    phone: "+52 624 317 0297",
    email: "David@bircabo.com",
    slug: "david",
    languages: ["English", "Spanish"],
    certifications: ["REALTOR®", "MLS Member"],
    bio: "Seasoned investor and advisor helping clients build successful portfolios."
  },
  {
    name: "Erika Aispuro",
    title: "Luxury Property Specialist",
    specialization: "Oceanfront Estates",
    yearsExperience: 8,
    propertiesSold: 60,
    phone: "+52 624 109 7909",
    email: "eaispuro80@gmail.com",
    slug: "erika",
    languages: ["English", "Spanish"],
    certifications: ["REALTOR®", "GRI", "ABR", "MLS Member"],
    bio: "Passionate about luxury coastal living in Cabo San Lucas."
  },
  {
    name: "Hector Mendoza",
    title: "Investment Property Advisor",
    specialization: "Investment & Portfolio",
    yearsExperience: 2,
    propertiesSold: 12,
    phone: "+52 624 211 4879",
    email: "Hector@bircabo.com",
    slug: "hector",
    languages: ["English", "Spanish"],
    certifications: ["REALTOR®", "CCIM", "CRS", "MLS Member"],
    bio: "Makes every transaction simple, personal, and rewarding."
  },
  {
    name: "Susu Vieira",
    title: "Luxury Real Estate Advisor",
    specialization: "Staging and Design",
    yearsExperience: 11,
    propertiesSold: 101,
    phone: "+1 (808) 226 6120",
    phoneSecondary: "+52 (612) 120 5289",
    email: "Susu@bircabo.com",
    slug: "susu",
    languages: ["English", "Spanish"],
    certifications: ["REALTOR®", "MLS Member"],
    bio: "Decades of experience with unmatched expertise and dedication."
  },
  {
    name: "Erika Graciano",
    title: "Real Estate Agent & Administrative Specialist",
    specialization: "Client Relations & Property Management",
    yearsExperience: 15,
    propertiesSold: 150,
    phone: "+52 624 157 2154",
    email: "erikag@bircabo.com",
    slug: "erika-graciano",
    languages: ["Spanish", "English"],
    certifications: ["Real Estate Agent", "AMPI® Member", "Administrative Management Specialist"],
    bio: "Extensive experience in document management and customer service."
  },
  {
    name: "Marisol Tort",
    title: "Real Estate Advisor",
    specialization: "Luxury Properties",
    yearsExperience: 12,
    propertiesSold: 50,
    phone: "+52 624 264 3896",
    email: "mtortricardi@gmail.com",
    slug: "marisol",
    languages: ["English", "Spanish"],
    certifications: ["REALTOR®", "MLS Member"],
    bio: "Trusted advisor specializing in profitable investment opportunities."
  },
  {
    name: "Cozbi Sanchez",
    title: "Residential Specialist",
    specialization: "Family Homes & Condos",
    yearsExperience: 8,
    propertiesSold: 105,
    phone: "+52 624 118 9512",
    email: "Cozbi@bajainternationalrealty.com",
    slug: "cozbi",
    languages: ["English", "Spanish"],
    certifications: ["REALTOR®", "ABR", "SRS", "MLS Member"],
    bio: "Brings dedication and genuine care to every transaction."
  },
  {
    name: "Edgar Pacheco",
    title: "Real Estate Advisor",
    specialization: "Luxury Properties",
    yearsExperience: 1,
    propertiesSold: 4,
    phone: "+52 612 169 8328",
    email: "Edgar@bircabo.com",
    slug: "edgar",
    languages: ["English", "Spanish"],
    certifications: ["REALTOR®", "MLS Member"],
    bio: "Your insider advantage with analytical precision."
  },
  {
    name: "Fernando Cabrera",
    title: "Real Estate Advisor",
    specialization: "Residential Properties & Vacation Homes",
    yearsExperience: 5,
    propertiesSold: 40,
    phone: "+52 624 135 8900",
    email: "fernando@bircabo.com",
    slug: "fernando-cabrera",
    languages: ["English", "Spanish"],
    certifications: ["MLS Member", "NAR Member"],
    bio: "Former tennis player, passionate about making clients feel confident."
  },
  {
    name: "Bonnie Renee G.",
    title: "Senior Real Estate Advisor",
    specialization: "Residential, Commercial & Investment Properties",
    yearsExperience: 15,
    propertiesSold: 200,
    phone: "+1 858-204-3115",
    email: "bonnie@bircabo.com",
    slug: "bonnie-renee",
    languages: ["English", "Spanish"],
    certifications: ["Senior Real Estate Advisor", "AMPI® Member", "Bilingual Specialist", "MLS Member"],
    bio: "Living in Mexico 35+ years with 25 years hands-on experience."
  },
  {
    name: "Charles Jones",
    title: "Luxury Property Specialist",
    specialization: "Pedregal & Luxury Vacation Rentals",
    yearsExperience: 30,
    propertiesSold: 250,
    phone: "+1 858 964 4629",
    email: "cabocharlie79@gmail.com",
    slug: "charles-jones",
    languages: ["English", "Spanish"],
    certifications: ["REALTOR®", "MLS Member", "Property Management Specialist"],
    bio: "Over 30 years of experience in Pedregal, Cabo San Lucas."
  }
];

// Helper Functions
export function getAgentByName(name: string): AgentInfo | null {
  const normalized = name.toLowerCase().trim();
  return TEAM_INFO.find(agent =>
    agent.name.toLowerCase().includes(normalized) ||
    agent.slug.includes(normalized)
  ) || null;
}

export function getAgentsByLanguage(language: string): AgentInfo[] {
  const normalized = language.toLowerCase();
  return TEAM_INFO.filter(agent =>
    agent.languages.some(lang => lang.toLowerCase() === normalized)
  );
}

export function getAgentsBySpecialization(specialization: string): AgentInfo[] {
  const normalized = specialization.toLowerCase();
  return TEAM_INFO.filter(agent =>
    agent.specialization.toLowerCase().includes(normalized)
  );
}

export function formatOfficeHours(): string {
  return COMPANY_INFO.officeHours.formatted;
}

export function formatAddress(): string {
  const addr = COMPANY_INFO.address;
  return `${addr.street}, ${addr.unit}, ${addr.city}, ${addr.state}, ${addr.country}, ${addr.postalCode}`;
}

// Why Work With Us - Natural talking points (not promotional titles)
export const WHY_WORK_WITH_US = {
  family: "We're a family-run business, which means every client gets personalized attention. You're not just another transaction to us – we treat your property search with the same care we'd give our own family.",
  experience: "Our team has decades of combined experience in Los Cabos real estate. Many of our agents have successful careers in the US and Canada before specializing here, so we understand what international buyers need.",
  innovation: "We use modern technology and AI tools to make your search easier. Our marketing team knows how to showcase properties professionally, and our systems ensure you get timely updates throughout the process.",
  results: "We've helped over 2,200 families find properties in Los Cabos, with more than $800M in sales since the late 1980s. Our track record speaks for itself."
};
