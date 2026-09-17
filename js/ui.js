/* ui.js — menu mobile, âncoras e FAQ. Funciona sem bibliotecas externas. */
(function () {
  function initMobileMenu() {
    const toggle = document.getElementById('nav-toggle');
    const menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;

    function setMenu(open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar menu de navegação' : 'Abrir menu de navegação');
      PS.lockScroll(open);

      if (open) {
        menu.hidden = false;
        requestAnimationFrame(() => menu.classList.add('is-open'));
        return;
      }
      menu.classList.remove('is-open');
      setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, 400);
    }

    toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
    menu.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', () => setMenu(false)));

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || toggle.getAttribute('aria-expanded') !== 'true') return;
      setMenu(false);
      toggle.focus();
    });
  }

  /* O Lenis intercepta o scroll nativo: quando ativo, as âncoras navegam por ele */
  function initAnchorLinks() {
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(link => {
      link.addEventListener('click', (e) => {
        const target = document.querySelector(link.getAttribute('href'));
        if (!target || !PS.lenis) return;
        e.preventDefault();
        PS.lenis.scrollTo(target, { offset: -80 });
      });
    });
  }

  /* Accordion: mantém um item aberto por vez */
  function initFaq() {
    const items = document.querySelectorAll('.faq-item');
    items.forEach(item => {
      item.addEventListener('toggle', () => {
        if (!item.open) return;
        items.forEach(other => { if (other !== item) other.open = false; });
        if (PS.env.animate) ScrollTrigger.refresh();
      });
    });
  }

  /* Convite "role para conhecer" no canto do hero: some assim que a pessoa começa a rolar */
  function initScrollCue() {
    const cue = document.getElementById('scroll-cue');
    if (!cue) return;

    const update = () => cue.classList.toggle('is-hidden', window.scrollY > 80);
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* Menu encolhe ao rolar (sempre). No desktop (>900px) também some assim que passa de um
     limiar de rolagem e o rail lateral (.side-rail) assume — baseado só na posição, não na
     direção, pra o rail continuar ativo mesmo rolando pra cima. Só volta perto do topo. */
  function initHeaderShrink() {
    const header = document.querySelector('.header');
    if (!header) return;

    const desktopQuery = window.matchMedia('(min-width: 901px)');

    let ticking = false;
    function update() {
      const y = window.scrollY;
      header.classList.toggle('is-compact', y > 40);
      header.classList.toggle('is-hidden', desktopQuery.matches && y > 120);
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }

  /* Marca no .nav-menu e na .mobile-tabbar o link da seção visível no momento (scroll-spy simples) */
  function initNavSpy() {
    const links = document.querySelectorAll('.nav-menu .nav-link[href^="#"], .mobile-tabbar .tab-link[href^="#"], .side-rail .side-dot[href^="#"]');
    if (!links.length) return;

    const ids = new Set(Array.from(links).map(link => link.getAttribute('href').slice(1)));
    const sections = Array.from(ids).map(id => document.getElementById(id)).filter(Boolean);
    if (!sections.length) return;

    const setActive = (id) => {
      links.forEach(link => link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`));
    };

    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter(e => e.isIntersecting);
      if (visible.length) setActive(visible[0].target.id);
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(section => observer.observe(section));
  }

  PS.initUI = function () {
    initMobileMenu();
    initAnchorLinks();
    initFaq();
    initScrollCue();
    initHeaderShrink();
    initNavSpy();
  };
})();
