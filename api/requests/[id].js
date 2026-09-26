// GET /api/requests/:id
// Re-shows a "submitted"/"received" confirmation screen after a reload.
// Returns only what that screen renders; never the full stored record.
const { readRequest } = require('../_store.js');

module.exports = async (req, res) => {
  const id = (req.query && req.query.id) || '';
  const record = await readRequest(id);
  if (!record) return res.status(404).json({ message: 'Not found' });
  res.status(200).json({
    id: record.id,
    kind: record.kind,
    createdAt: record.createdAt,
    fullName: record.fullName,
    email: record.email,
    company: record.company,
  });
};
