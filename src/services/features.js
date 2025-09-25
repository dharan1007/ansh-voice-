// src/services/features.js

/**
 * Compute simple prosodic features from Whisper segments.
 * Segments should have { text, start, end, avg_logprob }.
 */
export function computeProsodyFeatures(segments = []) {
  if (!Array.isArray(segments) || segments.length === 0) {
    return {
      totalSegments: 0,
      avgDuration: 0,
      avgLogProb: 0,
      wordCount: 0,
    };
  }

  const totalSegments = segments.length;
  const durations = segments.map(s => (s.end - s.start) || 0);
  const avgDuration = durations.reduce((a, b) => a + b, 0) / totalSegments;

  const avgLogProb = segments.reduce((sum, s) => sum + (s.avg_logprob || 0), 0) / totalSegments;

  const wordCount = segments.reduce((sum, s) => sum + (s.text?.split(/\s+/).filter(Boolean).length || 0), 0);

  return {
    totalSegments,
    avgDuration,
    avgLogProb,
    wordCount,
  };
}

/**
 * Normalize raw scores (0–1) so they sum to 1.
 */
export function normalizeScores(scores = {}) {
  const values = Object.values(scores);
  const total = values.reduce((a, b) => a + b, 0);
  if (!total) return scores;
  const normalized = {};
  for (const k in scores) {
    normalized[k] = scores[k] / total;
  }
  return normalized;
}
