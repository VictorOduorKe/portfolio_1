require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Twilio } = require('twilio');

const app = express();
app.use(express.json());
app.use(cors()); // adjust origin in production

const client = new Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

app.post('/api/contact', async (req, res) => {
  const { username, phone, email, message } = req.body;

  if (!username || !phone || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  // Optional: further sanitize/validate here
  if (!/^[+\d][\d\s-]{6,}$/.test(phone)) {
    return res.status(400).json({ error: 'Invalid phone number format.' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address format.' });
  }
  if (message.length < 10) {
    return res.status(400).json({ error: 'Message must be at least 10 characters long.' });
  }

  // Format the message for WhatsApp

  const outgoing = `
New contact form submission:
Name: ${username}
Phone: ${phone}
Email: ${email}
Message: ${message}
  `;

  try {
    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: process.env.TWILIO_WHATSAPP_TO,
      body: outgoing,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Twilio error:', err);
    return res.status(500).json({ error: 'Failed to send WhatsApp message.' });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Contact API listening`);
});
