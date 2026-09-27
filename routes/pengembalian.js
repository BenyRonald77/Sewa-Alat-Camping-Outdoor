const express = require('express');
const crypto = require('crypto');
const store = require('../lib/store');
const { KONDISI_VALID, hitungRincianPengembalian } = require('../lib/deposit');

const router = express.Router();

router.get('/', (req, res, next) => {
  try {
    const daftarAlat = store.readAll('alat');
    const alatMap = Object.fromEntries(daftarAlat.map((a) => [a.id, a]));
    const hariIni = new Date().toISOString().slice(0, 10);

    const penyewaanAktif = store
      .readAll('penyewaan')
      .filter((p) => p.status === 'disewa')
      .sort((a, b) => a.tanggalSelesai.localeCompare(b.tanggalSelesai))
      .map((p) => ({
        ...p,
        alat: alatMap[p.alatId] || { nama: '(alat sudah dihapus)' },
        terlambat: p.tanggalSelesai < hariIni,
      }));

    res.render('pengembalian/index', {
      title: 'Pengembalian',
      penyewaanAktif,
    });
  } catch (err) {
    next(err);
  }
});

// Didefinisikan sebelum '/:penyewaanId' agar path literal "/selesai/..."
// tidak tertangkap sebagai parameter penyewaanId.
router.get('/selesai/:pengembalianId', (req, res, next) => {
  try {
    const pengembalian = store.findById('pengembalian', req.params.pengembalianId);
    if (!pengembalian) {
      return res.status(404).render('error', {
        title: 'Data Tidak Ditemukan',
        pesan: 'Catatan pengembalian ini tidak ditemukan.',
        saran: 'Kembali ke daftar pengembalian.',
      });
    }
    const penyewaan = store.findById('penyewaan', pengembalian.penyewaanId);
    const alat = penyewaan ? store.findById('alat', penyewaan.alatId) : null;

    res.render('pengembalian/selesai', {
      title: 'Pengembalian Selesai',
      pengembalian,
      penyewaan: penyewaan || { namaPenyewa: '(data tidak ditemukan)' },
      alat: alat || { nama: '(alat sudah dihapus)' },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:penyewaanId', (req, res, next) => {
  try {
    const penyewaan = store.findById('penyewaan', req.params.penyewaanId);
    if (!penyewaan || penyewaan.status !== 'disewa') {
      return res.status(404).render('error', {
        title: 'Transaksi Tidak Ditemukan',
        pesan: 'Transaksi penyewaan ini tidak ditemukan atau sudah selesai diproses.',
        saran: 'Kembali ke daftar pengembalian untuk memilih transaksi yang masih aktif.',
      });
    }
    const alat = store.findById('alat', penyewaan.alatId);

    res.render('pengembalian/form', {
      title: 'Proses Pengembalian',
      penyewaan,
      alat: alat || { nama: '(alat sudah dihapus)' },
      errors: [],
      catatan: '',
    });
  } catch (err) {
    next(err);
  }
});

router.post('/:penyewaanId', (req, res, next) => {
  try {
    const penyewaan = store.findById('penyewaan', req.params.penyewaanId);
    if (!penyewaan || penyewaan.status !== 'disewa') {
      return res.status(404).render('error', {
        title: 'Transaksi Tidak Ditemukan',
        pesan: 'Transaksi penyewaan ini tidak ditemukan atau sudah selesai diproses.',
        saran: 'Kembali ke daftar pengembalian untuk memilih transaksi yang masih aktif.',
      });
    }
    const alat = store.findById('alat', penyewaan.alatId);
    const catatan = (req.body.catatan || '').trim();

    let kondisiUnit = req.body.kondisi;
    if (!Array.isArray(kondisiUnit)) kondisiUnit = kondisiUnit ? [kondisiUnit] : [];

    const errors = [];
    if (kondisiUnit.length !== penyewaan.jumlahUnit) {
      errors.push(`Isi kondisi untuk seluruh ${penyewaan.jumlahUnit} unit yang disewa.`);
    }
    kondisiUnit.forEach((k, idx) => {
      if (!KONDISI_VALID.includes(k)) {
        errors.push(`Kondisi unit ke-${idx + 1} tidak valid.`);
      }
    });

    if (errors.length) {
      return res.status(400).render('pengembalian/form', {
        title: 'Proses Pengembalian',
        penyewaan,
        alat: alat || { nama: '(alat sudah dihapus)' },
        errors,
        catatan,
      });
    }

    const { rincian, depositDikembalikan, depositDitahan, jumlahHilang } = hitungRincianPengembalian(
      penyewaan.depositDibayar,
      penyewaan.jumlahUnit,
      kondisiUnit
    );

    const pengembalian = store.insert('pengembalian', {
      id: crypto.randomUUID(),
      penyewaanId: penyewaan.id,
      kondisiUnit,
      catatan,
      depositDikembalikan,
      depositDitahan,
      diprosesPada: new Date().toISOString(),
    });

    store.updateById('penyewaan', penyewaan.id, { status: 'selesai' });

    if (jumlahHilang > 0 && alat) {
      const stokBaru = Math.max(alat.stokTotal - jumlahHilang, 0);
      store.updateById('alat', alat.id, { stokTotal: stokBaru });
      store.insert('logStok', {
        id: crypto.randomUUID(),
        alatId: alat.id,
        perubahan: -jumlahHilang,
        alasan: `${jumlahHilang} unit dinyatakan hilang pada pengembalian transaksi ${penyewaan.namaPenyewa} (${penyewaan.tanggalMulai} s/d ${penyewaan.tanggalSelesai}).`,
        waktu: new Date().toISOString(),
      });
    }

    res.redirect(`/pengembalian/selesai/${pengembalian.id}`);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
