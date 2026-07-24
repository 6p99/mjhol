export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
// FIX: Use getDb(request) for Cloudflare D1 compatibility
import { getDb } from '@/lib/db';
import { sanitizeComment, getClientIP, hashIPSync, commentApiLimiter, getSecurityHeaders, apiRateLimiter } from '@/lib/security';


// GET /api/comments - Fetch all comments
export async function GET(request: NextRequest) {
  try {
    // FIX: await getDb() — it's async for Cloudflare D1 compatibility
    const db = await getDb(request);
    // Rate limit check
    const clientIP = getClientIP(request);
    const rateCheck = apiRateLimiter.check(`comments:get:${clientIP}`);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rateCheck.resetIn / 1000)) } }
      );
    }

    const comments = await db.comment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: {
          select: {
            username: true,
            avatar: true,
            discriminator: true,
          },
        },
      },
    });

    const formatted = comments.map((c) => ({
      id: c.id,
      content: c.content,
      username: c.user.username,
      discriminator: c.user.discriminator,
      avatar: c.user.avatar
        ? `https://cdn.discordapp.com/avatars/${c.userId}/${c.user.avatar}.png`
        : null,
      createdAt: c.createdAt.toISOString(),
    }));

    return NextResponse.json({ comments: formatted }, { headers: getSecurityHeaders() });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}

// POST /api/comments - Create a new comment (requires Discord login + 6hr cooldown)
export async function POST(request: NextRequest) {
  try {
    // FIX: Use getDb(request) for Cloudflare D1 compatibility
    const db = await getDb(request);
    // Rate limit check (API level)
    const clientIP = getClientIP(request);
    const rateCheck = commentApiLimiter.check(`comments:post:${clientIP}`);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please slow down.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rateCheck.resetIn / 1000)) } }
      );
    }

    // Get session - check if user is logged in
    const sessionHeader = request.headers.get('authorization');
    const sessionResponse = await fetch(
      new URL('/api/auth/session', request.url).toString(),
      { headers: request.headers }
    );
    const session = await sessionResponse.json();

    if (!session?.user?.id || !session?.accessToken) {
      return NextResponse.json(
        { error: 'You must be logged in with Discord to comment.' },
        { status: 401, headers: getSecurityHeaders() }
      );
    }

    // Check 6-hour cooldown
    const userRecord = await db.discordUser.findUnique({
      where: { discordId: session.user.id },
    });

    if (!userRecord) {
      return NextResponse.json(
        { error: 'User not found. Please re-login.' },
        { status: 404, headers: getSecurityHeaders() }
      );
    }

    const rateLimitRecord = await db.rateLimit.findFirst({
      where: { userId: userRecord.id },
      orderBy: { lastCommentAt: 'desc' },
    });

    const SIX_HOURS = 6 * 60 * 60 * 1000;

    if (rateLimitRecord) {
      const timeSinceLastComment = Date.now() - rateLimitRecord.lastCommentAt.getTime();
      if (timeSinceLastComment < SIX_HOURS) {
        const remainingMs = SIX_HOURS - timeSinceLastComment;
        const remainingHours = Math.floor(remainingMs / (60 * 60 * 1000));
        const remainingMinutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
        return NextResponse.json(
          {
            error: `You can only comment once every 6 hours. Please wait ${remainingHours}h ${remainingMinutes}m.`,
            cooldownRemaining: remainingMs,
          },
          { status: 429, headers: getSecurityHeaders() }
        );
      }
    }

    // Parse and validate comment
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Comment content is required.' },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    const sanitized = sanitizeComment(content);
    if (!sanitized.valid) {
      return NextResponse.json(
        { error: sanitized.error },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    // Create the comment
    const comment = await db.comment.create({
      data: {
        content: sanitized.safe,
        userId: userRecord.id,
        ipHash: hashIPSync(clientIP),
        userAgent: request.headers.get('user-agent')?.substring(0, 200) || null,
      },
    });

    // Update rate limit
    await db.rateLimit.upsert({
      where: { id: rateLimitRecord?.id || 'create-new' },
      create: {
        userId: userRecord.id,
        lastCommentAt: new Date(),
      },
      update: {
        lastCommentAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        comment: {
          id: comment.id,
          content: comment.content,
          username: userRecord.username,
          discriminator: userRecord.discriminator,
          avatar: userRecord.avatar
            ? `https://cdn.discordapp.com/avatars/${userRecord.id}/${userRecord.avatar}.png`
            : null,
          createdAt: comment.createdAt.toISOString(),
        },
      },
      { headers: getSecurityHeaders() }
    );
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}

// DELETE /api/comments - Admin delete (requires special header)
export async function DELETE(request: NextRequest) {
  try {
    // FIX: Use getDb(request) for Cloudflare D1 compatibility
    const db = await getDb(request);
    const clientIP = getClientIP(request);
    const rateCheck = apiRateLimiter.check(`comments:delete:${clientIP}`);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded.' },
        { status: 429, headers: getSecurityHeaders() }
      );
    }

    const { commentId, adminKey } = await request.json();

    // Simple admin key check
    if (adminKey !== process.env.ADMIN_DELETE_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403, headers: getSecurityHeaders() }
      );
    }

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID required' },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    await db.comment.delete({ where: { id: commentId } });

    return NextResponse.json({ success: true }, { headers: getSecurityHeaders() });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}

