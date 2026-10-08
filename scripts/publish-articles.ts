/**
 * Automated Guest Post Publisher for Dev.to & Medium
 *
 * Usage:
 *   DEVTO_API_KEY="your_devto_key" npm run publish:devto
 *   MEDIUM_TOKEN="your_medium_token" npm run publish:medium
 */

import fs from 'node:fs';
import path from 'node:path';

interface DevToPayload {
  article: {
    title: string;
    published: boolean;
    body_markdown: string;
    tags: string[];
    canonical_url?: string;
  };
}

async function publishToDevTo() {
  const apiKey = process.env.DEVTO_API_KEY;
  if (!apiKey) {
    console.error('❌ Error: DEVTO_API_KEY environment variable is missing.');
    console.log('👉 To get your free API key in 10 seconds:');
    console.log('   1. Log in to https://dev.to');
    console.log('   2. Go to Settings -> Extensions -> DEV Community API Keys');
    console.log('   3. Generate a key and run:');
    console.log('      DEVTO_API_KEY="your-key" npx tsx scripts/publish-articles.ts --platform=devto\n');
    process.exit(1);
  }

  const articlePath = path.resolve(process.cwd(), 'outreach/articles/article-1-tech-compensation-take-home.md');
  const markdown = fs.readFileSync(articlePath, 'utf8');

  const payload: DevToPayload = {
    article: {
      title: 'Why Gross Salary Is Misleading: Take-Home Pay in Major US Tech Hubs (2026 Analysis)',
      published: true,
      body_markdown: markdown,
      tags: ['finance', 'careers', 'productivity', 'discuss'],
      canonical_url: 'https://www.livworthy.com/guides/nyc-100k',
    },
  };

  console.log('🚀 Publishing Article 1 to Dev.to via REST API...');
  const res = await fetch('https://dev.to/api/articles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`❌ Dev.to API responded with status ${res.status}:`, errorText);
    process.exit(1);
  }

  const data = await res.json() as { url: string; id: number };
  console.log('🎉 Successfully published to Dev.to!');
  console.log(`🔗 Live Article URL: ${data.url}`);
}

async function publishToMedium() {
  const token = process.env.MEDIUM_TOKEN;
  if (!token) {
    console.error('❌ Error: MEDIUM_TOKEN environment variable is missing.');
    console.log('👉 To get your Medium Integration Token:');
    console.log('   1. Log in to https://medium.com');
    console.log('   2. Go to Settings -> Security and apps -> Integration tokens');
    console.log('   3. Generate a token and run:');
    console.log('      MEDIUM_TOKEN="your-token" npx tsx scripts/publish-articles.ts --platform=medium\n');
    process.exit(1);
  }

  console.log('🔍 Fetching Medium user identity...');
  const userRes = await fetch('https://api.medium.com/v1/me', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!userRes.ok) {
    console.error('❌ Failed to authenticate with Medium API:', await userRes.text());
    process.exit(1);
  }

  const userData = await userRes.json() as { data: { id: string; username: string } };
  const userId = userData.data.id;

  const articlePath = path.resolve(process.cwd(), 'outreach/articles/article-2-relocation-london-nyc-dubai.md');
  const markdown = fs.readFileSync(articlePath, 'utf8');

  console.log(`🚀 Publishing Article 2 to Medium (@${userData.data.username}) via REST API...`);
  const res = await fetch(`https://api.medium.com/v1/users/${userId}/posts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      title: 'London vs New York vs Dubai: The Real Relocation Math for Expat Professionals',
      contentFormat: 'markdown',
      content: markdown,
      tags: ['Personal Finance', 'Career Advice', 'Relocation', 'Expat'],
      canonicalUrl: 'https://www.livworthy.com/compare/new-york-vs-london',
      publishStatus: 'public',
    }),
  });

  if (!res.ok) {
    console.error('❌ Medium API error:', await res.text());
    process.exit(1);
  }

  const data = await res.json() as { data: { url: string } };
  console.log('🎉 Successfully published to Medium!');
  console.log(`🔗 Live Article URL: ${data.data.url}`);
}

async function main() {
  const args = process.argv.slice(2);
  const platform = args.find((a) => a.startsWith('--platform='))?.split('=')[1] || 'devto';

  if (platform === 'devto') {
    await publishToDevTo();
  } else if (platform === 'medium') {
    await publishToMedium();
  } else {
    console.error(`Unknown platform: ${platform}. Use --platform=devto or --platform=medium.`);
  }
}

main().catch((err) => {
  console.error('Fatal error during publishing:', err);
  process.exit(1);
});
