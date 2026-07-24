export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
// FIX: Use getDb(request) for Cloudflare D1 compatibility
import { getDb } from '@/lib/db';
import { getSecurityHeaders } from '@/lib/security';


export async function GET(request: NextRequest) {
  try {
    // FIX: await getDb() — it's async for Cloudflare D1 compatibility
    const db = await getDb(request);
    const skills = await db.skill.findMany({ orderBy: { sortOrder: 'asc' } });
    return NextResponse.json({ skills }, { headers: getSecurityHeaders() });
  } catch (error) {
    console.error('Skills error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

