// Shared helper: send an email via Resend (https://resend.com).
// Needs env var RESEND_API_KEY (set it in Vercel: Settings -> Environment Variables).
// Optional env var MAIL_FROM (defaults to Resend's shared onboarding address, which
// works immediately but should be swapped for a verified trufflinnovations.in address
// once you've added and verified that domain in the Resend dashboard).
async function sendEmail({ to, subject, html, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY is not set — skipping send. Would have sent:', { to, subject });
    return { sent: false, reason: 'RESEND_API_KEY not configured' };
  }
  const from = process.env.MAIL_FROM || 'Truffl <onboarding@resend.dev>';
  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, subject, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
    });
    if (!resp.ok) {
      const body = await resp.text().catch(() => '');
      console.error('[email] Resend send failed', resp.status, body);
      return { sent: false, reason: `Resend responded ${resp.status}` };
    }
    return { sent: true };
  } catch (err) {
    // Network failure (DNS, timeout, etc.) — never let this crash the request that
    // triggered the email; the visitor's form submission should still succeed.
    console.error('[email] send threw', err.message);
    return { sent: false, reason: err.message };
  }
}

module.exports = { sendEmail };
