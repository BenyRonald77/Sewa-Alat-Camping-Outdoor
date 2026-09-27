const express = require('express');
const store = require('../lib/store');

const router = express.Router();

router.get('/', (req, res, next) => {
  try {
    const daftarAlat = store.readAll('alat');
    const totalUnit = daftarAlat.reduce((sum, a) => sum + a.stokTotal, 0);
    const semuaPenyewaan = store.readAll('penyewaan');
    const hariIni = new Date().toISOString().slice(0, 10);
    const penyewaanAktif = semuaPenyewaan.filter((p) => p.status === 'disewa');
    const penyewaanTerlambat = penyewaanAktif.filter((p) => p.tanggalSelesai < hariIni);

    res.render('index', {
      title: 'Dashboard',
      jumlahAlat: daftarAlat.length,
      totalUnit,
      jumlahPenyewaanAktif: penyewaanAktif.length,
      jumlahTerlambat: penyewaanTerlambat.length,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
