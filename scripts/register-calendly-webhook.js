#!/usr/bin/env node
/*
 * One-time helper: subscribe this site's /api/calendly endpoint to Calendly.
 *
 *   CALENDLY_API_TOKEN=... node scripts/register-calendly-webhook.js
 *   CALENDLY_API_TOKEN=... node scripts/register-calendly-webhook.js --list
 *   CALENDLY_API_TOKEN=... node scripts/register-calendly-webhook.js --delete <uuid>
 *
 * Get the token at Calendly → Integrations → API & webhooks → personal access
 * token. Webhooks need a Calendly Standard plan or above.
 *
 * The response contains a `signing_key`. Put it in the server's .env as
 * CALENDLY_WEBHOOK_SIGNING_KEY and restart, or deliveries are rejected as
 * unsigned (which is the safe default).
 */
const TOKEN = process.env.CALENDLY_API_TOKEN;
const CALLBACK = process.env.CALENDLY_CALLBACK_URL || 'https://trufflinnovations.in/api/calendly';
const API = 'https://api.calendly.com';

if (!TOKEN) {
  console.error('Set CALENDLY_API_TOKEN first (Calendly → Integrations → API & webhooks).');
  process.exit(1);
}

const call = async (path, init = {}) => {
  const resp = await fetch(path.startsWith('http') ? path : API + path, {
    ...init,
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  const text = await resp.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  if (!resp.ok) throw new Error(`${resp.status} ${typeof body === 'string' ? body : JSON.stringify(body)}`);
  return body;
};

(async () => {
  const me = await call('/users/me');
  const organization = me.resource.current_organization;
  const user = me.resource.uri;
  console.log('Calendly account:', me.resource.email, '\norganization:', organization);

  const [flag, value] = process.argv.slice(2);

  if (flag === '--list') {
    const list = await call(`/webhook_subscriptions?organization=${encodeURIComponent(organization)}&scope=organization&count=100`);
    for (const w of list.collection) console.log(`${w.uri}\n  ${w.state}  ${w.callback_url}  [${w.events.join(', ')}]`);
    if (!list.collection.length) console.log('(no subscriptions)');
    return;
  }

  if (flag === '--delete') {
    if (!value) { console.error('Pass the subscription uuid or URI.'); process.exit(1); }
    await call(value.startsWith('http') ? value : `/webhook_subscriptions/${value}`, { method: 'DELETE' });
    console.log('Deleted.');
    return;
  }

  const created = await call('/webhook_subscriptions', {
    method: 'POST',
    body: JSON.stringify({
      url: CALLBACK,
      events: ['invitee.created', 'invitee.canceled'],
      organization,
      user,
      scope: 'user',
    }),
  });
  console.log('\nSubscribed:', created.resource.uri);
  console.log('callback  :', created.resource.callback_url);
  console.log('\nAdd this to the server .env and restart:\n');
  console.log(`CALENDLY_WEBHOOK_SIGNING_KEY=${created.resource.signing_key || '(none returned — re-create the subscription)'}`);
})().catch((err) => { console.error('Failed:', err.message); process.exit(1); });
