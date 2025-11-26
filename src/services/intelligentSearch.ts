// src/services/intelligentSearch.ts - Intelligent search service
import type { MLSProperty } from './flexMlsService';

export async function searchProperties(
  query: string,
  type?: 'mls' | 'address' | 'city' | 'text'
): Promise<MLSProperty[]> {
  try {
    // Auto-detect type if not provided
    if (!type) {
      if (/^[\d-]+$/.test(query)) {
        type = 'mls';
      } else if (query.toLowerCase().includes('cabo') || query.toLowerCase().includes('san jose')) {
        type = 'city';
      } else {
        type = 'text';
      }
    }

    console.log(`🔍 [INTELLIGENT SEARCH] Query: "${query}", Type: ${type}`);

    const params = new URLSearchParams({
      query: query,
      type: type
    });

    const response = await fetch(`/api/flexmls-search?${params.toString()}`);
    const data = await response.json();

    if (!data.success) {
      if (response.status === 429) {
        console.warn('⚠️ [RATE LIMIT] FlexMLS throttled the request');
        throw new Error('Too many requests. Please wait a moment and try again.');
      }
      throw new Error(data.error || 'Search failed');
    }

    console.log(`✅ [SEARCH RESULTS] Found ${data.results.length} properties`);
    return data.results;

  } catch (error) {
    console.error('❌ [SEARCH ERROR]:', error);
    throw error;
  }
}

export async function searchByMLS(mlsNumber: string): Promise<MLSProperty | null> {
  const results = await searchProperties(mlsNumber, 'mls');
  return results.length > 0 ? results[0] : null;
}

export async function searchByAddress(address: string): Promise<MLSProperty[]> {
  return await searchProperties(address, 'address');
}

export async function searchByCity(city: string): Promise<MLSProperty[]> {
  return await searchProperties(city, 'city');
}
// Get real total count from FlexMLS
export async function getFlexMLSTotalCount(): Promise<number> {
  try {
    const response = await fetch('/api/flexmls-total-count');
    const data = await response.json();
    
    if (data.success && data.total) {
      console.log(`📊 FlexMLS Total: ${data.total.toLocaleString()} properties`);
      return data.total;
    }
    
    return 4528; // Fallback
  } catch (error) {
    console.error('Error fetching total:', error);
    return 4528; // Fallback
  }
}