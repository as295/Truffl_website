// Durable, dependency-free JSON record store.
//
// One file per record, sharded by month:  <collection>/<YYYY-MM>/<id>.json
// In production TRUFFL_DATA_DIR points at a clone of as295/truffl-automations,
// so every record is committed and survives a server rebuild.
const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');

const ROOT = path.resolve(process.env.TRUFFL_DATA_DIR || path.join(__dirname, '..', '.data'));
const safe = (v) => /^[A-Za-z0-9._-]{1,120}$/.test(String(v || '')) && !String(v).includes('..');
const month = (iso) => String(iso || new Date().toISOString()).slice(0, 7);

async function save(collection, record) {
  if (!safe(collection) || !safe(record.id)) throw new Error('unsafe collection or id');
  const dir = path.join(ROOT, collection, month(record.createdAt));
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, `${record.id}.json`), JSON.stringify(record, null, 2) + '\n', 'utf8');
  return record;
}

/** Records are sharded by month, and a lookup only knows the id, so scan the shards. */
function locate(collection, id) {
  if (!safe(collection) || !safe(id)) return null;
  const base = path.join(ROOT, collection);
  if (!fsSync.existsSync(base)) return null;
  for (const shard of fsSync.readdirSync(base)) {
    const file = path.join(base, shard, `${id}.json`);
    if (fsSync.existsSync(file)) return file;
  }
  return null;
}

async function read(collection, id) {
  const file = locate(collection, id);
  if (!file) return null;
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    return null;
  }
}

async function update(collection, id, patch) {
  const current = await read(collection, id);
  if (!current) return null;
  return save(collection, { ...current, ...patch, updatedAt: new Date().toISOString() });
}

// Back-compatible names used by the request endpoints.
const saveRequest = (record) => save('requests', record);
const readRequest = (id) => read('requests', id);
const updateRequest = (id, patch) => update('requests', id, patch);

module.exports = { ROOT, save, read, update, saveRequest, readRequest, updateRequest };
