// Single source of truth for the cross-domain wiring the site depends on.
// Identity lives entirely on the builder app; this marketing site never holds
// passwords or sessions. See README "Customer journeys".
const AUTH_ORIGIN = (process.env.TRUFFL_AUTH_ORIGIN || 'https://build.trufflinnovations.in').replace(/\/+$/, '');
const SITE_ORIGIN = (process.env.SITE_ORIGIN || 'https://trufflinnovations.in').replace(/\/+$/, '');
const NOTIFY_TO = process.env.NOTIFY_EMAIL || 'as@trufflinnovations.in';

module.exports = {
  AUTH_ORIGIN,
  SITE_ORIGIN,
  NOTIFY_TO,
  loginURL: () => `${AUTH_ORIGIN}/login`,
  // Set CALENDLY_EVENT_URL to the scheduling link, e.g.
  // https://calendly.com/truffl/30min . Until it is set the booking step shows
  // its own "email us instead" fallback rather than throwing.
  booking: () => {
    let url = process.env.CALENDLY_EVENT_URL || null;
    if (!url) return null;
    // The former consultation event is inactive on the current Calendly plan.
    // Preserve other configured event URLs and use the verified active event here.
    if (url.replace(/\/+$/, '') === 'https://calendly.com/as-trufflinnovations/truffl-consultation') {
      return { url: 'https://calendly.com/as-trufflinnovations/truffl', companyQuestion: null };
    }
    return { url, companyQuestion: process.env.CALENDLY_COMPANY_QUESTION || 'a1' };
  },
};
