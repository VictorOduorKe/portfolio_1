import React, { useState } from 'react';
import '../css/Contact.css';

const Contact = () => {
  const timeout = 3000;
  const [errors, setErrors] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const clearMessages = () => {
    setTimeout(() => {
      setErrors('');
      setSuccess('');
    }, timeout);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setErrors('');
    setSuccess('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(
      [...formData.entries()].map(([k, v]) => [k, String(v).trim()])
    );

    const { username, phone, email, message } = data;

    if (!username || !phone || !email || !message) {
      setErrors('Please fill in all fields.');
      clearMessages();
      setLoading(false);
      return;
    }

    // Basic phone validation (digits, allow +, spaces, dashes)
    const phoneRegex = /^[+\d][\d\s-]{6,}$/;
    if (!phoneRegex.test(phone)) {
      setErrors('Please enter a valid phone number.');
      clearMessages();
      setLoading(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors('Please enter a valid email address.');
      clearMessages();
      setLoading(false);
      return;
    }

    try {
      const resp = await fetch('http://localhost:4000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, phone, email, message }),
      });

      const result = await resp.json();
      if (resp.ok) {
        setSuccess('Thank you for contacting us! Contact sent via WhatsApp.'); // clarify
        e.currentTarget.reset();
      } else {
        setErrors(result.error || 'Submission failed.');
      }
    } catch (err) {
      console.error(err);
      setErrors('Network error.');
    } finally {
      clearMessages();
      setLoading(false);
    }
  };

  return (
    <section className="contact-container" id="contact">
      <h1>CONTACT US HERE</h1>
      <div className="contact-form">
        <form id="contact-form" onSubmit={handleSubmit} noValidate>
          <div className="input-field">
            <label htmlFor="username">Full name</label>
            <input
              type="text"
              name="username"
              id="username"
              placeholder="Enter full name"
              required
              disabled={loading}
            />
          </div>
          <div className="input-field">
            <label htmlFor="phone">Phone No</label>
            <input
              type="tel"
              name="phone"
              id="phone"
              placeholder="Enter valid phone number"
              required
              disabled={loading}
            />
          </div>
          <div className="input-field">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Enter email"
              required
              disabled={loading}
            />
          </div>
          <div className="input-field">
            <label htmlFor="message">Message</label>
            <textarea
              name="message"
              id="message"
              placeholder="Type message"
              required
              disabled={loading}
            ></textarea>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send'}
          </button>
          <div className="message_area">
            {errors && <p className="error">{errors}</p>}
            {success && <p className="success">{success}</p>}
          </div>
        </form>
      </div>
    </section>
  );
};

export default Contact;
