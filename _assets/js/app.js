// Sidebar hamburger toggle (mobile)
(function () {
  var btn     = document.getElementById('nav-toggle');
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('nav-overlay');

  if (!btn || !sidebar) return;

  function open() {
    sidebar.classList.add('is-open');
    if (overlay) overlay.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
  }
  function close() {
    sidebar.classList.remove('is-open');
    if (overlay) overlay.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', function () {
    sidebar.classList.contains('is-open') ? close() : open();
  });

  if (overlay) overlay.addEventListener('click', close);

  // Close when a nav link is tapped
  var links = sidebar.querySelectorAll('.nav-list a');
  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener('click', close);
  }

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });
})();
