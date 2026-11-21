// Filtering, search and the spoiler rule for the trophy list. These are pure
// functions over the trophy array: no DOM, no storage, so the checklist,
// the roadmap and the missables page all filter the same way.

export const GRADES = ['platinum', 'gold', 'silver', 'bronze'];

export const KINDS = [
  'story',
  'completion',
  'activity',
  'side',
  'collectible',
  'misc',
  'robbery',
  'exploration',
  'money',
  'platinum',
];

// A trophy is spoiled when it is hidden, the spoiler setting is on, and it
// has not been earned yet. Spoiled trophies keep their grade and their
// checkbox, but their name, description and guide stay hidden.
export function isSpoiled(trophy, earned, spoilerOn) {
  return spoilerOn && trophy.hidden && !earned.has(trophy.name);
}

// The name the list shows for a trophy: the real name, or a placeholder
// while it is spoiled.
export function displayName(trophy, earned, spoilerOn) {
  return isSpoiled(trophy, earned, spoilerOn) ? 'Hidden trophy' : trophy.name;
}

// The description the list shows: the real one, or a placeholder while spoiled.
export function displayDescription(trophy, earned, spoilerOn) {
  return isSpoiled(trophy, earned, spoilerOn)
    ? 'Hidden until earned.'
    : trophy.description;
}

// Match one trophy against the toolbar: grade, kind (with a missable
// pseudo-kind), earned status, and the search box, which looks through the
// name, the description and the guide.
export function trophyMatches(trophy, earned, filters) {
  if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
  if (filters.kind === 'missable') {
    if (!trophy.missable) return false;
  } else if (filters.kind !== 'all' && trophy.kind !== filters.kind) {
    return false;
  }
  if (filters.status === 'earned' && !earned.has(trophy.name)) return false;
  if (filters.status === 'missing' && earned.has(trophy.name)) return false;
  const query = filters.query.trim().toLowerCase();
  if (query) {
    const haystack = (trophy.name + ' ' + trophy.description + ' ' + trophy.guide).toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  return true;
}

// The visible checklist rows for the current toolbar state.
export function visibleTrophies(trophies, earned, filters) {
  return trophies.filter((trophy) => trophyMatches(trophy, earned, filters));
}

// Earned counts per grade, for the header.
export function gradeCounts(trophies, earned) {
  const counts = {};
  for (const grade of GRADES) {
    const total = trophies.filter((trophy) => trophy.grade === grade).length;
    const got = trophies.filter(
      (trophy) => trophy.grade === grade && earned.has(trophy.name),
    ).length;
    counts[grade] = { got, total };
  }
  return counts;
}
