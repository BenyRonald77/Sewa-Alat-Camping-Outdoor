# Catatan Verifikasi Manual (R-35)

Verifikasi dijalankan dengan `npm install` lalu `node server.js` di latar
belakang, kemudian diklik-tembus lewat `curl` untuk setiap alur inti. Data
direset ke kondisi awal (`npm run seed`) sebelum dan sesudah pengujian.
Tidak ada error di konsol server sepanjang pengujian (`server.log` bersih,
hanya baris "Sewa Alat Camping/Outdoor berjalan di http://localhost:3000").

## 1. Navigasi & routing

| Elemen | Aksi | Hasil |
|---|---|---|
| `/` | GET | 200, dashboard tampil dengan statistik |
| `/alat`, `/alat/baru` | GET | 200 |
| `/penyewaan`, `/penyewaan/baru` | GET | 200 |
| `/pengembalian` | GET | 200 |
| `/ketersediaan` | GET | 200 |
| `/riwayat` | GET | 200 |
| `/tidak-ada` | GET | 404, halaman error actionable dengan tombol kembali ke dashboard |

Seluruh item navbar (Dashboard, Inventaris Alat, Penyewaan, Pengembalian,
Ketersediaan, Riwayat Transaksi) mengarah ke halaman yang benar-benar ada,
tidak ada dead link.

## 2. State kosong (empty state)

- `/penyewaan` sebelum ada transaksi -> "Belum ada penyewaan aktif" + tombol
  "Buat Penyewaan Baru". PASS.
- `/riwayat` sebelum ada transaksi -> "Belum ada transaksi tercatat" + tombol
  ke form penyewaan. PASS.
- `/riwayat?status=disewa` saat semua transaksi berstatus lain -> pesan beda
  ("Tidak ada transaksi dengan status ini") dengan tombol reset filter.
  PASS (diuji manual saat hanya ada transaksi selesai).
- `/ketersediaan` sebelum alat & rentang dipilih -> "Belum ada rentang
  tanggal dipilih". PASS.

## 3. Validasi ketersediaan & overlap tanggal (FR-2)

Alat uji: **Tenda Dome 4 Orang**, stok total 5, harga Rp45.000/hari, deposit
Rp150.000/unit.

**Langkah A** - Sewa 4 unit, 2026-12-01 s/d 2026-12-05 (Andi):
- Hasil: `302 Found` -> transaksi tersimpan.
- Total biaya sewa: 5 hari x 45.000 x 4 unit = **Rp900.000** (benar).
- Deposit dibayar: 150.000 x 4 = **Rp600.000** (benar).

**Langkah B** - Overlap sebagian (2026-12-03 s/d 2026-12-08), minta **2 unit**
(Bella): sisa unit pada tanggal overlap (12-03 s/d 12-05) hanya 1 (5 stok - 4
terpakai).
- Hasil: `400 Bad Request`, pesan menyebutkan tanggal bentrok: "hanya
  tersisa 1 unit" untuk 2026-12-03, 04, 05. **DITOLAK sesuai spesifikasi.**

**Langkah C** - Overlap sebagian yang sama, minta **1 unit** (Citra):
- Hasil: `302 Found` -> **DITERIMA**, karena sisa 1 unit masih cukup untuk
  permintaan 1 unit. Sesuai spesifikasi (validasi bukan sekadar cek stok
  global, tapi per hari dalam rentang overlap).

**Validasi tambahan:**
- Tanggal selesai sebelum tanggal mulai -> ditolak dengan pesan "Tanggal
  selesai tidak boleh sebelum tanggal mulai". PASS.
- Endpoint pratinjau `GET /penyewaan/cek-ketersediaan` mengembalikan JSON
  konsisten dengan hasil validasi form (`ok:false`, daftar konflik per
  tanggal, estimasi biaya). PASS.

## 4. Pengembalian dan potongan deposit (FR-3)

Transaksi Andi (4 unit, deposit Rp600.000, deposit per unit Rp150.000)
dikembalikan dengan kondisi campuran: **baik, rusak_ringan, rusak_berat,
hilang**.

| Kondisi | Potongan diharapkan | Kembali diharapkan |
|---|---|---|
| Baik | 0 | 150.000 |
| Rusak ringan (30%) | 45.000 | 105.000 |
| Rusak berat (100%) | 150.000 | 0 |
| Hilang (100%) | 150.000 | 0 |
| **Total** | **345.000** | **255.000** |

Hasil aktual dari `data/pengembalian.json` setelah submit:
`depositDikembalikan: 255000`, `depositDitahan: 345000`. **Cocok persis.**

Efek samping yang diverifikasi:
- Status transaksi berubah dari `disewa` menjadi `selesai`. PASS.
- Stok total "Tenda Dome 4 Orang" berkurang dari 5 menjadi **4** (permanen,
  karena 1 unit hilang), tercatat di `data/logStok.json` dengan alasan yang
  jelas ("1 unit dinyatakan hilang pada pengembalian transaksi Andi..."). PASS.
- Unit berkondisi baik/rusak ringan/rusak berat tidak mengurangi stok total
  (hanya status transaksi yang berubah, sehingga unit itu otomatis terhitung
  tersedia lagi lewat mesin ketersediaan). PASS.

## 5. Halaman ketersediaan dan riwayat (FR-4)

Setelah langkah 3-4 di atas (stok total alat ini sekarang 4, Citra masih
menyewa 1 unit aktif pada 2026-12-03 s/d 2026-12-08):

- `GET /ketersediaan?alatId=...&mulai=2026-12-03&selesai=2026-12-06`
  menampilkan **3 / 4** pada setiap tanggal (4 stok - 1 terpakai Citra).
  **Benar.**
- `GET /riwayat?status=selesai` menampilkan transaksi Andi. **Benar.**
- `GET /riwayat?status=disewa` menampilkan transaksi Citra, tidak
  menampilkan Andi. **Benar**, filter status bekerja sesuai status transaksi
  yang sebenarnya.

## 6. Validasi lain

- Tambah alat dengan stok negatif -> ditolak, pesan "Stok total unit harus
  berupa bilangan bulat 0 atau lebih". PASS.
- Hapus alat yang masih punya penyewaan aktif -> ditolak dengan pesan yang
  menyebutkan alasan ("masih ada penyewaan aktif..."), alat tidak terhapus.
  PASS.

## 7. Aksesibilitas & responsif (diperiksa lewat kode, lihat catatan)

- Semua elemen interaktif memakai elemen native (`button`, `a`, `input`,
  `select`) yang otomatis bisa dijangkau `Tab`/`Enter`/`Space`.
- `outline` fokus tidak pernah dihapus tanpa pengganti; `:focus-visible`
  diberi outline 3px warna aksen di `public/css/style.css`.
- Menu mobile (`#navToggle`) memakai `aria-expanded`, dapat ditutup dengan
  `Escape` (lihat `public/js/main.js`), dan seluruh link menu punya tinggi
  minimum 44px sesuai target sentuh.
- Layout dasar dites lewat container fluid + breakpoint `640px`/`780px`/
  `860px`/`960px` di CSS; tabel dibungkus `.table-wrap` dengan
  `overflow-x: auto` supaya tidak memicu overflow horizontal pada layar
  sempit.

## 8. Verifikasi tambahan setelah polish CSS (kontras & bayangan header)

Setelah PRD/DESIGN/fitur inti selesai, dua perbaikan kecil ditambahkan dan
diverifikasi ulang:

- Warna teks status kuning (`--color-warn`) digelapkan dari `#a3641a` menjadi
  `#8a5316` karena kontras sebelumnya terhadap latar tag (`#f4e6cf`) hanya
  3.88:1, di bawah ambang WCAG AA untuk teks normal (4.5:1). Dihitung ulang
  dengan rumus kontras WCAG: hasil baru **5.13:1**, di atas ambang. Warna lain
  (Bark di atas Sand/Card, Sand di atas Forest, teks putih gading di atas
  Rust, warna tag baik/bad) sudah diperiksa dan seluruhnya di atas 4.5:1
  sebelum maupun sesudah perubahan ini.
- Token `--shadow-float` yang sebelumnya didefinisikan tapi tidak dipakai kini
  diterapkan satu kali pada header sticky, dengan alasan tertulis di kode
  (header ini sungguh mengambang di atas konten yang di-scroll). Dosis
  bayangan tetap pada 1 elemen, sesuai batas R-12.

Setelah kedua perubahan ini di-commit, server dijalankan ulang
(`node server.js`) dan seluruh rute inti dicek lagi lewat `curl`: `/`,
`/alat`, `/alat/baru`, `/penyewaan`, `/penyewaan/baru`, `/pengembalian`,
`/ketersediaan`, `/riwayat` seluruhnya **200**, `/tidak-ada` **404**. Log
server (`server.log`) bersih tanpa error. Data di `data/` tidak berubah
(tidak ada transaksi uji yang tertinggal). Server dimatikan setelah
pengujian.

## Kesimpulan

Semua skenario wajib pada R-35 (buat penyewaan yang menghabiskan sebagian
stok, penyewaan overlap yang ditolak, penyewaan overlap yang diterima,
pengembalian kondisi campuran, potongan deposit, dan pengurangan stok
permanen saat hilang) **PASS**. Data telah direset ke kondisi awal
(`npm run seed`) setelah pengujian ini, dan server pengujian sudah
dimatikan.
