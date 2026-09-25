// GET /api/requests/:id
// Used to re-show a "submitted"/"received" confirmation screen on reload.
// TODO: look the id up in the same store api/requests.js writes to.
// Until there's a real store, every id is reported as not-found, which the
// front end already handles gracefully (it just sends the visitor back to
// the form instead of showing a broken confirmation page).
module.exports = (req, res) => {
  res.status(404).json({ message: 'Not found' });
};
