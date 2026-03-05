(function(){
  const input = document.getElementById('search-input');
  const list = document.getElementById('search-results');
  if(!input || !list || !window.__SITE_INDEX__) return;
  const idx = window.__SITE_INDEX__;
  function render(items){
    list.innerHTML = items.map(i => `<li class="post-item"><a href="/${i.url}">${i.title}</a> — ${i.date}</li>`).join('');
  }
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if(!q){ render([]); return; }
    const out = idx.filter(i => (i.title + ' ' + i.tags.join(' ')).toLowerCase().includes(q)).slice(0, 30);
    render(out);
  });
})();
