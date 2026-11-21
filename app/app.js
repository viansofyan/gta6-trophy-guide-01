// Leonida Platinum: a GTA VI trophy guide and tracker. Static files only,
// no network at run time: the trophy list comes from data/trophies.json and
// progress lives in localStorage.
import {
  STORAGE_KEY,
  loadEarned,
  saveEarned,
  clearEarned,
  exportEarned,
  validateImport,
} from './store.js';
import {
  GRADES,
  displayName,
  displayDescription,
  isSpoiled,
  visibleTrophies,
  gradeCounts,
} from './filters.js';

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const byId = new Map(trophies.map((trophy) => [trophy.id, trophy]));
const knownNames = new Set(trophies.map((trophy) => trophy.name));

// The six roadmap stages, in the order to play them, each naming the
// trophies it covers. The platinum itself is the finale, not a stage.
const STAGES = [
  {
    title: '1. Story',
    text: 'Play the campaign in order, chapters 1 to 4 and the final mission. Every story trophy sits on this path, so keep a manual save before each mission in case a beat only comes once.',
    ids: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  },
  {
    title: '2. Strangers and side content',
    text: 'Meet the strangers of Leonida and finish their strands. Eight strands earn the silver; the named strangers each have a final mission of their own.',
    ids: [22, 23, 24, 25, 26, 27, 29],
  },
  {
    title: '3. Exploration',
    text: 'Cover the state: every area of Leonida, every meditation spot, and a hundred vehicles discovered. This stage is mostly travel, so fold it into the story trips.',
    ids: [42, 28, 35],
  },
  {
    title: '4. Activities',
    text: 'The repeatable fun: stunts, races, drone races, the shooting range, fishing, arcade games and challenges. The counts here are the longest grind after the story.',
    ids: [15, 16, 17, 18, 19, 20, 21, 32, 46, 51, 55],
  },
  {
    title: '5. Robberies and money',
    text: 'Shops, vaults, armored trucks, gang operations, then laundering and spending. Bring your partner for the shop runs; the wanted level has to hold for all three.',
    ids: [34, 39, 40, 41, 43, 52, 53, 54],
  },
  {
    title: '6. Odds and ends',
    text: 'Everything left: the one-off moments, the card sets, the WAiNK spots, and 100 percent completion. Sweep these last, when the map is open and the story is done.',
    ids: [33, 36, 37, 38, 44, 45, 47, 48, 49, 50, 30, 31, 14],
  },
];

// The 22 missable trophies, grouped so the risky ones are easy to scan.
const MISSABLE_GROUPS = [
  { title: 'Story missions', ids: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] },
  { title: 'Strangers and freaks', ids: [22, 23, 24, 26, 27, 29] },
  { title: 'One-off moments', ids: [37, 44, 45, 46] },
];

const MISSABLE_NOTE =
  'No trophy is confirmed missable as of 19 November 2026. The flags below mean story-gated or one-off: a mission or moment that may not come back, so keep a manual save before it. The game has no mission replay or New Game Plus as far as the cited sources report.';

// The cover shot seeds 13 earned trophies: the platinum and the story run.
const COVER_SEED = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

let earned = loadEarned();
let tab = 'checklist';
let detailId = null;
let spoilerOn = false;
let demo = false;
const filters = { grade: 'all', kind: 'all', status: 'all', query: '' };

// Shot scenes: the app reads a shot query parameter so screenshots can open
// a fixed view. Cover seeds 13 earned and opens the platinum detail;
// guide opens one trophy's guide; roadmap and missables open their tabs,
// missables with the spoiler setting on.
const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot === 'cover') {
  demo = true;
  earned = new Set(COVER_SEED.map((id) => byId.get(id).name));
  detailId = 1;
} else if (shot === 'guide') {
  demo = true;
  detailId = 17;
} else if (shot === 'roadmap') {
  demo = true;
  tab = 'roadmap';
} else if (shot === 'missables') {
  demo = true;
  tab = 'missables';
  spoilerOn = true;
}

const $ = (id) => document.getElementById(id);

function toggleOne(trophy) {
  if (earned.has(trophy.name)) earned.delete(trophy.name);
  else earned.add(trophy.name);
  // Persist in demo mode too: a toggle in a shot scene is still real
  // progress, and the seeded cover set must survive a reload.
  saveEarned(earned);
  render();
}

function openDetail(id) {
  detailId = id;
  render();
}

function closeDetail() {
  detailId = null;
  render();
}

function gradeBadge(grade) {
  const marks = { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' };
  return marks[grade] ?? '?';
}

function renderHeader() {
  const counts = gradeCounts(trophies, earned);
  $('progress').textContent = earned.size + ' of ' + trophies.length + ' earned';
  $('gradecounts').textContent = GRADES.map(
    (grade) => grade[0].toUpperCase() + grade.slice(1) + ' ' + counts[grade].got + '/' + counts[grade].total,
  ).join(' · ');
  $('barfill').style.width = Math.round((earned.size / trophies.length) * 100) + '%';
}

function renderChecklist() {
  const rows = $('rows');
  rows.replaceChildren();
  for (const trophy of visibleTrophies(trophies, earned, filters)) {
    const tr = document.createElement('tr');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(trophy.name);
    box.setAttribute('aria-label', 'Earned: ' + displayName(trophy, earned, spoilerOn));
    box.addEventListener('change', () => toggleOne(trophy));
    const checkCell = document.createElement('td');
    checkCell.append(box);
    const nameCell = document.createElement('td');
    nameCell.textContent = displayName(trophy, earned, spoilerOn);
    if (trophy.hidden) {
      const hidden = document.createElement('span');
      hidden.className = 'tag';
      hidden.textContent = 'Hidden';
      nameCell.append(' ', hidden);
    }
    if (trophy.missable) {
      const missable = document.createElement('span');
      missable.className = 'tag missable';
      missable.textContent = 'Missable';
      nameCell.append(' ', missable);
    }
    const descCell = document.createElement('td');
    descCell.textContent = displayDescription(trophy, earned, spoilerOn);
    const gradeCell = document.createElement('td');
    gradeCell.textContent = gradeBadge(trophy.grade) + ' ' + trophy.grade;
    tr.append(checkCell, nameCell, descCell, gradeCell);
    tr.addEventListener('click', (event) => {
      if (event.target !== box) openDetail(trophy.id);
    });
    rows.append(tr);
  }
  const shown = visibleTrophies(trophies, earned, filters).length;
  $('rowcount').textContent = shown + ' of ' + trophies.length + ' shown';
}

function renderDetail() {
  const pane = $('detail');
  pane.replaceChildren();
  if (detailId === null) {
    const hint = document.createElement('p');
    hint.className = 'detail-hint';
    hint.textContent = 'Click a trophy to see its guide, its progress count and its sources.';
    pane.append(hint);
    return;
  }
  const trophy = byId.get(detailId);
  const title = document.createElement('h2');
  title.textContent = displayName(trophy, earned, spoilerOn);
  const meta = document.createElement('p');
  meta.className = 'detail-meta';
  meta.textContent = gradeBadge(trophy.grade) + ' ' + trophy.grade + ' · ' + trophy.kind
    + (trophy.missable ? ' · Missable' : '') + (trophy.hidden ? ' · Hidden' : '');
  const desc = document.createElement('p');
  desc.textContent = displayDescription(trophy, earned, spoilerOn);
  pane.append(title, meta, desc);
  if (isSpoiled(trophy, earned, spoilerOn)) {
    const masked = document.createElement('p');
    masked.textContent = 'Earn this trophy to reveal its guide.';
    pane.append(masked);
  } else {
    const guide = document.createElement('p');
    guide.className = 'guide';
    guide.textContent = trophy.guide;
    pane.append(guide);
    if (trophy.count !== undefined) {
      const count = document.createElement('p');
      count.className = 'count';
      count.textContent = 'PSN progress target: ' + trophy.count.toLocaleString('en-US');
      pane.append(count);
    }
    const sourceTitle = document.createElement('h3');
    sourceTitle.textContent = 'Sources';
    const sourceList = document.createElement('ul');
    for (const source of trophy.sources) {
      const item = document.createElement('li');
      item.textContent = source;
      sourceList.append(item);
    }
    pane.append(sourceTitle, sourceList);
  }
  const close = document.createElement('button');
  close.type = 'button';
  close.textContent = 'Close';
  close.addEventListener('click', closeDetail);
  pane.append(close);
}

function renderRoadmap() {
  const wrap = $('roadmap');
  wrap.replaceChildren();
  for (const stage of STAGES) {
    const section = document.createElement('section');
    section.className = 'stage';
    const title = document.createElement('h2');
    title.textContent = stage.title;
    const text = document.createElement('p');
    text.textContent = stage.text;
    const list = document.createElement('ul');
    let got = 0;
    for (const id of stage.ids) {
      const trophy = byId.get(id);
      if (earned.has(trophy.name)) got += 1;
      const item = document.createElement('li');
      item.textContent = displayName(trophy, earned, spoilerOn)
        + (earned.has(trophy.name) ? ' ✓' : '');
      list.append(item);
    }
    const progress = document.createElement('p');
    progress.className = 'stage-progress';
    progress.textContent = got + ' of ' + stage.ids.length + ' earned';
    section.append(title, text, list, progress);
    wrap.append(section);
  }
  const finale = document.createElement('section');
  finale.className = 'stage-end';
  const finaleTitle = document.createElement('h2');
  finaleTitle.textContent = 'Finale: the platinum';
  const finaleText = document.createElement('p');
  finaleText.textContent = 'Vice Got a Price! unlocks when the other 54 are earned. There is nothing left to do at this point but collect it.';
  const finaleProgress = document.createElement('p');
  finaleProgress.className = 'stage-progress';
  finaleProgress.textContent = (earned.has(byId.get(1).name) ? '1' : '0') + ' of 1 earned';
  finale.append(finaleTitle, finaleText, finaleProgress);
  wrap.append(finale);
}

function renderMissables() {
  const wrap = $('missables');
  wrap.replaceChildren();
  const note = document.createElement('p');
  note.className = 'honesty-note';
  note.textContent = MISSABLE_NOTE;
  wrap.append(note);
  for (const group of MISSABLE_GROUPS) {
    const heading = document.createElement('h2');
    heading.textContent = group.title;
    const list = document.createElement('ul');
    for (const id of group.ids) {
      const trophy = byId.get(id);
      const item = document.createElement('li');
      item.textContent = displayName(trophy, earned, spoilerOn)
        + ' — ' + displayDescription(trophy, earned, spoilerOn);
      list.append(item);
    }
    wrap.append(heading, list);
  }
}

function renderSources() {
  const wrap = $('sources');
  wrap.replaceChildren();
  const method = document.createElement('p');
  method.textContent = 'Method: every name, description and grade is the official PlayStation 5 list as Exophase and PSNProfiles published it on 18 November 2026, the two agreeing on all 55. Each guide is written in our own words from the official description and the cited pages; where a place or step is not pinned down by a cited source, the guide says so instead of inventing one. Missable flags mean story-gated or one-off, built from the official descriptions.';
  wrap.append(method);
  const heading = document.createElement('h2');
  heading.textContent = 'Sources';
  const list = document.createElement('ul');
  for (const source of doc.sources) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = source.url;
    link.textContent = source.name + ' — ' + source.url;
    link.target = '_blank';
    link.rel = 'noopener';
    item.append(link);
    list.append(item);
  }
  wrap.append(heading, list);
  const disclaimer = document.createElement('p');
  disclaimer.className = 'disclaimer';
  disclaimer.textContent = 'Fan-made disclaimer: this is an unofficial fan guide, not affiliated with Rockstar Games or PlayStation. Grand Theft Auto and GTA are trademarks of Take-Two Interactive.';
  wrap.append(disclaimer);
}

function renderTabs() {
  for (const button of document.querySelectorAll('[data-tab]')) {
    button.classList.toggle('active', button.dataset.tab === tab);
    button.setAttribute('aria-selected', button.dataset.tab === tab ? 'true' : 'false');
  }
  $('tab-checklist').hidden = tab !== 'checklist';
  $('tab-roadmap').hidden = tab !== 'roadmap';
  $('tab-missables').hidden = tab !== 'missables';
  $('tab-sources').hidden = tab !== 'sources';
}

function render() {
  renderHeader();
  renderTabs();
  if (tab === 'checklist') {
    renderChecklist();
    renderDetail();
  } else if (tab === 'roadmap') {
    renderRoadmap();
  } else if (tab === 'missables') {
    renderMissables();
  } else if (tab === 'sources') {
    renderSources();
  }
}

function setStatus(message) {
  $('status').textContent = message;
}

for (const button of document.querySelectorAll('[data-tab]')) {
  button.addEventListener('click', () => {
    tab = button.dataset.tab;
    render();
  });
}

$('grade').addEventListener('change', (event) => {
  filters.grade = event.target.value;
  render();
});
$('kind').addEventListener('change', (event) => {
  filters.kind = event.target.value;
  render();
});
$('status-filter').addEventListener('change', (event) => {
  filters.status = event.target.value;
  render();
});
$('search').addEventListener('input', (event) => {
  filters.query = event.target.value;
  render();
});
$('spoiler').checked = spoilerOn;
$('spoiler').addEventListener('change', (event) => {
  spoilerOn = event.target.checked;
  render();
});
$('export').addEventListener('click', () => {
  const blob = new Blob([exportEarned(earned)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'leonida-platinum-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
  setStatus('Exported ' + earned.size + ' earned trophies.');
});
$('import').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  let parsed = null;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    setStatus('Import failed: the file is not valid JSON.');
    event.target.value = '';
    return;
  }
  const result = validateImport(parsed, knownNames);
  if (!result.ok) {
    setStatus('Import failed: ' + result.reason);
    event.target.value = '';
    return;
  }
  earned = new Set(result.names);
  saveEarned(earned);
  render();
  setStatus('Imported ' + result.names.length + ' earned trophies.');
  event.target.value = '';
});
$('reset').addEventListener('click', () => {
  earned = new Set();
  clearEarned();
  render();
  setStatus('Progress reset.');
});

render();
