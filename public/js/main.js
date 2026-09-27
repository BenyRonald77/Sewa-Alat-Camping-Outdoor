(function () {
  'use strict';

  function setupNavToggle() {
    var toggle = document.getElementById('navToggle');
    var menu = document.getElementById('navMenu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', function () {
      var isOpen = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    menu.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupNavToggle();
  });
})();
