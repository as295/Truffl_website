// POST /api/requests   body: { ...formFields, kind, idempotencyKey, attribution }
// Handles the "Contact us" and "Request access" forms.
//
// On submission we: persist the record, email it to the founder, and post it to
// Slack with a one-click approval link. Approval is what eventually mints a
// builder-app invitation (see api/requests/approve.js).
const crypto = require('crypto');
const { sendEmail } = require('./_email.js');
const { notifySlack } = require('./_slack.js');
const { saveRequest } = require('./_store.js');
const { sign } = require('./_sign.js');
const { NOTIFY_TO, SITE_ORIGIN } = require('./_config.js');

const escapeHtml = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const body = req.body || {};
  if (!body.kind) return res.status(400).json({ message: 'Missing "kind" (contact | recover | access).' });

  const id = body.idempotencyKey || crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const wantsAccess = body.kind === 'access';

  const record = {
    id,
    kind: body.kind,
    createdAt,
    status: wantsAccess ? 'pending_approval' : 'received',
    fullName: body.fullName || body.name || '',
    email: body.email || '',
    company: body.company || '',
    fields: Object.fromEntries(Object.entries(body).filter(([k]) => !['kind', 'idempotencyKey'].includes(k))),
  };

  let stored = true;
  try {
    await saveRequest(record);
  } catch (err) {
    stored = false;
    console.error('[api/requests] could not persist submission', err.message);
  }

  const rows = Object.entries(record.fields)
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#5B5B5B">${escapeHtml(k)}</td><td style="padding:4px 0">${escapeHtml(typeof v === 'object' ? JSON.stringify(v) : v)}</td></tr>`)
    .join('');

  const approveURL = `${SITE_ORIGIN}/api/requests/approve?id=${encodeURIComponent(id)}&token=${sign('approve', id)}`;
  const approveBlock = wantsAccess
    ? `<p style="margin:24px 0"><a href="${approveURL}" style="background:#3b66d6;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:700">Review and approve access</a></p>`
    : '';

  const emailResult = await sendEmail({
    to: NOTIFY_TO,
    subject: `New Truffl website ${body.kind} submission`,
    html: `<h2>New "${escapeHtml(body.kind)}" submission</h2><table>${rows}</table>${approveBlock}<p style="color:#999;font-size:12px">id: ${escapeHtml(id)} &middot; ${createdAt}${stored ? '' : ' &middot; NOT PERSISTED'}</p>`,
    replyTo: body.email || undefined,
  });

  const who = [record.fullName, record.email, record.company].filter(Boolean).join(' · ') || '(no details)';
  const slackResult = await notifySlack(
    wantsAccess
      ? `:key: *Access requested* — ${who}\nApprove: ${approveURL}`
      : `:incoming_envelope: *New ${body.kind} submission* — ${who}\nid: ${id}`
  );

  console.log('[api/requests] received submission', { id, kind: body.kind, stored, emailSent: emailResult.sent, slackSent: slackResult.sent });

  res.status(200).json({ id, kind: body.kind, createdAt });
};
