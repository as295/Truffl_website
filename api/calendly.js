// POST /api/calendly — Calendly webhook receiver.
//
// Calendly signs every delivery: `Calendly-Webhook-Signature: t=<unix>,v1=<hmac>`
// where the HMAC is SHA-256 over `${t}.${rawBody}` keyed with the signing key
// Calendly returned when the subscription was created. We verify that before
// trusting anything in the payload, and we reject deliveries older than five
// minutes so a captured request cannot be replayed.
//
// Google Calendar is NOT written here. Calendly writes the event into the
// connected Google Calendar itself (Calendly → Account → Calendar connection),
// which is the supported path and keeps reschedules and cancellations correct.
// This endpoint is only the Slack/email notification.
const crypto = require('crypto');
const { notifySlack } = require('./_slack.js');
const { sendEmail } = require('./_email.js');
const { NOTIFY_TO } = require('./_config.js');

const TOLERANCE_SECONDS = 300;

function verifySignature(rawBody, header, key) {
  if (!key) return { ok: false, reason: 'CALENDLY_WEBHOOK_SIGNING_KEY not configured' };
  const parts = Object.fromEntries(String(header || '').split(',').map((p) => p.split('=').map((s) => s.trim())));
  const { t, v1 } = parts;
  if (!t || !v1) return { ok: false, reason: 'malformed signature header' };
  if (Math.abs(Math.floor(Date.now() / 1000) - Number(t)) > TOLERANCE_SECONDS) return { ok: false, reason: 'signature timestamp outside tolerance' };
  const expected = crypto.createHmac('sha256', key).update(`${t}.${rawBody}`).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(v1);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return { ok: false, reason: 'signature mismatch' };
  return { ok: true };
}

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const raw = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(req.body || {});
  const check = verifySignature(raw, req.headers['calendly-webhook-signature'], process.env.CALENDLY_WEBHOOK_SIGNING_KEY);
  if (!check.ok) {
    console.warn('[api/calendly] rejected delivery:', check.reason);
    return res.status(401).json({ message: 'Invalid signature' });
  }

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return res.status(400).json({ message: 'Invalid JSON' });
  }

  const event = payload.event;
  const p = payload.payload || {};
  const invitee = p.name || p.email || 'someone';
  const startsAt = p.scheduled_event?.start_time || '';
  const eventName = p.scheduled_event?.name || 'a meeting';
  const when = startsAt ? new Date(startsAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'short' }) : 'time unknown';
  const answers = (p.questions_and_answers || []).map((q) => `${q.question}: ${q.answer}`).join('\n');

  if (event === 'invitee.created') {
    await notifySlack(`:calendar: *Meeting booked* — ${invitee} (${p.email || 'no email'})\n*${eventName}* · ${when} IST${answers ? `\n${answers}` : ''}`);
    await sendEmail({
      to: NOTIFY_TO,
      subject: `Booked: ${eventName} with ${invitee}`,
      html: `<p><strong>${esc(invitee)}</strong> (${esc(p.email)}) booked <strong>${esc(eventName)}</strong>.</p><p>${esc(when)} IST</p>${answers ? `<pre>${esc(answers)}</pre>` : ''}<p style="color:#999;font-size:12px">Calendly has added this to the connected Google Calendar.</p>`,
    });
  } else if (event === 'invitee.canceled') {
    await notifySlack(`:x: *Meeting cancelled* — ${invitee} (${p.email || 'no email'})\n*${eventName}* · was ${when} IST${p.cancellation?.reason ? `\nReason: ${p.cancellation.reason}` : ''}`);
  } else {
    console.log('[api/calendly] ignoring event', event);
  }

  res.status(200).json({ ok: true });
};
