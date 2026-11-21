[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/viansofyan/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/viansofyan/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Leonida Platinum — GTA VI Trophy Guide & Tracker

[Bounty: Build the best GTA 6 trophy guide — gta6-trophy-guide-01 on make.fun](https://make.fun/competitions/gta6-trophy-guide-01)

An offline web app that guides and tracks all 55 PlayStation 5 trophies of Grand Theft Auto VI. Static files only, no build step, nothing fetched over the network at runtime, system fonts only, no external assets. Open `app/index.html` in a desktop browser.

## What it does

- **Checklist** — every trophy with its official name, description and grade, a checkbox, and a detail pane with the guide in our own words, the PSN progress target where PlayStation tracks one, and its sources. Progress is saved in the browser and survives reload.
- **Filters** — by grade, kind, earned status, and a search box across name, description and guide. A spoiler setting hides the names, descriptions and guides of the 28 hidden trophies until earned.
- **Export and import** — download the earned list as JSON, and import such a file back; every name is validated against the 55 known trophies before it is applied.
- **Roadmap to Platinum** — six stages in play order, ending at the platinum, each with its trophies and earned count.
- **Missables** — the 22 story-gated or one-off trophies, grouped, with an honest note: no trophy is confirmed missable as of 19 November 2026, so keep a manual save.
- **Sources** — the method and the four cited sources, plus a fan-made disclaimer.

## How to run it

Entry program (Node 22, standard library only):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

That copies `app/` and `screenshots/` into the output directory and writes `out/dossier.json`.

Local server for testing:

```sh
node serve.mjs
```

Then open http://localhost:8080.

## Verification notes

- 55 trophies: 1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden; 22 flagged missable.
- Every name, description and grade is the verbatim official text from the kit starter's list (Exophase and PSNProfiles, 18 November 2026, agreeing on all 55).
- Every guide is written in our own words and cites its sources; where a place or step is not pinned down by a cited source, the guide says so.
- Unofficial fan guide, not affiliated with Rockstar Games or PlayStation.
