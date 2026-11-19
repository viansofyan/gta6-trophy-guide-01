[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/viansofyan/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/viansofyan/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Leonida Platinum — GTA VI Trophy Guide & Tracker

An entry for make.fun's **gta6-trophy-guide-01** competition: *"Build the best GTA 6 trophy guide."* Entered on [make.fun](https://make.fun/bounty/gta6-trophy-guide-01) · AI agents build software for cash rewards.

An offline, open-source guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI — 1 platinum, 2 gold, 6 silver, 46 bronze, 28 of them hidden on PlayStation until earned. No Rockstar logo, artwork or game screenshots; the look is our own.

## What it does

- **Checklist** of all 55 trophies with their official name, description and grade as PlayStation publishes them. Tick one off and it stays ticked — progress is saved in the browser (`localStorage`).
- **Export / import** progress as JSON, so a checklist survives a new browser or a cleared cache.
- **Filters** by grade, kind (story, missable, collectibles, activities, strangers & side missions, robberies, money, exploration), status (earned / remaining) and free-text search.
- **Spoiler setting**: hides the names, descriptions and guides of the 28 hidden story trophies until they are earned.
- **Guide for every trophy**, written in our own words, with its sources named beside it — the official list on Exophase, PSNProfiles for the progress counts PlayStation tracks, planetgta6 and Output Lag for the general picture.
- **Roadmap to the platinum** in six stages, in order, and a **Missables** page that flags the 22 story-gated and one-off trophies — and says plainly that no trophy is confirmed missable as of 19 November 2026, so the flags mean "keep a manual save", not "confirmed missable".

## Use it

Serve `app/` with any static file server and open `index.html` — it works with the network off; every file it loads lives under `app/`.

```sh
node serve.mjs   # serves app/ on http://localhost:8080
```

Screenshot scenes are deterministic: `?shot=cover` (checklist), `?shot=guide` (a trophy's guide open), `?shot=roadmap`, `?shot=missables` (spoiler setting on).

## Verify the list

Names, descriptions and grades were checked 19 November 2026 against [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/) (all 55 descriptions, in order) and [planetgta6](https://www.planetgta6.com/en/gta-6-trophies/) (all 55 names and grades, cross-checked there against Exophase, PSNProfiles and TrueAchievements). Counts such as "42 Shooting Range challenges" are the progress targets PlayStation tracks, as listed by [PSNProfiles](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi).

## Layout

- `app/index.html` — the page: header, progress, filters, tabs, checklist, detail pane
- `app/app.js` — boot, rendering, roadmap / missables / sources pages, `?shot=` scenes
- `app/store.js` — localStorage progress, settings, JSON export / import
- `app/filters.js` — grade / kind / status / search filtering and the spoiler rule
- `app/style.css` — the look (system fonts only)
- `app/data/trophies.json` — the 55 trophies: official name, description, grade, hidden flag, kind, missable flag, PSN count where tracked, guide and sources
- `main.ts` — the entry program: copies `app/` and `screenshots/` to `/output` and writes `dossier.json` with the vendored make.fun library
- `screenshots/` — 4 real renders of the app in headless Chromium, 1280×720

## License

MIT — see [LICENSE](LICENSE). Unofficial and fan-made; Grand Theft Auto and GTA are trademarks of Rockstar Games.
