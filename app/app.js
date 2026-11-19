// Leonida Platinum boot: renders the checklist, detail pane, roadmap, missables and sources pages.
import { loadEarned, saveEarned, loadSettings, saveSettings, exportProgress, parseImportedProgress, downloadText } from './store.js';
import { filterTrophies, isSpoilerHidden, spoilerName, spoilerDescription, kindLabel } from './filters.js';

const ROADMAP = [
  { title: 'Stage 1 — Play the story', text: 'Chapters 1–4, the named story missions and the final mission. 13 trophies, all story-gated. Make a manual save at the start of every chapter and one more before the final mission: no mission replay has been reported for GTA VI.', ids: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] },
  { title: 'Stage 2 — Strangers & side missions', text: 'Finish the stranger strands — Andy, Kenton, Billy, Randy, Tyrone and Bret — and 8 strands in total. Do them as they appear, before the chapter they belong to ends.', ids: [22, 23, 24, 25, 26, 27, 29] },
  { title: 'Stage 3 — Explore Leonida', text: 'All 52 areas, 100 vehicles discovered, 10 registered to Scooter Bros, meditation spots and WAiNK It photos. One long sweep of the map covers four trophies at once.', ids: [42, 35, 55, 28, 31] },
  { title: 'Stage 4 — Activities & challenges', text: '250 stunts, 20 different races, drone races at all 14 locations, gold in all 42 Shooting Range challenges, 50 challenges, fishing, the arcade and bowling. Repeatable, so nothing here can be missed.', ids: [15, 19, 18, 17, 32, 20, 21, 16, 46, 51] },
  { title: 'Stage 5 — Robberies, money & cleanup', text: '5 bank vaults, an armored truck, a jewelry store undetected, one illegal operation per gang, $250,000 laundered, $100,000 spent, all 8 garages. Robberies feed the laundering total, so do them together.', ids: [40, 41, 39, 43, 52, 53, 54] },
  { title: 'Stage 6 — The odds and ends, then the platinum', text: 'Partner wanted-level escapes, Combat Focus, the airport departure, the showroom smash, the Ocean Beach cocktail and the strange sights. Last of all: 100% completion, the second gold, and the platinum itself.', ids: [33, 34, 36, 37, 38, 44, 45, 47, 48, 49, 50, 30, 14, 1] },
];

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));

let earned = loadEarned();
let settings = loadSettings();
let view = 'checklist';
let selectedId = null;

const $ = (id) => document.getElementById(id);
const listEl = $('trophyList');
const detailEl = $('detail');
const countLine = $('countLine');

const filters = { search: '', grade: 'all', kind: 'all', status: 'all' };

function gradeCountsText() {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of trophies) if (earned.has(t.name)) counts[t.grade]++;
  return `Platinum ${counts.platinum}/1 · Gold ${counts.gold}/2 · Silver ${counts.silver}/6 · Bronze ${counts.bronze}/46`;
}

function renderProgress() {
  $('earnedCount').textContent = String(earned.size);
  $('barFill').style.width = `${Math.round((earned.size / trophies.length) * 100)}%`;
  $('gradeCounts').textContent = gradeCountsText();
}

function trophyRow(trophy) {
  const li = document.createElement('li');
  li.className = 'trophy' + (earned.has(trophy.name) ? ' earned' : '') + (selectedId === trophy.id ? ' selected' : '');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(trophy.name);
  box.setAttribute('aria-label', `Earned: ${spoilerName(trophy, settings.spoiler, earned)}`);
  box.addEventListener('change', (event) => {
    event.stopPropagation();
    toggleEarned(trophy);
  });
  const body = document.createElement('div');
  const title = document.createElement('h3');
  title.textContent = spoilerName(trophy, settings.spoiler, earned);
  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = spoilerDescription(trophy, settings.spoiler, earned);
  const meta = document.createElement('p');
  meta.className = 'meta';
  meta.textContent = `${kindLabel(trophy.kind)}${trophy.count ? ` · PSN tracks ${trophy.count.toLocaleString('en-US')} ${trophy.countLabel}` : ''}${trophy.hidden ? ' · hidden on PSN' : ''}`;
  body.append(title, desc, meta);
  const badges = document.createElement('div');
  const grade = document.createElement('span');
  grade.className = `grade ${trophy.grade}`;
  grade.textContent = trophy.grade;
  badges.append(grade);
  if (trophy.missable) {
    const flag = document.createElement('span');
    flag.className = 'flag';
    flag.textContent = 'Missable — save first';
    badges.append(flag);
  }
  if (trophy.hidden) {
    const flag = document.createElement('span');
    flag.className = 'flag hidden-flag';
    flag.textContent = 'Hidden';
    badges.append(flag);
  }
  li.append(box, body, badges);
  li.addEventListener('click', (event) => {
    if (event.target !== box) selectTrophy(trophy.id);
  });
  return li;
}

function renderList() {
  const shown = filterTrophies(trophies, filters, earned);
  listEl.replaceChildren(...shown.map(trophyRow));
  countLine.textContent = `Showing ${shown.length} of ${trophies.length} trophies · ${earned.size} earned · ${trophies.filter((t) => t.missable).length} flagged missable · 28 hidden on PlayStation`;
}

function renderDetail() {
  const trophy = selectedId === null ? null : byId.get(selectedId);
  if (!trophy) {
    detailEl.innerHTML = '';
    const p = document.createElement('p');
    p.className = 'empty';
    p.textContent = 'Pick a trophy on the left to read its guide and sources.';
    detailEl.append(p);
    return;
  }
  detailEl.innerHTML = '';
  const hidden = isSpoilerHidden(trophy, settings.spoiler, earned);
  const h2 = document.createElement('h2');
  h2.textContent = spoilerName(trophy, settings.spoiler, earned);
  const badges = document.createElement('p');
  const grade = document.createElement('span');
  grade.className = `grade ${trophy.grade}`;
  grade.textContent = trophy.grade;
  badges.append(grade);
  const kind = document.createElement('span');
  kind.className = 'flag hidden-flag';
  kind.textContent = kindLabel(trophy.kind);
  badges.append(kind);
  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = hidden ? 'Official description hidden until earned.' : `Official description: “${trophy.description}”`;
  detailEl.append(h2, badges, official);
  if (trophy.count) {
    const count = document.createElement('p');
    count.textContent = `PSN progress target: ${trophy.count.toLocaleString('en-US')} ${trophy.countLabel}.`;
    detailEl.append(count);
  }
  if (trophy.missable) {
    const warn = document.createElement('div');
    warn.className = 'warn';
    const h4 = document.createElement('h4');
    h4.textContent = 'Missable — save first';
    const note = document.createElement('p');
    note.textContent = trophy.missableNote ?? 'Story-gated or one-off: keep a manual save before you attempt it.';
    warn.append(h4, note);
    detailEl.append(warn);
  }
  const guideTitle = document.createElement('h4');
  guideTitle.textContent = 'Guide';
  const guide = document.createElement('p');
  guide.textContent = hidden ? 'Earn this trophy to reveal its guide — the spoiler setting hides story trophies until they are earned.' : trophy.guide;
  detailEl.append(guideTitle, guide);
  const srcTitle = document.createElement('h4');
  srcTitle.textContent = 'Sources';
  const list = document.createElement('ul');
  for (const source of trophy.sources) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = source.url;
    link.textContent = source.name;
    link.target = '_blank';
    link.rel = 'noopener';
    item.append(link);
    list.append(item);
  }
  detailEl.append(srcTitle, list);
}

function renderRoadmap() {
  const page = document.createElement('div');
  page.className = 'page';
  const h2 = document.createElement('h2');
  h2.textContent = 'Roadmap to the platinum';
  const intro = document.createElement('p');
  intro.textContent = 'Six stages, in order. Story first — everything story-gated is done while the chapters are open — then strangers, exploration, activities, robberies and money, and the odd one-offs last. The platinum, Vice Got a Price!, pops when the other 54 are earned.';
  page.append(h2, intro);
  for (const stage of ROADMAP) {
    const block = document.createElement('div');
    block.className = 'stage';
    const h3 = document.createElement('h3');
    h3.textContent = stage.title;
    const p = document.createElement('p');
    p.textContent = stage.text;
    const names = document.createElement('p');
    names.className = 'trophies-in-stage';
    names.textContent = stage.ids.map((id) => {
      const t = byId.get(id);
      return `${t.name} (${t.grade})${earned.has(t.name) ? ' ✓' : ''}`;
    }).join(' · ');
    block.append(h3, p, names);
    page.append(block);
  }
  return page;
}

function renderMissables() {
  const page = document.createElement('div');
  page.className = 'page';
  const h2 = document.createElement('h2');
  h2.textContent = 'Missable trophies — flagged, honestly';
  const notice = document.createElement('p');
  notice.className = 'notice';
  notice.textContent = 'No trophy is confirmed missable as of 19 November 2026: planetgta6 reports “we can’t tell yet” and says there is no reliable missable list so far. What is reported is that GTA VI has no mission replay (Output Lag), so a story moment you pass cannot be replayed. The flags below mean “story-gated or one-off — keep a manual save”, not “confirmed missable”.';
  page.append(h2, notice);
  const groups = [
    { title: 'Story chapters & missions (12)', ids: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], note: 'Finish the chapters and the named missions while they are open. Save at the start of every chapter.' },
    { title: 'Stranger strand finales (6)', ids: [22, 23, 24, 26, 27, 29], note: 'The last mission of a stranger’s strand. Finish each strand before its chapter ends.' },
    { title: 'One-off moments (4)', ids: [37, 44, 45, 46], note: 'A departure, a cocktail, a showroom exit and a bowling frame. Do them when you are there; save first.' },
  ];
  for (const group of groups) {
    const h3 = document.createElement('h3');
    h3.textContent = group.title;
    const note = document.createElement('p');
    note.textContent = group.note;
    const list = document.createElement('ul');
    for (const id of group.ids) {
      const t = byId.get(id);
      const item = document.createElement('li');
      item.textContent = `${t.name} — ${earned.has(t.name) ? 'earned ✓' : 'not earned yet'} — ${t.missableNote ?? ''}`;
      list.append(item);
    }
    page.append(h3, note, list);
  }
  const save = document.createElement('p');
  save.textContent = 'The safety net that covers all of them: manual saves at the start of every chapter, one before the final mission, and one before any one-off moment. Cheats disable trophies (reported by PowerPyx, via planetgta6), so keep cheats off until the platinum is earned.';
  page.append(save);
  return page;
}

function renderSources() {
  const page = document.createElement('div');
  page.className = 'page';
  const h2 = document.createElement('h2');
  h2.textContent = 'Sources & method';
  const intro = document.createElement('p');
  intro.textContent = 'Every trophy name, description and grade is the official PlayStation list as published on Exophase and cross-checked by planetgta6 against PSNProfiles and TrueAchievements. Every guide on this site is written in our own words for this guide; a source is cited beside each trophy, never copied. Counts (such as 42 Shooting Range challenges) are the progress targets PlayStation tracks, as listed by PSNProfiles. Where no cited source pins a place or a step down, the guide says so instead of inventing one.';
  page.append(h2, intro);
  const list = document.createElement('ul');
  for (const source of doc.sources) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = source.url;
    link.textContent = source.name;
    link.target = '_blank';
    link.rel = 'noopener';
    item.append(link);
    list.append(item);
  }
  const note = document.createElement('p');
  note.textContent = 'This guide is unofficial and fan-made. It uses no Rockstar Games logo, artwork, box art or game screenshots. Grand Theft Auto and GTA are trademarks of Rockstar Games; the trophy names and descriptions are shown as PlayStation publishes them.';
  page.append(list, note);
  return page;
}

function renderView() {
  const checklist = $('view-checklist');
  const pageView = $('view-page');
  document.querySelectorAll('.tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.view === view));
  $('toolbar').style.display = view === 'checklist' ? '' : 'none';
  if (view === 'checklist') {
    checklist.style.display = '';
    pageView.style.display = 'none';
    renderList();
    renderDetail();
  } else {
    checklist.style.display = 'none';
    pageView.style.display = '';
    const page = view === 'roadmap' ? renderRoadmap() : view === 'missables' ? renderMissables() : renderSources();
    pageView.replaceChildren(page);
  }
}

function toggleEarned(trophy) {
  if (earned.has(trophy.name)) earned.delete(trophy.name);
  else earned.add(trophy.name);
  saveEarned(earned);
  renderProgress();
  renderList();
  renderDetail();
}

function selectTrophy(id) {
  selectedId = id;
  renderList();
  renderDetail();
}

function setView(next) {
  view = next;
  renderView();
}

document.querySelectorAll('.tab').forEach((tab) => tab.addEventListener('click', () => setView(tab.dataset.view)));
$('search').addEventListener('input', (e) => { filters.search = e.target.value; renderList(); });
$('gradeFilter').addEventListener('change', (e) => { filters.grade = e.target.value; renderList(); });
$('kindFilter').addEventListener('change', (e) => { filters.kind = e.target.value; renderList(); });
$('statusFilter').addEventListener('change', (e) => { filters.status = e.target.value; renderList(); });
$('spoilerToggle').checked = settings.spoiler;
$('spoilerToggle').addEventListener('change', (e) => {
  settings.spoiler = e.target.checked;
  saveSettings(settings);
  renderList();
  renderDetail();
});
$('exportBtn').addEventListener('click', () => downloadText('gta6-trophy-progress.json', exportProgress(earned, settings)));
$('importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const parsed = parseImportedProgress(await file.text(), trophies.map((t) => t.name));
    earned = parsed.earned;
    if (parsed.settings) {
      settings = parsed.settings;
      $('spoilerToggle').checked = settings.spoiler;
      saveSettings(settings);
    }
    saveEarned(earned);
    renderProgress();
    renderView();
  } catch (err) {
    alert(`Import failed: ${err.message}`);
  }
  e.target.value = '';
});
$('resetBtn').addEventListener('click', () => {
  if (!confirm('Clear all earned trophies?')) return;
  earned = new Set();
  saveEarned(earned);
  renderProgress();
  renderView();
});

// Deterministic screenshot scenes: ?shot=cover | guide | roadmap | missables
const shot = new URLSearchParams(location.search).get('shot');
if (shot === 'cover') {
  selectedId = 1;
} else if (shot === 'guide') {
  selectedId = 17;
} else if (shot === 'roadmap') {
  view = 'roadmap';
} else if (shot === 'missables') {
  view = 'missables';
  settings.spoiler = true;
  $('spoilerToggle').checked = true;
}
renderProgress();
renderView();
