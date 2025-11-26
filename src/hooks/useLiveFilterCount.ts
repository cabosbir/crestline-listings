// src/hooks/useLiveFilterCount.ts - Custom hook for live filter count preview
import { useState, useEffect, useRef } from 'react';

interface FilterState {
  zones?: string[];
  areas?: string[];
  communities?: string[];
  minPrice?: string;
  maxPrice?: string;
  minBeds?: string;
  minBaths?: string;
  propertyTypes?: string[];
  status?: string;
}

interface FilterCountResult {
  count: number;
  loading: boolean;
  estimated: boolean;
}

export function useLiveFilterCount(filters: FilterState): FilterCountResult {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [estimated, setEstimated] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 🎯 DEBOUNCE: Wait 500ms after user stops selecting
    timeoutRef.current = setTimeout(() => {
      fetchFilterCount();
    }, 500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [
    filters.zones,
    filters.areas,
    filters.communities,
    filters.minPrice,
    filters.maxPrice,
    filters.minBeds,
    filters.minBaths,
    filters.propertyTypes,
    filters.status
  ]);

  const fetchFilterCount = async () => {
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setEstimated(false);

    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (filters.zones && filters.zones.length > 0) {
        filters.zones.forEach(z => params.append('zones', z));
      }
      if (filters.areas && filters.areas.length > 0) {
        filters.areas.forEach(a => params.append('areas', a));
      }
      if (filters.communities && filters.communities.length > 0) {
        filters.communities.forEach(c => params.append('communities', c));
      }
      if (filters.minPrice) params.append('minPrice', parsePrice(filters.minPrice).toString());
      if (filters.maxPrice) params.append('maxPrice', parsePrice(filters.maxPrice).toString());
      if (filters.minBeds) params.append('beds', parseNumber(filters.minBeds).toString());
      if (filters.minBaths) params.append('baths', parseNumber(filters.minBaths).toString());
      if (filters.propertyTypes && filters.propertyTypes.length > 0) {
        filters.propertyTypes.forEach(t => params.append('propertyTypes', t));
      }
      if (filters.status) params.append('status', filters.status);

      console.log('🔍 [LIVE COUNT] Fetching count for filters:', params.toString());

      const response = await fetch(`/api/flexmls-filter-count?${params.toString()}`, {
        signal: abortControllerRef.current.signal
      });

      const data = await response.json();

      if (data.success) {
        setCount(data.count);
        setEstimated(data.estimated || false);
        console.log(`✅ [LIVE COUNT] ${data.count} properties match`);
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('🔄 [LIVE COUNT] Request cancelled (user still selecting)');
      } else {
        console.error('❌ [LIVE COUNT] Error:', error);
        setEstimated(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper: Parse price strings
  const parsePrice = (priceStr: string): number => {
    if (!priceStr || priceStr === "No Preference") return 0;
    const cleaned = priceStr.replace(/[$,Million]/g, '').trim();
    const num = parseFloat(cleaned);
    if (isNaN(num)) return 0;
    return priceStr.includes('Million') ? num * 1000000 : num;
  };

  // Helper: Parse number strings
  const parseNumber = (str: string): number => {
    if (!str || str === "Any" || str === "No Preference") return 0;
    const parsed = parseInt(str.replace('+', ''));
    return isNaN(parsed) ? 0 : parsed;
  };

  return { count, loading, estimated };
}
