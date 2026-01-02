// Vercel Serverless Function: /api/chat
// Keeps logic self-contained (no Express) so routing works on Vercel.

const fs = require('fs');
const path = require('path');

let profileChunksCache = null;

function loadProfileChunks() {
  if (profileChunksCache) return profileChunksCache;

  try {
    const profilePath = path.join(process.cwd(), 'profile.md');
    const content = fs.readFileSync(profilePath, 'utf-8');

    const sections = content.split(/(?=^##\s)/m).filter((s) => s.trim());

    profileChunksCache = sections.map((section) => {
      const lines = section.trim().split('\n');
      const title = lines[0].replace(/^#+\s*/, '').trim();
      const text = section.trim();
      return { title, text };
    });

    return profileChunksCache;
  } catch (error) {
    console.error('Failed to load profile.md:', error && error.message ? error.message : error);
    profileChunksCache = [];
    return profileChunksCache;
  }
}

function retrieveRelevantContext(query) {
  const profileChunks = loadProfileChunks();
  if (!profileChunks.length) return '';

  const queryLower = String(query || '').toLowerCase();
  const queryTerms = queryLower.split(/\s+/).filter((t) => t.length > 2);

  const scored = profileChunks.map((chunk) => {
    let score = 0;
    const chunkLower = chunk.text.toLowerCase();

    if (queryLower && chunkLower.includes(queryLower)) score += 10;

    for (const term of queryTerms) {
      const matches = (chunkLower.match(new RegExp(term, 'g')) || []).length;
      score += matches;
    }

    return { chunk, score };
  });

  const topChunks = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => s.chunk.text);

  return topChunks.join('\n\n---\n\n');
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (req.body && typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }

  // Fallback: read stream
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  try {
    const { messages } = await readJsonBody(req);

    if (!process.env.GROQ_API_KEY) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'GROQ_API_KEY not configured' }));
      return;
    }

    const lastUserMessage = Array.isArray(messages)
      ? (messages.filter((m) => m && m.role === 'user').pop() || {}).content || ''
      : '';

    const relevantContext = retrieveRelevantContext(lastUserMessage);

    const systemPrompt = `You ARE Sharik Hassan. Answer as yourself, like you're texting a friend.

Only use the information in the CONTEXT below. If a language, tool, platform, or social handle is not mentioned there (for example Java, R, MATLAB, Twitter), clearly say you haven't really used it or don't have it listed instead of making one up.

When you share links or usernames, copy them EXACTLY from the context (especially LinkedIn, GitHub, Instagram). Do NOT invent new handles, do NOT change the spelling, and do NOT add platforms that aren't in the context.

If someone asks for your age, NEVER give a specific number. Instead, reply in a professional way that you are above legal working age and eligible for internships and employment, without revealing exact age.

CONTEXT:
${relevantContext}

RULES:
- Use "I", "my", "me".
- Be direct and casual – no fluff or repetition.
- 1–2 sentences max unless the user asks for more detail.
- Never invent extra tools, languages, social handles, or experience beyond the context.
- Never state an exact age; always use the legal-working-age phrasing.
- If you don't know something, say "Not sure" or "Haven't worked on that yet".`;

    const groqMessages = [{ role: 'system', content: systemPrompt }, ...(Array.isArray(messages) ? messages : [])];

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: groqMessages,
        temperature: 0.1,
        max_tokens: 400,
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: errorText || 'Groq request failed' }));
      return;
    }

    const data = await groqResponse.json();
    const reply = (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || 'No response generated';

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ reply }));
  } catch (error) {
    console.error('Chat handler error:', error && error.message ? error.message : error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Server error' }));
  }
};
