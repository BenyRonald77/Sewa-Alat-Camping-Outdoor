const express = require('express');
const crypto = require('crypto');
const store = require('../lib/store');
const { isTanggalValid, durasiHari } = require('../lib/tanggal');
const { cekKetersediaan } = require('../lib/ketersediaan');

const router = express.Router();

function ambilAlatAtauNull(id) {
  return store.findById('alat', id);
}

function validasiFormPenyewaan(body) {
  const errors = [];
  const alatId = (body.alatId || '').trim();
  const namaPenyewa = (body.namaPenyewa || '').trim();
  const kontakPenyewa = (body.kontakPenyewa || '').trim();
  const tanggalMulai = (body.tanggalMulai || '').trim();
  const tanggalSelesai = (body.tanggalSelesai || '').trim();
  const jumlahUnit = Number(body.jumlahUnit);

  const alat = alatId ? ambilAlatAtauNull(alatId) : null;

  if (!alatId || !alat) errors.push('Pilih alat yang valid.');
  if (!namaPenyewa) errors.push('Nama penyewa wajib diisi.');
  if (!kontakPenyewa) errors.push('Kontak penyewa (nomor HP) wajib diisi.');
  if (!isTanggalValid(tanggalMulai)) errors.push('Tanggal mulai tidak valid.');
  if (!isTanggalValid(tanggalSelesai)) errors.push('Tanggal selesai tidak valid.');
  if (
    isTanggalValid(tanggalMulai) &&
    isTanggalValid(tanggalSelesai) &&
    tanggalSelesai < tanggalMulai
  ) {
    errors.push('Tanggal selesai tidak boleh sebelum tanggal mulai.');
  }
  if (!Number.isInteger(jumlahUnit) || jumlahUnit < 1) {
    errors.push('Jumlah unit yang disewa minimal 1.');
  }

  return {
    errors,
    alat,
    data: { alatId, namaPenyewa, kontakPenyewa, tanggalMulai, tanggalSelesai, jumlahUnit },
  };
}

router.get('/', (req, res, next) => {
  try {
    const semuaPenyewaan = store
      .readAll('penyewaan')
      .filter((p) => p.status === 'disewa')
      .sort((a, b) => a.tanggalSelesai.localeCompare(b.tanggalSelesai));
    const daftarAlat = store.readAll('alat');
    const alatMap = Object.fromEntries(daftarAlat.map((a) => [a.id, a]));
    const hariIni = new Date().toISOString().slice(0, 10);

    const penyewaanTampil = semuaPenyewaan.map((p) => ({
      ...p,
      alat: alatMap[p.alatId] || { nama: '(alat sudah dihapus)' },
      terlambat: p.tanggalSelesai < hariIni,
    }));

    res.render('penyewaan/index', {
      title: 'Penyewaan Aktif',
      penyewaanTampil,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/baru', (req, res, next) => {
  try {
    const daftarAlat = store.readAll('alat').sort((a, b) => a.nama.localeCompare(b.nama));
    res.render('penyewaan/form', {
      title: 'Buat Penyewaan Baru',
      daftarAlat,
      form: {
        alatId: req.query.alatId || '',
        namaPenyewa: '',
        kontakPenyewa: '',
        tanggalMulai: '',
        tanggalSelesai: '',
        jumlahUnit: 1,
      },
      errors: [],
      konflik: [],
    });
  } catch (err) {
    next(err);
  }
});

// Endpoint JSON dipakai form (public/js/penyewaan.js) untuk menampilkan
// pratinjau ketersediaan secara langsung sebelum staf menekan submit.
router.get('/cek-ketersediaan', (req, res, next) => {
  try {
    const { alatId, mulai, selesai, jumlah } = req.query;
    const alat = alatId ? ambilAlatAtauNull(String(alatId)) : null;
    const jumlahUnit = Number(jumlah);

    if (!alat || !isTanggalValid(mulai) || !isTanggalValid(selesai) || selesai < mulai || !Number.isInteger(jumlahUnit) || jumlahUnit < 1) {
      return res.status(400).json({ ok: false, pesan: 'Lengkapi alat, tanggal, dan jumlah unit yang valid terlebih dahulu.' });
    }

    const hasil = cekKetersediaan(alat, String(mulai), String(selesai), jumlahUnit);
    res.json({
      ok: hasil.ok,
      stokTotal: alat.stokTotal,
      konflik: hasil.konflik,
      durasiHari: durasiHari(String(mulai), String(selesai)),
      totalBiayaSewa: durasiHari(String(mulai), String(selesai)) * alat.hargaSewaPerHari * jumlahUnit,
      depositDibayar: alat.deposit * jumlahUnit,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/baru', (req, res, next) => {
  try {
    const { errors, alat, data } = validasiFormPenyewaan(req.body);
    const daftarAlat = store.readAll('alat').sort((a, b) => a.nama.localeCompare(b.nama));

    if (errors.length) {
      return res.status(400).render('penyewaan/form', {
        title: 'Buat Penyewaan Baru',
        daftarAlat,
        form: { ...data, jumlahUnit: req.body.jumlahUnit },
        errors,
        konflik: [],
      });
    }

    const hasil = cekKetersediaan(alat, data.tanggalMulai, data.tanggalSelesai, data.jumlahUnit);

    if (!hasil.ok) {
      return res.status(400).render('penyewaan/form', {
        title: 'Buat Penyewaan Baru',
        daftarAlat,
        form: data,
        errors: [
          `Stok "${alat.nama}" tidak cukup untuk ${data.jumlahUnit} unit pada rentang tanggal yang diminta. Lihat rincian tanggal yang bentrok di bawah.`,
        ],
        konflik: hasil.konflik,
      });
    }

    const durasi = durasiHari(data.tanggalMulai, data.tanggalSelesai);
    const totalBiayaSewa = durasi * alat.hargaSewaPerHari * data.jumlahUnit;
    const depositDibayar = alat.deposit * data.jumlahUnit;

    const penyewaan = store.insert('penyewaan', {
      id: crypto.randomUUID(),
      alatId: alat.id,
      namaPenyewa: data.namaPenyewa,
      kontakPenyewa: data.kontakPenyewa,
      jumlahUnit: data.jumlahUnit,
      tanggalMulai: data.tanggalMulai,
      tanggalSelesai: data.tanggalSelesai,
      hargaPerHariSaatSewa: alat.hargaSewaPerHari,
      totalBiayaSewa,
      depositDibayar,
      status: 'disewa',
      dibuatPada: new Date().toISOString(),
    });

    res.redirect(`/penyewaan/${penyewaan.id}`);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', (req, res, next) => {
  try {
    const penyewaan = store.findById('penyewaan', req.params.id);
    if (!penyewaan) {
      return res.status(404).render('error', {
        title: 'Transaksi Tidak Ditemukan',
        pesan: 'Transaksi penyewaan yang dicari tidak ditemukan.',
        saran: 'Kembali ke daftar penyewaan aktif.',
      });
    }
    const alat = store.findById('alat', penyewaan.alatId);
    res.render('penyewaan/detail', {
      title: 'Detail Penyewaan',
      penyewaan,
      alat: alat || { nama: '(alat sudah dihapus)' },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
