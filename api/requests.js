// POST /api/requests  body: { ...formFields, kind, idempotencyKey, attribution }
// Handles both the "Contact us" and "Request access" forms.
// Emails the submission to as@trufflinnovations.in via Resend (see api/_email.js —
// requires RESEND_API_KEY to be set in Vercel; without it, submissions still return
// a receipt to the visitor but no email goes out, and a warning is logged).
//
// TODO: also persist submissions somewhere durable (DB/CRM) if you want a record
// beyond your inbox, and to make GET /api/requests/:id return real data.
const crypto = require('crypto');
const { sendEmail } = require('./_email.js');

const NOTIFY_TO = process.env.NOTIFY_EMAIL || 'as@trufflinnovations.in';

function escapeHtml(v) {
  return String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const body = req.body || {};
  if (!body.kind) return res.status(400).json({ message: 'Missing "kind" (contact | recover | access).' });

  const id = body.idempotencyKey || crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const fields = Object.entries(body)
    .filter(([k]) => !['kind', 'idempotencyKey'].includes(k))
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#5B5B5B">${escapeHtml(k)}</td><td style="padding:4px 0">${escapeHtml(typeof v === 'object' ? JSON.stringify(v) : v)}</td></tr>`)
    .join('');

  const result = await sendEmail({
    to: NOTIFY_TO,
    subject: `New Truffl website ${body.kind} submission`,
    html: `<h2>New "${escapeHtml(body.kind)}" submission</h2><table>${fields}</table><p style="color:#999;font-size:12px">id: ${id} · ${createdAt}</p>`,
    replyTo: body.email || undefined,
  });

  console.log('[api/requests] received submission', { id, kind: body.kind, emailSent: result.sent });

  res.status(200).json({ id, kind: body.kind, createdAt });
};
