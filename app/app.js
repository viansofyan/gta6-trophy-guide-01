// Leonida Platinum — GTA VI trophy guide and progress tracker.
// Static app: loads app/data/trophies.json over the same origin, nothing else
// is fetched at runtime. Progress lives in localStorage via store.js.
// URL scenes for screenshots: ?shot=cover | guide | roadmap | missables.

const COVER_SEEDED_EARNED = [2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 20, 21];

const ROADMAP_STAGES = [
  { title: 'Stage 1 — Story', text: 'Play through the story first. The chapter and mission trophies land here, and the finale comes last.', ids: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] },
  { title: 'Stage 2 — Strangers and side content', text: 'Finish the stranger mission strands across Leonida, including the story-gated ones. Do these before the finale.', ids: [22, 23, 24, 25, 26, 27, 29] },
  { title: 'Stage 3 — Exploration', text: 'Sweep the map: meditation spots, card sets, WAiNK spots, vehicles, and every area of Leonida.', ids: [28, 30, 31, 35, 42] },
  { title: 'Stage 4 — Activities', text: 'Sample every activity type, then work the repeatable ones: stunts, the Shooting Range, races, and challenges.', ids: [15, 16, 17, 18, 19, 20, 21, 32, 46, 51, 55] },
  { title: 'Stage 5 — Robberies and money', text: 'Shops, vaults, armored trucks, gang operations — then launder, spend, and buy garages.', ids: [34, 39, 40, 41, 43, 52, 53, 54] },
  { title: 'Stage 6 — Odds and ends', text: 'Everything left: the misc moments and 100% completion. Then the platinum is yours.', ids: [14, 33, 36, 37, 38, 44, 45, 47, 48, 49, 50] },
];

const MISSABLE_GROUPS = [
  { title: 'Story', ids: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] },
  { title: 'Strangers and side', ids: [22, 23, 24, 26, 27, 29] },
  { title: 'One-off moments', ids: [37, 44, 45, 46] },
];

let trophies = [];
let byId = new Map();
let earned = new Set();
let spoilerOn = false;
let demoMode = false;
let selectedId = null;
let sources = [];
let gameMeta = {};

const filters = { grade: 'all', kind: 'all', status: 'all', query: '' };

function $(id) {
  return document.getElementById(id);
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function trophyRow(t) {
  const isEarned = earned.has(t.id);
  const masked = isMasked(t, spoilerOn, earned);
  const name = esc(displayName(t, spoilerOn, earned));
  const desc = esc(displayDescription(t, spoilerOn, earned));
  const markers = [];
  if (t.hidden) markers.push('<span class="marker">Hidden</span>');
  if (t.missable) markers.push('<span class="marker missable">Missable</span>');
  if (t.count) markers.push('<span class="marker">PSN target: ' + t.count + '</span>');
  return (
    '<article class="row' + (isEarned ? ' earned' : '') + (selectedId === t.id ? ' selected' : '') + '" data-id="' + t.id + '">' +
    '<label class="check"><input type="checkbox" data-check="' + t.id + '"' + (isEarned ? ' checked' : '') + ' aria-label="Earned: ' + name + '"></label>' +
    '<div class="row-body"><div class="row-head"><span class="grade grade-' + t.grade + '">' + t.grade + '</span>' +
    '<span class="tname">' + name + '</span>' + markers.join('') + '</div>' +
    '<p class="tdesc">' + desc + '</p></div></article>'
  );
}

function renderProgress() {
  const total = trophies.length;
  const done = trophies.filter((t) => earned.has(t.id)).length;
  $('progress-text').textContent = done + ' of ' + total + ' earned';
  $('progress-fill').style.width = total ? Math.round((done / total) * 100) + '%' : '0%';
  const counts = gradeCounts(trophies, earned);
  $('grade-counts').textContent = ['platinum', 'gold', 'silver', 'bronze']
    .filter((g) => counts[g])
    .map((g) => g + ' ' + counts[g].earned + '/' + counts[g].total)
    .join(' · ');
}

function renderChecklist() {
  const list = filterTrophies(trophies, { ...filters, spoilerOn, earnedSet: earned });
  $('checklist').innerHTML = list.map(trophyRow).join('') || '<p class="empty">No trophies match these filters.</p>';
  $('result-count').textContent = list.length + ' of ' + trophies.length + ' shown';
  renderDetail();
}

function renderDetail() {
  const pane = $('detail');
  const t = selectedId != null ? byId.get(selectedId) : null;
  if (!t) {
    pane.innerHTML = '<p class="empty">Click a trophy row to see its guide, progress target, and sources.</p>';
    return;
  }
  const masked = isMasked(t, spoilerOn, earned);
  const name = esc(displayName(t, spoilerOn, earned));
  const desc = esc(displayDescription(t, spoilerOn, earned));
  const guide = esc(displayGuide(t, spoilerOn, earned));
  const countLine = t.count ? '<p><strong>PSN progress target:</strong> ' + t.count + '</p>' : '';
  const srcLine = masked
    ? ''
    : '<p><strong>Sources:</strong> ' + t.sources.map(esc).join(', ') + '</p>';
  pane.innerHTML =
    '<h3>' + name + '</h3>' +
    '<p><span class="grade grade-' + t.grade + '">' + t.grade + '</span> ' + desc + '</p>' +
    '<p><strong>Guide:</strong> ' + guide + '</p>' +
    countLine + srcLine +
    '<p><button id="detail-toggle" type="button">' + (earned.has(t.id) ? 'Mark as not earned' : 'Mark as earned') + '</button></p>';
  const btn = $('detail-toggle');
  if (btn) btn.addEventListener('click', () => toggleOne(t.id));
}

function toggleOne(id) {
  const next = new Set(earned);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  earned = next;
  // Demo scene (screenshot cover): keep the seeded set in memory only.
  if (!demoMode) saveEarned(earned);
  renderProgress();
  renderChecklist();
}

function renderRoadmap() {
  $('roadmap').innerHTML = ROADMAP_STAGES.map((stage, i) => {
    const items = stage.ids
      .map((id) => byId.get(id))
      .filter(Boolean)
      .map((t) => {
        const done = earned.has(t.id);
        return '<li class="' + (done ? 'done' : '') + '">' + esc(displayName(t, spoilerOn, earned)) + ' <span class="grade grade-' + t.grade + '">' + t.grade + '</span></li>';
      })
      .join('');
    return '<section class="stage"><h3>' + esc(stage.title) + '</h3><p>' + esc(stage.text) + '</p><ul>' + items + '</ul></section>';
  }).join('') +
  '<section class="stage-end"><h3>Platinum — Vice Got a Price!</h3><p>Earn the other 54 trophies and the platinum unlocks. Congratulations — you are a Leonida Legend.</p></section>';
}

function renderMissables() {
  const groups = MISSABLE_GROUPS.map((g) => {
    const items = g.ids
      .map((id) => byId.get(id))
      .filter(Boolean)
      .map((t) => '<li>' + esc(displayName(t, spoilerOn, earned)) + ' <span class="grade grade-' + t.grade + '">' + t.grade + '</span></li>')
      .join('');
    return '<section class="stage"><h3>' + esc(g.title) + '</h3><ul>' + items + '</ul></section>';
  }).join('');
  $('missables-list').innerHTML = groups;
}

function renderSources() {
  const items = sources
    .map((s) => '<li><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.name) + '</a> — ' + esc(s.url) + '</li>')
    .join('');
  $('sources-list').innerHTML =
    '<h3>Method</h3>' +
    '<p>Every name, description, and grade in this guide is the verbatim official text from the kit list dated 2026-11-18. Each guide is written in our own words, grounded only in the official description and the cited source pages. Where a place or step is not pinned down by a cited source, the guide says so instead of inventing one.</p>' +
    '<h3>Sources</h3><ul>' + items + '</ul>' +
    '<h3>Disclaimer</h3><p>This is an unofficial fan-made guide. It is not affiliated with Rockstar Games or Take-Two Interactive.</p>';
}

function showTab(name) {
  for (const tab of ['checklist', 'roadmap', 'missables', 'sources']) {
    $('tab-' + tab).hidden = tab !== name;
    const btn = document.querySelector('[data-tab="' + tab + '"]');
    if (btn) btn.setAttribute('aria-selected', tab === name ? 'true' : 'false');
  }
  if (name === 'roadmap') renderRoadmap();
  if (name === 'missables') renderMissables();
  if (name === 'sources') renderSources();
}

function renderAll() {
  renderProgress();
  renderChecklist();
}

function applyShot() {
  const shot = new URLSearchParams(window.location.search).get('shot');
  if (shot === 'cover') {
    demoMode = true;
    earned = new Set(COVER_SEEDED_EARNED);
    selectedId = 1;
    showTab('checklist');
  } else if (shot === 'guide') {
    selectedId = 17;
    showTab('checklist');
  } else if (shot === 'roadmap') {
    showTab('roadmap');
  } else if (shot === 'missables') {
    spoilerOn = true;
    const toggle = $('spoiler-toggle');
    if (toggle) toggle.checked = true;
    showTab('missables');
  }
}

async function init() {
  const res = await fetch('data/trophies.json');
  if (!res.ok) throw new Error('Could not load data/trophies.json (' + res.status + ')');
  const data = await res.json();
  trophies = data.trophies;
  sources = data.sources || [];
  gameMeta = { game: data.game, platform: data.platform, list: data.list };
  byId = new Map(trophies.map((t) => [t.id, t]));
  earned = loadEarned();
  spoilerOn = loadSpoiler();
  $('spoiler-toggle').checked = spoilerOn;

  $('filter-grade').addEventListener('change', (e) => { filters.grade = e.target.value; renderChecklist(); });
  $('filter-kind').addEventListener('change', (e) => { filters.kind = e.target.value; renderChecklist(); });
  $('filter-status').addEventListener('change', (e) => { filters.status = e.target.value; renderChecklist(); });
  $('search').addEventListener('input', (e) => { filters.query = e.target.value; renderChecklist(); });
  $('spoiler-toggle').addEventListener('change', (e) => {
    spoilerOn = e.target.checked;
    saveSpoiler(spoilerOn);
    renderChecklist();
  });

  document.querySelectorAll('[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => showTab(btn.getAttribute('data-tab')));
  });

  $('checklist').addEventListener('click', (e) => {
    const check = e.target.closest('[data-check]');
    if (check) {
      toggleOne(Number(check.getAttribute('data-check')));
      return;
    }
    const row = e.target.closest('.row');
    if (row) {
      selectedId = Number(row.getAttribute('data-id'));
      renderChecklist();
    }
  });

  $('btn-export').addEventListener('click', () => {
    const n = exportEarned(trophies, earned);
    $('export-note').textContent = n + ' earned trophies exported.';
  });
  $('btn-import').addEventListener('click', () => $('import-file').click());
  $('import-file').addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const ids = importEarned(text, trophies);
      earned = ids;
      saveEarned(earned);
      $('export-note').textContent = ids.size + ' trophies imported.';
    } catch (err) {
      $('export-note').textContent = 'Import failed: ' + err.message;
    }
    e.target.value = '';
    renderAll();
  });
  $('btn-reset').addEventListener('click', () => {
    earned = new Set();
    saveEarned(earned);
    selectedId = null;
    renderAll();
  });

  applyShot();
  renderAll();
}

document.addEventListener('DOMContentLoaded', () => {
  init().catch((err) => {
    document.getElementById('checklist').innerHTML =
      '<p class="empty">Failed to load the trophy list: ' + esc(err.message) + '</p>';
  });
});
