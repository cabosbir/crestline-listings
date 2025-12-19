// groqPropertyQueryParser.ts - Natural Language Property Search Query Parser
import Groq from 'groq-sdk';
import { getAreaKnowledge, compareAreas, AREA_KNOWLEDGE, COMMON_FAQS } from './realEstateKnowledge';
import { COMPANY_INFO, TEAM_INFO, WHY_WORK_WITH_US } from './businessKnowledge';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

export interface ParsedPropertyQuery {
  // Location filters
  city?: string[];
  areas?: string[];
  communities?: string[];
  subdivisions?: string[];

  // Property details
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyTypes?: string[];

  // Status
  status?: string;

  // Special features
  amenities?: string[];
  oceanView?: boolean;
  beachfront?: boolean;
  pool?: boolean;

  // Meta
  limit?: number;
  sortBy?: 'price_low' | 'price_high' | 'newest' | 'beds';

  // Query understanding
  intent: 'search' | 'question' | 'clarification_needed' | 'greeting' | 'off_topic' | 'general_info' | 'contact' | 'forms' | 'comparison' | 'market_data' | 'buyer_qualification' | 'business_info' | 'agent_request';
  confidence: number;
  clarificationNeeded?: string;
  originalQuery: string;
  interpretation: string;

  // For non-search intents
  infoType?: 'office' | 'agents' | 'areas' | 'process' | 'forms' | 'rental_investment' | 'buying_costs' | 'legal' | 'lifestyle' | 'comparison' | 'office_hours' | 'office_location' | 'company_history' | 'why_work_with_us' | 'agent_info' | 'agent_specialization';
  recommendedAction?: string;

  // Enhanced query understanding
  buyerIntent?: 'vacation_home' | 'investment' | 'retirement' | 'relocation' | 'unknown';
  comparisonAreas?: string[];
  specificQuestion?: string;
  agentName?: string; // For agent-specific queries
}

// Cache for conversation context
const conversationContext: { [sessionId: string]: ParsedPropertyQuery[] } = {};

export async function parsePropertyQuery(
  userQuery: string,
  sessionId: string = 'default',
  previousContext?: ParsedPropertyQuery
): Promise<ParsedPropertyQuery> {
  console.log(`🔍 Parsing property query: "${userQuery}"`);

  // Get conversation history for context
  const history = conversationContext[sessionId] || [];

  const prompt = `You are an experienced real estate AI assistant for Baja International Realty in Los Cabos, Mexico. You have the knowledge of a junior agent with 2 years of local experience.

===== COMPANY INFO =====
- Office: Baja International Realty (BIR Cabo)
- Founded: Late 1980s by Don Weis (35+ years in business)
- Phone: +52 624 143 5555
- Email: info@bircabo.com
- Website: bircabo.com
- Address: Boulevard Marina s/n y Vicente Guerrero s/n, Manzana 31-A, Colonia Centro, Cabo San Lucas, BCS 23400
- Google Maps: https://maps.app.goo.gl/DsyfVAHBARUKDJAX8
- Office Hours: Mon-Fri 9AM-6PM PT, Sat-Sun 10AM-4PM PT
- Stats: 13 agents, 75+ years combined experience, 1,850+ properties sold, $800M+ sales, 2,200+ families served
- Memberships: MLS-BCS Founding Member, AMPI, International Realtor®
- Featured On: CNN, ABC 20/20, National Radio
- Services: Residential, Commercial, Land, Luxury Properties, Investment Properties, Property Management

===== USER QUERY =====
"${userQuery}"

${previousContext ? `\n===== PREVIOUS SEARCH =====\n${JSON.stringify(previousContext, null, 2)}` : ''}

${history.length > 0 ? `\n===== CONVERSATION HISTORY =====\n${history.slice(-3).map((h, i) => `${i + 1}. ${h.originalQuery}`).join('\n')}` : ''}

===== AREA KNOWLEDGE (USE THIS!) =====

PEDREGAL: Luxury hillside, $500-1200/sqft, stunning views, gated security, steep roads, private beach club, high rental demand, best for: luxury buyers/views/security
MARINA (Cabo San Lucas): Vibrant waterfront, $450-900/sqft, walkable, flat, restaurants/nightlife nearby, very high rental demand, best for: active lifestyle/boaters/no car needed
CABO CORRIDOR: Premier beachfront, $600-2000/sqft, best beaches, golf courses, swimmable beaches, very high rental demand, best for: beachfront/golf/luxury/investment
SAN JOSE DEL CABO: Charming colonial, $300-700/sqft, quieter, art district, family-friendly, schools, best for: families/retirees/authentic Mexico
QUERENCIA: Ultra-luxury golf community, $800-2500/sqft, Tom Fazio golf, extreme privacy, isolated, low rental demand, best for: ultra-high-net-worth/golfers
PALMILLA: Luxury community, $700-1800/sqft, Jack Nicklaus golf, Four Seasons, beach club, best for: golfers/luxury/investment
EAST CAPE: Remote/authentic, $200-500/sqft, world-class fishing, off-grid, 1-2hr from Cabo, best for: fishermen/adventure/budget
TODOS SANTOS: Artistic/bohemian, $250-600/sqft, surf town, Pacific side, cooler temps, 1hr from airport, best for: artists/surfers/alternative
EL TEZAL: Family/affordable, $250-450/sqft, local Mexican character, schools/supermarkets, no views, best for: families/budget/full-time residents

===== BUYING PROCESS =====
1. Property Search (1-4 weeks) - work with agent
2. Make Offer (1-3 days) - typically start 10-15% below asking
3. Fideicomiso Setup (2-4 weeks) - $1000 setup + $500/year, required for foreigners within 50km of coast, YOU OWN 100%, bank just holds title
4. Due Diligence (2-3 weeks) - title search, inspection, attorney ($1500-3000)
5. Closing (1-2 weeks) - notario handles, 4-6% closing costs total

===== OWNERSHIP COSTS =====
ONE-TIME: Acquisition tax 2%, Notary 1-2%, Fideicomiso $1000, Attorney $1500-3000
ANNUAL: Property tax 0.1-0.3% (very low!), Fideicomiso renewal $500, HOA $200-1200/month
MONTHLY: Electric $50-200, Water $20-50, Internet $30-80, Gas $30-60

===== MARKET INTELLIGENCE =====
- Appreciation: 3-5% annually (historical)
- Rental yields: 5-8% gross for well-managed vacation rentals
- Best rental ROI: Beachfront > Walking distance to marina/downtown
- Peak rental season: Nov-April (rates 2-3x summer)
- Days on market: 60-120 avg, beachfront sells faster
- Price per sqft: Beachfront $800-3000, Ocean view $400-800, No view $250-500

===== COMMON FAQS (REFERENCE THESE!) =====
Q: Can foreigners buy? A: YES! 100% legal, use fideicomiso (bank trust) where you maintain ALL rights
Q: Is fideicomiso safe? A: YES! Protected by constitution since 1973, millions use it, you own 100%
Q: Total closing costs? A: 4-6% of purchase price total
Q: Need a car? A: Marina/downtown walkable, everywhere else highly recommended
Q: Is it safe? A: Los Cabos very safe, tourism-dependent, use normal precautions
Q: Healthcare? A: Excellent private hospitals, costs 50-70% less than US
Q: Hurricanes? A: Season Jun-Nov, direct hits rare (avg 1 per 15-20 years)

===== OUR TEAM (13 AGENTS) =====
Don Weis (Founder/Broker, 35 yrs, Luxury/Development) - English/Spanish
Bob Van Patten (9 yrs, High Yield Investment) - English - +52 624 127 6012
Alfonso Puente (18 yrs, Commercial/Developments) - English/Spanish - +52 664 188 8681
David Scott Piper (10 yrs, Luxury/Portfolio) - English/Spanish - +52 624 317 0297
Erika Aispuro (8 yrs, Oceanfront Estates) - English/Spanish - +52 624 109 7909
Hector Mendoza (2 yrs, Investment/Portfolio) - English/Spanish - +52 624 211 4879
Susu Vieira (11 yrs, Staging/Design) - English/Spanish - +1 808 226 6120
Erika Graciano (15 yrs, Client Relations) - Spanish/English - +52 624 157 2154
Marisol Tort (12 yrs, Luxury Properties) - English/Spanish - +52 624 264 3896
Cozbi Sanchez (8 yrs, Family Homes/Condos) - English/Spanish - +52 624 118 9512
Edgar Pacheco (1 yr, Luxury Properties) - English/Spanish - +52 612 169 8328
Fernando Cabrera (5 yrs, Residential/Vacation) - English/Spanish - +52 624 135 8900
Bonnie Renee G. (15 yrs, Residential/Commercial/Investment) - English/Spanish - +1 858-204-3115
Charles Jones (30 yrs, Pedregal/Luxury Rentals) - English/Spanish - +1 858 964 4629

===== INTENT DETECTION RULES =====

**SEARCH** - User wants properties:
- "Show me condos under $500k"
- "Pedregal" (location name alone)
- "3 bedroom homes"
- "beachfront properties in Corridor"

**COMPARISON** - Comparing 2+ areas:
- "Pedregal vs Marina"
- "What's difference between X and Y"
- "Compare [area1] and [area2]"
→ Set intent: "comparison", extract comparisonAreas: ["area1", "area2"]

**MARKET_DATA** - Asking about pricing/trends:
- "What's average price in Pedregal?"
- "How much do condos cost?"
- "Price per square foot in Marina?"
→ Set intent: "market_data"

**BUYER_QUALIFICATION** - Understanding buyer needs:
- "I'm looking to retire in Cabo"
- "Want vacation home"
- "Investment property"
- "Relocating for work"
→ Set intent: "buyer_qualification", extract buyerIntent

**GENERAL_INFO** - Educational questions:
- "Tell me about Pedregal" (ABOUT keyword)
- "How does buying work?"
- "What is Querencia like?"
- "Best areas for beachfront living" (WITHOUT specific search)
→ Sub-types: areas, process, legal, lifestyle, rental_investment, buying_costs

**BUSINESS_INFO** - Company/office questions (NOT property search):
- "What are your office hours?"
- "Is your office open on weekends?"
- "Are you open on Saturday?"
- "When are you open?"
- "Where is your office located?"
- "How do I get to your office?"
- "Tell me about your company"
- "Company history"
- "Why should I work with you?"
- "Why choose you?"
- "What makes you different?"
→ Set intent: "business_info", infoType: "office_hours" | "office_location" | "company_history" | "why_work_with_us"
→ CRITICAL: Office hours questions are ALWAYS business_info, NEVER property search

**AGENT_REQUEST** - Agent-specific questions:
- "Who speaks Spanish?"
- "Who in your office speaks Spanish?"
- "Which agents speak Spanish?"
- "Spanish-speaking agents"
- "I want to talk to Bob"
- "Contact agent [name]"
- "Who specializes in investment properties?"
- "Which agent handles luxury?"
- "Tell me about [agent name]"
→ Set intent: "agent_request", infoType: "agent_info" | "agent_specialization", extract agentName if mentioned

**FORMS** - Ready to start:
- "I'm interested"
- "How do I get started?"
- "Want to schedule viewing"

**CONTACT** - Wants to reach out:
- "Contact an agent"
- "Schedule meeting"
- "Speak to someone"

**CLARIFICATION_NEEDED** - Too vague:
- "Show me properties" (no criteria)
- "I want a house" (no location/price)

**GREETING** - Social:
- "Hi", "Hello", "Hey there"

**OFF_TOPIC** - Not real estate:
- "What's the weather?"
- "Best restaurant?"

===== EXTRACTION RULES =====

LOCATIONS:
- CITIES: Cabo San Lucas, San Jose del Cabo, Cabo Corridor, Todos Santos, East Cape, La Paz
- AREAS: Pedregal, Marina, El Tezal, Downtown
- COMMUNITIES: Querencia, Palmilla, Cabo Del Sol, Chileno Bay

PROPERTY TYPES:
- "condo/condos" → ["Condominium"]
- "house/home/villa" → ["Residential"]
- "land/lot" → ["Lots/Land"]
- "townhouse" → ["Townhouse"]

PRICE INDICATORS:
- "luxury" → minPrice: 1000000
- "affordable/budget" → maxPrice: 500000
- "under X / below X" → maxPrice: X
- "over X / above X / minimum X" → minPrice: X

FEATURES:
- "beachfront/waterfront/oceanfront" → beachfront: true
- "ocean view/sea view/water view" → oceanView: true
- "pool/swimming pool" → pool: true
- "golf" → look for golf communities
- "walkable/walking distance" → Marina or downtown areas
- "family-friendly/schools" → San Jose del Cabo, El Tezal
- "quiet/tranquil" → San Jose, East Cape, Todos Santos
- "nightlife/restaurants" → Marina, downtown Cabo
- "investment/rental income" → high rental demand areas

BUYER INTENT DETECTION:
- "retire/retirement" → buyerIntent: "retirement"
- "vacation home/second home" → buyerIntent: "vacation_home"
- "investment/rental income/ROI" → buyerIntent: "investment"
- "relocating/moving/living full-time" → buyerIntent: "relocation"

===== RESPONSE FORMAT =====

Respond with ONLY valid JSON (no markdown, no code blocks):

**FOR SEARCH:**
{
  "city": ["Cabo San Lucas"],
  "areas": ["Marina"],
  "minPrice": 500000,
  "bedrooms": 3,
  "propertyTypes": ["Condominium"],
  "intent": "search",
  "confidence": 90,
  "buyerIntent": "vacation_home",
  "originalQuery": "${userQuery}",
  "interpretation": "Looking for 3-bed condos in Marina under $2M for vacation home"
}

**FOR COMPARISON:**
{
  "intent": "comparison",
  "comparisonAreas": ["Pedregal", "Marina"],
  "confidence": 95,
  "originalQuery": "${userQuery}",
  "interpretation": "User wants to compare Pedregal vs Marina",
  "infoType": "comparison"
}

**FOR MARKET DATA:**
{
  "intent": "market_data",
  "areas": ["Pedregal"],
  "confidence": 90,
  "originalQuery": "${userQuery}",
  "interpretation": "User asking about average prices in Pedregal",
  "specificQuestion": "average price per sqft"
}

**FOR GENERAL INFO:**
{
  "intent": "general_info",
  "confidence": 85,
  "originalQuery": "${userQuery}",
  "interpretation": "User wants to understand buying process",
  "infoType": "process",
  "recommendedAction": "provide buying steps"
}

**FOR BUYER QUALIFICATION:**
{
  "intent": "buyer_qualification",
  "buyerIntent": "retirement",
  "confidence": 90,
  "originalQuery": "${userQuery}",
  "interpretation": "Retiree looking for property in Cabo"
}

**FOR BUSINESS INFO (office hours, location, company):**
{
  "intent": "business_info",
  "infoType": "office_hours",
  "confidence": 95,
  "originalQuery": "${userQuery}",
  "interpretation": "User asking about office hours/schedule"
}

**FOR AGENT REQUEST:**
{
  "intent": "agent_request",
  "infoType": "agent_specialization",
  "confidence": 90,
  "originalQuery": "${userQuery}",
  "interpretation": "User looking for Spanish-speaking agent"
}

===== IMPORTANT REMINDERS =====
- Use the AREA KNOWLEDGE above to understand locations
- Extract buyer intent when mentioned
- Compare areas when user asks about differences
- Reference market data for pricing questions
- Be precise with number extraction
- If vague, ask for: budget, location, bedrooms, purpose
- Default limit: 20 properties

Only include relevant fields. Required: intent, confidence, originalQuery, interpretation.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 800,
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    console.log(`🤖 Groq raw response:`, responseText);

    // Clean response
    const cleaned = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const parsed: ParsedPropertyQuery = JSON.parse(cleaned);

    console.log(`✅ Parsed query:`, parsed);

    // Store in conversation context
    if (!conversationContext[sessionId]) {
      conversationContext[sessionId] = [];
    }
    conversationContext[sessionId].push(parsed);

    // Keep only last 5 queries in context
    if (conversationContext[sessionId].length > 5) {
      conversationContext[sessionId].shift();
    }

    return parsed;
  } catch (error) {
    console.error('❌ Failed to parse property query:', error);

    // Return fallback with error intent
    return {
      intent: 'clarification_needed',
      confidence: 0,
      clarificationNeeded: 'I had trouble understanding your request. Could you please rephrase? For example: "Show me 3-bedroom condos under $500k in Cabo San Lucas"',
      originalQuery: userQuery,
      interpretation: 'Error parsing query',
    };
  }
}

export function clearConversationContext(sessionId: string = 'default'): void {
  delete conversationContext[sessionId];
  console.log(`🗑️ Cleared conversation context for session: ${sessionId}`);
}

export function getConversationContext(sessionId: string = 'default'): ParsedPropertyQuery[] {
  return conversationContext[sessionId] || [];
}

// Generate conversational response based on parsed query
export async function generateConversationalResponse(
  parsedQuery: ParsedPropertyQuery,
  resultsCount: number,
  userQuery: string
): Promise<string> {
  const prompt = `You are a friendly real estate assistant for Cabo San Lucas.

USER ASKED: "${userQuery}"

PARSED FILTERS: ${JSON.stringify(parsedQuery, null, 2)}

RESULTS FOUND: ${resultsCount} properties

Generate a natural, conversational response (2-3 sentences max) that:
1. Confirms what you understood from their query
2. Tells them how many properties matched
3. If no results, suggest adjustments (broaden price, different area, fewer requirements)
4. Be warm but professional

Examples:
- "I found 12 beautiful 3-bedroom condos in Cabo San Lucas under $500k with ocean views! Take a look below."
- "Great news! There are 8 beachfront properties available near the marina. Scroll down to see them."
- "I couldn't find any 5-bedroom homes under $300k in Pedregal. Would you like to increase your budget or look at 4-bedroom options?"

Respond with ONLY the message text (no JSON, no quotes around the entire message):`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 150,
    });

    const response = completion.choices[0]?.message?.content?.trim() ||
      `I found ${resultsCount} properties matching your search.`;

    return response;
  } catch (error) {
    console.error('❌ Failed to generate conversational response:', error);
    return `I found ${resultsCount} properties matching your criteria.`;
  }
}

// Generate intelligent business responses using AI
export async function generateBusinessResponse(userQuery: string): Promise<string> {
  // Prepare business knowledge for the AI
  const businessContext = {
    company: COMPANY_INFO,
    team: TEAM_INFO,
    whyWorkWithUs: WHY_WORK_WITH_US,
  };

  const prompt = `You are an AI assistant for ${COMPANY_INFO.name}, a real estate agency in Cabo San Lucas, Mexico.

USER QUESTION: "${userQuery}"

BUSINESS KNOWLEDGE YOU HAVE ACCESS TO:
${JSON.stringify(businessContext, null, 2)}

CRITICAL INSTRUCTIONS:
1. If this is a YES/NO question (starts with "do", "does", "is", "are", "can", "has", "have", "will", etc.), you MUST start your response with either "Yes!" or "No!"
2. After the yes/no answer, provide helpful details from the business knowledge above.
3. IMPORTANT: If the question asks about information NOT in the business knowledge (like parking, WiFi, specific amenities, agent gender, etc.), you MUST respond with "I don't have that specific information" and suggest they contact the office directly.
4. Never make up information. Only use data from the business knowledge provided.
5. Keep responses friendly, professional, and conversational.
6. Use emojis sparingly (1-2 max) and only where natural.
7. CRITICAL: When including the Google Maps link, ALWAYS use markdown format: [View on Google Maps](https://maps.app.goo.gl/DsyfVAHBARUKDJAX8) - NOT plain URLs
8. CRITICAL: All URLs must use markdown link syntax [text](url) - never output bare URLs
9. CRITICAL: When mentioning specific agents by name, ALWAYS include a clickable profile link using their slug: [Agent Name](/team/slug) - for example: [Don Weis](/team/don), [Alfonso Puente](/team/alfonso), [David Scott Piper](/team/david)
10. End with a helpful call-to-action when appropriate.

EXAMPLES OF CORRECT RESPONSES:

Q: "Is your office open on weekends?"
A: "Yes! We're open on weekends. Our office hours are Monday-Sunday: 8AM-9PM PT. Feel free to call us at +52 624 143 5555 or stop by anytime!"

Q: "Where is your office located?"
A: "Our office is located at Boulevard Marina s/n y Vicente Guerrero s/n, Manzana 31-A, Colonia Centro, Cabo San Lucas, Baja California Sur, México 23400. [View on Google Maps](https://maps.app.goo.gl/DsyfVAHBARUKDJAX8). We're in the heart of downtown Cabo, just steps from the Marina!"

Q: "Do you have Spanish-speaking agents?" or "Can you recommend a Spanish-speaking agent?"
A: "Yes! All 13 of our agents are bilingual in English and Spanish. Some great options include [Don Weis](/team/don), [Alfonso Puente](/team/alfonso), and [David Scott Piper](/team/david). Would you like to learn more about a specific agent or search for properties?"

Q: "Can I get a link for one of these agents?" or "Where can I see their profile?"
A: "Of course! Here are links to their profiles: [Don Weis](/team/don), [Alfonso Puente](/team/alfonso), [David Scott Piper](/team/david). You can also [view our full team](/team) to see all 13 agents."

Q: "Does your office have parking?" or "Is there parking?"
A: "I don't have specific information about parking availability at our office. Please contact us at +52 624 143 5555 or info@bircabo.com to confirm. Our office is located at Boulevard Marina s/n in Downtown Cabo San Lucas."

Q: "Do you have male agents?"
A: "I don't have information about our agents' gender in my database, but I can tell you about our team of 13 experienced agents. Would you like to hear about specific specializations like luxury properties, investments, or language preferences?"

YOUR RESPONSE (answer text only, no JSON, no metadata, no explanations):`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 300,
    });

    return completion.choices[0]?.message?.content?.trim() || "I'd be happy to help! Could you rephrase your question?";
  } catch (error) {
    console.error('❌ Failed to generate business response:', error);
    // Fallback to basic response
    return `I'd be happy to help! Please contact us:\n\n📞 ${COMPANY_INFO.phone}\n📧 ${COMPANY_INFO.email}\n\nOur team is available ${COMPANY_INFO.officeHours.formatted}.`;
  }
}

// Ask clarifying questions when query is ambiguous
export async function generateClarifyingQuestion(parsedQuery: ParsedPropertyQuery): Promise<string> {
  if (!parsedQuery.clarificationNeeded) {
    return "Could you provide more details about what you're looking for?";
  }

  const prompt = `You are a real estate assistant. The user's query was too vague.

WHAT WE UNDERSTOOD: ${parsedQuery.interpretation}
WHAT'S MISSING: ${parsedQuery.clarificationNeeded}

Generate a friendly question (1-2 sentences) to get the missing information. Be specific and helpful.

Examples:
- "I'd be happy to help! What's your budget range for this property?"
- "Got it! Are you looking in a specific area like Cabo San Lucas, San Jose del Cabo, or the Corridor?"
- "Perfect! How many bedrooms are you looking for?"

Respond with ONLY the question text (no JSON, no quotes):`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 100,
    });

    return completion.choices[0]?.message?.content?.trim() || parsedQuery.clarificationNeeded;
  } catch (error) {
    console.error('❌ Failed to generate clarifying question:', error);
    return parsedQuery.clarificationNeeded;
  }
}
