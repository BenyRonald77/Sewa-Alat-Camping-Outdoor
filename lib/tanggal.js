// Utilitas tanggal. Semua tanggal disimpan dan dibandingkan sebagai string
// "YYYY-MM-DD" (inklusif kedua ujung), yang urutannya sama dengan urutan
// leksikografis string, sehingga perbandingan `<=`/`>=` string berlaku benar
// tanpa perlu parsing ke objek Date untuk perbandingan itu sendiri.

const TANGGAL_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function isTanggalValid(value) {
  if (typeof value !== 'string' || !TANGGAL_REGEX.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

// Dua rentang tanggal [aMulai, aSelesai] dan [bMulai, bSelesai] (keduanya
// inklusif) overlap jika aMulai <= bSelesai DAN aSelesai >= bMulai.
function rentangOverlap(aMulai, aSelesai, bMulai, bSelesai) {
  return aMulai <= bSelesai && aSelesai >= bMulai;
}

function daftarTanggalDalamRentang(mulai, selesai) {
  const hasil = [];
  let cur = new Date(`${mulai}T00:00:00Z`);
  const akhir = new Date(`${selesai}T00:00:00Z`);
  while (cur.getTime() <= akhir.getTime()) {
    hasil.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return hasil;
}

function durasiHari(mulai, selesai) {
  const a = new Date(`${mulai}T00:00:00Z`);
  const b = new Date(`${selesai}T00:00:00Z`);
  return Math.round((b.getTime() - a.getTime()) / 86400000) + 1;
}

function hariIniString() {
  return new Date().toISOString().slice(0, 10);
}

function formatTanggalIndonesia(value) {
  if (!isTanggalValid(value)) return value;
  const d = new Date(`${value}T00:00:00Z`);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

module.exports = {
  isTanggalValid,
  rentangOverlap,
  daftarTanggalDalamRentang,
  durasiHari,
  hariIniString,
  formatTanggalIndonesia,
};
