// Progress storage for the Leonida Platinum tracker: the earned set lives in
// localStorage as an array of trophy names, and export/import move that same
// list as a JSON file. Nothing here touches the network.

export const STORAGE_KEY = 'gta6-trophy-checklist';

// Read the stored earned list. Anything that is not a JSON array of strings
// is treated as no progress rather than throwing.
export function loadEarned() {
  let raw = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return new Set();
  }
  if (!raw) return new Set();
  let parsed = null;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return new Set();
  }
  if (!Array.isArray(parsed)) return new Set();
  return new Set(parsed.filter((name) => typeof name === 'string'));
}

// Persist the earned set. A storage failure (private mode, full quota) is
// swallowed: the in-memory set stays correct for this page load.
export function saveEarned(earned) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned]));
  } catch {
    // Keep going with the in-memory set; progress is not lost this session.
  }
}

// Drop all stored progress.
export function clearEarned() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing stored, nothing to clear.
  }
}

// Serialize the earned list for download.
export function exportEarned(earned) {
  return JSON.stringify([...earned].sort(), null, 2);
}

// Validate an imported file before it touches the stored set. The parsed
// value must be an array of strings, and every name must be one of the 55
// known trophies; one unknown name rejects the whole file.
export function validateImport(parsed, knownNames) {
  if (!Array.isArray(parsed)) {
    return { ok: false, reason: 'The file does not hold a list.' };
  }
  for (const name of parsed) {
    if (typeof name !== 'string') {
      return { ok: false, reason: 'The list holds something that is not a trophy name.' };
    }
    if (!knownNames.has(name)) {
      return { ok: false, reason: 'Unknown trophy in the file: ' + name };
    }
  }
  return { ok: true, names: [...parsed] };
}
