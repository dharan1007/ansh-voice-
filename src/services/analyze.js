function stats(arr) {
  if (!arr.length) return { mean: 0, median: 0, max: 0, min: 0, std: 0 };
  const mean = arr.reduce((a,b)=>a+b,0)/arr.length;
  const sorted = [...arr].sort((a,b)=>a-b);
  const mid = Math.floor(sorted.length/2);
  const median = sorted.length%2 ? sorted[mid] : (sorted[mid-1]+sorted[mid])/2;
  const max = sorted[sorted.length-1];
  const min = sorted[0];
  const variance = arr.reduce((a,b)=>a + (b-mean)**2, 0)/arr.length;
  const std = Math.sqrt(variance);
  return { mean, median, max, min, std };
}

export function computeProsodyFeatures(segments) {
  if (!segments || !segments.length) return {};

  const s0 = segments[0];
  const sn = segments[segments.length - 1];
  const utterStart = s0.start ?? 0;
  const utterEnd = sn.end ?? 0;
  const windowMs = Math.max(0, (utterEnd - utterStart) * 1000);

  const voicedMs = segments.reduce((acc, s) => acc + Math.max(0, (s.end - s.start) * 1000), 0);
  const speakingTimeRatio = windowMs ? voicedMs / windowMs : 0;

  const gaps = [];
  for (let i = 1; i < segments.length; i++) {
    const gapMs = Math.max(0, (segments[i].start - segments[i-1].end) * 1000);
    gaps.push(gapMs);
  }
  const gapStats = stats(gaps);
  const longPauseThreshold = 600;
  const longPauseRatio = gaps.length ? gaps.filter(g => g > longPauseThreshold).length / gaps.length : 0;

  const words = segments.map(s => s.text?.trim() || '').join(' ').split(/\s+/).filter(Boolean);
  const windowMin = (utterEnd - utterStart) / 60;
  const speechRateWpm = windowMin > 0 ? words.length / windowMin : 0;
  const articulationMin = voicedMs / 60000;
  const articulationRateWpm = articulationMin > 0 ? words.length / articulationMin : 0;

  const shortSegs = segments.filter(s => ((s.end - s.start) * 1000) < 180).length;
  const burstiness = (gapStats.std || 0) / ((gapStats.mean || 1)) + shortSegs / Math.max(1, segments.length);

  // Approximations for start/end; end_hold set to 0 as we don't have tail beyond last segment.
  const start_latency_ms = Math.max(0, (s0.start - Math.max(0, s0.start - (s0.end - s0.start))) * 1000);
  const end_hold_ms = 0;

  return {
    window_ms: Math.round(windowMs),
    voiced_ms: Math.round(voicedMs),
    speaking_time_ratio: +speakingTimeRatio.toFixed(3),
    pause_count: gaps.length,
    pause_mean_ms: Math.round(gapStats.mean || 0),
    pause_median_ms: Math.round(gapStats.median || 0),
    pause_max_ms: Math.round(gapStats.max || 0),
    pause_std_ms: Math.round(gapStats.std || 0),
    long_pause_ratio: +longPauseRatio.toFixed(3),
    words: words.length,
    speech_rate_wpm: +speechRateWpm.toFixed(1),
    articulation_rate_wpm: +articulationRateWpm.toFixed(1),
    start_latency_ms: Math.round(start_latency_ms),
    end_hold_ms: Math.round(end_hold_ms),
    burstiness: +burstiness.toFixed(3)
  };
}

export function normalizeScores(scores = {}) {
  const labels = ['joy','sadness','anger','fear','surprise','disgust','neutral'];
  const filled = {};
  labels.forEach(k => { filled[k] = Math.max(0, Number(scores[k] ?? 0)); });
  let sum = labels.reduce((a,k)=>a+filled[k],0);
  if (sum === 0) { filled.neutral = 1; sum = 1; }
  labels.forEach(k => { filled[k] = filled[k] / sum; });
  return filled;
}
