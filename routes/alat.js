const express = require('express');
const crypto = require('crypto');
const store = require('../lib/store');

const router = express.Router();

const KATEGORI_PILIHAN = ['Tenda', 'Tidur', 'Masak', 'Tas', 'Penerangan', 'Lainnya'];

function validasiAlat(body) {
  const errors = [];
  const nama = (body.nama || '').trim();
  const kategori = (body.kategori || '').trim();
  const stokTotal = Number(body.stokTotal);
  const hargaSewaPerHari = Number(body.hargaSewaPerHari);
  const deposit = Number(body.deposit);

  if (!nama) errors.push('Nama alat wajib diisi.');
  if (!kategori) errors.push('Kategori wajib diisi.');
  if (!Number.isInteger(stokTotal) || stokTotal < 0) {
    errors.push('Stok total unit harus berupa bilangan bulat 0 atau lebih.');
  }
  if (!Number.isFinite(hargaSewaPerHari) || hargaSewaPerHari < 0) {
    errors.push('Harga sewa per hari harus berupa angka 0 atau lebih.');
  }
  if (!Number.isFinite(deposit) || deposit < 0) {
    errors.push('Nominal deposit harus berupa angka 0 atau lebih.');
  }

  return {
    errors,
    data: { nama, kategori, stokTotal, hargaSewaPerHari, deposit },
  };
}

router.get('/', (req, res, next) => {
  try {
    const daftarAlat = store.readAll('alat').sort((a, b) => a.nama.localeCompare(b.nama));
    res.render('alat/index', {
      title: 'Inventaris Alat',
      daftarAlat,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/baru', (req, res) => {
  res.render('alat/form', {
    title: 'Tambah Alat',
    mode: 'baru',
    alat: { nama: '', kategori: '', stokTotal: '', hargaSewaPerHari: '', deposit: '' },
    kategoriPilihan: KATEGORI_PILIHAN,
    errors: [],
  });
});

router.post('/baru', (req, res, next) => {
  try {
    const { errors, data } = validasiAlat(req.body);
    if (errors.length) {
      return res.status(400).render('alat/form', {
        title: 'Tambah Alat',
        mode: 'baru',
        alat: { ...req.body },
        kategoriPilihan: KATEGORI_PILIHAN,
        errors,
      });
    }

    store.insert('alat', {
      id: crypto.randomUUID(),
      ...data,
      dibuatPada: new Date().toISOString(),
    });

    res.redirect('/alat');
  } catch (err) {
    next(err);
  }
});

router.get('/:id/ubah', (req, res, next) => {
  try {
    const alat = store.findById('alat', req.params.id);
    if (!alat) {
      return res.status(404).render('error', {
        title: 'Alat Tidak Ditemukan',
        pesan: 'Alat yang ingin diubah tidak ditemukan, mungkin sudah dihapus.',
        saran: 'Kembali ke daftar inventaris untuk memilih alat yang masih ada.',
      });
    }
    res.render('alat/form', {
      title: 'Ubah Alat',
      mode: 'ubah',
      alat,
      kategoriPilihan: KATEGORI_PILIHAN,
      errors: [],
    });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/ubah', (req, res, next) => {
  try {
    const alat = store.findById('alat', req.params.id);
    if (!alat) {
      return res.status(404).render('error', {
        title: 'Alat Tidak Ditemukan',
        pesan: 'Alat yang ingin diubah tidak ditemukan, mungkin sudah dihapus.',
        saran: 'Kembali ke daftar inventaris untuk memilih alat yang masih ada.',
      });
    }

    const { errors, data } = validasiAlat(req.body);
    if (errors.length) {
      return res.status(400).render('alat/form', {
        title: 'Ubah Alat',
        mode: 'ubah',
        alat: { ...alat, ...req.body },
        kategoriPilihan: KATEGORI_PILIHAN,
        errors,
      });
    }

    store.updateById('alat', req.params.id, data);
    res.redirect('/alat');
  } catch (err) {
    next(err);
  }
});

router.post('/:id/hapus', (req, res, next) => {
  try {
    const alat = store.findById('alat', req.params.id);
    if (!alat) {
      return res.status(404).render('error', {
        title: 'Alat Tidak Ditemukan',
        pesan: 'Alat yang ingin dihapus tidak ditemukan, mungkin sudah dihapus sebelumnya.',
        saran: 'Kembali ke daftar inventaris.',
      });
    }

    const penyewaanAktif = store
      .readAll('penyewaan')
      .some((p) => p.alatId === req.params.id && p.status === 'disewa');

    if (penyewaanAktif) {
      const daftarAlat = store.readAll('alat').sort((a, b) => a.nama.localeCompare(b.nama));
      return res.status(400).render('alat/index', {
        title: 'Inventaris Alat',
        daftarAlat,
        errorHapus: `"${alat.nama}" tidak bisa dihapus karena masih ada penyewaan aktif yang menggunakan alat ini. Selesaikan dahulu pengembaliannya di menu Pengembalian.`,
      });
    }

    store.removeById('alat', req.params.id);
    res.redirect('/alat');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
