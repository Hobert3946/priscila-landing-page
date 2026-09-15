/*
  core.js — namespace compartilhado (window.PS), flags de ambiente e smooth scroll.
  Carregado antes de todos os módulos. Ordem dos <script>: core → módulos → main.
*/
window.PS = window.PS || {};

PS.env = {
  hasLibs: typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && typeof SplitType !== 'undefined',
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  finePointer: window.matchMedia('(hover: hover) and (pointer: fine)').matches
};
PS.env.animate = PS.env.hasLibs && !PS.env.reducedMotion;

PS.lenis = null;

PS.initSmoothScroll = function () {
  if (typeof Lenis === 'undefined') return;

  PS.lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 2
  });

  PS.lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => PS.lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
};

/* Trava a rolagem da página (menu mobile aberto, modal de história) */
PS.lockScroll = function (locked) {
  document.body.classList.toggle('scroll-locked', locked);
  if (!PS.lenis) return;
  if (locked) PS.lenis.stop();
  else PS.lenis.start();
};
