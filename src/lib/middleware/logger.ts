// src/lib/middleware/logger.ts

type LogLevel = "debug" | "info" | "warn" | "error";
type LogContext = Record<string, unknown>;

const LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) ?? "info";

function shouldLog(level: LogLevel): boolean {
  return LEVELS[level] >= LEVELS[currentLevel];
}

function formatLog(
  level: LogLevel,
  message: string,
  context?: LogContext
): string {
  const ts = new Date().toISOString();
  const base = { ts, level, msg: message };
  return JSON.stringify(context ? { ...base, ...context } : base);
}

export const logger = {
  debug: (msg: string, ctx?: LogContext) => {
    if (shouldLog("debug")) console.debug(formatLog("debug", msg, ctx));
  },
  info: (msg: string, ctx?: LogContext) => {
    if (shouldLog("info")) console.log(formatLog("info", msg, ctx));
  },
  warn: (msg: string, ctx?: LogContext) => {
    if (shouldLog("warn")) console.warn(formatLog("warn", msg, ctx));
  },
  error: (msg: string, ctx?: LogContext) => {
    if (shouldLog("error")) console.error(formatLog("error", msg, ctx));
  },
};

// src/lib/middleware/rate-limit.ts
// Simple in-memory rate limiter (use Redis in production)

interface RateLimitStore {
  [key: string]: { count: number; resetAt: number };
}

const store: RateLimitStore = {};

interface RateLimitOptions {
  windowMs?: number; // milliseconds
  max?: number; // max requests per window
  keyPrefix?: string;
}

export function rateLimit(options: RateLimitOptions = {}) {
  const {
    windowMs = 60 * 1000, // 1 minute
    max = 60,
    keyPrefix = "rl",
  } = options;

  return function check(identifier: string): {
    success: boolean;
    remaining: number;
    resetAt: number;
  } {
    const key = `${keyPrefix}:${identifier}`;
    const now = Date.now();
    const record = store[key];

    if (!record || now > record.resetAt) {
      store[key] = { count: 1, resetAt: now + windowMs };
      return { success: true, remaining: max - 1, resetAt: now + windowMs };
    }

    record.count++;
    const remaining = Math.max(0, max - record.count);
    const success = record.count <= max;

    return { success, remaining, resetAt: record.resetAt };
  };
}

// Prebuilt limiters
export const apiLimiter = rateLimit({ windowMs: 60_000, max: 60, keyPrefix: "api" });
export const authLimiter = rateLimit({ windowMs: 900_000, max: 10, keyPrefix: "auth" }); // 10/15min
export const checkoutLimiter = rateLimit({ windowMs: 300_000, max: 5, keyPrefix: "checkout" });
