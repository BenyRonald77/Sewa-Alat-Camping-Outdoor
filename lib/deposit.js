// Aturan potongan deposit berdasar kondisi unit saat pengembalian.
// Persentase ini adalah aturan bisnis awal (lihat PRD bagian Batasan) dan
// dapat disesuaikan pemilik toko di kemudian hari.

const KONDISI_VALID = ['baik', 'rusak_ringan', 'rusak_berat', 'hilang'];

const PERSENTASE_POTONGAN = {
  baik: 0,
  rusak_ringan: 0.3,
  rusak_berat: 1,
  hilang: 1,
};

const LABEL_KONDISI = {
  baik: 'Baik',
  rusak_ringan: 'Rusak Ringan',
  rusak_berat: 'Rusak Berat',
  hilang: 'Hilang',
};

// depositTotal adalah nominal deposit yang dibayar untuk seluruh unit pada
// satu transaksi (penyewaan.depositDibayar). Karena nilainya selalu
// depositPerUnitAlat * jumlahUnit (lihat routes/penyewaan.js), pembagian di
// bawah ini selalu genap tanpa sisa pecahan.
function hitungRincianPengembalian(depositTotal, jumlahUnit, kondisiUnit) {
  const depositPerUnit = depositTotal / jumlahUnit;
  let depositDikembalikan = 0;
  let depositDitahan = 0;
  let jumlahHilang = 0;

  const rincian = kondisiUnit.map((kondisi, index) => {
    const persen = PERSENTASE_POTONGAN[kondisi];
    const potongan = Math.round(depositPerUnit * persen);
    const kembali = depositPerUnit - potongan;
    depositDitahan += potongan;
    depositDikembalikan += kembali;
    if (kondisi === 'hilang') jumlahHilang += 1;
    return { unitKe: index + 1, kondisi, potongan, kembali };
  });

  return { rincian, depositDikembalikan, depositDitahan, jumlahHilang };
}

module.exports = {
  KONDISI_VALID,
  LABEL_KONDISI,
  PERSENTASE_POTONGAN,
  hitungRincianPengembalian,
};
