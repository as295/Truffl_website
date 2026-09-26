// Local development server. Mirrors what Vercel does in production:
// - serves index.html for every non-/api route (client-side router)
// - runs the /api/*.js files as plain Express handlers
//
// Usage: npm install && npm run dev   →  http://localhost:3000
const fs = require('fs');
const path = require('path');
const express = require('express');

// Load .env (RESEND_API_KEY, AUTH_TOKEN_SECRET, SLACK_WEBHOOK_URL, ...) if present.
// No extra dependency needed — this is a minimal KEY=VALUE parser. .env is git-ignored;
// on Vercel these same names are set as real Environment Variables instead.
(function loadDotEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (!m || line.trim().startsWith('#')) continue;
    const key = m[1];
    let val = (m[2] || '').trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (!(key in process.env)) process.env[key] = val;
  }
})();

const app = express();
// rawBody is kept so api/calendly.js can verify Calendly's HMAC over the exact
// bytes that were signed; re-serialising the parsed object would not match.
app.use(express.json({ verify: (req, _res, buf) => { req.rawBody = buf; } }));
app.use(express.urlencoded({ extended: false }));

// ---- wire up the /api handlers exactly as Vercel would ----
app.post('/api/requests', require('./api/requests.js'));
// Static path first: /api/requests/approve must not be read as an :id.
app.all('/api/requests/approve', require('./api/requests/approve.js'));
app.post('/api/calendly', require('./api/calendly.js'));
app.get('/api/requests/:id', (req, res) => {
  req.query = { ...req.query, id: req.params.id };
  require('./api/requests/[id].js')(req, res);
});
app.post('/api/consent', require('./api/consent.js'));
app.get('/api/bootstrap', require('./api/bootstrap.js'));
app.post('/api/pricing/access', require('./api/pricing/access.js'));
app.get('/api/pricing/models', require('./api/pricing/models.js'));
app.post('/api/pricing/quotes', require('./api/pricing/quotes.js'));
app.post('/api/auth/:kind', (req, res) => {
  req.query = { ...req.query, kind: req.params.kind };
  require('./api/auth/[kind].js')(req, res);
});

// ---- static site ----
app.use(express.static(__dirname, { index: false }));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ message: 'Not found' });
  res.sendFile(path.join(__dirname, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Truffl site running at http://localhost:${port}`));
