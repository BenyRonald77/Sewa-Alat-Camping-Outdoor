# Arahan Desain — Sewa Alat Camping/Outdoor

Catatan jujur (R-37, opsi 2): tidak ada brand brief dari pemilik produk untuk aplikasi
ini. Arahan desain di bawah ditentukan sendiri oleh agent berdasarkan konteks produk
(rental alat camping/outdoor untuk staf toko), bukan dari brief pemilik. Risiko dari
opsi ini: hasil condong ke selera default agent, bukan hasil riset brand yang
sesungguhnya. Karena ini alat kerja internal (dipakai staf, bukan halaman pemasaran),
arahan diprioritaskan pada kejelasan dan kecepatan kerja, bukan pada dekorasi.

## Ringkasan arah

Alat bantu operasional toko penyewaan alat outdoor: dipakai staf di meja kasir/gudang
untuk mencatat inventaris, transaksi sewa, dan pengembalian. Suasana yang dituju:
"meja kerja penjaga gudang gunung" — earthy, kokoh (rugged), hangat, bukan aplikasi
SaaS generik.

## Palet warna (2-3 inti + 1 aksen)

| Peran | Warna | Hex | Alasan |
|---|---|---|---|
| Inti 1 — Hijau hutan tua | Forest | `#2F3E2E` | Warna alam paling identik dengan camping/hutan; dipakai untuk nav, header, dan elemen struktural agar terasa "di luar ruangan", bukan korporat. |
| Inti 2 — Krem kanvas | Sand | `#F3EAD8` | Warna kanvas tenda/ransel yang pudar terkena matahari; jadi latar utama agar halaman terasa hangat, bukan putih steril rumah sakit. |
| Inti 3 — Coklat kulit kayu | Bark | `#3B2E22` | Warna kayu/kulit basah; dipakai untuk teks utama dan garis batas agar kontras tinggi tanpa memakai hitam pekat yang terasa generik. |
| Aksen — Karat/oranye terbakar | Rust | `#B5511C` | Warna alat outdoor klasik (jerigen, pisau lipat, tali); dipakai HANYA pada aksi utama (tombol simpan, status penting, peringatan stok) supaya tetap jadi penanda perhatian, bukan warna dekorasi di mana-mana. |

Netral tambahan (tidak dihitung sebagai warna inti): putih gading `#FBF7EE` untuk kartu
di atas latar sand, dan abu gelap `#6B5F4F` untuk teks sekunder.

Kontras diverifikasi manual: teks Bark (#3B2E22) di atas Sand (#F3EAD8) dan di atas
putih gading (#FBF7EE) berada jauh di atas rasio 4.5:1. Teks putih gading di atas
Forest (#2F3E2E) juga di atas 4.5:1. Tombol aksen Rust memakai teks putih gading
(bukan bark) karena kontrasnya lebih tinggi di atas oranye gelap ini.

## Tipografi

- **Judul/heading:** "Fraunces" (serif slab dengan karakter agak kasar/organik pada
  optical size besar). Alasan: memberi kesan "dicetak di label gudang" — kokoh dan
  sedikit bertekstur, cocok dengan tema outdoor, bukan pilihan default model AI
  (Inter/Geist) yang terasa netral SaaS.
- **Isi/body & UI:** "Work Sans". Alasan: sans-serif yang tetap terbaca jelas di
  ukuran kecil untuk tabel data dan formulir (kebutuhan utama alat kerja staf),
  tanpa kesan techy/monospace yang tidak relevan untuk konteks ini.
- Kedua font dimuat dari Google Fonts (dibolehkan skill artifact-design/antislop
  selama tidak dipakai sebagai default tanpa alasan; alasan sudah ditulis di atas).

## Motif identitas

Garis putus-putus horizontal tipis (mirip garis kontur elevasi pada peta topografi
trail) dipakai sebagai pemisah antar-bagian pada kartu ringkasan dan sebagai garis
bawah judul section — bukan garis grid dekoratif di seluruh latar, hanya di titik
pemisah yang punya fungsi. Label status (Tersedia/Disewa/Rusak/Hilang) ditampilkan
sebagai "tag gantungan" bersudut siku dengan radius kecil (bukan pil), meniru label
gantungan harga di toko alat outdoor.

## Dial (ENERGY / RHYTHM / MOTION)

- **ENERGY: 2 (Balanced).** Ini alat kerja operasional harian, bukan halaman
  pemasaran yang perlu berteriak, tapi juga bukan formulir pemerintahan yang datar
  total — warna dan tipografi tetap punya karakter agar tidak terasa generik.
- **RHYTHM: 2 (Konsisten dengan sedikit variasi).** Halaman dashboard, daftar alat,
  form transaksi, dan riwayat punya komposisi yang konsisten (agar staf cepat
  familiar), tapi kartu ringkasan dashboard memakai layout berbeda dari tabel data
  supaya tidak monoton.
- **MOTION: 1 (Hover/focus state saja).** Alat kerja dipakai berulang setiap hari;
  animasi berlebihan hanya memperlambat staf. Transisi dibatasi pada hover, focus,
  dan pembukaan/penutupan elemen (menu mobile, dialog konfirmasi), tanpa animasi
  hias yang berjalan otomatis.

## Radius & bayangan

Radius kecil-menengah (6-10px) dipakai konsisten pada kartu, input, dan tombol —
bukan bentuk pil. Bayangan dipakai tipis, hanya pada kartu yang mengambang di atas
konten lain (dropdown, dialog konfirmasi pengembalian), bukan pada semua elemen.
