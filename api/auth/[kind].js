// POST /api/auth/:kind  (kind is "recover" or "verify", driven by the form on the page)
//
// "recover" (body: { email }): emails a real, working sign-in link. The link carries a
// signed, expiring token — no database needed, since the token itself proves who it's
// for. Needs env var AUTH_TOKEN_SECRET set in Vercel (any long random string) and
// RESEND_API_KEY for the email to actually send (see api/_email.js).
//
// any other kind (e.g. "verify", body: { token, ... }): checks that token's signature
// and expiry and reports whether it's valid.
//
// TODO: once verified, actually establish a session (cookie/JWT) instead of just
// reporting ok:true — this proves the token is valid but doesn't log anyone in yet.
const crypto = require('crypto');
const { sendEmail } = require('../_email.js');

const TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

function sign(payload) {
  const secret = process.env.AUTH_TOKEN_SECRET || 'dev-only-insecure-secret-change-me';
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verify(token) {
  const secret = process.env.AUTH_TOKEN_SECRET || 'dev-only-insecure-secret-change-me';
  const [body, sig] = String(token || '').split('.');
  if (!body || !sig) return null;
  const expected = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  if (Date.now() > payload.exp) return null;
  return payload;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const { kind } = req.query;
  const body = req.body || {};

  if (kind === 'recover') {
    const email = (body.email || '').trim();
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const token = sign({ email, exp: Date.now() + TOKEN_TTL_MS });
    const origin = req.headers.origin || `https://${req.headers.host}`;
    const link = `${origin}/account/verify?token=${encodeURIComponent(token)}`;

    const result = await sendEmail({
      to: email,
      subject: 'Your Truffl sign-in link',
      html: `<p>Click below to sign in to Truffl. This link expires in 30 minutes.</p><p><a href="${link}">${link}</a></p>`,
    });

    console.log('[api/auth/recover]', { email, emailSent: result.sent });
    return res.status(200).json({ ok: true });
  }

  // Any other kind is treated as a token verification (e.g. "verify").
  const payload = verify(body.token);
  if (!payload) return res.status(400).json({ ok: false, message: 'This link is invalid or has expired.' });
  res.status(200).json({ ok: true, email: payload.email });
};
