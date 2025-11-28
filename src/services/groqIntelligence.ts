// groqIntelligence.ts - Smart MLS Field Mapping + SUPERPOWERS 🦸‍♂️⚡
import Groq from 'groq-sdk';
import { MLS_REFERENCE, USER_TO_MLS_MAPPINGS, findInMLS } from './mlsReference';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

export interface FieldMapping {
  userValue: string;
  mlsField: 'zone' | 'area' | 'community' | 'subdivision';
  mlsValue: string;
  confidence: number;
  source: 'hardcoded' | 'mls-exact' | 'groq-ai' | 'cached';
}

// 🆕 SUPERPOWER 1: MLS Field Discovery
export interface MLSFieldDiscovery {
  viewField: string | null;
  sellerFinancingField: string | null;
  currentPriceField: string | null;
  originalPriceField: string | null;
  allFields: string[];
  lastDiscovered: number;
}

const MAPPING_CACHE_KEY = 'mls_field_mappings';
const FIELD_DISCOVERY_CACHE_KEY = 'mls_field_discovery';
const FIELD_DISCOVERY_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

// Get cached mappings
function getCachedMappings(): Record<string, FieldMapping> {
  try {
    const cached = localStorage.getItem(MAPPING_CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch {
    return {};
  }
}

// Save mapping to cache
function cacheMapping(userValue: string, mapping: FieldMapping): void {
  try {
    const cache = getCachedMappings();
    cache[userValue.toLowerCase()] = mapping;
    localStorage.setItem(MAPPING_CACHE_KEY, JSON.stringify(cache));
    console.log(`💾 Cached mapping: ${userValue} → ${mapping.mlsField}:${mapping.mlsValue}`);
  } catch (error) {
    console.error('Failed to cache mapping:', error);
  }
}

// 🆕 SUPERPOWER 1: Discover MLS Field Names
export async function discoverMLSFields(): Promise<MLSFieldDiscovery> {
  console.log('🔍 Discovering MLS field names...');
  
  // Check cache first
  try {
    const cached = localStorage.getItem(FIELD_DISCOVERY_CACHE_KEY);
    if (cached) {
      const discovery: MLSFieldDiscovery = JSON.parse(cached);
      const age = Date.now() - discovery.lastDiscovered;
      
      if (age < FIELD_DISCOVERY_TTL) {
        console.log(`⚡ Using cached field discovery (${Math.floor(age / (24 * 60 * 60 * 1000))} days old)`);
        return discovery;
      }
    }
  } catch (error) {
    console.warn('Failed to load cached discovery:', error);
  }

  try {
    // Fetch a sample property to see ALL available fields
    const response = await fetch('/api/flexmls-listings?limit=1');
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      console.warn('⚠️ No sample properties available for field discovery');
      return {
        viewField: null,
        sellerFinancingField: null,
        currentPriceField: null,
        originalPriceField: null,
        allFields: [],
        lastDiscovered: Date.now()
      };
    }
    
    const sampleProperty = data.results[0];
    const allFields = Object.keys(sampleProperty).sort();
    
    console.log(`📋 Discovered ${allFields.length} MLS fields`);
    
    // Filter relevant fields for Groq analysis
    const viewRelated = allFields.filter(f => 
      /view|ocean|water|front|beach|coast/i.test(f)
    );
    const financingRelated = allFields.filter(f => 
      /financ|seller|owner|carry/i.test(f)
    );
    const priceRelated = allFields.filter(f => 
      /price|list/i.test(f)
    );
    
    console.log('🔍 Analyzing fields with Groq AI...');
    console.log('  View-related:', viewRelated.join(', '));
    console.log('  Financing-related:', financingRelated.join(', '));
    console.log('  Price-related:', priceRelated.join(', '));
    
    // Use Groq to analyze and pick the best fields
    const prompt = `You are analyzing MLS (Multiple Listing Service) property data fields for Cabo San Lucas, Mexico.

Here are the ACTUAL fields available in the MLS system:

ALL FIELDS (${allFields.length} total):
${allFields.join(', ')}

SAMPLE DATA from one property:
${JSON.stringify(sampleProperty, null, 2).substring(0, 2000)}...

Based on this real MLS data, identify the EXACT field names for these filters:

1. **Ocean/Water View**: Which field indicates ocean/water/beach views?
   Candidates: ${viewRelated.join(', ') || 'none found'}

2. **Seller Financing**: Which field indicates if seller financing is offered?
   Candidates: ${financingRelated.join(', ') || 'none found'}

3. **Price Comparison**: Which fields show current vs original price?
   Candidates: ${priceRelated.join(', ') || 'none found'}

CRITICAL: Use ONLY field names that actually exist in the field list above.
If no suitable field exists, return null for that field.

Respond with ONLY valid JSON (no markdown):
{
  "viewField": "exact_field_name_or_null",
  "sellerFinancingField": "exact_field_name_or_null",
  "currentPriceField": "exact_field_name_or_null",
  "originalPriceField": "exact_field_name_or_null",
  "confidence": {
    "view": 0-100,
    "financing": 0-100,
    "price": 0-100
  }
}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      max_tokens: 500,
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(cleaned);
    
    console.log('✅ Groq field discovery:', result);
    
    const discovery: MLSFieldDiscovery = {
      viewField: result.viewField,
      sellerFinancingField: result.sellerFinancingField,
      currentPriceField: result.currentPriceField,
      originalPriceField: result.originalPriceField,
      allFields,
      lastDiscovered: Date.now()
    };
    
    // Cache the discovery
    try {
      localStorage.setItem(FIELD_DISCOVERY_CACHE_KEY, JSON.stringify(discovery));
      console.log('💾 Cached field discovery');
    } catch (error) {
      console.warn('Failed to cache discovery:', error);
    }
    
    return discovery;
    
  } catch (error) {
    console.error('❌ Field discovery failed:', error);
    
    // Return fallback with common field names
    return {
      viewField: 'View',
      sellerFinancingField: 'SellerFinancingYN',
      currentPriceField: 'ListPrice',
      originalPriceField: 'OriginalListPrice',
      allFields: [],
      lastDiscovered: Date.now()
    };
  }
}

// 🆕 SUPERPOWER 2: Validate Special Filters
export async function getValidatedSpecialFilters(filters: {
  sellerFinancing?: boolean;
  primaryView?: boolean;
  currentPrice?: boolean;
}): Promise<{
  sellerFinancing?: { field: string; value: boolean };
  primaryView?: { field: string; value: string };
  currentPrice?: { field: string; comparison: string };
}> {
  const discovery = await discoverMLSFields();
  const validated: any = {};
  
  if (filters.sellerFinancing && discovery.sellerFinancingField) {
    validated.sellerFinancing = {
      field: discovery.sellerFinancingField,
      value: true
    };
    console.log(`✅ Seller financing filter: ${discovery.sellerFinancingField} eq true`);
  }
  
  if (filters.primaryView && discovery.viewField) {
    validated.primaryView = {
      field: discovery.viewField,
      value: 'Ocean' // Can be customized
    };
    console.log(`✅ Primary view filter: contains(${discovery.viewField}, 'Ocean')`);
  }
  
  if (filters.currentPrice && discovery.currentPriceField && discovery.originalPriceField) {
    validated.currentPrice = {
      field: discovery.currentPriceField,
      comparison: discovery.originalPriceField
    };
    console.log(`✅ Current price filter: ${discovery.currentPriceField} eq ${discovery.originalPriceField}`);
  }
  
  return validated;
}

// STEP 1: Check hardcoded mappings
function checkHardcodedMapping(userValue: string): FieldMapping | null {
  const key = userValue.toLowerCase().trim();
  const hardcoded = USER_TO_MLS_MAPPINGS[key];
  
  if (hardcoded) {
    console.log(`✅ Hardcoded mapping found for "${userValue}"`);
    return {
      userValue,
      mlsField: hardcoded.mlsField as any,
      mlsValue: hardcoded.mlsValue,
      confidence: hardcoded.confidence,
      source: 'hardcoded'
    };
  }
  
  return null;
}

// STEP 2: Check MLS reference for exact match
function checkMLSReference(userValue: string): FieldMapping | null {
  const result = findInMLS(userValue);
  
  if (result.found && result.field && result.exactMatch) {
    console.log(`✅ Exact MLS match found for "${userValue}"`);
    return {
      userValue,
      mlsField: result.field,
      mlsValue: result.exactMatch,
      confidence: 100,
      source: 'mls-exact'
    };
  }
  
  return null;
}

// STEP 3: Ask Groq AI for intelligent mapping
async function askGroqForMapping(
  userValue: string,
  userField: 'zone' | 'area' | 'community' | 'subdivision'
): Promise<FieldMapping> {
  console.log(`🤖 Asking Groq AI to map "${userValue}" (user selected as ${userField})`);

  const prompt = `You are a Cabo San Lucas real estate MLS expert. A user selected "${userValue}" as a ${userField.toUpperCase()}.

Your task: Determine the CORRECT MLS field and value for this location.

ACTUAL MLS REFERENCE DATA:

ZONES (City field):
${MLS_REFERENCE.zones.join(', ')}

AREAS:
${MLS_REFERENCE.areas.slice(0, 20).join(', ')} ... [${MLS_REFERENCE.areas.length} total]

COMMUNITIES:
${MLS_REFERENCE.communities.slice(0, 30).join(', ')} ... [${MLS_REFERENCE.communities.length} total]

SUBDIVISIONS:
Pedregal, Cabo Bello, Copala, Querencia, Quivira, Diamante, Palmilla, Chileno Bay, Costa Palmas ... [500+ total]

IMPORTANT MAPPINGS TO KNOW:
- "Todos Santos" → COMMUNITY (not zone)
- "Pedregal" → COMMUNITY "Pedregal CSL" or SUBDIVISION "Pedregal"
- "Diamante" → COMMUNITY "Diamante Cabo San Lucas"
- "Quivira" → COMMUNITY "Quivira"
- "Downtown" → AREA "CSL-Centro" or "SJD-Centro"
- "Beach & Marina" → AREA "CSL-Beach & Marina"

Analyze "${userValue}" and determine:
1. Which MLS field it belongs to (zone/area/community/subdivision)
2. The EXACT value to use from the MLS reference above
3. Your confidence level (0-100)

Respond with ONLY valid JSON (no markdown):
{
  "mlsField": "zone|area|community|subdivision",
  "mlsValue": "exact value from MLS reference",
  "confidence": 0-100,
  "reasoning": "brief explanation"
}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      max_tokens: 300,
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(cleaned);

    console.log(`✅ Groq mapping:`, result);

    return {
      userValue,
      mlsField: result.mlsField,
      mlsValue: result.mlsValue,
      confidence: result.confidence || 50,
      source: 'groq-ai'
    };
  } catch (error) {
    console.error('❌ Groq mapping failed:', error);
    // Fallback: use the user's original selection
    return {
      userValue,
      mlsField: userField,
      mlsValue: userValue,
      confidence: 30,
      source: 'groq-ai'
    };
  }
}

// MAIN FUNCTION: Get smart mapping for a filter value
export async function getSmartMapping(
  userValue: string,
  userField: 'zone' | 'area' | 'community' | 'subdivision'
): Promise<FieldMapping> {
  console.log(`\n🧠 Getting smart mapping for: "${userValue}" (selected as ${userField})`);

  // Check cache first
  const cache = getCachedMappings();
  const cached = cache[userValue.toLowerCase()];
  if (cached) {
    console.log(`⚡ Using cached mapping`);
    return { ...cached, source: 'cached' };
  }

  // STEP 1: Hardcoded mappings
  const hardcoded = checkHardcodedMapping(userValue);
  if (hardcoded) {
    cacheMapping(userValue, hardcoded);
    return hardcoded;
  }

  // STEP 2: MLS exact match
  const mlsMatch = checkMLSReference(userValue);
  if (mlsMatch) {
    cacheMapping(userValue, mlsMatch);
    return mlsMatch;
  }

  // STEP 3: Groq AI
  const groqMapping = await askGroqForMapping(userValue, userField);
  cacheMapping(userValue, groqMapping);
  return groqMapping;
}

// Get mappings for multiple values
export async function getSmartMappings(
  filters: {
    zones?: string[];
    areas?: string[];
    communities?: string[];
    subdivisions?: string[];
  }
): Promise<{
  zones: FieldMapping[];
  areas: FieldMapping[];
  communities: FieldMapping[];
  subdivisions: FieldMapping[];
}> {
  const results = {
    zones: [] as FieldMapping[],
    areas: [] as FieldMapping[],
    communities: [] as FieldMapping[],
    subdivisions: [] as FieldMapping[]
  };

  // Process zones
  if (filters.zones) {
    for (const zone of filters.zones) {
      const mapping = await getSmartMapping(zone, 'zone');
      results.zones.push(mapping);
    }
  }

  // Process areas
  if (filters.areas) {
    for (const area of filters.areas) {
      const mapping = await getSmartMapping(area, 'area');
      results.areas.push(mapping);
    }
  }

  // Process communities
  if (filters.communities) {
    for (const community of filters.communities) {
      const mapping = await getSmartMapping(community, 'community');
      results.communities.push(mapping);
    }
  }

  // Process subdivisions
  if (filters.subdivisions) {
    for (const subdivision of filters.subdivisions) {
      const mapping = await getSmartMapping(subdivision, 'subdivision');
      results.subdivisions.push(mapping);
    }
  }

  return results;
}

// Build API filters from smart mappings
export function buildAPIFilters(mappings: {
  zones: FieldMapping[];
  areas: FieldMapping[];
  communities: FieldMapping[];
  subdivisions: FieldMapping[];
}): {
  city?: string;
  area?: string;
  community?: string;
  subdivision?: string;
} {
  const apiFilters: any = {};

  // Group all mappings by their MLS field (normalized)
  const byField: Record<string, string[]> = {
    zone: [],
    area: [],
    subdivision: [] // <-- community + subdivision go here
  };

  // Add zones
  mappings.zones.forEach(m => {
    byField[m.mlsField].push(m.mlsValue);
  });

  // Add areas
  mappings.areas.forEach(m => {
    byField[m.mlsField].push(m.mlsValue);
  });

  // Add communities (map them into subdivision)
  mappings.communities.forEach(m => {
    byField.subdivision.push(m.mlsValue);
  });

  // Add subdivisions
  mappings.subdivisions.forEach(m => {
    byField.subdivision.push(m.mlsValue);
  });

  // Build API parameters
  if (byField.zone.length > 0) {
    apiFilters.city = byField.zone.join(',');
  }

  if (byField.area.length > 0) {
    apiFilters.area = byField.area.join(',');
  }

  if (byField.subdivision.length > 0) {
    apiFilters.subdivision = byField.subdivision.join(',');
  }

  console.log(`\n📋 Built API filters:`, apiFilters);

  return apiFilters;
}

// Clear cache
export function clearMappingCache(): void {
  localStorage.removeItem(MAPPING_CACHE_KEY);
  console.log('🗑️ Cleared mapping cache');
}

// Clear field discovery cache
export function clearFieldDiscoveryCache(): void {
  localStorage.removeItem(FIELD_DISCOVERY_CACHE_KEY);
  console.log('🗑️ Cleared field discovery cache');
}

// Export for debugging
export function viewCache(): void {
  console.log('Current mapping cache:', getCachedMappings());
}

export function viewFieldDiscovery(): void {
  const cached = localStorage.getItem(FIELD_DISCOVERY_CACHE_KEY);
  if (cached) {
    console.log('Current field discovery:', JSON.parse(cached));
  } else {
    console.log('No field discovery cached');
  }
}