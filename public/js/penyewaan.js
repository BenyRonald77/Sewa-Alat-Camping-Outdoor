(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('btnCekKetersediaan');
    var hasilBox = document.getElementById('hasilCek');
    if (!btn || !hasilBox) return;

    var alatSelect = document.getElementById('alatId');
    var mulaiInput = document.getElementById('tanggalMulai');
    var selesaiInput = document.getElementById('tanggalSelesai');
    var jumlahInput = document.getElementById('jumlahUnit');

    function formatRupiah(n) {
      return 'Rp' + Number(n || 0).toLocaleString('id-ID');
    }

    function render(html) {
      hasilBox.hidden = false;
      hasilBox.innerHTML = html;
    }

    btn.addEventListener('click', function () {
      var alatId = alatSelect.value;
      var mulai = mulaiInput.value;
      var selesai = selesaiInput.value;
      var jumlah = jumlahInput.value;

      if (!alatId || !mulai || !selesai || !jumlah) {
        render('<div class="alert alert--error">Lengkapi alat, tanggal mulai, tanggal selesai, dan jumlah unit terlebih dahulu.</div>');
        return;
      }

      render('<div class="state-loading"><span class="spinner" aria-hidden="true"></span><span>Memeriksa ketersediaan...</span></div>');

      var url = '/penyewaan/cek-ketersediaan?alatId=' + encodeURIComponent(alatId) +
        '&mulai=' + encodeURIComponent(mulai) +
        '&selesai=' + encodeURIComponent(selesai) +
        '&jumlah=' + encodeURIComponent(jumlah);

      fetch(url)
        .then(function (res) {
          return res.json().then(function (data) {
            return { status: res.status, data: data };
          });
        })
        .then(function (result) {
          var data = result.data;
          if (result.status !== 200) {
            render('<div class="alert alert--error">' + (data.pesan || 'Data belum lengkap atau tidak valid.') + '</div>');
            return;
          }

          if (!data.ok) {
            var baris = data.konflik.map(function (k) {
              return '<li>' + k.tanggal + ': hanya tersisa ' + k.tersedia + ' unit</li>';
            }).join('');
            render(
              '<div class="alert alert--error">' +
              '<strong>Stok tidak cukup pada rentang ini.</strong>' +
              '<ul>' + baris + '</ul>' +
              '</div>'
            );
            return;
          }

          render(
            '<div class="alert alert--success">' +
            '<strong>Tersedia.</strong> Estimasi untuk ' + data.durasiHari + ' hari sewa:' +
            '<ul>' +
            '<li>Total biaya sewa: ' + formatRupiah(data.totalBiayaSewa) + '</li>' +
            '<li>Deposit yang harus dibayar: ' + formatRupiah(data.depositDibayar) + '</li>' +
            '</ul>' +
            '</div>'
          );
        })
        .catch(function () {
          render('<div class="alert alert--error">Gagal memeriksa ketersediaan. Periksa koneksi ke server lalu coba lagi.</div>');
        });
    });
  });
})();
