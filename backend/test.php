<?php
// Simple test script to verify PHP backend is working
header('Content-Type: application/json');

echo json_encode([
    'status' => 'success',
    'message' => 'PHP backend is working!',
    'timestamp' => date('Y-m-d H:i:s'),
    'php_version' => PHP_VERSION,
    'server_info' => $_SERVER['SERVER_SOFTWARE'] ?? 'PHP Built-in Server'
]);
?>
