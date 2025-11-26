// services/ai.service.js
// Simple AI wrapper for Reflecta.
// - If OPENAI_API_KEY is set, calls OpenAI Chat Completions (v1) and expects a JSON reply.
// - Otherwise returns a deterministic mock analysis for local dev/testing.

const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'; // override in env if you want
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || null;
const MAX_CHARS = 12000; // truncate long entries to this many characters (adjust as needed)

/**
 * truncateText - trims long texts to a safe length for LLM calls
 */
function truncateText(text, max = MAX_CHARS) {
  if (!text) return '';
  if (text.length <= max) return text;
  // keep start and end to preserve context
  const head = text.slice(0, Math.floor(max * 0.6));
  const tail = text.slice(-Math.floor(max * 0.4));
  return `${head}\n\n...[truncated]...\n\n${tail}`;
}

/**
 * simpleMockAnalysis - returns a deterministic, small analysis object for testing
 */
function simpleMockAnalysis(text) {
  const firstLine = (text || '').split('\n')[0] || '';
  const words = (text || '').split(/\s+/).filter(Boolean);
  const keywords = words.slice(0, 6).map(w => w.replace(/[^a-zA-Z]/g, '').toLowerCase()).filter(Boolean);

  return {
    summary: firstLine || 'User wrote about some feelings today.',
    keywords: Array.from(new Set(keywords)).slice(0, 6),
    negativeThoughts: firstLine ? [{ excerpt: firstLine }] : [],
    emotions: [
      { name: 'anxiety', score: 0.5 },
      { name: 'sadness', score: 0.2 }
    ],
    distortions: [{ type: 'Overgeneralization', excerpt: firstLine || '' }],
    evidenceForThoughts: ['I felt bad during the meeting.'],
    evidenceAgainstThoughts: ['You succeeded in other meetings before.'],
    reframes: [{ text: 'This was one event, not the whole story.' }],
    suggestedActions: [{ text: 'Take a 10-minute walk.' }],
    worksheetPrefill: {
      situation: firstLine || '',
      thought: firstLine || '',
      emotion: 'anxious',
      alternativeThought: 'One day does not define capability.'
    }
  };
}

/**
 * buildPromptForModel - we ask the model to return a JSON object in a clear schema
 */
function buildPromptForModel(entryText) {
  const truncated = truncateText(entryText);
  const system = `You are a clinical-style CBT assistant. Read the user's journal entry and produce a JSON object (no extra text) matching the schema described. Be concise but thorough.`;
  const instructions = `
Return a single JSON object with keys:
- summary (short string, 1-2 sentences)
- keywords (array of short single-word strings)
- negativeThoughts (array of objects { "excerpt": string })
- emotions (array of objects { "name": string, "score": number between 0 and 1 })
- distortions (array of objects { "type": string, "excerpt": string })
- evidenceForThoughts (array of strings)
- evidenceAgainstThoughts (array of strings)
- reframes (array of objects { "text": string })
- suggestedActions (array of objects { "text": string, "type": string (optional) })
- worksheetPrefill (object with keys like situation, thought, emotion, alternativeThought)

Make sure the output is valid JSON only (no surrounding backticks or explanation).
Now analyze the following journal entry:
"""${truncated}"""
  `;
  return { system, instructions };
}

/**
 * parseJSONSafe - try to parse JSON, with a fallback that extracts a JSON object from text if possible.
 */
function parseJSONSafe(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (e) {
    // try to extract first {...} block
    const m = text.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        return JSON.parse(m[0]);
      } catch (err) {
        return null;
      }
    }
    return null;
  }
}

/**
 * analyzeText(entryText, options)
 * - options: { mockOnly: boolean } (optional)
 * Returns structured analysis object.
 */
async function analyzeText(entryText, options = {}) {
  if (!entryText) {
    return simpleMockAnalysis('');
  }

  if (options.mockOnly || !OPENAI_API_KEY) {
    return simpleMockAnalysis(entryText);
  }

  // build prompt
  const { system, instructions } = buildPromptForModel(entryText);

  // call OpenAI Chat Completions via REST
  const payload = {
    model: DEFAULT_MODEL,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: instructions }
    ],
    temperature: 0.0,
    max_tokens: 1000
  };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`OpenAI error: ${res.status} ${res.statusText} ${txt}`);
  }

  const body = await res.json();
  // attempt to find the assistant message
  const assistantMessage = body.choices && body.choices[0] && (body.choices[0].message?.content || body.choices[0].message || body.choices[0].text);
  const json = parseJSONSafe(assistantMessage);
  if (!json) {
    // if parsing fails, fallback to mock result (so worker can continue)
    console.warn('ai.service: failed to parse JSON from model response; falling back to mock analysis.');
    return simpleMockAnalysis(entryText);
  }

  // Basic normalization: ensure expected keys exist
  const ensureArray = (v) => Array.isArray(v) ? v : [];
  const ensureObject = (v) => (v && typeof v === 'object') ? v : {};

  return {
    summary: json.summary || (entryText.slice(0, 200)),
    keywords: ensureArray(json.keywords),
    negativeThoughts: ensureArray(json.negativeThoughts),
    emotions: ensureArray(json.emotions),
    distortions: ensureArray(json.distortions),
    evidenceForThoughts: ensureArray(json.evidenceForThoughts),
    evidenceAgainstThoughts: ensureArray(json.evidenceAgainstThoughts),
    reframes: ensureArray(json.reframes),
    suggestedActions: ensureArray(json.suggestedActions),
    worksheetPrefill: ensureObject(json.worksheetPrefill)
  };
}

module.exports = {
  analyzeText,
  simpleMockAnalysis,
  truncateText
};
