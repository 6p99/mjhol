import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSecurityHeaders } from '@/lib/security';

export async function GET() {
  try {
    const skills = await db.skill.findMany({ orderBy: { sortOrder: 'asc' } });
    return NextResponse.json({ skills }, { headers: getSecurityHeaders() });
  } catch (error) {
    console.error('Skills error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
