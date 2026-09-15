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

    // Versão rápida (recarregamentos seguintes da mesma sessão): sem contar, só um
    // flash da marca e sai — mantém a sensação de "toda carga tem entrada" sem repetir
    // a espera de ~1,25s a cada F5.
    if (root.classList.contains('preloader-quick')) {
      count.textContent = 100;
      gsap.timeline({ onComplete: () => root.classList.remove('show-preloader') })
        .to(el, { yPercent: -100, duration: 0.35, ease: 'power3.inOut', delay: 0.1 });
      return 0.35;
    }

    const state = { value: 0 };
    gsap.timeline({ onComplete: () => root.classList.remove('show-preloader') })
      .to(state, {
        value: 100, duration: 0.7, ease: 'power2.inOut',
        onUpdate: () => { count.textContent = Math.round(state.value); }
      })
      .to(el, { yPercent: -100, duration: 0.55, ease: 'power4.inOut' });

    return 0.95;
  };
})();
