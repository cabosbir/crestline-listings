// AdvancedSearch_ULTIMATE.tsx - Maximum Intelligence with Field Mapping + Auto-Fallback
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, DollarSign, Bed, Bath, Home, Search, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import Map from '../components/Map';
import PropertyCard from '../components/PropertyCard';
import { 
  getAIFieldMapping, 
  getFieldMapping, 
  saveFieldMapping,
  type FieldMapping as AIFieldMapping,
  type FilterMapping 
} from '../services/groqFilterIntelligence_SMART';
import { 
  searchWithFallback, 
  searchListings,
  type FallbackResult 
} from '../services/flexMlsService_FALLBACK';

interface SearchNotification {
  type: 'success' | 'info' | 'warning';
  message: string;
}

const AdvancedSearch: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search state
  const [mlsSearch, setMlsSearch] = useState('');
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>(['Condos', 'Houses', 'Land']);
  const [status, setStatus] = useState('Active');
  
  // Location filters
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);
  const [selectedSubdivisions, setSelectedSubdivisions] = useState<string[]>([]);

  // Price & details
  const [minPrice, setMinPrice] = useState(50000);
  const [maxPrice, setMaxPrice] = useState(3000000);
  const [minBeds, setMinBeds] = useState(1);
  const [minBaths, setMinBaths] = useState(1);

  // Results
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<SearchNotification | null>(null);

  // Filter checkboxes search
  const [filterSearch, setFilterSearch] = useState('');

  // ============================================================================
  // FILTER DATA
  // ============================================================================

  const zones = [
    'Cabo Corridor', 'Cabo San Lucas', 'Comondu', 'East Cape', 
    'La Paz', 'Loreto', 'Mulege', 'Pescadero', 'San Jose del Cabo', 'Todos Santos'
  ];

  const areas = [
    'Corridor', 'Diamante', 'Punta Ballena', 'Quivira', 'San Jose Corridor',
    'Beach & Marina', 'Cabo Bello', 'Downtown', 'El Tezal', 'North', 'Pedregal',
    'East Cape North', 'East Cape South', 'La Paz', 'Loreto',
    'San Jose Downtown', 'San Jose North', 'Todos Santos', 'Todos Santos South'
  ];

  const communities = [
    'Cabo Bello/Santa Carmela', 'Cabo Del Sol', 'Chileno Bay/Montage',
    'El Tezal-East', 'Misiones', 'BuenVista/LosBarilles', 'Palmilla',
    'Pedregal', 'Querencia', 'San Jose Corridor', 'Ventanas'
  ];

  const subdivisions = [
    'Abasolo', 'Alba Residences', 'Altamar', 'Aqua Viva', 'Auberge Residences',
    'Cabo Bello', 'Cabo del Sol', 'Cabo Real', 'Capella Pedregal', 'Casa del Mar',
    'Chileno Bay', 'Club Campestre', 'Copala', 'Costa Palmas', 'Diamante'
  ];

  // ============================================================================
  // INTELLIGENT SEARCH FUNCTION
  // ============================================================================

  const handleSearch = async () => {
    setLoading(true);
    setNotification(null);

    try {
      // Build base filters
      const baseFilters = {
        minPrice,
        maxPrice,
        bedrooms: minBeds,
        bathrooms: minBaths,
        propertyTypes: selectedPropertyTypes,
        status,
        search: mlsSearch || undefined,
      };

      // Handle single-selection location filters with intelligence
      const locationFilters = [
        ...selectedZones.map(z => ({ value: z, field: 'zone' as const })),
        ...selectedAreas.map(a => ({ value: a, field: 'area' as const })),
        ...selectedCommunities.map(c => ({ value: c, field: 'community' as const })),
        ...selectedSubdivisions.map(s => ({ value: s, field: 'subdivision' as const })),
      ];

      // If no location filters, do simple search
      if (locationFilters.length === 0) {
        const results = await searchListings(baseFilters);
        setProperties(results);
        setNotification({
          type: 'success',
          message: `Found ${results.length} properties`
        });
        setLoading(false);
        return;
      }

      // INTELLIGENT MULTI-FILTER SEARCH
      if (locationFilters.length === 1) {
        // Single location filter - use full intelligence
        await handleSingleLocationSearch(locationFilters[0], baseFilters);
      } else {
        // Multiple location filters - combine with OR logic
        await handleMultipleLocationSearch(locationFilters, baseFilters);
      }
    } catch (error) {
      console.error('Search error:', error);
      setNotification({
        type: 'warning',
        message: 'Search failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Single location search with full AI + fallback
  const handleSingleLocationSearch = async (
    location: { value: string; field: 'zone' | 'area' | 'community' | 'subdivision' },
    baseFilters: any
  ) => {
    console.log(`\n🧠 INTELLIGENT SEARCH for: "${location.value}" (${location.field})`);

    // STEP 1: Check for stored field mapping
    const storedMapping = getFieldMapping(location.value);
    if (storedMapping) {
      console.log(`💡 Using stored mapping:`, storedMapping);
      const filters = buildFiltersFromMapping(storedMapping, baseFilters);
      const results = await searchListings(filters);
      
      if (results.length > 0) {
        setProperties(results);
        setNotification({
          type: 'success',
          message: `Found ${results.length} properties in ${location.value}`
        });
        return;
      }
    }

    // STEP 2: Ask Groq for field mapping
    console.log(`🤖 Asking Groq for field mapping...`);
    const aiMapping = await getAIFieldMapping(location.value, location.field);
    
    if (aiMapping.suggestedField !== location.field && aiMapping.confidence > 70) {
      console.log(`✨ Groq suggests using ${aiMapping.suggestedField} instead of ${location.field}`);
      
      // Try Groq's suggestion
      const filters = {
        ...baseFilters,
        ...(aiMapping.suggestedField === 'zone' && { city: aiMapping.value }),
        ...(aiMapping.suggestedField === 'area' && { 
          area: aiMapping.value,
          ...(aiMapping.parentZone && { city: aiMapping.parentZone })
        }),
        ...(aiMapping.suggestedField === 'community' && { community: aiMapping.value }),
        ...(aiMapping.suggestedField === 'subdivision' && { subdivision: aiMapping.value }),
      };

      const results = await searchListings(filters);
      
      if (results.length > 0) {
        setProperties(results);
        saveFieldMapping(location.value, {
          field: aiMapping.suggestedField,
          value: aiMapping.value,
          parentZone: aiMapping.parentZone,
        });
        setNotification({
          type: 'info',
          message: `Found ${results.length} properties (searched as ${aiMapping.suggestedField})`
        });
        return;
      }
    }

    // STEP 3: Auto-fallback search
    console.log(`🔄 Starting auto-fallback search...`);
    const filters = {
      ...baseFilters,
      ...(location.field === 'zone' && { city: location.value }),
      ...(location.field === 'area' && { area: location.value }),
      ...(location.field === 'community' && { community: location.value }),
      ...(location.field === 'subdivision' && { subdivision: location.value }),
    };

    const fallbackResult = await searchWithFallback(filters, location.value, location.field);

    if (fallbackResult.success) {
      setProperties(fallbackResult.results);
      setNotification({
        type: 'success',
        message: `Found ${fallbackResult.count} properties (searched as ${fallbackResult.workingField})`
      });
    } else {
      setProperties([]);
      setNotification({
        type: 'warning',
        message: `No properties found for "${location.value}". Tried: ${fallbackResult.attemptedFields.map(a => a.field).join(', ')}`
      });
    }
  };

  // Multiple location search - combine results
  const handleMultipleLocationSearch = async (
    locations: Array<{ value: string; field: 'zone' | 'area' | 'community' | 'subdivision' }>,
    baseFilters: any
  ) => {
    console.log(`\n🔄 Searching ${locations.length} locations...`);
    
    const allResults: any[] = [];
    const seen = new Set<string>();

    for (const location of locations) {
      const storedMapping = getFieldMapping(location.value);
      const filters = storedMapping
        ? buildFiltersFromMapping(storedMapping, baseFilters)
        : {
            ...baseFilters,
            ...(location.field === 'zone' && { city: location.value }),
            ...(location.field === 'area' && { area: location.value }),
            ...(location.field === 'community' && { community: location.value }),
            ...(location.field === 'subdivision' && { subdivision: location.value }),
          };

      const results = await searchListings(filters);
      
      // Deduplicate by ListingId
      for (const result of results) {
        if (!seen.has(result.ListingId)) {
          seen.add(result.ListingId);
          allResults.push(result);
        }
      }
    }

    setProperties(allResults);
    setNotification({
      type: 'success',
      message: `Found ${allResults.length} properties across ${locations.length} locations`
    });
  };

  // Build filters from stored mapping
  const buildFiltersFromMapping = (mapping: FilterMapping, baseFilters: any) => {
    return {
      ...baseFilters,
      ...(mapping.field === 'zone' && { city: mapping.value }),
      ...(mapping.field === 'area' && { 
        area: mapping.value,
        ...(mapping.parentZone && { city: mapping.parentZone })
      }),
      ...(mapping.field === 'community' && { community: mapping.value }),
      ...(mapping.field === 'subdivision' && { subdivision: mapping.value }),
    };
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Advanced Search</h1>
            <p className="text-sm text-gray-600">Select filters or search MLS</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setSelectedZones([]);
                setSelectedAreas([]);
                setSelectedCommunities([]);
                setSelectedSubdivisions([]);
                setMlsSearch('');
                setProperties([]);
                setNotification(null);
              }}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              Reset
            </button>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  View {properties.length} Results
                </>
              )}
            </button>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`max-w-7xl mx-auto px-4 pb-4`}>
            <div className={`p-3 rounded-lg flex items-center gap-2 ${
              notification.type === 'success' ? 'bg-green-50 text-green-800' :
              notification.type === 'info' ? 'bg-blue-50 text-blue-800' :
              'bg-yellow-50 text-yellow-800'
            }`}>
              {notification.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
              {notification.type === 'warning' && <AlertCircle className="w-5 h-5" />}
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto p-4 flex gap-6">
        {/* Filters Sidebar */}
        <div className="w-80 bg-white rounded-lg shadow-sm p-6 h-fit sticky top-24">
          {/* MLS Search */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Search MLS Database
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={mlsSearch}
                onChange={(e) => setMlsSearch(e.target.value)}
                placeholder="Search by address, MLS#, location..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Search */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Filter Checkboxes
            </label>
            <input
              type="text"
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              placeholder="Filter zones, areas, communities..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Property Types */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Property Type</label>
            {['Condos', 'Houses', 'Land', 'Commercial', 'Fractional', 'MultiFamily'].map(type => (
              <label key={type} className="flex items-center mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedPropertyTypes.includes(type)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedPropertyTypes([...selectedPropertyTypes, type]);
                    } else {
                      setSelectedPropertyTypes(selectedPropertyTypes.filter(t => t !== type));
                    }
                  }}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{type}</span>
              </label>
            ))}
          </div>

          {/* Zone */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Zone ({selectedZones.length} selected)
            </label>
            <div className="max-h-40 overflow-y-auto">
              {zones.filter(z => z.toLowerCase().includes(filterSearch.toLowerCase())).map(zone => (
                <label key={zone} className="flex items-center mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedZones.includes(zone)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedZones([...selectedZones, zone]);
                      } else {
                        setSelectedZones(selectedZones.filter(z => z !== zone));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{zone}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Area */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Area ({selectedAreas.length} selected)
            </label>
            <div className="max-h-40 overflow-y-auto">
              {areas.filter(a => a.toLowerCase().includes(filterSearch.toLowerCase())).map(area => (
                <label key={area} className="flex items-center mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedAreas.includes(area)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAreas([...selectedAreas, area]);
                      } else {
                        setSelectedAreas(selectedAreas.filter(a => a !== area));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{area}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Community */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Community ({selectedCommunities.length} selected)
            </label>
            <div className="max-h-40 overflow-y-auto">
              {communities.filter(c => c.toLowerCase().includes(filterSearch.toLowerCase())).map(community => (
                <label key={community} className="flex items-center mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCommunities.includes(community)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCommunities([...selectedCommunities, community]);
                      } else {
                        setSelectedCommunities(selectedCommunities.filter(c => c !== community));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{community}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Subdivision */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Subdivision ({selectedSubdivisions.length} selected)
            </label>
            <div className="max-h-40 overflow-y-auto">
              {subdivisions.filter(s => s.toLowerCase().includes(filterSearch.toLowerCase())).map(subdivision => (
                <label key={subdivision} className="flex items-center mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSubdivisions.includes(subdivision)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSubdivisions([...selectedSubdivisions, subdivision]);
                      } else {
                        setSelectedSubdivisions(selectedSubdivisions.filter(s => s !== subdivision));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{subdivision}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Price Range</label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value={50000}>$50,000</option>
                <option value={100000}>$100,000</option>
                <option value={200000}>$200,000</option>
                <option value={500000}>$500,000</option>
              </select>
              <select
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value={1000000}>$1 Million</option>
                <option value={2000000}>$2 Million</option>
                <option value={3000000}>$3 Million</option>
                <option value={5000000}>$5 Million</option>
              </select>
            </div>
          </div>

          {/* Bedrooms & Bathrooms */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Min Beds</label>
              <select
                value={minBeds}
                onChange={(e) => setMinBeds(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}+</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Min Baths</label>
              <select
                value={minBaths}
                onChange={(e) => setMinBaths(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}+</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Map & Results */}
        <div className="flex-1">
          {properties.length === 0 && !loading ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Advanced Search</h3>
              <p className="text-gray-600">
                Use the search bar above to search by address, MLS number, or location. Or select filters from the checkboxes to preview properties on the map.
              </p>
            </div>
          ) : (
            <>
              <Map properties={properties} />
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map(property => (
                  <PropertyCard key={property.ListingId} property={property} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;
