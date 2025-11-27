// src/pages/AdvancedSearch.tsx - Full-page filter experience with live map
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import LeafletPropertyMap from "@/components/LeafletPropertyMap";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Search, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { fetchListings, convertMLSToPropertyCard, type MLSProperty } from "@/services/flexMlsService";

interface FilterState {
  propertyTypes: string[];
  status: string;
  zones: string[];
  areas: string[];
  communities: string[];
  subdivisions: string[];
  minPrice: string;
  maxPrice: string;
  minBeds: string;
  minBaths: string;
  sellerFinancing: boolean;
  primaryView: boolean;
  currentPrice: boolean;
}
const AdvancedSearch = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<FilterState>({
    propertyTypes: ["Condos", "Houses", "Land"],
    status: "Active",
    zones: [],
    areas: [],
    communities: [],
    subdivisions: [],
    minPrice: "$50,000",
    maxPrice: "$3 Million",
    minBeds: "1+",
    minBaths: "Any",
    sellerFinancing: false,
    primaryView: false,
    currentPrice: false,
  });

  const [previewProperties, setPreviewProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    propertyType: true,
    status: true,
    zone: false,
    area: false,
    community: false,
    subdivision: false,
    price: true,
    bedsBaths: true,
    other: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  // Property data
  const propertyTypes = ["Condos", "Houses", "Land", "Commercial", "Fractional", "MultiFamily"];
  
  const zones = [
    "Cabo Corridor", "Cabo San Lucas", "Comondu", "East Cape", "La Paz",
    "Loreto", "Mulege", "Pacific", "San Jose Corridor", "San Jose del Cabo"
  ];

  const areas = [
    "Bay of Dreams", "Cd. Constitución", "Cerro Colorado", "Constitucion", "CSL Cor-Inland",
    "CSL-Beach & Marina", "CSL-Centro", "CSL-Corr. Oceanside", "CSL-North", "East Cape North",
    "East Cape South", "Ejidos", "El Centenario", "El Sargento", "Excondido South",
    "Insurgentes", "La Paz City", "La Ventana", "LaPaz Beach", "Loreto",
    "Los Planes", "Mag Bay", "Mid Pacific", "Mulege", "Nopolo",
    "North Shore", "Pacific North", "Pacific South", "San Juan de la Costa", "San Pedro",
    "Scorpion Bay", "SJD Corr-Inland", "SJD Corr-Oceanside", "SJD-Beachside", "SJD-Centro",
    "SJD-East", "SJD-Inland/Golf", "SJD-North", "South Shore"
  ];

  const communities = [
    "Above Isla Coronado", "Agua Verde", "Bahia Concepcion", "Bahía Asunción", "Bay of Dreams",
    "BayOfDreams/Ventanas", "Beach north", "Bellavista", "BuenaVista/Rancho Leonero", "BuenVsta/LosBarilles",
    "Cabo Bello/Santa Carmela", "Cabo del Sol", "Cabo del Sol Viejo", "Cabo del Sol-Inland", "Cabo Real-Inland",
    "Cabo Real-Ocean Side", "Centro", "Centro- Cabo San Lucas", "Centro- La Paz", "Centro- San Jose del Cabo",
    "Cerro Colorado-Ocean", "CerroColorado-Inland", "Chametla", "Chileno Bay", "Chileno Bay Club",
    "Chileno Bay/Montage", "Chileno/Montage-Inland", "Ciudad Constitución", "Club Campestre", "Colina del Sol",
    "Comitan", "Conquista Agraria", "Constitucion Community", "Costa Azul Beach", "Costa Palmas",
    "CSL Beach", "CSL Country Club", "CSL Marina", "CSL Near Bch & Marina", "CSL North-East 19",
    "CSL North-West 19", "Danzante Bay", "Diamante Cabo San Lucas", "Ejido La Purisima", "Ejido Next South",
    "Ejidos/ Comondu", "El Aguajito", "El Centenario", "El Comitan", "El Dorado",
    "El Encanto & Laguna", "El Jalito", "El Jaral", "El Mogote", "El Rincon",
    "El Sargento", "El Teso", "El Tezal-East", "El Tezal-OceanSide", "El Tezal-West",
    "El Tule-Inland", "El Tule-Ocean Side", "ElCardonal/N of Bariles", "Elias Calles", "Ensenada Blanca",
    "Espiritu del Mar", "Esterito", "Fidepaz", "Fonatur Golf & Hills", "Forjadores SJD",
    "Gringo & Lito Hills", "Hot Springs", "Insurgentes Community", "La Perla", "La Posada",
    "La Ribera", "La Ventana", "Ladera San José", "LaPaz Beach Community", "LaPaz Centro Community",
    "LaPaz East", "LaPaz North Community", "LaPaz West", "Ligui", "Lopez Mateos",
    "Loreto", "Loreto Bay", "Los Planes", "Magisterial / Infonavit", "Maravilla",
    "Mesa Colorada", "Migrino Area", "Miraflores/Santiago", "Miramar", "Misiones",
    "Mulege", "Nopolo", "Nopolo Hills", "North Centro", "North Loreto Bay",
    "North Shore", "Palmilla-Inland", "Palmilla-Ocean Side", "Pedregal CSL", "Pedregal de La Paz",
    "Pescadero/Cerritos", "Pto. Escondido", "Puerta Bugambilias", "Puerto Los Cabos", "Punta Ballena",
    "Querencia-Inland", "Querencia-Ocean side", "Quivira", "Rancho San Lucas", "Saddles/Sunset Bch Rd",
    "San Bartolo", "San Cosme", "San Cristobal", "San Juan de la Costa", "San Juanico",
    "San Pedro", "Santa Rosalia", "Santo Domingo", "Second Town Name", "SJD above Hwy 1",
    "SJD Downtown", "SJD Marina", "SJD North-E of 1", "SJD North-W of 1", "SJD-Beach",
    "South", "South LaPaz Community", "Todos Santos", "Todos Santos North", "Uptown/Border Rd",
    "Villas Gp. Development", "Vinorama/Cabo Pulmo", "Zacatitos/PtaPerfcta", "Zaragoza"
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
  // Load filters from URL on mount (handles back button, bookmarks, direct links)
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

    if (urlZones || urlAreas || urlCommunities || urlSubdivisions) {
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
      }));
    }
  }, []);

  // Live preview: Fetch properties when filters change
  useEffect(() => {
    const debounce = setTimeout(() => {
      if (filters.zones.length > 0 || filters.areas.length > 0 || 
          filters.communities.length > 0 || filters.subdivisions.length > 0) {
        fetchPreview();
      } else {
        setPreviewProperties([]);
        setTotalCount(0);
      }
    }, 1000);

    return () => clearTimeout(debounce);
  }, [filters]);

  const fetchPreview = async () => {
    setLoading(true);
    try {
      const apiFilters: any = {};
      
      if (filters.zones.length > 0) apiFilters.city = filters.zones;
      if (filters.areas.length > 0) apiFilters.areas = filters.areas;
      if (filters.communities.length > 0) apiFilters.communities = filters.communities;
      if (filters.subdivisions.length > 0) apiFilters.subdivisions = filters.subdivisions;
      if (filters.minPrice !== "No Preference") apiFilters.minPrice = parsePrice(filters.minPrice);
      if (filters.maxPrice !== "No Preference") apiFilters.maxPrice = parsePrice(filters.maxPrice);
      if (filters.minBeds !== "Any") apiFilters.bedrooms = parseInt(filters.minBeds.replace('+', ''));
      if (filters.minBaths !== "Any") apiFilters.bathrooms = parseInt(filters.minBaths.replace('+', ''));
      if (filters.propertyTypes.length > 0) apiFilters.propertyTypes = filters.propertyTypes;
      if (filters.status) apiFilters.status = filters.status;
      if (filters.sellerFinancing) apiFilters.sellerFinancing = true;
      if (filters.primaryView) apiFilters.primaryView = true;
      if (filters.currentPrice) apiFilters.currentPrice = true;

      console.log('🔍 [SEARCH] Filters being sent to API:', apiFilters);

      const mlsProperties: MLSProperty[] = await fetchListings(apiFilters);
      const converted = mlsProperties.map(convertMLSToPropertyCard).filter(p => p.latitude && p.longitude);
      
      setPreviewProperties(converted);
      setTotalCount(mlsProperties.length);
      
      console.log(`✅ [SEARCH] Found ${mlsProperties.length} properties, ${converted.length} with coordinates`);
    } catch (err) {
      console.error('Error fetching preview:', err);
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
      minPrice: "$50,000",
      maxPrice: "$3 Million",
      minBeds: "1+",
      minBaths: "Any",
      sellerFinancing: false,
      primaryView: false,
      currentPrice: false,
    });
    setPreviewProperties([]);
    setTotalCount(0);
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
    return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header Bar */}
      <div className="fixed top-16 left-0 right-0 bg-card border-b border-border z-40 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/properties')}>
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
            <div>
              <h1 className="text-xl font-bold">Advanced Property Search</h1>
              <p className="text-sm text-muted-foreground">
                {loading ? 'Searching...' : totalCount > 0 ? `${totalCount} properties found` : 'Select filters to preview'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button onClick={handleSearch} disabled={totalCount === 0}>
              <Search className="w-4 h-4 mr-2" />
              View {totalCount} Results
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-32 flex h-screen">
        {/* Left Sidebar - Filters */}
        <div className="w-96 bg-card border-r border-border overflow-y-auto p-6 space-y-4 h-[calc(100vh-8rem)]">
          
          {/* Property Types - Collapsible */}
          <div className="border-b border-border pb-4">
            <button
              onClick={() => toggleSection('propertyType')}
              className="flex items-center justify-between w-full text-left mb-3"
            >
              <Label className="text-lg font-bold">Property Type</Label>
              {expandedSections.propertyType ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
            {expandedSections.propertyType && (
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
            )}
          </div>

          {/* Status - Collapsible */}
          <div className="border-b border-border pb-4">
            <button
              onClick={() => toggleSection('status')}
              className="flex items-center justify-between w-full text-left mb-3"
            >
              <Label className="text-lg font-bold">Status</Label>
              {expandedSections.status ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
            {expandedSections.status && (
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full border border-border rounded px-3 py-2"
              >
                <option>Active</option>
                <option>Pending</option>
                <option>Closed</option>
              </select>
            )}
          </div>

          {/* Zones - Collapsible */}
          <div className="border-b border-border pb-4">
            <button
              onClick={() => toggleSection('zone')}
              className="flex items-center justify-between w-full text-left mb-3"
            >
              <Label className="text-lg font-bold">
                Zone ({filters.zones.length} selected)
              </Label>
              {expandedSections.zone ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
            {expandedSections.zone && (
              <div className="max-h-48 overflow-y-auto space-y-2 border border-border rounded p-3">
                {zones.map(zone => (
                  <div key={zone} className="flex items-center gap-2">
                    <Checkbox
                      id={`zone-${zone}`}
                      checked={filters.zones.includes(zone)}
                      onCheckedChange={() => toggleZone(zone)}
                    />
                    <Label htmlFor={`zone-${zone}`} className="cursor-pointer text-sm">{zone}</Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Areas - Collapsible */}
          <div className="border-b border-border pb-4">
            <button
              onClick={() => toggleSection('area')}
              className="flex items-center justify-between w-full text-left mb-3"
            >
              <Label className="text-lg font-bold">
                Area ({filters.areas.length} selected)
              </Label>
              {expandedSections.area ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
            {expandedSections.area && (
              <div className="max-h-48 overflow-y-auto space-y-2 border border-border rounded p-3">
                {areas.map(area => (
                  <div key={area} className="flex items-center gap-2">
                    <Checkbox
                      id={`area-${area}`}
                      checked={filters.areas.includes(area)}
                      onCheckedChange={() => toggleArea(area)}
                    />
                    <Label htmlFor={`area-${area}`} className="cursor-pointer text-sm">{area}</Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Communities - Collapsible */}
          <div className="border-b border-border pb-4">
            <button
              onClick={() => toggleSection('community')}
              className="flex items-center justify-between w-full text-left mb-3"
            >
              <Label className="text-lg font-bold">
                Community ({filters.communities.length} selected)
              </Label>
              {expandedSections.community ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
            {expandedSections.community && (
              <div className="max-h-48 overflow-y-auto space-y-2 border border-border rounded p-3">
                {communities.map(community => (
                  <div key={community} className="flex items-center gap-2">
                    <Checkbox
                      id={`community-${community}`}
                      checked={filters.communities.includes(community)}
                      onCheckedChange={() => toggleCommunity(community)}
                    />
                    <Label htmlFor={`community-${community}`} className="cursor-pointer text-sm">{community}</Label>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Subdivisions - Collapsible */}
          <div className="border-b border-border pb-4">
            <button
              onClick={() => toggleSection('subdivision')}
              className="flex items-center justify-between w-full text-left mb-3"
            >
              <Label className="text-lg font-bold">
                Subdivision ({filters.subdivisions.length} selected)
              </Label>
              {expandedSections.subdivision ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
            {expandedSections.subdivision && (
              <div className="max-h-48 overflow-y-auto space-y-2 border border-border rounded p-3">
                {subdivisions.map(subdivision => (
                  <div key={subdivision} className="flex items-center gap-2">
                    <Checkbox
                      id={`subdivision-${subdivision}`}
                      checked={filters.subdivisions.includes(subdivision)}
                      onCheckedChange={() => toggleSubdivision(subdivision)}
                    />
                    <Label htmlFor={`subdivision-${subdivision}`} className="cursor-pointer text-sm">{subdivision}</Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Price Range - Collapsible */}
          <div className="border-b border-border pb-4">
            <button
              onClick={() => toggleSection('price')}
              className="flex items-center justify-between w-full text-left mb-3"
            >
              <Label className="text-lg font-bold">Price Range</Label>
              {expandedSections.price ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
            {expandedSections.price && (
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
            )}
          </div>

          {/* Beds & Baths - Collapsible */}
          <div className="border-b border-border pb-4">
            <button
              onClick={() => toggleSection('bedsBaths')}
              className="flex items-center justify-between w-full text-left mb-3"
            >
              <Label className="text-lg font-bold">Bedrooms & Bathrooms</Label>
              {expandedSections.bedsBaths ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
            {expandedSections.bedsBaths && (
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
            )}
          </div>

          {/* Other Options - Collapsible */}
          <div className="border-b border-border pb-4">
            <button
              onClick={() => toggleSection('other')}
              className="flex items-center justify-between w-full text-left mb-3"
            >
              <Label className="text-lg font-bold">Other Options</Label>
              {expandedSections.other ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
            {expandedSections.other && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="sellerFinancing"
                    checked={filters.sellerFinancing}
                    onCheckedChange={(checked) => 
                      setFilters({ ...filters, sellerFinancing: checked as boolean })
                    }
                  />
                  <Label htmlFor="sellerFinancing" className="cursor-pointer">
                    Seller Financing Offered?
                  </Label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="primaryView"
                    checked={filters.primaryView}
                    onCheckedChange={(checked) => 
                      setFilters({ ...filters, primaryView: checked as boolean })
                    }
                  />
                  <Label htmlFor="primaryView" className="cursor-pointer">
                    Primary View
                  </Label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="currentPrice"
                    checked={filters.currentPrice}
                    onCheckedChange={(checked) => 
                      setFilters({ ...filters, currentPrice: checked as boolean })
                    }
                  />
                  <Label htmlFor="currentPrice" className="cursor-pointer">
                    Current Price
                  </Label>
                </div>
              </div>
            )}
          </div>

        </div>
        {/* Right Side - Live Map Preview */}
        <div className="flex-1 relative">
          {loading && (
            <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-accent mb-4 mx-auto" />
                <p className="text-muted-foreground">Updating preview...</p>
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
                <div className="text-6xl mb-4">🗺️</div>
                <h2 className="text-2xl font-bold mb-2">Select Filters to Preview</h2>
                <p className="text-muted-foreground">
                  Choose zones, areas, communities, or subdivisions from the left sidebar to see properties on the map
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