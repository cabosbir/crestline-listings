// src/services/mlsTranslator.ts - SMART USER INPUT → MLS API TRANSLATOR
// This handles the exact MLS field name matching problem

export interface MLSFieldMatch {
  found: boolean;
  field?: 'City' | 'MLSAreaMajor' | 'SubdivisionName';
  exactValue?: string;
  suggestions?: string[];
  confidence?: number;
  apiFilter?: string; // Ready-to-use API filter string
}

// ✅ EXACT MLS API FIELD VALUES (from actual API responses)
// These are the EXACT strings that FlexMLS expects
export const MLS_EXACT_VALUES = {
  // City field values (Zone)
  cities: [
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
  ],

  // MLSAreaMajor field values (Area)
  areas: [
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
  ],

  // SubdivisionName field values (Community/Subdivision)
  communities: [
    "Above Isla Coronado",
    "Agua Verde",
    "Bahia Concepcion",
    "Bay of Dreams",
    "BayOfDreams/Ventanas",
    "Beach north",
    "Bellavista",
    "BuenaVista/Rancho Leonero",
    "Cabo Bello/Santa Carmela",
    "Cabo del Sol",
    "Cabo del Sol Viejo",
    "Cabo del Sol-Inland",
    "Cabo Real-Inland",
    "Cabo Real-Ocean Side",
    "Centro",
    "Cerro Colorado-Ocean",
    "CerroColorado-Inland",
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
    "El Tezal-East",
    "El Tezal-OceanSide",
    "El Tezal-West",
    "Fonatur Golf & Hills",
    "Forjadores SJD",
    "La Paz City",
    "Ladera San José",
    "LaPaz Beach Community",
    "Loreto",
    "Loreto Bay",
    "Misiones",
    "Nopolo",
    "Palmilla-Inland",
    "Palmilla-Ocean Side",
    "Pedregal CSL",
    "Puerto Los Cabos",
    "Querencia-Inland",
    "Querencia-Ocean side",
    "Quivira",
    "Rancho San Lucas",
    "SJD Downtown",
    "SJD Marina",
    "SJD North-E of 1",
    "SJD North-W of 1",
    "SJD-Beach",
    "Todos Santos",
    "Todos Santos North"
  ]
};

// ✅ USER-FRIENDLY ALIASES → MLS EXACT VALUES
// This is how you handle "cabo" → "Cabo San Lucas"
export const USER_INPUT_MAPPINGS: Record<string, MLSFieldMatch> = {
  // Zone aliases
  "cabo": {
    found: true,
    field: "City",
    exactValue: "Cabo San Lucas",
    confidence: 90,
    suggestions: ["Cabo Corridor", "Cabo San Lucas"],
    apiFilter: "City eq 'Cabo San Lucas'"
  },
  "cabo san lucas": {
    found: true,
    field: "City",
    exactValue: "Cabo San Lucas",
    confidence: 100,
    apiFilter: "City eq 'Cabo San Lucas'"
  },
  "csl": {
    found: true,
    field: "City",
    exactValue: "Cabo San Lucas",
    confidence: 95,
    apiFilter: "City eq 'Cabo San Lucas'"
  },
  "san jose": {
    found: true,
    field: "City",
    exactValue: "San Jose del Cabo",
    confidence: 90,
    suggestions: ["San Jose del Cabo", "San Jose Corridor"],
    apiFilter: "City eq 'San Jose del Cabo'"
  },
  "sjd": {
    found: true,
    field: "City",
    exactValue: "San Jose del Cabo",
    confidence: 95,
    apiFilter: "City eq 'San Jose del Cabo'"
  },
  "corridor": {
    found: true,
    field: "City",
    exactValue: "Cabo Corridor",
    confidence: 85,
    suggestions: ["Cabo Corridor", "San Jose Corridor"],
    apiFilter: "City eq 'Cabo Corridor'"
  },
  "east cape": {
    found: true,
    field: "City",
    exactValue: "East Cape",
    confidence: 100,
    apiFilter: "City eq 'East Cape'"
  },
  "la paz": {
    found: true,
    field: "City",
    exactValue: "La Paz",
    confidence: 100,
    apiFilter: "City eq 'La Paz'"
  },
  "todos santos": {
    found: true,
    field: "SubdivisionName",
    exactValue: "Todos Santos",
    confidence: 100,
    apiFilter: "contains(SubdivisionName, 'Todos Santos')"
  },

  // Area aliases
  "downtown": {
    found: true,
    field: "MLSAreaMajor",
    exactValue: "CSL-Centro",
    confidence: 80,
    suggestions: ["CSL-Centro", "SJD-Centro"],
    apiFilter: "MLSAreaMajor eq 'CSL-Centro'"
  },
  "beach": {
    found: true,
    field: "MLSAreaMajor",
    exactValue: "CSL-Beach & Marina",
    confidence: 70,
    suggestions: ["CSL-Beach & Marina", "LaPaz Beach", "SJD-Beach"],
    apiFilter: "MLSAreaMajor eq 'CSL-Beach & Marina'"
  },
  "marina": {
    found: true,
    field: "MLSAreaMajor",
    exactValue: "CSL-Beach & Marina",
    confidence: 85,
    apiFilter: "MLSAreaMajor eq 'CSL-Beach & Marina'"
  },

  // Community aliases
  "pedregal": {
    found: true,
    field: "SubdivisionName",
    exactValue: "Pedregal CSL",
    confidence: 95,
    apiFilter: "contains(SubdivisionName, 'Pedregal')"
  },
  "querencia": {
    found: true,
    field: "SubdivisionName",
    exactValue: "Querencia-Ocean side",
    confidence: 85,
    suggestions: ["Querencia-Ocean side", "Querencia-Inland"],
    apiFilter: "contains(SubdivisionName, 'Querencia')"
  },
  "palmilla": {
    found: true,
    field: "SubdivisionName",
    exactValue: "Palmilla-Ocean Side",
    confidence: 85,
    suggestions: ["Palmilla-Ocean Side", "Palmilla-Inland"],
    apiFilter: "contains(SubdivisionName, 'Palmilla')"
  },
  "chileno bay": {
    found: true,
    field: "SubdivisionName",
    exactValue: "Chileno Bay/Montage",
    confidence: 90,
    suggestions: ["Chileno Bay/Montage", "Chileno Bay Club", "Chileno Bay"],
    apiFilter: "contains(SubdivisionName, 'Chileno')"
  },
  "costa palmas": {
    found: true,
    field: "SubdivisionName",
    exactValue: "Costa Palmas",
    confidence: 100,
    apiFilter: "contains(SubdivisionName, 'Costa Palmas')"
  },
  "quivira": {
    found: true,
    field: "SubdivisionName",
    exactValue: "Quivira",
    confidence: 100,
    apiFilter: "contains(SubdivisionName, 'Quivira')"
  },
  "diamante": {
    found: true,
    field: "SubdivisionName",
    exactValue: "Diamante Cabo San Lucas",
    confidence: 95,
    apiFilter: "contains(SubdivisionName, 'Diamante')"
  }
};

/**
 * Smart translator: User input → MLS API exact field value
 * Handles: aliases, typos, fuzzy matching, case insensitivity
 */
export function translateUserInputToMLS(userInput: string): MLSFieldMatch {
  if (!userInput || !userInput.trim()) {
    return { found: false };
  }

  const normalized = userInput.toLowerCase().trim();

  // 1. Check exact alias mappings first
  if (USER_INPUT_MAPPINGS[normalized]) {
    return USER_INPUT_MAPPINGS[normalized];
  }

  // 2. Check exact matches in MLS values (case-insensitive)
  const cityMatch = MLS_EXACT_VALUES.cities.find(
    city => city.toLowerCase() === normalized
  );
  if (cityMatch) {
    return {
      found: true,
      field: "City",
      exactValue: cityMatch,
      confidence: 100,
      apiFilter: `City eq '${cityMatch}'`
    };
  }

  const areaMatch = MLS_EXACT_VALUES.areas.find(
    area => area.toLowerCase() === normalized
  );
  if (areaMatch) {
    return {
      found: true,
      field: "MLSAreaMajor",
      exactValue: areaMatch,
      confidence: 100,
      apiFilter: `MLSAreaMajor eq '${areaMatch}'`
    };
  }

  const communityMatch = MLS_EXACT_VALUES.communities.find(
    comm => comm.toLowerCase() === normalized
  );
  if (communityMatch) {
    return {
      found: true,
      field: "SubdivisionName",
      exactValue: communityMatch,
      confidence: 100,
      apiFilter: `contains(SubdivisionName, '${communityMatch}')`
    };
  }

  // 3. Fuzzy matching - find close matches
  const suggestions: string[] = [];
  
  [...MLS_EXACT_VALUES.cities, ...MLS_EXACT_VALUES.areas, ...MLS_EXACT_VALUES.communities]
    .forEach(value => {
      if (value.toLowerCase().includes(normalized) || normalized.includes(value.toLowerCase())) {
        suggestions.push(value);
      }
    });

  if (suggestions.length > 0) {
    return {
      found: false,
      suggestions: suggestions.slice(0, 5), // Top 5 suggestions
      confidence: 50
    };
  }

  // 4. No match found
  return {
    found: false,
    confidence: 0
  };
}

/**
 * Batch translate multiple user inputs
 */
export function translateMultipleInputs(inputs: string[]): {
  cities: string[];
  areas: string[];
  communities: string[];
  unmapped: string[];
} {
  const result = {
    cities: [] as string[],
    areas: [] as string[],
    communities: [] as string[],
    unmapped: [] as string[]
  };

  inputs.forEach(input => {
    const translation = translateUserInputToMLS(input);
    
    if (translation.found && translation.exactValue) {
      switch (translation.field) {
        case "City":
          result.cities.push(translation.exactValue);
          break;
        case "MLSAreaMajor":
          result.areas.push(translation.exactValue);
          break;
        case "SubdivisionName":
          result.communities.push(translation.exactValue);
          break;
      }
    } else {
      result.unmapped.push(input);
    }
  });

  return result;
}

/**
 * Build API filter string from user selections
 */
export function buildMLSAPIFilter(params: {
  zones?: string[];
  areas?: string[];
  communities?: string[];
  subdivisions?: string[];
}): string {
  const filters: string[] = [];

  // Translate and build City filter
  if (params.zones && params.zones.length > 0) {
    const translatedCities = params.zones
      .map(zone => translateUserInputToMLS(zone))
      .filter(t => t.found && t.field === "City")
      .map(t => t.exactValue!);

    if (translatedCities.length === 1) {
      filters.push(`City eq '${translatedCities[0]}'`);
    } else if (translatedCities.length > 1) {
      const cityFilters = translatedCities.map(c => `City eq '${c}'`);
      filters.push(`(${cityFilters.join(' or ')})`);
    }
  }

  // Translate and build MLSAreaMajor filter
  if (params.areas && params.areas.length > 0) {
    const translatedAreas = params.areas
      .map(area => translateUserInputToMLS(area))
      .filter(t => t.found && t.field === "MLSAreaMajor")
      .map(t => t.exactValue!);

    if (translatedAreas.length === 1) {
      filters.push(`MLSAreaMajor eq '${translatedAreas[0]}'`);
    } else if (translatedAreas.length > 1) {
      const areaFilters = translatedAreas.map(a => `MLSAreaMajor eq '${a}'`);
      filters.push(`(${areaFilters.join(' or ')})`);
    }
  }

  // Translate and build SubdivisionName filter
  const allCommunities = [
    ...(params.communities || []),
    ...(params.subdivisions || [])
  ];

  if (allCommunities.length > 0) {
    const translatedCommunities = allCommunities
      .map(comm => translateUserInputToMLS(comm))
      .filter(t => t.found && t.field === "SubdivisionName")
      .map(t => t.exactValue!);

    if (translatedCommunities.length === 1) {
      filters.push(`contains(SubdivisionName, '${translatedCommunities[0]}')`);
    } else if (translatedCommunities.length > 1) {
      const commFilters = translatedCommunities.map(c => `contains(SubdivisionName, '${c}')`);
      filters.push(`(${commFilters.join(' or ')})`);
    }
  }

  return filters.join(' and ');
}

/**
 * Validate if filter values will work with MLS API
 */
export function validateMLSFilters(filters: {
  zones?: string[];
  areas?: string[];
  communities?: string[];
}): {
  valid: boolean;
  warnings: string[];
  translations: Record<string, string>;
} {
  const warnings: string[] = [];
  const translations: Record<string, string> = {};

  // Check zones
  filters.zones?.forEach(zone => {
    const result = translateUserInputToMLS(zone);
    if (!result.found) {
      warnings.push(`Zone "${zone}" not found in MLS. Suggestions: ${result.suggestions?.join(', ') || 'None'}`);
    } else if (result.exactValue) {
      translations[zone] = result.exactValue;
    }
  });

  // Check areas
  filters.areas?.forEach(area => {
    const result = translateUserInputToMLS(area);
    if (!result.found) {
      warnings.push(`Area "${area}" not found in MLS. Suggestions: ${result.suggestions?.join(', ') || 'None'}`);
    } else if (result.exactValue) {
      translations[area] = result.exactValue;
    }
  });

  // Check communities
  filters.communities?.forEach(comm => {
    const result = translateUserInputToMLS(comm);
    if (!result.found) {
      warnings.push(`Community "${comm}" not found in MLS. Suggestions: ${result.suggestions?.join(', ') || 'None'}`);
    } else if (result.exactValue) {
      translations[comm] = result.exactValue;
    }
  });

  return {
    valid: warnings.length === 0,
    warnings,
    translations
  };
}
