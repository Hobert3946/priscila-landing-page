/*
  clients-carousel.js — "perfis folhados" da seção Outras marcas (cases.css .leaf-card).
  Com mouse, o :hover já abre a pilha; aqui ficam só os casos que o CSS não cobre: toque
  (sem hover) e teclado (Enter/Espaço no .leaf-deck, que é role="button").
*/
(function () {
  PS.initClientsCarousel = function () {
    const cards = Array.from(document.querySelectorAll('[data-leaf-card]'));
    if (!cards.length) return;

    const setOpen = (card, open) => {
      card.classList.toggle('is-open', open);
      card.querySelector('.leaf-deck').setAttribute('aria-expanded', String(open));
    };

    const toggle = (card) => {
      const open = !card.classList.contains('is-open');
      cards.forEach((c) => setOpen(c, c === card && open));
    };

    cards.forEach((card) => {
      const deck = card.querySelector('.leaf-deck');
      let pointerType = 'mouse';

      deck.addEventListener('pointerdown', (e) => { pointerType = e.pointerType; });

      deck.addEventListener('click', () => {
        // Com mouse o hover já abre; clicar não deve prender o card aberto.
        if (pointerType === 'mouse' && matchMedia('(hover: hover)').matches) return;
        toggle(card);
      });

      deck.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        toggle(card);
      });
    });

    document.addEventListener('click', (e) => {
      cards.forEach((card) => {
        if (!card.contains(e.target)) setOpen(card, false);
      });
    });
  };
})();
