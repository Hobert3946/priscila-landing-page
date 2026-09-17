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

    toggle.addEventListener('click', () => {
      if (window.innerWidth > 900) return;
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
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

  /* Menu encolhe ao rolar. No desktop (>900px) some após limiar inicial para o rail lateral assumir.
     No mobile (<=900px), permanece visível durante a seção hero e some suavemente ao sair dela,
     deixando a tela limpa para a barra inferior fixa. */
  function initHeaderShrink() {
    const header = document.querySelector('.header');
    if (!header) return;

    const desktopQuery = window.matchMedia('(min-width: 901px)');

    let ticking = false;
    let lastY = window.scrollY;

    function update() {
      const y = window.scrollY;
      header.classList.toggle('is-compact', y > (desktopQuery.matches ? 100 : 40));

      // Não oculta se o menu mobile estiver aberto
      const isMenuOpen = document.body.classList.contains('menu-open') ||
                         header.querySelector('.nav-toggle[aria-expanded="true"]');
      if (isMenuOpen) {
        header.classList.remove('is-hidden');
        lastY = y;
        ticking = false;
        return;
      }

      const delta = y - lastY;
      if (Math.abs(delta) > 6) lastY = y;

      if (desktopQuery.matches) {
        /* Some ao descer, volta ao subir: rolar para cima quase sempre significa "quero
           navegar", então a barra reaparece no meio da página em vez de só no topo.
           A margem de 6px acima evita tremer com a micro-oscilação do trackpad. */
        if (y <= 260) header.classList.remove('is-hidden');
        else if (Math.abs(delta) > 6) header.classList.toggle('is-hidden', delta > 0);
      } else {
        // No mobile: visível no hero, some após passar da altura do hero
        const hero = document.getElementById('hero');
        const heroThreshold = hero ? (hero.offsetTop + hero.offsetHeight - 80) : 400;
        header.classList.toggle('is-hidden', y > heroThreshold);
      }
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    window.addEventListener('resize', () => {
      update();
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

    /* A pastilha da seção atual é um elemento só, que anda até o link ativo. Aqui vão
       apenas a largura e a posição; o deslizamento suave é a transition do CSS. */
    const menu = document.querySelector('.nav-menu');
    const indicator = menu && menu.querySelector('.nav-indicator');

    const moveIndicator = () => {
      if (!indicator) return;
      const active = menu.querySelector('.nav-link.is-active');
      if (!active) {
        menu.classList.remove('has-active');
        return;
      }
      indicator.style.width = `${active.offsetWidth}px`;
      indicator.style.transform = `translateX(${active.offsetLeft}px)`;
      menu.classList.add('has-active');
    };

    const setActive = (id) => {
      links.forEach(link => link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`));
      moveIndicator();
    };

    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter(e => e.isIntersecting);
      if (visible.length) setActive(visible[0].target.id);
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(section => observer.observe(section));
    window.addEventListener('resize', moveIndicator, { passive: true });
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
