(function () {
  var input   = document.getElementById('search-input');
  var results = document.getElementById('search-results');
  if (!input || !results || !window.__SITE_INDEX__) return;

  var idx = window.__SITE_INDEX__;

  function articleUrl(raw) {
    raw = String(raw || '');
    return raw.charAt(0) === '/' ? raw : '/' + raw;
  }

  function resultItem(item) {
    var li = document.createElement('li');
    li.className = 'post-list-item';

    var date = document.createElement('span');
    date.className = 'post-date';
    date.textContent = item.date;

    var link = document.createElement('a');
    link.className = 'post-link';
    link.href = articleUrl(item.url);
    link.textContent = item.title;

    li.appendChild(date);
    li.appendChild(link);
    return li;
  }

  function render(items) {
    results.replaceChildren();
    if (!items.length) {
      var empty = document.createElement('li');
      empty.className = 'post-list-item empty-state';
      empty.textContent = 'No results found.';
      results.appendChild(empty);
      return;
    }
    var fragment = document.createDocumentFragment();
    items.forEach(function (item) {
      fragment.appendChild(resultItem(item));
    });
    results.appendChild(fragment);
  }

  function search(q) {
    if (!q) { results.replaceChildren(); return; }
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
