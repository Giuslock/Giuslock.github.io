// Effects are optional; all navigation and content work without JavaScript.
(function () {
  var button = document.getElementById('crt-toggle');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var enabled = !reduced.matches;
  try {
    var saved = localStorage.getItem('slop-vault-crt');
    if (saved !== null) enabled = saved === 'on';
  } catch (_) {}
  function paint() {
    document.documentElement.classList.toggle('crt-off', !enabled);
    if (button) {
      button.setAttribute('aria-pressed', String(enabled));
      button.textContent = 'CRT effects: ' + (enabled ? 'on' : 'off');
    }
  }
  paint();
  if (button) {
    button.hidden = false;
    button.addEventListener('click', function () {
      enabled = !enabled;
      paint();
      try { localStorage.setItem('slop-vault-crt', enabled ? 'on' : 'off'); } catch (_) {}
    });
  }
  var current = location.pathname.replace(/(?:index)?\.html$|\/$/g, '');
  document.querySelectorAll('.nav-list a').forEach(function (link) {
    var path = new URL(link.href).pathname.replace(/(?:index)?\.html$|\/$/g, '');
    if (path === current) link.setAttribute('aria-current', 'page');
  });
})();
