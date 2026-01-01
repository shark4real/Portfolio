require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();

// Middleware
app.use(express.json());

// Email transporter
let mailTransporter = null;

function initMailTransporter() {
  try {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      console.warn('SMTP config missing. Contact form email disabled.');
      return;
    }

    mailTransporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: SMTP_SECURE === 'true',
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  } catch (err) {
    console.error('Failed to initialize mail transporter:', err.message);
    mailTransporter = null;
  }
}

// Load profile data
let profileChunks = [];

function loadProfileData() {
  try {
    const profilePath = path.join(__dirname, '..', 'profile.md');
    const content = fs.readFileSync(profilePath, 'utf-8');
    
    const sections = content.split(/(?=^##\s)/m).filter(s => s.trim());
    
    profileChunks = sections.map(section => {
      const lines = section.trim().split('\n');
      const title = lines[0].replace(/^#+\s*/, '').trim();
      const text = section.trim();
      return { title, text };
    });
    
    console.log(`Loaded ${profileChunks.length} sections from profile.md`);
  } catch (error) {
    console.error('Failed to load profile.md:', error.message);
    profileChunks = [];
  }
}

function retrieveRelevantContext(query) {
  const queryLower = query.toLowerCase();
  const queryTerms = queryLower.split(/\s+/).filter(t => t.length > 2);
  
  const scored = profileChunks.map(chunk => {
    let score = 0;
    const chunkLower = chunk.text.toLowerCase();
    
    if (chunkLower.includes(queryLower)) score += 10;
    
    queryTerms.forEach(term => {
      const matches = (chunkLower.match(new RegExp(term, 'g')) || []).length;
      score += matches;
    });
    
    return { chunk, score };
  });
  
  const topChunks = scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(s => s.chunk.text);
  
  return topChunks.join('\n\n---\n\n');
}

app.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const lastUserMessage = messages?.filter(m => m.role === 'user').pop()?.content || '';
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

    const groqMessages = [
      { role: 'system', content: systemPrompt },
      ...(messages || [])
    ];

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: groqMessages,
        temperature: 0.1,
        max_tokens: 400
      })
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      return res.status(500).json({ error: errorText });
    }

    const data = await groqResponse.json();
    const reply = data.choices?.[0]?.message?.content || 'No response generated';
    
    res.json({ reply });

  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {};

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!mailTransporter) {
      return res.status(500).json({ error: 'Email service not configured' });
    }

    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;

    await mailTransporter.sendMail({
      from: fromAddress,
      to: 'sharik.hassan.ai@gmail.com',
      replyTo: email,
      subject: `[Portfolio] ${subject}`,
      text: `From: ${name} <${email}>

${message}`,
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('Contact form email failed:', err.message);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Initialize
loadProfileData();
initMailTransporter();

// Export for Vercel serverless
module.exports = app;
