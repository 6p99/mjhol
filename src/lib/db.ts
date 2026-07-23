import { PrismaClient } from '@prisma/client';
// FIX: Import Prisma D1 adapter for Cloudflare Workers compatibility
import { PrismaD1 } from '@prisma/adapter-d1';

/**
 * Database client factory
 *
 * - On Cloudflare Workers: Uses D1 binding via @prisma/adapter-d1
 * - On local dev: Uses file-based SQLite (direct PrismaClient)
 *
 * FIX: Removed globalThis singleton — Cloudflare Workers are isolates,
 * each request gets its own execution context. Singleton pattern is
 * unnecessary and can cause issues.
 */

function createLocalClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  });
}

function createD1Client(d1: D1Database): PrismaClient {
  const adapter = new PrismaD1(d1);
  return new PrismaClient({ adapter });
}

/**
 * Get a Prisma client for the current environment (async for CF compatibility).
 *
 * Usage in API routes:
 *   import { getDb } from '@/lib/db';
 *   const db = await getDb(request);
 *
 * On Cloudflare: request.env.DB is the D1 binding from wrangler.toml
 * On local dev: falls back to file-based SQLite
 */
export async function getDb(request?: Request): Promise<PrismaClient> {
  // Check if we're in Cloudflare Workers environment via request binding
  if (request && typeof (request as any).env !== 'undefined') {
    const d1 = (request as any).env?.DB;
    if (d1) {
      return createD1Client(d1);
    }
  }

  // Check via @cloudflare/next-on-pages getRequestContext
  try {
    // FIX: Use dynamic import — require() not available in edge runtime
    const mod = await import('@cloudflare/next-on-pages');
    const { getRequestContext } = mod;
    const ctx = getRequestContext();
    if (ctx?.env?.DB) {
      return createD1Client(ctx.env.DB);
    }
  } catch {
    // Not in Cloudflare environment, fall through to local
  }

  // FIX: Local development fallback — singleton for perf
  if (typeof globalThis !== 'undefined') {
    const g = globalThis as unknown as { prisma: PrismaClient | undefined };
    if (!g.prisma) {
      g.prisma = createLocalClient();
    }
    return g.prisma;
  }

  return createLocalClient();
}

/**
 * Legacy export for backward compatibility.
 * Only used if a route hasn't been updated to use getDb(request).
 * This uses the local SQLite file database — works in local dev only.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
