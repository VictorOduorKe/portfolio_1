# Complete Integration Guide: React Frontend + PHP Backend

This guide will walk you through integrating your React contact form with a PHP backend step by step.

## 🚀 Quick Start (5 minutes)

### Step 1: Start the PHP Backend

```bash
# Navigate to the backend directory
cd backend

# Start PHP's built-in server on port 8000
php -S localhost:8000
```

### Step 2: Test the Backend

Open your browser and go to: `http://localhost:8000/test.php`

You should see a JSON response confirming the backend is working.

### Step 3: Test the Contact Form

1. **Start your React frontend** (in another terminal):
   ```bash
   cd current-portfolio
   npm run dev
   ```

2. **Fill out the contact form** and submit
3. **Check the browser console** for the API call
4. **Check the PHP terminal** for any errors

## 🔧 Full Setup (With Database)

### Prerequisites

- PHP 7.4+ installed
- MySQL/MariaDB installed
- Web server (Apache/Nginx) or PHP built-in server

### Step 1: Database Setup

1. **Create the database**:
   ```bash
   mysql -u root -p < backend/setup_database.sql
   ```

2. **Update database credentials** in `backend/config.php`:
   ```php
   define('DB_USER', 'your_actual_username');
   define('DB_PASS', 'your_actual_password');
   ```

### Step 2: Email Configuration

1. **Update admin email** in `backend/config.php`:
   ```php
   define('ADMIN_EMAIL', 'your-email@example.com');
   ```

2. **Configure mail server** (or use a service like SendGrid)

### Step 3: Start the Server

```bash
cd backend
php -S localhost:8000
```

## 📁 File Structure

```
portfolio_1/
├── current-portfolio/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── Contact.jsx    # Your contact form
│   │   └── env-config.js      # API configuration
│   └── package.json
├── backend/                    # PHP backend
│   ├── contact.php            # Main contact handler
│   ├── contact-simple.php     # Simple version (no DB)
│   ├── config.php             # Configuration
│   ├── setup_database.sql     # Database setup
│   ├── test.php               # Test endpoint
│   └── README.md              # Backend documentation
└── INTEGRATION_GUIDE.md       # This file
```

## 🔗 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/test.php` | GET | Test endpoint to verify backend |
| `/contact.php` | POST | Handle contact form submissions |
| `/contact-simple.php` | POST | Simple version without database |

## 📝 Frontend Configuration

Your React contact form is already configured to work with the PHP backend! The form sends a POST request to:

```
${API_BASE}/api/contact
```

**Important**: You need to update the endpoint in your Contact.jsx to match the PHP file path:

```jsx
// Change this line in Contact.jsx:
const resp = await fetch(`${API_BASE}/api/contact`, {

// To this:
const resp = await fetch(`${API_BASE}/contact.php`, {
```

## 🧪 Testing

### Test 1: Backend Health Check
```bash
curl http://localhost:8000/test.php
```

### Test 2: Contact Form Submission
```bash
curl -X POST http://localhost:8000/contact.php \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Test User",
    "phone": "1234567890",
    "email": "test@example.com",
    "message": "This is a test message"
  }'
```

### Test 3: Frontend Integration
1. Start both servers
2. Fill out the form in your browser
3. Check browser console and network tab
4. Check PHP server logs

## 🚨 Troubleshooting

### Common Issues

1. **CORS Error**
   - Check that your origin is in `ALLOWED_ORIGINS` in `config.php`
   - Verify the PHP server is running

2. **404 Not Found**
   - Check the file path in your fetch request
   - Verify the PHP file exists in the correct location

3. **Database Connection Failed**
   - Check database credentials in `config.php`
   - Verify MySQL service is running
   - Check database exists

4. **Form Not Submitting**
   - Check browser console for JavaScript errors
   - Verify the API endpoint URL is correct
   - Check PHP error logs

### Debug Mode

Add this to the top of your PHP files for detailed error reporting:
```php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

## 🔒 Security Features

- ✅ Input validation and sanitization
- ✅ CORS protection
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ Rate limiting (can be added)
- ✅ CSRF protection (can be added)

## 🚀 Production Deployment

1. **Use a proper web server** (Apache/Nginx)
2. **Set up HTTPS** for security
3. **Configure proper CORS** for your domain
4. **Set up proper logging**
5. **Use environment variables** for configuration

## 📚 Next Steps

- Add rate limiting to prevent spam
- Implement CSRF protection
- Add CAPTCHA for additional spam protection
- Set up email templates
- Create admin panel to view submissions
- Add file upload support
- Implement user authentication

## 🆘 Need Help?

If you encounter issues:

1. Check the browser console for JavaScript errors
2. Check the PHP server terminal for backend errors
3. Verify all file paths and configurations
4. Test each component individually (backend, then frontend)
5. Check the troubleshooting section above

## 🎯 Success Checklist

- [ ] PHP backend starts without errors
- [ ] Test endpoint returns JSON response
- [ ] Contact form submits successfully
- [ ] No CORS errors in browser console
- [ ] Form data is processed by PHP
- [ ] Success/error messages display correctly
- [ ] Database stores submissions (if using DB version)
- [ ] Email notifications work (if configured)

Congratulations! You now have a fully integrated React + PHP contact form system! 🎉
