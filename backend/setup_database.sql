-- Create database (run this first)
CREATE DATABASE IF NOT EXISTS portfolio_contact;
USE portfolio_contact;

-- Create table for contact form submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create a user for the application (optional - for security)
-- Replace 'your_username' and 'your_password' with actual values
CREATE USER IF NOT EXISTS 'your_username'@'localhost' IDENTIFIED BY 'your_password';
GRANT INSERT, SELECT ON portfolio_contact.contact_submissions TO 'your_username'@'localhost';
FLUSH PRIVILEGES;
