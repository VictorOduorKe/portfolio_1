<?php
// backend/config.php
require __DIR__ . '/vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Email configuration
define('ENABLE_EMAIL', filter_var($_ENV['ENABLE_EMAIL'], FILTER_VALIDATE_BOOLEAN));
define('ADMIN_EMAIL', $_ENV['ADMIN_EMAIL']);
define('SITE_NAME', $_ENV['SITE_NAME']);
define('SMTP_HOST', $_ENV['SMTP_HOST']);
define('SMTP_PORT', $_ENV['SMTP_PORT']);
define('SMTP_USERNAME', $_ENV['SMTP_USERNAME']);
define('SMTP_PASSWORD', $_ENV['SMTP_PASSWORD']);
define('SMTP_SECURE', $_ENV['SMTP_SECURE']);

// Database configuration (moved to .env)
define('DB_HOST', $_ENV['DB_HOST']);
define('DB_NAME', $_ENV['DB_NAME']);
define('DB_USER', $_ENV['DB_USER']);
define('DB_PASS', $_ENV['DB_PASS']);

// Security settings
//define('LOG_SUBMISSIONS', filter_var($_ENV['LOG_SUBMISSIONS'], FILTER_VALIDATE_BOOLEAN));

// CORS settings
define('ALLOWED_ORIGINS', [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:4173',
    // Add your production domain here
]);

// Function to check if origin is allowed
function isOriginAllowed() {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    return in_array($origin, ["http://localhost:5173","http://localhost:3000","http://localhost:4173"]) || $origin === '';
}
$allowed_origin = implode(',', ALLOWED_ORIGINS);
// Function to set CORS headers
function setCorsHeaders() {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    global $allowed_origin;
    if (isOriginAllowed()) {
        header("Access-Control-Allow-Origin: $origin,$allowed_origin");
    }
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Credentials: true');
}
?>
