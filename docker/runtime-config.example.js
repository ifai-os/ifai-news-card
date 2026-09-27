// Copy to docker/runtime-config.js and replace the placeholder values.
// This file is delivered to the browser. Do not use a privileged production key.
window.__APP_CONFIG__ = {
  VITE_OPENAI_BASE_URL: 'https://your-api-gateway.example.com/v1',
  VITE_OPENAI_API_KEY: 'your_api_key_here',
  VITE_OPENAI_MODEL: 'gpt-4o-mini',
};
