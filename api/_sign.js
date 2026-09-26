// Small signed-token helper shared by the approval links.
// A link mailed to the founder must not be guessable, and must not be
// actionable by an email scanner that merely fetches it (hence GET only ever
// renders a confirmation page; the state change is a POST).
const crypto = require('crypto');

const secret = () => process.env.AUTH_TOKEN_SECRET || 'dev-only-insecure-secret-change-me';

function sign(purpose, id) {
  return crypto.createHmac('sha256', secret()).update(`${purpose}:${id}`).digest('hex').slice(0, 40);
}

function verify(purpose, id, token) {
  const expected = Buffer.from(sign(purpose, id));
  const given = Buffer.from(String(token || ''));
  return expected.length === given.length && crypto.timingSafeEqual(expected, given);
}

module.exports = { sign, verify };
