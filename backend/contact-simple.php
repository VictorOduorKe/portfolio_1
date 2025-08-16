<?php
$allowed_origin = 'http://localhost:5173';

// CORS headers
header("Access-Control-Allow-Origin: $allowed_origin");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json'); // Always respond with JSON

require __DIR__ . '/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Load .env
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Email config from .env
define('ENABLE_EMAIL', filter_var($_ENV['ENABLE_EMAIL'], FILTER_VALIDATE_BOOLEAN));
define('ADMIN_EMAIL', $_ENV['ADMIN_EMAIL']);
define('SITE_NAME', $_ENV['SITE_NAME']);
define('SMTP_HOST', $_ENV['SMTP_HOST']);
define('SMTP_PORT', $_ENV['SMTP_PORT']);
define('SMTP_USERNAME', $_ENV['SMTP_USERNAME']);
define('SMTP_PASSWORD', $_ENV['SMTP_PASSWORD']);
define('SMTP_SECURE', $_ENV['SMTP_SECURE']);

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Get JSON input
$raw = file_get_contents('php://input');
$input = json_decode($raw, true);

// Validate JSON parsing
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit();
}

// Validate required fields
$required_fields = ['username', 'phone', 'email', 'message'];
$missing_fields = array_filter($required_fields, fn($f) => empty($input[$f]));

if ($missing_fields) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields: ' . implode(', ', $missing_fields)]);
    exit();
}

// Validate email format
if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email format']);
    exit();
}

// Sanitize inputs
$username = htmlspecialchars(trim($input['username']), ENT_QUOTES, 'UTF-8');
$phone = htmlspecialchars(trim($input['phone']), ENT_QUOTES, 'UTF-8');
$email = htmlspecialchars(trim($input['email']), ENT_QUOTES, 'UTF-8');
$message = htmlspecialchars(trim($input['message']), ENT_QUOTES, 'UTF-8');

// Log submission
$log_entry = date('Y-m-d H:i:s') . " - Name: $username, Phone: $phone, Email: $email, Message: $message\n";
file_put_contents('contact_log.txt', $log_entry, FILE_APPEND | LOCK_EX);

// Send email if enabled
if (ENABLE_EMAIL) {
    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host = SMTP_HOST;
        $mail->SMTPAuth = true;
        $mail->Username = SMTP_USERNAME;
        $mail->Password = SMTP_PASSWORD;
        $mail->SMTPSecure = SMTP_SECURE;
        $mail->Port = SMTP_PORT;

        $mail->setFrom(SMTP_USERNAME, SITE_NAME);
        $mail->addAddress(ADMIN_EMAIL, 'Site Admin');
        $mail->addReplyTo($email, $username);

        $mail->isHTML(false);
        $mail->Subject = 'New Contact Form Submission';
        $mail->Body = "Name: $username\nPhone: $phone\nEmail: $email\nMessage: $message\nTime: " . date('Y-m-d H:i:s');

        $mail->send();
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Mailer Error: ' . $mail->ErrorInfo]);
        exit();
    }
}

// Success response
http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'Contact form submitted successfully! We will get back to you soon.'
]);
