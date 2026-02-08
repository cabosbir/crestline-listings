import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
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
  propertyTypes: ["Condos", "Houses"],
  status: "Active",
  zones: ["Cabo San Lucas"],
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
  "Cabo Corridor": ["CSL Cor-Inland", "CSL-Corr. Oceanside"],
  "Cabo San Lucas": ["CSL-Beach & Marina", "CSL-Centro", "CSL-North"],
  "Comondu": [],
  "East Cape": ["East Cape North", "East Cape South", "La Ribera", "Los Barriles", "BuenaVista/Rancho Leonero", "BuenVsta/LosBarilles", "ElCardonal/N of Bariles", "Vinorama/Cabo Pulmo", "Zacatitos/PtaPerfcta", "Bay of Dreams", "Costa Palmas"],
  "La Paz": ["La Paz City", "LaPaz Beach", "El Centenario", "El Sargento", "La Ventana", "Los Planes"],
  "Loreto": ["Loreto", "Loreto Bay", "Nopolo"],
  "Mulege": [],
  "Pacific": ["Pacific North", "Pacific South", "Pescadero/Cerritos", "Migrino Area"],
  "San Jose Corridor": ["SJD Corr-Inland", "SJD Corr-Oceanside"],
  "San Jose del Cabo": ["SJD-Beachside", "SJD-Centro", "SJD-East", "SJD-Inland/Golf", "SJD-North"],
};

  // Area → Community mapping
  const areaToCommunityMap: Record<string, string[]> = {
    "CSL-Beach & Marina": ["CSL Beach", "CSL Marina", "CSL Near Bch & Marina", "Pedregal CSL"],
    "CSL-Centro": ["Centro", "Pedregal CSL"],
    "CSL-North": ["CSL North-East 19", "CSL North-West 19", "El Tezal-East", "El Tezal-West", "El Tezal-OceanSide"],
    "CSL Cor-Inland": ["Cabo del Sol-Inland", "Cabo Bello", "Chileno Bay Club", "Chileno/Montage-Inland", "El Tezal-East", "El Tezal-West"],
    "CSL-Corr. Oceanside": ["Punta Ballena", "Misiones", "Chileno Bay Club", "Chileno Bay"],
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
    "Above Isla Coronado": ["General"],
    "Agua Verde": ["General"],
    "Bahia Concepcion": ["General"],
    "Bahía Asunción": [],
    "Bay of Dreams": ["Bay of Dreams"],
    "BayOfDreams/Ventanas": [
      "Bay of Dreams",
      "El Sargento",
      "La Ventana",
      "Madre Perla",
      "San Bartolo"
    ],
    "Beach north": [
      "Beach North Sub",
      "General"
    ],
    "Bellavista": [
      "Bellavista",
      "Palmira By Alttus"
    ],
    "BuenaVista/Rancho Leonero": [
      "Los Pinos",
      "Mar y Sol Condos",
      "Rancho Leonero"
    ],
    "BuenVsta/LosBarilles": [
      "B.Vista/Barilles-Gen",
      "Baja Martires",
      "Buena Vista",
      "Centro-Los Barriles",
      "Los Barriles",
      "Mar y Sol",
      "Mar y Viento",
      "Mision Buenavista",
      "Pallisades",
      "Primo Palmas",
      "Rancho Leonero",
      "Spa Buena Vista",
      "Villas Miramar"
    ],
    "Cabo Bello/Santa Carmela": [
      "Cabo Bello",
      "Calafia Condos",
      "Creta",
      "Playa del Rey",
      "Plaza Calafia",
      "Santa Carmela"
    ],
    "Cabo del Sol": [
      "Brisas",
      "Buena Vista",
      "Cove Club",
      "El Peon",
      "El Penon",
      "La Riviera",
      "Las Colinas",
      "Las Posadas",
      "Mar a Cielo",
      "Park Hyatt",
      "Puerta del Sol-CDSol",
      "Vista Azul"
    ],
    "Cabo del Sol Viejo": ["General"],
    "Cabo del Sol-Inland": ["Cabo del Sol-Inl Pro"],
    "Cabo Real-Inland": [
      "Bugambilias",
      "Gardenias",
      "Las Villas"
    ],
    "Cabo Real-Ocean Side": [
      "Cabo Real O/Side:Gen",
      "Casa del Mar",
      "El Dorado Casitas",
      "Las Ventanas"
    ],
    "Centro": [
      "Altamirano 1020",
      "Arua",
      "Bravana Living",
      "Centro",
      "General",
      "La Isla",
      "Laiva",
      "Lomas de Palmira",
      "Marina Palmira",
      "Morgan Residences",
      "Ocean Oasis",
      "Palmira By Alttus",
      "Punto Norte",
      "Residencial Coronado",
      "Torre Bivalvia",
      "Vista Cortes",
      "White 12",
      "Xantus Residences"
    ],
    "Centro- La Paz": [
      "Acqua",
      "Agua Blanca",
      "Agua Luna",
      "Aguajito, EL",
      "Ahorcadita",
      "Airport",
      "Albaluz",
      "Alcazaba",
      "Alegranza",
      "Almar",
      "Aloha",
      "Altamira Condominios Plus",
      "Alttus Homes",
      "Alttus Sunset",
      "Alvar",
      "Alzazaba",
      "Amaterra",
      "Amina Wind",
      "Ampliacion Centenario",
      "Andalaya",
      "Aqua Marina",
      "Arboledas",
      "Arcos del Mar",
      "Arena",
      "Asturias",
      "Atelier",
      "Aurora",
      "Bahia Azul",
      "Bahia Bella",
      "Bahia Bonita",
      "Bahia Celeste",
      "Bahia de La Paz",
      "Bahia Dorada",
      "Bahia Encantada",
      "Bahia Esmeralda",
      "Bahia Linda",
      "Bahia Serena",
      "Bahia Tranquila",
      "Bahia Turquesa",
      "Bahia Vista",
      "Balandra",
      "Balandra Bay",
      "Balandra Beach",
      "Balandra Hills",
      "Balandra Marina",
      "Balandra Shores",
      "Balandra Vista",
      "Bay View Estates",
      "Bella Costa",
      "Bella Mar",
      "Bella Marina",
      "Bella Vista",
      "Bello Horizonte",
      "Brisas de La Bahia",
      "Brisas de La Paz",
      "Brisas del Golfo",
      "Brisas del Mar",
      "Brisas del Pacifico",
      "Buena Ventura",
      "Cabo Norte",
      "Cactus Country Club",
      "Caleta",
      "Camino Real",
      "Campo de Golf",
      "Campestre",
      "Cantamar",
      "Caracol",
      "Carey",
      "Casa Blanca",
      "Casa Linda",
      "Casas del Mar",
      "Casitas",
      "Catemaco",
      "Centenario",
      "Cerro de La Cruz",
      "Chula Vista",
      "Cielo Azul",
      "Cielo Mar",
      "Club de Golf",
      "Club de Playa",
      "Club de Yates",
      "Club Marino",
      "Colinas",
      "Colinas de La Paz",
      "Colinas del Mar",
      "Colonia Abasolo",
      "Colonia Aeropuerto",
      "Colonia Aguilar",
      "Colonia Almendros",
      "Colonia Altamira",
      "Colonia Arboledas",
      "Colonia Aviacion",
      "Colonia Brisas",
      "Colonia Bugambilias",
      "Colonia Burrero",
      "Colonia California",
      "Colonia Camacho",
      "Colonia Centro",
      "Colonia Chametla",
      "Colonia Club de Yates",
      "Colonia Colosio",
      "Colonia Comercial",
      "Colonia Constituyentes",
      "Colonia Cuauhtemoc",
      "Colonia Cultura",
      "Colonia Del Rey",
      "Colonia Deportiva",
      "Colonia Desarrollo Urbano",
      "Colonia Dignidad",
      "Colonia El Conchalito",
      "Colonia El Manglito"
    ],
    "Centro- Cabo San Lucas": [],
    "Centro- San Jose del Cabo": [],
    "Cerro Colorado-Ocean": [
      "Cabo Colo-Ocean:Gen",
      "Cabo Colorado",
      "Dunna",
      "Las Terrazas",
      "Palmilla Sur",
      "Punta Bella",
      "Rancho Cerro Colorado",
      "Santarena"
    ],
    "CerroColorado-Inland": [
      "Antigua",
      "Cabo Colo-Inland:Gen",
      "Colorado Hills",
      "Dorado Hills",
      "Harmonia",
      "Ladera Phase 1",
      "Ladera San Jose- Fase 1",
      "Vista Colorada"
    ],
    "Chametla": [
      "Chametia",
      "Chametla",
      "Las Haciendas",
      "Marbella Residencial",
      "Portobello"
    ],
    "Chileno Bay": [],
    "Chileno Bay Club": [
      "Auberge Residences"
    ],
    "Pedregal CSL": [
      "Andalaya",
      "Bahia Mar",
      "Blue Bay-Pedregal",
      "Blue Moon",
      "Cabo Viejo",
      "Capella Pedregal",
      "Cascadas",
      "El RinconDel Pedrega",
      "Luna Pedregal",
      "Marina Side:General",
      "Mistiq Pedregal Los Cabos",
      "Monteluna",
      "Montemar Pedregal",
      "Pacific Side:General",
      "Pedregal",
      "Pedregal CSL",
      "Pedregal Heights",
      "Pedregal One",
      "Pedregal Plaza",
      "Pedregal Towers",
      "Portofino",
      "Santa Rita",
      "The Five",
      "The Mountain Club at Pedregal",
      "The O Pedregal",
      "The Resort at Pedregal",
      "Waldorf Astoria Residences"
    ],
    "CSL Beach": [
      "Bay View",
      "CSL Near Bch &Mar:Gen",
      "Hacienda CSL",
      "Terrasol",
      "Villa La Estancia"
    ],
    "CSL Marina": [
      "CSL Marina:General",
      "Marina",
      "Marina Cabo Plaza",
      "Marina Sol",
      "Plaza Bonita",
      "Plaza Nautica",
      "Puerto Paraiso",
      "Tesoro",
      "The Paraiso Residences"
    ],
    "CSL Near Bch & Marina": [
      "Aisha Cabo Living",
      "Bahia",
      "CSL Near Bch &Mar:Gen",
      "Carena",
      "Centro-CSL South",
      "Coyote",
      "Ekur",
      "Marea Los Cabos",
      "Marina",
      "Marina Sol",
      "One Medano",
      "Oro Y Azul",
      "Oro y Azul",
      "Park Cabo Residences",
      "Puerta Cabos Village",
      "Villas del Sol"
    ],
    "Chileno Bay/Montage": [
      "Chileno Bay",
      "Montage Residences"
    ],
    "Chileno/Montage-Inland": [
      "Chileno Inland-General"
    ],
    "Ciudad Constitución": [],
    "Club Campestre": [
      "Cora",
      "Costarena",
      "Hacienda Campestre",
      "Hideaways",
      "La Canada",
      "La Canada II",
      "La Cima",
      "Larena",
      "Los Valles",
      "Montecitos",
      "Privada del Lago",
      "Privadas",
      "Pueblo Campestre",
      "Sendero San José",
      "Solesta",
      "Villas de México",
      "Vista Hermosa",
      "Vista Lagos",
      "Wen Living"
    ],
    "Colina del Sol": [
      "Alttus Homes",
      "Alttus Sunset",
      "Colina del Sol",
      "Meraki",
      "Vista Bahia (La Paz)",
      "Vista Los Suenos",
      "Vista Los Suenos- Tower 3"
    ],
    "Comitan": [
      "Comitan"
    ],
    "Conquista Agraria": [
      "La Aguja"
    ],
    "Constitucion Community": [
      "Olimpico",
      "Puerto San Carlos"
    ],
    "Costa Azul Beach": [
      "Costa Azul",
      "El Zalate",
      "La Jolla",
      "La Residencia",
      "Las Olas",
      "Mira Vista",
      "Mykonos",
      "SJD-CostaAzulBch:Gen",
      "Soleado"
    ],
    "CSL Country Club": [
      "CSL C/Club Golf"
    ],
    "CSL North-East 19": [
      "Arcos del Sol",
      "Brisas del Pac East",
      "Brisas del Pacifico E",
      "CSL N-E of19:Genral",
      "El Progreso",
      "Lagunitas",
      "Lomas del Sol",
      "Lomas del Valle",
      "Mesa Colorada",
      "Misiones de Santa Fe",
      "Palmas at Sunset Bch",
      "Terranova"
    ],
    "CSL North-West 19": [
      "4 de Marzo",
      "Arcoiris",
      "Auroras",
      "Balcones",
      "Bellaterra",
      "Brisas del Pacifico W",
      "BugambiliaBellaVista",
      "CSL N,W of 1:General",
      "Cabo Pacifica",
      "Cangrejos",
      "Colinas de Cabo Baja",
      "Condominios CL II",
      "Condominios Playas",
      "Fracc Miranda",
      "Fracc Paraiso",
      "Hojazen",
      "Jacarandas",
      "Las Cabanas",
      "Lomas de Brisas",
      "Lomas del Faro",
      "Lomas del Pacifico",
      "Maralta",
      "Master Plaza Cardones",
      "Miramar",
      "Palma Real",
      "Palmitos Residencial",
      "Plaza Elam",
      "Portales",
      "Portanova I",
      "Residencial Las Brisas",
      "Residencial Santa Barbara",
      "Venados"
    ],
    "Danzante Bay": [
      "Beach Estates",
      "Beachfront Neighborhood",
      "Canyon Neighborhood",
      "Cardon Neighborhood",
      "Cliffside Neighborhood",
      "Mantarraya",
      "Mountain Neighborhood"
    ],
    "Diamante Cabo San Lucas": [
      "Beach Estates",
      "Cantinas",
      "Diamante",
      "Dunes Residence Club",
      "El Cardonal",
      "Golf Villa",
      "Golf Villas",
      "Las Casas",
      "Las Casitas",
      "Las Casitas Diamante",
      "Legacy Founders Estates",
      "Ocean Residence Club",
      "San Marcos",
      "Sunset Hill"
    ],
    "Ejido La Purisima": [
      "La Purisima"
    ],
    "Ejido Next South": [],
    "Ejidos/ Comondu": [
      "Ejido Tepentu"
    ],
    "El Aguajito": [],
    "El Centenario": [
      "Centenario- Centro",
      "Coral Bay",
      "El Centenario",
      "Haciendas Palo Verde",
      "Lomas del Centenario, Palo Verde",
      "Real Centenario",
      "Villas de Oasis",
      "Villas del Centenario",
      "Vista Dorada"
    ],
    "El Comitan": [
      "El Comitan"
    ],
    "El Dorado": [
      "El Dorado Casitas",
      "El Dorado Oceanfront Estate Lots",
      "El Dorado Oceanview Estate Lots",
      "El Dorado Villas"
    ],
    "El Encanto & Laguna": [
      "El Encanto",
      "La Laguna",
      "Laguna Hills",
      "Laguna Spring"
    ],
    "El Jalito": [],
    "El Jaral": [],
    "El Mogote": [
      "Paraiso del Mar"
    ],
    "El Rincon": [],
    "El Sargento": [
      "Amina Wind",
      "El Sargento"
    ],
    "El Teso": [],
    "Quivira": [
      "Alvar",
      "Club Villas",
      "Coronado",
      "Esperanza",
      "Las Residencias",
      "Las Villas",
      "Mavila",
      "Migaloo",
      "Pueblo Bonito Sunset Beach",
      "Quivira",
      "Section 28- Ocean Residences"
    ],
    "Querencia-Ocean side": [
      "Monte Cristo Estates",
      "Querencia"
    ],
    "Querencia-Inland": [
      "Querencia",
      "Section 1- Las Colinas",
      "Section 10- El Parque",
      "Section 12- Las Cabanas",
      "Section 13- El Lago",
      "Section 14- El Campo",
      "Section 15- El Cerrito",
      "Section 16- Laderas",
      "Section 18",
      "Section 18- Horizontes",
      "Section 19",
      "Section 19- LaVista-LaLoma",
      "Section 2",
      "Section 2- El Rincon",
      "Section 22F- La Montana",
      "Section 24- El Retiro",
      "Section 29- La Cresta",
      "Section 3- El Valle",
      "Section 4- Las Canadas",
      "Section 6- Las Verandas",
      "Section 7- Las Casitas",
      "Section 9- Club Villas"
    ],
    "Palmilla-Ocean Side": [
      "Caleta Loma",
      "Espiritu del Mar",
      "La Caleta",
      "Oceana Alta",
      "Oceano Alta",
      "Oceano Baja",
      "One&Only Palmilla",
      "Palmilla",
      "Palmilla Cove",
      "Palmilla Norte",
      "Punta Bella",
      "Villas de Montana",
      "Villas del Mar"
    ],
    "Palmilla-Inland": [
      "Dunes Residence Club",
      "Oasis Palmilla",
      "Palmilla",
      "Palmilla Canyon",
      "Palmilla Dunes",
      "Palmilla Estates",
      "Palmilla Fairway",
      "Palmilla Inland- General",
      "Villas de Oro"
    ],
    "Puerto Los Cabos": [
      "El Altillo",
      "Fundadores",
      "La Noria",
      "North Enclaves Ritz Carlton",
      "Puerto Los Cabos",
      "West Enclave Ritz-Carlton"
    ],
    "Costa Palmas": [
      "Costa Palmas Golf Residences",
      "Costa Palmas Marina Residences",
      "Four Seasons Residences"
    ],
    "Rancho San Lucas": [
      "Norman Estates",
      "Old Lighthouse Club Hacienda",
      "Pacific Bay",
      "Rancho San Lucas",
      "The Villas-Rcho Sn Lucas"
    ],
    "El Tezal-East": [
      "Altamar",
      "Amalfi",
      "Arcomar",
      "Betanya",
      "Cabo Costa",
      "Cabo Costa Mirador",
      "Casa Mex-Agaves",
      "Casa Mex-Bogumbilias",
      "Casa Mex-Las Flores",
      "Casa Mex-Las Palmas",
      "Casa Mexicana",
      "Ciruelos",
      "Condominios Kai",
      "Cresta del Mar",
      "Damiana Residences",
      "El Tezal E;General",
      "Eonia",
      "Hermitage",
      "La Mar",
      "La Vista",
      "Lumaria",
      "Marazul",
      "Maroma Los Cabos",
      "Mistiq Los Cabos",
      "Nahara Cabo Living",
      "OR Cabo Boutique Residences",
      "Oceana Wellness Residences",
      "Optimus Residences",
      "Paraiso del Tezal",
      "Picacho",
      "Plaza Las Olas",
      "Puerta de Hierro",
      "Puerta del Mar",
      "Punta Arena",
      "Rancho Par-El Cielito",
      "Rancho Paraiso",
      "Rancho Paraiso Ests",
      "Santa Lucia",
      "Santorini Residencial",
      "Satus",
      "Sierra Dorada",
      "Solaria",
      "Tamar",
      "Terrazas las Fuentes",
      "The Arc",
      "Tramonti",
      "Tramonti Paradiso",
      "Vista Azul",
      "Vista Bahia",
      "Vista del Arco",
      "Vistas del Tezal",
      "Vistazul"
    ],
    "El Tezal-OceanSide": [
      "El Tezal-OceanSide:General"
    ],
    "El Tezal-West": [],
    "El Tule-Inland": [
      "El Tule-Inland:General"
    ],
    "El Tule-Ocean Side": [
      "ElTule-O/Side:General"
    ],
    "ElCardonal/N of Bariles": [
      "Nrth of Barilles-Gen"
    ],
    "Elias Calles": [
      "Elias Calles",
      "Elias Calles-Gen"
    ],
    "Ensenada Blanca": [
      "General"
    ],
    "Espiritu del Mar": [
      "Espiritu del Mar",
      "Remanso de Espiritu"
    ],
    "Esterito": [
      "Esterito"
    ],
    "Fidepaz": [
      "Fidepaz"
    ],
    "Fonatur Golf & Hills": [
      "Fonatur",
      "Fonatur Golf & Hills"
    ],
    "Forjadores SJD": [
      "Forjadores SJD"
    ],
    "Gringo & Lito Hills": [
      "Gringo Hill",
      "Gringo/Lito General",
      "Grngo&Lito Hills:Gen",
      "Lito's Hill"
    ],
    "Hot Springs": [],
    "Insurgentes Community": [],
    "La Perla": [
      "La Perla"
    ],
    "La Posada": [
      "La Posada",
      "La Posada Condos"
    ],
    "La Ribera": [
      "Centro-La Ribera",
      "La Ribera",
      "La Ribera General",
      "Residences of La Ribera"
    ],
    "La Ventana": [
      "La Ventana",
      "La Ventana Village"
    ],
    "Ladera San José": [
      "Ladera Phase 1",
      "Ladera San Jose- Fase 1"
    ],
    "LaPaz Beach Community": [
      "LaPaz Beach Subdivision"
    ],
    "LaPaz Centro Community": [
      "Centro"
    ],
    "LaPaz East": [
      "LaPaz East"
    ],
    "LaPaz North Community": [],
    "LaPaz West": [
      "LaPaz West"
    ],
    "Ligui": [
      "General"
    ],
    "Lopez Mateos": [
      "Lopez Mateos",
      "Lopez Mateos- General"
    ],
    "Loreto": [
      "Loreto"
    ],
    "Loreto Bay": [
      "Loreto Bay"
    ],
    "Los Planes": [
      "Los Planes"
    ],
    "Magisterial / Infonavit": [
      "General",
      "Residencial UNO"
    ],
    "Maravilla": [
      "El Cielo Homesites",
      "Las Colinas Villas- Maravilla",
      "Las Lomas- Maravilla",
      "Las Olas- Maravilla",
      "Las Playas Villas- Maravilla",
      "Las Viudas Homesites",
      "Montage Residences",
      "Santa Maria Homesites"
    ],
    "Mesa Colorada": [],
    "Migrino Area": [
      "Migrino",
      "Migrino-Gen",
      "RanchoLasMargaritas",
      "The Palm"
    ],
    "Miraflores/Santiago": [
      "Mira & Santi General",
      "Miraflores",
      "Santiago"
    ],
    "Miramar": [
      "General"
    ],
    "Misiones": [
      "Misiones del Cabo",
      "Montigny",
      "The Cape Residences",
      "The Shores"
    ],
    "Mulege": [
      "General"
    ],
    "Nopolo": [
      "General"
    ],
    "Nopolo Hills": [
      "El Rincon A",
      "El Rincon B",
      "El Rincon C"
    ],
    "North Centro": [
      "General"
    ],
    "North Loreto Bay": [
      "General"
    ],
    "North Shore": [],
    "Pedregal de La Paz": [],
    "Pescadero/Cerritos": [
      "Avalon",
      "Brisa de Sal",
      "Calla Lily",
      "Cerritos",
      "Cerritos 2097",
      "Cerritos Dreams",
      "Cerritos Sunrise",
      "Cerritos-PacifCondos",
      "Cerritos/Pesca-Genrl",
      "Ciudad Cerritos",
      "Desert Moon",
      "Gallo 64",
      "Gavilan Villas",
      "Halo of Cerritos",
      "Huerta Hermosa",
      "Luna Pescadero",
      "Oasis del Mar",
      "Palm Beach",
      "Pescadero",
      "Pueblo Pescadero",
      "Punta Lobos",
      "Rancho Nuevo",
      "Salara Residences",
      "Salt Breeze",
      "Serenity at Cerritos",
      "Soleado",
      "Surf Residences",
      "Surfside Residences",
      "The Cliff at Cerritos",
      "The Grove",
      "The Tequila Ranch",
      "The View",
      "Tortuga Cerritos",
      "Villas de Cerritos Beach",
      "Vistasol"
    ],
    "Pto. Escondido": [
      "Tatamichin",
      "Waicuri 1",
      "Waicuri 2"
    ],
    "Puerta Bugambilias": [
      "Marvista"
    ],
    "Punta Ballena": [
      "Auberge Residences",
      "Esperanza",
      "Las Residencias",
      "Las Villas",
      "Punta Ballena"
    ],
    "Saddles/Sunset Bch Rd": [
      "Agua Luna",
      "Balmaceda",
      "Breeze of Cabo",
      "Cabo Pacific Residences",
      "Cabo Peninsula Residences",
      "Costa Mare",
      "El Descanso",
      "El Descanso II",
      "El Descanso III",
      "Fracc Lomas Del Cabo",
      "HD III",
      "HD IV",
      "Lienzo Charro",
      "Lunaterra",
      "Lunaterra II",
      "Luxotica II",
      "Luxotica III",
      "Luxotica IV",
      "Migaloo",
      "Miguel Herrera",
      "Miro Los Cabos",
      "Palma Blanca",
      "Punto Pedregal",
      "Quintas California",
      "San Charbel",
      "Sea Breeze",
      "Sea Breeze II",
      "Sunset",
      "Sunset:General",
      "Sunset Hills",
      "Terra 192",
      "Terra 194",
      "Three Point Tower",
      "Villa Dorada",
      "Villas Emmanuel",
      "Vista Mare",
      "Vista Panorama"
    ],
    "San Bartolo": [
      "San Bartolo"
    ],
    "San Cosme": [
      "San Cosme Gen"
    ],
    "San Cristobal": [
      "Rolling Hills",
      "San Cristobal",
      "San Cristobal-Gen"
    ],
    "San Juan de la Costa": [
      "El Cajete",
      "San Juan de la Costa"
    ],
    "San Juanico": [
      "San Juanico"
    ],
    "San Pedro": [
      "San Pedro"
    ],
    "Santa Rosalia": [
      "General"
    ],
    "Santo Domingo": [],
    "Second Town Name": [],
    "SJD above Hwy 1": [
      "Belposto",
      "Chamizal",
      "Chamizal EL",
      "Chula Vista",
      "Healios Consultorios",
      "Jesus Castro Agundez",
      "Macrolotes Cantares",
      "Magisterial",
      "Mauricio Castro",
      "Rodas Residencial",
      "SJD above 1:General",
      "Vitai",
      "Zarzal"
    ],
    "SJD Downtown": [
      "1 Ro de Mayo",
      "8 de Octubre",
      "Centro-SJD",
      "Residencial Coronado",
      "SJD D/town:General"
    ],
    "SJD Marina": [
      "Avita Living San Jose",
      "Cabo Cortez",
      "El Rincon-SJD Marina",
      "La Choya",
      "La Playita",
      "One Marina Place",
      "Portside Place",
      "SJD Marina:General",
      "Sendero San José",
      "Tamarindos"
    ],
    "SJD North-E of 1": [
      "Biznaga",
      "Las Varedas",
      "Las Veredas",
      "Santa Rosa"
    ],
    "SJD North-W of 1": [
      "Aguajito, EL",
      "Airport",
      "Ampliacion El Zacata",
      "Ampliacion Zacatal",
      "Castellana Residencial",
      "Colinas de San Jose",
      "El Rosarito",
      "Hideaways",
      "Llanes Residencial",
      "Lomas del Rosarito",
      "Luis Donaldo Colosio",
      "Monte Bello Plus",
      "Monte Real",
      "SJD N,W of 1:General",
      "San Jose Viejo",
      "Santa Rosa",
      "Torres San Jose",
      "Vista Hermosa",
      "Zacatal"
    ],
    "SJD-Beach": [
      "Albaluz",
      "Aura",
      "Emma",
      "La Jolla - Condos",
      "Las Mananitas",
      "Mar Adentro",
      "Nolah",
      "Punto NIma",
      "Sampaquita",
      "Serena Residences",
      "Tortuga Bay",
      "Viceroy Residences",
      "Vidah",
      "Viva"
    ],
    "South": [],
    "South LaPaz Community": [],
    "Todos Santos": [
      "Ahorcadita",
      "Bajaterra",
      "Blue Bay-Uptown",
      "Cardinal Living",
      "Centro-Todos Santos",
      "Cobalto",
      "Coromuel",
      "Dieciocho",
      "El Posito",
      "La Cachora",
      "La Isla",
      "La Maquina",
      "La Pastora",
      "La Poza",
      "La Vibra",
      "Las Brisas- Todos Santos",
      "Las Brisas-Esencia",
      "Las Tunas",
      "Los Jardines",
      "Mirador",
      "Mirador San Lucas",
      "Monte Sion",
      "Palms Garden Residences",
      "Playitas Norte",
      "Roca Vista",
      "San Sebastian",
      "Santas and Santos",
      "Sky Town",
      "Todos Santos Colony",
      "Todos Santos Nth-Gen",
      "Todos Santos Town House",
      "Todos Santos-General",
      "Villas Mar de Sol",
      "Villas de Todos Santos",
      "Vistamar"
    ],
    "Todos Santos North": [
      "Agua Blanca",
      "Las Playitas",
      "Todos Santos Nth-Gen"
    ],
    "Uptown/Border Rd": [
      "Arenal",
      "Bajaterra",
      "Blue Bay-Uptown",
      "Cardinal Living",
      "Centro-CSL North",
      "Cobalto",
      "Coromuel",
      "Dhoka Plaza Comercial",
      "La Isla",
      "Master Plaza Center 36",
      "Mirador",
      "Mirador San Lucas",
      "Monte Sion",
      "Roca Vista",
      "Sky Town",
      "Uptown:General"
    ],
    "Villas Gp. Development": [],
    "Vinorama/Cabo Pulmo": [
      "Boca del Salado",
      "Cabo Pulmo",
      "Cabo Pulmo Beach Resort",
      "Castillo de Arena",
      "Costa de Oro",
      "La Linea",
      "Las Barracas",
      "Los Frailes",
      "Pindojo",
      "Vinora/CaboPulmo-Gen",
      "Vinorama",
      "Vinorama Estates",
      "Vinoramas"
    ],
    "Zacatitos/PtaPerfcta": [
      "Bahia Terranova",
      "Nine Palms",
      "Playa Tortuga",
      "Punta Perfecta",
      "Rancho Dos Ballenas",
      "Rancho La Laguna",
      "Rancho Los Amigos",
      "Rancho Tortuga",
      "San Luis",
      "San Luis Nuevo",
      "Shipwrecks",
      "Vinorama Estates",
      "Zacatit/PtaPerfc-Gen",
      "Zacatitos",
      "Zacaton"
    ],
    "Zaragoza": [
      "General"
    ],
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
      propertyTypes: filters.propertyTypes,
      propertyTypesLength: filters.propertyTypes.length,
      zones: filters.zones,
      areas: filters.areas,
      communities: filters.communities,
      subdivisions: filters.subdivisions,
      minBeds: filters.minBeds,
      minBaths: filters.minBaths
    });

    const debounce = setTimeout(() => {
      // Check if ANY meaningful filters are set
      const hasLocationFilters = filters.zones.length > 0 || filters.areas.length > 0 ||
                                 filters.communities.length > 0 || filters.subdivisions.length > 0;
      const hasSearch = filters.mlsSearch.trim() !== "";
      const hasPropertyTypeFilter = filters.propertyTypes.length > 0 && filters.propertyTypes.length < propertyTypes.length;
      const hasPriceFilter = filters.minPrice !== "$50,000" || filters.maxPrice !== "$3 Million";
      const hasBedsFilter = filters.minBeds !== "1+";
      const hasBathsFilter = filters.minBaths !== "Any";
      const hasSpecialFilters = filters.sellerFinancing || filters.primaryView || filters.currentPrice;

      const hasAnyFilter = hasLocationFilters || hasSearch || hasPropertyTypeFilter ||
                          hasPriceFilter || hasBedsFilter || hasBathsFilter || hasSpecialFilters;

      console.log('🎯 Filter check:', {
        propertyTypes: filters.propertyTypes,
        hasPropertyTypeFilter,
        hasLocationFilters,
        hasAnyFilter,
        willFetch: hasAnyFilter
      });

      if (hasAnyFilter) {
        console.log('🔄 Filter changed - fetching preview...', {
          propertyTypes: filters.propertyTypes,
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

      // 🔍 Detect MLS number pattern - if searching by MLS#, skip all other filters
      const mlsNumberPattern = /^\d{2}-\d{3,5}$/;
      const isMlsNumberSearch = mlsNumberPattern.test(filters.mlsSearch.trim());

      if (isMlsNumberSearch) {
        console.log(`🔍 MLS number detected: "${filters.mlsSearch.trim()}" - bypassing other filters for exact match`);
      }

      // ✅ Location filters - Skip when doing MLS number search
      if (!isMlsNumberSearch && filters.zones.length > 0) {
        apiFilters.city = filters.zones.join(',');
        console.log('  📍 City filter:', apiFilters.city);
      }
      if (!isMlsNumberSearch && filters.areas.length > 0) {
        apiFilters.areas = filters.areas.join(',');
        console.log('  📍 Area filter:', apiFilters.areas);
      }
      if (!isMlsNumberSearch && (filters.communities.length > 0 || filters.subdivisions.length > 0)) {
        apiFilters.communities = [...filters.communities, ...filters.subdivisions].join(',');
        console.log('  📍 Community filter:', apiFilters.communities);
      }

      if (!isMlsNumberSearch && filters.minPrice !== "No Preference" && filters.minPrice !== "$50,000") {
        apiFilters.minPrice = parsePrice(filters.minPrice);
        console.log('  💰 Min price:', apiFilters.minPrice);
      }

      if (!isMlsNumberSearch && filters.maxPrice !== "No Preference" && filters.maxPrice !== "$3 Million") {
        apiFilters.maxPrice = parsePrice(filters.maxPrice);
        console.log('  💰 Max price:', apiFilters.maxPrice);
      }
      
      // ✅ Check if ONLY Land is selected (Land parcels have 0 beds/baths)
      const isLandOnly = filters.propertyTypes.length === 1 && filters.propertyTypes[0] === "Land";

      // Skip property type, bed/bath, and status filters when searching by MLS number
      if (!isMlsNumberSearch) {
        if (filters.propertyTypes.length > 0 && filters.propertyTypes.length < propertyTypes.length) {
          apiFilters.propertyTypes = filters.propertyTypes.join(',');
          console.log('  🏠 Property types filter:', apiFilters.propertyTypes);
        }

        // Only apply bedroom filter if NOT searching for Land only
        if (filters.minBeds !== "Any" && !isLandOnly) {
          apiFilters.bedrooms = parseInt(filters.minBeds.replace('+', ''));
          console.log('  🛏️ Min beds:', apiFilters.bedrooms);
        }

        // Only apply bathroom filter if NOT searching for Land only
        if (filters.minBaths !== "Any" && !isLandOnly) {
          apiFilters.bathrooms = parseInt(filters.minBaths.replace('+', ''));
          console.log('  🚿 Min baths:', apiFilters.bathrooms);
        }

        if (filters.status && filters.status !== "Active") {
          apiFilters.status = filters.status;
          console.log('  📊 Status:', apiFilters.status);
        }
      }
      
      if (filters.mlsSearch.trim()) {
        apiFilters.search = filters.mlsSearch.trim();
        console.log('  🔍 Search term:', apiFilters.search);
      }

      // 🆕 SUPERPOWER: Auto-discover and validate special filters with AI
      // Skip special filters when doing MLS number search (exact match should ignore all other filters)
      if (!isMlsNumberSearch && (filters.sellerFinancing || filters.primaryView || filters.currentPrice)) {
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
    
    // Only send propertyTypes if not the default 2
    const defaultTypes = ["Condos", "Houses"];
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
      propertyTypes: ["Condos", "Houses"],
      status: "Active",
      zones: ["Cabo San Lucas"],
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
    console.log(`🏠 Toggle Property Type: "${type}"`);
    setFilters(prev => {
      const newPropertyTypes = prev.propertyTypes.includes(type)
        ? prev.propertyTypes.filter(t => t !== type)
        : [...prev.propertyTypes, type];

      console.log(`  Before: [${prev.propertyTypes.join(', ')}]`);
      console.log(`  After: [${newPropertyTypes.join(', ')}]`);
      console.log(`  Array reference changed: ${prev.propertyTypes !== newPropertyTypes}`);

      return {
        ...prev,
        propertyTypes: newPropertyTypes
      };
    });
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
      <Helmet>
        <title>Advanced Property Search | Interactive Map Search | Cabo San Lucas Real Estate</title>
        <meta 
          name="description" 
          content="Search Cabo San Lucas real estate with our advanced interactive map. Filter by zone, area, community, price, bedrooms. Real-time MLS property search with live map preview." 
        />
        <link rel="canonical" href="https://www.bircabo.com/search" />
        <meta property="og:url" content="https://www.bircabo.com/search" />
        <meta property="og:title" content="Advanced Property Search | Cabo San Lucas Real Estate Map" />
        <meta property="og:description" content="Interactive map search for Cabo San Lucas properties. Filter by location, price, size. Real-time MLS results." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <Navbar />

      {/* Header Bar with AI Intelligence Indicator */}
      <div className="fixed top-16 left-0 right-0 bg-card border-b border-border z-40 shadow-sm">
        <div className="container mx-auto px-4 py-3 md:py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
            <Button variant="ghost" size="sm" onClick={() => navigate('/properties')}>
              <X className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Close</span>
            </Button>
            <div className="flex-1 md:flex-none">
              <h1 className="text-base md:text-xl font-bold truncate">Advanced Property Search</h1>
              <p className="text-xs md:text-sm text-muted-foreground truncate">
                {loading ? 'Searching...' : totalCount > 0 ? `${totalCount} properties found` : 'Select filters or search MLS'}
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" onClick={handleReset} size="sm" className="flex-1 md:flex-none">
              Reset
            </Button>

            {/* 🆕 SMART BUTTON WITH TOOLTIP */}
            <div className="relative group flex-1 md:flex-none">
              <Button
              onClick={handleSearch}
              disabled={totalCount === 0}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white w-full md:w-auto"
            >
              <Search className="w-4 h-4 md:mr-2" />
              <span className="hidden sm:inline">View</span> {totalCount}
            </Button>

            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-32 flex flex-col md:flex-row h-screen">
        {/* Left Sidebar - Filters */}
        <div className="w-full md:w-96 bg-card md:border-r border-border overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 h-[50vh] md:h-[calc(100vh-8rem)]">
          
          {/* MLS Search Bar */}
          <div className="sticky top-0 bg-card z-10 pb-4 -mt-2 border-b border-border">
            <Label className="text-base md:text-lg font-bold mb-2 md:mb-3 block">Search MLS Database</Label>
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
                className="w-full pl-10 pr-10 text-sm md:text-base py-2.5 md:py-2"
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
            <Label className="text-base md:text-lg font-bold mb-2 md:mb-3 block">Property Type</Label>
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
            <Label className="text-base md:text-lg font-bold mb-2 md:mb-3 block">Status</Label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full border border-border rounded px-3 py-2.5 md:py-2 text-sm md:text-base"
            >
              <option>Active</option>
              <option>Pending</option>
              <option>Closed</option>
            </select>
          </div>

          {/* Zones */}
          <div>
            <Label className="text-base md:text-lg font-bold mb-2 md:mb-3 block">
              Zone ({filters.zones.length} selected)
            </Label>
            <div className="max-h-48 overflow-y-auto space-y-2 border border-border rounded p-2 md:p-3">
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
            <Label className="text-base md:text-lg font-bold mb-2 md:mb-3 block">
              Area ({filters.areas.length} selected)
            </Label>
            {filters.zones.length > 0 && (
              <p className="text-xs text-blue-600 mb-2">
                ✓ Showing areas for: {filters.zones.join(", ")}
              </p>
            )}
            <div className="max-h-48 overflow-y-auto space-y-2 border border-border rounded p-2 md:p-3">
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
            <Label className="text-base md:text-lg font-bold mb-2 md:mb-3 block">
              Community ({filters.communities.length} selected)
            </Label>
            {(filters.zones.length > 0 || filters.areas.length > 0) && (
              <p className="text-xs text-blue-600 mb-2">
                ✓ Filtered by: {filters.areas.length > 0 ? filters.areas.join(", ") : filters.zones.join(", ")}
              </p>
            )}
            <div className="max-h-48 overflow-y-auto space-y-2 border border-border rounded p-2 md:p-3">
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
            <Label className="text-base md:text-lg font-bold mb-2 md:mb-3 block">
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
            <div className="max-h-48 overflow-y-auto space-y-2 border border-border rounded p-2 md:p-3">
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
            <Label className="text-base md:text-lg font-bold mb-2 md:mb-3 block">Special Filters</Label>
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
            <Label className="text-base md:text-lg font-bold mb-2 md:mb-3 block">Price Range</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Min Price</Label>
                <select
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  className="w-full border border-border rounded px-3 py-2.5 md:py-2 text-sm md:text-base"
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
                  className="w-full border border-border rounded px-3 py-2.5 md:py-2 text-sm md:text-base"
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
            <Label className="text-base md:text-lg font-bold mb-2 md:mb-3 block">Bedrooms & Bathrooms</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Min Beds</Label>
                <select
                  value={filters.minBeds}
                  onChange={(e) => setFilters({ ...filters, minBeds: e.target.value })}
                  className="w-full border border-border rounded px-3 py-2.5 md:py-2 text-sm md:text-base"
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
                  className="w-full border border-border rounded px-3 py-2.5 md:py-2 text-sm md:text-base"
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
        <div className="flex-1 relative h-[50vh] md:h-auto">
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