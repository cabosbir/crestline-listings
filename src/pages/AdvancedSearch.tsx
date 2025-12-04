import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import LeafletPropertyMap from "@/components/LeafletPropertyMap";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { X, Search, Loader2 } from "lucide-react";
import { fetchListings, convertMLSToPropertyCard, type MLSProperty } from "@/services/flexMlsService";
import { getSmartMappings, buildAPIFilters, discoverMLSFields, getValidatedSpecialFilters } from "@/services/groqIntelligence";
import { 
  translateUserInputToMLS, 
  buildMLSAPIFilter, 
  validateMLSFilters 
} from "@/services/mlsTranslator"; // 🆕 MLS Translator
import { 
  propertyTypes, 
  zones, 
  areas, 
  communities, 
  subdivisions,
  priceOptions,
  bedsOptions,
  bathsOptions
} from "@/constants/filterConstants";

interface FilterState {
  propertyTypes: string[];
  status: string;
  zones: string[];
  areas: string[];
  communities: string[];
  subdivisions: string[];
  sellerFinancing: boolean;
  primaryView: boolean;
  currentPrice: boolean;
  minPrice: string;
  maxPrice: string;
  minBeds: string;
  minBaths: string;
  mlsSearch: string;
}

const AdvancedSearch = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // ⭐ CLEAR STALE CACHE ON MOUNT - Force fresh data
  useEffect(() => {
    const clearStaleCache = () => {
      try {
        // Clear only listing-related cache, preserve user preferences
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (
            key.includes('featured') || 
            key.includes('my-listings') || 
            key.includes('search-results') ||
            key.includes('property-cache')
          )) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        console.log('🧹 Cleared stale listing cache on AdvancedSearch mount');
      } catch (e) {
        console.error('Error clearing cache:', e);
      }
    };
    
    clearStaleCache();
  }, []); // Run only once on mount
  
  const [uiSearchQuery, setUiSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    propertyTypes: ["Condos", "Houses", "Land"],
    status: "Active",
    zones: [],
    areas: [],
    communities: [],
    subdivisions: [],
    sellerFinancing: false,
    primaryView: false,
    currentPrice: false,
    minPrice: "$50,000",
    maxPrice: "$3 Million",
    minBeds: "1+",
    minBaths: "Any",
    mlsSearch: "",
  });

  const [previewProperties, setPreviewProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [aiOptimizing, setAiOptimizing] = useState(false);
  const [discoveredFields, setDiscoveredFields] = useState<any>(null); // 🆕 MLS field discovery cache

  // Load filters from URL on mount
  useEffect(() => {
    const urlZones = searchParams.get('zones');
    const urlAreas = searchParams.get('areas');
    const urlCommunities = searchParams.get('communities');
    const urlSubdivisions = searchParams.get('subdivisions');
    const urlMinPrice = searchParams.get('minPrice');
    const urlMaxPrice = searchParams.get('maxPrice');
    const urlBeds = searchParams.get('beds');
    const urlBaths = searchParams.get('baths');
    const urlPropertyTypes = searchParams.get('propertyTypes');
    const urlStatus = searchParams.get('status');
    const urlMlsSearch = searchParams.get('search');

    if (urlZones || urlAreas || urlCommunities || urlSubdivisions || urlMlsSearch) {
      setFilters(prev => ({
        ...prev,
        zones: urlZones ? urlZones.split(',') : [],
        areas: urlAreas ? urlAreas.split(',') : [],
        communities: urlCommunities ? urlCommunities.split(',') : [],
        subdivisions: urlSubdivisions ? urlSubdivisions.split(',') : [],
        minPrice: urlMinPrice || prev.minPrice,
        maxPrice: urlMaxPrice || prev.maxPrice,
        minBeds: urlBeds || prev.minBeds,
        minBaths: urlBaths || prev.minBaths,
        propertyTypes: urlPropertyTypes ? urlPropertyTypes.split(',') : prev.propertyTypes,
        status: urlStatus || prev.status,
        mlsSearch: urlMlsSearch || "",
      }));
    }
  }, []);

  // ✅ COMPLETE CASCADING HIERARCHY MAPS
  const zoneToAreaMap: Record<string, string[]> = {
    "Cabo San Lucas": ["CSL Cor-Inland", "CSL-Centro", "CSL-Corr. Oceanside", "CSL-Beach & Marina", "CSL-North"],
    "San Jose del Cabo": ["SJD Corr-Inland", "SJD Corr-Oceanside", "SJD-Centro", "SJD-Beachside", "SJD-East", "SJD-Inland/Golf", "SJD-North"],
    "East Cape": ["East Cape North", "East Cape South", "La Ribera", "Los Barriles", "BuenaVista/Rancho Leonero", "BuenVsta/LosBarilles", "ElCardonal/N of Bariles", "Vinorama/Cabo Pulmo", "Zacatitos/PtaPerfcta", "Bay of Dreams", "Costa Palmas"],
    "La Paz": ["La Paz City", "LaPaz Beach", "El Centenario", "El Sargento", "La Ventana", "Los Planes"],
    "Loreto": ["Loreto", "Loreto Bay", "Nopolo"],
    "Pacific": ["Pacific North", "Pacific South", "Pescadero/Cerritos", "Migrino Area"],
    "Cabo Corridor": ["CSL Cor-Inland", "CSL-Corr. Oceanside"],
  };

  // Area → Community mapping
  const areaToCommunityMap: Record<string, string[]> = {
    "CSL-Beach & Marina": ["CSL Beach", "CSL Marina", "CSL Near Bch & Marina"],
    "CSL-Centro": ["Centro", "Pedregal CSL"],
    "CSL-North": ["CSL North-East 19", "CSL North-West 19", "El Tezal-East", "El Tezal-West", "El Tezal-OceanSide"],
    "CSL Cor-Inland": ["Cabo del Sol-Inland", "Cabo Real-Inland", "Querencia-Inland"],
    "CSL-Corr. Oceanside": ["Cabo Bello/Santa Carmela", "Cabo del Sol", "Cabo Real-Ocean Side", "Chileno Bay/Montage", "Diamante Cabo San Lucas", "Quivira", "Rancho San Lucas"],
    "SJD Corr-Inland": ["El Tule-Inland", "Palmilla-Inland"],
    "SJD Corr-Oceanside": ["Chileno Bay Club", "Costa Palmas", "El Tule-Ocean Side", "Palmilla-Ocean Side", "Puerto Los Cabos"],
    "SJD-Centro": ["SJD Downtown", "Forjadores SJD"],
    "SJD-Beachside": ["SJD-Beach", "Costa Azul Beach"],
    "SJD-East": ["Ladera San José"],
    "SJD-Inland/Golf": ["Fonatur Golf & Hills", "Puerto Los Cabos"],
    "SJD-North": ["SJD North-E of 1", "SJD North-W of 1", "SJD above Hwy 1"],
    "East Cape North": ["BuenaVista/Rancho Leonero", "ElCardonal/N of Bariles", "Los Barriles"],
    "East Cape South": ["La Ribera", "Vinorama/Cabo Pulmo", "Zacatitos/PtaPerfcta"],
    "Bay of Dreams": ["Bay of Dreams", "BayOfDreams/Ventanas"],
    "Costa Palmas": ["Costa Palmas"],
    "Pacific North": ["Todos Santos", "Todos Santos North"],
    "Pacific South": ["Pescadero/Cerritos"],
    "La Paz City": ["Centro", "Club Campestre", "El Centenario"],
    "LaPaz Beach": ["LaPaz Beach Community", "El Mogote"],
  };

  // Community → Subdivision mapping
  const communityToSubdivisionMap: Record<string, string[]> = {
    "Pedregal CSL": ["Pedregal"],
    "Cabo Bello/Santa Carmela": ["Cabo Bello", "Santa Carmela"],
    "Cabo del Sol": ["Cabo del Sol", "Cabo del Sol Viejo"],
    "Cabo Real-Ocean Side": ["Cabo Real"],
    "Chileno Bay/Montage": ["Chileno Bay", "Montage Los Cabos"],
    "Diamante Cabo San Lucas": ["Diamante", "Dunes Cabo"],
    "Quivira": ["Quivira", "Pueblo Bonito Sunset Beach"],
    "Querencia-Ocean side": ["Querencia"],
    "Querencia-Inland": ["Querencia"],
    "Palmilla-Ocean Side": ["Palmilla", "One&Only Palmilla"],
    "Palmilla-Inland": ["Palmilla"],
    "Puerto Los Cabos": ["Puerto Los Cabos"],
    "Costa Palmas": ["Costa Palmas", "Four Seasons Costa Palmas"],
    "Rancho San Lucas": ["Rancho San Lucas", "Solmar"],
    "El Tezal-East": ["Misiones"],
    "Todos Santos": ["Todos Santos"],
  };

  const matchesUiSearch = (text: string) => {
    if (!uiSearchQuery) return true;
    return text.toLowerCase().includes(uiSearchQuery.toLowerCase());
  };

  const filteredZones = zones.filter(matchesUiSearch);
  
  // ✅ Filter areas based on selected zones (cascading filter)
  const getFilteredAreas = () => {
    let availableAreas = [...areas];
    
    // If zones are selected, only show areas that belong to those zones
    if (filters.zones.length > 0) {
      const zonesAreas = filters.zones.flatMap(zone => zoneToAreaMap[zone] || []);
      availableAreas = areas.filter(area => zonesAreas.includes(area));
    }
    
    // Then apply UI search filter
    return availableAreas.filter(matchesUiSearch);
  };
  
  const filteredAreas = getFilteredAreas();

  // ✅ Filter communities based on selected zones AND areas
  const getFilteredCommunities = () => {
    let availableCommunities = [...communities];
    
    // If areas are selected, only show communities that belong to those areas
    if (filters.areas.length > 0) {
      const areasCommunities = filters.areas.flatMap(area => areaToCommunityMap[area] || []);
      availableCommunities = communities.filter(comm => areasCommunities.includes(comm));
    }
    // If no areas but zones are selected, get communities through areas
    else if (filters.zones.length > 0) {
      const zonesAreas = filters.zones.flatMap(zone => zoneToAreaMap[zone] || []);
      const areasCommunities = zonesAreas.flatMap(area => areaToCommunityMap[area] || []);
      availableCommunities = communities.filter(comm => areasCommunities.includes(comm));
    }
    
    return availableCommunities.filter(matchesUiSearch);
  };
  
  const filteredCommunities = getFilteredCommunities();

  // ✅ Filter subdivisions based on selected communities/areas/zones
  const getFilteredSubdivisions = () => {
    let availableSubdivisions = [...subdivisions];
    
    // If communities are selected, only show subdivisions that belong to those communities
    if (filters.communities.length > 0) {
      const communitiesSubdivisions = filters.communities.flatMap(comm => communityToSubdivisionMap[comm] || []);
      availableSubdivisions = subdivisions.filter(sub => communitiesSubdivisions.includes(sub));
    }
    // If no communities but areas are selected, get subdivisions through communities
    else if (filters.areas.length > 0) {
      const areasCommunities = filters.areas.flatMap(area => areaToCommunityMap[area] || []);
      const communitiesSubdivisions = areasCommunities.flatMap(comm => communityToSubdivisionMap[comm] || []);
      availableSubdivisions = subdivisions.filter(sub => communitiesSubdivisions.includes(sub));
    }
    // If no areas but zones are selected, get subdivisions through areas → communities
    else if (filters.zones.length > 0) {
      const zonesAreas = filters.zones.flatMap(zone => zoneToAreaMap[zone] || []);
      const areasCommunities = zonesAreas.flatMap(area => areaToCommunityMap[area] || []);
      const communitiesSubdivisions = areasCommunities.flatMap(comm => communityToSubdivisionMap[comm] || []);
      availableSubdivisions = subdivisions.filter(sub => communitiesSubdivisions.includes(sub));
    }
    
    return availableSubdivisions.filter(matchesUiSearch);
  };
  
  const filteredSubdivisions = getFilteredSubdivisions();

  // ✅ FIXED: Fetch preview whenever ANY filter changes
  useEffect(() => {
    console.log('🔥 useEffect FIRED! Current filters:', {
      zones: filters.zones,
      areas: filters.areas,
      communities: filters.communities,
      subdivisions: filters.subdivisions,
      zonesLength: filters.zones.length,
      areasLength: filters.areas.length,
      communitiesLength: filters.communities.length
    });
    
    const debounce = setTimeout(() => {
      // Check if ANY meaningful filters are set
      const hasLocationFilters = filters.zones.length > 0 || filters.areas.length > 0 || 
                                 filters.communities.length > 0 || filters.subdivisions.length > 0;
      const hasSearch = filters.mlsSearch.trim() !== "";
      const hasPropertyTypeFilter = filters.propertyTypes.length > 0 && filters.propertyTypes.length < 3;
      const hasPriceFilter = filters.minPrice !== "$50,000" || filters.maxPrice !== "$3 Million";
      const hasBedsFilter = filters.minBeds !== "1+";
      const hasBathsFilter = filters.minBaths !== "Any";
      const hasSpecialFilters = filters.sellerFinancing || filters.primaryView || filters.currentPrice;
      
      const hasAnyFilter = hasLocationFilters || hasSearch || hasPropertyTypeFilter || 
                          hasPriceFilter || hasBedsFilter || hasBathsFilter || hasSpecialFilters;
      
      console.log('🎯 Filter check:', {
        hasLocationFilters,
        hasAnyFilter,
        willFetch: hasAnyFilter
      });
      
      if (hasAnyFilter) {
        console.log('🔄 Filter changed - fetching preview...', {
          zones: filters.zones,
          areas: filters.areas,
          communities: filters.communities,
          subdivisions: filters.subdivisions
        });
        fetchPreviewWithIntelligence();
      } else {
        console.log('🔄 No filters active - clearing preview');
        setPreviewProperties([]);
        setTotalCount(0);
      }
    }, 800); // Debounce 800ms to avoid too many API calls while typing/clicking

    return () => clearTimeout(debounce);
  }, [
    // ✅ ALL filter dependencies - triggers on EVERY change
    filters.zones,
    filters.areas, 
    filters.communities,
    filters.subdivisions,
    filters.mlsSearch,
    filters.propertyTypes,
    filters.minPrice,
    filters.maxPrice,
    filters.minBeds,
    filters.minBaths,
    filters.status,
    filters.sellerFinancing,
    filters.primaryView,
    filters.currentPrice
  ]);

  const fetchPreviewWithIntelligence = async () => {
    setLoading(true);
    setAiOptimizing(true);
    
    try {
      console.log('🧠 Starting search with filters:', {
        zones: filters.zones,
        areas: filters.areas,
        communities: filters.communities,
        subdivisions: filters.subdivisions,
        search: filters.mlsSearch
      });
      
      // Build complete API filters
      const apiFilters: any = {};
      
      // ✅ Location filters - Use PLURAL to match flexMlsService.ts
      if (filters.zones.length > 0) {
        apiFilters.city = filters.zones.join(',');
        console.log('  📍 City filter:', apiFilters.city);
      }
      if (filters.areas.length > 0) {
        apiFilters.areas = filters.areas.join(',');  // ✅ FIXED: Changed to 'areas' (plural)
        console.log('  📍 Area filter:', apiFilters.areas);
      }
      if (filters.communities.length > 0 || filters.subdivisions.length > 0) {
        apiFilters.communities = [...filters.communities, ...filters.subdivisions].join(',');  // ✅ FIXED: Changed to 'communities' (plural)
        console.log('  📍 Community filter:', apiFilters.communities);
      }
      
      if (filters.minPrice !== "No Preference" && filters.minPrice !== "$50,000") {
        apiFilters.minPrice = parsePrice(filters.minPrice);
        console.log('  💰 Min price:', apiFilters.minPrice);
      }
      
      if (filters.maxPrice !== "No Preference" && filters.maxPrice !== "$3 Million") {
        apiFilters.maxPrice = parsePrice(filters.maxPrice);
        console.log('  💰 Max price:', apiFilters.maxPrice);
      }
      
      if (filters.minBeds !== "Any" && filters.minBeds !== "1+") {
        apiFilters.bedrooms = parseInt(filters.minBeds.replace('+', ''));
        console.log('  🛏️ Min beds:', apiFilters.bedrooms);
      }
      
      if (filters.minBaths !== "Any") {
        apiFilters.bathrooms = parseInt(filters.minBaths.replace('+', ''));
        console.log('  🚿 Min baths:', apiFilters.bathrooms);
      }
      
      if (filters.propertyTypes.length > 0 && filters.propertyTypes.length < 3) {
        apiFilters.propertyTypes = filters.propertyTypes.join(',');
        console.log('  🏠 Property types:', apiFilters.propertyTypes);
      }
      
      if (filters.status && filters.status !== "Active") {
        apiFilters.status = filters.status;
        console.log('  📊 Status:', apiFilters.status);
      }
      
      if (filters.mlsSearch.trim()) {
        apiFilters.search = filters.mlsSearch.trim();
        console.log('  🔍 Search term:', apiFilters.search);
      }

      // 🆕 SUPERPOWER: Auto-discover and validate special filters with AI
      if (filters.sellerFinancing || filters.primaryView || filters.currentPrice) {
        console.log('🦸‍♂️ Discovering MLS field names for special filters...');
        
        // Discover fields if not already cached
        if (!discoveredFields) {
          const fields = await discoverMLSFields();
          setDiscoveredFields(fields);
          console.log('✨ Discovered fields:', fields);
        }
        
        // Use discovered fields or cached ones
        const fields = discoveredFields || await discoverMLSFields();
        
        if (filters.sellerFinancing && fields.sellerFinancingField) {
          apiFilters.sellerFinancing = true;
          apiFilters.sellerFinancingFieldName = fields.sellerFinancingField; // 🆕 Pass field name
          console.log(`  💵 Seller financing: Yes (using field: ${fields.sellerFinancingField})`);
        } else if (filters.sellerFinancing) {
          console.warn('  ⚠️ Seller financing requested but field not found in MLS');
        }
        
        if (filters.primaryView && fields.viewField) {
          apiFilters.primaryView = true;
          apiFilters.viewFieldName = fields.viewField; // 🆕 Pass field name
          console.log(`  👁️ Primary view: Yes (using field: ${fields.viewField})`);
        } else if (filters.primaryView) {
          console.warn('  ⚠️ Primary view requested but field not found in MLS');
        }
        
        if (filters.currentPrice && fields.currentPriceField && fields.originalPriceField) {
          apiFilters.currentPrice = true;
          apiFilters.currentPriceFieldName = fields.currentPriceField; // 🆕 Pass field name
          apiFilters.originalPriceFieldName = fields.originalPriceField; // 🆕 Pass field name
          console.log(`  💲 Current price: Yes (comparing ${fields.currentPriceField} vs ${fields.originalPriceField})`);
        } else if (filters.currentPrice) {
          console.warn('  ⚠️ Current price requested but fields not found in MLS');
        }
      }
      
      setAiOptimizing(false);

      console.log('\n📤 FULL API REQUEST:', apiFilters);

      const mlsProperties: MLSProperty[] = await fetchListings(apiFilters);
      const converted = mlsProperties.map(convertMLSToPropertyCard).filter(p => p.latitude && p.longitude);
      
      setPreviewProperties(converted);
      setTotalCount(mlsProperties.length);
      
      console.log(`✅ Search complete: ${mlsProperties.length} total properties, ${converted.length} with coordinates for map`);
      
      if (mlsProperties.length === 0) {
        console.warn('⚠️ Zero results! Check if filter values match MLS API exactly');
      }
    } catch (err) {
      console.error('❌ Error fetching preview:', err);
      setAiOptimizing(false);
    } finally {
      setLoading(false);
    }
  };

  const parsePrice = (priceStr: string | undefined): number | undefined => {
    if (!priceStr || priceStr === "No Preference") return undefined;
    const cleaned = priceStr.replace(/[$,Million]/g, '').trim();
    const num = parseFloat(cleaned);
    if (isNaN(num)) return undefined;
    return priceStr.includes('Million') ? num * 1000000 : num;
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    // Location filters
    if (filters.zones.length > 0) params.append('zones', filters.zones.join(','));
    if (filters.areas.length > 0) params.append('areas', filters.areas.join(','));
    if (filters.communities.length > 0) params.append('communities', filters.communities.join(','));
    if (filters.subdivisions.length > 0) params.append('subdivisions', filters.subdivisions.join(','));
    
    // Price & Property filters - ONLY if not default values
    if (filters.minPrice && filters.minPrice !== "$50,000") params.append('minPrice', filters.minPrice);
    if (filters.maxPrice && filters.maxPrice !== "$3 Million") params.append('maxPrice', filters.maxPrice);
    if (filters.minBeds && filters.minBeds !== "1+") params.append('beds', filters.minBeds);
    if (filters.minBaths && filters.minBaths !== "Any") params.append('baths', filters.minBaths);
    
    // Only send propertyTypes if not the default 3
    const defaultTypes = ["Condos", "Houses", "Land"];
    const hasNonDefaultTypes = filters.propertyTypes.length !== defaultTypes.length || 
                               !filters.propertyTypes.every(t => defaultTypes.includes(t));
    if (hasNonDefaultTypes) {
      params.append('propertyTypes', filters.propertyTypes.join(','));
    }
    
    // Only send status if not "Active"
    if (filters.status && filters.status !== "Active") params.append('status', filters.status);
    
    // ⭐ Special filters - Properties will apply them client-side via flexMlsService
    if (filters.sellerFinancing) params.append('sellerFinancing', 'true');
    if (filters.primaryView) params.append('primaryView', 'true');
    if (filters.currentPrice) params.append('currentPrice', 'true');
    
    // Search query
    if (filters.mlsSearch.trim()) params.append('search', filters.mlsSearch.trim());

    console.log('🔍 [ADVANCED SEARCH] Navigating to /properties with params:', params.toString());
    navigate(`/properties?${params.toString()}`);
  };

  const handleReset = () => {
    setFilters({
      propertyTypes: ["Condos", "Houses", "Land"],
      status: "Active",
      zones: [],
      areas: [],
      communities: [],
      subdivisions: [],
      sellerFinancing: false,
      primaryView: false,
      currentPrice: false,
      minPrice: "$50,000",
      maxPrice: "$3 Million",
      minBeds: "1+",
      minBaths: "Any",
      mlsSearch: "",
    });
    setPreviewProperties([]);
    setTotalCount(0);
    setUiSearchQuery('');
  };

  const handleMlsSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPreviewWithIntelligence();
  };

  const togglePropertyType = (type: string) => {
    setFilters(prev => ({
      ...prev,
      propertyTypes: prev.propertyTypes.includes(type)
        ? prev.propertyTypes.filter(t => t !== type)
        : [...prev.propertyTypes, type]
    }));
  };

  const toggleZone = (zone: string) => {
    setFilters(prev => {
      const newZones = prev.zones.includes(zone)
        ? prev.zones.filter(z => z !== zone)
        : [...prev.zones, zone];
      
      // ✅ Auto-clear areas that don't belong to selected zones
      let validAreas = [...prev.areas];
      if (newZones.length > 0) {
        const allowedAreas = newZones.flatMap(z => zoneToAreaMap[z] || []);
        validAreas = prev.areas.filter(area => allowedAreas.includes(area));
      }

      // ✅ Auto-clear communities that don't belong to valid areas
      let validCommunities = [...prev.communities];
      if (validAreas.length > 0) {
        const allowedCommunities = validAreas.flatMap(a => areaToCommunityMap[a] || []);
        validCommunities = prev.communities.filter(comm => allowedCommunities.includes(comm));
      } else if (newZones.length > 0) {
        const allowedAreas = newZones.flatMap(z => zoneToAreaMap[z] || []);
        const allowedCommunities = allowedAreas.flatMap(a => areaToCommunityMap[a] || []);
        validCommunities = prev.communities.filter(comm => allowedCommunities.includes(comm));
      }

      // ✅ Auto-clear subdivisions that don't belong to valid communities
      let validSubdivisions = [...prev.subdivisions];
      if (validCommunities.length > 0) {
        const allowedSubdivisions = validCommunities.flatMap(c => communityToSubdivisionMap[c] || []);
        validSubdivisions = prev.subdivisions.filter(sub => allowedSubdivisions.includes(sub));
      }
      
      return {
        ...prev,
        zones: newZones,
        areas: validAreas,
        communities: validCommunities,
        subdivisions: validSubdivisions
      };
    });
  };

  const toggleArea = (area: string) => {
    setFilters(prev => {
      const newAreas = prev.areas.includes(area)
        ? prev.areas.filter(a => a !== area)
        : [...prev.areas, area];
      
      // ✅ Auto-clear communities that don't belong to selected areas
      let validCommunities = [...prev.communities];
      if (newAreas.length > 0) {
        const allowedCommunities = newAreas.flatMap(a => areaToCommunityMap[a] || []);
        validCommunities = prev.communities.filter(comm => allowedCommunities.includes(comm));
      }

      // ✅ Auto-clear subdivisions that don't belong to valid communities
      let validSubdivisions = [...prev.subdivisions];
      if (validCommunities.length > 0) {
        const allowedSubdivisions = validCommunities.flatMap(c => communityToSubdivisionMap[c] || []);
        validSubdivisions = prev.subdivisions.filter(sub => allowedSubdivisions.includes(sub));
      }
      
      return {
        ...prev,
        areas: newAreas,
        communities: validCommunities,
        subdivisions: validSubdivisions
      };
    });
  };

  const toggleCommunity = (community: string) => {
    setFilters(prev => {
      const newCommunities = prev.communities.includes(community)
        ? prev.communities.filter(c => c !== community)
        : [...prev.communities, community];
      
      // ✅ Auto-clear subdivisions that don't belong to selected communities
      let validSubdivisions = [...prev.subdivisions];
      if (newCommunities.length > 0) {
        const allowedSubdivisions = newCommunities.flatMap(c => communityToSubdivisionMap[c] || []);
        validSubdivisions = prev.subdivisions.filter(sub => allowedSubdivisions.includes(sub));
      }
      
      return {
        ...prev,
        communities: newCommunities,
        subdivisions: validSubdivisions
      };
    });
  };

  const toggleSubdivision = (subdivision: string) => {
    setFilters(prev => ({
      ...prev,
      subdivisions: prev.subdivisions.includes(subdivision)
        ? prev.subdivisions.filter(s => s !== subdivision)
        : [...prev.subdivisions, subdivision]
    }));
  };

  const mapCenter = previewProperties.length > 0
    ? {
        lat: previewProperties.reduce((sum, p) => sum + p.latitude, 0) / previewProperties.length,
        lng: previewProperties.reduce((sum, p) => sum + p.longitude, 0) / previewProperties.length
      }
    : { lat: 23.0545, lng: -109.7084 };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header Bar with AI Intelligence Indicator */}
      <div className="fixed top-16 left-0 right-0 bg-card border-b border-border z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/properties')}>
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
            <div>
              <h1 className="text-xl font-bold">Advanced Property Search</h1>
              <p className="text-sm text-muted-foreground">
                {loading ? 'Searching...' : totalCount > 0 ? `${totalCount} properties found` : 'Select filters or search MLS'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button 
              onClick={handleSearch} 
              disabled={totalCount === 0}
              className={totalCount > 0 ? "bg-green-600 hover:bg-green-700 text-white" : ""}
            >
              <Search className="w-4 h-4 mr-2" />
              View {totalCount} Results
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-32 flex h-screen">
        {/* Left Sidebar - Filters */}
        <div className="w-96 bg-card border-r border-border overflow-y-auto p-6 space-y-6 h-[calc(100vh-8rem)]">
          
          {/* MLS Search Bar */}
          <div className="sticky top-0 bg-card z-10 pb-4 -mt-2 border-b border-border">
            <Label className="text-lg font-bold mb-3 block">Search MLS Database</Label>
            <form onSubmit={handleMlsSearch}>
              <div className="relative">
                <Input
                  type="text"
                  value={filters.mlsSearch}
                  onChange={(e) => setFilters(prev => ({ ...prev, mlsSearch: e.target.value }))}
                  placeholder="Search by address, MLS#, location..."
                  className="w-full pl-10 pr-10"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                {filters.mlsSearch && (
                  <button
                    type="button"
                    onClick={() => setFilters(prev => ({ ...prev, mlsSearch: '' }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* UI Filter Search */}
          <div className="pb-4">
            <Label className="text-sm font-medium mb-2 block text-muted-foreground">Filter Checkboxes</Label>
            <div className="relative">
              <Input
                type="text"
                value={uiSearchQuery}
                onChange={(e) => setUiSearchQuery(e.target.value)}
                placeholder="Filter zones, areas, communities..."
                className="w-full pl-10 pr-10 text-sm"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              {uiSearchQuery && (
                <button
                  onClick={() => setUiSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Property Types */}
          <div>
            <Label className="text-lg font-bold mb-3 block">Property Type</Label>
            <div className="space-y-2">
              {propertyTypes.map(type => (
                <div key={type} className="flex items-center gap-2">
                  <Checkbox
                    id={`type-${type}`}
                    checked={filters.propertyTypes.includes(type)}
                    onCheckedChange={() => togglePropertyType(type)}
                  />
                  <Label htmlFor={`type-${type}`} className="cursor-pointer">{type}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <Label className="text-lg font-bold mb-3 block">Status</Label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full border border-border rounded px-3 py-2"
            >
              <option>Active</option>
              <option>Pending</option>
              <option>Closed</option>
            </select>
          </div>

          {/* Zones */}
          <div>
            <Label className="text-lg font-bold mb-3 block">
              Zone ({filters.zones.length} selected)
            </Label>
            <div className="max-h-48 overflow-y-auto space-y-2 border border-border rounded p-3">
              {filteredZones.map(zone => (
                <div key={zone} className="flex items-center gap-2">
                  <Checkbox
                    id={`zone-${zone}`}
                    checked={filters.zones.includes(zone)}
                    onCheckedChange={() => toggleZone(zone)}
                  />
                  <Label htmlFor={`zone-${zone}`} className="cursor-pointer text-sm">{zone}</Label>
                </div>
              ))}
              {filteredZones.length === 0 && uiSearchQuery && (
                <p className="text-sm text-muted-foreground italic py-2">No zones match "{uiSearchQuery}"</p>
              )}
            </div>
          </div>

          {/* Areas */}
          <div>
            <Label className="text-lg font-bold mb-3 block">
              Area ({filters.areas.length} selected)
            </Label>
            {filters.zones.length > 0 && (
              <p className="text-xs text-blue-600 mb-2">
                ✓ Showing areas for: {filters.zones.join(", ")}
              </p>
            )}
            <div className="max-h-48 overflow-y-auto space-y-2 border border-border rounded p-3">
              {filteredAreas.length > 0 ? (
                filteredAreas.map(area => (
                  <div key={area} className="flex items-center gap-2">
                    <Checkbox
                      id={`area-${area}`}
                      checked={filters.areas.includes(area)}
                      onCheckedChange={() => toggleArea(area)}
                    />
                    <Label htmlFor={`area-${area}`} className="cursor-pointer text-sm">{area}</Label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic py-2">
                  {filters.zones.length > 0 
                    ? "No areas available for selected zone(s)" 
                    : uiSearchQuery 
                      ? `No areas match "${uiSearchQuery}"`
                      : "Select a zone first to see areas"}
                </p>
              )}
            </div>
          </div>

          {/* Communities */}
          <div>
            <Label className="text-lg font-bold mb-3 block">
              Community ({filters.communities.length} selected)
            </Label>
            {(filters.zones.length > 0 || filters.areas.length > 0) && (
              <p className="text-xs text-blue-600 mb-2">
                ✓ Filtered by: {filters.areas.length > 0 ? filters.areas.join(", ") : filters.zones.join(", ")}
              </p>
            )}
            <div className="max-h-48 overflow-y-auto space-y-2 border border-border rounded p-3">
              {filteredCommunities.length > 0 ? (
                filteredCommunities.map(community => (
                  <div key={community} className="flex items-center gap-2">
                    <Checkbox
                      id={`community-${community}`}
                      checked={filters.communities.includes(community)}
                      onCheckedChange={() => toggleCommunity(community)}
                    />
                    <Label htmlFor={`community-${community}`} className="cursor-pointer text-sm">{community}</Label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic py-2">
                  {filters.areas.length > 0 || filters.zones.length > 0
                    ? "No communities available for selected zone(s)/area(s)" 
                    : uiSearchQuery 
                      ? `No communities match "${uiSearchQuery}"`
                      : "Select a zone or area to see communities"}
                </p>
              )}
            </div>
          </div>

          {/* Subdivisions */}
          <div>
            <Label className="text-lg font-bold mb-3 block">
              Subdivision ({filters.subdivisions.length} selected)
            </Label>
            {(filters.zones.length > 0 || filters.areas.length > 0 || filters.communities.length > 0) && (
              <p className="text-xs text-blue-600 mb-2">
                ✓ Filtered by: {
                  filters.communities.length > 0 
                    ? filters.communities.join(", ") 
                    : filters.areas.length > 0 
                      ? filters.areas.join(", ")
                      : filters.zones.join(", ")
                }
              </p>
            )}
            <div className="max-h-48 overflow-y-auto space-y-2 border border-border rounded p-3">
              {filteredSubdivisions.length > 0 ? (
                filteredSubdivisions.map(subdivision => (
                  <div key={subdivision} className="flex items-center gap-2">
                    <Checkbox
                      id={`subdivision-${subdivision}`}
                      checked={filters.subdivisions.includes(subdivision)}
                      onCheckedChange={() => toggleSubdivision(subdivision)}
                    />
                    <Label htmlFor={`subdivision-${subdivision}`} className="cursor-pointer text-sm">{subdivision}</Label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic py-2">
                  {filters.communities.length > 0 || filters.areas.length > 0 || filters.zones.length > 0
                    ? "No subdivisions available for selected filters" 
                    : uiSearchQuery 
                      ? `No subdivisions match "${uiSearchQuery}"`
                      : "Select zone/area/community to see subdivisions"}
                </p>
              )}
            </div>
          </div>

          {/* Special Filter Checkboxes */}
          <div>
            <Label className="text-lg font-bold mb-3 block">Special Filters</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="seller-financing"
                  checked={filters.sellerFinancing}
                  onCheckedChange={(checked) => setFilters({ ...filters, sellerFinancing: checked as boolean })}
                />
                <Label htmlFor="seller-financing" className="cursor-pointer text-sm">
                  Seller Financing Offered?
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="primary-view"
                  checked={filters.primaryView}
                  onCheckedChange={(checked) => setFilters({ ...filters, primaryView: checked as boolean })}
                />
                <Label htmlFor="primary-view" className="cursor-pointer text-sm">
                  Primary View
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="current-price"
                  checked={filters.currentPrice}
                  onCheckedChange={(checked) => setFilters({ ...filters, currentPrice: checked as boolean })}
                />
                <Label htmlFor="current-price" className="cursor-pointer text-sm">
                  Current Price
                </Label>
              </div>
            </div>
          </div>

          {/* Price Range */}
          <div>
            <Label className="text-lg font-bold mb-3 block">Price Range</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Min Price</Label>
                <select
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  className="w-full border border-border rounded px-3 py-2 text-sm"
                >
                  {priceOptions.map(price => (
                    <option key={price} value={price}>{price}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Max Price</Label>
                <select
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  className="w-full border border-border rounded px-3 py-2 text-sm"
                >
                  {priceOptions.map(price => (
                    <option key={price} value={price}>{price}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Beds & Baths */}
          <div>
            <Label className="text-lg font-bold mb-3 block">Bedrooms & Bathrooms</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Min Beds</Label>
                <select
                  value={filters.minBeds}
                  onChange={(e) => setFilters({ ...filters, minBeds: e.target.value })}
                  className="w-full border border-border rounded px-3 py-2 text-sm"
                >
                  {bedsOptions.map(beds => (
                    <option key={beds} value={beds}>{beds}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Min Baths</Label>
                <select
                  value={filters.minBaths}
                  onChange={(e) => setFilters({ ...filters, minBaths: e.target.value })}
                  className="w-full border border-border rounded px-3 py-2 text-sm"
                >
                  {bathsOptions.map(baths => (
                    <option key={baths} value={baths}>{baths}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Live Map Preview */}
        <div className="flex-1 relative">
          {(loading || aiOptimizing) && (
            <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-accent mb-4 mx-auto" />
                <p className="text-muted-foreground">
                  {aiOptimizing ? 'Optimizing search with AI...' : 'Searching MLS...'}
                </p>
              </div>
            </div>
          )}
          
          {previewProperties.length > 0 ? (
            <LeafletPropertyMap
              properties={previewProperties}
              center={mapCenter}
              zoom={11}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-secondary">
              <div className="text-center max-w-md px-6">
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-2xl font-bold mb-2">Advanced Search</h2>
                <p className="text-muted-foreground mb-4">
                  Use the search bar above to search by address, MLS number, or location. Or select filters from the checkboxes to preview properties on the map.
                </p>
                <p className="text-sm text-muted-foreground">
                  The map updates automatically as you check/uncheck filters!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;