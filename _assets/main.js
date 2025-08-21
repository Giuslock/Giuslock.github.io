// Placeholder for future enhancements (copy-to-clipboard, code line highlight, etc.)
document.addEventListener('DOMContentLoaded', () => {
  // External links
  document.querySelectorAll('a[href^="http"]').forEach(a => {
    a.setAttribute('target','_blank');
    a.setAttribute('rel','noopener');
  });
});