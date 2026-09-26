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

## What's real vs. still a stub

- **Contact / request-access forms** — now email `as@trufflinnovations.in` (via Resend) on every submission, with all the fields the visitor entered. They're still not written to a database, so `GET /api/requests/:id` (used to re-show a confirmation screen after a page reload) always reports "not found" — the front end already handles that gracefully by sending the visitor back to the form. Add a database if you want a persistent record beyond your inbox.
- **Pricing calculator** — now computes real estimates from Truffl's actual rate-card data (Deepgram/Sarvam/Azure STT, Murf/Sarvam/Cartesia/Fish Audio TTS, the OpenAI LLM pricing sheet), matching the numbers in your `Truffl_LLM_Pricing_Calculator` / `STT_Provider_Cost_Planner` / `TTS_Provider_Cost_Planner` workbooks. The one thing still a placeholder: the "Truffl platform" markup line is a flat ₹1 (see the `TODO` in `api/pricing/quotes.js`) — replace with your real margin. Update `api/pricing/models.js` whenever your rate card changes.
- **Magic-link auth / login** — **important:** this exported site never had real user accounts, passwords, or sessions built. Its own source has a comment saying so: "Auth success must come from a connected authentication service, never a local UI transition." Concretely: the `/login` form and the `/activate-account` + `/reset-password` "verify-token" step have **no success path in the front-end code at all** — even a correct password or a valid token can't get anyone past those screens today. This is pre-existing, not something broken by this repo.
  What *is* real now: `/forgot-password` emails a working, signed, 30-minute-expiring sign-in link (via Resend), and every login attempt + every link request posts a notification to Slack (via `api/_slack.js` / `SLACK_WEBHOOK_URL`) so you at least see the activity. Building actual accounts (a user database, password hashing, sessions/cookies) is a separate project — say the word if you want that built next.
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
