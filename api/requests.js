// POST /api/requests  body: { ...formFields, kind, idempotencyKey, attribution }
// Handles both the "Contact us" and "Request access" forms.
// TODO: persist to a real store (DB/CRM) and send a notification email
// (e.g. to as@trufflinnovations.in) instead of just echoing an id back.
const crypto = require('crypto');

module.exports = (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const body = req.body || {};
  if (!body.kind) return res.status(400).json({ message: 'Missing "kind" (contact | recover | access).' });

  const id = body.idempotencyKey || crypto.randomUUID();

  // TODO: write { id, kind, ...body, createdAt } somewhere durable.
  console.log('[api/requests] received submission', { id, kind: body.kind });

  res.status(200).json({
    id,
    kind: body.kind,
    createdAt: new Date().toISOString(),
  });
};
