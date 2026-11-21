// Leonida Platinum — progress store.
// Earned trophy ids live in localStorage under one key, so progress survives
// reloads. Export writes the earned list as JSON; import reads such a file
// back and only applies it when every name in it matches a known trophy.

const STORE_KEY = 'leonida-platinum-earned-v1';
const SPOILER_KEY = 'leonida-platinum-spoiler-v1';

function loadEarned() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((n) => Number.isInteger(n)));
  } catch (_e) {
    return new Set();
  }
}

function saveEarned(earnedSet) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify([...earnedSet].sort((a, b) => a - b)));
  } catch (_e) {
    // Storage full or unavailable: progress stays in memory for this session.
  }
}

function toggleEarned(earnedSet, id) {
  const next = new Set(earnedSet);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  saveEarned(next);
  return next;
}

function loadSpoiler() {
  try {
    return localStorage.getItem(SPOILER_KEY) === '1';
  } catch (_e) {
    return false;
  }
}

function saveSpoiler(on) {
  try {
    localStorage.setItem(SPOILER_KEY, on ? '1' : '0');
  } catch (_e) {
    // Ignore: spoiler setting stays in memory for this session.
  }
}

// Download the earned list as JSON: [{id, name}, ...] in id order.
function exportEarned(trophies, earnedSet) {
  const rows = trophies
    .filter((t) => earnedSet.has(t.id))
    .map((t) => ({ id: t.id, name: t.name }));
  const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leonida-platinum-earned.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return rows.length;
}

// Parse an exported file and return the earned id set. Throws on any problem,
// and never applies a partial import: every name must match a known trophy.
function importEarned(fileText, trophies) {
  const knownByName = new Map(trophies.map((t) => [t.name, t.id]));
  let parsed;
  try {
    parsed = JSON.parse(fileText);
  } catch (_e) {
    throw new Error('Import file is not valid JSON.');
  }
  if (!Array.isArray(parsed)) throw new Error('Import file must contain a list.');
  const ids = new Set();
  for (const entry of parsed) {
    const name = typeof entry === 'string' ? entry : entry && entry.name;
    if (typeof name !== 'string' || !knownByName.has(name)) {
      throw new Error('Unknown trophy name in import: ' + String(name));
    }
    ids.add(knownByName.get(name));
  }
  return ids;
}
