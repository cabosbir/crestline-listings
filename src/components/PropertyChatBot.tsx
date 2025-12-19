import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, X, Bot, Sparkles, Home, MapPin, AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import PropertyCard from "@/components/PropertyCard";
import { fetchListings, convertMLSToPropertyCard, MLSProperty } from "@/services/flexMlsService";
import {
  parsePropertyQuery,
  generateConversationalResponse,
  generateClarifyingQuestion,
  ParsedPropertyQuery,
} from "@/services/groqPropertyQueryParser";
import { getAreaKnowledge, compareAreas, BUYING_PROCESS, OWNERSHIP_COSTS, MARKET_INSIGHTS, COMMON_FAQS } from "@/services/realEstateKnowledge";
import { COMPANY_INFO, TEAM_INFO, WHY_WORK_WITH_US, getAgentByName, getAgentsByLanguage, getAgentsBySpecialization, formatOfficeHours, formatAddress } from "@/services/businessKnowledge";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  properties?: MLSProperty[];
  parsedQuery?: ParsedPropertyQuery;
}

interface PropertyChatBotProps {
  onClose: () => void;
  fullPage?: boolean; // If true, render as full page instead of modal
}

const PropertyChatBot = ({ onClose, fullPage = false }: PropertyChatBotProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your assistant for Baja International Realty. I can help you:\n\n🏠 **Search Properties** - Find homes, condos, and land in Los Cabos\n📍 **Area Info** - Learn about neighborhoods and communities\n👥 **Meet Our Team** - Connect with expert local agents\n📝 **Get Started** - Access buyer/seller forms\n\nTry asking:\n• \"Show me 3-bedroom condos under $500k\"\n• \"What areas are best for beachfront living?\"\n• \"I'm interested in properties, how do I get started?\"\n\nWhat can I help you with today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(`session_${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Parse the natural language query
      const parsedQuery = await parsePropertyQuery(input, sessionId);

      console.log("📋 Parsed Query:", parsedQuery);

      // Handle different intents
      if (parsedQuery.intent === "greeting") {
        const greetingMessage: Message = {
          role: "assistant",
          content: "Hello! I'd be happy to help you find properties in Los Cabos. What type of property are you interested in?",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, greetingMessage]);
        setIsLoading(false);
        return;
      }

      if (parsedQuery.intent === "off_topic") {
        const offTopicMessage: Message = {
          role: "assistant",
          content: "I specialize in helping you find real estate in Los Cabos. What type of property can I help you search for today?",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, offTopicMessage]);
        setIsLoading(false);
        return;
      }

      if (parsedQuery.intent === "clarification_needed") {
        const clarifyingQuestion = await generateClarifyingQuestion(parsedQuery);
        const clarificationMessage: Message = {
          role: "assistant",
          content: clarifyingQuestion,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, clarificationMessage]);
        setIsLoading(false);
        return;
      }

      // NEW: Handle area comparisons intelligently
      if (parsedQuery.intent === "comparison" && parsedQuery.comparisonAreas && parsedQuery.comparisonAreas.length >= 2) {
        const comparison = compareAreas(parsedQuery.comparisonAreas[0], parsedQuery.comparisonAreas[1]);
        const area1 = getAreaKnowledge(parsedQuery.comparisonAreas[0]);
        const area2 = getAreaKnowledge(parsedQuery.comparisonAreas[1]);

        let comparisonResponse = comparison;

        if (area1 && area2) {
          comparisonResponse += `\n\n**${area1.name} - Best For:**\n${area1.bestFor.map(b => `• ${b}`).join('\n')}`;
          comparisonResponse += `\n\n**${area2.name} - Best For:**\n${area2.bestFor.map(b => `• ${b}`).join('\n')}`;
          comparisonResponse += `\n\n**Bottom Line:**\n• Choose ${area1.name} if you want: ${area1.lifestyle.slice(0, 3).join(', ')}`;
          comparisonResponse += `\n• Choose ${area2.name} if you want: ${area2.lifestyle.slice(0, 3).join(', ')}`;
          comparisonResponse += `\n\nWould you like to search for properties in either area?`;
        }

        const comparisonMessage: Message = {
          role: "assistant",
          content: comparisonResponse,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, comparisonMessage]);
        setIsLoading(false);
        return;
      }

      // NEW: Handle market data questions
      if (parsedQuery.intent === "market_data") {
        let marketResponse = "";

        if (parsedQuery.areas && parsedQuery.areas.length > 0) {
          const areaName = parsedQuery.areas[0];
          const areaInfo = getAreaKnowledge(areaName);

          if (areaInfo) {
            marketResponse = `**Market Data for ${areaInfo.name}:**\n\n`;
            marketResponse += `💵 **Price Range:** $${areaInfo.pricePerSqFt.min}-${areaInfo.pricePerSqFt.max} per square foot\n`;
            marketResponse += `📈 **Appreciation:** ${areaInfo.appreciation} (historically 3-5% annually)\n`;
            marketResponse += `🏠 **Rental Demand:** ${areaInfo.rentalDemand}\n`;

            if (areaInfo.avgHOA) {
              marketResponse += `💰 **HOA Fees:** $${areaInfo.avgHOA.min}-${areaInfo.avgHOA.max}/month\n`;
            }

            marketResponse += `\n**For Example:**\n`;
            marketResponse += `• 2,000 sq ft property: ~$${(areaInfo.pricePerSqFt.min * 2000).toLocaleString()}-$${(areaInfo.pricePerSqFt.max * 2000).toLocaleString()}\n`;
            marketResponse += `• Rental yields: 5-8% gross for well-managed vacation rentals\n`;

            marketResponse += `\n*Note: Actual prices vary by specific location, views, condition, and amenities. These are market averages.*\n\n`;
            marketResponse += `Want to see actual listings in ${areaInfo.name}?`;
          } else {
            marketResponse = `I'd be happy to provide market data! Los Cabos market insights:\n\n`;
            marketResponse += MARKET_INSIGHTS.slice(0, 5).map(insight => `• **${insight.topic}:** ${insight.insight}`).join('\n');
            marketResponse += `\n\nWhich specific area would you like detailed pricing for? (e.g., Pedregal, Marina, Cabo Corridor)`;
          }
        } else {
          marketResponse = `**Los Cabos Real Estate Market Overview:**\n\n`;
          marketResponse += MARKET_INSIGHTS.map(insight => `📊 **${insight.topic}:** ${insight.insight}`).join('\n\n');
          marketResponse += `\n\nWould you like detailed pricing for a specific area?`;
        }

        const marketMessage: Message = {
          role: "assistant",
          content: marketResponse,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, marketMessage]);
        setIsLoading(false);
        return;
      }

      // NEW: Handle buyer qualification
      if (parsedQuery.intent === "buyer_qualification") {
        let qualificationResponse = "";

        if (parsedQuery.buyerIntent === "retirement") {
          qualificationResponse = `**Perfect! Los Cabos is an excellent retirement destination.**\n\n`;
          qualificationResponse += `**Best Areas for Retirees:**\n`;
          qualificationResponse += `🏡 **San Jose del Cabo** - Quieter, cultural, walkable downtown, good healthcare\n`;
          qualificationResponse += `🏖️ **Cabo Corridor** - Resort living, golf, beaches, established expat community\n`;
          qualificationResponse += `🌅 **Pedregal** - Luxury, security, views, close to amenities\n\n`;
          qualificationResponse += `**Key Considerations for Retirees:**\n`;
          qualificationResponse += `• Healthcare: Excellent private hospitals, 50-70% cheaper than US\n`;
          qualificationResponse += `• Property tax: Only 0.1-0.3% annually (very low!)\n`;
          qualificationResponse += `• Walkability: Marina/San Jose downtown best, elsewhere car needed\n`;
          qualificationResponse += `• Expat community: Large English-speaking community\n`;
          qualificationResponse += `• Climate: 350+ days sunshine, 70-90°F year-round\n\n`;
          qualificationResponse += `What's your budget range? I can show you retirement-perfect properties!`;
        } else if (parsedQuery.buyerIntent === "investment") {
          qualificationResponse = `**Los Cabos is a strong investment market!**\n\n`;
          qualificationResponse += `**Best ROI Areas:**\n`;
          qualificationResponse += `🏆 **#1: Beachfront (Corridor)** - Highest rental rates, $600-2000/sqft\n`;
          qualificationResponse += `🎣 **#2: Marina/Downtown** - Strong occupancy, walkable, $450-900/sqft\n`;
          qualificationResponse += `🏘️ **#3: Palmilla/Resort Communities** - Proven rental track record\n\n`;
          qualificationResponse += `**Investment Metrics:**\n`;
          qualificationResponse += `• Rental Yields: 5-8% gross annually\n`;
          qualificationResponse += `• Appreciation: 3-5% historical average\n`;
          qualificationResponse += `• Peak Season: Nov-April (rates 2-3x summer)\n`;
          qualificationResponse += `• Property Management: Typically 20-30% of rental income\n\n`;
          qualificationResponse += `**Key Costs:**\n`;
          qualificationResponse += `• Closing: 4-6% of purchase price\n`;
          qualificationResponse += `• Annual: Property tax 0.1-0.3%, HOA $200-1200/month\n\n`;
          qualificationResponse += `What's your investment budget? I'll find high-ROI properties!`;
        } else if (parsedQuery.buyerIntent === "vacation_home") {
          qualificationResponse = `**Los Cabos is perfect for a vacation home!**\n\n`;
          qualificationResponse += `**Top Vacation Home Areas:**\n`;
          qualificationResponse += `🏖️ **Cabo Corridor** - Premier beaches, resort amenities, rental potential\n`;
          qualificationResponse += `🏔️ **Pedregal** - Luxury, views, beach club, close to Cabo nightlife\n`;
          qualificationResponse += `⛵ **Marina** - Walkable, restaurants, fishing, vibrant atmosphere\n\n`;
          qualificationResponse += `**Vacation Home Perks:**\n`;
          qualificationResponse += `• Use it when you want, rent it when you don't\n`;
          qualificationResponse += `• Rental income can offset costs (5-8% yields)\n`;
          qualificationResponse += `• Property management available ($200-400/month)\n`;
          qualificationResponse += `• Easy access: Direct flights from major US/Canadian cities\n\n`;
          qualificationResponse += `**Typical Costs:**\n`;
          qualificationResponse += `• HOA: $200-1200/month (covers landscaping, security, amenities)\n`;
          qualificationResponse += `• Utilities: ~$150-350/month\n`;
          qualificationResponse += `• Property tax: 0.1-0.3% annually\n\n`;
          qualificationResponse += `How often do you plan to visit? And what's your budget range?`;
        } else if (parsedQuery.buyerIntent === "relocation") {
          qualificationResponse = `**Relocating to Los Cabos full-time!**\n\n`;
          qualificationResponse += `**Best Areas for Full-Time Living:**\n`;
          qualificationResponse += `🏡 **San Jose del Cabo** - Local services, schools, authentic, affordable\n`;
          qualificationResponse += `🏘️ **El Tezal** - Family-friendly, supermarkets, local community\n`;
          qualificationResponse += `⛵ **Marina (if you like action)** - Walkable, no car needed, restaurants\n\n`;
          qualificationResponse += `**Full-Time Living Considerations:**\n`;
          qualificationResponse += `• Visa: Tourist visa 180 days, or get temporary/permanent residency\n`;
          qualificationResponse += `• Cost of living: 30-50% less than US/Canada\n`;
          qualificationResponse += `• Schools: International schools available in San Jose\n`;
          qualificationResponse += `• Work: Many expats are remote workers or retirees\n`;
          qualificationResponse += `• Car: Recommended outside Marina/downtown areas\n`;
          qualificationResponse += `• Community: Large expat community, English widely spoken\n\n`;
          qualificationResponse += `Are you working remotely, retiring, or starting a business? What's your budget?`;
        } else {
          qualificationResponse = `**I'd love to help you find the perfect property in Los Cabos!**\n\n`;
          qualificationResponse += `To give you the best recommendations, could you tell me:\n\n`;
          qualificationResponse += `🎯 **What brings you to Los Cabos?**\n`;
          qualificationResponse += `• Vacation/second home\n`;
          qualificationResponse += `• Investment/rental income\n`;
          qualificationResponse += `• Retirement\n`;
          qualificationResponse += `• Full-time relocation\n\n`;
          qualificationResponse += `💰 **What's your budget range?**\n`;
          qualificationResponse += `🏠 **How many bedrooms?**\n`;
          qualificationResponse += `📍 **Any area preferences?** (beachfront, walkable, quiet, etc.)\n\n`;
          qualificationResponse += `This helps me narrow down the perfect options for you!`;
        }

        const qualificationMessage: Message = {
          role: "assistant",
          content: qualificationResponse,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, qualificationMessage]);
        setIsLoading(false);
        return;
      }

      // NEW: Handle business info questions (office hours, location, company history)
      if (parsedQuery.intent === "business_info") {
        let businessResponse = "";

        if (parsedQuery.infoType === "office_hours") {
          businessResponse = `**${COMPANY_INFO.name} Office Hours:**\n\n`;
          businessResponse += `📅 Monday-Friday: ${COMPANY_INFO.officeHours.monday}\n`;
          businessResponse += `📅 Saturday: ${COMPANY_INFO.officeHours.saturday}\n`;
          businessResponse += `📅 Sunday: ${COMPANY_INFO.officeHours.sunday}\n\n`;
          businessResponse += `📞 **Call anytime:** ${COMPANY_INFO.phone}\n`;
          businessResponse += `📧 **Email:** ${COMPANY_INFO.email}\n\n`;
          businessResponse += `We're located in downtown Cabo San Lucas, just steps from the Marina!\n\n`;
          businessResponse += `Would you like to schedule a meeting or search for properties?`;
        } else if (parsedQuery.infoType === "office_location") {
          businessResponse = `**${COMPANY_INFO.name} Office Location:**\n\n`;
          businessResponse += `📍 ${formatAddress()}\n\n`;
          businessResponse += `🗺️ [**Get Directions on Google Maps**](${COMPANY_INFO.address.googleMapsLink})\n\n`;
          businessResponse += `We're conveniently located in the heart of Downtown Cabo San Lucas, just steps from the Marina. Easy to find and always ready to assist you!\n\n`;
          businessResponse += `📞 **Phone:** ${COMPANY_INFO.phone}\n`;
          businessResponse += `📧 **Email:** ${COMPANY_INFO.email}\n`;
          businessResponse += `⏰ **Hours:** ${formatOfficeHours()}\n\n`;
          businessResponse += `Visit us during regular business hours, or contact us to schedule a private appointment!`;
        } else if (parsedQuery.infoType === "company_history") {
          businessResponse = `**About ${COMPANY_INFO.name}:**\n\n`;
          businessResponse += `${COMPANY_INFO.founderBio}\n\n`;
          businessResponse += `**Our Track Record:**\n`;
          businessResponse += `• ${COMPANY_INFO.stats.combinedYearsExperience} combined years of experience\n`;
          businessResponse += `• ${COMPANY_INFO.stats.propertiesSold} properties sold\n`;
          businessResponse += `• ${COMPANY_INFO.stats.totalSalesVolume} in total sales volume\n`;
          businessResponse += `• ${COMPANY_INFO.stats.familiesServed} families served\n`;
          businessResponse += `• ${COMPANY_INFO.stats.totalAgents} expert agents\n\n`;
          businessResponse += `**Memberships & Recognition:**\n`;
          businessResponse += COMPANY_INFO.memberships.map(m => `• ${m}`).join('\n');
          businessResponse += `\n\n**Featured On:** ${COMPANY_INFO.mediaFeatures.join(', ')}\n\n`;
          businessResponse += `Want to start your property search?`;
        } else if (parsedQuery.infoType === "why_work_with_us") {
          businessResponse = `**Why Choose ${COMPANY_INFO.name}?**\n\n`;
          businessResponse += `${WHY_WORK_WITH_US.family}\n\n`;
          businessResponse += `${WHY_WORK_WITH_US.experience}\n\n`;
          businessResponse += `${WHY_WORK_WITH_US.innovation}\n\n`;
          businessResponse += `${WHY_WORK_WITH_US.results}\n\n`;
          businessResponse += `Ready to experience the difference? [Contact us](/contact) or start searching properties now!`;
        } else {
          // Generic business info
          businessResponse = `**${COMPANY_INFO.name}** - Your trusted Cabo San Lucas real estate partner since the ${COMPANY_INFO.founded}!\n\n`;
          businessResponse += `📞 **Phone:** ${COMPANY_INFO.phone}\n`;
          businessResponse += `📧 **Email:** ${COMPANY_INFO.email}\n`;
          businessResponse += `📍 **Office:** Downtown Cabo San Lucas (near Marina)\n`;
          businessResponse += `⏰ **Hours:** ${formatOfficeHours()}\n\n`;
          businessResponse += `${COMPANY_INFO.stats.totalAgents} agents ready to help you find what you're looking for.`;
        }

        const businessMessage: Message = {
          role: "assistant",
          content: businessResponse,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, businessMessage]);
        setIsLoading(false);
        return;
      }

      // NEW: Handle agent-specific requests
      if (parsedQuery.intent === "agent_request") {
        let agentResponse = "";

        if (parsedQuery.infoType === "agent_info" && parsedQuery.agentName) {
          const agent = getAgentByName(parsedQuery.agentName);
          if (agent) {
            agentResponse = `**${agent.name}**\n${agent.title}\n\n`;
            agentResponse += `**Specialization:** ${agent.specialization}\n`;
            agentResponse += `**Experience:** ${agent.yearsExperience} years in Los Cabos\n`;
            agentResponse += `**Properties Sold:** ${agent.propertiesSold}+\n`;
            agentResponse += `**Languages:** ${agent.languages.join(', ')}\n\n`;
            agentResponse += `📞 **Phone:** ${agent.phone}\n`;
            if (agent.phoneSecondary) agentResponse += `📞 **Alt Phone:** ${agent.phoneSecondary}\n`;
            agentResponse += `📧 **Email:** ${agent.email}\n\n`;
            agentResponse += `**About ${agent.name.split(' ')[0]}:**\n${agent.bio}\n\n`;
            agentResponse += `**Certifications:**\n${agent.certifications.map(c => `• ${c}`).join('\n')}\n\n`;
            agentResponse += `Ready to connect with ${agent.name.split(' ')[0]}? Call ${agent.phone} or visit [/contact](/contact)`;
          } else {
            agentResponse = `I couldn't find an agent by that name. Here's our full team:\n\n`;
            agentResponse += TEAM_INFO.slice(0, 5).map(a => `• **${a.name}** - ${a.specialization} (${a.yearsExperience} yrs)`).join('\n');
            agentResponse += `\n\n[View Full Team](/team) | Call us: ${COMPANY_INFO.phone}`;
          }
        } else if (parsedQuery.infoType === "agent_specialization") {
          // Extract specialization from query
          const query = parsedQuery.originalQuery.toLowerCase();

          if (query.includes('spanish')) {
            const spanishAgents = getAgentsByLanguage('Spanish');
            agentResponse = `**Our Spanish-Speaking Agents:**\n\n`;
            agentResponse += spanishAgents.map(a =>
              `• **${a.name}** - ${a.title} (${a.yearsExperience} yrs) - ${a.phone}`
            ).join('\n');
            agentResponse += `\n\nAll of these agents are fluent in both English and Spanish.`;
          } else if (query.includes('investment')) {
            const investmentAgents = getAgentsBySpecialization('investment');
            agentResponse = `**Our Investment Property Specialists:**\n\n`;
            agentResponse += investmentAgents.map(a =>
              `• **${a.name}** - ${a.specialization} (${a.yearsExperience} yrs, ${a.propertiesSold}+ sold) - ${a.phone}`
            ).join('\n');
            agentResponse += `\n\nThese agents specialize in high-yield investment properties and portfolio management.`;
          } else if (query.includes('luxury')) {
            const luxuryAgents = getAgentsBySpecialization('luxury');
            agentResponse = `**Our Luxury Property Specialists:**\n\n`;
            agentResponse += luxuryAgents.map(a =>
              `• **${a.name}** - ${a.specialization} (${a.yearsExperience} yrs) - ${a.phone}`
            ).join('\n');
            agentResponse += `\n\nOur luxury specialists have extensive experience with high-end properties.`;
          } else if (query.includes('commercial')) {
            const commercialAgents = getAgentsBySpecialization('commercial');
            agentResponse = `**Our Commercial Real Estate Experts:**\n\n`;
            agentResponse += commercialAgents.map(a =>
              `• **${a.name}** - ${a.specialization} (${a.yearsExperience} yrs) - ${a.phone}`
            ).join('\n');
          } else {
            // Show all agents
            agentResponse = `**Meet Our ${TEAM_INFO.length} Expert Agents:**\n\n`;
            agentResponse += TEAM_INFO.slice(0, 6).map(a =>
              `• **${a.name}** - ${a.title}\n  ${a.specialization} | ${a.yearsExperience} yrs | ${a.languages.join('/')} | ${a.phone}`
            ).join('\n\n');
            agentResponse += `\n\n[View Full Team](/team) | Contact us: ${COMPANY_INFO.phone}`;
          }
        } else {
          // Check if query contains language/specialization keywords as fallback
          const query = parsedQuery.originalQuery.toLowerCase();

          if (query.includes('spanish') || query.includes('speaks') || query.includes('language')) {
            const spanishAgents = getAgentsByLanguage('Spanish');
            agentResponse = `**Our Spanish-Speaking Agents:**\n\n`;
            agentResponse += spanishAgents.map(a =>
              `• **${a.name}** - ${a.title} (${a.yearsExperience} yrs) - ${a.phone}`
            ).join('\n');
            agentResponse += `\n\nAll of these agents are fluent in both English and Spanish.`;
          } else if (query.includes('investment')) {
            const investmentAgents = getAgentsBySpecialization('investment');
            agentResponse = `**Our Investment Property Specialists:**\n\n`;
            agentResponse += investmentAgents.map(a =>
              `• **${a.name}** - ${a.specialization} (${a.yearsExperience} yrs, ${a.propertiesSold}+ sold) - ${a.phone}`
            ).join('\n');
            agentResponse += `\n\nThese agents specialize in high-yield investment properties and portfolio management.`;
          } else if (query.includes('luxury')) {
            const luxuryAgents = getAgentsBySpecialization('luxury');
            agentResponse = `**Our Luxury Property Specialists:**\n\n`;
            agentResponse += luxuryAgents.map(a =>
              `• **${a.name}** - ${a.specialization} (${a.yearsExperience} yrs) - ${a.phone}`
            ).join('\n');
            agentResponse += `\n\nOur luxury specialists have extensive experience with high-end properties.`;
          } else {
            // Generic agent list
            agentResponse = `**Our Expert Team of ${TEAM_INFO.length} Agents:**\n\n`;
            agentResponse += `${COMPANY_INFO.stats.combinedYearsExperience} combined years of experience serving Los Cabos!\n\n`;
            agentResponse += `**Featured Agents:**\n`;
            agentResponse += TEAM_INFO.slice(0, 5).map(a =>
              `• **${a.name}** - ${a.specialization} (${a.yearsExperience} yrs)`
            ).join('\n');
            agentResponse += `\n\n[View All ${TEAM_INFO.length} Agents](/team) | Call: ${COMPANY_INFO.phone}`;
          }
        }

        const agentMessage: Message = {
          role: "assistant",
          content: agentResponse,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, agentMessage]);
        setIsLoading(false);
        return;
      }

      if (parsedQuery.intent === "general_info") {
        // Check if we just gave this same response (prevent loops)
        const lastMessage = messages[messages.length - 1];
        const isRepeatingAreas = lastMessage.role === "assistant" &&
                                lastMessage.content.includes("Los Cabos offers diverse neighborhoods");

        if (isRepeatingAreas) {
          // User likely wants to search, not info - convert to clarification
          const clarificationMessage: Message = {
            role: "assistant",
            content: "I'd be happy to help you search for properties! To get started, could you tell me:\n\n• What type of property? (condo, house, land)\n• Your budget range?\n• How many bedrooms?\n\nOr simply say something like: \"Show me 3-bedroom condos under $500k in Pedregal\"",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, clarificationMessage]);
          setIsLoading(false);
          return;
        }

        // Provide company/area/process information
        let responseContent = "";

        if (parsedQuery.infoType === "office") {
          responseContent = `**${COMPANY_INFO.name}**\n\n📍 **Location:** ${formatAddress()}\n📞 **Phone:** ${COMPANY_INFO.phone}\n📧 **Email:** ${COMPANY_INFO.email}\n⏰ **Hours:** ${formatOfficeHours()}\n\nWe handle residential, commercial, and land sales throughout Los Cabos. Our team of ${COMPANY_INFO.stats.totalAgents} agents can help you find what you're looking for.\n\nWant to search properties or meet our team?`;
        } else if (parsedQuery.infoType === "agents") {
          responseContent = `We have ${TEAM_INFO.length} local agents who know Los Cabos well.\n\n👥 **Meet Our Team:** [View All Agents](/team)\n\n**Stats:**\n• ${COMPANY_INFO.stats.combinedYearsExperience} combined years experience\n• ${COMPANY_INFO.stats.propertiesSold} properties sold\n• All agents are MLS/AMPI certified\n\nEach agent has different expertise in areas and property types. Want to search properties or contact an agent?`;
        } else if (parsedQuery.infoType === "areas") {
          responseContent = "Los Cabos offers diverse neighborhoods, each with its own character:\n\n🏖️ **Cabo San Lucas** - Vibrant marina, nightlife, beaches\n🏡 **San Jose del Cabo** - Historic downtown, art galleries, tranquil\n🌅 **Cabo Corridor** - Luxury resorts, golf courses, stunning coastline\n🎨 **Todos Santos** - Artistic community, surfing, bohemian vibe\n\n**Best Areas for Beachfront Living:**\n🌊 **Cabo Corridor** - Premier beachfront real estate, world-class resorts, stunning ocean views\n🏖️ **Pedregal** - Dramatic hillside properties with private beach club access in Cabo San Lucas\n🌅 **Palmilla/San Jose Corridor** - Tranquil beaches, excellent for swimming and water sports\n🐚 **East Cape** - Secluded, pristine beaches for those seeking privacy and natural beauty\n🎣 **Marina District** - Not beachfront but waterfront living with easy beach access\n\n**Other Popular Areas:**\n• Downtown San Jose del Cabo - Art galleries, dining, historic charm\n• El Tezal - Family-friendly, affordable, close to beaches\n• Todos Santos - Bohemian surf town on the Pacific side\n\nWant to search for beachfront properties in a specific area?";
        } else if (parsedQuery.infoType === "rental_investment") {
          responseContent = "**💰 Best Areas for Rental ROI in Los Cabos:**\n\n🏆 **#1: Beachfront Properties**\n• Highest rental demand year-round\n• Premium nightly rates\n• Attracts luxury travelers\n\n🎣 **#2: Walking Distance to Marina/Downtown**\n• Easy access to fishing charters, restaurants, nightlife\n• Popular with active travelers\n• Strong booking consistency\n\n🏘️ **#3: Master-Planned Communities**\n• Proven vacation rental track records\n• Resort-style amenities (pools, security, beach clubs)\n• Examples: Cabo Del Sol, Querencia, Palmilla\n\n**📊 Investment Tips:**\n• Short-term vacation rentals typically outperform long-term\n• Properties near golf courses attract premium renters\n• Proximity to Los Cabos airport is a strong advantage\n\n*Note: Individual rental history isn't searchable in MLS, but our agents have insider knowledge on which communities perform best.*\n\n**Ready to explore investment properties?** [Contact our team](/contact) for personalized rental income projections!";
        } else if (parsedQuery.infoType === "process") {
          responseContent = "**Buying Real Estate in Mexico - Complete Process:**\n\n";
          BUYING_PROCESS.forEach(step => {
            responseContent += `**${step.step}. ${step.title}** (${step.duration})\n`;
            responseContent += `${step.description}\n`;
            if (step.cost) responseContent += `💰 Cost: ${step.cost}\n`;
            responseContent += `📌 Key Tips:\n${step.tips.map(tip => `• ${tip}`).join('\n')}\n\n`;
          });
          responseContent += `**Total Timeline:** Typically 60-90 days from offer to closing\n`;
          responseContent += `**Total Closing Costs:** 4-6% of purchase price\n\n`;
          responseContent += `📝 **Ready to start?** [New Client Form](https://www.bircabo.com/new-client)\n\n`;
          responseContent += `Would you like to search for properties now?`;
        } else if (parsedQuery.infoType === "buying_costs") {
          responseContent = "**Complete Cost Breakdown for Buying in Los Cabos:**\n\n";
          OWNERSHIP_COSTS.forEach(category => {
            responseContent += `**${category.category}:**\n`;
            category.items.forEach(item => {
              responseContent += `• **${item.name}:** ${item.amount}`;
              if (item.frequency) responseContent += ` (${item.frequency})`;
              if (item.notes) responseContent += ` - ${item.notes}`;
              responseContent += `\n`;
            });
            responseContent += `\n`;
          });
          responseContent += `**Example for $500,000 Property:**\n`;
          responseContent += `• One-time closing: ~$25,000 (5%)\n`;
          responseContent += `• Annual costs: ~$2,000-4,000 (property tax + fideicomiso)\n`;
          responseContent += `• Monthly HOA: $200-600 (varies by community)\n`;
          responseContent += `• Monthly utilities: ~$150-300\n\n`;
          responseContent += `*These are estimates - actual costs vary by property and location.*`;
        } else if (parsedQuery.infoType === "legal") {
          const legalFAQs = COMMON_FAQS.filter(faq => faq.category === 'legal');
          responseContent = "**Legal Information for Buying in Mexico:**\n\n";
          legalFAQs.forEach(faq => {
            responseContent += `**Q: ${faq.question}**\n${faq.answer}\n\n`;
          });
          responseContent += `**Important Legal Documents:**\n`;
          responseContent += `• Fideicomiso (bank trust) - YOU own 100%, bank holds title\n`;
          responseContent += `• Title Insurance - Recommended for protection\n`;
          responseContent += `• Notario Public - Government attorney handles closing\n`;
          responseContent += `• RFC (tax ID) - Required for property purchase\n\n`;
          responseContent += `**Always consult with a bilingual attorney ($1500-3000)** for legal guidance.\n\n`;
          responseContent += `Have specific legal questions? [Contact our team](/contact) for attorney referrals.`;
        } else if (parsedQuery.infoType === "lifestyle") {
          const lifestyleFAQs = COMMON_FAQS.filter(faq => faq.category === 'lifestyle');
          responseContent = "**Living in Los Cabos:**\n\n";
          lifestyleFAQs.forEach(faq => {
            responseContent += `**${faq.question}**\n${faq.answer}\n\n`;
          });
          responseContent += `**Climate & Weather:**\n`;
          responseContent += `• 350+ days of sunshine annually\n`;
          responseContent += `• Temperatures: 70-90°F year-round\n`;
          responseContent += `• Hurricane season: Jun-Nov (direct hits rare)\n`;
          responseContent += `• Dry desert climate, low humidity\n\n`;
          responseContent += `**Culture & Community:**\n`;
          responseContent += `• Large expat community (US, Canada, Europe)\n`;
          responseContent += `• English widely spoken in tourist areas\n`;
          responseContent += `• Mexican culture and traditions\n`;
          responseContent += `• Friendly, welcoming locals\n\n`;
          responseContent += `Interested in a specific area's lifestyle? Ask me about it!`;
        } else {
          responseContent = parsedQuery.interpretation + "\n\nHow else can I assist you today?";
        }

        const infoMessage: Message = {
          role: "assistant",
          content: responseContent,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, infoMessage]);
        setIsLoading(false);
        return;
      }

      if (parsedQuery.intent === "forms") {
        // User wants to get started with forms
        const formsMessage: Message = {
          role: "assistant",
          content: "Great! I'm excited to help you get started with your Los Cabos real estate journey!\n\n📝 **For Buyers:**\nReady to explore properties? Fill out our New Client Form and one of our expert agents will contact you:\n👉 [New Client Registration](https://www.bircabo.com/new-client)\n\n🏠 **For Sellers:**\nInterested in selling your property? Get a professional evaluation:\n👉 [Seller Property Evaluation](https://www.bircabo.com/seller-evaluation)\n\n📅 **Want to Talk First?**\nSchedule a consultation with our team:\n👉 [Contact Us](/contact)\n\nOr feel free to keep chatting with me to search for properties!",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, formsMessage]);
        setIsLoading(false);
        return;
      }

      if (parsedQuery.intent === "contact") {
        // User wants contact information
        const contactMessage: Message = {
          role: "assistant",
          content: "**Get in Touch with Baja International Realty:**\n\n📞 **Call/WhatsApp:** +52 612 169 8328\n📧 **Email:** cabosbir@gmail.com\n🌐 **Website:** [bircabo.com](https://bircabo.com)\n\n📅 **Schedule a Meeting:**\n👉 [Contact Form](/contact)\n\n💬 **Or continue chatting here!**\nI can help you search for properties right now. What are you looking for?",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, contactMessage]);
        setIsLoading(false);
        return;
      }

      if (parsedQuery.intent === "question") {
        // For market questions, provide a helpful response
        const questionResponse: Message = {
          role: "assistant",
          content: "That's a great question! Let me search for relevant properties that can give you a better idea. Please provide more specific search criteria like bedrooms, price range, or location.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, questionResponse]);
        setIsLoading(false);
        return;
      }

      // For search intent, fetch properties
      if (parsedQuery.intent === "search") {
        // Build FlexMLS API parameters from parsed query
        const apiParams: any = {
          limit: parsedQuery.limit || 20,
        };

        // Location filters
        if (parsedQuery.city && parsedQuery.city.length > 0) {
          apiParams.city = parsedQuery.city;
        }
        if (parsedQuery.areas && parsedQuery.areas.length > 0) {
          apiParams.areas = parsedQuery.areas;
        }
        if (parsedQuery.communities && parsedQuery.communities.length > 0) {
          apiParams.communities = parsedQuery.communities;
        }
        if (parsedQuery.subdivisions && parsedQuery.subdivisions.length > 0) {
          apiParams.subdivisions = parsedQuery.subdivisions;
        }

        // Property details
        if (parsedQuery.minPrice) apiParams.minPrice = parsedQuery.minPrice;
        if (parsedQuery.maxPrice) apiParams.maxPrice = parsedQuery.maxPrice;
        if (parsedQuery.bedrooms) apiParams.bedrooms = parsedQuery.bedrooms;
        if (parsedQuery.bathrooms) apiParams.bathrooms = parsedQuery.bathrooms;
        if (parsedQuery.propertyTypes && parsedQuery.propertyTypes.length > 0) {
          apiParams.propertyTypes = parsedQuery.propertyTypes;
        }
        if (parsedQuery.status) apiParams.status = parsedQuery.status;

        console.log("🔍 Searching with params:", apiParams);

        // Fetch properties from FlexMLS
        let properties = await fetchListings(apiParams);

        // Client-side filtering for special features
        if (parsedQuery.oceanView) {
          properties = properties.filter((p) => {
            const view = p.View || "";
            return view.toLowerCase().includes("ocean") ||
                   view.toLowerCase().includes("water") ||
                   view.toLowerCase().includes("sea");
          });
        }

        if (parsedQuery.beachfront) {
          properties = properties.filter((p) => {
            const waterfront = p.WaterfrontFeatures || "";
            return waterfront.toLowerCase().includes("beach") ||
                   waterfront.toLowerCase().includes("waterfront");
          });
        }

        if (parsedQuery.pool) {
          properties = properties.filter((p) => {
            const pool = p.PoolFeatures || "";
            return pool && pool.toLowerCase().includes("pool");
          });
        }

        // Sort results
        if (parsedQuery.sortBy) {
          switch (parsedQuery.sortBy) {
            case 'price_low':
              properties.sort((a, b) => (a.ListPrice || 0) - (b.ListPrice || 0));
              break;
            case 'price_high':
              properties.sort((a, b) => (b.ListPrice || 0) - (a.ListPrice || 0));
              break;
            case 'beds':
              properties.sort((a, b) => (b.BedroomsTotal || 0) - (a.BedroomsTotal || 0));
              break;
          }
        }

        console.log(`✅ Found ${properties.length} properties`);

        // Generate conversational response
        const conversationalResponse = await generateConversationalResponse(
          parsedQuery,
          properties.length,
          input
        );

        // Build response based on results
        let finalResponse = conversationalResponse;

        if (properties.length > 0) {
          // Add form recommendation
          finalResponse += "\n\n💡 **Interested in any of these properties?**\nFill out our [New Client Form](https://www.bircabo.com/new-client) and one of our expert agents will reach out to schedule viewings and answer your questions!";
        } else {
          // No results - provide helpful suggestions
          finalResponse += "\n\n**Try adjusting your search:**\n• Increase your budget range\n• Expand to nearby areas\n• Reduce bedroom/bathroom requirements\n• Remove specific amenities\n\n**Or I can help you:**\n• Search in a different area\n• [Contact an agent](/contact) for personalized assistance\n• [Browse all properties](/properties)";
        }

        const assistantMessage: Message = {
          role: "assistant",
          content: finalResponse,
          timestamp: new Date(),
          properties: properties.slice(0, parsedQuery.limit || 20),
          parsedQuery,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("❌ Chat error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "I'm sorry, I encountered an error processing your request. Please try rephrasing your search or contact us directly for assistance.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickSearch = (query: string) => {
    setInput(query);
    // Trigger search immediately
    setTimeout(() => {
      const sendButton = document.querySelector('[data-send-button]') as HTMLButtonElement;
      sendButton?.click();
    }, 100);
  };

  const containerClass = fullPage
    ? "flex flex-col h-screen bg-background"
    : "flex flex-col h-full";

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-[#112f76] text-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bot className="h-8 w-8" />
            <Sparkles className="h-4 w-4 absolute -top-1 -right-1 text-yellow-300" />
          </div>
          <div>
            <h3 className="text-lg font-bold">BIR Search Assistant</h3>
            <p className="text-xs text-white/80">Powered by BIR</p>
          </div>
        </div>
        {!fullPage && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Quick Search Suggestions (only show if no messages yet) */}
      {messages.length === 1 && (
        <div className="p-4 bg-secondary/30 border-b border-border">
          <p className="text-xs text-muted-foreground mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => handleQuickSearch("Show me 2 listings of 2-bedroom condos under $500k")}
            >
              <Home className="h-3 w-3 mr-1" />
              Search Properties
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => handleQuickSearch("Tell me about areas in Los Cabos")}
            >
              <MapPin className="h-3 w-3 mr-1" />
              Learn About Areas
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => handleQuickSearch("I'm interested in buying, how do I get started?")}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Get Started
            </Button>
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 pb-4">
          {messages.map((message, index) => (
            <div key={index}>
              {/* Message bubble */}
              <div
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                } mb-2`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-[#112f76] text-white"
                      : "bg-secondary text-foreground border border-border"
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap leading-relaxed prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown
                      components={{
                        a: ({ node, ...props }) => (
                          <a
                            {...props}
                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        ),
                        p: ({ node, ...props }) => <p {...props} className="mb-2 last:mb-0" />,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  <p className="text-xs opacity-60 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {/* Property Results */}
              {message.properties && message.properties.length > 0 && (
                <div className="mt-4 space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Home className="h-4 w-4" />
                    <span>{message.properties.length} properties found</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {message.properties.slice(0, 6).map((property) => {
                      const cardData = convertMLSToPropertyCard(property);
                      return (
                        <PropertyCard
                          key={property.ListingKey}
                          id={cardData.id}
                          mlsNumber={cardData.mlsNumber}
                          image={cardData.image}
                          price={cardData.price}
                          title={cardData.title}
                          location={cardData.location}
                          beds={cardData.beds}
                          baths={cardData.baths}
                          sqft={cardData.sqft}
                          status={cardData.status}
                          propertyType={cardData.propertyType}
                        />
                      );
                    })}
                  </div>

                  {/* AI Disclaimer */}
                  <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 dark:text-amber-200">
                      <strong>Please verify:</strong> Property details are AI-summarized from MLS data. Always verify information with one of our agents before making decisions.
                    </p>
                  </div>

                  {message.properties.length > 6 && (
                    <div className="text-center">
                      <Button variant="outline" size="sm" asChild>
                        <a href="/properties">
                          View all {message.properties.length} properties
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* No results message */}
              {message.properties && message.properties.length === 0 && (
                <div className="mt-2 space-y-3">
                  <div className="p-4 bg-secondary/50 border border-border rounded-lg text-sm text-muted-foreground">
                    <p className="mb-2">No properties found matching those exact criteria.</p>
                    <p className="text-xs">Try adjusting your search:</p>
                    <ul className="text-xs list-disc list-inside mt-1 space-y-1">
                      <li>Increase your budget range</li>
                      <li>Consider a different area</li>
                      <li>Reduce the number of bedrooms/bathrooms</li>
                      <li>Remove some specific requirements</li>
                    </ul>
                  </div>

                  {/* AI Disclaimer */}
                  <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 dark:text-amber-200">
                      Our search uses AI to interpret your request. For personalized assistance finding the perfect property, [contact one of our expert agents](/contact).
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-secondary border border-border rounded-2xl px-4 py-3 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-[#112f76]" />
                <span className="text-sm text-muted-foreground">Searching properties...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border bg-background">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me to find properties... (e.g., '3-bed condos under $500k')"
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            variant="default"
            size="icon"
            className="bg-[#112f76] hover:bg-[#0d2459]"
            data-send-button
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          BIR Search Assistant • Try using natural language like "beachfront homes in Cabo"
        </p>
      </div>
    </div>
  );
};

export default PropertyChatBot;
