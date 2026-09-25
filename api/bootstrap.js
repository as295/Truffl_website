// GET /api/bootstrap
// Called on every page load to fetch cookie-consent config + any saved consent.
// TODO: replace with a real config/consent store (e.g. a database row per session/cookie).
module.exports = (req, res) => {
  res.status(200).json({
    consent: null, // e.g. { timestamp, categories: { necessary: true, analytics: false, advertising: false } }
    policyVersion: '2026-09-01',
  });
};
