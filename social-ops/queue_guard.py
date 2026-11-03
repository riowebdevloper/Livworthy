#!/usr/bin/env python3
"""Offline safety guard for LivWorthy launch queue. Does not access APIs or publish."""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
ALLOWED = {"youtube", "tiktok", "pinterest", "twitter"}
REQUIRED_MARKETS = {"USA", "UK", "Canada", "UAE", "India"}
BLOCKED = {"facebook", "instagram"}


def load(name):
    return json.loads((ROOT / name).read_text(encoding="utf-8"))


def key(campaign, market, platform, creative_id):
    return "|".join([campaign.lower(), market.lower(), platform.lower(), creative_id.lower()])


def validate():
    queue = load("launch_queue.json")
    ledger = load("scheduled_ledger.json")
    failures = []

    market_by_name = {row["market"]: row for row in queue["markets"]}
    if set(market_by_name) != REQUIRED_MARKETS:
        failures.append("Required region set differs from five-country mandate")

    for region in queue["markets"]:
        if not region.get("sources") or not all(str(s).startswith("https://") for s in region["sources"]):
            failures.append(f"{region['market']}: no verifiable primary-source URLs")
        if region.get("claim_type") != "qualitative":
            failures.append(f"{region['market']}: quantitative content requires manual figure, tax-year and method audit")
        if "https://www.livworthy.com" not in region.get("copy", ""):
            failures.append(f"{region['market']}: LivWorthy link missing")

    india = market_by_name.get("India", {})
    if india.get("website_market_supported") is not False:
        failures.append("India website calculators must not be marked supported without re-verification")

    existing_posts = ledger.get("posts", [])
    existing_network_keys = {(p["market"], network) for p in existing_posts for network in p["platforms"]}
    proposed_keys = set()
    for row in queue["proposed_test_posts"]:
        p, m = row["platform"].lower(), row["market"]
        if p not in ALLOWED or p in BLOCKED:
            failures.append(f"Forbidden or unknown platform: {p}")
        if m not in market_by_name:
            failures.append(f"Unknown market: {m}")
        if (m, p) in existing_network_keys:
            failures.append(f"Already scheduled in Metricool: {m}/{p}")
        k = key(queue["campaign"], m, p, row["creative_id"])
        if k in proposed_keys:
            failures.append(f"Duplicate proposed creative: {k}")
        proposed_keys.add(k)
        if row.get("status") in {"SCHEDULED", "PUBLISHED"} and not row.get("post_id"):
            failures.append(f"{m}/{p}: claimed scheduling without a returned post ID")
        if row.get("status") != "SCHEDULED" and row.get("scheduled_at"):
            failures.append(f"{m}/{p}: scheduled timestamp present without scheduled status")

    for row in queue["proposed_test_posts"]:
        print(f"{row['platform']:10} {row['market']:7} {row['status']}")
    if failures:
        print("\nBLOCKED: " + "; ".join(failures))
        return 2
    print(f"\nPASS: {len(queue['markets'])} countries and {len(queue['proposed_test_posts'])} launch posts validated as staging records, NOT publication receipts.")
    return 0


if __name__ == "__main__":
    raise SystemExit(validate())
