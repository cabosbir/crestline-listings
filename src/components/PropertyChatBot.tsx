import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, X, Bot, Sparkles, Home, MapPin } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import PropertyCard from "@/components/PropertyCard";
import { fetchListings, convertMLSToPropertyCard, MLSProperty } from "@/services/flexMlsService";
import {
  parsePropertyQuery,
  generateConversationalResponse,
  generateClarifyingQuestion,
  ParsedPropertyQuery,
} from "@/services/groqPropertyQueryParser";

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
      content: "Hi! I'm your AI property search assistant. I can help you find your dream home in Los Cabos!\n\nTry asking me things like:\n• \"Show me 3-bedroom condos under $500k in Cabo San Lucas\"\n• \"Find beachfront properties with ocean views\"\n• \"What luxury homes are near the marina?\"\n\nWhat are you looking for today?",
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

      if (parsedQuery.intent === "question") {
        // For general questions, provide a helpful response
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

        const assistantMessage: Message = {
          role: "assistant",
          content: conversationalResponse,
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
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bot className="h-8 w-8" />
            <Sparkles className="h-4 w-4 absolute -top-1 -right-1 text-yellow-300" />
          </div>
          <div>
            <h3 className="text-lg font-bold">AI Property Search</h3>
            <p className="text-xs text-white/80">Powered by Groq Intelligence</p>
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
          <p className="text-xs text-muted-foreground mb-2">Quick searches:</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => handleQuickSearch("Show me 3-bedroom condos under $500k")}
            >
              <Home className="h-3 w-3 mr-1" />
              Condos under $500k
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => handleQuickSearch("Find beachfront properties with ocean views")}
            >
              <MapPin className="h-3 w-3 mr-1" />
              Beachfront homes
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => handleQuickSearch("Luxury homes in Pedregal")}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Luxury properties
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
                      ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                      : "bg-secondary text-foreground border border-border"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
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
                <div className="mt-2 p-4 bg-secondary/50 border border-border rounded-lg text-sm text-muted-foreground">
                  <p className="mb-2">No properties found matching those exact criteria.</p>
                  <p className="text-xs">Try adjusting your search:</p>
                  <ul className="text-xs list-disc list-inside mt-1 space-y-1">
                    <li>Increase your budget range</li>
                    <li>Consider a different area</li>
                    <li>Reduce the number of bedrooms/bathrooms</li>
                    <li>Remove some specific requirements</li>
                  </ul>
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-secondary border border-border rounded-2xl px-4 py-3 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
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
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
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
          AI-powered property search • Try natural language like "beachfront homes in Cabo"
        </p>
      </div>
    </div>
  );
};

export default PropertyChatBot;
