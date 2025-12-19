// realEstateKnowledge.ts - Comprehensive Los Cabos Real Estate Knowledge Base

export interface AreaKnowledge {
  name: string;
  type: 'city' | 'area' | 'community';
  description: string;
  pricePerSqFt: { min: number; max: number };
  lifestyle: string[];
  pros: string[];
  cons: string[];
  bestFor: string[];
  amenities: string[];
  walkability: 'high' | 'medium' | 'low';
  beachAccess: 'direct' | 'club' | 'nearby' | 'none';
  swimmableBeach: boolean;
  rentalDemand: 'very-high' | 'high' | 'medium' | 'low';
  appreciation: 'fast' | 'steady' | 'slow';
  avgHOA?: { min: number; max: number };
}

export const AREA_KNOWLEDGE: Record<string, AreaKnowledge> = {
  pedregal: {
    name: 'Pedregal',
    type: 'area',
    description: 'Luxury hillside community with dramatic ocean views and private beach club access',
    pricePerSqFt: { min: 500, max: 1200 },
    lifestyle: ['luxury', 'views', 'security', 'exclusive'],
    pros: ['Stunning panoramic views', 'Gated 24/7 security', 'Private beach club', 'Close to downtown Cabo', 'Prestigious address'],
    cons: ['Steep winding roads', 'Hills challenging for elderly/disabled', 'Higher HOA fees', 'Limited walkability'],
    bestFor: ['Luxury buyers', 'View seekers', 'Security-conscious', 'Vacation homes', 'High-end rentals'],
    amenities: ['Private beach club', 'Security gates', 'Tennis courts', 'Fitness centers'],
    walkability: 'low',
    beachAccess: 'club',
    swimmableBeach: true,
    rentalDemand: 'high',
    appreciation: 'steady',
    avgHOA: { min: 300, max: 800 }
  },

  marina: {
    name: 'Marina District (Cabo San Lucas)',
    type: 'area',
    description: 'Vibrant waterfront district with restaurants, nightlife, and world-class fishing',
    pricePerSqFt: { min: 450, max: 900 },
    lifestyle: ['active', 'social', 'waterfront', 'walkable'],
    pros: ['Walking distance to everything', 'Flat terrain', 'Marina views', 'Restaurants/bars nearby', 'Strong rental demand'],
    cons: ['Tourist crowds', 'Noise from nightlife', 'Higher traffic', 'Less privacy'],
    bestFor: ['Active lifestyle', 'Boaters/fishermen', 'Rental investors', 'Singles/couples', 'No car needed'],
    amenities: ['Marina access', 'Restaurants', 'Shopping', 'Nightlife', 'Fishing charters'],
    walkability: 'high',
    beachAccess: 'nearby',
    swimmableBeach: false,
    rentalDemand: 'very-high',
    appreciation: 'steady',
    avgHOA: { min: 250, max: 600 }
  },

  cabo_corridor: {
    name: 'Cabo Corridor',
    type: 'city',
    description: 'Premier 20-mile stretch between the two Cabos with luxury resorts and pristine beaches',
    pricePerSqFt: { min: 600, max: 2000 },
    lifestyle: ['luxury', 'beachfront', 'golf', 'resort'],
    pros: ['Best beaches in Los Cabos', 'World-class golf courses', 'Luxury resort amenities', 'Swimming beaches', 'High appreciation'],
    cons: ['Car necessary', 'Pricier than other areas', 'Tourist-heavy', 'Limited local services'],
    bestFor: ['Beachfront buyers', 'Golfers', 'Luxury market', 'Resort living', 'Investment properties'],
    amenities: ['Golf courses', 'Beach clubs', 'Spas', 'Fine dining', 'Water sports'],
    walkability: 'low',
    beachAccess: 'direct',
    swimmableBeach: true,
    rentalDemand: 'very-high',
    appreciation: 'fast',
    avgHOA: { min: 400, max: 1200 }
  },

  san_jose_del_cabo: {
    name: 'San Jose del Cabo',
    type: 'city',
    description: 'Charming colonial town with art galleries, quieter vibe, and family-friendly atmosphere',
    pricePerSqFt: { min: 300, max: 700 },
    lifestyle: ['tranquil', 'cultural', 'family', 'authentic'],
    pros: ['Historic downtown', 'Art district', 'Family-friendly', 'Local Mexican culture', 'Lower cost of living', 'Good schools'],
    cons: ['Farther from Cabo nightlife', 'Fewer beach clubs', 'Less tourist infrastructure'],
    bestFor: ['Families', 'Retirees', 'Artists', 'Budget-conscious', 'Authentic Mexico experience', 'Full-time residents'],
    amenities: ['Art galleries', 'Organic market', 'Golf courses', 'Schools', 'Healthcare'],
    walkability: 'medium',
    beachAccess: 'nearby',
    swimmableBeach: false,
    rentalDemand: 'medium',
    appreciation: 'steady',
    avgHOA: { min: 200, max: 500 }
  },

  querencia: {
    name: 'Querencia',
    type: 'community',
    description: 'Ultra-exclusive private golf community with Tom Fazio designed course',
    pricePerSqFt: { min: 800, max: 2500 },
    lifestyle: ['ultra-luxury', 'golf', 'privacy', 'exclusive'],
    pros: ['World-class Tom Fazio golf', 'Ultimate privacy', 'Ocean views', 'Top-tier security', 'Prestigious'],
    cons: ['Very expensive', 'Isolated location', 'High HOA fees', 'Limited resale market', 'Car absolutely necessary'],
    bestFor: ['Golf enthusiasts', 'Ultra-high-net-worth', 'Privacy seekers', 'Second/third homes'],
    amenities: ['Private golf course', 'Beach club', 'Clubhouse', 'Tennis', 'Equestrian center'],
    walkability: 'low',
    beachAccess: 'club',
    swimmableBeach: true,
    rentalDemand: 'low',
    appreciation: 'slow',
    avgHOA: { min: 800, max: 2000 }
  },

  palmilla: {
    name: 'Palmilla',
    type: 'community',
    description: 'Luxury community featuring Jack Nicklaus golf and Four Seasons resort',
    pricePerSqFt: { min: 700, max: 1800 },
    lifestyle: ['luxury', 'golf', 'resort', 'established'],
    pros: ['Jack Nicklaus golf', 'Four Seasons hotel', 'Established community', 'Beach club', 'Strong resale value'],
    cons: ['Expensive', 'High HOA', 'Car needed'],
    bestFor: ['Golfers', 'Luxury buyers', 'Resort amenities', 'Investment'],
    amenities: ['27-hole golf', 'Beach club', 'Four Seasons access', 'Tennis', 'Spa'],
    walkability: 'low',
    beachAccess: 'club',
    swimmableBeach: true,
    rentalDemand: 'high',
    appreciation: 'steady',
    avgHOA: { min: 600, max: 1500 }
  },

  east_cape: {
    name: 'East Cape',
    type: 'city',
    description: 'Remote, authentic Baja experience with world-class fishing and pristine beaches',
    pricePerSqFt: { min: 200, max: 500 },
    lifestyle: ['remote', 'fishing', 'off-grid', 'authentic'],
    pros: ['Affordable', 'Authentic Mexico', 'World-class fishing', 'Uncrowded beaches', 'Tranquil', 'Large lots'],
    cons: ['Very remote (1-2 hrs to Cabo)', 'Limited services', 'Rough roads', 'Spotty utilities', 'Lower resale demand'],
    bestFor: ['Fishermen', 'Adventure seekers', 'Off-grid lifestyle', 'Budget buyers', 'Large land parcels'],
    amenities: ['Fishing', 'Diving', 'Surfing', 'Eco-tourism'],
    walkability: 'low',
    beachAccess: 'direct',
    swimmableBeach: true,
    rentalDemand: 'low',
    appreciation: 'slow',
    avgHOA: { min: 0, max: 200 }
  },

  todos_santos: {
    name: 'Todos Santos',
    type: 'city',
    description: 'Artistic, bohemian surf town on the Pacific with laid-back vibe',
    pricePerSqFt: { min: 250, max: 600 },
    lifestyle: ['artistic', 'bohemian', 'surfing', 'organic'],
    pros: ['Art galleries', 'Cooler temps', 'Surf culture', 'Organic farming', 'Authentic vibe', 'Lower cost'],
    cons: ['1 hour from Cabo airport', 'Rougher Pacific waves', 'Limited medical facilities', 'Fewer tourists'],
    bestFor: ['Artists', 'Surfers', 'Remote workers', 'Budget-conscious', 'Alternative lifestyle'],
    amenities: ['Art galleries', 'Organic market', 'Surfing', 'Yoga studios', 'Farm-to-table dining'],
    walkability: 'medium',
    beachAccess: 'nearby',
    swimmableBeach: false,
    rentalDemand: 'medium',
    appreciation: 'steady',
    avgHOA: { min: 0, max: 300 }
  },

  el_tezal: {
    name: 'El Tezal',
    type: 'area',
    description: 'Family-friendly, affordable neighborhood near Cabo with local Mexican character',
    pricePerSqFt: { min: 250, max: 450 },
    lifestyle: ['family', 'affordable', 'local', 'practical'],
    pros: ['Affordable', 'Family-friendly', 'Local schools', 'Supermarkets nearby', 'Growing area', 'Flat terrain'],
    cons: ['No ocean views', 'Basic amenities', 'Less upscale', 'Limited beach access'],
    bestFor: ['Families', 'Budget buyers', 'Full-time residents', 'First-time buyers', 'Local workers'],
    amenities: ['Schools', 'Supermarkets', 'Local restaurants', 'Parks'],
    walkability: 'medium',
    beachAccess: 'none',
    swimmableBeach: false,
    rentalDemand: 'low',
    appreciation: 'steady',
    avgHOA: { min: 100, max: 300 }
  }
};

export interface BuyingProcessStep {
  step: number;
  title: string;
  description: string;
  duration: string;
  cost?: string;
  tips: string[];
}

export const BUYING_PROCESS: BuyingProcessStep[] = [
  {
    step: 1,
    title: 'Property Search & Selection',
    description: 'Work with our agents to find properties matching your criteria',
    duration: '1-4 weeks (varies)',
    tips: [
      'Get pre-qualified for financing if needed',
      'Visit in person if possible',
      'Consider rental potential if investing',
      'Think about resale value'
    ]
  },
  {
    step: 2,
    title: 'Make an Offer',
    description: 'Submit written offer through your agent',
    duration: '1-3 days',
    tips: [
      'Typical starting point: 10-15% below asking in soft markets',
      'Include contingencies (inspection, financing)',
      'Earnest money deposit typically 5-10%',
      'Everything is negotiable - price, furniture, closing date'
    ]
  },
  {
    step: 3,
    title: 'Fideicomiso Setup (Bank Trust)',
    description: 'Required for foreigners buying within 50km of coast',
    duration: '2-4 weeks',
    cost: '$1,000 setup + $500/year',
    tips: [
      'You maintain 100% beneficial ownership',
      'Bank only holds legal title as trustee',
      'Can sell, rent, inherit, modify freely',
      'Protected by Mexican constitution',
      '50-year term, renewable indefinitely'
    ]
  },
  {
    step: 4,
    title: 'Due Diligence',
    description: 'Title search, survey, appraisal, inspection',
    duration: '2-3 weeks',
    cost: 'Varies, ~$500-2000',
    tips: [
      'Hire bilingual attorney ($1500-3000)',
      'Get professional home inspection',
      'Verify clear title and no liens',
      'Check HOA status and fees',
      'Confirm utilities and water rights'
    ]
  },
  {
    step: 5,
    title: 'Closing',
    description: 'Notario handles closing, funds transfer, registration',
    duration: '1-2 weeks after approval',
    cost: '4-6% of purchase price',
    tips: [
      'Notario is government-appointed attorney',
      'Bring passport and proof of funds',
      'Wire funds 2-3 days before closing',
      'Get copies of all documents',
      'Closing costs include acquisition tax, notary fees, registration'
    ]
  }
];

export interface CostBreakdown {
  category: string;
  items: { name: string; amount: string; frequency?: string; notes?: string }[];
}

export const OWNERSHIP_COSTS: CostBreakdown[] = [
  {
    category: 'One-Time Closing Costs',
    items: [
      { name: 'Acquisition Tax', amount: '2% of assessed value', notes: 'Paid at closing' },
      { name: 'Notary Fees', amount: '1-2% of purchase price', notes: 'Handles legal transfer' },
      { name: 'Fideicomiso Setup', amount: '$1,000', notes: 'Bank trust for foreigners' },
      { name: 'Title Insurance (optional)', amount: '0.5-1% of price', notes: 'Recommended for protection' },
      { name: 'Attorney Fees', amount: '$1,500-3,000', notes: 'Bilingual attorney recommended' }
    ]
  },
  {
    category: 'Annual Costs',
    items: [
      { name: 'Property Tax (Predial)', amount: '0.1-0.3% of assessed value', frequency: 'Annually', notes: 'Very low compared to US/Canada!' },
      { name: 'Fideicomiso Renewal', amount: '$500', frequency: 'Annually', notes: 'Bank trust maintenance' },
      { name: 'HOA Fees', amount: '$200-1,200/month', frequency: 'Monthly', notes: 'Varies by community amenities' }
    ]
  },
  {
    category: 'Monthly Utilities',
    items: [
      { name: 'Electricity (CFE)', amount: '$50-200', frequency: 'Monthly', notes: 'Higher if AC used heavily' },
      { name: 'Water', amount: '$20-50', frequency: 'Monthly', notes: 'Some areas have wells' },
      { name: 'Internet', amount: '$30-80', frequency: 'Monthly', notes: 'Fiber available in some areas, Starlink everywhere' },
      { name: 'Gas (Propane)', amount: '$30-60', frequency: 'Monthly', notes: 'For hot water/cooking' }
    ]
  }
];

export interface MarketInsight {
  topic: string;
  insight: string;
  source?: string;
}

export const MARKET_INSIGHTS: MarketInsight[] = [
  { topic: 'Appreciation', insight: 'Los Cabos real estate historically appreciates 3-5% annually', source: 'Historical data' },
  { topic: 'Rental Yields', insight: 'Gross rental yields range from 5-8% for well-managed vacation rentals', source: 'Market averages' },
  { topic: 'Best ROI', insight: 'Beachfront properties and walking distance to marina/downtown generate highest rental income', source: 'Agent experience' },
  { topic: 'Seasonality', insight: 'Peak rental season Nov-April, rates 2-3x higher than summer', source: 'Market data' },
  { topic: 'Days on Market', insight: 'Average 60-120 days, beachfront sells faster', source: 'MLS data' },
  { topic: 'Price per Sq Ft', insight: 'Beachfront: $800-3000, Ocean view: $400-800, No view: $250-500', source: 'Current listings' },
  { topic: 'Currency', insight: 'USD accepted widely, but pay in pesos for better rates', source: 'Local practice' },
  { topic: 'Tourism Growth', insight: 'Los Cabos is fastest-growing resort destination in Mexico', source: 'Tourism board' }
];

export interface FAQ {
  question: string;
  answer: string;
  category: 'legal' | 'financial' | 'lifestyle' | 'process';
}

export const COMMON_FAQS: FAQ[] = [
  {
    question: 'Can foreigners buy property in Mexico?',
    answer: 'YES! 100% legal and protected by Mexican constitution. Within 50km of coast you use a fideicomiso (bank trust) where you maintain ALL ownership rights. You can sell, rent, inherit, modify - the bank just holds title for legal purposes. Outside restricted zones, foreigners can own directly.',
    category: 'legal'
  },
  {
    question: 'Is fideicomiso safe?',
    answer: 'Absolutely! Protected by Mexican constitution since 1973. Millions of foreigners own property this way. You have 100% beneficial ownership - the bank is just a trustee with zero control over your property decisions. If bank fails, your rights transfer to another bank.',
    category: 'legal'
  },
  {
    question: 'What are total closing costs?',
    answer: 'Expect 4-6% of purchase price total. This includes acquisition tax (2%), notary fees (1-2%), fideicomiso setup ($1000), and registration fees. Budget an additional $1500-3000 for attorney fees.',
    category: 'financial'
  },
  {
    question: 'Can I get Mexican financing?',
    answer: 'Mexican banks rarely finance foreigners. Most buyers pay cash or get financing in their home country (home equity, securities-backed loans, etc.). Some developers offer financing on new construction.',
    category: 'financial'
  },
  {
    question: 'Do I need a car in Los Cabos?',
    answer: 'Depends on location. Marina/downtown Cabo - walkable, car optional. Corridor/Pedregal/other areas - car highly recommended. Uber and taxis available but add up. Many expats lease or buy locally.',
    category: 'lifestyle'
  },
  {
    question: 'Is it safe to live in Los Cabos?',
    answer: 'Los Cabos is one of the safest areas in Mexico, heavily dependent on tourism. Use normal precautions. Gated communities offer extra security. Millions of tourists visit annually without issues.',
    category: 'lifestyle'
  },
  {
    question: 'What about healthcare?',
    answer: 'Excellent private hospitals (BlueNet, Amerimed). Many US/Canadian-trained doctors. Medical tourism destination. Costs 50-70% less than US. Expats often buy supplemental insurance.',
    category: 'lifestyle'
  },
  {
    question: 'Can I rent out my property?',
    answer: 'Yes! Very common. Rental income is taxable in Mexico (consult accountant). Many owners use property managers (typically 20-30% of rental income). Strong vacation rental market.',
    category: 'financial'
  },
  {
    question: 'What about hurricanes?',
    answer: 'Hurricane season June-November, but direct hits are rare (Cabo averages one every 15-20 years). Most homes built to hurricane codes. Hurricane insurance recommended.',
    category: 'lifestyle'
  },
  {
    question: 'How long does buying process take?',
    answer: 'Typically 60-90 days from offer to closing. Can be faster for cash deals, slower if financing involved. Fideicomiso setup (2-4 weeks) is usually the longest step.',
    category: 'process'
  }
];

// Helper function to find area knowledge
export function getAreaKnowledge(query: string): AreaKnowledge | null {
  const normalized = query.toLowerCase().trim();

  // Direct matches
  for (const [key, area] of Object.entries(AREA_KNOWLEDGE)) {
    if (normalized.includes(area.name.toLowerCase())) {
      return area;
    }
  }

  // City-level matches first (more specific, longer phrases)
  // When someone says the full city name, return a representative area
  if (normalized.includes('cabo san lucas') && !normalized.includes('san jose')) {
    return AREA_KNOWLEDGE.marina; // Marina represents downtown Cabo San Lucas
  }
  if (normalized.includes('san jose del cabo') || (normalized.includes('san jose') && !normalized.includes('pedregal'))) {
    return AREA_KNOWLEDGE.san_jose_del_cabo; // San Jose del Cabo city
  }

  // Specific area/community keyword matches
  if (normalized.includes('marina')) return AREA_KNOWLEDGE.marina;
  if (normalized.includes('pedregal')) return AREA_KNOWLEDGE.pedregal;
  if (normalized.includes('corridor')) return AREA_KNOWLEDGE.cabo_corridor;
  if (normalized.includes('querencia')) return AREA_KNOWLEDGE.querencia;
  if (normalized.includes('palmilla')) return AREA_KNOWLEDGE.palmilla;
  if (normalized.includes('east cape')) return AREA_KNOWLEDGE.east_cape;
  if (normalized.includes('todos santos')) return AREA_KNOWLEDGE.todos_santos;
  if (normalized.includes('tezal')) return AREA_KNOWLEDGE.el_tezal;

  return null;
}

// Helper to compare two areas
export function compareAreas(area1Name: string, area2Name: string): string {
  const area1 = getAreaKnowledge(area1Name);
  const area2 = getAreaKnowledge(area2Name);

  if (!area1 || !area2) return '';

  const comparison: string[] = [];

  comparison.push(`**${area1.name} vs ${area2.name}:**\n`);

  // Price
  comparison.push(`💰 **Price:** ${area1.name} ($${area1.pricePerSqFt.min}-${area1.pricePerSqFt.max}/sqft) vs ${area2.name} ($${area2.pricePerSqFt.min}-${area2.pricePerSqFt.max}/sqft)`);

  // Lifestyle
  comparison.push(`🏠 **Vibe:** ${area1.name} (${area1.lifestyle.join(', ')}) vs ${area2.name} (${area2.lifestyle.join(', ')})`);

  // Walkability
  comparison.push(`🚶 **Walkability:** ${area1.name} (${area1.walkability}) vs ${area2.name} (${area2.walkability})`);

  // Beach
  comparison.push(`🏖️ **Beach:** ${area1.name} (${area1.beachAccess}${area1.swimmableBeach ? ', swimmable' : ', non-swimmable'}) vs ${area2.name} (${area2.beachAccess}${area2.swimmableBeach ? ', swimmable' : ', non-swimmable'})`);

  // Rental demand
  comparison.push(`📈 **Rental Potential:** ${area1.name} (${area1.rentalDemand}) vs ${area2.name} (${area2.rentalDemand})`);

  return comparison.join('\n');
}
