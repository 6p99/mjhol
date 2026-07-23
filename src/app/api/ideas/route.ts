import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSecurityHeaders, getClientIP, apiRateLimiter, sanitizeInput } from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = apiRateLimiter.check(`ideas:get:${clientIP}`);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const ideas = await db.idea.findMany({
      where: { status: 'approved' },
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
        status: 'pending',
      },
    });

    return NextResponse.json({ success: true, idea }, { headers: getSecurityHeaders() });
  } catch (error) {
    console.error('Ideas error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// Vote on idea
export async function PUT(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = apiRateLimiter.check(`ideas:vote:${clientIP}`);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { ideaId, type } = await request.json();
    if (!ideaId || !['upvote', 'downvote'].includes(type)) {
      return NextResponse.json({ error: 'Invalid' }, { status: 400 });
    }

    const idea = await db.idea.update({
      where: { id: ideaId },
      data: { votes: { increment: type === 'upvote' ? 1 : -1 } },
    });

    return NextResponse.json({ votes: idea.votes }, { headers: getSecurityHeaders() });
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
