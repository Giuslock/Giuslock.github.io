// Giuslock Pages Theme JS
console.debug('Giuslock Pages theme loaded');

// Open external links in a new tab and enable simple client-side search
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a[href^="http"]').forEach(a => {
    try {
      if (!a.href.includes(window.location.hostname)) {
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
      }
    } catch (e) {}
  });

  const search = document.getElementById('search');
  const list = document.getElementById('postList');
  if (search && list) {
    const items = Array.from(list.querySelectorAll('.post-item'));
    search.addEventListener('input', () => {
      const q = search.value.trim().toLowerCase();
      items.forEach(li => {
        const t = li.getAttribute('data-title') || '';
        const tags = li.getAttribute('data-tags') || '';
        const show = !q || t.includes(q) || tags.includes(q);
        li.style.display = show ? '' : 'none';
      });
    });
  }
});
