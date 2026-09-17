/*
  preloader.js — tela de abertura, em toda visita.
  O script inline do <head> decide se mostra (classe show-preloader, sempre) e se é a versão
  rápida (classe preloader-quick, quando já rodou nesta aba/sessão) — tem timeout de segurança.
  Retorna o atraso, em segundos, para o hero começar a animar.
*/
(function () {
  const STORAGE_KEY = 'ps-preloader-seen';

  PS.runPreloader = function () {
    const root = document.documentElement;
    const el = document.getElementById('preloader');
    if (!el || !root.classList.contains('show-preloader')) return 0;

    try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch (e) { /* modo privado: só não memoriza */ }

    const count = el.querySelector('.preloader-count');
    const logo = el.querySelector('.preloader-logo');

    // Versão rápida (recarregamentos seguintes da mesma sessão): sem contar, só um
    // flash da marca e sai — mantém a sensação de "toda carga tem entrada" sem repetir
    // a espera de ~1,25s a cada F5.
    if (root.classList.contains('preloader-quick')) {
      count.textContent = 100;
      gsap.timeline({ onComplete: () => root.classList.remove('show-preloader') })
        .to(el, { yPercent: -100, duration: 0.35, ease: 'power3.inOut', delay: 0.1 });
      return 0.35;
    }

    // Contagem mais devagar (dá tempo de acompanhar o número) e, na saída, o "PS." cresce
    // e dissolve — o "PS" gigante do hero começa a crescer nesse exato instante (heroDelay
    // abaixo), como se fosse a mesma marca continuando a se expandir, não duas telas soltas.
    //
    // No celular a abertura é mais curta. No desktop ela é um respiro; numa tela pequena,
    // segurando o aparelho no 4G, é só espera antes de ver o conteúdo — e quem chega pelo
    // Instagram desiste rápido. Mesma cena, menos tempo.
    const quick = PS.env.touch || PS.env.lowEnd;
    const contagem = quick ? 0.45 : 0.8;
    const saida = quick ? 0.3 : 0.4;

    const state = { value: 0 };
    gsap.timeline({ onComplete: () => root.classList.remove('show-preloader') })
      .to(state, {
        value: 100, duration: contagem, ease: 'power2.out',
        onUpdate: () => { count.textContent = Math.round(state.value); }
      })
      .to(count, { opacity: 0, duration: 0.15 }, '-=0.05')
      .to(logo, { scale: 1.6, opacity: 0, duration: saida, ease: 'power2.in' }, '-=0.1')
      .to(el, { yPercent: -100, duration: saida, ease: 'power4.inOut' }, '-=0.25');

    return contagem;
  };
})();
