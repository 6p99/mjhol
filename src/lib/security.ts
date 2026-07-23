// FIX: Replaced Node.js crypto with Web Crypto API
// Cloudflare Workers don't support require('crypto')
// Using Web Crypto API which is available in Workers runtime

/**
 * Hash an IP address for privacy-safe storage (async — Web Crypto is async)
 */
export async function hashIP(ip: string): Promise<string> {
  const salt = process.env.IP_SALT || 'default-salt';
  const data = new TextEncoder().encode(ip + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash an IP address (sync fallback for local dev with Node.js)
 */
export function hashIPSync(ip: string): string {
  const salt = process.env.IP_SALT || 'default-salt';
  const data = ip + salt;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  // Combine with a second hash for more uniqueness
  let hash2 = 5381;
  for (let i = 0; i < data.length; i++) {
    hash2 = ((hash2 << 5) + hash2 + data.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash).toString(16).padStart(8, '0') + Math.abs(hash2).toString(16).padStart(8, '0');
}

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

/**
 * Validate and sanitize comment content
 */
export function sanitizeComment(content: string): { safe: string; valid: boolean; error?: string } {
  const trimmed = content.trim();

  if (!trimmed) {
    return { safe: '', valid: false, error: 'Comment cannot be empty' };
  }

  if (trimmed.length > 500) {
    return { safe: '', valid: false, error: 'Comment must be less than 500 characters' };
  }

  // Check for potential injection patterns
  const dangerousPatterns = [
    /<script[\s\S]*?<\/script>/gi,
    /<iframe[\s\S]*?<\/iframe>/gi,
    /<object[\s\S]*?<\/object>/gi,
    /<embed[\s\S]*?<\/embed>/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi,
    /javascript\s*:/gi,
    /data\s*:\s*text\/html/gi,
    /expression\s*\(/gi,
    /url\s*\(\s*["']?\s*javascript/gi,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(trimmed)) {
      return { safe: '', valid: false, error: 'Comment contains disallowed content' };
    }
  }

  // Remove any remaining HTML tags
  const sanitized = trimmed.replace(/<[^>]*>/g, '').trim();

  if (!sanitized) {
    return { safe: '', valid: false, error: 'Comment cannot be empty' };
  }

  return { safe: sanitized, valid: true };
}

// FIX: Replaced randomBytes with Web Crypto
/**
 * Generate a CSRF token using Web Crypto API
 */
export async function generateCSRFToken(): Promise<string> {
  const buffer = new Uint8Array(32);
  crypto.getRandomValues(buffer);
  return Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a CSRF token (sync fallback)
 */
export function generateCSRFTokenSync(): string {
  const buffer = new Uint8Array(32);
  crypto.getRandomValues(buffer);
  return Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate CSRF token (simple check - in production use signed tokens)
 */
export function validateCSRFToken(token: string | null, expected: string): boolean {
  if (!token || !expected) return false;
  return token === expected;
}

/**
 * Rate limiter using in-memory store
 * FIX: Removed setInterval — Cloudflare Workers are stateless
 * Rate limit data resets on each cold start (acceptable for edge)
 */
class RateLimiter {
  private store: Map<string, { count: number; resetAt: number }>;
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 10) {
    this.store = new Map();
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  check(key: string): { allowed: boolean; remaining: number; resetIn: number } {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + this.windowMs });
      return { allowed: true, remaining: this.maxRequests - 1, resetIn: this.windowMs };
    }

    if (entry.count >= this.maxRequests) {
      return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
    }

    entry.count++;
    return { allowed: true, remaining: this.maxRequests - entry.count, resetIn: entry.resetAt - now };
  }

  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.resetAt) {
        this.store.delete(key);
      }
    }
  }
}

// API rate limiter: 20 requests per minute
export const apiRateLimiter = new RateLimiter(60000, 20);

// Comment rate limiter: stricter - 5 per minute
export const commentApiLimiter = new RateLimiter(60000, 5);

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIP = request.headers.get('x-real-ip');
  if (realIP) return realIP;
  return 'unknown';
}

/**
 * Generate security headers for API responses
 */
export function getSecurityHeaders(): HeadersInit {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'; frame-ancestors 'none';",
  };
}

/**
 * Validate session/token format
 */
export function isValidToken(token: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(token) && token.length > 10 && token.length < 512;
}
