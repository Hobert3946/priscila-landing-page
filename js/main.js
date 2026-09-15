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
  PS.initContactForm();
  PS.initRollHover();
  PS.initCarousels();
  PS.initClientsCarousel();

  if (PS.env.hasLibs) {
    gsap.registerPlugin(ScrollTrigger);

    const heroDelay = PS.runPreloader();

    PS.initNumbers();
    PS.initTrajectoryReveal();
    PS.initScrollReveals();
    PS.initCaseReveals();
    PS.initTechServicesReveal();
    PS.initTestimonialsReveal();
    PS.initFaqReveal();
    PS.initContactReveal();
    // Entrada do hero + títulos de seção: conteúdo aparecendo, roda sempre. Só o giro
    // contínuo das palavras do hero se auto-desliga aqui dentro se animate for falso.
    PS.initTextEffects(heroDelay);

    if (PS.env.animate) {
      PS.initSmoothScroll();
      PS.initMagnetic('.hero-shortcut', 0.25);
      PS.initMagnetic('.btn-primary-nesh, .btn-ghost-nesh', 0.15);
      PS.initTiltCards('.contact-card');
      PS.initMarquee();
      PS.initCursor();
    }

    // fontes carregadas mudam a altura dos textos: recalcula os triggers
    if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
  } else {
    root.classList.remove('show-preloader');
  }

  // estados iniciais agora são inline (GSAP) ou desnecessários: o CSS libera a visibilidade
  root.classList.remove('js-pending');
});
