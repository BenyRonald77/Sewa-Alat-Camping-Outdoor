const express = require('express');
const store = require('../lib/store');

const router = express.Router();

const STATUS_VALID = ['disewa', 'selesai'];

router.get('/', (req, res, next) => {
  try {
    const semuaPenyewaan = store.readAll('penyewaan');
    const daftarAlat = store.readAll('alat');
    const semuaPengembalian = store.readAll('pengembalian');

    const alatMap = Object.fromEntries(daftarAlat.map((a) => [a.id, a]));
    const pengembalianMap = Object.fromEntries(semuaPengembalian.map((p) => [p.penyewaanId, p]));

    const statusFilter = STATUS_VALID.includes(req.query.status) ? req.query.status : '';

    const semuaTransaksi = semuaPenyewaan
      .slice()
      .sort((a, b) => b.dibuatPada.localeCompare(a.dibuatPada))
      .map((p) => {
        const pengembalian = pengembalianMap[p.id] || null;
        return {
          ...p,
          alatNama: (alatMap[p.alatId] || {}).nama || '(alat sudah dihapus)',
          pengembalian,
        };
      });

    const transaksiTampil = statusFilter
      ? semuaTransaksi.filter((t) => t.status === statusFilter)
      : semuaTransaksi;

    res.render('riwayat/index', {
      title: 'Riwayat Transaksi',
      transaksiTampil,
      totalTransaksiKeseluruhan: semuaTransaksi.length,
      statusFilter,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
