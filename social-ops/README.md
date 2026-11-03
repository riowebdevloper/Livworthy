# LivWorthy Global — verified social publishing operations

Updated 2026-11-03. This directory stages a zero-upfront-cost editorial publishing workflow for **LivWorthy Global**. It is not a live autonomous publishing bot.

## Scope and restrictions
- Authorized launch platforms: YouTube, TikTok (`@livworthyglobal`), Pinterest (`@livworthyglobal`) and X (`@JamesRio7y`). Do not publish to Instagram or Facebook.
- Five localized editorial markets: USA (English), UK (British English), Canada (Canadian English), UAE (Arabic/English), India (Hinglish/English).
- No paid services, API charges, trials, invented statistics, scraped login credentials, or fake publication receipts.
- Never represent a generated illustration as a photograph of an actual event. Disclose AI-assisted media where a platform requires it.
- Only use confirmed live LivWorthy pages; approved default destination is `https://www.livworthy.com`.
- **Market availability alert:** as verified on 2026-11-03, the website lists India calculators as *UNSUPPORTED*; educational India posts must not imply an India salary calculation is operational.
- For every quantitative statement record official source, jurisdiction, tax year, verification date, method and assumptions before approval.

## Actual connection state as of 2026-11-03
- Metricool brand `7614477`, timezone `Asia/Calcutta`: YouTube and Pinterest connections were returned by the brand settings API.
- Adobe Express: the owner reports YouTube, TikTok, Pinterest and X linked. The actual Adobe Content Scheduler/calendar could not be inspected through the available app actions; do not treat these as independently verified.
- Metricool Threads/Bluesky: five region-specific posts scheduled for 2026-11-04 through 2026-11-08 at 18:30 IST, pending when reread; preserved without changes.
- Pinterest Metricool test attempt: failed before scheduling because the candidate board name `Salary & Cost of Living` could not be resolved to a numeric board ID.
- YouTube, TikTok and X: no new uploads/schedules confirmed. Do not invent them.

## Content pipeline
1. Research with primary-source links; qualitative facts may be used when a numerical claim is not verified.
2. Localization by regional terminology (never merely machine-translate tax rules).
3. Human editorial/legibility review and accurate AI-media declarations.
4. Produce native graphics (Pinterest 1000×1500, X 1600×900) and captioned vertical MP4 (1080×1920) from original content.
5. Before a write, check the current publishing calendar *and* the ledger in `scheduled_ledger.json`. Lock the dedupe key `campaign|market|platform|creative_id`.
6. Publish only using authorized connected tools. Pin requires a valid Pinterest **board ID**, not a guessed board name. YouTube/TikTok need actual publicly accessible media and audience/privacy fields.
7. Reread the provider calendar, record returned post ID, exact timezone, media checksum, and status. Don't equate scheduled with published.
8. Verify live URLs after the planned time, track failures, avoid retries without checking existing submissions.

## Contents
- `launch_queue.json`: localized launch briefs, official source links, candidate platform-specific copy and current status. Status is **not** a record of scheduling success.
- `scheduled_ledger.json`: existing calendar IDs and integrity guards.
- `queue_guard.py`: offline duplicate-key and compliance validator; run `python social-ops/queue_guard.py` from repository root.

## Browser limitation
The current ChatGPT tools for Adobe Express support template search, design editing, and image export, but **not Content Scheduler navigation or publishing**. Publishing through that interface requires a separately available Cloud Browser in ChatGPT Work. Do not claim the scheduler was opened here.

## Operating cost
No third-party subscription or paid trial activated; incremental service purchases: ₹0.
