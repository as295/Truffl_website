# Truffl website

The Truffl marketing site as a Node.js/Vercel project, so it can be edited and redeployed
without going through a chat tool. `index.html` is the entire site (a self-contained
single-page app — all CSS/JS/images are inlined, client-side routed via `pushState`).
`api/` holds Node serverless functions for the endpoints the page calls.

## Structure

`index.html` is **generated** — never edit it by hand (it is git-ignored). Edit the
pieces under `src/` and run `npm run build`; `npm start` / `npm run dev` build first
automatically.

```
src/
  manifest.json          the order in which parts are stitched together (append here to add a page)
  document-head.html     <head> + opening <body>
  pages/<name>.html      one file per page/view: home, pricing, platform, rr (revenue recovery),
                         cx (retail support), ent (enterprise), evals, appstudio, privacy, terms,
                         cookies, vision, trust, notfound, unavailable
  partials/              shared fragments — footer.html / footer-alt.html and
                         legal-header.html / legal-header-alt.html are pulled into pages with
                         <!-- @include partials/footer.html -->; cookie banner, auth dialog, mobile nav
  styles/site.css        the site-wide stylesheet (large: inlined images live here)
  styles/*.css           smaller, feature-specific stylesheets
  scripts/router.js      the client-side router (register a new page here: V, TITLE, HASH, ROUTE)
  scripts/*.js           one file per behaviour (home-scenes, rr-scenes, cx-support, pricing-calculator,
                         auth-and-consent, mobile-nav, animations, lottie runtime + data)
  document-tail.html     closing tags
build.js                 concatenates the above into index.html (byte-for-byte what was deployed before)
api/                     Node serverless functions for the endpoints the page calls (see below)
server.js                local dev / production server (serves index.html + runs api/)
vercel.json              SPA rewrite rule (everything but /api/* → index.html)
```

**Changing one page** = edit `src/pages/<name>.html` (and, if it has its own CSS/JS, the matching
file in `styles/` or `scripts/`), run `npm run build`, commit `src/` only.

**Adding a page** = create `src/pages/<name>.html` with `<div id="v-<name>" class="view">…</div>`,
add an entry for it in `src/manifest.json` next to the other pages, and register it in
`src/scripts/router.js` (the `V`, `TITLE`, `HASH` and `ROUTE` tables).

**Deploying** (Lightsail box): `cd /opt/truffl-website && git pull && npm run build && pm2 restart truffl-website`.

## Required environment variables (set these in Vercel → Settings → Environment Variables)

| Variable | Required for | Notes |
|---|---|---|
| `RESEND_API_KEY` | Contact/request-access emails, magic-link emails | Get one free at resend.com. Without it, forms still work for the visitor but no email is sent (a warning is logged). |
| `MAIL_FROM` | Optional | Defaults to Resend's shared `onboarding@resend.dev` address, which works immediately. Once you verify `trufflinnovations.in` as a sending domain in Resend, set this to something like `Truffl <hello@trufflinnovations.in>`. |
| `NOTIFY_EMAIL` | Optional | Where contact/request-access submissions get emailed. Defaults to `as@trufflinnovations.in`. |
| `AUTH_TOKEN_SECRET` | Magic-link auth | Any long random string, e.g. `openssl rand -hex 32`. Without it, a hardcoded dev-only secret is used — fine locally, **not safe in production**. |
| `SLACK_WEBHOOK_URL` | Slack notifications | Create at https://api.slack.com/apps -> your app -> Incoming Webhooks -> Add New Webhook to Workspace. Without it, notifications are just logged, not sent. |

## Customer journeys

Identity lives entirely on the builder app at `build.trufflinnovations.in`
(Next.js + Supabase Auth). This marketing site never stores a password or a
session. One password, one reset flow, one session cookie.

**Get access (gated invite)**

1. Visitor submits **Request access** on this site.
2. `POST /api/requests` stores the submission, emails `NOTIFY_EMAIL`, and posts
   to Slack. Both carry a signed **Approve** link.
3. Opening that link shows a confirmation page (a GET never changes state, since
   mail scanners prefetch links). Confirming it POSTs the approval.
4. Approval calls the builder app's invite endpoint when `TRUFFL_BUILD_INVITE_URL`
   is set. Until it exists, the approval is recorded and Slack tells you to
   invite the address from Supabase Auth by hand.
5. The invitee sets a password once, on the builder app, and lands in the
   workspace.

**Login** — the Login control links straight to `build.trufflinnovations.in/login`.
Every credential route on this site (`/login`, `/activate-account`,
`/reset-password`, `/forgot-password`, the reset and invitation screens)
redirects there, so each flow lives in exactly one place. Those local screens
are retained only as redirects; building them for real on the builder app is
tracked in the login requirements issue on `aatithyapersonal/Truffl`.

**Book a meeting** — the Calendly embed needs `CALENDLY_EVENT_URL`. Bookings
reach Slack and email through `POST /api/calendly`, which verifies Calendly's
HMAC signature and rejects deliveries older than five minutes. Register the
subscription once with `automations/register-calendly-webhook.js` in
[as295/truffl-automations](https://github.com/as295/truffl-automations) and put
the `signing_key` it prints into `.env`. Google Calendar is deliberately **not**
written by this code: Calendly's own Google Calendar connection does that, and
it keeps reschedules and cancellations correct.

## What's real vs. still a stub

- **Contact / request-access forms** — real. Persisted as JSON under
  `TRUFFL_DATA_DIR`, emailed via Resend, posted to Slack, and re-readable via
  `GET /api/requests/:id`. In production `TRUFFL_DATA_DIR` is a clone of the
  private [as295/truffl-automations](https://github.com/as295/truffl-automations)
  repository, so every record is committed and survives a server rebuild.
- **Notifications** — durable. Each one is written to `data/outbox/` whether or
  not `SLACK_WEBHOOK_URL` is set, recording whether it was delivered, so nothing
  is lost while the webhook is missing.
- **Approval** — real, signed, two-step. The invitation half is a stub until the
  builder app exposes an invite endpoint.
- **Pricing calculator** — computes real estimates from the rate card in
  `api/pricing/models.js`. The "Truffl platform" markup line is still a flat ₹1
  (see the `TODO` in `api/pricing/quotes.js`).
- **Cookie consent** — the banner and preferences dialog work and read their
  inventory from `/api/bootstrap`. The chosen consent is stored in the browser
  only; `consent` in the bootstrap response is still always `null`.
- **`api/auth/[kind].js`** — superseded. Kept so old links do not 500, but no
  page reaches it now that credential routes redirect to the builder app.
- **`/vision` and `/trust`** — placeholder pages; replace their content in
  `src/pages/vision.html` and `src/pages/trust.html`.

## Local development

```bash
npm install
npm run dev
```

Opens at http://localhost:3000 — the same routing Vercel uses in production. To test emails locally, create a `.env` file (not committed) with `RESEND_API_KEY=...` and load it however you prefer (e.g. `node -r dotenv/config server.js`), or just rely on the console warning and test the real send after deploying with the env var set in Vercel.

## Deploying to Vercel (replacing the current trufflinnovations.in deployment)

1. Push this repo to GitHub (already done if you're reading this from the repo).
2. Set the environment variables above in the Vercel project (Settings → Environment Variables) — at minimum `RESEND_API_KEY` and `AUTH_TOKEN_SECRET`.
3. In the Vercel dashboard, open the existing `trufflinnovations.in` project → **Settings →
   Git** → change the connected repository to this new GitHub repo (or disconnect the old
   one and import this repo fresh, then re-attach the `trufflinnovations.in` domain to it
   under **Settings → Domains**).
4. No build step or framework preset is needed — leave "Framework Preset" as **Other**.
   Vercel will serve `index.html` for the page and auto-deploy everything under `api/` as
   serverless functions.
5. Every `git push` to the connected branch redeploys automatically.

## Editing going forward

- Copy/layout/style changes: edit `index.html` directly — it's plain HTML/CSS/JS, just all
  in one file. Search for the section by its visible text or its `id`/`view` name (e.g.
  `id="v-cx"` for the retail-support page).
- Backend behavior: edit the relevant file in `api/`.
- Rate card changes: edit `api/pricing/models.js` (the math in `api/pricing/quotes.js` reads from it automatically).
- Commit and push — Vercel redeploys on every push once step 3 above is done.
