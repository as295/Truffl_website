// GET /api/bootstrap
// Called on every page load. Supplies the cookie-consent policy, the cookie
// inventory the preferences dialog renders, and the booking link the scheduling
// step embeds. The front end reads config.inventory and config.booking.url, so
// both must always be present as the right shape or those screens throw.
const { booking } = require('./_config.js');

const INVENTORY = [
  { id: 'necessary', provider: 'Truffl', name: 'truffl_privacy_choice', purpose: 'Remembers your cookie choices so we do not ask again.', duration: '12 months', party: 'First party' },
  { id: 'necessary', provider: 'Truffl', name: 'truffl_request_receipt', purpose: 'Lets a confirmation screen reappear if you reload the page.', duration: 'Session', party: 'First party' },
  { id: 'functional', provider: 'Calendly', name: 'Calendly scheduling embed', purpose: 'Loads the embedded calendar so you can pick a meeting time.', duration: 'Set by Calendly', party: 'Third party', detailsUrl: 'https://calendly.com/legal/cookie-policy' },
];

module.exports = (req, res) => {
  res.status(200).json({
    consent: null, // TODO: return a stored choice once consent is persisted per visitor
    policyVersion: '2026-09-01',
    inventory: INVENTORY,
    booking: booking() || { url: null, companyQuestion: null },
  });
};
