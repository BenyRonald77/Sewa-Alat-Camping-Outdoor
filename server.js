const express = require('express');
const path = require('path');

const routesIndex = require('./routes/index');
const routesAlat = require('./routes/alat');
const routesPenyewaan = require('./routes/penyewaan');
const { formatRupiah } = require('./lib/format');
const { formatTanggalIndonesia } = require('./lib/tanggal');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Tersedia di semua view tanpa perlu require manual di tiap template.
app.locals.formatRupiah = formatRupiah;
app.locals.formatTanggalIndonesia = formatTanggalIndonesia;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Variabel global untuk view: path aktif dipakai partials/header.ejs untuk
// menandai menu navigasi yang sedang dibuka.
app.use((req, res, next) => {
  res.locals.path = req.path;
  next();
});

app.use('/', routesIndex);
app.use('/alat', routesAlat);
app.use('/penyewaan', routesPenyewaan);

app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Halaman Tidak Ditemukan',
    pesan: `Halaman "${req.path}" tidak ada di aplikasi ini.`,
    saran: 'Periksa kembali alamat yang dituju, atau kembali ke dashboard.',
  });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', {
    title: 'Terjadi Kesalahan',
    pesan: err.message || 'Terjadi kesalahan tak terduga di server.',
    saran: 'Coba ulangi beberapa saat lagi. Jika berulang, periksa log server di terminal.',
  });
});

app.listen(PORT, () => {
  console.log(`Sewa Alat Camping/Outdoor berjalan di http://localhost:${PORT}`);
});
