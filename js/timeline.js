/* timeline.js — revelação vertical compacta da trajetória e modal "Ler mais" das histórias. */
(function () {
  /*
    Cada linha sobe e aparece ao entrar na tela; uma régua fina à esquerda se preenche
    conforme a seção rola (scrub), dando noção de progresso sem prender o scroll da página
    (o antigo pin+scroll horizontal fazia a seção consumir uma tela inteira de rolagem).
  */
  PS.initTrajectoryReveal = function () {
    const list = document.querySelector('.timeline-list');
    if (!list) return;

    gsap.utils.toArray('.timeline-card', list).forEach(row => {
      gsap.fromTo(row, { x: -24, opacity: 0 }, {
        x: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: row, start: 'top 88%', toggleActions: 'play none none reverse' }
      });
    });

    const fill = list.querySelector('.timeline-progress-fill');
    if (fill) {
      gsap.fromTo(fill, { scaleY: 0 }, {
        scaleY: 1, ease: 'none',
        scrollTrigger: { trigger: list, start: 'top 70%', end: 'bottom 60%', scrub: true }
      });
    }
  };

  /* Usa <dialog> nativo: foco preso, Esc e backdrop já vêm do navegador. Funciona sem GSAP. */
  PS.initStoryDialog = function () {
    const dialog = document.getElementById('story-dialog');
    if (!dialog || typeof dialog.showModal !== 'function') return;

    const yearEl = dialog.querySelector('.story-year');
    const titleEl = dialog.querySelector('.story-title');
    const bodyEl = dialog.querySelector('.story-body');
    let opener = null;

    function open(card, button) {
      const story = card.querySelector('template.timeline-story');
      if (!story) return;

      opener = button;
      yearEl.textContent = card.dataset.year || '';
      titleEl.textContent = card.querySelector('h3').textContent;
      bodyEl.replaceChildren(story.content.cloneNode(true));
      dialog.showModal();
      PS.lockScroll(true);

      if (PS.env.animate) {
        gsap.fromTo(dialog.querySelector('.story-dialog-inner'), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });
      }
    }

    document.querySelectorAll('.timeline-more').forEach(button => {
      button.addEventListener('click', () => open(button.closest('.timeline-card'), button));
    });

    dialog.querySelector('.story-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => {
      PS.lockScroll(false);
      if (opener) opener.focus();
    });
  };
})();
