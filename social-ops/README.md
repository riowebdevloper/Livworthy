# LivWorthy Global — operational social publishing log

Last verified: **2026-11-04**, Metricool timezone **Asia/Calcutta**. Initial cost: **₹0**, no trials/purchases.

## The actual result

The owner reports six connections in Adobe Express (YouTube, TikTok, Pinterest, X, Facebook, Instagram). Adobe Content Scheduler is *not browser-accessible from the current chat*. As a supported fallback, five actual media-backed posts were scheduled with the **connected Metricool LivWorthy brand 7614477**. All five returned **PENDING** with automatic publishing enabled; none may yet be represented as live.

| Network | Post ID | Planned publishing (IST) | Creative | Schedule URL |
|---|---:|---|---|---|
| Facebook | 416116862 | 2026-11-06 04:30 | USA authority JPG + human-readable job-offer checklist | [Planner](https://app.metricool.com/planner/calendar?blogId=7614477&openWithPostUuid=8698061131702028894) |
| TikTok | 416118024 | 2026-11-07 19:30 | India CTC vs in-hand vertical video (MP4), Hinglish caption, AI-content declaration | [Planner](https://app.metricool.com/planner/calendar?blogId=7614477&openWithPostUuid=2050267686074666458) |
| Instagram | 416117622 | 2026-11-08 04:30 | **5-slide original editorial image carousel** for USA, UK, Canada, UAE and India; AI flag; alt text | [Planner](https://app.metricool.com/planner/calendar?blogId=7614477&openWithPostUuid=-3718406168565627212) |
| X / Twitter | 416116832 | 2026-11-09 23:00 | UK authority JPG + concise native caption | [Planner](https://app.metricool.com/planner/calendar?blogId=7614477&openWithPostUuid=-7409560312861933150) |
| YouTube Shorts | 416115598 | 2026-11-11 04:30 | USA salary reality video (1080×1920 MP4, 16 seconds), audience not made-for-kids, AI-content flag | [Planner](https://app.metricool.com/planner/calendar?blogId=7614477&openWithPostUuid=6645160069764171937) |

Pinterest: **NOT scheduled**. An actual image-attached scheduling attempt failed validation: `pinterestData.boardId` is mandatory. The earlier board name `Salary & Cost of Living` was not recognized. Need the **existing Pinterest board's numeric ID or exact real name**; do not invent a board. No Pinterest post was created.

## Existing schedule — preserve

Five earlier posts (Nov 4–8 at 18:30 IST) target Threads and Bluesky. IDs 415180532, 415180586, 415180670, 415180731, 415180778. All were reread as PENDING and untouched. See `scheduled_ledger.json` for exact uuid/URLs.

## Editorial and legal quality
- Use only sourced and nuanced claims; no invented numerical salary, tax or city-ranking statistics.
- Regional language choices: US English, UK English, Canadian English, Arabic/English for UAE, Hinglish/English for India.
- The current LivWorthy public site has **India calculator marked unsupported** as of Nov 3, 2026; educational India posts do not promise a functioning India calculator.
- Main authorized destination: https://www.livworthy.com
- Instagram/TikTok/YouTube AI declarations set where platform supports them.
- Prefer educational posts with a useful takeaway, thoughtful question and accessible media, not generic spam or invented engagement.

## Repeatable operation
1. Research with primary-source URLs and date/market assumptions.
2. Humanize and localize captions; avoid precise figures until official fact-check completes.
3. Prepare original high-contrast assets, vertical videos, alt text, and correct AI disclosures.
4. Reread Metricool scheduled posts; compare `scheduled_ledger.json`; do not duplicate existing items.
5. Upload media through authorized connected publisher; **only** mark SCHEDULED once a provider returns a post ID AND calendar readback confirms it.
6. After scheduled time, verify provider status PUBLISHED/FAILED and live URL if available. Never equate PENDING with delivered.
7. Inspect analytics and improve next batch only using observed data.

Files: `launch_queue.json` (regional briefs and staged status); `scheduled_ledger.json` (10 verified calendar entries), `queue_guard.py` (offline dedupe/claim checks).

**Operational monitoring:** recurring publication QA has been created for these five posts (starting Nov 6); a separate prior check covers the original Threads/Bluesky schedule. Monitoring does not independently publish new posts.

This GitHub branch contains configuration and logs, not the actual production website deployment. Production files were not edited.
