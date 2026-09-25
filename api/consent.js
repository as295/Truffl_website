// POST /api/consent  body: { policyVersion, categories, gpc }
// Saves the visitor's cookie-preference choice.
// TODO: persist per-visitor (cookie id) instead of just echoing back.
module.exports = (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const { policyVersion, categories, gpc } = req.body || {};
  res.status(200).json({
    timestamp: Date.now(),
    policyVersion: policyVersion || '2026-09-01',
    categories: categories || { necessary: true, analytics: false, advertising: false },
    gpc: !!gpc,
  });
};
