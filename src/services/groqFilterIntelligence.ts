// src/services/groqFilterIntelligence.ts
// Uses Groq AI to intelligently map filter values and learn what works

import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

interface FilterMapping {
  userValue: string;
  apiValue: string;
  confidence: number;
  workingStatus: 'working' | 'not-working' | 'untested';
  lastTested?: Date;
  resultCount?: number;
}

interface FilterIntelligence {
  zones: FilterMapping[];
  areas: FilterMapping[];
  communities: FilterMapping[];
  subdivisions: FilterMapping[];
}

// Local storage key for persisting learned mappings
const STORAGE_KEY = 'bir_filter_intelligence';

class GroqFilterIntelligence {
  private intelligence: FilterIntelligence;

  constructor() {
    this.intelligence = this.loadFromStorage();
  }

  private loadFromStorage(): FilterIntelligence {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading filter intelligence:', error);
    }
    
    return {
      zones: [],
      areas: [],
      communities: [],
      subdivisions: []
    };
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.intelligence));
    } catch (error) {
      console.error('Error saving filter intelligence:', error);
    }
  }

  /**
   * Uses Groq to analyze a filter value and suggest the correct API parameter name
   */
  async analyzeFilterValue(
    filterType: 'zone' | 'area' | 'community' | 'subdivision',
    userValue: string
  ): Promise<{ suggestedApiValue: string; confidence: number; reasoning: string }> {
    try {
      const prompt = `You are an expert at Cabo San Lucas real estate geography. 

TASK: Analyze this ${filterType} name and determine if it needs to be reformatted for an MLS API query.

USER INPUT: "${userValue}"
FILTER TYPE: ${filterType}

CONTEXT:
- FlexMLS API for Cabo San Lucas / Baja California Sur real estate
- Common issues: extra spaces, slashes, "CSL" vs "Cabo San Lucas", abbreviations
- Zone examples: "Cabo San Lucas", "San Jose del Cabo", "Cabo Corridor"
- Area examples: "Pedregal", "El Tezal", "Downtown", "Marina"
- Community examples: "Chileno Bay", "Querencia", "Palmilla"
- Subdivision examples: "Alba Residences", "Rancho San Lucas"

RULES:
1. Standardize abbreviations (CSL → Cabo San Lucas, SJD → San Jose del Cabo)
2. Remove unnecessary punctuation or special characters
3. Fix common typos or variations
4. Keep proper capitalization for place names
5. If it looks correct already, return it unchanged

Return ONLY a JSON object with this structure (no markdown, no explanation):
{
  "suggestedApiValue": "the corrected value",
  "confidence": 0.95,
  "reasoning": "brief explanation of changes made or why it's correct"
}`;

      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        temperature: 0.1,
        max_tokens: 200,
      });

      const response = completion.choices[0]?.message?.content || '{}';
      
      // Clean up the response in case Groq adds markdown formatting
      const cleanedResponse = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      const result = JSON.parse(cleanedResponse);
      
      return {
        suggestedApiValue: result.suggestedApiValue || userValue,
        confidence: result.confidence || 0.5,
        reasoning: result.reasoning || 'No reasoning provided'
      };
    } catch (error) {
      console.error('Error analyzing filter value with Groq:', error);
      return {
        suggestedApiValue: userValue,
        confidence: 0.5,
        reasoning: 'Failed to analyze with AI'
      };
    }
  }

  /**
   * Records the result of testing a filter value
   */
  recordTestResult(
    filterType: 'zones' | 'areas' | 'communities' | 'subdivisions',
    userValue: string,
    apiValue: string,
    resultCount: number
  ): void {
    const mapping: FilterMapping = {
      userValue,
      apiValue,
      confidence: resultCount > 0 ? 1.0 : 0.0,
      workingStatus: resultCount > 0 ? 'working' : 'not-working',
      lastTested: new Date(),
      resultCount
    };

    // Find existing mapping or add new one
    const existingIndex = this.intelligence[filterType].findIndex(
      m => m.userValue === userValue
    );

    if (existingIndex >= 0) {
      this.intelligence[filterType][existingIndex] = mapping;
    } else {
      this.intelligence[filterType].push(mapping);
    }

    this.saveToStorage();
    
    console.log(`📚 Learned: ${filterType} "${userValue}" → ${resultCount} results`);
  }

  /**
   * Gets a learned mapping if it exists
   */
  getLearnedMapping(
    filterType: 'zones' | 'areas' | 'communities' | 'subdivisions',
    userValue: string
  ): FilterMapping | null {
    return this.intelligence[filterType].find(m => m.userValue === userValue) || null;
  }

  /**
   * Suggests corrections for a filter value based on learned data
   */
  async suggestCorrection(
    filterType: 'zone' | 'area' | 'community' | 'subdivision',
    userValue: string
  ): Promise<string> {
    const pluralType = `${filterType}s` as 'zones' | 'areas' | 'communities' | 'subdivisions';
    
    // First, check if we've already learned the correct mapping
    const learned = this.getLearnedMapping(pluralType, userValue);
    
    if (learned && learned.workingStatus === 'working') {
      console.log(`✅ Using learned mapping: ${userValue} → ${learned.apiValue}`);
      return learned.apiValue;
    }

    // If not learned, ask Groq for a suggestion
    const analysis = await this.analyzeFilterValue(filterType, userValue);
    
    console.log(`🤖 Groq suggests: ${userValue} → ${analysis.suggestedApiValue}`);
    console.log(`   Confidence: ${(analysis.confidence * 100).toFixed(0)}%`);
    console.log(`   Reasoning: ${analysis.reasoning}`);
    
    return analysis.suggestedApiValue;
  }

  /**
   * Batch process all filter values to find corrections
   */
  async optimizeAllFilters(filters: {
    zones?: string[];
    areas?: string[];
    communities?: string[];
    subdivisions?: string[];
  }): Promise<{
    zones: string[];
    areas: string[];
    communities: string[];
    subdivisions: string[];
  }> {
    const optimized = {
      zones: [] as string[],
      areas: [] as string[],
      communities: [] as string[],
      subdivisions: [] as string[]
    };

    // Process zones
    if (filters.zones) {
      for (const zone of filters.zones) {
        const corrected = await this.suggestCorrection('zone', zone);
        optimized.zones.push(corrected);
      }
    }

    // Process areas
    if (filters.areas) {
      for (const area of filters.areas) {
        const corrected = await this.suggestCorrection('area', area);
        optimized.areas.push(corrected);
      }
    }

    // Process communities
    if (filters.communities) {
      for (const community of filters.communities) {
        const corrected = await this.suggestCorrection('community', community);
        optimized.communities.push(corrected);
      }
    }

    // Process subdivisions
    if (filters.subdivisions) {
      for (const subdivision of filters.subdivisions) {
        const corrected = await this.suggestCorrection('subdivision', subdivision);
        optimized.subdivisions.push(corrected);
      }
    }

    return optimized;
  }

  /**
   * Get statistics about learned filters
   */
  getStatistics() {
    const stats = {
      zones: {
        total: this.intelligence.zones.length,
        working: this.intelligence.zones.filter(m => m.workingStatus === 'working').length,
        notWorking: this.intelligence.zones.filter(m => m.workingStatus === 'not-working').length
      },
      areas: {
        total: this.intelligence.areas.length,
        working: this.intelligence.areas.filter(m => m.workingStatus === 'working').length,
        notWorking: this.intelligence.areas.filter(m => m.workingStatus === 'not-working').length
      },
      communities: {
        total: this.intelligence.communities.length,
        working: this.intelligence.communities.filter(m => m.workingStatus === 'working').length,
        notWorking: this.intelligence.communities.filter(m => m.workingStatus === 'not-working').length
      },
      subdivisions: {
        total: this.intelligence.subdivisions.length,
        working: this.intelligence.subdivisions.filter(m => m.workingStatus === 'working').length,
        notWorking: this.intelligence.subdivisions.filter(m => m.workingStatus === 'not-working').length
      }
    };

    return stats;
  }

  /**
   * Clear all learned data (useful for testing)
   */
  clearLearning(): void {
    this.intelligence = {
      zones: [],
      areas: [],
      communities: [],
      subdivisions: []
    };
    this.saveToStorage();
    console.log('🧹 Cleared all learned filter mappings');
  }

  /**
   * Export learned data as JSON
   */
  exportLearning(): string {
    return JSON.stringify(this.intelligence, null, 2);
  }

  /**
   * Import learned data from JSON
   */
  importLearning(jsonData: string): void {
    try {
      const imported = JSON.parse(jsonData);
      this.intelligence = imported;
      this.saveToStorage();
      console.log('📥 Imported filter intelligence');
    } catch (error) {
      console.error('Error importing filter intelligence:', error);
    }
  }
}

// Singleton instance
export const filterIntelligence = new GroqFilterIntelligence();

export default GroqFilterIntelligence;
