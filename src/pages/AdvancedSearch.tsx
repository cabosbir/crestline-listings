// src/pages/AdvancedSearch.tsx - ENHANCED WITH GROQ INTELLIGENCE
// This version uses AI to learn which filter values work

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import LeafletPropertyMap from "@/components/LeafletPropertyMap";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { X, Search, Loader2, Sparkles, Brain } from "lucide-react";
import { fetchListings, convertMLSToPropertyCard, type MLSProperty } from "@/services/flexMlsService";
import { filterIntelligence } from "@/services/groqFilterIntelligence";

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
  const [showIntelligenceStats, setShowIntelligenceStats] = useState(false);

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

  const propertyTypes = ["Condos", "Houses", "Land", "Commercial", "Fractional", "MultiFamily"];
  
  const zones = [
    "Cabo Corridor", "Cabo San Lucas", "Comondu", "East Cape", "La Paz",
    "Loreto", "Mulege", "Pescadero", "San Jose del Cabo", "Todos Santos"
  ];

  const areas = [
    "Corridor", "Diamante", "Punta Ballena", "Quivira", "San Jose Corridor",
    "Beach & Marina", "Cabo Bello", "Downtown", "El Tezal", "North",
    "Pedregal", "East Cape North", "East Cape South", "La Paz", "Loreto",
    "San Jose Downtown", "San Jose North", "Todos Santos", "Todos Santos South"
  ];

  const communities = [
    "Cabo Bello/Santa Carmela", "Cabo Del Sol", "Chileno Bay/Montage", 
    "El Tezal-East", "Misiones", "BuenVista/LosBarilles", "Palmilla", 
    "Pedregal", "Querencia", "San Jose Corridor", "Ventanas"
  ];

  const subdivisions = [
    "Abasolo", "Alba Residences", "Altamar", "Aqua Viva", "Auberge Residences",
    "Cabo Bello", "Cabo del Sol", "Cabo Real", "Capella Pedregal", "Casa del Mar",
    "Chileno Bay", "Club Campestre", "Copala", "Costa Palmas", "Diamante",
    "El Dorado", "El Encanto", "El Pedregal", "El Tezal", "Esperanza",
    "Fonatur", "Four Seasons", "Fundadores", "Hacienda", "La Laguna",
    "Las Ventanas", "Montage", "One&Only Palmilla", "Palmilla", "Pedregal",
    "Puerto Los Cabos", "Querencia", "Quivira", "Rancho San Lucas", "San Jose Corridor",
    "Santa Maria", "St. Regis", "Ventanas al Paraiso", "Villas del Mar", "Waldorf Astoria"
  ];

  const priceOptions = [
    "No Preference", "$50,000", "$100,000", "$200,000", "$300,000", "$400,000",
    "$500,000", "$600,000", "$700,000", "$800,000", "$900,000", "$1 Million",
    "$1.5 Million", "$2 Million", "$2.5 Million", "$3 Million", "$4 Million",
    "$5 Million", "$7.5 Million", "$10 Million"
  ];

  const bedsOptions = ["Any", "1+", "2+", "3+", "4+", "5+"];
  const bathsOptions = ["Any", "1+", "2+", "3+", "4+", "5+"];

  const matchesUiSearch = (text: string) => {
    if (!uiSearchQuery) return true;
    return text.toLowerCase().includes(uiSearchQuery.toLowerCase());
  };

  const filteredZones = zones.filter(matchesUiSearch);
  const filteredAreas = areas.filter(matchesUiSearch);
  const filteredCommunities = communities.filter(matchesUiSearch);
  const filteredSubdivisions = subdivisions.filter(matchesUiSearch);

  // ENHANCED: Fetch preview with AI optimization
  useEffect(() => {
    const debounce = setTimeout(() => {
      if (filters.zones.length > 0 || filters.areas.length > 0 || 
          filters.communities.length > 0 || filters.subdivisions.length > 0 ||
          filters.mlsSearch.trim() !== "") {
        fetchPreviewWithIntelligence();
      } else {
        setPreviewProperties([]);
        setTotalCount(0);
      }
    }, 1000);

    return () => clearTimeout(debounce);
  }, [filters]);

  const fetchPreviewWithIntelligence = async () => {
    setLoading(true);
    setAiOptimizing(true);
    
    try {
      console.log('🤖 Optimizing filters with AI...');
      
      // Use Groq to optimize the filter values
      const optimizedFilters = await filterIntelligence.optimizeAllFilters({
        zones: filters.zones,
        areas: filters.areas,
        communities: filters.communities,
        subdivisions: filters.subdivisions
      });

      console.log('✨ AI Optimized Filters:', optimizedFilters);
      setAiOptimizing(false);

      // Build API filters with CORRECTED parameter names (singular!)
      const apiFilters: any = {};
      
      if (optimizedFilters.zones.length > 0) {
        apiFilters.city = optimizedFilters.zones.join(',');
        console.log('🏙️ Zones (as city):', apiFilters.city);
      }
      
      if (optimizedFilters.areas.length > 0) {
        // Try both plural and singular - the API might accept either
        apiFilters.areas = optimizedFilters.areas.join(',');
        console.log('📍 Areas:', apiFilters.areas);
      }
      
      if (optimizedFilters.communities.length > 0) {
        apiFilters.communities = optimizedFilters.communities.join(',');
        console.log('🏘️ Communities:', apiFilters.communities);
      }
      
      if (optimizedFilters.subdivisions.length > 0) {
        apiFilters.subdivisions = optimizedFilters.subdivisions.join(',');
        console.log('🏡 Subdivisions:', apiFilters.subdivisions);
      }
      
      if (filters.minPrice !== "No Preference") {
        apiFilters.minPrice = parsePrice(filters.minPrice);
      }
      
      if (filters.maxPrice !== "No Preference") {
        apiFilters.maxPrice = parsePrice(filters.maxPrice);
      }
      
      if (filters.minBeds !== "Any") {
        apiFilters.bedrooms = parseInt(filters.minBeds.replace('+', ''));
      }
      
      if (filters.minBaths !== "Any") {
        apiFilters.bathrooms = parseInt(filters.minBaths.replace('+', ''));
      }
      
      if (filters.propertyTypes.length > 0) {
        apiFilters.propertyTypes = filters.propertyTypes.join(',');
      }
      
      if (filters.status) {
        apiFilters.status = filters.status;
      }
      
      if (filters.mlsSearch.trim()) {
        apiFilters.search = filters.mlsSearch.trim();
      }

      console.log('\n📤 FULL API REQUEST:', apiFilters);

      const mlsProperties: MLSProperty[] = await fetchListings(apiFilters);
      const converted = mlsProperties.map(convertMLSToPropertyCard).filter(p => p.latitude && p.longitude);
      
      setPreviewProperties(converted);
      setTotalCount(mlsProperties.length);
      
      // LEARN: Record the results for future optimization
      if (filters.zones.length > 0) {
        filters.zones.forEach((zone, idx) => {
          filterIntelligence.recordTestResult(
            'zones',
            zone,
            optimizedFilters.zones[idx],
            mlsProperties.length
          );
        });
      }
      
      if (filters.areas.length > 0) {
        filters.areas.forEach((area, idx) => {
          filterIntelligence.recordTestResult(
            'areas',
            area,
            optimizedFilters.areas[idx],
            mlsProperties.length
          );
        });
      }
      
      if (filters.communities.length > 0) {
        filters.communities.forEach((community, idx) => {
          filterIntelligence.recordTestResult(
            'communities',
            community,
            optimizedFilters.communities[idx],
            mlsProperties.length
          );
        });
      }
      
      if (filters.subdivisions.length > 0) {
        filters.subdivisions.forEach((subdivision, idx) => {
          filterIntelligence.recordTestResult(
            'subdivisions',
            subdivision,
            optimizedFilters.subdivisions[idx],
            mlsProperties.length
          );
        });
      }
      
      console.log(`✅ Search complete: ${mlsProperties.length} properties, ${converted.length} with coordinates`);
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
    if (filters.zones.length > 0) params.append('zones', filters.zones.join(','));
    if (filters.areas.length > 0) params.append('areas', filters.areas.join(','));
    if (filters.communities.length > 0) params.append('communities', filters.communities.join(','));
    if (filters.subdivisions.length > 0) params.append('subdivisions', filters.subdivisions.join(','));
    if (filters.minPrice !== "No Preference") params.append('minPrice', filters.minPrice);
    if (filters.maxPrice !== "No Preference") params.append('maxPrice', filters.maxPrice);
    if (filters.minBeds !== "Any") params.append('beds', filters.minBeds);
    if (filters.minBaths !== "Any") params.append('baths', filters.minBaths);
    if (filters.propertyTypes.length > 0) params.append('propertyTypes', filters.propertyTypes.join(','));
    if (filters.status) params.append('status', filters.status);
    if (filters.mlsSearch.trim()) params.append('search', filters.mlsSearch.trim());

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
    setFilters(prev => ({
      ...prev,
      zones: prev.zones.includes(zone)
        ? prev.zones.filter(z => z !== zone)
        : [...prev.zones, zone]
    }));
  };

  const toggleArea = (area: string) => {
    setFilters(prev => ({
      ...prev,
      areas: prev.areas.includes(area)
        ? prev.areas.filter(a => a !== area)
        : [...prev.areas, area]
    }));
  };

  const toggleCommunity = (community: string) => {
    setFilters(prev => ({
      ...prev,
      communities: prev.communities.includes(community)
        ? prev.communities.filter(c => c !== community)
        : [...prev.communities, community]
    }));
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

  const stats = filterIntelligence.getStatistics();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header Bar with AI Intelligence Indicator */}
      <div className="fixed top-16 left-0 right-0 bg-card border-b border-border z-40 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/properties')}>
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">Advanced Property Search</h1>
                {aiOptimizing && (
                  <div className="flex items-center gap-1 text-purple-600 text-sm">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span>AI Optimizing...</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {loading ? 'Searching...' : totalCount > 0 ? `${totalCount} properties found` : 'Select filters or search MLS'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowIntelligenceStats(!showIntelligenceStats)}
            >
              <Brain className="w-4 h-4 mr-2" />
              AI Stats
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button onClick={handleSearch} disabled={totalCount === 0}>
              <Search className="w-4 h-4 mr-2" />
              View {totalCount} Results
            </Button>
          </div>
        </div>
        
        {/* AI Intelligence Stats Panel */}
        {showIntelligenceStats && (
          <div className="border-t border-border bg-purple-50 p-4">
            <div className="container mx-auto">
              <h3 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Filter Intelligence Stats
              </h3>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-semibold">Zones</div>
                  <div className="text-green-600">{stats.zones.working} working</div>
                  <div className="text-red-600">{stats.zones.notWorking} not working</div>
                </div>
                <div>
                  <div className="font-semibold">Areas</div>
                  <div className="text-green-600">{stats.areas.working} working</div>
                  <div className="text-red-600">{stats.areas.notWorking} not working</div>
                </div>
                <div>
                  <div className="font-semibold">Communities</div>
                  <div className="text-green-600">{stats.communities.working} working</div>
                  <div className="text-red-600">{stats.communities.notWorking} not working</div>
                </div>
                <div>
                  <div className="font-semibold">Subdivisions</div>
                  <div className="text-green-600">{stats.subdivisions.working} working</div>
                  <div className="text-red-600">{stats.subdivisions.notWorking} not working</div>
                </div>
              </div>
              <div className="mt-2 flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    const data = filterIntelligence.exportLearning();
                    const blob = new Blob([data], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'filter-intelligence.json';
                    a.click();
                  }}
                >
                  Export Learning Data
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => {
                    if (confirm('Clear all learned filter data?')) {
                      filterIntelligence.clearLearning();
                      setShowIntelligenceStats(false);
                    }
                  }}
                >
                  Clear Learning
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rest of the component stays the same... */}
      {/* Main Content */}
      <div className="pt-32 flex h-screen">
        {/* Left Sidebar - Filters */}
        <div className="w-96 bg-card border-r border-border overflow-y-auto p-6 space-y-6 h-[calc(100vh-8rem)]">
          
          {/* MLS Search Bar */}
          <div className="sticky top-0 bg-card z-10 pb-4 -mt-2 border-b border-border">
            <Label className="text-lg font-bold mb-3 block flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              AI-Powered MLS Search
            </Label>
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
            <p className="mt-2 text-xs text-purple-600 flex items-center gap-1">
              <Brain className="w-3 h-3" />
              AI learns which filters work best
            </p>
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
            <div className="max-h-48 overflow-y-auto space-y-2 border border-border rounded p-3">
              {filteredAreas.map(area => (
                <div key={area} className="flex items-center gap-2">
                  <Checkbox
                    id={`area-${area}`}
                    checked={filters.areas.includes(area)}
                    onCheckedChange={() => toggleArea(area)}
                  />
                  <Label htmlFor={`area-${area}`} className="cursor-pointer text-sm">{area}</Label>
                </div>
              ))}
              {filteredAreas.length === 0 && uiSearchQuery && (
                <p className="text-sm text-muted-foreground italic py-2">No areas match "{uiSearchQuery}"</p>
              )}
            </div>
          </div>

          {/* Communities */}
          <div>
            <Label className="text-lg font-bold mb-3 block">
              Community ({filters.communities.length} selected)
            </Label>
            <div className="max-h-48 overflow-y-auto space-y-2 border border-border rounded p-3">
              {filteredCommunities.map(community => (
                <div key={community} className="flex items-center gap-2">
                  <Checkbox
                    id={`community-${community}`}
                    checked={filters.communities.includes(community)}
                    onCheckedChange={() => toggleCommunity(community)}
                  />
                  <Label htmlFor={`community-${community}`} className="cursor-pointer text-sm">{community}</Label>
                </div>
              ))}
              {filteredCommunities.length === 0 && uiSearchQuery && (
                <p className="text-sm text-muted-foreground italic py-2">No communities match "{uiSearchQuery}"</p>
              )}
            </div>
          </div>

          {/* Subdivisions */}
          <div>
            <Label className="text-lg font-bold mb-3 block">
              Subdivision ({filters.subdivisions.length} selected)
            </Label>
            <div className="max-h-48 overflow-y-auto space-y-2 border border-border rounded p-3">
              {filteredSubdivisions.map(subdivision => (
                <div key={subdivision} className="flex items-center gap-2">
                  <Checkbox
                    id={`subdivision-${subdivision}`}
                    checked={filters.subdivisions.includes(subdivision)}
                    onCheckedChange={() => toggleSubdivision(subdivision)}
                  />
                  <Label htmlFor={`subdivision-${subdivision}`} className="cursor-pointer text-sm">{subdivision}</Label>
                </div>
              ))}
              {filteredSubdivisions.length === 0 && uiSearchQuery && (
                <p className="text-sm text-muted-foreground italic py-2">No subdivisions match "{uiSearchQuery}"</p>
              )}
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
                  {aiOptimizing ? '🤖 AI optimizing filters...' : 'Searching MLS...'}
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
                <h2 className="text-2xl font-bold mb-2">AI-Powered Search</h2>
                <p className="text-muted-foreground mb-4">
                  Use the search bar above to search by address, MLS number, or location. Or select filters from the checkboxes to preview properties on the map.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-purple-600">
                  <Brain className="w-4 h-4" />
                  <span>AI learns which filters work best over time</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;
