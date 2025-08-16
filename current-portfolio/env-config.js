// Configuration file for API endpoints
// Copy this to .env.local in your React project

export const config = {
  // API Configuration for PHP Backend
  API_BASE: 'http://localhost:8000',
  
  // Enable beta features (optional)
  ENABLE_BETA: false
};

// Usage in your components:
// import { config } from './env-config.js';
// const API_BASE = config.API_BASE;
