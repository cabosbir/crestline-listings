// src/components/AdvancedPropertyFilters.tsx - Fixed version
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Search, SlidersHorizontal, X } from "lucide-react";

interface FilterState {
  searchQuery: string;
  mlsNumber: string;
  city: string;
  neighborhood: string;
  propertyType: string;
  minPrice: string;
  maxPrice: string;
  minBeds: string;
  minBaths: string;
  waterfront: boolean;
  oceanView: boolean;
  pool: boolean;
  golfCourse: boolean;
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
    city: "",
    neighborhood: "",
    propertyType: "",
    minPrice: "",
    maxPrice: "10000000",
    minBeds: "",
    minBaths: "",
    waterfront: false,
    oceanView: false,
    pool: false,
    golfCourse: false,
  });

  const cities = [
    { value: "Cabo San Lucas", label: "Cabo San Lucas" },
    { value: "San Jose del Cabo", label: "San Jose del Cabo" },
    { value: "Todos Santos", label: "Todos Santos" },
    { value: "La Paz", label: "La Paz" },
    { value: "East Cape", label: "East Cape" },
    { value: "Corridor", label: "Corridor" },
    { value: "Pacific Coast", label: "Pacific Coast" },
  ];

  const neighborhoods = [
    { value: "Marina", label: "Marina" },
    { value: "Downtown", label: "Downtown" },
    { value: "Pedregal", label: "Pedregal" },
    { value: "Chileno Bay", label: "Chileno Bay" },
    { value: "Palmilla", label: "Palmilla" },
    { value: "Puerto Los Cabos", label: "Puerto Los Cabos" },
    { value: "Costa Azul", label: "Costa Azul" },
  ];

  const propertyTypes = [
    { value: "Single Family", label: "Single Family" },
    { value: "Townhouse", label: "Townhouse" },
    { value: "Condo", label: "Condo" },
    { value: "Penthouse", label: "Penthouse" },
    { value: "Villa", label: "Villa" },
    { value: "Lot/Land", label: "Lot/Land" },
    { value: "Commercial", label: "Commercial" },
  ];

  const handleMLSSearch = () => {
    if (filters.mlsNumber.trim()) {
      window.open(`https://link.flexmls.com/u67gqp77eml,12?search=${encodeURIComponent(filters.mlsNumber)}`, '_blank');
    }
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
    if (filters.searchQuery) count++;
    if (filters.city) count++;
    if (filters.neighborhood) count++;
    if (filters.propertyType) count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice && filters.maxPrice !== "10000000") count++;
    if (filters.minBeds) count++;
    if (filters.minBaths) count++;
    if (filters.waterfront || filters.oceanView || filters.pool || filters.golfCourse) count++;
    setActiveFiltersCount(count);
  };

  const handleReset = () => {
    setFilters({
      searchQuery: "",
      mlsNumber: "",
      city: "",
      neighborhood: "",
      propertyType: "",
      minPrice: "",
      maxPrice: "10000000",
      minBeds: "",
      minBaths: "",
      waterfront: false,
      oceanView: false,
      pool: false,
      golfCourse: false,
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
            placeholder="Search by address, city, or MLS #..."
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
                <span className="absolute -top-2 -right-2 bg-accent text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
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
                <Label className="text-base font-semibold mb-2 block">MLS / IDX Number</Label>
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
                    variant="default"
                    onClick={handleMLSSearch}
                    disabled={!filters.mlsNumber.trim()}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-center text-muted-foreground mb-4">
                  Or use advanced filters below
                </p>
              </div>

              {/* Location - City */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">📍 Location</Label>
                
                <div>
                  <Label className="text-sm font-medium mb-2 block">City</Label>
                  <RadioGroup value={filters.city} onValueChange={(value) => setFilters({ ...filters, city: value })}>
                    <div className="grid grid-cols-2 gap-3">
                      {cities.map((city) => (
                        <div key={city.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={city.value} id={`city-${city.value}`} />
                          <label htmlFor={`city-${city.value}`} className="text-sm cursor-pointer">
                            {city.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                {/* Neighborhood */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Neighborhood</Label>
                  <RadioGroup value={filters.neighborhood} onValueChange={(value) => setFilters({ ...filters, neighborhood: value })}>
                    <div className="grid grid-cols-2 gap-3">
                      {neighborhoods.map((neighborhood) => (
                        <div key={neighborhood.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={neighborhood.value} id={`neighborhood-${neighborhood.value}`} />
                          <label htmlFor={`neighborhood-${neighborhood.value}`} className="text-sm cursor-pointer">
                            {neighborhood.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Property Type */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Property Type</Label>
                <RadioGroup value={filters.propertyType} onValueChange={(value) => setFilters({ ...filters, propertyType: value })}>
                  <div className="grid grid-cols-2 gap-3">
                    {propertyTypes.map((type) => (
                      <div key={type.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={type.value} id={`type-${type.value}`} />
                        <label htmlFor={`type-${type.value}`} className="text-sm cursor-pointer">
                          {type.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              {/* Price Range */}
              <div>
                <Label className="text-base font-semibold mb-2 block">Price Range</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm mb-1 block">Min</Label>
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-sm mb-1 block">Max</Label>
                    <Input
                      type="number"
                      placeholder="10000000"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Beds & Baths */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Min Beds</Label>
                  <select
                    value={filters.minBeds}
                    onChange={(e) => setFilters({ ...filters, minBeds: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                  </select>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Min Baths</Label>
                  <select
                    value={filters.minBaths}
                    onChange={(e) => setFilters({ ...filters, minBaths: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>
              </div>

              {/* Features - FIXED: Using Checkbox instead of RadioGroupItem */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Features</Label>
                <div className="grid grid-cols-2 gap-3">
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
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-8 pt-6 border-t sticky bottom-0 bg-background">
              <Button variant="outline" onClick={handleReset} className="flex-1">
                <X className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button variant="default" onClick={handleSearch} className="flex-1">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.city && (
            <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm flex items-center gap-2">
              {cities.find(c => c.value === filters.city)?.label}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({ ...filters, city: "" })} />
            </span>
          )}
          {filters.propertyType && (
            <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm flex items-center gap-2">
              {propertyTypes.find(t => t.value === filters.propertyType)?.label}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({ ...filters, propertyType: "" })} />
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedPropertyFilters;