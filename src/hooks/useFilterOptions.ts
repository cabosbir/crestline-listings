// src/hooks/useFilterOptions.ts - Fetch REAL filter values from API
import { useState, useEffect } from 'react';

interface FilterOptions {
  zones: string[];
  areas: string[];
  communities: string[];
  subdivisions: string[];
  propertyTypes: string[];
}

interface UseFilterOptionsResult {
  options: FilterOptions;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const CACHE_KEY = 'flexmls_filter_options';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export function useFilterOptions(): UseFilterOptionsResult {
  const [options, setOptions] = useState<FilterOptions>({
    zones: [],
    areas: [],
    communities: [],
    subdivisions: [],
    propertyTypes: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        
        // Use cache if less than 1 hour old
        if (age < CACHE_DURATION) {
          console.log('✅ Using cached filter options');
          setOptions(data);
          setLoading(false);
          return;
        }
      }

      console.log('🔄 Fetching fresh filter options from API...');
      
      const response = await fetch('/api/flexmls-distinct-values');
      const result = await response.json();

      if (result.success && result.data) {
        setOptions(result.data);
        
        // Cache the results
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: result.data,
          timestamp: Date.now()
        }));
        
        console.log('✅ Filter options loaded:', {
          zones: result.data.zones.length,
          areas: result.data.areas.length,
          communities: result.data.communities.length,
          subdivisions: result.data.subdivisions.length
        });
      } else {
        throw new Error(result.error || 'Failed to fetch filter options');
      }
    } catch (err) {
      console.error('❌ Error loading filter options:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Fallback to static constants if API fails
      console.log('⚠️ Falling back to static filter constants');
      import('@/constants/filterConstants').then((constants) => {
        setOptions({
          zones: constants.zones,
          areas: constants.areas,
          communities: constants.communities,
          subdivisions: constants.subdivisions,
          propertyTypes: constants.propertyTypes
        });
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  return {
    options,
    loading,
    error,
    refetch: fetchOptions
  };
}

// Helper function to manually clear cache (useful for testing)
export function clearFilterOptionsCache() {
  localStorage.removeItem(CACHE_KEY);
  console.log('🗑️ Filter options cache cleared');
}