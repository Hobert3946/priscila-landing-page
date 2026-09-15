/*
  clients-carousel.js — carrossel "Outras marcas": cards mostram só um teaser (logo, nome,
  nicho); o botão "Ver o trabalho" abre um <dialog> nativo com a imagem, descrição e o link
  do Instagram, clonados do <template class="client-story"> de cada card (mesmo padrão do
  modal "Ler mais" da trajetória, em timeline.js).
*/
(function () {
  function initWheelScroll(track) {
    // O Lenis (scroll suave da página) tem seu próprio listener de wheel e ignora o
    // preventDefault de terceiros — sem isso, girar o mouse sobre o carrossel também
    // rolava a página inteira ao mesmo tempo. Pausamos o Lenis só enquanto o mouse
    // estiver sobre o carrossel; ele é criado depois deste init, por isso o acesso
    // a PS.lenis é sempre feito na hora do evento, nunca guardado antes.
    const carouselRoot = track.closest('.clients-carousel') || track;
    carouselRoot.addEventListener('mouseenter', () => { if (PS.lenis) PS.lenis.stop(); });
    carouselRoot.addEventListener('mouseleave', () => { if (PS.lenis) PS.lenis.start(); });

    // roda do mouse sobre o carrossel rola na horizontal, em vez de rolar a página —
    // mas só enquanto ainda há pra onde rolar; no fim/início solta o gesto pra página rolar normal.
    track.addEventListener('wheel', (e) => {
      if (track.scrollWidth <= track.clientWidth) return;
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;

      const atStart = track.scrollLeft <= 0;
      const atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 1;
      if ((e.deltaY < 0 && atStart) || (e.deltaY > 0 && atEnd)) return;

      e.preventDefault();
      track.scrollLeft += e.deltaY;
    }, { passive: false });
  }

  function initRevealDialog() {
    const dialog = document.getElementById('client-dialog');
    if (!dialog || typeof dialog.showModal !== 'function') return;

    const titleEl = dialog.querySelector('.story-title');
    const bodyEl = dialog.querySelector('.client-dialog-body');
    let opener = null;

    function open(card, button) {
      const story = card.querySelector('template.client-story');
      if (!story) return;

      opener = button;
      titleEl.textContent = card.querySelector('.client-project-teaser-info h5')?.textContent || '';
      bodyEl.replaceChildren(story.content.cloneNode(true));
      dialog.showModal();
      PS.lockScroll(true);
    }

    document.querySelectorAll('.client-project-reveal').forEach(button => {
      button.addEventListener('click', () => open(button.closest('.client-project-card'), button));
    });

    dialog.querySelector('.story-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => {
      PS.lockScroll(false);
      if (opener) opener.focus();
    });
  }

  PS.initClientsCarousel = function () {
    const track = document.querySelector('.clients-track');
    if (track) initWheelScroll(track);
    initRevealDialog();
  };
})();
