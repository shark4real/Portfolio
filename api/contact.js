// Vercel Serverless Function: /api/contact

const nodemailer = require('nodemailer');

let mailTransporter = null;

function getMailTransporter() {
  if (mailTransporter) return mailTransporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('SMTP config missing. Contact form email disabled.');
    return null;
  }

  try {
    mailTransporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: SMTP_SECURE === 'true',
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
    return mailTransporter;
  } catch (err) {
    console.error('Failed to initialize mail transporter:', err && err.message ? err.message : err);
    mailTransporter = null;
    return null;
  }
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
    const { name, email, subject, message } = await readJsonBody(req);

    if (!name || !email || !subject || !message) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Missing required fields' }));
      return;
    }

    const transporter = getMailTransporter();
    if (!transporter) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Email service not configured' }));
      return;
    }

    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;

    await transporter.sendMail({
      from: fromAddress,
      to: 'sharik.hassan.ai@gmail.com',
      replyTo: email,
      subject: `[Portfolio] ${subject}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: true }));
  } catch (err) {
    console.error('Contact handler error:', err && err.message ? err.message : err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Failed to send message' }));
  }
};
