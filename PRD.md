# PRD — Aplikasi Sewa Alat Camping/Outdoor

## 1. Ringkasan

Aplikasi web internal untuk toko penyewaan alat camping/outdoor. Dipakai oleh staf
di meja layanan untuk mengelola inventaris alat, mencatat transaksi penyewaan per
rentang tanggal, memproses pengembalian beserta pengecekan kondisi barang, dan
memantau ketersediaan alat serta riwayat transaksi.

## 2. Latar Belakang

Toko penyewaan alat outdoor saat ini mencatat stok dan transaksi secara manual
(buku/spreadsheet), yang rawan salah hitung ketersediaan saat ada beberapa
penyewaan dengan rentang tanggal yang tumpang-tindih (overlap), serta tidak
punya catatan baku untuk potongan deposit saat barang kembali dalam kondisi
rusak atau hilang. Aplikasi ini dibangun untuk merapikan proses tersebut dalam
satu sistem yang bisa dijalankan di satu komputer/laptop toko.

## 3. Tujuan

- Staf dapat mengelola data alat (tambah/ubah/hapus) beserta stok, harga sewa
  harian, dan nominal deposit.
- Staf dapat membuat transaksi penyewaan baru dengan validasi ketersediaan yang
  benar-benar memperhitungkan rentang tanggal yang tumpang-tindih, bukan sekadar
  sisa stok global saat ini.
- Staf dapat memproses pengembalian dengan pengecekan kondisi per unit dan
  sistem menghitung otomatis potongan deposit sesuai kondisi barang.
- Staf dapat melihat ketersediaan alat untuk rentang tanggal tertentu sebelum
  menjanjikan alat ke penyewa, serta melihat riwayat seluruh transaksi.

## 4. Peran Pengguna

- **Admin/Staf**: satu peran operasional tunggal (tidak ada login multi-level
  pada versi ini). Admin/Staf mengelola inventaris, mencatat transaksi
  penyewaan dan pengembalian, serta melihat laporan ketersediaan dan riwayat.
- **Penyewa**: bukan pengguna aplikasi. Data penyewa (nama, kontak) dicatat oleh
  staf sebagai bagian dari data transaksi, penyewa tidak mengakses sistem.

## 5. Ruang Lingkup

### Termasuk dalam ruang lingkup
- CRUD data alat/inventaris.
- Pembuatan transaksi penyewaan dengan validasi ketersediaan per rentang tanggal.
- Proses pengembalian dengan checklist kondisi per unit dan perhitungan deposit.
- Halaman ketersediaan (per alat, per rentang tanggal) dan riwayat transaksi.
- Dashboard ringkasan operasional.

### Tidak termasuk (di luar ruang lingkup)
- Login/autentikasi multi-pengguna dan manajemen peran granular.
- Pembayaran online/payment gateway (pencatatan biaya & deposit bersifat manual/tunai).
- Notifikasi otomatis (SMS/email/WhatsApp) ke penyewa.
- Aplikasi mobile native.

## 6. User Stories

1. Sebagai staf, saya ingin menambah alat baru beserta stok, harga sewa, dan
   deposit, supaya inventaris toko tercatat rapi.
2. Sebagai staf, saya ingin mengubah atau menghapus data alat, supaya data
   inventaris tetap akurat saat ada perubahan harga atau alat yang tidak
   disewakan lagi.
3. Sebagai staf, saya ingin mengecek berapa unit sebuah alat yang masih
   tersedia pada rentang tanggal tertentu, supaya saya tidak menjanjikan alat
   yang sebenarnya sudah dipakai penyewa lain pada tanggal tersebut.
4. Sebagai staf, saya ingin sistem menolak transaksi penyewaan baru dengan
   pesan yang jelas jika stok tidak cukup pada rentang tanggal yang diminta,
   supaya saya tidak salah janji ke penyewa.
5. Sebagai staf, saya ingin sistem menghitung otomatis total biaya sewa dan
   deposit saat transaksi dibuat, supaya saya tidak perlu menghitung manual.
6. Sebagai staf, saya ingin mencatat kondisi tiap unit alat saat pengembalian
   (baik/rusak ringan/rusak berat/hilang), supaya potongan deposit tercatat
   adil dan konsisten.
7. Sebagai staf, saya ingin sistem menghitung otomatis nominal deposit yang
   dikembalikan vs ditahan berdasarkan kondisi barang, supaya saya tidak perlu
   menghitung manual dan tidak ada perselisihan dengan penyewa.
8. Sebagai staf, saya ingin stok alat yang hilang dikurangi permanen dari stok
   total (bukan sekadar kembali "tersedia"), supaya laporan inventaris tetap
   akurat.
9. Sebagai staf, saya ingin melihat riwayat seluruh transaksi penyewaan dan
   status deposit tiap transaksi, supaya saya bisa menelusuri histori jika ada
   pertanyaan dari penyewa atau pemilik toko.
10. Sebagai staf, saya ingin melihat ringkasan kondisi operasional (jumlah alat,
    penyewaan aktif, alat jatuh tempo) di satu halaman dashboard, supaya saya
    tahu prioritas kerja hari ini.

## 7. Functional Requirements

### FR-1 — Manajemen Inventaris Alat
- FR-1.1 Sistem harus menampilkan daftar semua alat beserta kategori, stok
  total unit, harga sewa per hari, dan nominal deposit.
- FR-1.2 Sistem harus menyediakan form tambah alat baru dengan field: nama,
  kategori, stok total unit, harga sewa per hari, nominal deposit.
- FR-1.3 Sistem harus memvalidasi bahwa nama alat wajib diisi, stok total unit
  adalah bilangan bulat >= 0, harga sewa dan deposit adalah angka >= 0.
- FR-1.4 Sistem harus menyediakan form ubah data alat yang sudah ada.
- FR-1.5 Sistem harus menyediakan aksi hapus alat, dengan konfirmasi, dan
  menolak penghapusan jika alat tersebut masih memiliki transaksi berstatus
  "disewa" yang aktif (mencegah data transaksi menjadi rusak/yatim).
- FR-1.6 Sistem harus mencatat log perubahan stok total (mis. akibat unit
  hilang) sebagai riwayat yang bisa ditelusuri (FR-3.7).

### FR-2 — Cek Ketersediaan dan Pembuatan Penyewaan
- FR-2.1 Sistem harus menyediakan form penyewaan baru: pilih alat, nama
  penyewa, kontak penyewa, tanggal mulai, tanggal selesai, jumlah unit yang
  diminta.
- FR-2.2 Sistem harus menghitung jumlah unit yang sudah terpakai pada setiap
  tanggal dalam rentang yang diminta, berdasarkan seluruh transaksi berstatus
  "disewa" yang rentang tanggalnya **overlap** dengan rentang yang diminta.
  Dua rentang tanggal overlap jika `mulai_A <= selesai_B` DAN `selesai_A >=
  mulai_B`.
- FR-2.3 Sistem harus menolak transaksi baru jika pada satu atau lebih tanggal
  dalam rentang yang diminta, `unit_terpakai + unit_diminta > stok_total`, dan
  pesan penolakan harus menyebutkan tanggal-tanggal yang bentrok serta sisa
  unit yang tersedia pada tanggal tersebut.
- FR-2.4 Jika stok mencukupi di seluruh rentang tanggal, sistem membuat
  transaksi baru berstatus "disewa" dan menyimpan: alat, jumlah unit, tanggal
  mulai, tanggal selesai, durasi hari (inklusif kedua tanggal), harga per hari
  saat transaksi dibuat, total biaya sewa (`durasi_hari * harga_per_hari *
  jumlah_unit`), dan nominal deposit yang harus dibayar
  (`nominal_deposit_alat * jumlah_unit`).
- FR-2.5 Sistem harus menampilkan ringkasan biaya (total sewa + deposit)
  sebelum/-saat transaksi disimpan.

### FR-3 — Pengembalian dan Checklist Kondisi Barang
- FR-3.1 Sistem harus menyediakan form pengembalian untuk setiap transaksi
  berstatus "disewa", menampilkan jumlah unit yang disewa pada transaksi
  tersebut.
- FR-3.2 Form pengembalian harus menyediakan checklist kondisi per unit dengan
  4 opsi: baik, rusak ringan, rusak berat, hilang, serta catatan bebas per
  transaksi.
- FR-3.3 Sistem harus menghitung potongan deposit otomatis berdasarkan
  kondisi tiap unit:
  - Baik: deposit unit tersebut dikembalikan 100%.
  - Rusak ringan: dipotong 30% dari deposit per unit, sisanya dikembalikan.
  - Rusak berat: dipotong 100% dari deposit per unit (ditahan penuh).
  - Hilang: dipotong 100% dari deposit per unit (ditahan penuh).
- FR-3.4 Sistem harus mencatat nominal deposit yang dikembalikan vs ditahan
  per transaksi, dan mengubah status transaksi menjadi "selesai" setelah
  pengembalian diproses.
- FR-3.5 Sistem harus menambah kembali stok tersedia alat sebesar jumlah unit
  berkondisi baik/rusak ringan/rusak berat (unit fisik kembali ke gudang),
  KECUALI unit berkondisi "hilang".
- FR-3.6 Untuk unit berkondisi "hilang", sistem harus mengurangi stok total
  alat tersebut secara permanen (bukan hanya stok terpakai).
- FR-3.7 Sistem harus mencatat log perubahan stok (alat, jumlah, alasan,
  waktu) setiap kali stok total berubah akibat unit hilang, agar dapat
  ditelusuri dari halaman riwayat.

### FR-4 — Halaman Ketersediaan dan Riwayat Transaksi
- FR-4.1 Sistem harus menyediakan halaman untuk memilih alat dan rentang
  tanggal, lalu menampilkan rekap harian: stok total, unit terpakai, unit
  tersedia untuk setiap tanggal dalam rentang tersebut.
- FR-4.2 Sistem harus menampilkan ringkasan rentang (unit tersedia minimum di
  sepanjang rentang tersebut) agar staf bisa langsung tahu apakah rentang
  tersebut aman untuk dijanjikan.
- FR-4.3 Sistem harus menyediakan halaman riwayat transaksi yang menampilkan
  seluruh transaksi (aktif dan selesai) beserta status deposit (dibayar,
  dikembalikan, ditahan) dan dapat difilter berdasarkan status.

## 8. Data Model

### Tabel `alat`
| Field | Tipe | Keterangan |
|---|---|---|
| id | string (uuid) | primary key |
| nama | string | nama alat, wajib |
| kategori | string | mis. Tenda, Tas, Alat Masak |
| stokTotal | integer | total unit dimiliki toko (berkurang permanen jika ada unit hilang) |
| hargaSewaPerHari | integer | rupiah per unit per hari |
| deposit | integer | rupiah per unit |
| dibuatPada | string (ISO datetime) | waktu pencatatan |

### Tabel `penyewaan`
| Field | Tipe | Keterangan |
|---|---|---|
| id | string (uuid) | primary key |
| alatId | string | relasi ke `alat.id` |
| namaPenyewa | string | dicatat staf |
| kontakPenyewa | string | dicatat staf |
| jumlahUnit | integer | unit yang disewa |
| tanggalMulai | string (YYYY-MM-DD) | inklusif |
| tanggalSelesai | string (YYYY-MM-DD) | inklusif |
| hargaPerHariSaatSewa | integer | disalin dari alat saat transaksi dibuat |
| totalBiayaSewa | integer | durasi_hari * harga * unit |
| depositDibayar | integer | deposit_per_unit * unit |
| status | enum | `disewa` \| `selesai` |
| dibuatPada | string (ISO datetime) | waktu transaksi dibuat |

### Tabel `pengembalian`
| Field | Tipe | Keterangan |
|---|---|---|
| id | string (uuid) | primary key |
| penyewaanId | string | relasi ke `penyewaan.id` |
| kondisiUnit | array of string | daftar kondisi tiap unit, panjang = jumlahUnit, nilai: `baik` \| `rusak_ringan` \| `rusak_berat` \| `hilang` |
| catatan | string | catatan bebas, boleh kosong |
| depositDikembalikan | integer | rupiah |
| depositDitahan | integer | rupiah |
| diprosesPada | string (ISO datetime) | waktu pengembalian diproses |

### Tabel `logStok`
| Field | Tipe | Keterangan |
|---|---|---|
| id | string (uuid) | primary key |
| alatId | string | relasi ke `alat.id` |
| perubahan | integer | negatif = pengurangan stok total |
| alasan | string | mis. "Unit hilang pada pengembalian #..." |
| waktu | string (ISO datetime) | |

## 9. Kebutuhan Non-Fungsional

- **Akurasi ketersediaan tanggal**: perhitungan overlap rentang tanggal harus
  konsisten (inklusif kedua ujung tanggal) di semua tempat yang menghitungnya
  (form penyewaan, halaman ketersediaan), memakai satu fungsi bersama supaya
  tidak ada logika ganda yang bisa berbeda hasil.
- **Aksesibilitas**: seluruh halaman dapat dioperasikan penuh dengan keyboard
  (tab, enter, escape), kontras teks memenuhi WCAG AA (4.5:1 teks normal,
  3:1 teks besar), target sentuh tombol minimal 44x44px untuk penggunaan di
  layar sentuh/tablet toko.
- **Setiap halaman data wajib punya 3 state**: kosong (belum ada data, dengan
  aksi lanjutan yang jelas), memuat (indikator saat mengambil data), dan
  gagal (pesan kesalahan yang actionable, bukan sekadar "terjadi kesalahan").
- **Konsistensi data**: penyimpanan berbasis file JSON lokal, operasi tulis
  bersifat sinkron agar tidak terjadi race condition antar-request pada skala
  penggunaan satu toko/satu komputer kasir.

## 10. Batasan

- Aplikasi ditujukan untuk satu lokasi toko/satu komputer kasir, bukan sistem
  multi-cabang terdistribusi.
- Tidak ada autentikasi pengguna pada versi ini; siapa pun yang mengakses
  komputer kasir dianggap sebagai staf yang berwenang.
- Persentase potongan deposit (30% untuk rusak ringan, 100% untuk rusak
  berat/hilang) adalah aturan bisnis awal yang dapat disesuaikan pemilik toko
  di kemudian hari; belum ada halaman konfigurasi untuk mengubah persentase
  ini secara dinamis pada versi awal.
- Tidak ada integrasi pembayaran; nominal biaya dan deposit dicatat sebagai
  angka, pembayaran aktual dilakukan secara tunai/manual di luar sistem.
