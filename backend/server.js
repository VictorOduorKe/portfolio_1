require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Twilio } = require('twilio');

const app = express();

// Required environment variables
const requiredEnv = [
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_WHATSAPP_FROM',
  'TWILIO_WHATSAPP_TO'
];

const missingEnv = requiredEnv.filter((k) => !process.env[k]);
if (missingEnv.length) {
  console.warn('Missing required env vars:', missingEnv.join(', '));
  // Optionally fail fast in production:
  // process.exit(1);
}

// Validate WhatsApp number prefixes early
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM || '';
const whatsappTo = process.env.TWILIO_WHATSAPP_TO || '';
if ((whatsappFrom && !whatsappFrom.startsWith('whatsapp:')) ||
    (whatsappTo && !whatsappTo.startsWith('whatsapp:'))) {
  console.warn(
    'Twilio WhatsApp numbers should start with "whatsapp:".',
    { whatsappFrom, whatsappTo }
  );
  // You could also exit here if format is critical.
}

// Instantiate Twilio client only if credentials exist (or guard usage later)
let client = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  client = new Twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

// Middleware: security headers
app.use(helmet());

// Rate limiting
app.use(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Body parsing
app.use(express.json());

// CORS setup
const allowedOrigins = [
  process.env.CLIENT_ORIGIN, // e.g., your production frontend
  'http://localhost:3000',
  'http://localhost:5173',
]
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      console.log('CORS incoming origin:', origin);
      if (!origin) {
        // No Origin header (non-browser) — allow if that's intended
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy: origin ${origin} not allowed`), false);
    },
    credentials: true,
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  })
);

// Contact form endpoint
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

  if (!client) {
    return res.status(500).json({ error: 'Twilio client not configured.' });
  }

  if (!whatsappFrom || !whatsappTo) {
    return res.status(500).json({ error: 'Twilio WhatsApp numbers not configured.' });
  }

  if (!whatsappFrom.startsWith('whatsapp:') || !whatsappTo.startsWith('whatsapp:')) {
    return res.status(500).json({ error: 'Twilio numbers must start with "whatsapp:".' });
  }

  const outgoing = `
New contact form submission:
Name: ${username}
Phone: ${phone}
Email: ${email}
Message: ${message}
  `.trim();

  try {
    await client.messages.create({
      from: whatsappFrom,
      to: whatsappTo,
      body: outgoing,
    });
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
