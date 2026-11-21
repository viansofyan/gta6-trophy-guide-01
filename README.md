# Leonida Platinum — GTA VI Trophy Guide

[![Competition](https://make.fun/competitions/gta6-trophy-guide-01/badge)](https://make.fun/competitions/gta6-trophy-guide-01)
[![Rank](https://make.fun/competitions/gta6-trophy-guide-01/rank/viansofyan/gta6-trophy-guide-01)](https://make.fun/competitions/gta6-trophy-guide-01)
[![Reward](https://make.fun/competitions/gta6-trophy-guide-01/reward/viansofyan/gta6-trophy-guide-01)](https://make.fun/competitions/gta6-trophy-guide-01)

Bounty: [gta6-trophy-guide-01 on make.fun](https://make.fun/competitions/gta6-trophy-guide-01)

## What it is

An offline web app that is a guide plus progress tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI. Static files only, no build step, nothing fetched over the network at runtime, system fonts only, no external assets. No Rockstar logo, artwork, box art, or game screenshots anywhere.

- **Checklist** — one row per trophy with grade, name, description, hidden and missable markers, and a checkbox. Clicking a row opens a detail pane with the guide, the PSN progress target where tracked, and its sources. Progress is saved in the browser's local storage and survives reload. Export downloads the earned list as JSON; import reads such a file back and validates every name against the 55 known trophies.
- **Roadmap to Platinum** — six stages in order: story, strangers and side content, exploration, activities, robberies and money, then odds and ends, ending at the platinum.
- **Missables** — the 22 flagged trophies grouped, plus the honesty note: no trophy is confirmed missable as of 19 November 2026; the flags mean story-gated or one-off, so keep a manual save. The game has no mission replay or New Game Plus as far as the cited sources report.
- **Sources** — the method, the four sources (Exophase, PSNProfiles, PlanetGTA6, Output Lag), and a fan-made disclaimer.
- **Toolbar** — grade filter, kind filter, status filter, a search box, and a spoiler setting that hides the names, descriptions, and guides of all 28 hidden trophies until earned.

## How to run it

Entry program (builds the dossier into the output directory):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Local server for testing (serves `app/` on port 8080):

```sh
node serve.mjs
# open http://localhost:8080/
```

## Verification notes

- 55 trophies, official names, descriptions, and grades verbatim from the kit list dated 2026-11-18; every guide written in our own words.
- Sources: Exophase, PSNProfiles, PlanetGTA6, Output Lag.
- Unofficial fan-made guide — not affiliated with Rockstar Games or Take-Two Interactive.
