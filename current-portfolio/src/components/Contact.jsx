import React, { useState, useRef, useEffect } from 'react';
import '../css/Contact.css';

const rawApiBase = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
const API_BASE = rawApiBase.replace(/\/+$/, ''); // strip trailing slash if any

const Contact = () => {
  const timeout = 3000;
  const [errors, setErrors] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const clearTimer = useRef(null);
  const formRef = useRef(null);

  const clearMessages = () => {
    if (clearTimer.current) clearTimeout(clearTimer.current);
    clearTimer.current = setTimeout(() => {
      setErrors('');
      setSuccess('');
    }, timeout);
  };

  useEffect(() => {
    return () => {
      if (clearTimer.current) clearTimeout(clearTimer.current);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setErrors('');
    setSuccess('');
    setLoading(true);

    const formEl = formRef.current;
    if (!formEl) {
      setErrors('Form reference lost.');
      setLoading(false);
      return;
    }

    const formData = new FormData(formEl);
    const data = Object.fromEntries(
      [...formData.entries()].map(([k, v]) => [k, v.trim()])
    );
    const { username, phone, email, message } = data;

    if (!username || !phone || !email || !message) {
      setErrors('Please fill in all fields.');
      clearMessages();
      setLoading(false);
      return;
    }

    try {
      console.log('API_BASE:', API_BASE);

      const resp = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, phone, email, message }),
      });

      let result = {};
      try {
        const text = await resp.text();
        result = text ? JSON.parse(text) : {};
      } catch (_) {
        // ignore JSON parse errors; we'll handle via status
      }

      if (resp.ok) {
        setSuccess('Thank you for contacting us! Contact sent via WhatsApp.');
        formEl.reset();
      } else {
        setErrors(result.error || `Submission failed (${resp.status}).`);
      }
    } catch (err) {
      console.error('Network error:', err);
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
        <form
          id="contact-form"
          onSubmit={handleSubmit}
          noValidate
          ref={formRef}
        >
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
