// src/components/AdvancedPropertyFilters.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Search, SlidersHorizontal, MapPin, Calendar, X, ExternalLink } from "lucide-react";

interface FilterState {
  // Basic Search
  searchQuery: string;
  mlsNumber: string;
  
  // Location
  city: string[];
  neighborhood: string[];
  zipCode: string;
  
  // Property Details
  propertyType: string[];
  minPrice: number;
  maxPrice: number;
  minBeds: number;
  maxBeds: number;
  minBaths: number;
  maxBaths: number;
  minSqft: number;
  maxSqft: number;
  
  // Lot Details
  minLotSize: number;
  maxLotSize: number;
  
  // Features
  waterfront: boolean;
  oceanView: boolean;
  pool: boolean;
  garage: boolean;
  golfCourse: boolean;
  
  // Status & Dates
  listingStatus: string[];
  listedAfter: string;
  listedBefore: string;
  
  // Advanced
  yearBuiltMin: number;
  yearBuiltMax: number;
  hoaMax: number;
  keywords: string;
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
    city: [],
    neighborhood: [],
    zipCode: "",
    propertyType: [],
    minPrice: 0,
    maxPrice: 10000000,
    minBeds: 0,
    maxBeds: 10,
    minBaths: 0,
    maxBaths: 10,
    minSqft: 0,
    maxSqft: 10000,
    minLotSize: 0,
    maxLotSize: 50000,
    waterfront: false,
    oceanView: false,
    pool: false,
    garage: false,
    golfCourse: false,
    listingStatus: ["Active"],
    listedAfter: "",
    listedBefore: "",
    yearBuiltMin: 1900,
    yearBuiltMax: new Date().getFullYear(),
    hoaMax: 10000,
    keywords: ""
  });

  const cities = [
    "Cabo San Lucas",
    "San Jose del Cabo",
    "Todos Santos",
    "La Paz",
    "East Cape",
    "Pacific Coast",
    "Corridor"
  ];

  const neighborhoods = [
    "Marina",
    "Pedregal",
    "Downtown",
    "Palmilla",
    "Chileno Bay",
    "Costa Azul",
    "Puerto Los Cabos"
  ];

  const propertyTypes = [
    "Single Family",
    "Condo",
    "Townhouse",
    "Villa",
    "Penthouse",
    "Lot/Land",
    "Commercial"
  ];

  const listingStatuses = [
    "Active",
    "Pending",
    "Under Contract",
    "Coming Soon",
    "Recently Sold"
  ];

  // Handle MLS number search
  const handleMLSSearch = () => {
    if (filters.mlsNumber.trim()) {
      // Open FlexMLS search with the MLS number
      window.open(`https://link.flexmls.com/1lpm0zo1944e,12?search=${encodeURIComponent(filters.mlsNumber)}`, '_blank');
    }
  };

  const handleApply = () => {
    // If MLS number is provided, search FlexMLS directly
    if (filters.mlsNumber.trim()) {
      handleMLSSearch();
      return;
    }
    
    onApplyFilters(filters);
    setIsOpen(false);
    
    // Count active filters
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.mlsNumber) count++;
    if (filters.city.length > 0) count++;
    if (filters.propertyType.length > 0) count++;
    if (filters.minPrice > 0) count++;
    if (filters.maxPrice < 10000000) count++;
    if (filters.waterfront || filters.oceanView || filters.pool) count++;
    setActiveFiltersCount(count);
  };

  const handleReset = () => {
    setFilters({
      searchQuery: "",
      mlsNumber: "",
      city: [],
      neighborhood: [],
      zipCode: "",
      propertyType: [],
      minPrice: 0,
      maxPrice: 10000000,
      minBeds: 0,
      maxBeds: 10,
      minBaths: 0,
      maxBaths: 10,
      minSqft: 0,
      maxSqft: 10000,
      minLotSize: 0,
      maxLotSize: 50000,
      waterfront: false,
      oceanView: false,
      pool: false,
      garage: false,
      golfCourse: false,
      listingStatus: ["Active"],
      listedAfter: "",
      listedBefore: "",
      yearBuiltMin: 1900,
      yearBuiltMax: new Date().getFullYear(),
      hoaMax: 10000,
      keywords: ""
    });
    setActiveFiltersCount(0);
    onReset();
    setIsOpen(false);
  };

  const toggleArrayFilter = (key: keyof FilterState, value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    setFilters({ ...filters, [key]: newArray });
  };

  return (
    <div className="w-full">
      {/* Quick Search Bar */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by address, city, or MLS #..."
            value={filters.searchQuery}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleApply();
              }
            }}
            className="pl-10"
          />
        </div>

        <Button 
          variant="luxury" 
          onClick={handleApply}
          className="px-6"
        >
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Advanced Filters
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-primary text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Advanced Property Search</SheetTitle>
              <SheetDescription>
                Filter properties like a pro with MLS-style search
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 mt-6">
              {/* MLS Number Search */}
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                <Label className="text-lg font-semibold mb-2 block">MLS / IDX Number</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Search directly by MLS listing number for instant results
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., 25-4733"
                    value={filters.mlsNumber}
                    onChange={(e) => setFilters({ ...filters, mlsNumber: e.target.value })}
                    className="flex-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleMLSSearch();
                      }
                    }}
                  />
                  <Button
                    variant="luxury"
                    onClick={handleMLSSearch}
                    disabled={!filters.mlsNumber.trim()}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-center text-muted-foreground mb-4">
                  Or use advanced filters below
                </p>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </h3>
                
                <div>
                  <Label>City</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {cities.map((city) => (
                      <div key={city} className="flex items-center space-x-2">
                        <Checkbox
                          id={`city-${city}`}
                          checked={filters.city.includes(city)}
                          onCheckedChange={() => toggleArrayFilter('city', city)}
                        />
                        <label htmlFor={`city-${city}`} className="text-sm cursor-pointer">
                          {city}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Neighborhood</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {neighborhoods.map((neighborhood) => (
                      <div key={neighborhood} className="flex items-center space-x-2">
                        <Checkbox
                          id={`neighborhood-${neighborhood}`}
                          checked={filters.neighborhood.includes(neighborhood)}
                          onCheckedChange={() => toggleArrayFilter('neighborhood', neighborhood)}
                        />
                        <label htmlFor={`neighborhood-${neighborhood}`} className="text-sm cursor-pointer">
                          {neighborhood}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Zip Code</Label>
                  <Input
                    placeholder="23450"
                    value={filters.zipCode}
                    onChange={(e) => setFilters({ ...filters, zipCode: e.target.value })}
                  />
                </div>
              </div>

              {/* Property Type */}
              <div>
                <Label>Property Type</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {propertyTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type}`}
                        checked={filters.propertyType.includes(type)}
                        onCheckedChange={() => toggleArrayFilter('propertyType', type)}
                      />
                      <label htmlFor={`type-${type}`} className="text-sm cursor-pointer">
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <Label>Price Range</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice || ""}
                      onChange={(e) => setFilters({ ...filters, minPrice: Number(e.target.value) })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      ${(filters.minPrice / 1000000).toFixed(1)}M
                    </p>
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice || ""}
                      onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      ${(filters.maxPrice / 1000000).toFixed(1)}M
                    </p>
                  </div>
                </div>
              </div>

              {/* Bedrooms */}
              <div>
                <Label>Bedrooms: {filters.minBeds} - {filters.maxBeds}</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minBeds || ""}
                    onChange={(e) => setFilters({ ...filters, minBeds: Number(e.target.value) })}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxBeds || ""}
                    onChange={(e) => setFilters({ ...filters, maxBeds: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* Bathrooms */}
              <div>
                <Label>Bathrooms: {filters.minBaths} - {filters.maxBaths}</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minBaths || ""}
                    onChange={(e) => setFilters({ ...filters, minBaths: Number(e.target.value) })}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxBaths || ""}
                    onChange={(e) => setFilters({ ...filters, maxBaths: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* Square Feet */}
              <div>
                <Label>Square Feet</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minSqft || ""}
                    onChange={(e) => setFilters({ ...filters, minSqft: Number(e.target.value) })}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxSqft || ""}
                    onChange={(e) => setFilters({ ...filters, maxSqft: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* Features */}
              <div>
                <Label>Features</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="waterfront"
                      checked={filters.waterfront}
                      onCheckedChange={(checked) => setFilters({ ...filters, waterfront: checked as boolean })}
                    />
                    <label htmlFor="waterfront" className="text-sm cursor-pointer">
                      Waterfront
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="oceanView"
                      checked={filters.oceanView}
                      onCheckedChange={(checked) => setFilters({ ...filters, oceanView: checked as boolean })}
                    />
                    <label htmlFor="oceanView" className="text-sm cursor-pointer">
                      Ocean View
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pool"
                      checked={filters.pool}
                      onCheckedChange={(checked) => setFilters({ ...filters, pool: checked as boolean })}
                    />
                    <label htmlFor="pool" className="text-sm cursor-pointer">
                      Pool
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="garage"
                      checked={filters.garage}
                      onCheckedChange={(checked) => setFilters({ ...filters, garage: checked as boolean })}
                    />
                    <label htmlFor="garage" className="text-sm cursor-pointer">
                      Garage
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="golfCourse"
                      checked={filters.golfCourse}
                      onCheckedChange={(checked) => setFilters({ ...filters, golfCourse: checked as boolean })}
                    />
                    <label htmlFor="golfCourse" className="text-sm cursor-pointer">
                      Golf Course
                    </label>
                  </div>
                </div>
              </div>

              {/* Listing Status */}
              <div>
                <Label>Listing Status</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {listingStatuses.map((status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status}`}
                        checked={filters.listingStatus.includes(status)}
                        onCheckedChange={() => toggleArrayFilter('listingStatus', status)}
                      />
                      <label htmlFor={`status-${status}`} className="text-sm cursor-pointer">
                        {status}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Listing Date
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Listed After</Label>
                    <Input
                      type="date"
                      value={filters.listedAfter}
                      onChange={(e) => setFilters({ ...filters, listedAfter: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Listed Before</Label>
                    <Input
                      type="date"
                      value={filters.listedBefore}
                      onChange={(e) => setFilters({ ...filters, listedBefore: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Year Built */}
              <div>
                <Label>Year Built</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.yearBuiltMin || ""}
                    onChange={(e) => setFilters({ ...filters, yearBuiltMin: Number(e.target.value) })}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.yearBuiltMax || ""}
                    onChange={(e) => setFilters({ ...filters, yearBuiltMax: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* Keywords */}
              <div>
                <Label>Keywords</Label>
                <Input
                  placeholder="e.g., granite counters, stainless appliances"
                  value={filters.keywords}
                  onChange={(e) => setFilters({ ...filters, keywords: e.target.value })}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-8 pt-6 border-t sticky bottom-0 bg-background">
              <Button variant="outline" onClick={handleReset} className="flex-1">
                <X className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button variant="luxury" onClick={handleApply} className="flex-1">
                Apply Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters Pills */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.city.map((city) => (
            <span key={city} className="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm flex items-center gap-2">
              {city}
              <X className="h-3 w-3 cursor-pointer" onClick={() => toggleArrayFilter('city', city)} />
            </span>
          ))}
          {filters.propertyType.map((type) => (
            <span key={type} className="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm flex items-center gap-2">
              {type}
              <X className="h-3 w-3 cursor-pointer" onClick={() => toggleArrayFilter('propertyType', type)} />
            </span>
          ))}
          {filters.minPrice > 0 && (
            <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm flex items-center gap-2">
              Min: ${(filters.minPrice / 1000000).toFixed(1)}M
              <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({ ...filters, minPrice: 0 })} />
            </span>
          )}
          {filters.waterfront && (
            <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm flex items-center gap-2">
              Waterfront
              <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({ ...filters, waterfront: false })} />
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedPropertyFilters;