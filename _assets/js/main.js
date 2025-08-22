// Mobile-only: hide sidebar on scroll down, show on scroll up
(function () {
  const mq = window.matchMedia('(max-width: 960px)');
  let lastY = window.scrollY || 0;

  function update() {
    // se non è mobile, assicurati che la sidebar sia visibile
    if (!mq.matches) {
      document.body.classList.remove('hide-nav');
      lastY = window.scrollY || 0;
      return;
    }

    const y = window.scrollY || 0;
    const delta = y - lastY;
    lastY = y;

    const THRESH = 8; // smorza micro-movimenti
    if (y < 10 || delta < -THRESH) {
      // su / vicino top: mostra
      document.body.classList.remove('hide-nav');
    } else if (delta > THRESH) {
      // giù: nascondi
      document.body.classList.add('hide-nav');
    }
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
})();
