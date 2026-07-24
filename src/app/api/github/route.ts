export const runtime = 'edge';
import { NextResponse } from 'next/server';

// GitHub profile data - cached on server side
const GITHUB_PROFILE = {
  login: '6p99',
  name: 'MJHOL',
  bio: 'I am curious about everything; I try to understand and program everything—the possible and the impossible.',
  avatarUrl: 'https://avatars.githubusercontent.com/u/252145943?v=4',
  githubUrl: 'https://github.com/6p99',
  publicRepos: 10,
  followers: 0,
  following: 4,
  createdAt: '2025-12-30T08:37:45Z',
};

const GITHUB_REPOS = [
  { name: '6p99', language: 'Python', stars: 0, forks: 0, url: 'https://github.com/6p99/6p99', description: null },
  { name: '6p99-site', language: 'JavaScript', stars: 0, forks: 0, url: 'https://github.com/6p99/6p99-site', description: null },
  { name: 'Components-V2-in-js', language: null, stars: 0, forks: 0, url: 'https://github.com/6p99/Components-V2-in-js', description: null },
  { name: 'Components-V2-in-py', language: null, stars: 0, forks: 0, url: 'https://github.com/6p99/Components-V2-in-py', description: null },
  { name: 'Components-V2-in-TypeScript', language: null, stars: 0, forks: 0, url: 'https://github.com/6p99/Components-V2-in-TypeScript', description: null },
  { name: 'Custome-Name-Sytel', language: null, stars: 0, forks: 0, url: 'https://github.com/6p99/Custome-Name-Sytel', description: null },
  { name: 'Discord-Bot-Temp-Voice', language: 'JavaScript', stars: 0, forks: 0, url: 'https://github.com/6p99/Discord-Bot-Temp-Voice', description: 'Discord Bot Temp Voice' },
  { name: 'discord-quests', language: null, stars: 0, forks: 0, url: 'https://github.com/6p99/discord-quests', description: 'A robust event-driven framework to automate and monitor Discord Quests' },
  { name: 'discordjs-api-uncovered', language: null, stars: 0, forks: 0, url: 'https://github.com/6p99/discordjs-api-uncovered', description: null },
  { name: 'Widget-Guid', language: null, stars: 0, forks: 0, url: 'https://github.com/6p99/Widget-Guid', description: 'A guide for creating custom Discord profile widgets using Widgets v2' },
];

const LANGUAGE_COLORS: Record<string, string> = {
  Python: '#3572A5',
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
};

export async function GET() {
  return NextResponse.json({
    profile: GITHUB_PROFILE,
    repos: GITHUB_REPOS.map((repo) => ({
      ...repo,
      color: repo.language ? LANGUAGE_COLORS[repo.language] || '#8b8b8b' : null,
    })),
  });
}

