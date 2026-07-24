export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSecurityHeaders, getClientIP, apiRateLimiter } from '@/lib/security';

/**
 * GET /api/visitors
 * 
 * - Accepts optional `fingerprint` query param (SHA-256 hash generated client-side)
 * - If fingerprint provided:
 *   - Check if visitor already exists in DB
 *   - If NOT exists → register as new visitor, increment counter
 *   - If exists → just return current count (no increment)
 * - If no fingerprint → increment counter (legacy behavior)
 * 
 * This ensures each unique browser/ID registers only once.
 */
export async function GET(request: NextRequest) {
  try {
    const db = await getDb(request);
    const clientIP = getClientIP(request);
    const rateCheck = apiRateLimiter.check(`visitors:get:${clientIP}`);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Get fingerprint from query param (client-generated hash)
    const { searchParams } = new URL(request.url);
    const fingerprint = searchParams.get('fp');

    // Get or create the counter record
    let record = await db.visitorCount.findFirst();
    if (!record) {
      record = await db.visitorCount.create({ data: { count: 0 } });
    }

    let isNewVisitor = false;

    // If fingerprint is provided, check if this visitor already registered
    if (fingerprint && fingerprint.length > 10) {
      const existingVisitor = await db.visitor.findUnique({
        where: { fingerprint },
      });

      if (!existingVisitor) {
        // First time this visitor is seen → register and increment
        isNewVisitor = true;
        await db.visitor.create({
          data: {
            fingerprint,
            ipHash: clientIP,
            userAgent: request.headers.get('user-agent')?.slice(0, 200) || null,
          },
        });
        record = await db.visitorCount.update({
          where: { id: record.id },
          data: { count: { increment: 1 } },
        });
      }
      // If visitor already exists, just return count without incrementing
    } else {
      // No fingerprint (legacy) → always increment
      record = await db.visitorCount.update({
        where: { id: record.id },
        data: { count: { increment: 1 } },
      });
    }

    return NextResponse.json(
      { count: record.count, isNew: isNewVisitor },
      { headers: getSecurityHeaders() }
    );
  } catch (error) {
    console.error('Visitor error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

