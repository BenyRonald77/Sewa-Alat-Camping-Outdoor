function formatRupiah(angka) {
  const n = Number(angka) || 0;
  return 'Rp' + n.toLocaleString('id-ID', { maximumFractionDigits: 0 });
}

module.exports = { formatRupiah };
