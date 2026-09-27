# Sewa Alat Camping/Outdoor

Aplikasi web internal untuk toko penyewaan alat camping/outdoor: mengelola
inventaris alat, mencatat transaksi penyewaan per rentang tanggal,
memproses pengembalian dengan checklist kondisi barang, serta memantau
ketersediaan dan riwayat transaksi. Lihat `PRD.md` untuk cakupan lengkap dan
`DESIGN.md` untuk arahan desain.

## Instalasi

Butuh Node.js versi 22 ke atas.

```bash
npm install
```

## Menjalankan aplikasi

```bash
npm start
```

Aplikasi berjalan di `http://localhost:3000`. Untuk memakai port lain:

```bash
PORT=4000 npm start
```

## Reseed data (mengembalikan ke data contoh awal)

```bash
npm run seed
```

Perintah ini menulis ulang `data/alat.json` ke 8 alat contoh dan
mengosongkan `data/penyewaan.json`, `data/pengembalian.json`, dan
`data/logStok.json`. **Semua transaksi yang sudah tercatat akan hilang**,
jadi jalankan hanya saat memang ingin memulai dari kondisi bersih (mis. di
lingkungan pengembangan/demo).

## Struktur folder

```
server.js        titik masuk aplikasi (Express)
routes/           satu file per area fitur (alat, penyewaan, pengembalian, ketersediaan, riwayat)
views/            template EJS, satu folder per area fitur + partials/ untuk header-footer bersama
lib/              logika inti: store.js (penyimpanan JSON), tanggal.js (utilitas & overlap tanggal),
                  ketersediaan.js (mesin perhitungan ketersediaan, dipakai form penyewaan & halaman ketersediaan),
                  deposit.js (aturan potongan deposit), format.js (format rupiah)
public/           CSS murni (custom properties) dan JavaScript vanilla sisi klien, tanpa bundler
data/             penyimpanan data sebagai file JSON, satu file per koleksi
scripts/seed.js   skrip reseed data ke kondisi awal
```

## Alasan teknis

- **Node.js + Express + EJS, tanpa framework front-end**: aplikasi ini alat
  kerja internal skala kecil (satu toko/satu komputer kasir). Render
  server-side dengan EJS cukup untuk kebutuhan ini, tanpa biaya build step
  atau bundler yang menambah kompleksitas tanpa manfaat sepadan.
- **Penyimpanan file JSON sinkron (`lib/store.js`), bukan database**: skala
  penggunaan (satu lokasi, tidak banyak request bersamaan) tidak
  membutuhkan driver database. File JSON mudah diperiksa dan dicadangkan
  langsung dari folder `data/`, dan operasi tulis dibuat sinkron (`fs.*Sync`)
  supaya tidak ada race condition saat dua permintaan menulis koleksi yang
  sama secara berurutan.
- **Satu mesin ketersediaan dipakai dua tempat (`lib/ketersediaan.js`)**:
  validasi saat membuat penyewaan dan halaman ketersediaan sama-sama
  memanggil fungsi yang sama, supaya logika overlap rentang tanggal tidak
  pernah berbeda hasil antara kedua tempat itu.
- **CSS murni dengan custom properties, JavaScript vanilla tanpa bundler**:
  antarmuka cukup sederhana (form dan tabel) sehingga tidak membutuhkan
  framework front-end; ini juga menjaga aplikasi tetap mudah dijalankan
  tanpa langkah build tambahan.
- **Tidak ada autentikasi**: sesuai batasan pada `PRD.md`, aplikasi ini
  ditujukan untuk satu komputer kasir yang diakses staf toko, bukan sistem
  multi-pengguna dengan peran granular.
