// POST /api/pricing/access  body: { name, email }
// Gates the pricing calculator behind a lightweight lead-capture form.
// TODO: record the lead and decide on real access-token issuance/expiry.
const crypto = require('crypto');

module.exports = (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const { name, email } = req.body || {};
  if (!email) return res.status(400).json({ message: 'Email is required.' });

  console.log('[api/pricing/access] lead captured', { name, email });
  res.status(200).json({ token: crypto.randomBytes(16).toString('hex') });
};
