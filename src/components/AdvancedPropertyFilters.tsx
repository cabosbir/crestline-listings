// src/components/AdvancedPropertyFilters.tsx - Exact FlexMLS Replica
import { useState } from "react";
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
  zones: string[];
  propertyTypes: string[];
  minPrice: string;
  maxPrice: string;
  minBeds: string;
  minBaths: string;
  minSqft: string;
  yearBuilt: string;
  communities: string[];
  subdivisions: string[];
}

interface AdvancedPropertyFiltersProps {
  onApplyFilters: (filters: FilterState) => void;
  onReset: () => void;
}

const AdvancedPropertyFilters = ({ onApplyFilters, onReset }: AdvancedPropertyFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: "",
    mlsNumber: "",
    zones: [],
    propertyTypes: ["Home", "Condo", "Land"], // Default active like FlexMLS
    minPrice: "$50,000",
    maxPrice: "$3 Million",
    minBeds: "1+",
    minBaths: "Any",
    minSqft: "No Preference",
    yearBuilt: "No Preference",
    communities: [],
    subdivisions: []
  });

  const zones = [
    "All Zones",
    "Cabo Corridor",
    "Cabo San Lucas",
    "Comondu",
    "East Cape",
    "La Paz",
    "Loreto",
    "Mulege",
    "Pacific Coast",
    "San Jose del Cabo",
    "Todos Santos"
  ];

  const propertyTypes = [
    "Home",
    "Condo",
    "Land",
    "Fractional",
    "MultiFamily",
    "Commercial"
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
  
  const communities = [
    "All Communities",
    "Cabo Bello/Santa Carmela",
    "Cabo Del Sol",
    "Chileno Bay/Montage",
    "El Tezal-East",
    "Misiones",
    "Palmilla",
    "Pedregal",
    "Puerto Los Cabos",
    "Rancho Cerro Colorado"
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

  const handleMLSSearch = () => {
    if (filters.mlsNumber.trim()) {
      window.open(`https://link.flexmls.com/1lpm0zo1944e,12?search=${encodeURIComponent(filters.mlsNumber)}`, '_blank');
    }
  };

  const toggleArrayFilter = (key: keyof FilterState, value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    setFilters({ ...filters, [key]: newArray });
  };

  const handleSearch = () => {
    if (filters.mlsNumber.trim()) {
      handleMLSSearch();
      return;
    }
    
    onApplyFilters(filters);
    setIsOpen(false);
    
    // Count active filters
    let count = 0;
    if (filters.zones.length > 0) count++;
    if (filters.propertyTypes.length > 0) count++;
    if (filters.communities.length > 0) count++;
    if (filters.minPrice !== "$50,000") count++;
    if (filters.maxPrice !== "$3 Million") count++;
    if (filters.minBeds !== "1+") count++;
    setActiveFiltersCount(count);
  };

  const handleReset = () => {
    setFilters({
      searchQuery: "",
      mlsNumber: "",
      zones: [],
      propertyTypes: ["Home", "Condo", "Land"],
      minPrice: "$50,000",
      maxPrice: "$3 Million",
      minBeds: "1+",
      minBaths: "Any",
      minSqft: "No Preference",
      yearBuilt: "No Preference",
      communities: [],
      subdivisions: []
    });
    setActiveFiltersCount(0);
    onReset();
    setIsOpen(false);
  };

  return (
    <div className="w-full">
      {/* Quick Search Bar */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="MLS #, address or map overlay"
            value={filters.searchQuery}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            className="pl-10"
          />
        </div>

        <Button 
          variant="default" 
          onClick={handleSearch}
          className="px-6 bg-purple-700 hover:bg-purple-800"
        >
          Search
        </Button>

        <Button 
          variant="outline" 
          className="px-6"
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
                Filter properties like a pro with MLS-style search
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 mt-6">
              {/* MLS Number Search */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <Label className="text-base font-semibold mb-2 block">MLS / IDX Number</Label>
                <p className="text-sm text-gray-600 mb-3">
                  Search directly by MLS listing number for instant results
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., 25-4733"
                    value={filters.mlsNumber}
                    onChange={(e) => setFilters({ ...filters, mlsNumber: e.target.value })}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleMLSSearch();
                    }}
                  />
                  <Button
                    className="bg-purple-700 hover:bg-purple-800"
                    onClick={handleMLSSearch}
                    disabled={!filters.mlsNumber.trim()}
                  >
                    Search
                  </Button>
                </div>
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
                  <Label className="font-medium mb-2 block">Property Type of</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {propertyTypes.map((type) => (
                      <Button
                        key={type}
                        variant={filters.propertyTypes.includes(type) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleArrayFilter('propertyTypes', type)}
                        className={filters.propertyTypes.includes(type) ? "bg-blue-600 hover:bg-blue-700" : ""}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Status - Active (fixed) */}
                <div className="flex items-center gap-2 mb-4">
                  <Checkbox id="status-active" checked disabled />
                  <label htmlFor="status-active" className="text-sm font-medium">
                    Status of <span className="text-blue-600">Active</span>
                  </label>
                </div>

                {/* Zone */}
                <div className="mb-4">
                  <Label className="font-medium mb-2 block">Zone</Label>
                  <div className="border border-gray-300 rounded max-h-48 overflow-y-auto p-2">
                    {zones.map((zone) => (
                      <div key={zone} className="flex items-center space-x-2 py-1">
                        <Checkbox
                          id={`zone-${zone}`}
                          checked={filters.zones.includes(zone)}
                          onCheckedChange={() => toggleArrayFilter('zones', zone)}
                        />
                        <label htmlFor={`zone-${zone}`} className="text-sm cursor-pointer">
                          {zone}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Communities */}
                <div className="mb-4">
                  <Label className="font-medium mb-2 block">Community</Label>
                  <div className="border border-gray-300 rounded max-h-48 overflow-y-auto p-2">
                    {communities.map((community) => (
                      <div key={community} className="flex items-center space-x-2 py-1">
                        <Checkbox
                          id={`community-${community}`}
                          checked={filters.communities.includes(community)}
                          onCheckedChange={() => toggleArrayFilter('communities', community)}
                        />
                        <label htmlFor={`community-${community}`} className="text-sm cursor-pointer">
                          {community}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subdivisions */}
                <div>
                  <Label className="font-medium mb-2 block">Subdivision</Label>
                  <div className="border border-gray-300 rounded max-h-48 overflow-y-auto p-2">
                    {subdivisions.map((subdivision) => (
                      <div key={subdivision} className="flex items-center space-x-2 py-1">
                        <Checkbox
                          id={`subdivision-${subdivision}`}
                          checked={filters.subdivisions.includes(subdivision)}
                          onCheckedChange={() => toggleArrayFilter('subdivisions', subdivision)}
                        />
                        <label htmlFor={`subdivision-${subdivision}`} className="text-sm cursor-pointer">
                          {subdivision}
                        </label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-red-600 mt-1">
                    To select multiple items, hold down control (command ⌘ on Mac) on your keyboard while clicking.
                  </p>
                </div>
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
                      <option>No Preference</option>
                      <option>500+</option>
                      <option>1000+</option>
                      <option>1500+</option>
                      <option>2000+</option>
                      <option>2500+</option>
                      <option>3000+</option>
                      <option>4000+</option>
                      <option>5000+</option>
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
                    <option>No Preference</option>
                    <option>2024+</option>
                    <option>2023+</option>
                    <option>2020+</option>
                    <option>2015+</option>
                    <option>2010+</option>
                    <option>2000+</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-8 pt-6 border-t sticky bottom-0 bg-white">
              <Button variant="outline" onClick={handleReset} className="flex-1">
                Reset
              </Button>
              <Button onClick={handleSearch} className="flex-1 bg-purple-700 hover:bg-purple-800">
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
              {zone}
              <X className="h-3 w-3 cursor-pointer" onClick={() => toggleArrayFilter('zones', zone)} />
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvancedPropertyFilters;