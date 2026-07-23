import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSecurityHeaders, getClientIP, apiRateLimiter } from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = apiRateLimiter.check(`visitors:get:${clientIP}`);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    let record = await db.visitorCount.findFirst();
    if (!record) {
      record = await db.visitorCount.create({ data: { count: 1 } });
    } else {
      record = await db.visitorCount.update({
        where: { id: record.id },
        data: { count: { increment: 1 } },
      });
    }

    return NextResponse.json({ count: record.count }, { headers: getSecurityHeaders() });
  } catch (error) {
    console.error('Visitor error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
