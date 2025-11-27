// groqFilterIntelligence_SMART.ts - Enhanced with Field Mapping Intelligence
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

// ============================================================================
// FIELD MAPPING SYSTEM
// ============================================================================

export interface FieldMapping {
  originalField: 'zone' | 'area' | 'community' | 'subdivision';
  suggestedField: 'zone' | 'area' | 'community' | 'subdivision';
  value: string;
  parentZone?: string;
  confidence: number;
  reasoning: string;
}

export interface FilterMapping {
  field: 'zone' | 'area' | 'community' | 'subdivision';
  value: string;
  parentZone?: string;
  parentArea?: string;
}

const FIELD_MAPPINGS_KEY = 'flexmls_field_mappings';
const FILTER_RESULTS_KEY = 'flexmls_filter_results';

// Get stored field mappings
function getStoredFieldMappings(): Record<string, FilterMapping> {
  try {
    const stored = localStorage.getItem(FIELD_MAPPINGS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading field mappings:', error);
    return {};
  }
}

// Save field mapping
export function saveFieldMapping(filterValue: string, mapping: FilterMapping): void {
  try {
    const mappings = getStoredFieldMappings();
    mappings[filterValue.toLowerCase()] = mapping;
    localStorage.setItem(FIELD_MAPPINGS_KEY, JSON.stringify(mappings));
    console.log(`💾 Saved field mapping: ${filterValue} → ${mapping.field}`, mapping);
  } catch (error) {
    console.error('Error saving field mapping:', error);
  }
}

// Get field mapping for a filter value
export function getFieldMapping(filterValue: string): FilterMapping | null {
  const mappings = getStoredFieldMappings();
  return mappings[filterValue.toLowerCase()] || null;
}

// ============================================================================
// GROQ AI FIELD MAPPING
// ============================================================================

export async function getAIFieldMapping(
  filterValue: string,
  originalField: 'zone' | 'area' | 'community' | 'subdivision'
): Promise<FieldMapping> {
  console.log(`🤖 Asking Groq which field to use for: "${filterValue}" (currently: ${originalField})`);

  const prompt = `You are a Cabo San Lucas / Los Cabos real estate expert helping to categorize location filters.

The user selected "${filterValue}" as a ${originalField.toUpperCase()}.

Your job: Determine the CORRECT field category for this location in a real estate MLS system.

FIELD DEFINITIONS:
- ZONE (City): Major cities/regions (e.g., "Cabo San Lucas", "San Jose del Cabo", "La Paz", "East Cape", "Loreto")
- AREA: Neighborhoods/districts within a zone (e.g., "Pedregal", "Downtown", "Marina", "Corridor")
- COMMUNITY: Master-planned communities (e.g., "Querencia", "Palmilla", "Cabo Del Sol")
- SUBDIVISION: Specific developments (e.g., "Copala", "Chileno Bay", "Costa Palmas")

HIERARCHY:
Zone > Area > Community > Subdivision

EXAMPLES:
- "Todos Santos" → area (under La Paz zone)
- "Pedregal" → area (under Cabo San Lucas zone)
- "Querencia" → community (under Cabo Corridor zone)
- "Copala" → subdivision (under Cabo Corridor zone)
- "La Paz" → zone (it's a major city)

Respond with ONLY valid JSON (no markdown, no code blocks):
{
  "suggestedField": "zone|area|community|subdivision",
  "value": "optimized name if needed",
  "parentZone": "parent zone name if applicable",
  "parentArea": "parent area if it's a community/subdivision",
  "confidence": 0-100,
  "reasoning": "brief explanation"
}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 500,
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    console.log(`🤖 Groq response:`, responseText);

    // Strip markdown if present
    const cleanedResponse = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const aiMapping = JSON.parse(cleanedResponse);

    const result: FieldMapping = {
      originalField,
      suggestedField: aiMapping.suggestedField || originalField,
      value: aiMapping.value || filterValue,
      parentZone: aiMapping.parentZone,
      confidence: aiMapping.confidence || 50,
      reasoning: aiMapping.reasoning || 'No reasoning provided',
    };

    console.log(`✅ AI Field Mapping:`, result);
    return result;
  } catch (error) {
    console.error('❌ Groq field mapping failed:', error);
    return {
      originalField,
      suggestedField: originalField,
      value: filterValue,
      confidence: 0,
      reasoning: 'Error occurred during AI analysis',
    };
  }
}

// ============================================================================
// EXISTING FILTER OPTIMIZATION (Keep this for backward compatibility)
// ============================================================================

interface FilterLearning {
  originalValue: string;
  optimizedValue: string;
  resultCount: number;
  lastTested: string;
  successRate: number;
}

function getStoredLearnings(): Record<string, FilterLearning> {
  try {
    const stored = localStorage.getItem(FILTER_RESULTS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading stored learnings:', error);
    return {};
  }
}

export function recordFilterResult(
  filterType: string,
  originalValue: string,
  optimizedValue: string,
  resultCount: number
): void {
  try {
    const learnings = getStoredLearnings();
    const key = `${filterType}:${originalValue.toLowerCase()}`;
    
    const existing = learnings[key];
    const successRate = existing
      ? (existing.successRate * 0.8 + (resultCount > 0 ? 1 : 0) * 0.2)
      : resultCount > 0 ? 1 : 0;

    learnings[key] = {
      originalValue,
      optimizedValue,
      resultCount,
      lastTested: new Date().toISOString(),
      successRate,
    };

    localStorage.setItem(FILTER_RESULTS_KEY, JSON.stringify(learnings));
    console.log(`📚 Learned: ${filterType} "${originalValue}" → ${resultCount} results`);
  } catch (error) {
    console.error('Error recording filter result:', error);
  }
}

export function getLearnedOptimization(filterType: string, value: string): string | null {
  const learnings = getStoredLearnings();
  const key = `${filterType}:${value.toLowerCase()}`;
  const learning = learnings[key];

  if (learning && learning.successRate > 0.5) {
    console.log(`✅ Using learned optimization: ${value} → ${learning.optimizedValue}`);
    return learning.optimizedValue;
  }

  return null;
}

export async function optimizeFilterValue(
  filterType: string,
  value: string,
  allFilters: Record<string, any>
): Promise<string> {
  // Check for learned optimization first
  const learned = getLearnedOptimization(filterType, value);
  if (learned) return learned;

  console.log(`🤖 Asking Groq to optimize ${filterType}: "${value}"`);

  const prompt = `You are helping optimize real estate search filters for a Cabo San Lucas MLS system.

FILTER TYPE: ${filterType}
CURRENT VALUE: "${value}"
CONTEXT: ${JSON.stringify(allFilters, null, 2)}

Your task: Suggest the most likely correct spelling/format for this filter value that would match MLS database entries.

Common issues:
- Missing accents (Cabo San Lucas, San José del Cabo)
- Abbreviations (CSL → Cabo San Lucas, SJD → San Jose del Cabo)
- Spelling variations (El Tezal vs El Tesal, Querencia vs Querencia)
- Different formats (Cabo Corridor vs The Corridor)

Respond with ONLY the optimized filter value (no JSON, no explanation, just the corrected name).
If the value looks correct, return it unchanged.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 100,
    });

    const optimizedValue = completion.choices[0]?.message?.content?.trim() || value;
    console.log(`✅ Groq optimization: ${value} → ${optimizedValue}`);
    return optimizedValue;
  } catch (error) {
    console.error('❌ Groq optimization failed:', error);
    return value;
  }
}

// ============================================================================
// EXPORT ALL LEARNINGS (for training dashboard)
// ============================================================================

export function exportAllLearnings(): string {
  const learnings = getStoredLearnings();
  const mappings = getStoredFieldMappings();

  const data = {
    filterResults: learnings,
    fieldMappings: mappings,
    exportedAt: new Date().toISOString(),
  };

  return JSON.stringify(data, null, 2);
}

export function clearAllLearnings(): void {
  localStorage.removeItem(FILTER_RESULTS_KEY);
  localStorage.removeItem(FIELD_MAPPINGS_KEY);
  console.log('🗑️ Cleared all learnings');
}
