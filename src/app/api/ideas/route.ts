import { NextRequest, NextResponse } from 'next/server';
// FIX: Use getDb(request) for Cloudflare D1 compatibility
import { getDb } from '@/lib/db';
import { getSecurityHeaders, getClientIP, apiRateLimiter, sanitizeInput } from '@/lib/security';


export async function GET(request: NextRequest) {
  try {
    // FIX: await getDb() — it's async for Cloudflare D1 compatibility
    const db = await getDb(request);
    const clientIP = getClientIP(request);
    const rateCheck = apiRateLimiter.check(`ideas:get:${clientIP}`);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const ideas = await db.idea.findMany({
      orderBy: [{ votes: 'desc' }, { createdAt: 'desc' }],
      take: 50,
    });

    return NextResponse.json({ ideas }, { headers: getSecurityHeaders() });
  } catch (error) {
    console.error('Ideas error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // FIX: Use getDb(request) for Cloudflare D1 compatibility
    const db = await getDb(request);
    const clientIP = getClientIP(request);
    const rateCheck = apiRateLimiter.check(`ideas:post:${clientIP}`);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await request.json();
    const { title, content } = body;

    if (!title || !content || typeof title !== 'string' || typeof content !== 'string') {
      return NextResponse.json({ error: 'Title and content required' }, { status: 400, headers: getSecurityHeaders() });
    }

    const cleanTitle = sanitizeInput(title.trim());
    const cleanContent = sanitizeInput(content.trim());

    if (!cleanTitle || !cleanContent || cleanTitle.length > 100 || cleanContent.length > 1000) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400, headers: getSecurityHeaders() });
    }

    const sessionRes = await fetch(new URL('/api/auth/session', request.url).toString(), { headers: request.headers });
    const session = await sessionRes.json();

    const idea = await db.idea.create({
      data: {
        title: cleanTitle,
        content: cleanContent,
        userId: session?.user?.id || null,
        ipHash: clientIP,
        status: 'approved',
      },
    });

    return NextResponse.json({ success: true, idea }, { headers: getSecurityHeaders() });
  } catch (error) {
    console.error('Ideas error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// Vote on idea (supports both PATCH and PUT)
export async function PATCH(request: NextRequest) {
  try {
    // FIX: Use getDb(request) for Cloudflare D1 compatibility
    const db = await getDb(request);
    const clientIP = getClientIP(request);
    const rateCheck = apiRateLimiter.check(`ideas:vote:${clientIP}`);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { id, dir } = await request.json();
    if (!id || !['up', 'down'].includes(dir)) {
      return NextResponse.json({ error: 'Invalid' }, { status: 400 });
    }

    const idea = await db.idea.update({
      where: { id },
      data: { votes: { increment: dir === 'up' ? 1 : -1 } },
    });

    return NextResponse.json({ votes: idea.votes }, { headers: getSecurityHeaders() });
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  return PATCH(request);
}
