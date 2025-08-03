require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Twilio } = require('twilio');

const app = express();

// === Configuration ===
const requiredEnv = [
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_WHATSAPP_FROM',
  'TWILIO_WHATSAPP_TO'
];

const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length) {
  console.warn('Missing required environment variables:', missingEnv.join(', '));
  if (process.env.FAIL_ON_MISSING_CONFIG === '1') {
    console.error('Exiting due to missing critical config.');
    process.exit(1);
  }
}

// Normalize and validate WhatsApp numbers early
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM || '';
const whatsappTo = process.env.TWILIO_WHATSAPP_TO || '';

if (whatsappFrom && !whatsappFrom.startsWith('whatsapp:')) {
  console.warn(`TWILIO_WHATSAPP_FROM should start with "whatsapp:". Got "${whatsappFrom}"`);
}
if (whatsappTo && !whatsappTo.startsWith('whatsapp:')) {
  console.warn(`TWILIO_WHATSAPP_TO should start with "whatsapp:". Got "${whatsappTo}"`);
}

// Twilio client setup (guarded)
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = new Twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

// === Middleware ===
app.use(helmet());

app.use(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use(express.json());

// CORS: allowed origins come from CLIENT_ORIGINS (comma-separated) plus local dev fallbacks
const allowedOrigins = [
  ...(process.env.CLIENT_ORIGIN || '').split(',').map((o) => o.trim()).filter(Boolean),
  'http://localhost:3000',
  'http://localhost:5173',
];
console.log(allowedOrigins)
// Custom origin checker to optionally allow non-browser requests
app.use(
  cors({
    origin: (origin, callback) => {
      console.log('CORS incoming origin:', origin);
      if (!origin) {
        // Allow no-Origin (e.g., curl or non-browser). Change to reject if unwanted.
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

// === Routes ===
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

  if (!twilioClient) {
    return res.status(500).json({ error: 'Twilio client not configured.' });
  }

  if (!whatsappFrom || !whatsappTo) {
    return res.status(500).json({ error: 'Twilio WhatsApp numbers not configured.' });
  }

  if (!whatsappFrom.startsWith('whatsapp:') || !whatsappTo.startsWith('whatsapp:')) {
    return res.status(500).json({ error: 'Twilio WhatsApp numbers must start with "whatsapp:".' });
  }

  const outgoing = `
New contact form submission:
Name: ${username}
Phone: ${phone}
Email: ${email}
Message: ${message}
  `.trim();

  try {
    await twilioClient.messages.create({
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

// === Global error handler ===
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ error: 'Internal server error.' });
});

// === Startup ===
const port = process.env.PORT || 4000;
console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
