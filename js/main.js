/*
  main.js — bootstrap.
  Recursos essenciais (menu, formulário, modal, carrossel, hover) rodam sempre.

  "Movimento reduzido" (SO/navegador) desliga só o que é decorativo e contínuo — giro das
  palavras do hero, cursor magnético, tilt 3D, smooth scroll com easing. Os reveals de
  conteúdo (hero, títulos, cards, estatísticas, reels aparecendo ao rolar) e o preloader
  continuam ativos: são a entrada e a apresentação do conteúdo, não um efeito à parte —
  por isso não travam atrás dessa preferência, só atrás do carregamento das libs
  (GSAP/ScrollTrigger).
*/
document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;

  PS.initUI();
  PS.initConsent();
  PS.initLazyMedia();
  PS.initContactForm();
  PS.initRollHover();
  PS.initCarousels();
  PS.initClientsCarousel();

  // "Reduzir movimento": a mão apontando é decorativa e contínua, não conteúdo — pausa,
  // igual ao giro do hero e ao tilt 3D.
  if (PS.env.reducedMotion) {
    document.querySelectorAll('.tech-pointing-hand').forEach((video) => video.pause());
  }

  if (PS.env.hasLibs) {
    gsap.registerPlugin(ScrollTrigger);

    const heroDelay = PS.runPreloader();

    PS.initNumbers();
    PS.initTrajectoryReveal();
    PS.initScrollReveals();
    PS.initCaseReveals();
    PS.initTechServicesReveal();
    PS.initFaqReveal();
    PS.initContactReveal();
    // Entrada do hero + títulos de seção: conteúdo aparecendo, roda sempre. Só o giro
    // contínuo das palavras do hero se auto-desliga aqui dentro se animate for falso.
    PS.initTextEffects(heroDelay);

    if (PS.env.animate) {
      PS.initSmoothScroll();
      PS.initAmbientAnimations();
      PS.initMagnetic('.btn-primary-nesh, .btn-ghost-nesh', 0.15);
      PS.initMagnetic('.btn-pill, .nav-link, .form-submit', 0.1);
      PS.initTiltCards('.contact-card');
      PS.initMarquee();
      PS.initPageTransitions();
    }

    // fontes carregadas mudam a altura dos textos: recalcula os triggers
    if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());

    // Recalcula triggers e posições dinamicamente ao redimensionar a janela
    let resizeDebounce;
    window.addEventListener('resize', () => {
      clearTimeout(resizeDebounce);
      resizeDebounce = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 150);
    }, { passive: true });
  } else {
    root.classList.remove('show-preloader');
  }

  // estados iniciais agora são inline (GSAP) ou desnecessários: o CSS libera a visibilidade
  root.classList.remove('js-pending');
});
