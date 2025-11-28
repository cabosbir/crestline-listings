// groqIntelligence.ts - Smart MLS Field Mapping with Real Data
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

const MAPPING_CACHE_KEY = 'mls_field_mappings';

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

  // Group all mappings by their MLS field
  const byField: Record<string, string[]> = {
    zone: [],
    area: [],
    community: [],
    subdivision: []
  };

  // Add zones
  mappings.zones.forEach(m => {
    byField[m.mlsField].push(m.mlsValue);
  });

  // Add areas
  mappings.areas.forEach(m => {
    byField[m.mlsField].push(m.mlsValue);
  });

  // Add communities
  mappings.communities.forEach(m => {
    byField[m.mlsField].push(m.mlsValue);
  });

  // Add subdivisions
  mappings.subdivisions.forEach(m => {
    byField[m.mlsField].push(m.mlsValue);
  });

  // Build API parameters
  if (byField.zone.length > 0) {
    apiFilters.city = byField.zone.join(',');
  }

  if (byField.area.length > 0) {
    apiFilters.area = byField.area.join(',');
  }

  if (byField.community.length > 0) {
    apiFilters.community = byField.community.join(',');
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

// Export for debugging
export function viewCache(): void {
  console.log('Current mapping cache:', getCachedMappings());
}
