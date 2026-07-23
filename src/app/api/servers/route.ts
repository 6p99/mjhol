import { NextRequest, NextResponse } from 'next/server';
// FIX: Use getDb(request) for Cloudflare D1 compatibility
import { getDb } from '@/lib/db';
import { getSecurityHeaders, getClientIP, apiRateLimiter, sanitizeInput } from '@/lib/security';

const ADMIN_DISCORD_ID = '803662340465229855';


// GET /api/servers - Get all servers (admin only)
export async function GET(request: NextRequest) {
  try {
    // FIX: await getDb() — it's async for Cloudflare D1 compatibility
    const db = await getDb(request);
    const clientIP = getClientIP(request);
    const rateCheck = apiRateLimiter.check(`servers:get:${clientIP}`);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Check admin access via session
    const sessionResponse = await fetch(
      new URL('/api/auth/session', request.url).toString(),
      { headers: request.headers }
    );
    const session = await sessionResponse.json();

    if (!session?.user?.id || session.user.id !== ADMIN_DISCORD_ID) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403, headers: getSecurityHeaders() });
    }

    const servers = await db.discordServer.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ servers }, { headers: getSecurityHeaders() });
  } catch (error) {
    console.error('Error fetching servers:', error);
    return NextResponse.json({ error: 'Failed to fetch servers' }, { status: 500 });
  }
}

// POST /api/servers - Add a server via invite link (admin only)
export async function POST(request: NextRequest) {
  try {
    // FIX: Use getDb(request) for Cloudflare D1 compatibility
    const db = await getDb(request);
    const clientIP = getClientIP(request);
    const rateCheck = apiRateLimiter.check(`servers:post:${clientIP}`);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Check admin access
    const sessionResponse = await fetch(
      new URL('/api/auth/session', request.url).toString(),
      { headers: request.headers }
    );
    const session = await sessionResponse.json();

    if (!session?.user?.id || session.user.id !== ADMIN_DISCORD_ID) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403, headers: getSecurityHeaders() });
    }

    const body = await request.json();
    const { inviteUrl } = body;

    if (!inviteUrl || typeof inviteUrl !== 'string') {
      return NextResponse.json({ error: 'Invite URL is required' }, { status: 400, headers: getSecurityHeaders() });
    }

    // Extract invite code from URL
    let inviteCode = inviteUrl;
    const urlMatch = inviteUrl.match(/discord\.gg\/([a-zA-Z0-9_-]+)/);
    if (urlMatch) {
      inviteCode = urlMatch[1];
    }

    // Remove any trailing slashes or query params
    inviteCode = inviteCode.replace(/[\/?].*$/, '').trim();

    if (!inviteCode) {
      return NextResponse.json({ error: 'Invalid invite URL' }, { status: 400, headers: getSecurityHeaders() });
    }

    // Check if already exists
    const existing = await db.discordServer.findUnique({ where: { inviteCode } });
    if (existing) {
      return NextResponse.json({ error: 'Server already added', server: existing }, { status: 409, headers: getSecurityHeaders() });
    }

    // Fetch server info from Discord API
    const discordRes = await fetch(`https://discord.com/api/v10/invites/${inviteCode}?with_counts=true&with_expiration=false`);
    if (!discordRes.ok) {
      const errData = await discordRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: errData.message || 'Invalid invite code or server not found' },
        { status: discordRes.status, headers: getSecurityHeaders() }
      );
    }

    const inviteData = await discordRes.json();
    const guild = inviteData.guild;

    const server = await db.discordServer.create({
      data: {
        inviteCode,
        serverId: guild.id,
        name: guild.name,
        icon: guild.icon || null,
        splash: guild.splash || null,
        banner: guild.banner || null,
        description: guild.description || null,
        memberCount: inviteData.member_count || guild.approximate_member_count || 0,
        onlineCount: inviteData.presence_count || guild.approximate_presence_count || 0,
        channelId: inviteData.channel?.id || null,
        channelName: inviteData.channel?.name || null,
        addedBy: session.user.id,
      },
    });

    return NextResponse.json({ success: true, server }, { headers: getSecurityHeaders() });
  } catch (error) {
    console.error('Error adding server:', error);
    return NextResponse.json({ error: 'Failed to add server' }, { status: 500 });
  }
}

// DELETE /api/servers - Remove a server (admin only)
export async function DELETE(request: NextRequest) {
  try {
    // FIX: Use getDb(request) for Cloudflare D1 compatibility
    const db = await getDb(request);
    const clientIP = getClientIP(request);
    const rateCheck = apiRateLimiter.check(`servers:delete:${clientIP}`);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const sessionResponse = await fetch(
      new URL('/api/auth/session', request.url).toString(),
      { headers: request.headers }
    );
    const session = await sessionResponse.json();

    if (!session?.user?.id || session.user.id !== ADMIN_DISCORD_ID) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403, headers: getSecurityHeaders() });
    }

    const { serverId } = await request.json();

    if (!serverId) {
      return NextResponse.json({ error: 'Server ID required' }, { status: 400, headers: getSecurityHeaders() });
    }

    await db.discordServer.delete({ where: { id: serverId } });

    return NextResponse.json({ success: true }, { headers: getSecurityHeaders() });
  } catch (error) {
    console.error('Error deleting server:', error);
    return NextResponse.json({ error: 'Failed to delete server' }, { status: 500 });
  }
}
