#!/usr/bin/env python3
"""Offline validation for the LivWorthy social queue. Never publishes content."""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
ALLOWED = {"youtube", "tiktok", "pinterest", "twitter", "facebook", "instagram"}
REQUIRED_MARKETS = {"USA", "UK", "Canada", "UAE", "India"}


def load(name):
    return json.loads((ROOT / name).read_text(encoding="utf-8"))


def validate():
    queue = load("launch_queue.json")
    ledger = load("scheduled_ledger.json")
    failures = []

    regions = {r["market"]: r for r in queue["markets"]}
    if set(regions) != REQUIRED_MARKETS:
        failures.append("Expected exactly the five approved markets")

    for region in regions.values():
        if not region.get("sources") or any(not s.startswith("https://") for s in region["sources"]):
            failures.append(f"{region['market']}: missing primary sources")
        if region.get("claim_type") != "qualitative":
            failures.append(f"{region['market']}: numerical claims require verification")
        if "https://www.livworthy.com" not in region.get("copy", ""):
            failures.append(f"{region['market']}: destination missing")
    if regions.get("India", {}).get("website_market_supported") is not False:
        failures.append("India calculator cannot be marked supported without verification")

    indexed = {}
    for post in ledger.get("posts", []):
        for platform in post["platforms"]:
            indexed.setdefault((post["market"], platform), []).append(post)

    targets = queue.get("proposed_test_posts", []) + queue.get("additional_verified_posts", [])
    seen = set()
    for post in targets:
        network, market = post["platform"], post["market"]
        status, post_id = post.get("status"), post.get("post_id")
        if network not in ALLOWED:
            failures.append(f"Invalid network: {network}")
        if market not in regions and market != "Global":
            failures.append(f"Invalid market: {market}")
        key = (queue["campaign"], market, network, post["creative_id"])
        if key in seen:
            failures.append(f"Duplicated creative key: {key}")
        seen.add(key)

        existing = indexed.get((market, network), [])
        same = next((entry for entry in existing if entry.get("post_id") == post_id), None)
        if status == "SCHEDULED":
            if not post_id or not post.get("scheduled_at"):
                failures.append(f"{market}/{network}: scheduled without ID/time")
            if same is None:
                failures.append(f"{market}/{network}: scheduled ID missing in verified ledger")
        elif status in {"PUBLISHED", "FAILED"}:
            failures.append(f"{market}/{network}: publish outcomes require a separate provider-verified record")
        elif existing:
            failures.append(f"{market}/{network}: already scheduled, do not submit again")
        elif post.get("scheduled_at"):
            failures.append(f"{market}/{network}: timestamp on unscheduled row")

        print(f"{network:<11} {market:<7} {status:<12} {post_id or '-'}")

    if failures:
        print("\nFAILED: " + "; ".join(failures))
        return 2
    print(f"\nPASS: {len(targets)} launch records cross-checked. SCHEDULED does not mean PUBLISHED.")
    return 0


if __name__ == "__main__":
    raise SystemExit(validate())
