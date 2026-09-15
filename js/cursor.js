/*
  cursor.js — cursor personalizado (só mouse/trackpad, com animação ativa).
  O cursor nativo continua visível: o círculo é um complemento, não um substituto.
  Elementos com data-cursor="Texto" mostram um rótulo (ex.: carrossel → "Arraste").
*/
(function () {
  const INTERACTIVE = 'a, button, summary, label, input, select, textarea';

  PS.initCursor = function () {
    if (!PS.env.finePointer) return;
    const cursor = document.getElementById('cursor');
    if (!cursor) return;

    const label = cursor.querySelector('.cursor-label');
    cursor.hidden = false;
    gsap.set(cursor, { xPercent: -50, yPercent: -50 });

    const moveX = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3' });
    const moveY = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3' });

    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      moveX(e.clientX);
      moveY(e.clientY);
      cursor.classList.add('is-visible');
    }, { passive: true });

    document.documentElement.addEventListener('mouseleave', () => cursor.classList.remove('is-visible'));

    document.addEventListener('pointerover', (e) => {
      const labelled = e.target.closest('[data-cursor]');
      // Sem rótulo explícito, um link que abre em outra aba ganha um automaticamente
      const externalLink = !labelled && e.target.closest('a[target="_blank"]');
      const interactive = e.target.closest(INTERACTIVE);
      const text = labelled ? labelled.dataset.cursor : externalLink ? 'Abrir ↗' : '';

      cursor.classList.toggle('has-label', !!text);
      cursor.classList.toggle('is-hover', !!interactive && !text);
      label.textContent = text;
    });
  };
})();
