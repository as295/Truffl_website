// POST /api/auth/:kind
//
// The front end's auth modal (/login, /forgot-password, /activate-account,
// /reset-password) can call this with 4 different "kind" values. Each expects a
// specific response shape — get it wrong and the modal just shows a generic error:
//
//   kind='login'          body: {token:'', email, password}   -> no success path exists
//                          in the front end at all yet (see NOTE below) — always
//                          falls through to a generic error regardless of what this
//                          returns. We still log/notify the attempt.
//   kind='recover'        body: {email}                        -> must return {sent:true}
//   kind='resend-invite'  body: {}                              -> must return
//                          {sent:true, maskedEmail} to show "invitation sent"
//   kind='verify-token'   body: {token, ...}                    -> must return
//                          {expired:true} for an invalid/expired token. A VALID token
//                          also has no success path wired up in the front end yet
//                          (same NOTE below) — there's no account/password-set step
//                          after it, so this can only usefully report "expired" or not.
//
// NOTE — there is no real login yet: this exported site never had user accounts,
// passwords, or sessions built. Its own source comment says as much: "Auth success
// must come from a connected authentication service, never a local UI transition."
// So "login" and "verify-token" have no code path in the page itself that shows
// success — building that (accounts DB, password hashing, sessions/cookies) is a
// separate, bigger task. What IS real here: emailing a working sign-in/reset link
// (recover) with a signed, expiring token, and Slack-notifying every login attempt
// and every link-request, since those are the actual signals available today.
//
// Needs AUTH_TOKEN_SECRET (signing), RESEND_API_KEY (api/_email.js), and
// SLACK_WEBHOOK_URL (api/_slack.js) set in Vercel for all of this to actually fire.
const crypto = require('crypto');
const { sendEmail } = require('../_email.js');
const { notifySlack } = require('../_slack.js');

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

function maskEmail(email) {
  return String(email || '').replace(/^(.).+(@.*)$/, '$1•••$2');
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const { kind } = req.query;
  const body = req.body || {};

  if (kind === 'login') {
    // No real credential store exists yet — this can't verify a password. Every
    // attempt is logged + Slack-notified so you at least see the activity; the page
    // itself will still show a generic error (see NOTE above) until real accounts exist.
    const email = (body.email || '').trim();
    console.log('[api/auth/login] attempt', { email });
    notifySlack(`:closed_lock_with_key: Login *attempted* for *${email || '(no email)'}*, no accounts system exists yet, so this could not be verified.`).catch(() => {});
    return res.status(401).json({ message: 'Login is not yet connected to a real account system.' });
  }

  if (kind === 'recover') {
    const email = (body.email || '').trim();
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const token = sign({ email, exp: Date.now() + TOKEN_TTL_MS });
    const origin = req.headers.origin || `https://${req.headers.host}`;
    const link = `${origin}/account/verify?token=${encodeURIComponent(token)}`;

    const emailResult = await sendEmail({
      to: email,
      subject: 'Your Truffl sign-in link',
      html: `<p>Click below to sign in to Truffl. This link expires in 30 minutes.</p><p><a href="${link}">${link}</a></p>`,
    });
    notifySlack(`:key: Sign-in / reset link requested for *${email}*`).catch(() => {});
    console.log('[api/auth/recover]', { email, emailSent: emailResult.sent });
    // Deliberately always "sent" (never reveals whether the account exists), matching
    // the page copy: "If a Truffl account exists for X, we've sent a reset link."
    return res.status(200).json({ sent: true });
  }

  if (kind === 'resend-invite') {
    // No invitation records exist yet (no accounts DB) — nothing real to resend to.
    // Stubbed so the UI flow doesn't dead-end; wire to a real invite store later.
    console.log('[api/auth/resend-invite] requested (no invitation store exists yet)');
    return res.status(200).json({ sent: false, message: 'Invitations are not yet connected to a real account system.' });
  }

  if (kind === 'verify-token') {
    const payload = verify(body.token);
    return res.status(200).json({ expired: !payload });
  }

  res.status(404).json({ message: 'Unknown auth action.' });
};
