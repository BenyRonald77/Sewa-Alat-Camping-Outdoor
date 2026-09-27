const express = require('express');
const store = require('../lib/store');
const { isTanggalValid } = require('../lib/tanggal');
const { ringkasanRentang } = require('../lib/ketersediaan');

const router = express.Router();

router.get('/', (req, res, next) => {
  try {
    const daftarAlat = store.readAll('alat').sort((a, b) => a.nama.localeCompare(b.nama));
    const { alatId, mulai, selesai } = req.query;

    const form = {
      alatId: alatId || '',
      mulai: mulai || '',
      selesai: selesai || '',
    };

    if (!alatId && !mulai && !selesai) {
      return res.render('ketersediaan/index', {
        title: 'Ketersediaan Alat',
        daftarAlat,
        form,
        errors: [],
        hasil: null,
        alat: null,
      });
    }

    const errors = [];
    const alat = alatId ? store.findById('alat', String(alatId)) : null;

    if (!alat) errors.push('Pilih alat yang valid.');
    if (!isTanggalValid(mulai)) errors.push('Tanggal mulai tidak valid.');
    if (!isTanggalValid(selesai)) errors.push('Tanggal selesai tidak valid.');
    if (isTanggalValid(mulai) && isTanggalValid(selesai) && selesai < mulai) {
      errors.push('Tanggal selesai tidak boleh sebelum tanggal mulai.');
    }

    if (errors.length) {
      return res.status(400).render('ketersediaan/index', {
        title: 'Ketersediaan Alat',
        daftarAlat,
        form,
        errors,
        hasil: null,
        alat: null,
      });
    }

    const hasil = ringkasanRentang(alat, String(mulai), String(selesai));

    res.render('ketersediaan/index', {
      title: 'Ketersediaan Alat',
      daftarAlat,
      form,
      errors: [],
      hasil,
      alat,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
