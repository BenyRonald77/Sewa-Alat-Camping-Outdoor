// Penyimpanan data sederhana berbasis file JSON, sinkron.
// Dipilih karena skala penggunaan (satu toko/satu komputer kasir) tidak
// membutuhkan driver database, dan file JSON mudah diperiksa/dicadangkan
// langsung tanpa alat tambahan. Operasi tulis sinkron agar tidak terjadi
// race condition saat dua request menulis koleksi yang sama.

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

function filePath(collection) {
  return path.join(DATA_DIR, `${collection}.json`);
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readAll(collection) {
  ensureDataDir();
  const fp = filePath(collection);
  if (!fs.existsSync(fp)) return [];
  const raw = fs.readFileSync(fp, 'utf-8');
  if (!raw || !raw.trim()) return [];
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Gagal membaca data/${collection}.json: ${err.message}`);
  }
}

function writeAll(collection, records) {
  ensureDataDir();
  fs.writeFileSync(filePath(collection), JSON.stringify(records, null, 2) + '\n', 'utf-8');
}

function insert(collection, record) {
  const all = readAll(collection);
  all.push(record);
  writeAll(collection, all);
  return record;
}

function findById(collection, id) {
  return readAll(collection).find((r) => r.id === id) || null;
}

function updateById(collection, id, patch) {
  const all = readAll(collection);
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch };
  writeAll(collection, all);
  return all[idx];
}

function removeById(collection, id) {
  const all = readAll(collection);
  const next = all.filter((r) => r.id !== id);
  const removed = all.length !== next.length;
  if (removed) writeAll(collection, next);
  return removed;
}

module.exports = {
  readAll,
  writeAll,
  insert,
  findById,
  updateById,
  removeById,
};
