// POST /api/auth/:kind  (kind is "recover" or "verify", driven by the form on the page)
// TODO: wire up real magic-link / token verification and email sending.
module.exports = (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const { kind } = req.query;
  const body = req.body || {};

  if (kind === 'recover') {
    // body: { email }
    console.log('[api/auth/recover] would email a recovery link to', body.email);
    return res.status(200).json({ ok: true });
  }

  // body: { token, ... } — e.g. verifying a magic link
  console.log('[api/auth/' + kind + ']', body);
  res.status(200).json({ ok: true });
};
