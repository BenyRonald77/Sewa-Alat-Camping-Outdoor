(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('formKetersediaan');
    var indikator = document.getElementById('indikatorMuat');
    if (!form || !indikator) return;

    form.addEventListener('submit', function () {
      indikator.hidden = false;
    });
  });
})();
