import { useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Upload, X, Image as ImageIcon } from "lucide-react";

// FLEX names from the verified public inventory; free text also supports unlisted locations.
const evaluationLocations = {"subdivision":["1  Ro de Mayo — San Jose del Cabo — SJD-Centro","4 de Marzo — Cabo San Lucas — CSL-North","8 de Octobre — San Jose del Cabo — SJD-Centro","Agua Blanca — La Paz — Pacific North","Agua Blanca — Pacific — Pacific North","Agua Viva — Loreto — Nopolo","Ahorcadita — La Paz — Pacific North","Ahorcadita — Pacific — Pacific North","Airport — San Jose del Cabo — SJD-North","Alba Residences — Cabo Corridor — CSL Cor-Inland","Albaluz — San Jose del Cabo — SJD-Beachside","Alegranza — San Jose del Cabo — SJD-Inland/Golf","Almar — La Paz — La Paz City","Aloha — San Jose del Cabo — SJD-Inland/Golf","Altamar — Cabo Corridor — CSL Cor-Inland","Altamira Condominios Plus — Cabo San Lucas — CSL-North","Alttus Homes — La Paz — La Paz City","Alttus Sunset — La Paz — La Paz City","Alvar — Pacific — Pacific South","Amalfi — Cabo Corridor — CSL Cor-Inland","Amaterra — Cabo Corridor — CSL-Corr. Oceanside","Amina Wind — La Paz — El Sargento","Ampliacion Centenario — La Paz — El Centenario","Andalaya — Cabo San Lucas — CSL-Beach & Marina","Aqualoft — La Paz — La Paz City","Arenal — Cabo San Lucas — CSL-Centro","Aromi Residences — Cabo Corridor — CSL Cor-Inland","Arua — La Paz — La Paz City","Auberge Residences — Cabo Corridor — CSL-Corr. Oceanside","Auroras — Cabo San Lucas — CSL-North","Avalon — Cabo Corridor — CSL Cor-Inland","B.Vista/Barilles-Gen — East Cape — East Cape North","Bahia — Cabo San Lucas — CSL-Beach & Marina","Bahia Bella — La Paz — El Centenario","Bahia del Tezal — Cabo Corridor — CSL-Corr. Oceanside","Bahia Terranova — East Cape — East Cape South","Baja Martires — East Cape — East Cape North","Balena — Cabo Corridor — CSL Cor-Inland","Balmaceda — Cabo San Lucas — CSL-Centro","Balmar — Cabo Corridor — CSL Cor-Inland","Bay of Dreams — East Cape — East Cape North","Bay of Dreams — La Paz — Bay of Dreams","Bay View — Cabo San Lucas — CSL-Beach & Marina","Beach Estates — Pacific — Pacific South","Bellavista — La Paz — La Paz City","Belposto — San Jose del Cabo — SJD-Inland/Golf","Best Suites — Cabo San Lucas — CSL-Centro","Betanya — Cabo Corridor — CSL Cor-Inland","Blue Bay-Pedregal — Cabo San Lucas — CSL-Beach & Marina","Blue Moon — Cabo San Lucas — CSL-Beach & Marina","Boca del Alamo — East Cape — East Cape North","Boca del Salado — East Cape — East Cape South","Breeze of Cabo — Cabo San Lucas — CSL-Centro","Brisa de Sal — Pacific — Pacific South","Brisas — Cabo Corridor — CSL-Corr. Oceanside","Brisas del Pac East — Cabo San Lucas — CSL-North","Brisas del Pacifico E — Cabo San Lucas — CSL-North","Brisas del Tezal — Cabo Corridor — CSL Cor-Inland","Buena Vista — East Cape — East Cape North","Buenos Aires — East Cape — East Cape North","Bugambilias — San Jose Corridor — SJD Corr-Inland","Cabo 10 — Cabo Corridor — CSL Cor-Inland","Cabo Bello — Cabo Corridor — CSL-Corr. Oceanside","Cabo Colo-Inland:Gen — San Jose Corridor — Cerro Colorado","Cabo Colo-Inland:Gen — San Jose Corridor — SJD Corr-Inland","Cabo Colo-Ocean:Gen — San Jose Corridor — Cerro Colorado","Cabo Colo-Ocean:Gen — San Jose Corridor — SJD Corr-Oceanside","Cabo Colorado — San Jose Corridor — Cerro Colorado","Cabo Colorado — San Jose Corridor — SJD Corr-Oceanside","Cabo Cortez — San Jose del Cabo — SJD-East","Cabo Costa — Cabo Corridor — CSL Cor-Inland","Cabo del Mar Ecopark — Cabo Corridor — CSL Cor-Inland","Cabo Peninsula Residences — Cabo San Lucas — CSL-Centro","Cabo Pulmo — East Cape — East Cape South","Cabo Shopping Spot — Cabo Corridor — CSL Cor-Inland","Cabo Viejo — Cabo San Lucas — CSL-Beach & Marina","Caleta Loma — San Jose Corridor — SJD Corr-Oceanside","Calla Lily — Pacific — Pacific South","Camino del Mar — Cabo Corridor — CSL Cor-Inland","Camino Viejo Condominiums — Cabo Corridor — CSL-Corr. Oceanside","Candelilla — East Cape — East Cape North","Cangrejos — Cabo San Lucas — CSL-North","Canyon Neighborhood — Loreto — Excondido South","Cardinal Living- Cab San Lucas — Cabo San Lucas — CSL-Centro","Cardon Neighborhood — Loreto — Escondido South","Cardon Neighborhood — Loreto — Excondido South","Casa del Mar — San Jose Corridor — SJD Corr-Oceanside","Casa Mex-Bogumbilias — Cabo Corridor — CSL Cor-Inland","Casa Mex-Las Flores — Cabo Corridor — CSL Cor-Inland","Casa Mex-Las Palmas — Cabo Corridor — CSL Cor-Inland","Casa Mexicana — Cabo Corridor — CSL Cor-Inland","Casa Nima — San Jose del Cabo — SJD-Inland/Golf","Cascadas — Cabo San Lucas — CSL-Beach & Marina","Castellana Residencial — San Jose del Cabo — SJD-North","Castillo de Arena — East Cape — East Cape South","Cenit — San Jose del Cabo — SJD-Inland/Golf","Centenario- Centro — La Paz — El Centenario","Centro — Cabo San Lucas — CSL-Centro","Centro — La Paz — La Paz City","Centro — Loreto — Loreto","Centro — Mulege — Mulege","Centro-CSL North — Cabo San Lucas — CSL-Centro","Centro-CSL South — Cabo San Lucas — CSL-Beach & Marina","Centro-La Ribera — East Cape — East Cape South","Centro-Los Barriles — East Cape — East Cape North","Centro-SJD — San Jose del Cabo — SJD-Centro","Centro-Todos Santos — La Paz — Pacific North","Centro-Todos Santos — Pacific — Pacific North","Cerritos — Pacific — Pacific South","Cerritos 2097 — Pacific — Pacific South","Cerritos Sunrise — Pacific — Pacific South","Cerritos/Pesca-Genrl — Pacific — Pacific South","Chametla — La Paz — El Centenario","Chamizal — San Jose del Cabo — SJD-Centro","Chamizal, EL — San Jose del Cabo — SJD-Centro","Chileno Bay — Cabo Corridor — CSL-Corr. Oceanside","Chileno Inland-General — Cabo Corridor — CSL Cor-Inland","Chula Vista — San Jose del Cabo — SJD-Centro","Cian — Cabo Corridor — CSL Cor-Inland","Ciruelos — Cabo Corridor — CSL Cor-Inland","Ciudad Cerritos — Pacific — Pacific South","Club La Costa — San Jose del Cabo — SJD-Inland/Golf","Colina Blanca — San Jose Corridor — SJD Corr-Oceanside","Colina del Sol — East Cape — East Cape North","Colina del Sol — La Paz — La Paz City","Colinas de Cabo Baja — Cabo San Lucas — CSL-North","Colinas de San Jose — San Jose del Cabo — SJD-North","Colinas del Tezal — Cabo Corridor — CSL Cor-Inland","Colorado Hills — San Jose Corridor — SJD Corr-Inland","Comitan — La Paz — El Centenario","Concepcion — San Jose del Cabo — SJD-East","Contigo Cerritos — Pacific — Pacific South","Copala — Pacific — Pacific South","Cora — San Jose del Cabo — SJD-Inland/Golf","Coromuel — Cabo San Lucas — CSL-Centro","Coromuel- La Paz — La Paz — La Paz City","Coronado — Pacific — Pacific South","Costa Azul — San Jose del Cabo — SJD-Beachside","Costa Baja Resort — La Paz — LaPaz Beach","Costa de Oro — East Cape — East Cape South","Costa Living by Nima — East Cape — East Cape South","Costa Mare — Cabo San Lucas — CSL-Centro","Costa Palmas Marina Residences — East Cape — East Cape South","Costarena — San Jose del Cabo — SJD-Inland/Golf","Cove Club — Cabo Corridor — CSL-Corr. Oceanside","Coyote — Cabo San Lucas — CSL-Beach & Marina","Cresta del Mar — Cabo Corridor — CSL Cor-Inland","CSL C/Club Golf — Cabo Corridor — CSL Cor-Inland","CSL Marina:General — Cabo San Lucas — CSL-Beach & Marina","CSL N- W 19- General — Cabo San Lucas — CSL-North","CSL N-E of19:Genral — Cabo San Lucas — CSL-North","CSL Near Bch &Mar:Gen — Cabo San Lucas — CSL-Beach & Marina","Cuatrovientos — Cabo Corridor — CSL Cor-Inland","Cumbre del Tezal — Cabo Corridor — CSL Cor-Inland","Desert Moon — Pacific — Pacific South","Dhoka Plaza Comercial — Cabo San Lucas — CSL-Centro","Diamante Dunes Residence — Pacific — Pacific South","Dos Piedras — Cabo Corridor — CSL Cor-Inland","Dream Tezal — Cabo Corridor — CSL Cor-Inland","Duara — Cabo Corridor — CSL Cor-Inland","Dunes Club Residences — Pacific — Pacific South","Dunes Residence Club — Pacific — Pacific South","Dunes Residence Club — San Jose Corridor — SJD Corr-Inland","Ejido Juan Dominguez Cota — La Paz — Los Planes","El Altillo — San Jose del Cabo — SJD-East","El Cajete — La Paz — San Juan de la Costa","El Cardonal — East Cape — East Cape North","El Centenario — La Paz — El Centenario","El Comitan — La Paz — El Centenario","El Descanso — Cabo San Lucas — CSL-Centro","El Descanso III — Cabo San Lucas — CSL-Centro","El Encanto — San Jose del Cabo — SJD-East","El Posito — Pacific — Pacific North","El Rincon-SJD Marina — San Jose del Cabo — SJD-East","El Rosarito — San Jose del Cabo — SJD-North","El Sargento — La Paz — El Sargento","El Tezal E;General — Cabo Corridor — CSL Cor-Inland","El Tezal W:General — Cabo Corridor — CSL Cor-Inland","El Tezal-OceanSide:General — Cabo Corridor — CSL-Corr. Oceanside","El Tule-Inland:General — San Jose Corridor — SJD Corr-Inland","El Zalate — San Jose del Cabo — SJD-Beachside","Elias Calles — Pacific — Pacific South","Elias Calles-Gen — Pacific — Pacific South","ElTule-O/Side:General — San Jose Corridor — SJD Corr-Oceanside","Emma — San Jose del Cabo — SJD-Beachside","Esperanza — Cabo Corridor — CSL-Corr. Oceanside","Espiritu del Mar — San Jose Corridor — SJD Corr-Oceanside","Esterito — La Paz — La Paz City","Fidepaz — La Paz — La Paz City","Finisterra — San Jose del Cabo — SJD-Inland/Golf","Founders — Loreto — Nopolo","Four Seasons Residences — East Cape — East Cape South","Fracc Lomas Del Cabo — Cabo San Lucas — CSL-Centro","Fracc Paraiso — Cabo San Lucas — CSL-North","Fundadores — San Jose del Cabo — SJD-East","Gallo 64 — Pacific — Pacific South","Gardenias — San Jose Corridor — SJD Corr-Inland","Gavilan Villas — Pacific — Pacific South","General — Cabo San Lucas — CSL-Centro","General — La Paz — La Paz City","General — Loreto — Excondido South","General — Loreto — Loreto","General — Loreto — Nopolo","General — Mulege — Mulege","Golf Villas — Pacific — Pacific South","Golf Villas-Rancho San Lucas — Pacific — Pacific South","Gringo Hill — San Jose del Cabo — SJD-Inland/Golf","Hacienda Campestre — San Jose del Cabo — SJD-Inland/Golf","Hacienda CSL — Cabo San Lucas — CSL-Beach & Marina","Hacienda Los Cabos — San Jose del Cabo — SJD-Inland/Golf","Haciendas Palo Verde — La Paz — El Centenario","Halo of Cerritos — Pacific — Pacific South","Harmonia — San Jose Corridor — SJD Corr-Inland","HD III — Cabo San Lucas — CSL-Centro","HD IV — Cabo San Lucas — CSL-Centro","Healios Consultorios — San Jose del Cabo — SJD-Centro","Hermitage — Cabo Corridor — CSL Cor-Inland","Hideaways — San Jose del Cabo — SJD-North","Hojazen — Cabo San Lucas — CSL-North","Huerta Hermosa — Pacific — Pacific South","Indigo Dunes — Cabo Corridor — CSL Cor-Inland","Jacarandas — Cabo San Lucas — CSL-North","Kaikoura — Cabo Corridor — CSL Cor-Inland","Kamu Living — Cabo Corridor — CSL Cor-Inland","La Cachora — Pacific — Pacific North","La Caleta — San Jose Corridor — SJD Corr-Oceanside","La Canada — San Jose del Cabo — SJD-Inland/Golf","La Canada II — San Jose del Cabo — SJD-Inland/Golf","La Choya — San Jose del Cabo — SJD-East","La Cima — Cabo Corridor — CSL Cor-Inland","La Cima — San Jose del Cabo — SJD-Inland/Golf","La Isla — Cabo San Lucas — CSL-Centro","La Jolla - Condos — San Jose del Cabo — SJD-Beachside","La Jolla — San Jose del Cabo — SJD-Beachside","La Laguna — San Jose del Cabo — SJD-East","La Maquina — Pacific — Pacific North","La Mar — Cabo Corridor — CSL Cor-Inland","La Noria — San Jose del Cabo — SJD-East","La Pastora — Pacific — Pacific North","La Playita — San Jose del Cabo — SJD-East","La Poza — Pacific — Pacific North","La Reserva at Querencia — San Jose Corridor — SJD Corr-Inland","La Ribera — East Cape — East Cape South","La Ribera General — East Cape — East Cape South","La Ventana — East Cape — East Cape North","La Ventana — La Paz — La Ventana","La Vibra — Pacific — Pacific North","La Vista — Cabo Corridor — CSL Cor-Inland","Ladera Phase 1 — San Jose Corridor — Cerro Colorado","Laguna Hills — San Jose del Cabo — SJD-East","Laguna Vista — San Jose del Cabo — SJD-Inland/Golf","LaPaz Beach Subdivision — La Paz — LaPaz Beach","Larena — San Jose del Cabo — SJD-Inland/Golf","Las Arenas — Cabo Corridor — CSL-Corr. Oceanside","Las Barracas — East Cape — East Cape South","Las Brisas- Todos Santos — La Paz — Pacific North","Las Brisas- Todos Santos — Pacific — Pacific North","Las Brisas-Esencia — Pacific — Pacific North","Las Casas — Pacific — Pacific South","Las Casitas — Pacific — Pacific South","Las Colinas — Cabo Corridor — CSL-Corr. Oceanside","Las Cuevas — East Cape — East Cape South","Las Lomas I — East Cape — East Cape South","Las Lomas II — East Cape — East Cape South","Las Mananitas — San Jose del Cabo — SJD-Beachside","Las Misiones — Cabo Corridor — CSL Cor-Inland","Las Palapas — Cabo Corridor — CSL Cor-Inland","Las Playitas — La Paz — Pacific North","Las Playitas — Pacific — Pacific North","Las Posadas — Cabo Corridor — CSL-Corr. Oceanside","Las Residencias — Cabo Corridor — CSL-Corr. Oceanside","Las Terrazas — Pacific — Pacific South","Las Terrazas — San Jose Corridor — SJD Corr-Oceanside","Las Tinas — East Cape — East Cape North","Las Tunas — La Paz — Pacific North","Las Tunas — Pacific — Pacific North","Las Varedas — San Jose del Cabo — SJD-North","Las Ventanas — San Jose Corridor — SJD Corr-Oceanside","Las Veredas — San Jose del Cabo — SJD-North","Lienzo Charro — Cabo San Lucas — CSL-Centro","Lighthouse Point Est — East Cape — East Cape South","Loma Linda — San Jose del Cabo — SJD-Inland/Golf","Lomas de Brisas — Cabo San Lucas — CSL-North","Lomas de la Jolla — San Jose del Cabo — SJD-Inland/Golf","Lomas de Palmira — La Paz — La Paz City","Lomas de Playa Sur — La Paz — La Ventana","Lomas del Centenario, Palo Verde — La Paz — El Centenario","Lomas del Desierto — San Jose del Cabo — SJD-Inland/Golf","Lomas del Faro — Cabo San Lucas — CSL-North","Lomas del Pacifico — Cabo San Lucas — CSL-North","Lomas del Rosarito — San Jose del Cabo — SJD-North","Lomas del Sol — Cabo San Lucas — CSL-North","Lomas del Valle — Cabo San Lucas — CSL-North","Lopez Mateos- General — Comondu — Mag Bay","Los Barriles — East Cape — East Cape North","Los Frailes — East Cape — East Cape South","Los Inocentes Ejido — La Paz — Pacific North","Los Jardines — Pacific — Pacific North","Los Murales — La Paz — La Paz City","Los Pinos — East Cape — East Cape South","Los Valles — San Jose del Cabo — SJD-Inland/Golf","Lucca Tower — Cabo Corridor — CSL Cor-Inland","Lumaria — Cabo Corridor — CSL Cor-Inland","Luna del Tezal — Cabo Corridor — CSL Cor-Inland","Luna Pedregal — Cabo San Lucas — CSL-Beach & Marina","Luna Pescadero — Pacific — Pacific South","Lunaterra — Cabo San Lucas — CSL-Centro","Lunaterra II — Cabo San Lucas — CSL-Centro","Luxotica II — Cabo San Lucas — CSL-Centro","Luxotica III — Cabo San Lucas — CSL-Centro","Luxotica IV — Cabo San Lucas — CSL-Centro","Macrolotes Cantares — San Jose del Cabo — SJD-Centro","Magisterial — San Jose del Cabo — SJD-Centro","Magisterial — San Jose del Cabo — SJD-Inland/Golf","Manana — Cabo Corridor — CSL Cor-Inland","Mar y Sol Condos — San Jose del Cabo — SJD-Inland/Golf","Maralta — Cabo San Lucas — CSL-North","Maranata — Cabo Corridor — CSL Cor-Inland","Marazul — Cabo Corridor — CSL Cor-Inland","Marbella Residencial — La Paz — El Centenario","Marea Los Cabos — Cabo San Lucas — CSL-Beach & Marina","Marella — San Jose Corridor — SJD Corr-Inland","Marina Cabo Plaza — Cabo San Lucas — CSL-Beach & Marina","Marina Palmira — La Paz — La Paz City","Marina Side:General — Cabo San Lucas — CSL-Beach & Marina","Marina Sol — Cabo San Lucas — CSL-Beach & Marina","Marina Sol — La Paz — La Paz City","Maroma Los Cabos — Cabo Corridor — CSL Cor-Inland","Marvista — La Paz — La Paz City","Master Plaza Cardones — Cabo San Lucas — CSL-North","Mauricio Castro — San Jose del Cabo — SJD-Centro","Mavila — Pacific — Pacific South","Mesa Colorada — Cabo San Lucas — CSL-North","Migaloo — Cabo San Lucas — CSL-Centro","Migaloo — Pacific — Pacific South","Migrino — Pacific — Pacific South","Migrino-Gen — Pacific — Pacific South","Miguel Herrera — Cabo San Lucas — CSL-Centro","Mira & Santi General — East Cape — East Cape South","Mirador — San Jose del Cabo — SJD-Inland/Golf","Miraflores — East Cape — East Cape South","Miramar — Cabo San Lucas — CSL-North","Miro Los Cabos — Cabo San Lucas — CSL-Centro","Mision Buenavista — East Cape — East Cape North","Misiones del Cabo — Cabo Corridor — CSL-Corr. Oceanside","Misiones SJ — San Jose del Cabo — SJD-Inland/Golf","Mistiq Los Cabos — Cabo Corridor — CSL Cor-Inland","Mistral- La Paz — La Paz — La Paz City","Monte Cabo — Cabo Corridor — CSL Cor-Inland","Monte Cristo Estates — Pacific — Pacific South","Monte Real — San Jose del Cabo — SJD-North","Monte Rocella — Cabo Corridor — CSL Cor-Inland","Montecitos — San Jose del Cabo — SJD-Inland/Golf","Monteluna — Cabo San Lucas — CSL-Beach & Marina","Montemar — East Cape — East Cape North","Montemar Pedregal — Cabo San Lucas — CSL-Beach & Marina","Montigny — Cabo Corridor — CSL-Corr. Oceanside","Morgan Residences — Cabo San Lucas — CSL-Centro","Nahara Cabo Living — Cabo Corridor — CSL Cor-Inland","Nine Palms — East Cape — East Cape South","Nolah — San Jose del Cabo — SJD-Beachside","Norman Estates — Pacific — Pacific South","North Enclaves Ritz Carlton — San Jose del Cabo — SJD-East","Nrth of Barilles-Gen — East Cape — East Cape North","Oasis — San Jose del Cabo — SJD-Inland/Golf","Oasis Palmilla — San Jose Corridor — SJD Corr-Inland","Ocean Club Residences — Pacific — Pacific South","Ocean Plaza — Cabo Corridor — CSL Cor-Inland","Oceana Wellness Residences — Cabo Corridor — CSL Cor-Inland","Oceano Alta — San Jose Corridor — SJD Corr-Oceanside","Old Lighthouse Club Hacienda — Pacific — Pacific South","One Marina Place — San Jose del Cabo — SJD-East","One Medano — Cabo San Lucas — CSL-Beach & Marina","OR Cabo Boutique Residences — Cabo Corridor — CSL Cor-Inland","Oriente Residencial — Cabo San Lucas — CSL-North","Pacific Bay — Pacific — Pacific South","Pacific Side:General — Cabo San Lucas — CSL-Beach & Marina","Palm Beach — Pacific — Pacific South","Palma Blanca — Cabo San Lucas — CSL-Centro","Palma Real — Cabo San Lucas — CSL-North","Palmilla Canyon — San Jose Corridor — SJD Corr-Inland","Palmilla Cove — San Jose Corridor — SJD Corr-Oceanside","Palmilla Estates — San Jose Corridor — SJD Corr-Inland","Palmilla Inland- General — San Jose Corridor — SJD Corr-Inland","Palmilla Norte — San Jose Corridor — SJD Corr-Oceanside","Palmilla Sur — San Jose Corridor — SJD Corr-Oceanside","Palmitos Residencial — Cabo San Lucas — CSL-North","Palo Blanco — East Cape — East Cape North","Panorama — Cabo Corridor — CSL Cor-Inland","Paraiso del Mar — La Paz — LaPaz Beach","Paraiso del Tezal — Cabo Corridor — CSL Cor-Inland","Park Hyatt — Cabo Corridor — CSL-Corr. Oceanside","Pedregal — La Paz — LaPaz Beach","Pedregal CSL — Cabo San Lucas — CSL-Beach & Marina","Pedregal Heights — Cabo San Lucas — CSL-Beach & Marina","Pedregal One — Cabo San Lucas — CSL-Beach & Marina","Peninsula — San Jose del Cabo — SJD-Inland/Golf","Pescadero — Pacific — Pacific South","Piazza Tramonti — Cabo Corridor — CSL Cor-Inland","Pindojo — East Cape — East Cape South","Playa Colorada — East Cape — East Cape South","Playa de la Paz — La Paz — LaPaz Beach","Playa del Rey — Cabo Corridor — CSL-Corr. Oceanside","Playa Tortuga — East Cape — East Cape South","Playas Pacificas — La Paz — Pacific North","Playas Pacificas — Pacific — Pacific North","Plaza Calafia — Cabo Corridor — CSL-Corr. Oceanside","Plaza Costa Sur — Cabo Corridor — CSL Cor-Inland","Plaza Elam — Cabo San Lucas — CSL-North","Plaza Las Olas — Cabo Corridor — CSL Cor-Inland","Plaza Magnus Center — Cabo San Lucas — CSL-Centro","Plaza Nautica — Cabo San Lucas — CSL-Beach & Marina","Portales — Cabo San Lucas — CSL-North","Portanova I — Cabo San Lucas — CSL-North","Portobello — La Paz — El Centenario","Portofino — Cabo San Lucas — CSL-Beach & Marina","Primo Palmas — East Cape — East Cape North","Privanzas — Cabo Corridor — CSL Cor-Inland","Pueblo Campestre — San Jose del Cabo — SJD-Inland/Golf","Pueblo Pescadero — Pacific — Pacific South","Puerta Cabos Village — Cabo San Lucas — CSL-Beach & Marina","Puerta del Mar — Cabo Corridor — CSL Cor-Inland","Puerta del Sol-CDSol — Cabo Corridor — CSL-Corr. Oceanside","Puerto San Carlos — Comondu — Constitucion","Punta Arena — Cabo Corridor — CSL Cor-Inland","Punta Bella — San Jose Corridor — SJD Corr-Oceanside","Punta Mirante — Cabo Corridor — CSL Cor-Inland","Punta Perfecta — East Cape — East Cape South","Punta Pescadero — East Cape — East Cape North","Punto NIma — San Jose del Cabo — SJD-Beachside","Punto Pedregal — Cabo San Lucas — CSL-Centro","Quintas California — Cabo San Lucas — CSL-Centro","Rancho Cerro Colorado — San Jose Corridor — Cerro Colorado","Rancho Cerro Colorado — San Jose Corridor — SJD Corr-Oceanside","Rancho La Laguna — East Cape — East Cape South","Rancho Leonero — East Cape — East Cape North","Rancho Leonero — East Cape — East Cape South","Rancho Nuevo — Pacific — Pacific South","Rancho Par-El Cielito — Cabo Corridor — CSL Cor-Inland","Rancho Paraiso — Cabo Corridor — CSL Cor-Inland","Rancho Paraiso Ests — Cabo Corridor — CSL Cor-Inland","Rancho Pescadero — East Cape — East Cape North","Rancho Tortuga — East Cape — East Cape South","RanchoLasMargaritas — Pacific — Pacific South","Real Centenario — La Paz — El Centenario","Residences of La Ribera — East Cape — East Cape South","Residencial La Jolla — San Jose del Cabo — SJD-Inland/Golf","Residencial Puerta Azul — La Paz — El Centenario","ResidenciasLomasTule — San Jose Corridor — SJD Corr-Inland","Rivieri — Cabo Corridor — CSL Cor-Inland","Roca Vista — Cabo San Lucas — CSL-Centro","Rolling Hills — Pacific — Pacific South","Rosales Residencial II — La Paz — La Paz City","Sabina Residencial — Cabo Corridor — CSL Cor-Inland","Salara Residences — Pacific — Pacific South","Salt Breeze — Pacific — Pacific South","San Bartolo — East Cape — East Cape North","San Charbel — Cabo San Lucas — CSL-Centro","San Cristobal — Pacific — Pacific South","San Cristobal-Gen — Pacific — Pacific South","San Jeronimo — Cabo Corridor — CSL Cor-Inland","San Jose Viejo — San Jose del Cabo — SJD-North","San Juan de la Costa — La Paz — San Juan de la Costa","San Juanico — Comondu — Scorpion Bay","San Luis — East Cape — East Cape South","San Miguel — Cabo Corridor — CSL Cor-Inland","San Pedro — La Paz — San Pedro","San Sebastian — Pacific — Pacific North","Sancta — La Paz — La Paz City","Santa Carmela — Cabo Corridor — CSL-Corr. Oceanside","Santa Cruz — East Cape — East Cape South","Santa Lucia — Cabo Corridor — CSL Cor-Inland","Santa Maria — East Cape — East Cape North","Santa Rita — Cabo San Lucas — CSL-Beach & Marina","Santa Rosa — San Jose del Cabo — SJD-North","Santarena — San Jose Corridor — SJD Corr-Oceanside","Santiago — East Cape — East Cape South","Santo Domingo — Comondu — Ejidos","Satus — Cabo Corridor — CSL Cor-Inland","Sea Breeze — Cabo San Lucas — CSL-Centro","Section 1- Las Colinas — San Jose Corridor — SJD Corr-Inland","Section 10- El Parque — San Jose Corridor — SJD Corr-Inland","Section 12- Las Cabanas — San Jose Corridor — SJD Corr-Inland","Section 13- El Lago — San Jose Corridor — SJD Corr-Inland","Section 14- El Campo — San Jose Corridor — SJD Corr-Inland","Section 16- Laderas — San Jose Corridor — SJD Corr-Inland","Section 18- Horizontes — San Jose Corridor — SJD Corr-Inland","Section 19- LaVista-LaLoma — San Jose Corridor — SJD Corr-Inland","Section 22F- La Montana — San Jose Corridor — SJD Corr-Inland","Section 28- Ocean Residences — San Jose Corridor — SJD Corr-Oceanside","Section 29- La Cresta — San Jose Corridor — SJD Corr-Inland","Section 3- El Valle — San Jose Corridor — SJD Corr-Inland","Section 4- Las Canadas — San Jose Corridor — SJD Corr-Inland","Section 6- Las Verandas — San Jose Corridor — SJD Corr-Inland","Section 7- Las Casitas — San Jose Corridor — SJD Corr-Inland","Serenity at Cerritos — Pacific — Pacific South","Shipwrecks — East Cape — East Cape South","Sierra Dorada — Cabo Corridor — CSL Cor-Inland","SJD D/town:General — San Jose del Cabo — SJD-Centro","SJD Hills:General — San Jose del Cabo — SJD-Inland/Golf","SJD Marina:General — San Jose del Cabo — SJD-East","SJD N,W of 1:General — San Jose del Cabo — SJD-North","SJD-CostaAzulBch:Gen — San Jose del Cabo — SJD-Beachside","SJD-Inland/Golf:Gen — San Jose del Cabo — SJD-Inland/Golf","Solara del Mar — Cabo Corridor — CSL Cor-Inland","Solaria — Cabo Corridor — CSL Cor-Inland","Solaz Residences — San Jose Corridor — SJD Corr-Oceanside","Soleado — San Jose del Cabo — SJD-Beachside","Solesta — San Jose del Cabo — SJD-Inland/Golf","Spa Buena Vista — East Cape — East Cape North","St Regis Residences — Pacific — Pacific South","Sunset — Cabo San Lucas — CSL-Centro","Sunset by Alttus — La Paz — LaPaz Beach","Sunset Hill — Pacific — Pacific South","Sunset Hills — Cabo San Lucas — CSL-Centro","Sunset:General — Cabo San Lucas — CSL-Centro","Surfside Residences — Pacific — Pacific South","Tamar — Cabo Corridor — CSL Cor-Inland","Terra 192 — Cabo San Lucas — CSL-Centro","Terra 194 — Cabo San Lucas — CSL-Centro","Terranova — Cabo San Lucas — CSL-North","Terrasol — Cabo San Lucas — CSL-Beach & Marina","Terrazas Costa Azul — San Jose del Cabo — SJD-Inland/Golf","Tesoro — Cabo San Lucas — CSL-Beach & Marina","The Arc — Cabo Corridor — CSL Cor-Inland","The Break — San Jose del Cabo — SJD-Inland/Golf","The Canyon Entre Piedras — San Jose Corridor — SJD Corr-Inland","The Cape Residences — Cabo Corridor — CSL-Corr. Oceanside","The Cliff at Cerritos — Pacific — Pacific South","The Five — Cabo San Lucas — CSL-Beach & Marina","The Mountain Club at Pedregal — Cabo San Lucas — CSL-Beach & Marina","The O Pedregal — Cabo San Lucas — CSL-Beach & Marina","The Palm — Pacific — Pacific South","The Paraiso Residences — Cabo San Lucas — CSL-Beach & Marina","The Tequila Ranch — Pacific — Pacific South","The Villas-Rcho Sn Lucas — Pacific — Pacific South","Three Point Tower — Cabo San Lucas — CSL-Centro","Todos Santos Colony — La Paz — Pacific North","Todos Santos Nth-Gen — La Paz — Pacific North","Todos Santos Nth-Gen — Pacific — Pacific North","Todos Santos-General — La Paz — Pacific North","Todos Santos-General — Pacific — Pacific North","Torre Catalina — Cabo Corridor — CSL Cor-Inland","Torres San Jose — San Jose del Cabo — SJD-North","Tortuga Bay — San Jose del Cabo — SJD-Beachside","Tortuga Cerritos — Pacific — Pacific South","Toscana Residences — Cabo Corridor — CSL Cor-Inland","Tramonti — Cabo Corridor — CSL Cor-Inland","Tramonti Paradiso — Cabo Corridor — CSL Cor-Inland","Turquesa Los Cabos — Cabo Corridor — CSL Cor-Inland","Uptown:General — Cabo San Lucas — CSL-Centro","Urban Oasis — La Paz — La Paz City","Valle del Sol — Cabo Corridor — CSL Cor-Inland","Velamar — San Jose Corridor — SJD Corr-Inland","Venados — Cabo San Lucas — CSL-North","Ventanas — Cabo Corridor — CSL Cor-Inland","Veranda Residences — Cabo Corridor — CSL Cor-Inland","Viceroy Residences — San Jose del Cabo — SJD-Beachside","Villa Cabo Sur — Cabo San Lucas — CSL-North","Villa Dorada — Cabo San Lucas — CSL-Centro","Villa La Estancia — Cabo San Lucas — CSL-Beach & Marina","Villamar — Cabo Corridor — CSL Cor-Inland","Villas Baja — San Jose del Cabo — SJD-Inland/Golf","Villas de Cerritos Beach — Pacific — Pacific South","Villas de México — San Jose del Cabo — SJD-Inland/Golf","Villas de Montana — San Jose Corridor — SJD Corr-Oceanside","Villas de Oasis — La Paz — El Centenario","Villas de Oro — San Jose Corridor — SJD Corr-Inland","Villas del Centenario — La Paz — El Centenario","Villas del Mar — San Jose Corridor — SJD Corr-Oceanside","Villas del Sol — Cabo San Lucas — CSL-Beach & Marina","Villas del Tezal — Cabo Corridor — CSL Cor-Inland","Villas Neptuno — Cabo Corridor — CSL Cor-Inland","Villas Posada — La Paz — La Paz City","Vinora/CaboPulmo-Gen — East Cape — East Cape South","Vinorama — East Cape — East Cape South","Vinorama Estates — East Cape — East Cape South","Vinoramas — East Cape — East Cape South","Vista Antigua — East Cape — East Cape North","Vista Azul — Cabo Corridor — CSL-Corr. Oceanside","Vista Cerritos Luxury — Pacific — Pacific South","Vista Colorada — San Jose Corridor — SJD Corr-Inland","Vista Coral — La Paz — La Paz City","Vista Cortes — La Paz — La Paz City","Vista Dorada — La Paz — El Centenario","Vista Hermosa — San Jose del Cabo — SJD-Inland/Golf","Vista Hermosa — San Jose del Cabo — SJD-North","Vista Lagos — San Jose del Cabo — SJD-Inland/Golf","Vista Las Brisas — East Cape — East Cape North","Vista Los Suenos — La Paz — La Paz City","Vista Luna I — Pacific — Pacific South","Vista Mare — Cabo San Lucas — CSL-Centro","Vista Real Lower — Cabo Corridor — CSL Cor-Inland","Vista Vela — Cabo Corridor — CSL Cor-Inland","Vista Vela III — Cabo Corridor — CSL Cor-Inland","Vista Vela Sunset — Cabo Corridor — CSL Cor-Inland","Vista Vella II — Cabo Corridor — CSL Cor-Inland","Vistana — Cabo Corridor — CSL Cor-Inland","Vistas del Tezal — Cabo Corridor — CSL Cor-Inland","Vistazul — Cabo Corridor — CSL Cor-Inland","Vistazul Condominios — La Paz — El Centenario","Waicuri 1 — Loreto — Excondido South","Waldorf Astoria Resdences — Cabo San Lucas — CSL-Beach & Marina","Wen Living — San Jose del Cabo — SJD-Inland/Golf","West Enclave Ritz-Carlton — San Jose del Cabo — SJD-East","White 12 — Cabo San Lucas — CSL-Centro","Zacatal — San Jose del Cabo — SJD-North","Zacatitos — East Cape — East Cape South","Zacaton — East Cape — East Cape South"],"community":["Bahia Concepcion — Mulege — Mulege","Bay of Dreams — La Paz — Bay of Dreams","BayOfDreams/Ventanas — East Cape — East Cape North","Beach north — Loreto — Loreto","Bellavista — La Paz — La Paz City","BuenaVista/Rancho Leonero — East Cape — East Cape South","BuenVsta/LosBarilles — East Cape — East Cape North","Cabo Bello/Santa Carmela — Cabo Corridor — CSL-Corr. Oceanside","Cabo del Sol — Cabo Corridor — CSL-Corr. Oceanside","Cabo Real-Inland — San Jose Corridor — SJD Corr-Inland","Cabo Real-Ocean Side — San Jose Corridor — SJD Corr-Oceanside","Centro — Cabo San Lucas — CSL-Centro","Centro — La Paz — La Paz City","Centro — Loreto — Loreto","Centro — Mulege — Mulege","Cerro Colorado-Ocean — San Jose Corridor — Cerro Colorado","Cerro Colorado-Ocean — San Jose Corridor — SJD Corr-Oceanside","CerroColorado-Inland — San Jose Corridor — Cerro Colorado","CerroColorado-Inland — San Jose Corridor — SJD Corr-Inland","Chametla — La Paz — El Centenario","Chileno Bay/Montage — Cabo Corridor — CSL-Corr. Oceanside","Chileno/Montage-Inland — Cabo Corridor — CSL Cor-Inland","Club Campestre — San Jose del Cabo — SJD-Inland/Golf","Colina del Sol — La Paz — La Paz City","Comitan — La Paz — El Centenario","Constitucion Community — Comondu — Constitucion","Costa Azul Beach — San Jose del Cabo — SJD-Beachside","Costa Palmas — East Cape — East Cape South","CSL Beach — Cabo San Lucas — CSL-Beach & Marina","CSL Country Club — Cabo Corridor — CSL Cor-Inland","CSL Marina — Cabo San Lucas — CSL-Beach & Marina","CSL Near Bch & Marina — Cabo San Lucas — CSL-Beach & Marina","CSL North-East 19 — Cabo San Lucas — CSL-North","CSL North-West 19 — Cabo San Lucas — CSL-North","Danzante Bay — Loreto — Escondido South","Danzante Bay — Loreto — Excondido South","Diamante Cabo San Lucas — Pacific — Pacific South","El Centenario — La Paz — El Centenario","El Comitan — La Paz — El Centenario","El Encanto & Laguna — San Jose del Cabo — SJD-East","El Mogote — La Paz — LaPaz Beach","El Sargento — La Paz — El Sargento","El Tezal-East — Cabo Corridor — CSL Cor-Inland","El Tezal-OceanSide — Cabo Corridor — CSL-Corr. Oceanside","El Tezal-West — Cabo Corridor — CSL Cor-Inland","El Tule-Inland — San Jose Corridor — SJD Corr-Inland","El Tule-Ocean Side — San Jose Corridor — SJD Corr-Oceanside","ElCardonal/N of Bariles — East Cape — East Cape North","Elias Calles — Pacific — Pacific South","Espiritu del Mar — San Jose Corridor — SJD Corr-Oceanside","Esterito — La Paz — La Paz City","Fidepaz — La Paz — La Paz City","Fonatur Golf & Hills — San Jose del Cabo — SJD-Inland/Golf","Forjadores SJD — San Jose del Cabo — SJD-Inland/Golf","Gringo &  Lito Hills — San Jose del Cabo — SJD-Inland/Golf","La Posada — La Paz — La Paz City","La Ribera — East Cape — East Cape South","La Ventana — La Paz — La Ventana","Ladera San José — San Jose Corridor — Cerro Colorado","LaPaz Beach Community — La Paz — LaPaz Beach","LaPaz West — La Paz — Pacific North","LaPaz West — Pacific — Pacific North","Ligui — Loreto — Excondido South","Lopez Mateos — Comondu — Mag Bay","Loreto Bay — Loreto — Nopolo","Los Planes — La Paz — Los Planes","Migrino Area — Pacific — Pacific South","Miraflores/Santiago — East Cape — East Cape South","Miramar — Loreto — Loreto","Misiones — Cabo Corridor — CSL-Corr. Oceanside","Nopolo — Loreto — Nopolo","Palmilla-Inland — San Jose Corridor — SJD Corr-Inland","Palmilla-Ocean Side — San Jose Corridor — SJD Corr-Oceanside","Pedregal CSL — Cabo San Lucas — CSL-Beach & Marina","Pescadero/Cerritos — Pacific — Pacific South","Pto. Escondido — Loreto — Excondido South","Puerta Bugambilias — La Paz — La Paz City","Puerto Los Cabos — San Jose del Cabo — SJD-East","Punta Ballena — Cabo Corridor — CSL-Corr. Oceanside","Querencia-Inland — San Jose Corridor — SJD Corr-Inland","Querencia-Ocean side — San Jose Corridor — SJD Corr-Oceanside","Quivira — Pacific — Pacific South","Rancho San Lucas — Pacific — Pacific South","Saddles/Sunset Bch Rd — Cabo San Lucas — CSL-Centro","San Bartolo — East Cape — East Cape North","San Cristobal — Pacific — Pacific South","San Juan de la Costa — La Paz — San Juan de la Costa","San Juanico — Comondu — Scorpion Bay","San Pedro — La Paz — San Pedro","Santa Rosalia — Mulege — Mulege","Santo Domingo — Comondu — Ejidos","SJD above Hwy 1 — San Jose del Cabo — SJD-Centro","SJD above Hwy 1 — San Jose del Cabo — SJD-Inland/Golf","SJD Downtown — San Jose del Cabo — SJD-Centro","SJD Marina — San Jose del Cabo — SJD-East","SJD North-E of 1 — San Jose del Cabo — SJD-North","SJD North-W of 1 — San Jose del Cabo — SJD-North","SJD-Beach — San Jose del Cabo — SJD-Beachside","Todos Santos — La Paz — Pacific North","Todos Santos — Pacific — Pacific North","Todos Santos North — La Paz — Pacific North","Todos Santos North — Pacific — Pacific North","Uptown/Border Rd — Cabo San Lucas — CSL-Centro","Vinorama/Cabo Pulmo — East Cape — East Cape South","Zacatitos/PtaPerfcta — East Cape — East Cape South","Zaragoza — Loreto — Loreto"]};

// Agent data
const agentsData = {
  "susu": {
    id: 9,
    name: "Susu Vieira",
    email: "Susu@BIRCabo.com",
    phone: "+1 (808) 226-6120"
  },
  "bob": {
    id: 1,
    name: "Bob Van Patten",
    email: "robertvanpatten2@gmail.com",
    phone: "+52 624 127 6012"
  },
  "alfonso": {
    id: 3,
    name: "Alfonso Puente",
    email: "alfonso@bircabo.com",
    phone: "+52 664 188 8681"
  },
  "david": {
    id: 8,
    name: "David Scott Piper",
    email: "David@bircabo.com",
    phone: "+52 624 317 0297"
  },
  "erika": {
    id: 2,
    name: "Erika Aispuro",
    email: "erika@bircabo.com",
    phone: "+52 624 109 7909"
  },
  "hector": {
    id: 5,
    name: "Hector Mendoza",
    email: "Hector@bircabo.com",
    phone: "+52 624 211 4879"
  },
  "marisol": {
    id: 7,
    name: "Marisol Tort",
    email: "mtortricardi@gmail.com",
    phone: "+52 624 264 3896"
  },
  "cozbi": {
    id: 4,
    name: "Cozbi Sanchez",
    email: "Cozbi@bajainternationalrealty.com",
    phone: "+52 624 118 9512"
  },
  "edgar": {
    id: 10,
    name: "Edgar Pacheco",
    email: "Edgar@bircabo.com",
    phone: "+52 612 169 8328"
    },
 "bonnie-renee": {
  id: 15,
  name: "Bonnie Renee G.",
  email: "bonnie@bircabo.com",
  phone: "+52 1 624 127 6012"
},
  "erika-graciano": {
  id: 14,
  name: "Erika Graciano",
  email: "erikag@bircabo.com",
  phone: "+52 624 157 2154"
  },
  "don": {
    id: 12,
    name: "Don Weis",
    email: "Don@bircabo.com",
    phone: "+52 624 143 5555"
  },
  "fernando-cabrera": {
    id: 11,
    name: "Fernando Cabrera",
    email: "fernando@bircabo.com",
    phone: "+52 624 135 8900"
  },
  "charles-jones": {
    id: 13,
    name: "Charles Jones",
    email: "cabocharlie79@gmail.com",
    phone: "+1 858 964 4629"
  }
};

interface ImageFile {
  file: File;
  preview: string;
  base64?: string;
}

const SellerEvaluationForm = () => {
  const { toast } = useToast();
  const { agentSlug } = useParams<{ agentSlug?: string }>();
  const [website, setWebsite] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<ImageFile[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  // Get agent data from URL param or default to office
  const agent = agentSlug && agentsData[agentSlug as keyof typeof agentsData]
    ? agentsData[agentSlug as keyof typeof agentsData]
    : { id: 0, name: "BIR Office", email: "info@bircabo.com", phone: "+52 624 143 5555" };

  const [formData, setFormData] = useState({
    date: new Date().toLocaleDateString('en-CA'),
    lastName: "",
    firstName: "",
    valuationPreference: "preliminary",
    personalEmail: "",
    
    // Agent Selection
    preferredAgentSlug: "",
    preferredAgentName: "",
    preferredAgentEmail: "",
    
    // Property Information
    propertyAddress: "",
    locationType: "subdivision",
    locationName: "",
    buildingUnit: "FT²",
    lotUnit: "FT²",
    city: "",
    state: "",
    zipCode: "",
    propertyType: "",
    numberOfBedrooms: "",
    numberOfBathrooms: "",
    squareFootage: "",
    lotSize: "",
    yearBuilt: "",
    
    // Selling Details
    reasonForSelling: "",
    desiredTimeframe: "",
    expectedPrice: "",
    recentUpgrades: "",
    
    // Additional Information
  });

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check if adding these files would exceed the limit (10 images max)
    if (uploadedImages.length + files.length > 10) {
      toast({
        title: "Too Many Images",
        description: "You can upload a maximum of 10 images.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingImages(true);

    try {
      const newImages: ImageFile[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid File",
            description: `${file.name} is not an image file.`,
            variant: "destructive",
          });
          continue;
        }

        // Validate file size (max 5MB per image)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File Too Large",
            description: `${file.name} is larger than 5MB. Please compress it.`,
            variant: "destructive",
          });
          continue;
        }

        // Create preview URL
        const preview = URL.createObjectURL(file);

        // Convert to base64 for email attachment
        const base64 = await convertToBase64(file);

        newImages.push({
          file,
          preview,
          base64
        });
      }

      setUploadedImages([...uploadedImages, ...newImages]);
      
      toast({
        title: "Images Uploaded",
        description: `${newImages.length} image(s) added successfully.`,
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImages(false);
      // Reset input
      e.target.value = '';
    }
  };

  // Convert file to base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Remove image
  const removeImage = (index: number) => {
    const newImages = [...uploadedImages];
    URL.revokeObjectURL(newImages[index].preview); // Clean up preview URL
    newImages.splice(index, 1);
    setUploadedImages(newImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.locationName.trim()) return;
    setIsSubmitting(true);

    try {
      // Prepare images for email attachment
      const imageAttachments = uploadedImages.map((img, index) => ({
        filename: img.file.name,
        content: img.base64?.split(',')[1], // Remove data URL prefix
        encoding: 'base64',
        contentType: img.file.type
      }));

      // Determine which agent to send to (URL agent takes priority over selected agent)
      const finalAgent = agentSlug 
        ? agent 
        : (formData.preferredAgentSlug && agentsData[formData.preferredAgentSlug as keyof typeof agentsData])
          ? agentsData[formData.preferredAgentSlug as keyof typeof agentsData]
          : { id: 0, name: "BIR Office", email: "info@bircabo.com", phone: "+52 624 143 5555" };

      const submissionData = {
        // Seller info
        website,
        sellerName: `${formData.firstName} ${formData.lastName}`,
        sellerEmail: formData.personalEmail,
        valuationPreference: formData.valuationPreference,
        
        // Property details
        propertyAddress: `${formData.locationType.toUpperCase()}: ${formData.locationName.trim()}`,
        propertyCity: formData.city,
        propertyState: formData.state,
        propertyZip: formData.zipCode,
        propertyType: formData.propertyType,
        bedrooms: formData.numberOfBedrooms,
        bathrooms: formData.numberOfBathrooms,
        squareFootage: formData.squareFootage ? `${formData.squareFootage} ${formData.buildingUnit} (estimated)` : "",
        lotSize: formData.lotSize ? `${formData.lotSize} ${formData.lotUnit} (estimated)` : "",
        yearBuilt: formData.yearBuilt,
        
        // Selling information
        reasonForSelling: formData.reasonForSelling,
        desiredTimeframe: formData.desiredTimeframe,
        expectedPrice: formData.expectedPrice,
        recentUpgrades: formData.recentUpgrades,
        
        // Images
        images: imageAttachments,
        imageCount: uploadedImages.length,
        
        // Agent info (using final selected agent)
        agentName: finalAgent.name,
        agentEmail: finalAgent.email,
        agentId: finalAgent.id,
        
        // Metadata
        source: `Seller Evaluation Form - ${finalAgent.name}`,
        formType: 'seller-evaluation-form',
        timestamp: new Date().toISOString()
      };

      const response = await fetch('/api/contact/seller-evaluation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      toast({
        title: "Form Submitted Successfully! ✓",
        description: formData.valuationPreference==='preliminary' ? 'Thank you! We will email your preliminary valuation. No sales follow-up unless you ask.' : 'Thank you! An agent will email you about a more detailed valuation.',
      });

      // Reset form
      setFormData({
        date: new Date().toLocaleDateString('en-CA'),
        lastName: "",
        firstName: "",
        valuationPreference: "preliminary",
        personalEmail: "",
        preferredAgentSlug: "",
        preferredAgentName: "",
        preferredAgentEmail: "",
        propertyAddress: "",
    locationType: "subdivision",
    locationName: "",
    buildingUnit: "FT²",
    lotUnit: "FT²",
        city: "",
        state: "",
        zipCode: "",
        propertyType: "",
        numberOfBedrooms: "",
        numberOfBathrooms: "",
        squareFootage: "",
        lotSize: "",
        yearBuilt: "",
            reasonForSelling: "",
        desiredTimeframe: "",
        expectedPrice: "",
        recentUpgrades: "",
      });

      // Clean up image previews
      uploadedImages.forEach(img => URL.revokeObjectURL(img.preview));
      setUploadedImages([]);

      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error Submitting Form",
        description: `Please try again or call ${agent.name} at ${agent.phone}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
  <div className="min-h-screen bg-gray-50">
    <Helmet>
      <title>Free Property Evaluation | Sell Your Cabo Home | Baja International Realty</title>
      <meta 
        name="description" 
        content="Get a free property evaluation from Cabo San Lucas experts. Professional market analysis for sellers. Upload photos, get accurate pricing, sell faster." 
      />
      <link rel="canonical" href="https://www.bircabo.com/seller-evaluation" />
      <meta property="og:url" content="https://www.bircabo.com/seller-evaluation" />
      <meta property="og:title" content="Free Property Evaluation | Sell Your Cabo San Lucas Home" />
      <meta property="og:description" content="Request a free professional property evaluation. Expert market analysis from Baja International Realty agents." />
      <meta property="og:type" content="website" />
      <meta name="robots" content="noindex, follow" />
    </Helmet>
    
    <Navbar />

    <div className="container mx-auto px-4 py-8 sm:py-16 max-w-4xl">
      
      <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <img
            src="/BIRLOGO.png"
            alt="BIR Logo"
            className="h-16 sm:h-20 w-auto"
          />

          <div className="text-center sm:text-right">
            <label className="text-sm font-semibold text-gray-700">DATE:</label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="mt-1 w-full sm:w-48"
            />
          </div>
        </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-2">
            FREE PROPERTY EVALUATION
          </h1>
          <p className="text-center text-gray-600 mb-2">Seller Information Form</p>
          <p className="text-center text-sm text-gray-500 mb-8">Agent: {agent.name}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
                <div aria-hidden="true" style={{position:'absolute',left:'-10000px',width:1,height:1,overflow:'hidden'}}><label>Leave this field empty<input name="website" value={website} onChange={e=>setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" /></label></div>
            {/* Personal Information */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Contact Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block uppercase">Last Name:</Label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block uppercase">First Name(s):</Label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-4">

                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block uppercase">Email Address:</Label>
                  <Input
                    type="email"
                    value={formData.personalEmail}
                    onChange={(e) => setFormData({...formData, personalEmail: e.target.value})}
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <fieldset className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <legend className="font-semibold text-gray-800 px-1">How would you like your valuation?</legend>
                <label className="flex items-start gap-3 mb-4 cursor-pointer">
                  <input type="radio" name="valuation-preference" value="preliminary" checked={formData.valuationPreference==='preliminary'} onChange={()=>setFormData({...formData,valuationPreference:'preliminary'})} className="mt-1 shrink-0" />
                  <span><strong>Preliminary valuation by email only</strong><span className="block text-sm text-gray-700 mt-1">Send me an initial estimate based on the information I provide. No sales follow-up unless I ask.</span></span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="radio" name="valuation-preference" value="detailed" checked={formData.valuationPreference==='detailed'} onChange={()=>setFormData({...formData,valuationPreference:'detailed'})} className="mt-1 shrink-0" />
                  <span><strong>I'm open to contact for a more detailed valuation</strong><span className="block text-sm text-gray-700 mt-1">An agent may email me to ask questions and discuss the next steps.</span></span>
                </label>
                <p className="text-sm text-gray-600 mt-3">No phone number needed. This request does not sign you up for marketing. An initial estimate may need more information before it can be refined.</p>
              </fieldset>

              {/* Preferred Agent Selection */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Label className="text-sm font-semibold text-gray-700 mb-2 block uppercase">
                  Preferred Agent (Optional):
                </Label>
                <p className="text-sm text-gray-600 mb-3">
                  {agentSlug ? `Assigned to: ${agent.name}` : 'Select an agent to work with, or leave blank for office assignment'}
                </p>
                {!agentSlug && (
                  <select
                    value={formData.preferredAgentSlug}
                    onChange={(e) => {
                      const selectedSlug = e.target.value;
                      if (selectedSlug && agentsData[selectedSlug as keyof typeof agentsData]) {
                        const selectedAgent = agentsData[selectedSlug as keyof typeof agentsData];
                        setFormData({
                          ...formData, 
                          preferredAgentSlug: selectedSlug,
                          preferredAgentName: selectedAgent.name,
                          preferredAgentEmail: selectedAgent.email
                        });
                      } else {
                        setFormData({
                          ...formData, 
                          preferredAgentSlug: '',
                          preferredAgentName: '',
                          preferredAgentEmail: ''
                        });
                      }
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">No Preference - Office Will Assign</option>
                  <option value="alfonso">Alfonso Puente</option>
                  <option value="bob">Bob Van Patten</option>
                  <option value="erika-graciano">Erika Graciano</option>
                  <option value="charles-jones">Charles Jones</option>
                  <option value="cozbi">Cozbi Sanchez</option>
                  <option value="david">David Scott Piper</option>
                  <option value="don">Don Weis</option>
                  <option value="edgar">Edgar Pacheco</option>
                  <option value="erika">Erika Aispuro</option>
                  <option value="fernando-cabrera">Fernando Cabrera</option>
                  <option value="bonnie-renee">Bonnie Renee G.</option>
                  <option value="hector">Hector Mendoza</option>
                  <option value="marisol">Marisol Tort</option>
                  <option value="susu">Susu Vieira</option>
                  </select>
                )}
              </div>
            </div>

            {/* Property Information */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Property Information</h2>
              
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 mb-4">
                <p className="text-gray-700 mb-4">Choose your SUBDIVISION from the FLEX list below.</p>
                <Label htmlFor="property-subdivision" className="font-semibold block mb-2">SUBDIVISION</Label>
                <select id="property-subdivision" value={formData.locationType==='subdivision'?formData.locationName:''} required={!formData.locationName} onChange={e=>setFormData({...formData,locationType:'subdivision',locationName:e.target.value})} className="w-full min-w-0 max-w-full rounded-md border p-3 bg-white mb-5">
                  <option value="">Choose a SUBDIVISION</option>
                  {evaluationLocations.subdivision.map(name=><option key={name} value={name}>{name}</option>)}
                </select>
                <p id="community-help" className="text-gray-700 mb-3">If your property is not in a subdivision, choose a COMMUNITY.</p>
                <Label htmlFor="property-community" className="font-semibold block mb-2">COMMUNITY</Label>
                <select id="property-community" value={formData.locationType==='community'?formData.locationName:''} aria-describedby="community-help" onChange={e=>setFormData({...formData,locationType:'community',locationName:e.target.value})} className="w-full min-w-0 max-w-full rounded-md border p-3 bg-white">
                  <option value="">Choose a COMMUNITY</option>
                  {evaluationLocations.community.map(name=><option key={name} value={name}>{name}</option>)}
                </select>
                <p className="text-sm text-gray-600 mt-2">Choose one location. The town and area beside each name help you find the right place.</p>
              </div>

              {/* Property Type */}
              <div className="mt-4">
                <Label className="text-sm font-semibold text-gray-700 mb-3 block uppercase">Property Type:</Label>
                <RadioGroup
                  value={formData.propertyType}
                  onValueChange={(value) => setFormData({...formData, propertyType: value})}
                  className="grid grid-cols-2 md:grid-cols-4 gap-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="CONDO" id="sell-condo" />
                    <Label htmlFor="sell-condo" className="font-normal cursor-pointer">CONDO</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="HOUSE" id="sell-house" />
                    <Label htmlFor="sell-house" className="font-normal cursor-pointer">HOUSE</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="COMMERCIAL" id="sell-commercial" />
                    <Label htmlFor="sell-commercial" className="font-normal cursor-pointer">COMMERCIAL</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="LAND" id="sell-land" />
                    <Label htmlFor="sell-land" className="font-normal cursor-pointer">LAND</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Property Details */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mt-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block uppercase" htmlFor="numberOfBedrooms">Bedrooms:</Label>
                  <Input
                    id="numberOfBedrooms" type="number" min="0" step="1" value={formData.numberOfBedrooms}
                    onChange={(e) => setFormData({...formData, numberOfBedrooms: e.target.value})}
                    className="w-full"
                    placeholder="e.g., 3"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block uppercase" htmlFor="numberOfBathrooms">Bathrooms:</Label>
                  <Input
                    id="numberOfBathrooms" type="number" min="0" step="0.5" value={formData.numberOfBathrooms}
                    onChange={(e) => setFormData({...formData, numberOfBathrooms: e.target.value})}
                    className="w-full"
                    placeholder="e.g., 2.5"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block uppercase">Year Built:</Label>
                  <Input
                    value={formData.yearBuilt}
                    onChange={(e) => setFormData({...formData, yearBuilt: e.target.value})}
                    className="w-full"
                    placeholder="e.g., 2015"
                  />
                </div>
              </div>

              <p className="text-sm text-gray-600 mt-4">Estimates are fine. Leave any details blank if you are unsure.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-4">
                {([{field:'squareFootage',unit:'buildingUnit',label:'Estimated home / building size'},{field:'lotSize',unit:'lotUnit',label:'Estimated lot size'}] as const).map(({field,unit,label})=>(
                  <div key={field}>
                    <Label htmlFor={field} className="text-sm font-semibold text-gray-700 mb-2 block uppercase">{label}</Label>
                    <div className="flex gap-2">
                      <Input id={field} type="number" min="0" step="any" value={formData[field]} onChange={e=>setFormData({...formData,[field]:e.target.value})} className="w-full min-w-0" placeholder="Approximate size" />
                      <select aria-label={label+' units'} value={formData[unit]} onChange={e=>setFormData({...formData,[unit]:e.target.value})} className="rounded-md border p-2 bg-white shrink-0"><option>FT²</option><option>M²</option></select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selling Details */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Selling Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block uppercase">Desired Timeframe:</Label>
                  <Input
                    value={formData.desiredTimeframe}
                    onChange={(e) => setFormData({...formData, desiredTimeframe: e.target.value})}
                    className="w-full"
                    placeholder="e.g., 3-6 months"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block uppercase">Expected Price:</Label>
                  <Input
                    value={formData.expectedPrice}
                    onChange={(e) => setFormData({...formData, expectedPrice: e.target.value})}
                    className="w-full"
                    placeholder="e.g., $850,000"
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label className="text-sm font-semibold text-gray-700 mb-2 block uppercase">Reason for Selling:</Label>
                <Input
                  value={formData.reasonForSelling}
                  onChange={(e) => setFormData({...formData, reasonForSelling: e.target.value})}
                  className="w-full"
                  placeholder="Optional"
                />
              </div>

              <div className="mt-4">
                <Label className="text-sm font-semibold text-gray-700 mb-2 block uppercase">Recent upgrades, renovations or anything else we should know:</Label>
                <Textarea
                  value={formData.recentUpgrades}
                  onChange={(e) => setFormData({...formData, recentUpgrades: e.target.value})}
                  className="w-full"
                  placeholder="Tell us about improvements, special features, landmarks or anything else that would help us understand your property."
                  rows={3}
                />
              </div>
            </div>

            {/* Property Photos Upload */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Property Photos</h2>
              <p className="text-sm text-gray-600 mb-4">
                Upload photos of your property (optional, up to 10 images, max 5MB each)
              </p>

              {/* Upload Button */}
              <div className="mb-4">
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-700">Click to upload property photos</p>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG, or WebP (max 5MB per image)</p>
                  </div>
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isUploadingImages || uploadedImages.length >= 10}
                />
              </div>

              {/* Image Preview Grid */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.preview}
                        alt={`Property photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        {(image.file.size / 1024 / 1024).toFixed(1)}MB
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isUploadingImages && (
                <div className="text-center py-4">
                  <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-gray-600 mt-2">Processing images...</p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <Button
                type="submit"
                disabled={isSubmitting || isUploadingImages}
                className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? 'Submitting...' : 'Request Free Property Evaluation'}
              </Button>
              <p className="text-xs text-center text-gray-500 mt-3">
                We will use your information to respond to your valuation request according to the preference you selected.
              </p>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SellerEvaluationForm;
