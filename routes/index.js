const express = require('express');
const store = require('../lib/store');

const router = express.Router();

router.get('/', (req, res, next) => {
  try {
    const daftarAlat = store.readAll('alat');
    const totalUnit = daftarAlat.reduce((sum, a) => sum + a.stokTotal, 0);

    res.render('index', {
      title: 'Dashboard',
      jumlahAlat: daftarAlat.length,
      totalUnit,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
