// Local development server. Mirrors what Vercel does in production:
// - serves index.html for every non-/api route (client-side router)
// - runs the /api/*.js files as plain Express handlers
//
// Usage: npm install && npm run dev   →  http://localhost:3000
const path = require('path');
const express = require('express');

const app = express();
app.use(express.json());

// ---- wire up the /api handlers exactly as Vercel would ----
app.post('/api/requests', require('./api/requests.js'));
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
