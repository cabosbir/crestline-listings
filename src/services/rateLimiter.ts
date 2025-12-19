// ====================================================================
// RATE LIMITER - Client-side rate limiting for chatbot usage
// Prevents API abuse while allowing legitimate user interactions
// ====================================================================

interface RateLimitConfig {
  maxMessagesPerDay: number;
  maxMessagesPerHour: number;
  storageKey: string;
}

interface RateLimitData {
  dailyCount: number;
  hourlyCount: number;
  dailyResetTime: number; // Timestamp for next daily reset (midnight)
  hourlyResetTime: number; // Timestamp for next hourly reset
  lastMessageTime: number; // Timestamp of last message
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxMessagesPerDay: 20, // Fair limit for serious property searches
  maxMessagesPerHour: 5, // Prevents rapid spam, allows natural conversation
  storageKey: 'bir_chatbot_rate_limit',
};

/**
 * Get the timestamp for next midnight (daily reset)
 */
function getNextMidnight(): number {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime();
}

/**
 * Get the timestamp for next hour reset
 */
function getNextHourReset(): number {
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
  return nextHour.getTime();
}

/**
 * Get current rate limit data from localStorage
 */
function getRateLimitData(config: RateLimitConfig = DEFAULT_CONFIG): RateLimitData {
  try {
    const stored = localStorage.getItem(config.storageKey);
    if (!stored) {
      // First time user - initialize
      return {
        dailyCount: 0,
        hourlyCount: 0,
        dailyResetTime: getNextMidnight(),
        hourlyResetTime: getNextHourReset(),
        lastMessageTime: 0,
      };
    }

    const data: RateLimitData = JSON.parse(stored);
    const now = Date.now();

    // Check if we need to reset daily counter
    if (now >= data.dailyResetTime) {
      data.dailyCount = 0;
      data.dailyResetTime = getNextMidnight();
    }

    // Check if we need to reset hourly counter
    if (now >= data.hourlyResetTime) {
      data.hourlyCount = 0;
      data.hourlyResetTime = getNextHourReset();
    }

    return data;
  } catch (error) {
    console.error('Error reading rate limit data:', error);
    // Return fresh data on error
    return {
      dailyCount: 0,
      hourlyCount: 0,
      dailyResetTime: getNextMidnight(),
      hourlyResetTime: getNextHourReset(),
      lastMessageTime: 0,
    };
  }
}

/**
 * Save rate limit data to localStorage
 */
function saveRateLimitData(data: RateLimitData, config: RateLimitConfig = DEFAULT_CONFIG): void {
  try {
    localStorage.setItem(config.storageKey, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving rate limit data:', error);
  }
}

/**
 * Check if user can send a message (within rate limits)
 */
export function canSendMessage(config: RateLimitConfig = DEFAULT_CONFIG): {
  allowed: boolean;
  reason?: string;
  remainingDaily?: number;
  remainingHourly?: number;
  resetTime?: number;
} {
  const data = getRateLimitData(config);

  // Check daily limit
  if (data.dailyCount >= config.maxMessagesPerDay) {
    return {
      allowed: false,
      reason: 'daily',
      remainingDaily: 0,
      resetTime: data.dailyResetTime,
    };
  }

  // Check hourly limit
  if (data.hourlyCount >= config.maxMessagesPerHour) {
    return {
      allowed: false,
      reason: 'hourly',
      remainingHourly: 0,
      resetTime: data.hourlyResetTime,
    };
  }

  return {
    allowed: true,
    remainingDaily: config.maxMessagesPerDay - data.dailyCount,
    remainingHourly: config.maxMessagesPerHour - data.hourlyCount,
  };
}

/**
 * Record that a message was sent (increment counters)
 */
export function recordMessage(config: RateLimitConfig = DEFAULT_CONFIG): void {
  const data = getRateLimitData(config);
  const now = Date.now();

  data.dailyCount += 1;
  data.hourlyCount += 1;
  data.lastMessageTime = now;

  saveRateLimitData(data, config);
}

/**
 * Get user-friendly time remaining message
 */
export function getTimeRemainingMessage(resetTime: number): string {
  const now = Date.now();
  const msRemaining = resetTime - now;

  if (msRemaining <= 0) return 'now';

  const minutes = Math.floor(msRemaining / 60000);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours} hour${hours > 1 ? 's' : ''}${remainingMinutes > 0 ? ` ${remainingMinutes} min` : ''}`;
  }

  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
}

/**
 * Get current usage stats for display
 */
export function getUsageStats(config: RateLimitConfig = DEFAULT_CONFIG): {
  dailyUsed: number;
  dailyLimit: number;
  hourlyUsed: number;
  hourlyLimit: number;
  dailyResetTime: number;
  hourlyResetTime: number;
} {
  const data = getRateLimitData(config);

  return {
    dailyUsed: data.dailyCount,
    dailyLimit: config.maxMessagesPerDay,
    hourlyUsed: data.hourlyCount,
    hourlyLimit: config.maxMessagesPerHour,
    dailyResetTime: data.dailyResetTime,
    hourlyResetTime: data.hourlyResetTime,
  };
}

/**
 * Reset rate limits (admin/testing only)
 */
export function resetRateLimits(config: RateLimitConfig = DEFAULT_CONFIG): void {
  try {
    localStorage.removeItem(config.storageKey);
    console.log('✅ Rate limits reset');
  } catch (error) {
    console.error('Error resetting rate limits:', error);
  }
}

/**
 * Check if user is approaching limits (for warnings)
 */
export function isApproachingLimit(config: RateLimitConfig = DEFAULT_CONFIG): {
  approachingDaily: boolean;
  approachingHourly: boolean;
} {
  const data = getRateLimitData(config);

  return {
    approachingDaily: data.dailyCount >= config.maxMessagesPerDay * 0.8, // 80% threshold
    approachingHourly: data.hourlyCount >= config.maxMessagesPerHour * 0.8,
  };
}
