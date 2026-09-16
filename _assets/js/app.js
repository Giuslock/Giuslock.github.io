// Sidebar hamburger toggle (mobile)
(function () {
  var btn     = document.getElementById('nav-toggle');
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('nav-overlay');
  var firstMenuLink = sidebar && sidebar.querySelector('.nav-list a');

  if (!btn || !sidebar) return;

  function open() {
    sidebar.classList.add('is-open');
    if (overlay) overlay.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Close menu');
    document.body.classList.add('nav-open');
    if (firstMenuLink) firstMenuLink.focus();
  }
  function close(returnFocus) {
    sidebar.classList.remove('is-open');
    if (overlay) overlay.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('nav-open');
    if (returnFocus !== false) btn.focus();
  }

  btn.addEventListener('click', function () {
    sidebar.classList.contains('is-open') ? close(true) : open();
  });

  if (overlay) overlay.addEventListener('click', function () { close(true); });

  var links = sidebar.querySelectorAll('.nav-list a');
  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener('click', function () { close(false); });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && sidebar.classList.contains('is-open')) close(true);
    if (e.key !== 'Tab' || !sidebar.classList.contains('is-open')) return;

    var focusable = sidebar.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
})();
