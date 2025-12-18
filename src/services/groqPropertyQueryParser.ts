// groqPropertyQueryParser.ts - Natural Language Property Search Query Parser
import Groq from 'groq-sdk';

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
  intent: 'search' | 'question' | 'clarification_needed' | 'greeting' | 'off_topic';
  confidence: number;
  clarificationNeeded?: string;
  originalQuery: string;
  interpretation: string;
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

  const prompt = `You are an expert real estate search assistant for Cabo San Lucas, Los Cabos, Mexico.

Your job: Parse the user's natural language query into structured MLS search filters.

USER QUERY: "${userQuery}"

${previousContext ? `\nPREVIOUS SEARCH CONTEXT:\n${JSON.stringify(previousContext, null, 2)}` : ''}

${history.length > 0 ? `\nCONVERSATION HISTORY (last ${Math.min(3, history.length)} queries):\n${history.slice(-3).map(h => h.originalQuery).join('\n')}` : ''}

LOCATION HIERARCHY:
- CITIES (zones): "Cabo San Lucas", "San Jose del Cabo", "Cabo Corridor", "Todos Santos", "La Paz", "East Cape"
- AREAS: neighborhoods within cities (e.g., "Pedregal", "Downtown", "Marina", "El Tezal")
- COMMUNITIES: master-planned communities (e.g., "Querencia", "Palmilla", "Cabo Del Sol", "Chileno Bay")
- SUBDIVISIONS: specific developments

PROPERTY TYPES:
- "Residential" (single family homes)
- "Condominium"
- "Lots/Land"
- "Townhouse"
- "Commercial"

COMMON MAPPINGS:
- "beachfront" / "ocean view" / "waterfront" → oceanView: true
- "pool" / "swimming pool" → pool: true
- "condo" / "condos" → propertyTypes: ["Condominium"]
- "house" / "home" / "villa" → propertyTypes: ["Residential"]
- "land" / "lot" → propertyTypes: ["Lots/Land"]
- "luxury" → minPrice: 1000000
- "affordable" / "budget" → maxPrice: 500000
- "under X" / "below X" → maxPrice: X
- "over X" / "above X" → minPrice: X

INTENT DETECTION:
- "search": User wants to find properties (e.g., "Show me condos under $500k")
- "question": User is asking about market/area (e.g., "What's the average price in Pedregal?")
- "clarification_needed": Query is too vague (e.g., "Show me properties")
- "greeting": User is greeting (e.g., "Hi", "Hello")
- "off_topic": Not related to real estate

IMPORTANT:
- If query mentions specific numbers, extract them precisely
- If query is vague, set intent to "clarification_needed" and suggest what info is needed
- Combine filters intelligently (e.g., "luxury beachfront" = minPrice + oceanView)
- Default limit to 20 unless specified
- If user says "near the marina", use areas: ["Marina"] or communities with marina

Respond with ONLY valid JSON (no markdown, no code blocks):
{
  "city": ["Cabo San Lucas"],
  "areas": [],
  "communities": [],
  "subdivisions": [],
  "minPrice": 500000,
  "maxPrice": 2000000,
  "bedrooms": 3,
  "bathrooms": 2,
  "propertyTypes": ["Condominium"],
  "status": "Active",
  "amenities": ["pool", "ocean view"],
  "oceanView": true,
  "beachfront": false,
  "pool": true,
  "limit": 20,
  "sortBy": "price_low",
  "intent": "search",
  "confidence": 85,
  "clarificationNeeded": null,
  "originalQuery": "${userQuery}",
  "interpretation": "Looking for 3-bedroom condos under $2M in Cabo San Lucas with ocean views"
}

Only include fields that are relevant to the query. If a field isn't mentioned, omit it (except intent, confidence, originalQuery, interpretation).`;

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
