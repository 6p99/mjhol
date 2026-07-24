export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
// FIX: Use getDb(request) for Cloudflare D1 compatibility
import { getDb } from '@/lib/db';
import { getSecurityHeaders, getClientIP, apiRateLimiter } from '@/lib/security';

const ADMIN_DISCORD_ID = '803662340465229855';

async function checkAdmin(request: NextRequest) {
  const sessionResponse = await fetch(
    new URL('/api/auth/session', request.url).toString(),
    { headers: request.headers }
  );
  const session = await sessionResponse.json();
  if (!session?.user?.id || session.user.id !== ADMIN_DISCORD_ID) {
    return false;
  }
  return true;
}


// GET /api/admin - Full admin dashboard data
export async function GET(request: NextRequest) {
  try {
    // FIX: await getDb() — it's async for Cloudflare D1 compatibility
    const db = await getDb(request);
    const clientIP = getClientIP(request);
    const rateCheck = apiRateLimiter.check(`admin:get:${clientIP}`);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    if (!(await checkAdmin(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403, headers: getSecurityHeaders() });
    }

    const [users, comments, servers, rateLimits] = await Promise.all([
      db.discordUser.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
        include: { _count: { select: { comments: true } } },
      }),
      db.comment.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
        include: {
          user: {
            select: { username: true, discriminator: true, discordId: true },
          },
        },
      }),
      db.discordServer.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      db.rateLimit.findMany({
        orderBy: { lastCommentAt: 'desc' },
        take: 50,
        include: { user: { select: { username: true, discordId: true } } },
      }),
    ]);

    const stats = {
      totalUsers: await db.discordUser.count(),
      totalComments: await db.comment.count(),
      totalServers: await db.discordServer.count(),
      totalRateLimits: await db.rateLimit.count(),
    };

    return NextResponse.json(
      { stats, users, comments, servers, rateLimits },
      { headers: getSecurityHeaders() }
    );
  } catch (error) {
    console.error('Admin fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin data' }, { status: 500 });
  }
}

// DELETE /api/admin - Delete comment or user
export async function DELETE(request: NextRequest) {
  try {
    // FIX: Use getDb(request) for Cloudflare D1 compatibility
    const db = await getDb(request);
    const clientIP = getClientIP(request);
    const rateCheck = apiRateLimiter.check(`admin:delete:${clientIP}`);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    if (!(await checkAdmin(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403, headers: getSecurityHeaders() });
    }

    const { type, id } = await request.json();

    if (!type || !id) {
      return NextResponse.json({ error: 'Type and ID required' }, { status: 400, headers: getSecurityHeaders() });
    }

    if (type === 'comment') {
      await db.comment.delete({ where: { id } });
    } else if (type === 'user') {
      await db.discordUser.delete({ where: { id } });
    } else if (type === 'server') {
      await db.discordServer.delete({ where: { id } });
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400, headers: getSecurityHeaders() });
    }

    return NextResponse.json({ success: true }, { headers: getSecurityHeaders() });
  } catch (error) {
    console.error('Admin delete error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

