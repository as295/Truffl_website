# Truffl website

The Truffl marketing site as a Node.js/Vercel project, so it can be edited and redeployed
without going through a chat tool. `index.html` is the entire site (a self-contained
single-page app — all CSS/JS/images are inlined, client-side routed via `pushState`).
`api/` holds Node serverless functions for the endpoints the page calls.

## Structure

```
index.html          the whole site (edit this directly for copy/layout/style changes)
api/
  bootstrap.js       GET  /api/bootstrap        cookie-consent config on page load
  consent.js         POST /api/consent          save a visitor's cookie choice
  requests.js        POST /api/requests          contact form / request-access form -> emails as@trufflinnovations.in
  requests/[id].js   GET  /api/requests/:id      re-fetch a submitted request
  auth/[kind].js     POST /api/auth/:kind        magic-link recover/verify (real signed tokens + email)
  pricing/access.js  POST /api/pricing/access    lead-gate for the pricing calculator
  pricing/models.js  GET  /api/pricing/models    real STT/TTS/LLM rate card
  pricing/quotes.js  POST /api/pricing/quotes    computes a real pricing estimate from that rate card
  _email.js          shared Resend email helper used by requests.js and auth/[kind].js
server.js            local dev server (mirrors Vercel's routing)
vercel.json          SPA rewrite rule (everything but /api/* → index.html)
```

## Required environment variables (set these in Vercel → Settings → Environment Variables)

| Variable | Required for | Notes |
|---|---|---|
| `RESEND_API_KEY` | Contact/request-access emails, magic-link emails | Get one free at resend.com. Without it, forms still work for the visitor but no email is sent (a warning is logged). |
| `MAIL_FROM` | Optional | Defaults to Resend's shared `onboarding@resend.dev` address, which works immediately. Once you verify `trufflinnovations.in` as a sending domain in Resend, set this to something like `Truffl <hello@trufflinnovations.in>`. |
| `NOTIFY_EMAIL` | Optional | Where contact/request-access submissions get emailed. Defaults to `as@trufflinnovations.in`. |
| `AUTH_TOKEN_SECRET` | Magic-link auth | Any long random string, e.g. `openssl rand -hex 32`. Without it, a hardcoded dev-only secret is used — fine locally, **not safe in production**. |

## What's real vs. still a stub

- **Contact / request-access forms** — now email `as@trufflinnovations.in` (via Resend) on every submission, with all the fields the visitor entered. They're still not written to a database, so `GET /api/requests/:id` (used to re-show a confirmation screen after a page reload) always reports "not found" — the front end already handles that gracefully by sending the visitor back to the form. Add a database if you want a persistent record beyond your inbox.
- **Pricing calculator** — now computes real estimates from Truffl's actual rate-card data (Deepgram/Sarvam/Azure STT, Murf/Sarvam/Cartesia/Fish Audio TTS, the OpenAI LLM pricing sheet), matching the numbers in your `Truffl_LLM_Pricing_Calculator` / `STT_Provider_Cost_Planner` / `TTS_Provider_Cost_Planner` workbooks. The one thing still a placeholder: the "Truffl platform" markup line is a flat ₹1 (see the `TODO` in `api/pricing/quotes.js`) — replace with your real margin. Update `api/pricing/models.js` whenever your rate card changes.
- **Magic-link auth** — recovery emails now actually send (via Resend) with a real, signed, 30-minute-expiring link, and the verify step checks that signature/expiry for real. It reports whether the token is valid but doesn't yet establish a logged-in session — add a cookie/JWT step once you're ready to wire up real accounts.
- **Calendly booking** — works as-is, it's a client-side embed, no backend needed.
- **`/vision` and `/trust`** — now have simple "coming soon" placeholder pages (matching the site's style) instead of dead links. Replace their content in `index.html` (search for `id="v-vision"` / `id="v-trust"`) whenever that copy is ready.
- The stray HTML comment and this being a plain HTML export are otherwise cleaned up — nothing left pointing at the tool this file was originally exported from.

None of the above blocks deploying — the site works and the forms/calculator/auth all behave correctly even before you add `RESEND_API_KEY`/`AUTH_TOKEN_SECRET`, they just won't send real email until those are set.

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
