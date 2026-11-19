// Filters and the spoiler rule: which trophies a view shows, and what a hidden story trophy looks like until earned.
export function trophyMatches(trophy, filters, earned) {
  if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
  if (filters.kind === 'missable') {
    if (!trophy.missable) return false;
  } else if (filters.kind !== 'all' && trophy.kind !== filters.kind) {
    return false;
  }
  if (filters.status === 'earned' && !earned.has(trophy.name)) return false;
  if (filters.status === 'remaining' && earned.has(trophy.name)) return false;
  if (filters.search) {
    const hay = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
    if (!hay.includes(filters.search.toLowerCase())) return false;
  }
  return true;
}

export function filterTrophies(trophies, filters, earned) {
  return trophies.filter((t) => trophyMatches(t, filters, earned));
}

export function isSpoilerHidden(trophy, spoilerOn, earned) {
  return spoilerOn && trophy.hidden && !earned.has(trophy.name);
}

export function spoilerName(trophy, spoilerOn, earned) {
  return isSpoilerHidden(trophy, spoilerOn, earned) ? 'Hidden story trophy' : trophy.name;
}

export function spoilerDescription(trophy, spoilerOn, earned) {
  return isSpoilerHidden(trophy, spoilerOn, earned)
    ? 'Hidden on PlayStation until earned — turn the spoiler setting off, or earn it, to reveal it.'
    : trophy.description;
}

export function kindLabel(kind) {
  const labels = {
    platinum: 'Platinum', story: 'Story', completion: '100% completion', activity: 'Activity',
    side: 'Strangers & side', collectible: 'Collectible', robbery: 'Robbery',
    money: 'Money', exploration: 'Exploration', misc: 'Other',
  };
  return labels[kind] ?? kind;
}
