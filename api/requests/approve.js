// GET  /api/requests/approve?id=…&token=…   renders a confirmation page
// POST /api/requests/approve                performs the approval
//
// Deliberately two steps: mail clients and link scanners prefetch URLs, so a
// GET must never change state. The token is an HMAC over the request id, so
// the link is unguessable but needs no session.
const { readRequest, updateRequest } = require('../_store.js');
const { verify } = require('../_sign.js');
const { notifySlack } = require('../_slack.js');
const { sendEmail } = require('../_email.js');
const { AUTH_ORIGIN, NOTIFY_TO } = require('../_config.js');

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const page = (title, body) => `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} · Truffl</title><style>body{font:16px/1.55 Arial,system-ui,sans-serif;color:#153471;background:#f3f6ff;margin:0;display:grid;place-items:center;min-height:100vh}
main{background:#fff;padding:32px;border-radius:14px;max-width:460px;width:calc(100% - 32px);box-shadow:0 10px 40px rgba(24,48,157,.08)}
h1{font-size:22px;margin:0 0 12px}dl{display:grid;grid-template-columns:auto 1fr;gap:6px 14px;margin:18px 0}dt{color:#64748b}dd{margin:0}
button{background:#3b66d6;color:#fff;border:0;border-radius:6px;padding:12px 20px;font:inherit;font-weight:700;cursor:pointer}</style><main>${body}</main>`;

module.exports = async (req, res) => {
  const id = (req.query && req.query.id) || (req.body && req.body.id) || '';
  const token = (req.query && req.query.token) || (req.body && req.body.token) || '';

  if (!verify('approve', id, token)) {
    res.status(403).setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.end(page('Link not valid', '<h1>This approval link is not valid.</h1><p>It may have been mistyped or superseded. Open the original notification again.</p>'));
  }

  const record = await readRequest(id);
  if (!record) {
    res.status(404).setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.end(page('Not found', '<h1>That request no longer exists.</h1>'));
  }

  if (req.method === 'GET') {
    const already = record.status === 'approved';
    res.status(200).setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.end(page('Approve access', `<h1>${already ? 'Already approved' : 'Approve workspace access?'}</h1>
<dl><dt>Name</dt><dd>${esc(record.fullName) || '&mdash;'}</dd><dt>Email</dt><dd>${esc(record.email) || '&mdash;'}</dd>
<dt>Company</dt><dd>${esc(record.company) || '&mdash;'}</dd><dt>Requested</dt><dd>${esc(record.createdAt)}</dd></dl>
${already ? `<p>Approved on ${esc(record.approvedAt)}.</p>` : `<form method="POST"><input type="hidden" name="id" value="${esc(id)}"><input type="hidden" name="token" value="${esc(token)}"><button type="submit">Approve and invite</button></form>`}`));
  }

  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const approvedAt = new Date().toISOString();
  let invite = { sent: false, reason: 'builder invite endpoint not configured' };

  // When the builder app exposes its invite endpoint, approval mints the
  // invitation directly. Until then approval is recorded and the founder is
  // told to invite from Supabase by hand.
  const inviteURL = process.env.TRUFFL_BUILD_INVITE_URL;
  const inviteSecret = process.env.TRUFFL_BUILD_INVITE_SECRET;
  if (inviteURL && inviteSecret) {
    try {
      const resp = await fetch(inviteURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${inviteSecret}` },
        body: JSON.stringify({ email: record.email, name: record.fullName, company: record.company, requestId: record.id }),
      });
      invite = resp.ok ? { sent: true } : { sent: false, reason: `builder app responded ${resp.status}` };
    } catch (err) {
      invite = { sent: false, reason: err.message };
    }
  }

  await updateRequest(id, { status: 'approved', approvedAt, invite });

  await notifySlack(`:white_check_mark: *Access approved* — ${record.email || '(no email)'}\n${invite.sent ? 'Invitation sent by the builder app.' : `Invite NOT sent automatically (${invite.reason}). Invite this address from Supabase Auth, redirect to ${AUTH_ORIGIN}.`}`);
  await sendEmail({
    to: NOTIFY_TO,
    subject: `Approved: ${record.email || record.id}`,
    html: `<p>Access approved for <strong>${esc(record.email)}</strong>.</p><p>${invite.sent ? 'The builder app sent the invitation.' : `Invitation was not sent automatically (${esc(invite.reason)}). Invite this address from Supabase Auth with the redirect set to ${esc(AUTH_ORIGIN)}.`}</p>`,
  });

  res.status(200).setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(page('Approved', `<h1>Approved.</h1><p>${esc(record.email)} is approved for workspace access.</p>
<p>${invite.sent ? 'The invitation email has been sent.' : `Invitation was <strong>not</strong> sent automatically (${esc(invite.reason)}). Invite this address from Supabase Auth, with the redirect set to ${esc(AUTH_ORIGIN)}.`}</p>`));
};
