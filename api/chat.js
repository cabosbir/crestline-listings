import Groq from "groq-sdk";

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Validate Groq API key
    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY not configured');
      return res.status(500).json({ 
        error: 'AI service not configured. Please contact us directly at cabosbir@gmail.com or +52 612 169 8328' 
      });
    }

    // Initialize Groq client
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    // System prompt with real estate context
    const systemPrompt = {
      role: "system",
      content: `You are a knowledgeable and friendly AI assistant for Baja International Realty (BIR), a luxury real estate agency in Cabo San Lucas, Baja California Sur, Mexico.

COMPANY INFORMATION:
- Name: Baja International Realty
- Location: Blvd. Marina, Cabo San Lucas, BCS, Mexico
- Phone: +52 612 169 8328
- Email: cabosbir@gmail.com
- Specialization: Luxury properties in Cabo San Lucas and Baja California Sur
- Experience: Since 2014, 85+ combined years of team experience
- Track Record: 2,200+ properties sold, $800M+ in sales

AREAS SERVED:
- Cabo San Lucas
- San José del Cabo
- Tourist Corridor (between Cabo and San José)
- Marina District
- Golf Communities (Quivira, Palmilla, etc.)
- Beachfront areas

PROPERTY TYPES:
- Beachfront Villas
- Luxury Condos
- Golf Course Estates
- Penthouses
- Investment Properties
- Vacation Rentals

YOUR ROLE:
1. Answer questions about Cabo San Lucas real estate market
2. Provide information about neighborhoods and areas
3. Explain the buying process in Mexico for foreigners
4. Discuss property types, pricing ranges, and amenities
5. Share insights about living in Cabo San Lucas
6. Guide users on next steps (viewing properties, contacting agents)

IMPORTANT GUIDELINES:
- Always be helpful, professional, and enthusiastic about Cabo San Lucas
- For specific property inquiries, recommend contacting the team directly
- For pricing, give general ranges but suggest contacting agents for exact prices
- Mention that properties are listed in USD
- Remind users about Fideicomiso (bank trust) for foreign property ownership
- Encourage scheduling viewings through the contact form or calling directly
- If asked about availability or specific listings, direct them to contact the team
- Be honest if you don't know something - suggest contacting the agents

Keep responses concise, friendly, and focused on helping the user find their dream property in Cabo San Lucas.`
    };

    // Call Groq API
    const chatCompletion = await groq.chat.completions.create({
      messages: [systemPrompt, ...messages],
      model: "mixtral-8x7b-32768", // Fast and capable model
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: false
    });

    const assistantMessage = chatCompletion.choices[0]?.message?.content || 
      "I apologize, I couldn't generate a response. Please contact our team directly.";

    console.log('✅ Groq AI response generated successfully');

    return res.status(200).json({
      success: true,
      message: assistantMessage
    });

  } catch (error) {
    console.error('❌ Groq AI error:', error);

    // Check for specific error types
    if (error.status === 401) {
      return res.status(500).json({
        success: false,
        error: 'AI service authentication failed. Please contact us directly.',
        message: "I'm having trouble connecting right now. Please reach out to our team at cabosbir@gmail.com or call +52 612 169 8328."
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to get AI response',
      message: "I apologize, but I'm experiencing technical difficulties. Please contact our team directly at cabosbir@gmail.com or +52 612 169 8328 for immediate assistance.",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
