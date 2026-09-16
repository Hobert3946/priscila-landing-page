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

/* Page Transitions: fade suave ao navegar entre seções por links âncora */
PS.initPageTransitions = function () {
  const overlay = document.getElementById('page-transition');
  if (!overlay) return;

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      // Fade in do overlay
      gsap.to(overlay, {
        opacity: 0.6,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => {
          // Scroll para o destino
          if (PS.lenis) {
            PS.lenis.scrollTo(target, { offset: -80, immediate: false, duration: 1.2 });
          } else {
            target.scrollIntoView({ behavior: 'smooth' });
          }
          // Fade out do overlay
          gsap.to(overlay, {
            opacity: 0,
            duration: 0.4,
            delay: 0.15,
            ease: 'power2.out'
          });
        }
      });
    });
  });
};
