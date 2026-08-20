// ToxiScan scoring engine.
// Takes an ingredient string (plus optional Open Food Facts metadata) and
// returns a 0-100 score, matched hazards, and a highlighted ingredient list.

function normalizeIngredientText(text) {
  return (text || '')
    .toLowerCase()
    .replace(/#/g, ' ')
    .replace(/\bno\.\s*/g, 'no ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Build a regex for a pattern with word boundaries where the pattern
// starts/ends with a word character (so "bha" never matches inside "bhakti").
function patternRegex(pattern, flags) {
  const esc = escapeRegex(pattern);
  const lead = /^[a-z0-9]/i.test(pattern) ? '\\b' : '';
  const tail = /[a-z0-9]$/i.test(pattern) ? '\\b' : '';
  return new RegExp(lead + esc + tail, flags || 'i');
}

function severityClass(points) {
  if (points >= 18) return 'severe';
  if (points >= 10) return 'high';
  if (points >= 5) return 'moderate';
  return 'low';
}

function severityLabel(points) {
  return { severe: 'Severe', high: 'High', moderate: 'Moderate', low: 'Low' }[severityClass(points)];
}

/**
 * Analyze an ingredient list.
 * @param {string} text - raw ingredient list
 * @param {object} [meta] - optional Open Food Facts metadata
 *   { additivesTags: ['en:e320', ...], labelsTags: ['en:organic'], categoriesTags: [] }
 * @returns {object} { score, grade, verdict, hits, carcinogenCount, bannedCount, highlightedHtml }
 */
function analyzeIngredients(text, meta) {
  meta = meta || {};
  const norm = normalizeIngredientText(text);
  const additives = (meta.additivesTags || []).map(function (t) {
    return t.replace(/^en:/, '').toLowerCase();
  });

  const hits = [];
  const seen = {};

  TOXIN_DB.forEach(function (toxin) {
    let matched = null;
    for (let i = 0; i < toxin.patterns.length; i++) {
      if (patternRegex(toxin.patterns[i]).test(norm)) { matched = toxin.patterns[i]; break; }
    }
    if (!matched && toxin.ecodes.length) {
      for (let i = 0; i < toxin.ecodes.length; i++) {
        if (additives.indexOf(toxin.ecodes[i]) !== -1) { matched = toxin.ecodes[i].toUpperCase(); break; }
        // e-codes sometimes appear inline in ingredient text, e.g. "(e320)"
        if (patternRegex(toxin.ecodes[i]).test(norm)) { matched = toxin.ecodes[i].toUpperCase(); break; }
      }
    }
    if (matched && !seen[toxin.id]) {
      seen[toxin.id] = true;
      hits.push({ toxin: toxin, matchedAs: matched });
    }
  });

  // Contextual glyphosate-risk flag: non-organic wheat/oat products
  const hasWheat = /\b(wheat|oat|oats|barley|rye)\b/.test(norm);
  const isOrganic = /\borganic\b/.test(norm) ||
    (meta.labelsTags || []).some(function (t) { return /organic/.test(t); });
  if (hasWheat && !isOrganic) {
    hits.push({ toxin: GLYPHOSATE_RISK, matchedAs: 'non-organic wheat/oats' });
  }

  let penalty = 0;
  hits.forEach(function (h) { penalty += h.toxin.points; });
  const score = Math.max(0, Math.round(100 - penalty));

  let grade, verdict;
  if (score >= 90) { grade = 'A'; verdict = 'Clean — no significant toxic ingredients found'; }
  else if (score >= 75) { grade = 'B'; verdict = 'Low concern'; }
  else if (score >= 60) { grade = 'C'; verdict = 'Moderate toxic load'; }
  else if (score >= 40) { grade = 'D'; verdict = 'High toxic load'; }
  else { grade = 'F'; verdict = 'Very high toxic load'; }

  const carcinogenCount = hits.filter(function (h) {
    return h.toxin.flags.some(function (f) { return /carcinogen|iarc|cancer/i.test(f); });
  }).length;
  const bannedCount = hits.filter(function (h) {
    return h.toxin.flags.some(function (f) { return /banned|revoked|removed from eu|withdrew/i.test(f); });
  }).length;

  // Sort worst-first for display
  hits.sort(function (a, b) { return b.toxin.points - a.toxin.points; });

  return {
    score: score,
    grade: grade,
    verdict: verdict,
    hits: hits,
    carcinogenCount: carcinogenCount,
    bannedCount: bannedCount,
    highlightedHtml: highlightMatches(text, hits)
  };
}

function escapeHtml(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function highlightMatches(text, hits) {
  const raw = text || '';
  const patterns = [];
  hits.forEach(function (h) {
    (h.toxin.patterns || []).forEach(function (p) { patterns.push(p); });
  });
  // Longest first so "potassium bromate" claims its range before "bromated"
  patterns.sort(function (a, b) { return b.length - a.length; });

  const ranges = [];
  patterns.forEach(function (p) {
    const re = patternRegex(p, 'gi');
    let m;
    while ((m = re.exec(raw)) !== null) {
      const start = m.index, end = m.index + m[0].length;
      const overlaps = ranges.some(function (r) { return start < r.end && end > r.start; });
      if (!overlaps) ranges.push({ start: start, end: end });
      if (m.index === re.lastIndex) re.lastIndex++;
    }
  });
  ranges.sort(function (a, b) { return a.start - b.start; });

  let out = '', pos = 0;
  ranges.forEach(function (r) {
    out += escapeHtml(raw.slice(pos, r.start)) +
      '<mark>' + escapeHtml(raw.slice(r.start, r.end)) + '</mark>';
    pos = r.end;
  });
  out += escapeHtml(raw.slice(pos));
  return out;
}

function scoreColor(score) {
  if (score >= 90) return 'var(--ok)';
  if (score >= 75) return 'var(--accent)';
  if (score >= 60) return 'var(--warn)';
  if (score >= 40) return '#fb923c';
  return 'var(--danger-strong)';
}
