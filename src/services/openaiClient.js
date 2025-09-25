const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

if (!OPENAI_API_KEY) console.warn('Missing EXPO_PUBLIC_OPENAI_API_KEY');

export async function transcribeVerbose(fileUri, filename = 'recording.m4a') {
  const form = new FormData();
  form.append('file', { uri: fileUri, name: filename, type: 'audio/m4a' });
  form.append('model', 'whisper-1');
  form.append('response_format', 'verbose_json');

  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: form
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Whisper error: ${t}`);
  }
  return await res.json();
}

export async function classifyEmotion({ text, features, tinyTextModeHint }) {
  const system = `You are an expert affective-computing classifier.
You combine text semantics with prosodic cues (timing/pauses/burstiness) to infer emotion from very short or long utterances.
Output STRICT JSON only with keys: emotion, scores, explanation.`;

  const user = `TEXT:
"""${text}"""

PROSODIC CUES:
${JSON.stringify(features, null, 2)}

CONSTRAINTS:
- emotion ∈ {joy, sadness, anger, fear, surprise, disgust, neutral}
- scores must include all 7 keys and sum ~1 (±0.02).
- For single-word or very short text, weigh prosody more (rate, pauses, burstiness, start_latency_ms, end_hold_ms).
- For negations like "I'm fine" with long pauses/low rate → may lean sadness; abrupt clipped short "fine" with high rate → anger/surprise possible.
- If semantics and prosody disagree, choose the emotion that best reconciles both and justify briefly.

Return JSON ONLY:
{
  "emotion": "<label>",
  "scores": {"joy":0..1,"sadness":0..1,"anger":0..1,"fear":0..1,"surprise":0..1,"disgust":0..1,"neutral":0..1},
  "explanation":"<one short sentence why>"
}`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: tinyTextModeHint ? 0.1 : 0.2,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ]
    })
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`LLM error: ${t}`);
  }

  const data = await res.json();
  const raw = data?.choices?.[0]?.message?.content || '{}';
  try {
    return JSON.parse(raw);
  } catch {
    return { emotion: 'neutral', scores: { joy:0, sadness:0, anger:0, fear:0, surprise:0, disgust:0, neutral:1 }, explanation: 'fallback' };
  }
}
