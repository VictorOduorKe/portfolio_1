require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Twilio } = require('twilio');

const app = express();

// Basic security headers
app.use(helmet());

// Rate limit to reduce abuse (adjust window/max as needed)
app.use(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // max 10 requests per IP per window
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use(express.json());

// CORS: single options object. Allow local dev if CLIENT_ORIGIN not set.
const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
app.use(
  cors({
    origin: allowedOrigin,
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  })
);

const client = new Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

app.post('/api/contact', async (req, res) => {
  const { username, phone, email, message } = req.body;

  if (!username || !phone || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  // Trim inputs
  const cleanUsername = String(username).trim();
  const cleanPhone = String(phone).trim();
  const cleanEmail = String(email).trim();
  const cleanMessage = String(message).trim();

  // Validation
  if (!/^[+\d][\d\s-]{6,}$/.test(cleanPhone)) {
    return res.status(400).json({ error: 'Invalid phone number format.' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return res.status(400).json({ error: 'Invalid email address format.' });
  }

  if (cleanMessage.length < 10) {
    return res
      .status(400)
      .json({ error: 'Message must be at least 10 characters long.' });
  }

  const outgoing = `
New contact form submission:
Name: ${cleanUsername}
Phone: ${cleanPhone}
Email: ${cleanEmail}
Message: ${cleanMessage}
  `.trim();

  try {
    // WhatsApp numbers must be prefixed with 'whatsapp:'
    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM, // e.g., 'whatsapp:+14155238886' (sandbox)
      to: process.env.TWILIO_WHATSAPP_TO, // e.g., 'whatsapp:+<your-number>'
      body: outgoing,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Twilio error:', err);
    return res
      .status(500)
      .json({ error: 'Failed to send WhatsApp message.' });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Contact API listening on port ${port}`);
});
