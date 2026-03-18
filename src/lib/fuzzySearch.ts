/**
 * Simple fuzzy matching: all chars of query appear in order within target.
 * Returns a match boolean and a score (lower = better).
 */
export function fuzzyMatch(
  query: string,
  target: string
): { match: boolean; score: number } {
  const q = query.toLowerCase();
  const t = target.toLowerCase();

  if (q.length === 0) return { match: true, score: 0 };
  if (q.length > t.length) return { match: false, score: Infinity };

  // Exact substring match is best
  const subIdx = t.indexOf(q);
  if (subIdx >= 0) return { match: true, score: subIdx };

  // Character-by-character fuzzy match
  let qi = 0;
  let score = 0;
  let lastMatchIdx = -1;

  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      // Penalize gaps between matched characters
      if (lastMatchIdx >= 0) {
        score += ti - lastMatchIdx - 1;
      }
      lastMatchIdx = ti;
      qi++;
    }
  }

  if (qi === q.length) {
    // Penalize if match doesn't start at beginning
    const firstCharIdx = t.indexOf(q[0]);
    if (firstCharIdx > 0) score += firstCharIdx * 2;
    return { match: true, score };
  }

  return { match: false, score: Infinity };
}

export interface Searchable {
  label: string;
  keywords?: string[];
}

/**
 * Filter and sort items by fuzzy matching against label and keywords.
 */
export function filterByFuzzy<T extends Searchable>(
  items: T[],
  query: string
): T[] {
  if (!query.trim()) return items;

  const scored = items
    .map((item) => {
      // Try matching label
      const labelResult = fuzzyMatch(query, item.label);

      // Try matching keywords
      let bestKeywordScore = Infinity;
      if (item.keywords) {
        for (const kw of item.keywords) {
          const kwResult = fuzzyMatch(query, kw);
          if (kwResult.match && kwResult.score < bestKeywordScore) {
            bestKeywordScore = kwResult.score;
          }
        }
      }

      const bestScore = Math.min(
        labelResult.match ? labelResult.score : Infinity,
        bestKeywordScore
      );

      return { item, score: bestScore, match: bestScore < Infinity };
    })
    .filter((r) => r.match)
    .sort((a, b) => a.score - b.score);

  return scored.map((r) => r.item);
}
