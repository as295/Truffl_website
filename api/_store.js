// Durable, dependency-free JSON store for website submissions.
// One file per request under TRUFFL_DATA_DIR (default: .data/requests next to
// this repo). Enough to make GET /api/requests/:id real and to keep an
// approval queue; swap for a database or CRM when one exists.
const fs = require('fs/promises');
const path = require('path');

const DIR = path.resolve(process.env.TRUFFL_DATA_DIR || path.join(__dirname, '..', '.data'), 'requests');
const safe = (id) => /^[A-Za-z0-9._-]{1,120}$/.test(String(id || ''));

async function saveRequest(record) {
  if (!safe(record.id)) throw new Error('unsafe request id');
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(path.join(DIR, `${record.id}.json`), JSON.stringify(record, null, 2), 'utf8');
  return record;
}

async function readRequest(id) {
  if (!safe(id)) return null;
  try {
    return JSON.parse(await fs.readFile(path.join(DIR, `${id}.json`), 'utf8'));
  } catch {
    return null;
  }
}

async function updateRequest(id, patch) {
  const current = await readRequest(id);
  if (!current) return null;
  return saveRequest({ ...current, ...patch, updatedAt: new Date().toISOString() });
}

module.exports = { saveRequest, readRequest, updateRequest, DIR };
