#!/bin/bash

echo "🚀 Starting PHP Backend Server..."
echo "📍 Server will run on: http://localhost:8000"
echo "📝 Test endpoint: http://localhost:8000/test.php"
echo "📧 Contact endpoint: http://localhost:8000/contact.php"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

cd backend
php -S localhost:8000
