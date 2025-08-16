# PHP Backend for React Contact Form

This directory contains the PHP backend files to handle contact form submissions from your React frontend.

## Files Overview

- `contact.php` - Main contact form handler (requires database)
- `contact-simple.php` - Simplified version without database (for testing)
- `config.php` - Configuration file for database and email settings
- `setup_database.sql` - SQL script to create the database and table
- `README.md` - This file

## Quick Start (Simple Version)

1. **Start a PHP server** in the backend directory:
   ```bash
   cd backend
   php -S localhost:8000
   ```

2. **Update your React frontend** to point to the PHP backend:
   ```bash
   # In your React project, create a .env file:
   VITE_API_BASE=http://localhost:8000
   ```

3. **Test the form** - Your contact form will now submit to the PHP backend!

## Full Setup (With Database)

### 1. Database Setup

1. **Install MySQL/MariaDB** if you haven't already
2. **Run the database setup script**:
   ```bash
   mysql -u root -p < setup_database.sql
   ```
3. **Update config.php** with your database credentials:
   ```php
   define('DB_USER', 'your_actual_username');
   define('DB_PASS', 'your_actual_password');
   ```

### 2. Email Configuration

1. **Update config.php** with your email:
   ```php
   define('ADMIN_EMAIL', 'your-email@example.com');
   ```

2. **Configure your mail server** (or use a service like SendGrid)

### 3. Start the Server

```bash
cd backend
php -S localhost:8000
```

## Frontend Integration

Your React contact form is already configured to work with this backend! Just make sure your environment variable points to the PHP server:

```bash
# .env file in your React project
VITE_API_BASE=http://localhost:8000
```

## Testing

1. **Start your React frontend** (usually on port 5173)
2. **Start the PHP backend** (on port 8000)
3. **Fill out the contact form** and submit
4. **Check the response** - you should see a success message!

## Troubleshooting

### Common Issues

1. **CORS errors**: Make sure your origin is in the `ALLOWED_ORIGINS` array in `config.php`
2. **Database connection failed**: Check your database credentials in `config.php`
3. **Form not submitting**: Verify the API endpoint in your React component matches the PHP file path

### Debug Mode

To see detailed errors, temporarily add this to the top of your PHP files:
```php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

## Production Deployment

1. **Use a proper web server** (Apache/Nginx) instead of PHP's built-in server
2. **Set up HTTPS** for security
3. **Configure proper CORS** for your production domain
4. **Set up proper logging** instead of file-based logging
5. **Use environment variables** for sensitive configuration

## Security Features

- ✅ Input validation and sanitization
- ✅ CORS protection
- ✅ SQL injection prevention (prepared statements)
- ✅ XSS protection (htmlspecialchars)
- ✅ Rate limiting (can be added)
- ✅ CSRF protection (can be added)

## Next Steps

- Add rate limiting to prevent spam
- Implement CSRF protection
- Add CAPTCHA for additional spam protection
- Set up email templates
- Add admin panel to view submissions

# configuring php mailer and env variables
composer require vlucas/phpdotenv phpmailer/phpmailer
