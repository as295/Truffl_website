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
  requests.js        POST /api/requests          contact form / request-access form
  requests/[id].js   GET  /api/requests/:id      re-fetch a submitted request
  auth/[kind].js     POST /api/auth/:kind        magic-link recover/verify
  pricing/access.js  POST /api/pricing/access    lead-gate for the pricing calculator
  pricing/models.js  GET  /api/pricing/models    LLM/STT/TTS options + rates
  pricing/quotes.js  POST /api/pricing/quotes    computes a pricing estimate
server.js            local dev server (mirrors Vercel's routing)
vercel.json          SPA rewrite rule (everything but /api/* → index.html)
```

## ⚠️ Before you go live, read this

The `api/` handlers are **stubs**, not a real backend. They accept the same requests the
page sends and return well-shaped responses so nothing on the page crashes, but they don't
persist anything, send email, or issue real tokens — see the `TODO` comment at the top of
each file. Concretely, right now:

- **Contact / request-access forms** — submissions are logged to the function's console output and
  then forgotten. Nobody at Truffl gets notified. Wire `api/requests.js` up to a database
  and/or an email send (e.g. Resend/SendGrid to `as@trufflinnovations.in`) before relying on it.
- **Pricing calculator** — `api/pricing/models.js` returns placeholder model names/rates, and
  `api/pricing/quotes.js` always returns a $0 estimate. Replace both with your real rate card
  and math.
- **Magic-link auth** (`api/auth/[kind].js`) always reports success without actually emailing
  a link or checking a token.
- **Calendly booking** works as-is — it's a client-side embed (`assets.calendly.com`), no
  backend needed.
- `/vision` and `/trust` are linked from the nav/footer in a couple of places but there's no
  view for them in the SPA router — either add views for them or remove the links.
- The `<link rel="canonical">`/OG tags and a leftover HTML comment near the top of
  `index.html` still point at `truffl-site-review.aatithya-personal.chatgpt.site` (the tool
  this file was originally exported from) — update those to `https://trufflinnovations.in`.

None of this blocks deploying the site itself (the marketing pages, nav, and Calendly booking
all work with zero backend), but the forms and pricing calculator will silently no-op until
the TODOs above are done.

## Local development

```bash
npm install
npm run dev
```

Opens at http://localhost:3000 — the same routing Vercel uses in production.

## Deploying to Vercel (replacing the current trufflinnovations.in deployment)

1. Push this repo to GitHub (see below).
2. In the Vercel dashboard, open the existing `trufflinnovations.in` project → **Settings →
   Git** → change the connected repository to this new GitHub repo (or disconnect the old
   one and import this repo fresh, then re-attach the `trufflinnovations.in` domain to it
   under **Settings → Domains**).
3. No build step or framework preset is needed — leave "Framework Preset" as **Other**.
   Vercel will serve `index.html` for the page and auto-deploy everything under `api/` as
   serverless functions.
4. Every `git push` to the connected branch (e.g. `main`) redeploys automatically.

## Editing going forward

- Copy/layout/style changes: edit `index.html` directly — it's plain HTML/CSS/JS, just all
  in one file. Search for the section by its visible text or its `id`/`view` name (e.g.
  `id="v-cx"` for the retail-support page).
- Backend behavior: edit the relevant file in `api/`.
- Commit and push — Vercel redeploys on every push once step 2 above is done.
