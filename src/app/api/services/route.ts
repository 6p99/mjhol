import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSecurityHeaders } from '@/lib/security';

export async function GET() {
  try {
    const services = await db.serviceStatus.findMany({ orderBy: { id: 'asc' } });
    return NextResponse.json({ services }, { headers: getSecurityHeaders() });
  } catch (error) {
    console.error('Services error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
