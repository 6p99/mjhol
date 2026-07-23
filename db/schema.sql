-- FIX: D1 schema for Cloudflare Workers deployment
-- Run this with: bun run d1:migrate:local (local) or bun run d1:migrate (remote)
-- Equivalent to prisma/schema.prisma tables

CREATE TABLE IF NOT EXISTS "DiscordUser" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "discordId" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "discriminator" TEXT,
  "avatar" TEXT,
  "email" TEXT,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "Comment" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "content" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "ipHash" TEXT,
  "userAgent" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "DiscordUser"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "RateLimit" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT,
  "ipHash" TEXT,
  "lastCommentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "DiscordServer" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "inviteCode" TEXT NOT NULL,
  "serverId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "icon" TEXT,
  "splash" TEXT,
  "banner" TEXT,
  "description" TEXT,
  "memberCount" INTEGER NOT NULL DEFAULT 0,
  "onlineCount" INTEGER NOT NULL DEFAULT 0,
  "channelId" TEXT,
  "channelName" TEXT,
  "addedBy" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "VisitorCount" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "count" INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "Visitor" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "fingerprint" TEXT NOT NULL,
  "ipHash" TEXT,
  "userAgent" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Idea" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "votes" INTEGER NOT NULL DEFAULT 0,
  "userId" TEXT,
  "ipHash" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "IdeaSubmission" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "fingerprint" TEXT NOT NULL,
  "ipHash" TEXT,
  "ideaId" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "ServiceStatus" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "status" TEXT NOT NULL DEFAULT 'operational',
  "icon" TEXT,
  "url" TEXT,
  "uptime" REAL NOT NULL DEFAULT 99.9,
  "lastChecked" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "Skill" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "level" INTEGER NOT NULL DEFAULT 50,
  "icon" TEXT,
  "category" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0
);

-- Indexes for performance
CREATE UNIQUE INDEX IF NOT EXISTS "DiscordUser_discordId_key" ON "DiscordUser"("discordId");
CREATE UNIQUE INDEX IF NOT EXISTS "DiscordServer_inviteCode_key" ON "DiscordServer"("inviteCode");
CREATE UNIQUE INDEX IF NOT EXISTS "Visitor_fingerprint_key" ON "Visitor"("fingerprint");
CREATE INDEX IF NOT EXISTS "IdeaSubmission_fingerprint_createdAt_idx" ON "IdeaSubmission"("fingerprint", "createdAt");

-- Insert default visitor count if empty
INSERT OR IGNORE INTO "VisitorCount" ("id", "count") VALUES ('default', 0);
