// src/components/AdvancedPropertyFilters.tsx - Complete Fixed Version WITH DYNAMIC COUNT
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Search, SlidersHorizontal, X } from "lucide-react";

interface FilterState {
  searchQuery: string;
  mlsNumber: string;
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
  minSqft: string;
  yearBuilt: string;
  sellerFinancing: boolean;
  primaryView: boolean;
  currentPrice: boolean;
}

interface AdvancedPropertyFiltersProps {
  onApplyFilters: (filters: FilterState, searchQuery?: string) => void;
  onReset: () => void;
  resultCount?: number; // 🔥 NEW: Dynamic count from API
  totalCount?: number;  // 🔥 NEW: Total available in database
}

const AdvancedPropertyFilters = ({ 
  onApplyFilters, 
  onReset,
  resultCount = 0,     // 🔥 NEW: Default 0
  totalCount = 4528    // 🔥 NEW: Default total
}: AdvancedPropertyFiltersProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [showAllZones, setShowAllZones] = useState(false);
  const [showAllAreas, setShowAllAreas] = useState(false);
  const [showAllCommunities, setShowAllCommunities] = useState(false);
  const [showAllSubdivisions, setShowAllSubdivisions] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: "",
    mlsNumber: "",
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
    minSqft: "No Preference",
    yearBuilt: "No Preference",
    sellerFinancing: false,
    primaryView: false,
    currentPrice: false,
  });

  const propertyTypes = [
    "Condos",
    "Houses", 
    "Land",
    "Commercial",
    "Fractional",
    "MultiFamily"
  ];

  const statusOptions = [
    "Active",
    "Pending",
    "Closed",
    "Expired",
    "Withdrawn",
    "Cancelled"
  ];

  const zones = [
    "Cabo Corridor",
    "Cabo San Lucas",
    "Comondu",
    "East Cape",
    "La Paz",
    "Loreto",
    "Mulege",
    "Pacific",
    "San Jose Corridor",
    "San Jose del Cabo"
  ];

  const areas = [
    "Bay of Dreams",
    "Cd. Constitución",
    "Cerro Colorado",
    "Constitucion",
    "CSL Cor-Inland",
    "CSL-Beach & Marina",
    "CSL-Centro",
    "CSL-Corr. Oceanside",
    "CSL-North",
    "East Cape North",
    "East Cape South",
    "Ejidos",
    "El Centenario",
    "El Sargento",
    "Excondido South",
    "Insurgentes",
    "La Paz City",
    "La Ventana",
    "LaPaz Beach",
    "Loreto",
    "Los Planes",
    "Mag Bay",
    "Mid Pacific",
    "Mulege",
    "Nopolo",
    "North Shore",
    "Pacific North",
    "Pacific South",
    "San Juan de la Costa",
    "San Pedro",
    "Scorpion Bay",
    "SJD Corr-Inland",
    "SJD Corr-Oceanside",
    "SJD-Beachside",
    "SJD-Centro",
    "SJD-East",
    "SJD-Inland/Golf",
    "SJD-North",
    "South Shore"
  ];

  const communities = [
    "Above Isla Coronado",
    "Agua Verde",
    "Bahia Concepcion",
    "Bahía Asunción",
    "Bay of Dreams",
    "BayOfDreams/Ventanas",
    "Beach north",
    "Bellavista",
    "BuenaVista/Rancho Leonero",
    "BuenVsta/LosBarilles",
    "Cabo Bello/Santa Carmela",
    "Cabo del Sol",
    "Cabo del Sol Viejo",
    "Cabo del Sol-Inland",
    "Cabo Real-Inland",
    "Cabo Real-Ocean Side",
    "Centro",
    "Centro- Cabo San Lucas",
    "Centro- La Paz",
    "Centro- San Jose del Cabo",
    "CerroColorado-Inland",
    "Cerro Colorado-Ocean",
    "Chametla",
    "Chileno Bay",
    "Chileno Bay Club",
    "Chileno Bay/Montage",
    "Chileno/Montage-Inland",
    "Ciudad Constitución",
    "Club Campestre",
    "Colina del Sol",
    "Comitan",
    "Conquista Agraria",
    "Constitucion Community",
    "Costa Azul Beach",
    "Costa Palmas",
    "CSL Beach",
    "CSL Country Club",
    "CSL Marina",
    "CSL Near Bch & Marina",
    "CSL North-East 19",
    "CSL North-West 19",
    "Danzante Bay",
    "Diamante Cabo San Lucas",
    "Ejido La Purisima",
    "Ejido Next South",
    "Ejidos/ Comondu",
    "El Aguajito",
    "El Centenario",
    "El Comitan",
    "El Dorado",
    "El Encanto & Laguna",
    "El Jalito",
    "El Jaral",
    "El Mogote",
    "El Rincon",
    "El Sargento",
    "El Teso",
    "El Tezal-East",
    "El Tezal-OceanSide",
    "El Tezal-West",
    "El Tule-Inland",
    "El Tule-Ocean Side",
    "ElCardonal/N of Bariles",
    "Elias Calles",
    "Ensenada Blanca",
    "Espiritu del Mar",
    "Esterito",
    "Fidepaz",
    "Fonatur Golf & Hills",
    "Forjadores SJD",
    "Gringo & Lito Hills",
    "Hot Springs",
    "Insurgentes Community",
    "La Perla",
    "La Posada",
    "La Ribera",
    "La Ventana",
    "Ladera San José",
    "LaPaz Beach Community",
    "LaPaz Centro Community",
    "LaPaz East",
    "LaPaz North Community",
    "LaPaz West",
    "Ligui",
    "Lopez Mateos",
    "Loreto",
    "Loreto Bay",
    "Los Planes",
    "Magisterial / Infonavit",
    "Maravilla",
    "Mesa Colorada",
    "Migrino Area",
    "Miraflores/Santiago",
    "Miramar",
    "Misiones",
    "Mulege",
    "Nopolo",
    "Nopolo Hills",
    "North Centro",
    "North Loreto Bay",
    "North Shore",
    "Palmilla-Inland",
    "Palmilla-Ocean Side",
    "Pedregal CSL",
    "Pedregal de La Paz",
    "Pescadero/Cerritos",
    "Pto. Escondido",
    "Puerta Bugambilias",
    "Puerto Los Cabos",
    "Punta Ballena",
    "Querencia-Inland",
    "Querencia-Ocean side",
    "Quivira",
    "Rancho San Lucas",
    "Saddles/Sunset Bch Rd",
    "San Bartolo",
    "San Cosme",
    "San Cristobal",
    "San Juan de la Costa",
    "San Juanico",
    "San Pedro",
    "Santa Rosalia",
    "Santo Domingo",
    "Second Town Name",
    "SJD above Hwy 1",
    "SJD Downtown",
    "SJD Marina",
    "SJD North-E of 1",
    "SJD North-W of 1",
    "SJD-Beach",
    "South",
    "South LaPaz Community",
    "Todos Santos",
    "Todos Santos North",
    "Uptown/Border Rd",
    "Villas Gp. Development",
    "Vinorama/Cabo Pulmo",
    "Zacatitos/PtaPerfcta",
    "Zaragoza"
  ];

  const subdivisions = [
    "Alba Residences",
    "Altamar",
    "Amalfi",
    "Chileno Bay",
    "Palmilla",
    "Pedregal",
    "Querencia",
    "Quivira",
    "Rancho San Lucas",
    "The Residences at Hacienda Encantada"
  ];

  const priceOptions = [
    "$50,000", "$100,000", "$150,000", "$200,000", "$250,000",
    "$300,000", "$350,000", "$400,000", "$450,000", "$500,000",
    "$600,000", "$700,000", "$800,000", "$900,000", "$1 Million",
    "$1.25 Million", "$1.5 Million", "$1.75 Million", "$2 Million",
    "$2.5 Million", "$3 Million", "$4 Million", "$5 Million"
  ];

  const bedsOptions = ["1+", "2+", "3+", "4+", "5+"];
  const bathsOptions = ["Any", "1+", "2+", "3+", "4+"];
  const sqftOptions = ["No Preference", "500+", "1000+", "1500+", "2000+", "2500+", "3000+", "4000+", "5000+"];
  const yearBuiltOptions = ["No Preference", "2024+", "2023+", "2020+", "2015+", "2010+", "2000+"];

  const handleMLSSearch = () => {
    const searchTerm = filters.mlsNumber.trim() || filters.searchQuery.trim();
    if (searchTerm) {
      console.log('🔍 [UNIVERSAL SEARCH] Searching for:', searchTerm);
      
      // Navigate to properties page with search parameter
      navigate(`/properties?search=${encodeURIComponent(searchTerm)}`);
      setIsOpen(false);
      
      // Also trigger the search through onApplyFilters
      onApplyFilters(filters, searchTerm);
    }
  };

  const toggleArrayFilter = (key: keyof FilterState, value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    setFilters({ ...filters, [key]: newArray });
  };

  const selectAll = (key: keyof FilterState, options: string[]) => {
    setFilters({ ...filters, [key]: options });
  };

  const selectNone = (key: keyof FilterState) => {
    setFilters({ ...filters, [key]: [] });
  };

  const handleSearch = () => {
    // Priority 1: If there's a search query (MLS, address, etc.), use universal search
    const searchTerm = filters.mlsNumber.trim() || filters.searchQuery.trim();
    if (searchTerm) {
      console.log('🎯 [UNIVERSAL SEARCH] Using search for:', searchTerm);
      handleMLSSearch();
      return;
    }
    
    // Priority 2: Apply advanced filters
    console.log('🎯 [FILTER SEARCH] Using advanced filters');
    onApplyFilters(filters);
    setIsOpen(false);
    
    let count = 0;
    if (filters.zones.length > 0) count++;
    if (filters.areas.length > 0) count++;
    if (filters.communities.length > 0) count++;
    if (filters.subdivisions.length > 0) count++;
    if (filters.propertyTypes.length !== 3) count++;
    if (filters.status !== "Active") count++;
    if (filters.minPrice !== "$50,000") count++;
    if (filters.maxPrice !== "$3 Million") count++;
    if (filters.minBeds !== "1+") count++;
    if (filters.sellerFinancing || filters.primaryView || filters.currentPrice) count++;
    setActiveFiltersCount(count);
  };

  const handleReset = () => {
    setFilters({
      searchQuery: "",
      mlsNumber: "",
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
      minSqft: "No Preference",
      yearBuilt: "No Preference",
      sellerFinancing: false,
      primaryView: false,
      currentPrice: false,
    });
    setActiveFiltersCount(0);
    setShowAllZones(false);
    setShowAllAreas(false);
    setShowAllCommunities(false);
    setShowAllSubdivisions(false);
    onReset();
    setIsOpen(false);
  };

  const getDisplayedItems = (items: string[], showAll: boolean, limit: number = 10) => {
    return showAll ? items : items.slice(0, limit);
  };

  // Helper functions for Map Search button
  const parsePrice = (priceStr: string | undefined) => {
    if (!priceStr || priceStr === "No Preference" || priceStr === "") return undefined;
    const cleaned = priceStr.replace(/[$,Million]/g, '').trim();
    const num = parseFloat(cleaned);
    if (isNaN(num)) return undefined;
    return priceStr.includes('Million') ? num * 1000000 : num;
  };

  const parseNumber = (str: string | undefined) => {
    if (!str || str === "Any" || str === "No Preference" || str === "") return undefined;
    const parsed = parseInt(str.replace('+', ''));
    return isNaN(parsed) ? undefined : parsed;
  };

  return (
    <div className="w-full">
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="MLS #, address, city, or property type..."
            value={filters.searchQuery}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            className="pl-10 pr-4"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters({ ...filters, searchQuery: "" })}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Button 
          variant="default" 
          onClick={handleSearch}
          className="px-8 bg-purple-700 hover:bg-purple-800"
        >
          Search
        </Button>

        <Button 
          variant="outline" 
          className="px-6"
          onClick={() => {
            // Build URL with current filters
            const params = new URLSearchParams();
            if (filters.zones.length > 0) params.append('city', filters.zones[0]);
            else if (filters.areas.length > 0) params.append('city', filters.areas[0]);
            else if (filters.communities.length > 0) params.append('city', filters.communities[0]);
            
            if (filters.minPrice && filters.minPrice !== '$50,000') {
              const min = parsePrice(filters.minPrice);
              if (min) params.append('minPrice', min.toString());
            }
            if (filters.maxPrice && filters.maxPrice !== '$3 Million') {
              const max = parsePrice(filters.maxPrice);
              if (max) params.append('maxPrice', max.toString());
            }
            if (filters.minBeds && filters.minBeds !== '1+') {
              const beds = parseNumber(filters.minBeds);
              if (beds) params.append('bedrooms', beds.toString());
            }
            if (filters.minBaths && filters.minBaths !== 'Any') {
              const baths = parseNumber(filters.minBaths);
              if (baths) params.append('bathrooms', baths.toString());
            }
            
            navigate(`/properties/map?${params.toString()}`);
          }}
        >
          Map Search
        </Button>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Advanced Filters
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-purple-700 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-2xl">Advanced Property Search</SheetTitle>
              <SheetDescription>
                <div className="space-y-2">
                  {/* Total Database Count */}
                  <div className="text-base">
                    Search across <span className="text-xl font-bold text-blue-600">
                      {totalCount.toLocaleString()}
                    </span> luxury properties in Baja California Sur
                  </div>
                  
                  {/* After Search - Show Results */}
                  {resultCount > 0 && (
                    <div className="p-2 bg-green-50 rounded border border-green-200">
                      <span className="text-sm text-green-700 font-semibold">
                        ✅ Showing {resultCount.toLocaleString()} properties
                      </span>
                    </div>
                  )}
                </div>
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 mt-6">
              {/* Universal Search */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300 rounded-lg p-4">
                <Label className="text-base font-semibold mb-2 block">Universal Search</Label>
                <p className="text-sm text-gray-600 mb-3">
                  Search by MLS number, address, city, or property type
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., 25-4668, Marina Cabo Plaza, Pedregal..."
                    value={filters.mlsNumber}
                    onChange={(e) => setFilters({ ...filters, mlsNumber: e.target.value })}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleMLSSearch();
                    }}
                  />
                  <Button
                    className="bg-purple-700 hover:bg-purple-800"
                    onClick={handleMLSSearch}
                    disabled={!filters.mlsNumber.trim() && !filters.searchQuery.trim()}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
                <p className="text-xs text-purple-600 mt-2">
                  Searches your internal database for instant results
                </p>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-center text-gray-500 mb-4">
                  Or use advanced filters below
                </p>
              </div>

              {/* Location Section */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-bold text-lg mb-4">Location</h3>
                
                {/* Property Type */}
                <div className="mb-4">
                  <Label className="font-medium mb-2 block">
                    Property Type of{" "}
                    {propertyTypes.map((type, idx) => (
                      <span key={type}>
                        <button
                          onClick={() => toggleArrayFilter('propertyTypes', type)}
                          className={`text-blue-600 hover:underline ${
                            filters.propertyTypes.includes(type) ? 'font-semibold' : ''
                          }`}
                        >
                          {type}
                        </button>
                        {idx < propertyTypes.length - 1 && ", "}
                      </span>
                    ))}
                  </Label>
                </div>

                {/* MLS Search Input */}
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <div className="text-blue-500">ℹ️</div>
                    <Input
                      placeholder="MLS #, address or map overlay"
                      value={filters.searchQuery}
                      onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                      className="flex-1"
                    />
                    <button className="text-blue-600 hover:underline text-sm whitespace-nowrap">
                      Browse »
                    </button>
                  </div>
                </div>

                {/* Status */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Checkbox id="status-checkbox" checked disabled />
                    <Label htmlFor="status-checkbox" className="font-medium">
                      Status{" "}
                      <span className="text-blue-600">of</span>{" "}
                      <button className="text-blue-600 hover:underline">
                        {filters.status}
                      </button>
                    </Label>
                  </div>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    size={6}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <button className="text-blue-600 hover:underline text-sm mt-1">
                    See All and Select Date Ranges...
                  </button>
                </div>

                {/* Zone */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="zone-checkbox" 
                        checked={filters.zones.length > 0}
                        onCheckedChange={(checked) => {
                          if (!checked) selectNone('zones');
                        }}
                      />
                      <Label htmlFor="zone-checkbox" className="font-bold">Zone</Label>
                    </div>
                    <button 
                      onClick={() => setShowAllZones(false)}
                      className="text-blue-600 hover:underline text-xl"
                    >
                      ×
                    </button>
                  </div>
                  <select
                    multiple
                    value={filters.zones}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      setFilters({ ...filters, zones: selected });
                    }}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    size={showAllZones ? 10 : 10}
                  >
                    {getDisplayedItems(zones, showAllZones).map((zone) => (
                      <option key={zone} value={zone}>
                        {zone}
                      </option>
                    ))}
                  </select>
                  {!showAllZones && zones.length > 10 && (
                    <button 
                      onClick={() => setShowAllZones(true)}
                      className="text-blue-600 hover:underline text-sm mt-1"
                    >
                      See All...
                    </button>
                  )}
                </div>

                {/* Area */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="area-checkbox" 
                        checked={filters.areas.length > 0}
                        onCheckedChange={(checked) => {
                          if (!checked) selectNone('areas');
                        }}
                      />
                      <Label htmlFor="area-checkbox" className="font-bold">Area</Label>
                    </div>
                    <button 
                      onClick={() => setShowAllAreas(false)}
                      className="text-blue-600 hover:underline text-xl"
                    >
                      ×
                    </button>
                  </div>
                  <select
                    multiple
                    value={filters.areas}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      setFilters({ ...filters, areas: selected });
                    }}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    size={10}
                  >
                    {getDisplayedItems(areas, showAllAreas, 10).map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                  {!showAllAreas && areas.length > 10 && (
                    <button 
                      onClick={() => setShowAllAreas(true)}
                      className="text-blue-600 hover:underline text-sm mt-1"
                    >
                      See All...
                    </button>
                  )}
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => selectAll('areas', areas)}
                      className="flex-1 text-blue-600 border-blue-300"
                    >
                      SELECT ALL
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => selectNone('areas')}
                      className="flex-1 text-blue-600 border-blue-300"
                    >
                      SELECT NONE
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setShowAllAreas(false)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      FINISHED
                    </Button>
                  </div>
                </div>

                {/* Community */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="community-checkbox" 
                        checked={filters.communities.length > 0}
                        onCheckedChange={(checked) => {
                          if (!checked) selectNone('communities');
                        }}
                      />
                      <Label htmlFor="community-checkbox" className="font-bold">Community</Label>
                    </div>
                    <button 
                      onClick={() => setShowAllCommunities(false)}
                      className="text-blue-600 hover:underline text-xl"
                    >
                      ×
                    </button>
                  </div>
                  <select
                    multiple
                    value={filters.communities}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      setFilters({ ...filters, communities: selected });
                    }}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    size={10}
                  >
                    {getDisplayedItems(communities, showAllCommunities, 10).map((community) => (
                      <option key={community} value={community}>
                        {community}
                      </option>
                    ))}
                  </select>
                  {!showAllCommunities && communities.length > 10 && (
                    <button 
                      onClick={() => setShowAllCommunities(true)}
                      className="text-blue-600 hover:underline text-sm mt-1"
                    >
                      See All...
                    </button>
                  )}
                  <p className="text-xs text-red-600 mt-1">
                    To select multiple items, hold down control (command ⌘ on Mac) on your keyboard while clicking.
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => selectAll('communities', communities)}
                      className="flex-1 text-blue-600 border-blue-300"
                    >
                      SELECT ALL
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => selectNone('communities')}
                      className="flex-1 text-blue-600 border-blue-300"
                    >
                      SELECT NONE
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setShowAllCommunities(false)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      FINISHED
                    </Button>
                  </div>
                </div>

                {/* Subdivision */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Checkbox 
                      id="subdivision-checkbox" 
                      checked={filters.subdivisions.length > 0}
                      onCheckedChange={(checked) => {
                        if (!checked) selectNone('subdivisions');
                      }}
                    />
                    <Label htmlFor="subdivision-checkbox" className="font-bold">Subdivision</Label>
                  </div>
                </div>

                {/* Additional Checkboxes */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="seller-financing"
                      checked={filters.sellerFinancing}
                      onCheckedChange={(checked) => setFilters({ ...filters, sellerFinancing: checked as boolean })}
                    />
                    <label htmlFor="seller-financing" className="text-sm cursor-pointer">
                      Seller Financing Offered?
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="primary-view"
                      checked={filters.primaryView}
                      onCheckedChange={(checked) => setFilters({ ...filters, primaryView: checked as boolean })}
                    />
                    <label htmlFor="primary-view" className="text-sm cursor-pointer">
                      Primary View
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="current-price"
                      checked={filters.currentPrice}
                      onCheckedChange={(checked) => setFilters({ ...filters, currentPrice: checked as boolean })}
                    />
                    <label htmlFor="current-price" className="text-sm cursor-pointer">
                      Current Price
                    </label>
                  </div>
                </div>

                {/* Add a Field Button */}
                <Button variant="default" className="mt-4 bg-blue-600 hover:bg-blue-700">
                  Add a Field
                </Button>
              </div>

              {/* Property Details Section */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-bold text-lg mb-4">Property Details</h3>

                {/* Price Range */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label className="text-sm mb-1 block">Price</Label>
                    <select
                      value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                    >
                      {priceOptions.map(price => (
                        <option key={price} value={price}>{price}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end justify-center pb-1">
                    <span className="text-sm text-gray-500">to</span>
                  </div>
                  <div>
                    <Label className="text-sm mb-1 block">&nbsp;</Label>
                    <select
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                    >
                      {priceOptions.map(price => (
                        <option key={price} value={price}>{price}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Beds, Baths, Sqft */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label className="text-sm mb-1 block">Min Beds</Label>
                    <select
                      value={filters.minBeds}
                      onChange={(e) => setFilters({ ...filters, minBeds: e.target.value })}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                    >
                      {bedsOptions.map(bed => (
                        <option key={bed} value={bed}>{bed}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-sm mb-1 block">Min Baths</Label>
                    <select
                      value={filters.minBaths}
                      onChange={(e) => setFilters({ ...filters, minBaths: e.target.value })}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                    >
                      {bathsOptions.map(bath => (
                        <option key={bath} value={bath}>{bath}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-sm mb-1 block">Min Sq. Feet</Label>
                    <select
                      value={filters.minSqft}
                      onChange={(e) => setFilters({ ...filters, minSqft: e.target.value })}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                    >
                      {sqftOptions.map(sqft => (
                        <option key={sqft} value={sqft}>{sqft}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Year Built */}
                <div>
                  <Label className="text-sm mb-1 block">Year Built</Label>
                  <select
                    value={filters.yearBuilt}
                    onChange={(e) => setFilters({ ...filters, yearBuilt: e.target.value })}
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                  >
                    {yearBuiltOptions.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Additional Search Options */}
              <details className="border border-gray-200 rounded-lg">
                <summary className="cursor-pointer p-4 font-bold text-blue-600 hover:bg-gray-50">
                  + Additional Search Options
                </summary>
                <div className="p-4 pt-0">
                  <p className="text-sm text-gray-600">
                    Additional search filters can be configured here. Contact your MLS administrator for more options.
                  </p>
                </div>
              </details>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-8 pt-6 border-t sticky bottom-0 bg-white">
              <Button 
                variant="outline" 
                onClick={handleReset} 
                className="flex-1"
              >
                Reset
              </Button>
              <Button 
                onClick={handleSearch} 
                className="flex-1 bg-purple-700 hover:bg-purple-800"
              >
                Search
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.zones.map((zone) => (
            <span key={zone} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              Zone: {zone}
              <X className="h-3 w-3 cursor-pointer" onClick={() => toggleArrayFilter('zones', zone)} />
            </span>
          ))}
          {filters.areas.map((area) => (
            <span key={area} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              Area: {area}
              <X className="h-3 w-3 cursor-pointer" onClick={() => toggleArrayFilter('areas', area)} />
            </span>
          ))}
          {filters.communities.map((community) => (
            <span key={community} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              Community: {community}
              <X className="h-3 w-3 cursor-pointer" onClick={() => toggleArrayFilter('communities', community)} />
            </span>
          ))}
          {filters.propertyTypes.length > 0 && filters.propertyTypes.length !== 3 && (
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              Types: {filters.propertyTypes.join(", ")}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedPropertyFilters;