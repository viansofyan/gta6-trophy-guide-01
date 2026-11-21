// Leonida Platinum — filtering and spoiler masking (pure functions, no DOM).
// A trophy is masked when the spoiler setting is on, the trophy is hidden,
// and it has not been earned yet: its name, description and guide stay hidden
// until it is earned. Masked trophies never match a search query, so a search
// cannot leak a hidden name.

const KIND_LABELS = {
  platinum: 'Platinum',
  story: 'Story',
  completion: 'Completion',
  activity: 'Activity',
  side: 'Strangers & side',
  collectible: 'Collectible',
  misc: 'Misc',
  robbery: 'Robbery',
  exploration: 'Exploration',
  money: 'Money',
};

function isMasked(trophy, spoilerOn, earnedSet) {
  return spoilerOn && trophy.hidden && !earnedSet.has(trophy.id);
}

function displayName(trophy, spoilerOn, earnedSet) {
  return isMasked(trophy, spoilerOn, earnedSet) ? 'Hidden Trophy' : trophy.name;
}

function displayDescription(trophy, spoilerOn, earnedSet) {
  return isMasked(trophy, spoilerOn, earnedSet)
    ? 'Hidden trophy — earn it to reveal its description.'
    : trophy.description;
}

function displayGuide(trophy, spoilerOn, earnedSet) {
  return isMasked(trophy, spoilerOn, earnedSet)
    ? 'Hidden trophy — earn it to reveal the guide.'
    : trophy.guide;
}

// filters: { grade, kind, status, query, spoilerOn, earnedSet }
// grade: 'all' | 'platinum' | 'gold' | 'silver' | 'bronze'
// kind: 'all' | any kind label key | 'missable' (the 22 flagged trophies)
// status: 'all' | 'earned' | 'unearned'
// query: free text, matched against name + description + guide.
function filterTrophies(trophies, filters) {
  const q = (filters.query || '').trim().toLowerCase();
  return trophies.filter((t) => {
    if (filters.grade !== 'all' && t.grade !== filters.grade) return false;
    if (filters.kind === 'missable') {
      if (!t.missable) return false;
    } else if (filters.kind !== 'all' && t.kind !== filters.kind) {
      return false;
    }
    const earned = filters.earnedSet.has(t.id);
    if (filters.status === 'earned' && !earned) return false;
    if (filters.status === 'unearned' && earned) return false;
    if (q) {
      if (isMasked(t, filters.spoilerOn, filters.earnedSet)) return false;
      const hay = (t.name + ' ' + t.description + ' ' + t.guide).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function gradeCounts(trophies, earnedSet) {
  const out = {};
  for (const t of trophies) {
    if (!out[t.grade]) out[t.grade] = { earned: 0, total: 0 };
    out[t.grade].total += 1;
    if (earnedSet.has(t.id)) out[t.grade].earned += 1;
  }
  return out;
}
