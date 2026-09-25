// POST /api/pricing/quotes
// header: X-Calculator-Access: <token from /api/pricing/access>
// body: { idempotencyKey, inputs: { ...calculator selections } }
// TODO: compute a real quote from the selected models/volumes in `inputs`,
// and require/validate the access token instead of trusting any value.
module.exports = (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const token = req.headers['x-calculator-access'];
  if (!token) return res.status(401).json({ message: 'Missing calculator access token.' });

  const { inputs } = req.body || {};

  // Placeholder math — swap for the real pricing model.
  const estimatedMonthlyUsd = 0;

  res.status(200).json({
    estimatedMonthlyUsd,
    breakdown: [],
    inputsEcho: inputs || {},
  });
};
