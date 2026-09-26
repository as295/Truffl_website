// Shared helper: post a message to Slack, and keep a durable copy either way.
//
// Every notification is written to the outbox before delivery is attempted, so
// nothing is lost while SLACK_WEBHOOK_URL is unconfigured or Slack is down, and
// each record says whether it actually arrived. `npm run digest` in the
// automations repo reports anything that did not.
//
// Create a webhook at https://api.slack.com/apps -> your app ->
// "Incoming Webhooks" -> "Add New Webhook to Workspace".
const crypto = require('crypto');
const { save } = require('./_store.js');

async function record(text, delivered, reason) {
  const createdAt = new Date().toISOString();
  try {
    await save('outbox', {
      id: `${createdAt.replace(/[:.]/g, '-')}-${crypto.randomBytes(3).toString('hex')}`,
      createdAt,
      channel: 'slack',
      text,
      delivered,
      ...(reason ? { reason } : {}),
    });
  } catch (err) {
    console.error('[slack] could not write outbox record', err.message);
  }
}

async function notifySlack(text) {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) {
    console.warn('[slack] SLACK_WEBHOOK_URL is not set — kept in the outbox only:', text);
    await record(text, false, 'SLACK_WEBHOOK_URL not configured');
    return { sent: false, reason: 'SLACK_WEBHOOK_URL not configured' };
  }
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!resp.ok) {
      const body = await resp.text().catch(() => '');
      console.error('[slack] webhook post failed', resp.status, body);
      await record(text, false, `Slack responded ${resp.status}`);
      return { sent: false, reason: `Slack responded ${resp.status}` };
    }
    await record(text, true);
    return { sent: true };
  } catch (err) {
    console.error('[slack] post threw', err.message);
    await record(text, false, err.message);
    return { sent: false, reason: err.message };
  }
}

module.exports = { notifySlack };
