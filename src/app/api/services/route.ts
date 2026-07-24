export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
// FIX: Use getDb(request) for Cloudflare D1 compatibility
import { getDb } from '@/lib/db';
import { getSecurityHeaders } from '@/lib/security';


export async function GET(request: NextRequest) {
  try {
    // FIX: await getDb() — it's async for Cloudflare D1 compatibility
    const db = await getDb(request);
    const services = await db.serviceStatus.findMany({ orderBy: { id: 'asc' } });
    return NextResponse.json({ services }, { headers: getSecurityHeaders() });
  } catch (error) {
    console.error('Services error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

