export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSecurityHeaders, getClientIP, apiRateLimiter, sanitizeInput } from '@/lib/security';

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

/**
 * GET /api/ideas
 * Fetch all approved ideas
 */
export async function GET(request: NextRequest) {
  try {
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

/**
 * POST /api/ideas
 * Submit a new idea — each person (by fingerprint or IP) can submit only once per 6 hours.
 * 
 * Body: { title, content, fingerprint? }
 */
export async function POST(request: NextRequest) {
  try {
    const db = await getDb(request);
    const clientIP = getClientIP(request);
    const rateCheck = apiRateLimiter.check(`ideas:post:${clientIP}`);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await request.json();
    const { title, content, fingerprint } = body;

    if (!title || !content || typeof title !== 'string' || typeof content !== 'string') {
      return NextResponse.json({ error: 'Title and content required' }, { status: 400, headers: getSecurityHeaders() });
    }

    const cleanTitle = sanitizeInput(title.trim());
    const cleanContent = sanitizeInput(content.trim());

    if (!cleanTitle || !cleanContent || cleanTitle.length > 100 || cleanContent.length > 1000) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400, headers: getSecurityHeaders() });
    }

    // Build a unique identifier for this person
    const identifier = fingerprint || clientIP;

    // Check if this person submitted an idea in the last 6 hours
    const sixHoursAgo = new Date(Date.now() - SIX_HOURS_MS);
    const recentSubmission = await db.ideaSubmission.findFirst({
      where: {
        fingerprint: identifier,
        createdAt: { gte: sixHoursAgo },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (recentSubmission) {
      const timeLeft = SIX_HOURS_MS - (Date.now() - new Date(recentSubmission.createdAt).getTime());
      const hoursLeft = Math.floor(timeLeft / 3600000);
      const minutesLeft = Math.ceil((timeLeft % 3600000) / 60000);
      return NextResponse.json(
        {
          error: `يمكنك إرسال فكرة واحدة كل 6 ساعات فقط`,
          errorEn: `You can submit one idea every 6 hours only`,
          retryAfter: `${hoursLeft}س ${minutesLeft > 0 ? minutesLeft + 'د' : ''}`,
        },
        { status: 429, headers: getSecurityHeaders() }
      );
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

    // Record the submission for rate limiting
    await db.ideaSubmission.create({
      data: {
        fingerprint: identifier,
        ipHash: clientIP,
        ideaId: idea.id,
      },
    });

    return NextResponse.json({ success: true, idea }, { headers: getSecurityHeaders() });
  } catch (error) {
    console.error('Ideas error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

/**
 * PATCH /api/ideas — Vote on idea
 */
export async function PATCH(request: NextRequest) {
  try {
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

/**
 * PUT /api/ideas — Vote alias (supports PATCH via PUT)
 */
export async function PUT(request: NextRequest) {
  return PATCH(request);
}

