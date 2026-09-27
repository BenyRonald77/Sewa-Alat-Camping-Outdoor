(function () {
  'use strict';

  // Persentase potongan ini harus sama dengan lib/deposit.js (server tetap
  // menjadi sumber kebenaran; ini hanya pratinjau langsung di form).
  var PERSENTASE_POTONGAN = {
    baik: 0,
    rusak_ringan: 0.3,
    rusak_berat: 1,
    hilang: 1,
  };

  function formatRupiah(n) {
    return 'Rp' + Number(n || 0).toLocaleString('id-ID');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var kartu = document.getElementById('kartuPengembalian');
    var estimasi = document.getElementById('estimasiDeposit');
    if (!kartu || !estimasi) return;

    var depositTotal = Number(kartu.getAttribute('data-deposit-total'));
    var jumlahUnit = Number(kartu.getAttribute('data-jumlah-unit'));
    var depositPerUnit = jumlahUnit > 0 ? depositTotal / jumlahUnit : 0;

    function hitungUlang() {
      var dikembalikan = 0;
      var ditahan = 0;
      var jumlahHilang = 0;

      for (var i = 0; i < jumlahUnit; i++) {
        var dipilih = kartu.querySelector('input[name="kondisi[' + i + ']"]:checked');
        var kondisi = dipilih ? dipilih.value : 'baik';
        var persen = PERSENTASE_POTONGAN.hasOwnProperty(kondisi) ? PERSENTASE_POTONGAN[kondisi] : 1;
        var potongan = Math.round(depositPerUnit * persen);
        ditahan += potongan;
        dikembalikan += depositPerUnit - potongan;
        if (kondisi === 'hilang') jumlahHilang += 1;
      }

      var html = '<strong>Estimasi:</strong> deposit dikembalikan ' + formatRupiah(dikembalikan) +
        ', ditahan ' + formatRupiah(ditahan) + '.';
      if (jumlahHilang > 0) {
        html += ' Stok total alat akan berkurang permanen sebanyak ' + jumlahHilang + ' unit.';
      }
      estimasi.innerHTML = html;
    }

    kartu.addEventListener('change', hitungUlang);
    hitungUlang();
  });
})();
