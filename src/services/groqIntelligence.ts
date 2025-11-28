// groqIntelligence.ts - Smart MLS Field Mapping with Real Data (ENHANCED)
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
  source: 'hardcoded' | 'mls-exact' | 'mls-fuzzy' | 'groq-ai' | 'cached';
  originalField?: 'zone' | 'area' | 'community' | 'subdivision';
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

// STEP 2.5: Fuzzy match in MLS reference (NEW!)
function checkMLSFuzzyMatch(userValue: string, userField: 'zone' | 'area' | 'community' | 'subdivision'): FieldMapping | null {
  const search = userValue.toLowerCase().trim();
  
  // Remove common prefixes that cause issues
  const cleanedSearch = search
    .replace(/^las\s+/i, '')  // "Las Ventanas" → "Ventanas"
    .replace(/^los\s+/i, '')  // "Los Cabos" → "Cabos"
    .replace(/^el\s+/i, '')   // "El Tezal" → "Tezal"
    .replace(/^la\s+/i, '');  // "La Paz" → "Paz"
  
  // Try all fields, starting with the user's selected field
  const fieldsToCheck: Array<'zone' | 'area' | 'community' | 'subdivision'> = 
    userField === 'zone' ? ['zone', 'community', 'area', 'subdivision'] :
    userField === 'community' ? ['community', 'zone', 'area', 'subdivision'] :
    userField === 'area' ? ['area', 'community', 'zone', 'subdivision'] :
    ['subdivision', 'community', 'area', 'zone'];
  
  for (const field of fieldsToCheck) {
    const list = field === 'zone' ? MLS_REFERENCE.zones :
                 field === 'area' ? MLS_REFERENCE.areas :
                 field === 'community' ? MLS_REFERENCE.communities :
                 MLS_REFERENCE.subdivisions;
    
    // Try exact match first
    let match = list.find(item => item.toLowerCase() === search);
    if (match) {
      console.log(`✅ Fuzzy match (exact): "${userValue}" → ${field}:"${match}"`);
      return {
        userValue,
        mlsField: field,
        mlsValue: match,
        confidence: 95,
        source: 'mls-fuzzy',
        originalField: userField
      };
    }
    
    // Try cleaned match (without Las/Los/El/La)
    match = list.find(item => item.toLowerCase() === cleanedSearch);
    if (match) {
      console.log(`✅ Fuzzy match (cleaned): "${userValue}" → ${field}:"${match}"`);
      return {
        userValue,
        mlsField: field,
        mlsValue: match,
        confidence: 90,
        source: 'mls-fuzzy',
        originalField: userField
      };
    }
    
    // Try partial match with cleaned search
    match = list.find(item => 
      item.toLowerCase().includes(cleanedSearch) || 
      cleanedSearch.includes(item.toLowerCase())
    );
    if (match && cleanedSearch.length > 3) {  // Avoid false positives
      console.log(`✅ Fuzzy match (partial): "${userValue}" → ${field}:"${match}"`);
      return {
        userValue,
        mlsField: field,
        mlsValue: match,
        confidence: 85,
        source: 'mls-fuzzy',
        originalField: userField
      };
    }
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

SUBDIVISIONS (sample):
Pedregal, Cabo Bello, Copala, Querencia, Quivira, Diamante, Palmilla, Chileno Bay, Costa Palmas, Las Ventanas, Ventanas, Ventanas al Paraiso ... [500+ total]

CRITICAL MAPPINGS (ALWAYS CHECK THESE FIRST):
- "Todos Santos" → COMMUNITY (NEVER zone!)
- "Pedregal" → COMMUNITY "Pedregal CSL" (preferred) or SUBDIVISION "Pedregal"
- "Diamante" → COMMUNITY "Diamante Cabo San Lucas"
- "Quivira" → COMMUNITY "Quivira"
- "Downtown" → AREA "CSL-Centro" or "SJD-Centro"
- "Beach & Marina" → AREA "CSL-Beach & Marina"
- "Las Ventanas" → SUBDIVISION "Las Ventanas" (check if exists, otherwise try "Ventanas")
- "Ventanas" → Could be "Las Ventanas" or "Ventanas al Paraiso" subdivision

IMPORTANT RULES:
1. If user input matches a COMMUNITY name, use COMMUNITY (even if they selected zone)
2. Remove "Las"/"Los"/"El"/"La" prefixes if no exact match found
3. Try partial matches if exact match fails
4. Prioritize COMMUNITY and SUBDIVISION over ZONE for specific neighborhood names

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
      temperature: 0.1,  // Lower temperature for more consistent results
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
      source: 'groq-ai',
      originalField: userField
    };
  } catch (error) {
    console.error('❌ Groq mapping failed:', error);
    // Fallback: use the user's original selection
    return {
      userValue,
      mlsField: userField,
      mlsValue: userValue,
      confidence: 30,
      source: 'groq-ai',
      originalField: userField
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
    console.log(`⚡ Using cached mapping: ${userValue} → ${cached.mlsField}:${cached.mlsValue}`);
    return { ...cached, source: 'cached' };
  }

  // STEP 1: Hardcoded mappings (highest priority)
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

  // STEP 2.5: MLS fuzzy match (NEW - before Groq)
  const fuzzyMatch = checkMLSFuzzyMatch(userValue, userField);
  if (fuzzyMatch && fuzzyMatch.confidence >= 85) {
    cacheMapping(userValue, fuzzyMatch);
    return fuzzyMatch;
  }

  // STEP 3: Groq AI (last resort)
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
  console.log(`\n🎯 Processing smart mappings for filters:`, filters);

  const results = {
    zones: [] as FieldMapping[],
    areas: [] as FieldMapping[],
    communities: [] as FieldMapping[],
    subdivisions: [] as FieldMapping[]
  };

  // Process zones
  if (filters.zones && filters.zones.length > 0) {
    console.log(`\n📍 Processing ${filters.zones.length} zones...`);
    for (const zone of filters.zones) {
      const mapping = await getSmartMapping(zone, 'zone');
      results.zones.push(mapping);
    }
  }

  // Process areas
  if (filters.areas && filters.areas.length > 0) {
    console.log(`\n🗺️ Processing ${filters.areas.length} areas...`);
    for (const area of filters.areas) {
      const mapping = await getSmartMapping(area, 'area');
      results.areas.push(mapping);
    }
  }

  // Process communities
  if (filters.communities && filters.communities.length > 0) {
    console.log(`\n🏘️ Processing ${filters.communities.length} communities...`);
    for (const community of filters.communities) {
      const mapping = await getSmartMapping(community, 'community');
      results.communities.push(mapping);
    }
  }

  // Process subdivisions
  if (filters.subdivisions && filters.subdivisions.length > 0) {
    console.log(`\n🏡 Processing ${filters.subdivisions.length} subdivisions...`);
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

  // Group all mappings by their ACTUAL MLS field (not user's selection)
  const byField: Record<string, string[]> = {
    zone: [],
    area: [],
    community: [],
    subdivision: []
  };

  // Add zones (but check their actual mlsField)
  mappings.zones.forEach(m => {
    if (!byField[m.mlsField].includes(m.mlsValue)) {
      byField[m.mlsField].push(m.mlsValue);
    }
  });

  // Add areas
  mappings.areas.forEach(m => {
    if (!byField[m.mlsField].includes(m.mlsValue)) {
      byField[m.mlsField].push(m.mlsValue);
    }
  });

  // Add communities
  mappings.communities.forEach(m => {
    if (!byField[m.mlsField].includes(m.mlsValue)) {
      byField[m.mlsField].push(m.mlsValue);
    }
  });

  // Add subdivisions
  mappings.subdivisions.forEach(m => {
    if (!byField[m.mlsField].includes(m.mlsValue)) {
      byField[m.mlsField].push(m.mlsValue);
    }
  });

  // Build API parameters
  if (byField.zone.length > 0) {
    apiFilters.city = byField.zone.join(',');
    console.log(`📍 city (zones): ${apiFilters.city}`);
  }

  if (byField.area.length > 0) {
    apiFilters.area = byField.area.join(',');
    console.log(`🗺️ area: ${apiFilters.area}`);
  }

  if (byField.community.length > 0) {
    apiFilters.community = byField.community.join(',');
    console.log(`🏘️ community: ${apiFilters.community}`);
  }

  if (byField.subdivision.length > 0) {
    apiFilters.subdivision = byField.subdivision.join(',');
    console.log(`🏡 subdivision: ${apiFilters.subdivision}`);
  }

  console.log(`\n📋 Final API filters:`, apiFilters);

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

// Get mapping stats
export function getMappingStats(): {
  totalCached: number;
  bySource: Record<string, number>;
  byField: Record<string, number>;
} {
  const cache = getCachedMappings();
  const entries = Object.values(cache);
  
  const stats = {
    totalCached: entries.length,
    bySource: {} as Record<string, number>,
    byField: {} as Record<string, number>
  };
  
  entries.forEach(mapping => {
    stats.bySource[mapping.source] = (stats.bySource[mapping.source] || 0) + 1;
    stats.byField[mapping.mlsField] = (stats.byField[mapping.mlsField] || 0) + 1;
  });
  
  return stats;
}