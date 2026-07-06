require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

const pageRoutes = {
  '/': 'index.html',
  '/about': 'about.html',
  '/projects': 'projects.html',
  '/rag': 'rag.html',
};

app.get(['/index.html', '/about.html', '/projects.html', '/rag.html'], (req, res) => {
  const cleanPath = req.path === '/index.html' ? '/' : req.path.replace(/\.html$/, '');
  res.redirect(301, cleanPath);
});

Object.entries(pageRoutes).forEach(([route, fileName]) => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(__dirname, fileName));
  });
});

app.use(express.static(__dirname));

// Email transporter (configure via .env)
let mailTransporter = null;

function initMailTransporter() {
  try {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE, SMTP_FROM } = process.env;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      console.warn('✗ SMTP config missing (SMTP_HOST / SMTP_USER / SMTP_PASS). Contact form email disabled.');
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

    mailTransporter.verify((err) => {
      if (err) {
        console.error('❌ SMTP verification failed:', err.message);
        mailTransporter = null;
      } else {
        console.log('✅ SMTP transporter ready for contact form');
      }
    });
  } catch (err) {
    console.error('❌ Failed to initialize mail transporter:', err.message);
    mailTransporter = null;
  }
}

// Load and parse profile.md into chunks
let profileChunks = [];

function loadProfileData() {
  try {
    const profilePath = path.join(__dirname, 'profile.md');
    const content = fs.readFileSync(profilePath, 'utf-8');
    
    // Split by ## headers to create meaningful chunks
    const sections = content.split(/(?=^##\s)/m).filter(s => s.trim());
    
    profileChunks = sections.map(section => {
      const lines = section.trim().split('\n');
      const title = lines[0].replace(/^#+\s*/, '').trim();
      const text = section.trim();
      return { title, text };
    });
    
    console.log(`✅ Loaded ${profileChunks.length} sections from profile.md`);
  } catch (error) {
    console.error('❌ Failed to load profile.md:', error.message);
    profileChunks = [];
  }
}

// Simple keyword-based retrieval
function retrieveRelevantContext(query) {
  const queryLower = query.toLowerCase();
  const queryTerms = queryLower.split(/\s+/).filter(t => t.length > 2);
  
  const scored = profileChunks.map(chunk => {
    let score = 0;
    const chunkLower = chunk.text.toLowerCase();
    
    // Title match gets high score
    if (chunkLower.includes(queryLower)) score += 10;
    
    // Count keyword matches
    queryTerms.forEach(term => {
      const matches = (chunkLower.match(new RegExp(term, 'g')) || []).length;
      score += matches;
    });
    
    return { chunk, score };
  });
  
  // Get top 3 relevant chunks
  const topChunks = scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(s => s.chunk.text);
  
  return topChunks.join('\n\n---\n\n');
}

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!process.env.GROQ_API_KEY) {
      console.error('Missing GROQ_API_KEY');
      return res.status(500).json({ error: 'API key not configured' });
    }

    console.log(`\n📨 Chat request with ${messages?.length || 0} messages`);

    // Get the last user message for retrieval
    const lastUserMessage = messages?.filter(m => m.role === 'user').pop()?.content || '';
    
    // Retrieve relevant context from profile
    const relevantContext = retrieveRelevantContext(lastUserMessage);
    
    console.log(`📚 Retrieved ${relevantContext.split('---').length} context chunks`);

    // Build system prompt with retrieved context
    const systemPrompt = `You ARE Sharik Hassan. Answer as yourself, like you're texting a friend.

  Only use the information in the CONTEXT below. If a language, tool, platform, or social handle is not mentioned there (for example Java, R, MATLAB, Twitter), clearly say you haven't really used it or don't have it listed instead of making one up.

  When you share links or usernames, copy them EXACTLY from the context (especially LinkedIn, GitHub, Instagram). Do NOT invent new handles, do NOT change the spelling, and do NOT add platforms that aren't in the context.

  If someone asks for your age, NEVER give a specific number. Instead, reply in a professional way that you are above legal working age and eligible for employment, without revealing exact age.

  If someone asks about personal life, private relationships, family, or other non-professional personal details, do not answer with private details. Say you prefer to keep personal life private and can talk about your work, skills, projects, or public profile.

  If someone asks about salary, compensation, CTC, stipend, or pay, do not disclose any amount. Say salary details are private.

  If someone asks about opportunities, hiring, full-time roles, freelance work, projects, or collaborations, say you are open to full-time roles, freelancing, and collaborations, and always include this email exactly: sharik.hassan.ai@gmail.com.

  If someone asks about your experience journey, follow the Experience section in the context exactly. For Entropik, present it as one organization with two roles under it: Associate AI Engineer first, then AI QA Intern.

  CONTEXT:
  ${relevantContext}

  RULES:
  - Use "I", "my", "me".
  - Be direct and casual – no fluff or repetition.
  - 1–2 sentences max unless the user asks for more detail.
  - Never invent extra tools, languages, social handles, or experience beyond the context.
  - Never state an exact age; always use the legal-working-age phrasing.
  - Never disclose salary, compensation, CTC, stipend, pay, or private personal-life details.
  - Always include sharik.hassan.ai@gmail.com when responding to opportunities, hiring, freelance work, or collaborations.
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
      let errorJson = null;
      try {
        errorJson = JSON.parse(errorText);
      } catch (e) {}
      console.error(`❌ Groq error (${groqResponse.status}):`, errorText);
      if (errorJson && errorJson.error) {
        res.status(500).json({ error: errorJson.error.message || errorJson.error });
      } else {
        res.status(500).json({ error: errorText });
      }
      return;
    }

    const data = await groqResponse.json();
    const reply = data.choices?.[0]?.message?.content || 'No response generated';
    
    console.log(`✅ Response: ${reply.substring(0, 100)}...`);
    res.json({ reply });

  } catch (error) {
    console.error('❌ Server error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Contact form mail endpoint
app.post('/api/contact', async (req, res) => {
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
    console.error('❌ Contact form email failed:', err.message);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Load profile data on startup
loadProfileData();

// Init mail transporter
initMailTransporter();

app.listen(PORT, () => {
  console.log(`\n🚀 SharkGPT server running on http://localhost:${PORT}`);
  console.log(`📡 Groq API key: ${process.env.GROQ_API_KEY ? '✓ Loaded' : '✗ Missing'}`);
  console.log(`📄 Profile chunks: ${profileChunks.length}\n`);
});
