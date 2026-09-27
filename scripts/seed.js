// Menyetel ulang seluruh data ke kondisi awal (data contoh alat, tanpa
// transaksi). Jalankan dengan `npm run seed`. PERINGATAN: ini menimpa semua
// transaksi penyewaan, pengembalian, dan log stok yang sudah tercatat.

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

const ALAT_AWAL = [
  {
    id: 'a1b2c3d4-0001-4000-8000-000000000001',
    nama: 'Tenda Dome 4 Orang',
    kategori: 'Tenda',
    stokTotal: 5,
    hargaSewaPerHari: 45000,
    deposit: 150000,
    dibuatPada: '2026-01-05T02:00:00.000Z',
  },
  {
    id: 'a1b2c3d4-0002-4000-8000-000000000002',
    nama: 'Tenda Dome 2 Orang',
    kategori: 'Tenda',
    stokTotal: 8,
    hargaSewaPerHari: 30000,
    deposit: 100000,
    dibuatPada: '2026-01-05T02:00:00.000Z',
  },
  {
    id: 'a1b2c3d4-0003-4000-8000-000000000003',
    nama: 'Sleeping Bag Standar',
    kategori: 'Tidur',
    stokTotal: 15,
    hargaSewaPerHari: 12000,
    deposit: 40000,
    dibuatPada: '2026-01-05T02:00:00.000Z',
  },
  {
    id: 'a1b2c3d4-0004-4000-8000-000000000004',
    nama: 'Matras Lipat',
    kategori: 'Tidur',
    stokTotal: 20,
    hargaSewaPerHari: 8000,
    deposit: 20000,
    dibuatPada: '2026-01-05T02:00:00.000Z',
  },
  {
    id: 'a1b2c3d4-0005-4000-8000-000000000005',
    nama: 'Kompor Portable + Gas',
    kategori: 'Masak',
    stokTotal: 6,
    hargaSewaPerHari: 20000,
    deposit: 75000,
    dibuatPada: '2026-01-05T02:00:00.000Z',
  },
  {
    id: 'a1b2c3d4-0006-4000-8000-000000000006',
    nama: 'Nesting/Cookware Set',
    kategori: 'Masak',
    stokTotal: 6,
    hargaSewaPerHari: 15000,
    deposit: 60000,
    dibuatPada: '2026-01-05T02:00:00.000Z',
  },
  {
    id: 'a1b2c3d4-0007-4000-8000-000000000007',
    nama: 'Carrier 60L',
    kategori: 'Tas',
    stokTotal: 10,
    hargaSewaPerHari: 25000,
    deposit: 100000,
    dibuatPada: '2026-01-05T02:00:00.000Z',
  },
  {
    id: 'a1b2c3d4-0008-4000-8000-000000000008',
    nama: 'Headlamp',
    kategori: 'Penerangan',
    stokTotal: 12,
    hargaSewaPerHari: 7000,
    deposit: 30000,
    dibuatPada: '2026-01-05T02:00:00.000Z',
  },
];

function tulis(nama, data) {
  fs.writeFileSync(path.join(DATA_DIR, nama), JSON.stringify(data, null, 2) + '\n', 'utf-8');
  console.log(`data/${nama} ditulis ulang (${data.length} entri).`);
}

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

tulis('alat.json', ALAT_AWAL);
tulis('penyewaan.json', []);
tulis('pengembalian.json', []);
tulis('logStok.json', []);

console.log('Reseed selesai. Semua transaksi, pengembalian, dan log stok dikosongkan.');
