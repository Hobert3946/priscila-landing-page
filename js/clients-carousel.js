/*
  clients-carousel.js — carrossel "Outras marcas": cada card mostra um teaser (logo, nome,
  nicho); passar o mouse revela a capa do trabalho e o link do Instagram por cima do card
  (js/clients-carousel.js + cases.css .client-project-reveal), sem popup — clicar vai direto
  pro Instagram.
*/
(function () {
  function initWheelScroll(track) {
    // Só um gesto horizontal de verdade (trackpad ou shift+wheel) é interceptado; wheel
    // vertical comum nunca é tocado e sempre rola a página.
    track.addEventListener('wheel', (e) => {
      if (track.scrollWidth <= track.clientWidth) return;
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;

      const atStart = track.scrollLeft <= 0;
      const atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 1;
      if ((e.deltaX < 0 && atStart) || (e.deltaX > 0 && atEnd)) return;

      e.preventDefault();
      e.stopPropagation();
      track.scrollLeft += e.deltaX;
    }, { passive: false });
  }

  PS.initClientsCarousel = function () {
    const track = document.querySelector('.clients-track');
    if (track) initWheelScroll(track);
  };
})();
