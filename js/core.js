/*
  core.js — namespace compartilhado (window.PS), flags de ambiente e smooth scroll.
  Carregado antes de todos os módulos. Ordem dos <script>: core → módulos → main.
*/
window.PS = window.PS || {};

/*
  Flags de ambiente.

  `lowEnd` existe porque o site roda em celular de entrada e em 4G instável: nesses
  aparelhos as animações contínuas (grão, brilhos, parallax) competem com a rolagem
  pela mesma CPU/GPU e o resultado é travamento. As pistas usadas:
    - saveData: a pessoa pediu explicitamente economia de dados;
    - effectiveType: rede 2g/3g;
    - deviceMemory <= 4GB e hardwareConcurrency <= 4: perfil de aparelho de entrada.
  Nenhuma delas existe em todo navegador (Safari não expõe memória/conexão), por isso
  são todas opcionais e o padrão é "não é fraco" — degradar só quando há sinal claro.
*/
(function () {
  var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
  var slowNet = !!conn && (conn.saveData === true || /(^|-)2g$/.test(conn.effectiveType || ''));
  var weakDevice = (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
                   (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);

  PS.env = {
    hasLibs: typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && typeof SplitType !== 'undefined',
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    finePointer: window.matchMedia('(hover: hover) and (pointer: fine)').matches,
    touch: window.matchMedia('(pointer: coarse)').matches,
    saveData: !!(conn && conn.saveData),
    lowEnd: slowNet || !!weakDevice
  };
  PS.env.animate = PS.env.hasLibs && !PS.env.reducedMotion;

  // Deixa o CSS reagir às mesmas condições (ver bloco MOBILE em styles.css)
  if (PS.env.lowEnd) document.documentElement.classList.add('low-end');
  if (PS.env.touch) document.documentElement.classList.add('is-touch');
})();

PS.lenis = null;

/*
  Scroll suave só no desktop. Em touch o Lenis não suaviza nada (smoothTouch é falso por
  padrão) mas mantém um laço de rAF rodando todo frame junto com o ScrollTrigger — CPU
  gasta à toa justo onde ela é escassa. Sem Lenis, a rolagem é a nativa do aparelho, que
  roda no processo de composição e é sempre mais fluida. Os pontos que usam PS.lenis
  (âncoras, travar rolagem, transição de página) já têm caminho alternativo para null.
*/
PS.initSmoothScroll = function () {
  if (typeof Lenis === 'undefined') return;
  if (PS.env.touch || PS.env.lowEnd) return;

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
