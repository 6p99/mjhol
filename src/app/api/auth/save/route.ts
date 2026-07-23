import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSecurityHeaders } from '@/lib/security';

// POST /api/auth/save - Save Discord user to database
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { discordId, username, discriminator, avatar, email, accessToken, refreshToken } = body;

    if (!discordId || !username) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    const user = await db.discordUser.upsert({
      where: { discordId },
      create: {
        discordId,
        username,
        discriminator: discriminator || null,
        avatar: avatar || null,
        email: email || null,
        accessToken,
        refreshToken,
      },
      update: {
        username,
        discriminator: discriminator || null,
        avatar: avatar || null,
        email: email || null,
        accessToken,
        refreshToken,
      },
    });

    return NextResponse.json(
      { success: true, user: { id: user.id, username: user.username } },
      { headers: getSecurityHeaders() }
    );
  } catch (error) {
    console.error('Error saving user:', error);
    return NextResponse.json(
      { error: 'Failed to save user' },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}
