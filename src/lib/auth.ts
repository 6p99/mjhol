import type { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: 'discord',
      name: 'Discord',
      type: 'oauth',
      authorization: {
        url: 'https://discord.com/api/oauth2/authorize',
        params: { scope: 'identify email guilds' },
      },
      token: 'https://discord.com/api/oauth2/token',
      userinfo: 'https://discord.com/api/users/@me',
      clientId: process.env.DISCORD_CLIENT_ID || '',
      clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
      profile(profile) {
        return {
          id: profile.id,
          name: profile.username,
          email: profile.email,
          image: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : null,
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.account = account;
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.sub,
        accessToken: token.accessToken as string | undefined,
        provider: token.provider as string | undefined,
      } as any;
      return session;
    },
  },
  pages: {
    signIn: '.',
    error: '/',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60,
  },
  securityOptions: {
    checkState: false,
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production',
};
