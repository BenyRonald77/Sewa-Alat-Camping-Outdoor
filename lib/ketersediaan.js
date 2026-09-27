// Mesin perhitungan ketersediaan alat. Satu fungsi bersama ini dipakai oleh
// validasi pembuatan penyewaan (routes/penyewaan.js) DAN halaman ketersediaan
// (routes/ketersediaan.js) agar logika overlap tanggal tidak pernah berbeda
// antara kedua tempat itu (lihat PRD bagian Kebutuhan Non-Fungsional).

const store = require('./store');
const { rentangOverlap, daftarTanggalDalamRentang } = require('./tanggal');

// Mengembalikan { "YYYY-MM-DD": unitTerpakai } untuk setiap tanggal dalam
// rentang [mulai, selesai], dihitung dari seluruh penyewaan berstatus
// "disewa" milik alat tsb yang rentangnya overlap, tidak termasuk
// `kecualiPenyewaanId` (dipakai saat mengevaluasi ulang penyewaan yang sudah
// ada, misalnya di masa depan untuk fitur ubah transaksi).
function hitungPemakaianHarian(alatId, mulai, selesai, kecualiPenyewaanId = null) {
  const tanggalList = daftarTanggalDalamRentang(mulai, selesai);
  const pemakaian = {};
  tanggalList.forEach((t) => {
    pemakaian[t] = 0;
  });

  const semuaPenyewaan = store.readAll('penyewaan');
  const penyewaanAktifAlat = semuaPenyewaan.filter(
    (p) => p.alatId === alatId && p.status === 'disewa' && p.id !== kecualiPenyewaanId
  );

  penyewaanAktifAlat.forEach((p) => {
    if (!rentangOverlap(p.tanggalMulai, p.tanggalSelesai, mulai, selesai)) return;
    tanggalList.forEach((t) => {
      if (t >= p.tanggalMulai && t <= p.tanggalSelesai) {
        pemakaian[t] += p.jumlahUnit;
      }
    });
  });

  return pemakaian;
}

// Mengecek apakah `jumlahUnit` unit tambahan bisa disewakan pada rentang
// [mulai, selesai] tanpa membuat pemakaian melebihi stok total pada tanggal
// manapun dalam rentang tsb. Mengembalikan { ok, konflik } di mana `konflik`
// adalah daftar { tanggal, tersedia } untuk setiap tanggal yang bentrok.
function cekKetersediaan(alat, mulai, selesai, jumlahUnit, kecualiPenyewaanId = null) {
  const pemakaian = hitungPemakaianHarian(alat.id, mulai, selesai, kecualiPenyewaanId);
  const konflik = [];

  Object.keys(pemakaian)
    .sort()
    .forEach((tanggal) => {
      const tersedia = alat.stokTotal - pemakaian[tanggal];
      if (tersedia < jumlahUnit) {
        konflik.push({ tanggal, tersedia: Math.max(tersedia, 0) });
      }
    });

  return { ok: konflik.length === 0, konflik, pemakaian };
}

// Ringkasan rentang: unit tersedia minimum di sepanjang rentang tsb, dipakai
// halaman ketersediaan (FR-4.2) supaya staf langsung tahu batas amannya.
function ringkasanRentang(alat, mulai, selesai) {
  const pemakaian = hitungPemakaianHarian(alat.id, mulai, selesai);
  const tanggalList = Object.keys(pemakaian).sort();
  let minTersedia = alat.stokTotal;
  let maxTerpakai = 0;
  const rincianHarian = tanggalList.map((tanggal) => {
    const terpakai = pemakaian[tanggal];
    const tersedia = alat.stokTotal - terpakai;
    if (tersedia < minTersedia) minTersedia = tersedia;
    if (terpakai > maxTerpakai) maxTerpakai = terpakai;
    return { tanggal, terpakai, tersedia };
  });

  return {
    stokTotal: alat.stokTotal,
    minTersedia: tanggalList.length ? minTersedia : alat.stokTotal,
    maxTerpakai,
    rincianHarian,
  };
}

module.exports = {
  hitungPemakaianHarian,
  cekKetersediaan,
  ringkasanRentang,
};
