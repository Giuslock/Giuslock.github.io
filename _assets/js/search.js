(function () {
  var input   = document.getElementById('search-input');
  var results = document.getElementById('search-results');
  if (!input || !results || !window.__SITE_INDEX__) return;

  var idx = window.__SITE_INDEX__;

  function render(items) {
    if (!items.length) {
      results.innerHTML = '<li class="post-list-item"><span class="post-link" style="color:var(--muted)">No results found.</span></li>';
      return;
    }
    results.innerHTML = items.map(function (i) {
      return '<li class="post-list-item">'
        + '<span class="post-date">' + i.date + '</span>'
        + '<a class="post-link" href="/' + i.url + '">' + i.title + '</a>'
        + '</li>';
    }).join('');
  }

  function search(q) {
    if (!q) { results.innerHTML = ''; return; }
    var out = idx.filter(function (i) {
      return (i.title + ' ' + i.tags.join(' ')).toLowerCase().indexOf(q) !== -1;
    }).slice(0, 30);
    render(out);
  }

  input.addEventListener('input', function () {
    search(input.value.trim().toLowerCase());
  });

  // Read ?q= from URL on page load
  var params = new URLSearchParams(window.location.search);
  var q = (params.get('q') || '').trim();
  if (q) {
    input.value = q;
    search(q.toLowerCase());
  }
})();
