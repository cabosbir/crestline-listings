# Rate Limiting Guide

## Overview

The chatbot now has built-in rate limiting to prevent API abuse and manage costs while keeping the service free for all users.

## Limits

- **20 messages per day** - Enough for serious property searches
- **5 messages per hour** - Prevents rapid spam while allowing natural conversation

## How It Works

### For Users:
1. Each message counts toward both daily and hourly limits
2. Limits are tracked in browser localStorage (per device/browser)
3. Resets automatically at midnight (daily) and every hour (hourly)
4. Warning appears when 80% of daily limit is reached (16 messages)
5. Clear, friendly messages explain when limits are hit

### For Developers:
Rate limiting is implemented in `/src/services/rateLimiter.ts` and integrated into `PropertyChatBot.tsx`.

## Testing Rate Limits

### In Browser Console:

```javascript
// Import rate limiter functions (in browser dev console while on the site)
import { canSendMessage, recordMessage, getUsageStats, resetRateLimits } from './services/rateLimiter';

// Check current usage
getUsageStats()
// Returns: { dailyUsed: 3, dailyLimit: 20, hourlyUsed: 2, hourlyLimit: 5, ... }

// Simulate hitting daily limit
for (let i = 0; i < 20; i++) {
  recordMessage();
}

// Check if next message is allowed
canSendMessage()
// Returns: { allowed: false, reason: 'daily', ... }

// Reset limits (testing only)
resetRateLimits()
```

### Manual Testing Steps:

1. **Test Normal Usage:**
   - Send 5 messages
   - Verify usage indicator doesn't show
   - Send 16 messages total
   - Verify warning appears: "4 messages left today"

2. **Test Hourly Limit:**
   - Send 5 messages quickly
   - Try to send 6th message
   - Should see: "Hourly Message Limit Reached"

3. **Test Daily Limit:**
   - Open browser console
   - Run: `localStorage.setItem('bir_chatbot_rate_limit', JSON.stringify({dailyCount: 20, hourlyCount: 0, dailyResetTime: Date.now() + 86400000, hourlyResetTime: Date.now() + 3600000, lastMessageTime: Date.now()}))`
   - Try to send message
   - Should see: "Daily Message Limit Reached"

4. **Test Reset:**
   - In console, run: `localStorage.removeItem('bir_chatbot_rate_limit')`
   - Refresh page
   - Should be able to send messages again

## Adjusting Limits

To change the limits, edit `/src/services/rateLimiter.ts`:

```typescript
const DEFAULT_CONFIG: RateLimitConfig = {
  maxMessagesPerDay: 20,  // Change this
  maxMessagesPerHour: 5,  // Change this
  storageKey: 'bir_chatbot_rate_limit',
};
```

## User Experience

### Normal Usage (Under Limit):
- User sees: "BIR Search Assistant • Natural language search"
- No warnings or restrictions

### Approaching Limit (16+ messages):
- User sees: "⚠️ 4 messages left today"
- Can still send messages

### Hourly Limit Hit:
```
⏸️ Hourly Message Limit Reached

You've sent 5 messages in the last hour. Please wait 45 minutes before sending more.

This helps prevent spam and ensures quality responses for all users.

Need immediate help?
📞 Call: +52 624 143 5555
📧 Email: info@bircabo.com
```

### Daily Limit Hit:
```
⏸️ Daily Message Limit Reached

You've reached the maximum of 20 messages per day. This helps us manage our AI costs while keeping the chatbot free for everyone.

Your limit resets in: 6 hours 23 minutes

In the meantime:
📞 Call us: +52 624 143 5555
📧 Email: info@bircabo.com
👉 Contact Form

Our team is available Monday-Sunday: 8AM-9PM PT and happy to help!
```

## Benefits

1. **Cost Control** - Prevents expensive API abuse
2. **Fair Usage** - Ensures all users can access the chatbot
3. **Quality Service** - Prevents spam and maintains response quality
4. **User-Friendly** - Clear messages with alternative contact options
5. **Transparent** - Users see their remaining messages when approaching limit

## Privacy

- Rate limits are stored locally in the user's browser (localStorage)
- No server-side tracking or user identification
- Clearing browser data resets limits
- Users can bypass by using different browsers/devices (acceptable for anti-abuse purposes)

## Future Enhancements

Potential improvements:
- Server-side rate limiting by IP for better enforcement
- Dynamic limits based on time of day or user behavior
- Premium tier with higher limits
- Analytics to track common abuse patterns
