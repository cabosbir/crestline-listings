// src/hooks/useLiveFilterCount.ts - WITH CACHING to prevent rate limits
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

// 🔥 IN-MEMORY CACHE to reduce API calls
const countCache = new Map<string, { count: number; timestamp: number; estimated: boolean }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useLiveFilterCount(filters: FilterState): FilterCountResult {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [estimated, setEstimated] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const cacheKey = getCacheKey(filters);
    const cached = countCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('💾 [CACHE HIT] Using cached count:', cached.count);
      setCount(cached.count);
      setEstimated(cached.estimated);
      setLoading(false);
      return;
    }

    timeoutRef.current = setTimeout(() => {
      fetchFilterCount();
    }, 2000);

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

  const getCacheKey = (filters: FilterState): string => {
    return JSON.stringify({
      zones: filters.zones?.sort() || [],
      areas: filters.areas?.sort() || [],
      communities: filters.communities?.sort() || [],
      minPrice: filters.minPrice || '',
      maxPrice: filters.maxPrice || '',
      minBeds: filters.minBeds || '',
      minBaths: filters.minBaths || '',
      propertyTypes: filters.propertyTypes?.sort() || [],
      status: filters.status || 'Active'
    });
  };

  const fetchFilterCount = async () => {
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setEstimated(false);

    try {
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
        const resultCount = data.count;
        const isEstimated = data.estimated || false;
        
        setCount(resultCount);
        setEstimated(isEstimated);
        
        const cacheKey = getCacheKey(filters);
        countCache.set(cacheKey, {
          count: resultCount,
          timestamp: Date.now(),
          estimated: isEstimated
        });
        
        console.log(`✅ [LIVE COUNT] ${resultCount} properties match (cached for 5min)`);
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

  const parsePrice = (priceStr: string): number => {
    if (!priceStr || priceStr === "No Preference") return 0;
    const cleaned = priceStr.replace(/[$,Million]/g, '').trim();
    const num = parseFloat(cleaned);
    if (isNaN(num)) return 0;
    return priceStr.includes('Million') ? num * 1000000 : num;
  };

  const parseNumber = (str: string): number => {
    if (!str || str === "Any" || str === "No Preference") return 0;
    const parsed = parseInt(str.replace('+', ''));
    return isNaN(parsed) ? 0 : parsed;
  };

  return { count, loading, estimated };
}