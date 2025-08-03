process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', reason => {
  console.error('Unhandled Rejection:', reason);
});


require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Twilio } = require('twilio');

const app = express();

// Security headers
app.use(helmet());

// Rate limit
app.use(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Parse JSON body
app.use(express.json());

// CORS setup (allow React dev servers)
const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  'http://localhost:3000', // CRA default
  'http://localhost:5173', // Vite default
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      console.log('CORS incoming origin:', origin);
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy: origin ${origin} not allowed`), false);
    },
    credentials: true, // allow cookies/auth headers
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  })
);

// Twilio client
const client = new Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Check env vars
['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_WHATSAPP_FROM', 'TWILIO_WHATSAPP_TO']
  .forEach((key) => {
    if (!process.env[key]) {
      console.warn(`Warning: Environment variable ${key} is not set.`);
    }
  });

// Contact form route
app.post('/api/contact', async (req, res) => {
  const { username, phone, email, message } = req.body;

  if (!username || !phone || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  if (!/^[+\d][\d\s-]{6,}$/.test(phone)) {
    return res.status(400).json({ error: 'Invalid phone number format.' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address format.' });
  }

  if (message.trim().length < 10) {
    return res.status(400).json({ error: 'Message must be at least 10 characters long.' });
  }

  const outgoing = `
New contact form submission:
Name: ${username}
Phone: ${phone}
Email: ${email}
Message: ${message}
  `.trim();

  try {
    const from = process.env.TWILIO_WHATSAPP_FROM;
    const to = process.env.TWILIO_WHATSAPP_TO;

    if (!from || !to) {
      return res.status(500).json({ error: 'Twilio WhatsApp numbers not configured.' });
    }
    if (!from.startsWith('whatsapp:') || !to.startsWith('whatsapp:')) {
      return res.status(500).json({ error: 'Twilio numbers must start with "whatsapp:".' });
    }

    await client.messages.create({ from, to, body: outgoing });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Twilio error:', err);
    return res.status(500).json({ error: 'Failed to send WhatsApp message.' });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Internal server error.' });
});

const port = process.env.PORT || 4000;
console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
app.listen(port, () => console.log(`Server running on port ${port}`));
