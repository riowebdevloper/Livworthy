/**
 * Automated Guest Post Publisher for Dev.to & Medium
 *
 * Usage:
 *   DEVTO_API_KEY="your_devto_key" npx tsx scripts/publish-articles.ts --platform=devto --article=all
 *   DEVTO_API_KEY="your_devto_key" npx tsx scripts/publish-articles.ts --platform=devto --article=2
 *   MEDIUM_TOKEN="your_medium_token" npm run publish:medium
 */

import fs from 'node:fs';
import path from 'node:path';

interface ArticleMeta {
  file: string;
  title: string;
  tags: string[];
  canonicalUrl: string;
}

const ARTICLES: Record<number, ArticleMeta> = {
  1: {
    file: 'outreach/articles/article-1-tech-compensation-take-home.md',
    title: 'Why Gross Salary Is Misleading: Take-Home Pay in Major US Tech Hubs (2026 Analysis)',
    tags: ['finance', 'careers', 'productivity', 'discuss'],
    canonicalUrl: 'https://www.livworthy.com/guides/nyc-100k',
  },
  2: {
    file: 'outreach/articles/article-2-relocation-london-nyc-dubai.md',
    title: 'London vs New York vs Dubai: The Real Relocation Math for Expat Professionals',
    tags: ['finance', 'career', 'relocation', 'productivity'],
    canonicalUrl: 'https://www.livworthy.com/compare/new-york-vs-london',
  },
  3: {
    file: 'outreach/articles/article-3-compare-job-offers-framework.md',
    title: 'How to Compare Two Job Offers in Different Cities: Beyond the Headline Salary',
    tags: ['careers', 'management', 'discuss', 'productivity'],
    canonicalUrl: 'https://www.livworthy.com/job-offers',
  },
  4: {
    file: 'outreach/articles/substack-human-tone-100k-reality.md',
    title: 'I Thought Making $100K in NYC Meant I Made It. Then I Looked at My Paystub',
    tags: ['career', 'finance', 'productivity', 'discuss'],
    canonicalUrl: 'https://www.livworthy.com/salary-worth',
  },
  5: {
    file: 'outreach/articles/substack-the-illusion-of-six-figures.md',
    title: 'The Illusion of the Six-Figure Salary: What $100K Actually Buys in 2026',
    tags: ['finance', 'career', 'remotework', 'discuss'],
    canonicalUrl: 'https://www.livworthy.com/salary-after-tax',
  },
};

interface DevToPayload {
  article: {
    title: string;
    published: boolean;
    body_markdown: string;
    tags: string[];
    canonical_url?: string;
  };
}

async function publishSingleToDevTo(num: number, apiKey: string) {
  const meta = ARTICLES[num];
  if (!meta) return;

  const articlePath = path.resolve(process.cwd(), meta.file);
  const rawMarkdown = fs.readFileSync(articlePath, 'utf8');
  // Strip duplicate top-level title if file starts with # Title
  const cleanedMarkdown = rawMarkdown.replace(/^#\s+[^\n]+\n+/, '');

  const payload: DevToPayload = {
    article: {
      title: meta.title,
      published: true,
      body_markdown: cleanedMarkdown,
      tags: meta.tags,
      canonical_url: meta.canonicalUrl,
    },
  };

  console.log(`🚀 Publishing Article ${num} ("${meta.title}") to Dev.to...`);
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
    return;
  }

  const data = await res.json() as { url: string; id: number };
  console.log(`🎉 Successfully published Article ${num} to Dev.to!`);
  console.log(`🔗 Live Article URL: ${data.url}\n`);
}

async function publishToDevTo(articleChoice: string) {
  const apiKey = process.env.DEVTO_API_KEY;
  if (!apiKey) {
    console.error('❌ Error: DEVTO_API_KEY environment variable is missing.');
    process.exit(1);
  }

  if (articleChoice === 'all') {
    for (const num of [1, 2, 3]) {
      await publishSingleToDevTo(num, apiKey);
      // Wait 3 seconds between posts to avoid rate limits
      await new Promise((r) => setTimeout(r, 3000));
    }
  } else {
    const num = parseInt(articleChoice, 10) || 1;
    await publishSingleToDevTo(num, apiKey);
  }
}

async function publishToMedium() {
  const token = process.env.MEDIUM_TOKEN;
  if (!token) {
    console.error('❌ Error: MEDIUM_TOKEN environment variable is missing.');
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
  const articleChoice = args.find((a) => a.startsWith('--article='))?.split('=')[1] || '1';

  if (platform === 'devto') {
    await publishToDevTo(articleChoice);
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
