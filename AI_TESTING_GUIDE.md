# 🧪 AI CHATBOT TESTING GUIDE

## Quick Test Queries to Validate Intelligence Upgrade

Run these queries in the chatbot to see the new intelligence in action:

---

## ✅ TEST 1: Area Comparison
**Query**: `"Compare Pedregal and Marina"`

**Expected**: Detailed side-by-side comparison showing:
- Price differences
- Lifestyle differences
- Walkability comparison
- Beach access
- Rental demand
- "Best for" recommendations
- Bottom line recommendation

---

## ✅ TEST 2: Market Data
**Query**: `"What do properties cost in Cabo Corridor?"`

**Expected**: Market data response with:
- Price per square foot range ($600-2000)
- Appreciation trend (fast)
- Rental demand (very-high)
- HOA fees range
- Example calculations for 2,000 sqft property
- Rental yield information

---

## ✅ TEST 3: Buyer Qualification - Retirement
**Query**: `"I'm looking to retire in Los Cabos"`

**Expected**: Retirement-specific response with:
- Best areas for retirees (San Jose, Corridor, Pedregal)
- Healthcare information
- Property tax benefits (0.1-0.3%)
- Walkability considerations
- Expat community info
- Climate details
- Follow-up question about budget

---

## ✅ TEST 4: Buyer Qualification - Investment
**Query**: `"I want an investment property"`

**Expected**: Investment-focused response with:
- Best ROI areas ranked
- Rental yield metrics (5-8%)
- Appreciation data (3-5%)
- Peak season information
- Property management costs
- Key investment costs
- Follow-up about budget

---

## ✅ TEST 5: Legal Questions
**Query**: `"Can foreigners buy property in Mexico?"`

**Expected**: Legal FAQ response with:
- YES confirmation
- Fideicomiso explanation
- Safety assurances (constitutional protection)
- 100% ownership rights clarification
- Cost information ($1000 + $500/year)
- Bank failure protection
- Inheritance rights

---

## ✅ TEST 6: Buying Process
**Query**: `"How does the buying process work?"`

**Expected**: Complete process breakdown:
- 5 steps with timelines
- Costs for each step
- Tips for each stage
- Total timeline (60-90 days)
- Total closing costs (4-6%)
- Link to new client form
- Follow-up offer to search

---

## ✅ TEST 7: Buying Costs
**Query**: `"What are all the costs to buy a property?"`

**Expected**: Complete cost breakdown with:
- One-time closing costs (acquisition tax, notary, fideicomiso, attorney)
- Annual costs (property tax, fideicomiso renewal, HOA)
- Monthly utilities (electric, water, internet, gas)
- Example for $500k property
- Disclaimer about estimates

---

## ✅ TEST 8: Lifestyle Questions
**Query**: `"Is Los Cabos safe for Americans?"`

**Expected**: Lifestyle FAQ response with:
- Safety confirmation
- Tourism-dependent explanation
- Normal precautions advice
- Additional lifestyle info (healthcare, car needs, hurricanes)
- Climate and culture details

---

## ✅ TEST 9: Area-Specific Search
**Query**: `"Show me condos under $500k in Marina"`

**Expected**: Regular search response BUT:
- Should understand Marina as high rental demand area
- Should filter for Cabo San Lucas city + Marina area
- May detect vacation_home or investment intent
- Returns MLS results + AI disclaimer

---

## ✅ TEST 10: Vacation Home Intent
**Query**: `"Looking for a vacation home in Cabo"`

**Expected**: Vacation home response with:
- Top vacation home areas (Corridor, Pedregal, Marina)
- Vacation home perks (use + rent)
- Rental income potential (5-8%)
- Property management costs
- Typical costs breakdown
- Follow-up questions (visit frequency, budget)

---

## ✅ TEST 11: Specific Community
**Query**: `"Tell me about Querencia"`

**Expected**: General info response with knowledge about:
- Ultra-luxury positioning
- Tom Fazio golf course
- Price range ($800-2500/sqft)
- Best for ultra-high-net-worth golfers
- Privacy features
- Low rental demand (not for investment)
- Isolation considerations

---

## ✅ TEST 12: Multi-Area Comparison
**Query**: `"What's the difference between San Jose and Cabo San Lucas?"`

**Expected**: Comparison response showing:
- San Jose: quieter, cultural, family-friendly, $300-700/sqft
- Cabo San Lucas: vibrant, marina, nightlife, higher prices
- Lifestyle differences
- Best for recommendations

---

## ⚠️ REGRESSION TESTS (Ensure these still work)

### Old Functionality Should Still Work:

1. **Basic Search**: `"3 bedroom condos under $500k"`
   - Should work as before

2. **Greeting**: `"Hello"`
   - Should greet and offer help

3. **Forms**: `"I'm interested in properties"`
   - Should route to new client form

4. **Contact**: `"I want to contact an agent"`
   - Should provide contact information

5. **Beachfront Living**: `"What areas are best for beachfront living?"`
   - Should provide areas info (NOT rental ROI)

6. **Rental ROI**: `"Best areas for rental income?"`
   - Should provide rental investment info

7. **Vague Query**: `"Show me properties"`
   - Should ask for clarification (budget, location, bedrooms)

---

## 📊 SUCCESS METRICS

### Quality Indicators:

✅ **Comprehensive Answers**: Responses should be detailed, not vague
✅ **Market Data**: Actual numbers (prices, percentages, timelines)
✅ **Recommendations**: "Best for" lists should be specific
✅ **Follow-up Questions**: AI should ask qualifying questions
✅ **Links Clickable**: All markdown links should be blue and clickable
✅ **No Errors**: No JSON parsing errors or crashes
✅ **Appropriate Routing**: Legal questions → legal info, costs → cost breakdown

### Intelligence Indicators:

- **Understands Context**: "retirement" triggers retirement recommendations
- **Compares Intelligently**: Shows trade-offs, not just lists
- **Provides Examples**: "$500k property costs ~$25k to close"
- **Qualifies Buyers**: Asks about budget, timeline, purpose
- **Defers Appropriately**: Still recommends agents for final decisions

---

## 🐛 KNOWN LIMITATIONS (Expected Behavior)

1. **Can't access live MLS pricing**: Uses market averages, not real-time data
2. **Can't make final recommendations**: Defers to agents (by design)
3. **Can't compare more than 2 areas**: Comparison limited to 2 at a time
4. **Can't search by school names**: Not in knowledge base
5. **Can't provide specific legal advice**: Recommends attorney (appropriate)

---

## 🔍 DEBUGGING TIPS

If something doesn't work:

1. **Check Console Logs**:
   - `🔍 Parsing property query:` shows what AI received
   - `🤖 Groq raw response:` shows AI's JSON output
   - `✅ Parsed query:` shows interpreted intent

2. **Check Intent Classification**:
   - Is the intent what you expected?
   - Does buyerIntent get detected correctly?
   - Are comparisonAreas extracted for "vs" queries?

3. **Check Knowledge Base**:
   - Open browser DevTools
   - Check if `getAreaKnowledge()` returns data
   - Verify area name matching (case-insensitive)

4. **Check Response Generation**:
   - Is the correct handler being called?
   - Are knowledge base functions imported correctly?
   - Check for TypeScript errors in console

---

## 📈 BEFORE/AFTER COMPARISON

### Query: "What's the difference between Pedregal and Marina?"

**BEFORE (Elementary)**:
```
Los Cabos offers diverse neighborhoods, each with its own character:
- Pedregal - Hillside luxury with ocean views
- Marina District - Waterfront living

Want to search for properties in a specific area?
```

**AFTER (Junior Agent)**:
```
**Pedregal vs Marina:**

💰 **Price:** Pedregal ($500-1200/sqft) vs Marina ($450-900/sqft)
🏠 **Vibe:** Pedregal (luxury, views, security, exclusive) vs Marina (active, social, waterfront, walkable)
🚶 **Walkability:** Pedregal (low) vs Marina (high)
🏖️ **Beach:** Pedregal (club, swimmable) vs Marina (nearby, non-swimmable)
📈 **Rental Potential:** Pedregal (high) vs Marina (very-high)

**Pedregal - Best For:**
• Luxury buyers
• View seekers
• Security-conscious
• Vacation homes
• High-end rentals

**Marina - Best For:**
• Active lifestyle
• Boaters/fishermen
• Rental investors
• Singles/couples
• No car needed

**Bottom Line:**
• Choose Pedregal if you want: luxury, views, security
• Choose Marina if you want: active, social, waterfront

Would you like to search for properties in either area?
```

---

## 🎯 KEY TAKEAWAYS

The AI is now **significantly smarter** but still maintains:
- ✅ Appropriate disclaimers
- ✅ Agent referrals
- ✅ Form recommendations
- ✅ Professional tone
- ✅ User-friendly language

Test thoroughly and enjoy your **junior real estate agent AI!** 🏠🤖

---

**Testing Checklist:**
- [ ] Test all 12 main queries above
- [ ] Verify 7 regression tests
- [ ] Check console for errors
- [ ] Verify links are clickable
- [ ] Confirm responses are detailed and helpful
- [ ] Ensure AI still defers to agents appropriately

---

Last Updated: December 18, 2025
