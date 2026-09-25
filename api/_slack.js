// Shared helper: post a message to Slack via an Incoming Webhook.
// Needs env var SLACK_WEBHOOK_URL (set it in Vercel: Settings -> Environment Variables).
// Create one at https://api.slack.com/apps -> your app -> "Incoming Webhooks" ->
// "Add New Webhook to Workspace" -> pick the channel -> copy the URL it gives you.
async function notifySlack(text) {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) {
    console.warn('[slack] SLACK_WEBHOOK_URL is not set — skipping notify. Would have posted:', text);
    return { sent: false, reason: 'SLACK_WEBHOOK_URL not configured' };
  }
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!resp.ok) {
    const body = await resp.text().catch(() => '');
    console.error('[slack] webhook post failed', resp.status, body);
    return { sent: false, reason: `Slack responded ${resp.status}` };
  }
  return { sent: true };
}

module.exports = { notifySlack };
