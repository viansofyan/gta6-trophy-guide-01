// Progress store: earned trophies and settings live in localStorage, with JSON export and import.
export const PROGRESS_KEY = 'leonida-platinum-progress-v1';
export const SETTINGS_KEY = 'leonida-platinum-settings-v1';

export function loadEarned() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(list) ? list.filter((n) => typeof n === 'string') : []);
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earned]));
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return { spoiler: parsed.spoiler === true };
  } catch {
    return { spoiler: false };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function exportProgress(earned, settings) {
  return JSON.stringify({
    app: 'Leonida Platinum — GTA VI Trophy Guide',
    game: 'Grand Theft Auto VI',
    platform: 'PlayStation 5',
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort(),
    settings,
  }, null, 2);
}

export function parseImportedProgress(text, knownNames) {
  const data = JSON.parse(text);
  const names = Array.isArray(data) ? data : data.earned;
  if (!Array.isArray(names)) throw new Error('Import file has no earned list.');
  const known = new Set(knownNames);
  const earned = new Set();
  for (const name of names) {
    if (typeof name === 'string' && known.has(name)) earned.add(name);
  }
  const settings = data && typeof data === 'object' && data.settings && typeof data.settings.spoiler === 'boolean'
    ? { spoiler: data.settings.spoiler }
    : null;
  return { earned, settings };
}

export function downloadText(filename, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
