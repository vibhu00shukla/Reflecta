// services/ai.service.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

const MAX_CHARS = 12000;

function truncateText(text, max = MAX_CHARS) {
  if (!text) return '';
  if (text.length <= max) return text;
  const head = text.slice(0, Math.floor(max * 0.6));
  const tail = text.slice(-Math.floor(max * 0.4));
  return `${head}\n\n...[truncated]...\n\n${tail}`;
}

function simpleMockAnalysis(text) {
  const firstLine = (text || '').split('\n')[0] || '';
  return {
    summary: firstLine || 'User wrote about some feelings today.',
    keywords: ['mock', 'analysis'],
    negativeThoughts: [],
    emotions: [{ name: 'neutral', score: 0.5 }],
    distortions: [],
    evidenceForThoughts: [],
    evidenceAgainstThoughts: [],
    reframes: [],
    suggestedActions: [{ text: 'Take a deep breath.' }],
    worksheetPrefill: {}
  };
}

async function analyzeText(entryText, options = {}) {
  if (!entryText) return simpleMockAnalysis('');

  if (options.mockOnly || !genAI) {
    console.log("Using mock analysis (Gemini key missing or mock requested)");
    return simpleMockAnalysis(entryText);
  }

  const truncated = truncateText(entryText);

  const prompt = `
    You are a clinical CBT assistant. Analyze this journal entry and return a JSON object.
    
    Output Schema:
    {
      "summary": "string (1-2 sentences)",
      "keywords": ["string"],
      "negativeThoughts": ["string"],
      "emotions": [{"name": "string", "score": 0.0-1.0}],
      "distortions": ["string"],
      "evidenceForThoughts": ["string"],
      "evidenceAgainstThoughts": ["string"],
      "reframes": [{"originalThought": "string", "rationalResponse": "string"}],
      "suggestedActions": [{"text": "string"}],
      "worksheetPrefill": {"situation": "string", "thought": "string", "emotion": "string", "alternativeThought": "string"}
    }

    Journal Entry:
    """${truncated}"""
    
    Return ONLY valid JSON. Do not use markdown code blocks.
  `;

  // Helper to try a specific model
  const tryModel = async (modelName) => {
    console.log(`Attempting analysis with model: ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  };

  try {
    // Try primary model (verified working)
    return await tryModel("gemini-flash-latest");
  } catch (error1) {
    console.warn("Primary model (gemini-flash-latest) failed:", error1.message);

    try {
      // Try fallback model
      return await tryModel("gemini-pro-latest");
    } catch (error2) {
      console.error("Fallback model (gemini-pro-latest) also failed:", error2.message);
      console.error("All AI attempts failed. Returning mock analysis.");
      return simpleMockAnalysis(entryText);
    }
  }
}

module.exports = {
  analyzeText,
  simpleMockAnalysis,
  truncateText
};
