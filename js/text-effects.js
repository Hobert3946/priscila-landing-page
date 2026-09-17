/*
  text-effects.js — hover com texto rolando, palavras girando no hero,
  revelação de títulos/cards e parágrafo que acende palavra por palavra no scroll.
*/
(function () {
  const ROLL_TARGETS = '.nav-link-label, .btn-pill > span:last-child, .btn-primary-nesh:not(.form-submit) > span:first-child, .btn-ghost-nesh > span';
  const ROTATE_EVERY = 2.6; // segundos

  /* Duplica o texto em duas camadas; no hover a de baixo sobe (CSS em effects.css) */
  function wrapRoll(el) {
    const text = el.textContent.trim();
    if (!text || el.querySelector('.roll')) return;

    const roll = document.createElement('span');
    roll.className = 'roll';
    const inner = document.createElement('span');
    inner.className = 'roll-inner';

    [false, true].forEach(isCopy => {
      const layer = document.createElement('span');
      layer.textContent = text;
      if (isCopy) layer.setAttribute('aria-hidden', 'true');
      inner.appendChild(layer);
    });

    roll.appendChild(inner);
    el.textContent = '';
    el.appendChild(roll);
    (el.closest('a, button') || el).classList.add('roll-host');
  }

  function initWordRotator() {
    const rotator = document.querySelector('.word-rotator');
    if (!rotator) return;

    const item = rotator.querySelector('.word-rotator-item');
    const words = rotator.dataset.words.split('|');
    let index = 0;
    let visible = true;

    // pausa quando o hero sai da tela ou a aba fica oculta
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(rotator);

    // Troca de palavra: desliza (padrão) ou só cross-fade quando o SO pede "reduzir movimento" —
    // continua trocando o texto (é conteúdo, não só decoração), só sem o slide vertical.
    const reduced = PS.env.reducedMotion;

    gsap.delayedCall(ROTATE_EVERY, function swap() {
      if (visible && !document.hidden) {
        index = (index + 1) % words.length;
        if (reduced) {
          gsap.timeline()
            .to(item, { opacity: 0, duration: 0.3, ease: 'power2.in' })
            .add(() => { item.textContent = words[index]; })
            .to(item, { opacity: 1, duration: 0.3, ease: 'power2.out' });
        } else {
          gsap.timeline()
            .to(item, { yPercent: -110, opacity: 0, duration: 0.45, ease: 'power3.in' })
            .add(() => { item.textContent = words[index]; })
            // immediateRender:false — sem isso o fromTo aplica o estado inicial (escondido) na hora em que
            // a timeline é criada, a palavra some de uma vez e a saída anima algo já invisível
            .fromTo(item, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: 'power3.out', immediateRender: false });
        }
      }
      gsap.delayedCall(ROTATE_EVERY, swap);
    });
  }

  /*
    Entrada do hero (chars subindo, tag/ações/galeria, atalhos): é conteúdo aparecendo,
    igual às outras seções, não um efeito à parte -- por isso roda sempre (chamada fora
    do bloco de "reduzir movimento" em main.js). O giro contínuo das palavras (initWordRotator)
    também roda sempre agora: é a frase do hero mudando, não um efeito à parte — só a
    animação de entrada/saída fica mais simples (cross-fade) quando o SO pede menos movimento.
  */
  function animateHero(delay) {
    const split = new SplitType('#hero-heading .hero-split', { types: 'words, chars' });
    // "PS" gigante também ganha stagger por letra, igual ao título — antes era um bloco só
    // (fade+scale), agora combina com o resto da entrada e continua o crescimento que o
    // "PS." do preloader começou ao sumir (ver js/preloader.js).
    const giantSplit = new SplitType('.hero-giant-type', { types: 'chars' });
    // Ordem inspirada no NESH: título, palavra girando, tag, ações, faixa de fotos — atalhos por último.
    const reveals = ['#hero-actions', '.hero-gallery'];
    const portraitImg = document.querySelector('.hero-portrait img');

    gsap.set(split.chars, { yPercent: 100, opacity: 0 });
    gsap.set('.word-rotator-item', { yPercent: 100, opacity: 0 });
    gsap.set(reveals, { y: 30, opacity: 0 });
    gsap.set(giantSplit.chars, { yPercent: 55, opacity: 0, scale: 0.9 });
    gsap.set('.header', { y: -16, opacity: 0 });

    /*
      Entrada do retrato da hero:
      Padronizada igual à versão mobile (fade suave e leve deslocamento no eixo Y),
      eliminando o efeito de foca/desfoca (blur) pesado no desktop/web.
    */
    if (portraitImg) {
      gsap.set(portraitImg, { opacity: 0, y: 16 });
    }

    const tl = gsap.timeline({ delay, defaults: { ease: 'power4.out' } });
    tl.to(giantSplit.chars, { yPercent: 0, opacity: 0.9, scale: 1, duration: 0.9, stagger: 0.1, ease: 'power3.out' }, 0);
    if (portraitImg) {
      tl.to(portraitImg, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        clearProps: 'transform,opacity'
      }, 0.1);
    }
    tl.to(split.chars, { yPercent: 0, opacity: 1, duration: 1, stagger: 0.02 }, 0.3)
      .to('.word-rotator-item', { yPercent: 0, opacity: 1, duration: 0.8 }, '-=0.8');
    reveals.forEach(sel => tl.to(sel, { y: 0, opacity: 1, duration: 0.8 }, '-=0.6'));
    // Menu entra por último, mas logo em seguida (sem pausa longa) — só pra não competir
    // com a atenção do resto da entrada, não pra fazer a pessoa esperar.
    // clearProps ao final: sem isso, o estilo inline do GSAP (transform/opacity) fica gravado
    // no elemento pra sempre e vence qualquer classe CSS depois (ex: .header.is-hidden ao rolar).
    tl.to('.header', {
      y: 0, opacity: 1, duration: 0.5, ease: 'power3.out',
      clearProps: 'transform,opacity'
    }, '-=0.3');
    tl.add(initWordRotator);

    // Efeito sutil de parallax: O "PS" se move mais devagar que a rolagem
    if (document.querySelector('.hero-giant-type') && !PS.env.reducedMotion) {
      gsap.to('.hero-giant-type', {
        yPercent: 25,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-section',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });
    }
  }

  /*
    Fundo Vivo: Animações sutis e contínuas para os brilhos de fundo (glows), 
    o brilho interativo do mouse e o sutil parallax da malha (grid).
  */
  PS.initAmbientAnimations = function () {
    // 1. Glows flutuando lentamente
    const glows = document.querySelectorAll('.glow-1, .glow-2');
    glows.forEach(glow => {
      gsap.to(glow, {
        x: () => gsap.utils.random(-80, 80),
        y: () => gsap.utils.random(-80, 80),
        duration: () => gsap.utils.random(8, 15),
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        overwrite: 'auto'
      });
    });

    // 2. Brilho do mouse
    if (PS.env.finePointer) {
      const mouseGlow = document.getElementById('mouse-glow');
      if (mouseGlow) {
        const moveX = gsap.quickTo(mouseGlow, 'left', { duration: 0.8, ease: 'power3' });
        const moveY = gsap.quickTo(mouseGlow, 'top', { duration: 0.8, ease: 'power3' });
        
        window.addEventListener('mousemove', (e) => {
          mouseGlow.style.opacity = '1';
          moveX(e.clientX);
          moveY(e.clientY);
        });
        
        window.addEventListener('mouseleave', () => {
          mouseGlow.style.opacity = '0';
        });
      }
    }

    // 3. Parallax super sutil do Grid no fundo
    const grid = document.querySelector('.background-grid');
    if (grid) {
      window.addEventListener('scroll', () => {
        const y = window.scrollY * 0.15; // move a 15% da velocidade do scroll
        grid.style.transform = `translateY(${-y}px)`;
      }, { passive: true });
    }
  };

  /*
    Puxão magnético: o elemento acompanha o mouse dentro de um raio pequeno e volta
    suavemente ao soltar. Só roda com mouse/trackpad fino — em touch não há hover contínuo.
  */
  PS.initMagnetic = function (selector, strength) {
    if (!PS.env.finePointer) return;

    document.querySelectorAll(selector).forEach(el => {
      const moveX = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' });
      const moveY = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' });

      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        moveX((e.clientX - rect.left - rect.width / 2) * strength);
        moveY((e.clientY - rect.top - rect.height / 2) * strength);
      });
      el.addEventListener('mouseleave', () => { moveX(0); moveY(0); });
    });
  };

  /*
    Tilt 3D magnético: o card inclina para o lado onde o mouse está, como se o cursor
    o empurrasse levemente. Substitui o "levanta 5px" genérico dos cards de contato.
  */
  PS.initTiltCards = function (selector, { maxTilt = 8, scale = 1.03 } = {}) {
    if (!PS.env.finePointer) return;

    document.querySelectorAll(selector).forEach(card => {
      gsap.set(card, { transformPerspective: 700, transformStyle: 'preserve-3d' });

      const rotX = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3' });
      const rotY = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3' });
      const sc = gsap.quickTo(card, 'scale', { duration: 0.4, ease: 'power3' });

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        rotY(px * maxTilt * 2);
        rotX(-py * maxTilt * 2);
        sc(scale);
      });
      card.addEventListener('mouseleave', () => { rotX(0); rotY(0); sc(1); });
    });
  };

  /*
    Faixa de clientes: em vez de pausar de golpe no hover, desacelera suavemente.
    Por isso a rolagem passa a ser um tween do GSAP (com timeScale ajustável) em vez
    do @keyframes puro em CSS — que ainda serve de fallback sem JS/CDN fora do ar.
  */
  PS.initMarquee = function () {
    const track = document.querySelector('.strip-track');
    const strip = track && track.closest('.infinite-strip');
    if (!track || !strip) return;

    track.style.animation = 'none';
    gsap.set(track, { xPercent: 0 });
    const tween = gsap.to(track, { xPercent: -50, duration: 30, ease: 'none', repeat: -1 });

    strip.addEventListener('mouseenter', () => gsap.to(tween, { timeScale: 0.25, duration: 0.6, ease: 'power2.out' }));
    strip.addEventListener('mouseleave', () => gsap.to(tween, { timeScale: 1, duration: 0.6, ease: 'power2.out' }));
  };

  function initSectionTitles() {
    document.querySelectorAll('.section-title.split-text').forEach(title => {
      const split = new SplitType(title, { types: 'words, chars' });
      gsap.fromTo(split.chars,
        { opacity: 0, y: 50, rotateX: -90 },
        {
          opacity: 1, y: 0, rotateX: 0, duration: 0.8, stagger: 0.02, ease: 'back.out(1.7)',
          scrollTrigger: { trigger: title, start: 'top 78%' }
        }
      );
    });
  }

  function initScrollHighlight() {
    document.querySelectorAll('[data-highlight]').forEach(el => {
      const split = new SplitType(el, { types: 'words' });
      gsap.fromTo(split.words, { opacity: 0.15 }, {
        opacity: 1, stagger: 0.1, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true }
      });
    });
  }

  PS.initRollHover = function () {
    document.querySelectorAll(ROLL_TARGETS).forEach(wrapRoll);
  };

  PS.initTextEffects = function (heroDelay) {
    animateHero(heroDelay);
    initSectionTitles();
    initScrollHighlight();
  };

  PS.initScrollReveals = function () {
    gsap.utils.toArray('.gsap-reveal').forEach(el => {
      gsap.fromTo(el, { y: 60, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 74%', toggleActions: 'play none none reverse' }
      });
    });
  };

  /*
    Revelação dos projetos (estilo NESH): a imagem entra com leve zoom-out (1.12 → 1) enquanto
    aparece, e o texto sobe em seguida com stagger entre os elementos. Cada card dispara sozinho
    (toggleActions reverse) para o efeito repetir se a pessoa rolar para cima e descer de novo.
  */
  function revealCase(card, mediaSelector, textSelector) {
    const media = card.querySelectorAll(mediaSelector);
    const text = card.querySelectorAll(textSelector);
    const tl = gsap.timeline({
      scrollTrigger: { trigger: card, start: 'top 72%', toggleActions: 'play none none reverse' }
    });

    if (media.length) {
      tl.fromTo(media, { scale: 1.12, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.1, ease: 'power3.out', stagger: 0.08 });
    }
    if (text.length) {
      // Stagger maior: cada linha/estatística/etapa entra em sequência (não tudo de uma vez),
      // dando tempo de ler enquanto o resto ainda está "carregando" no scroll.
      tl.fromTo(text, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out', stagger: 0.08 },
        media.length ? '-=0.7' : 0);
    }
    // Sem isto o `transform` da entrada fica gravado inline para sempre e o zoom
    // de hover em CSS (cases.css) nunca mais consegue sobrescrevê-lo.
    if (media.length) tl.set(media, { clearProps: 'transform' });
  }

  PS.initCaseReveals = function () {
    document.querySelectorAll('.case-card').forEach(card => {
      revealCase(card,
        '.case-media-main img, .case-media-thumb img',
        '.work-card-top, .work-title, .case-period, .work-desc, .case-roles');
    });

    const featured = document.querySelector('.case-featured');
    if (!featured) return;

    revealCase(featured,
      '.case-featured-cover img',
      '.work-card-top, .case-title, .case-period, .case-desc, .case-stats > div, .case-process > li');

    gsap.fromTo(featured.querySelectorAll('.growth-compare .case-subtitle, .growth-compare .case-note'),
      { y: 20, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.6, ease: 'power3.out',
        scrollTrigger: { trigger: '.growth-compare', start: 'top 74%', toggleActions: 'play none none reverse' }
      });

    gsap.fromTo(featured.querySelectorAll('.growth-compare-item img'),
      { scale: 1.08, opacity: 0 },
      {
        scale: 1, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.15,
        onComplete: function () { gsap.set(this.targets(), { clearProps: 'transform' }); },
        scrollTrigger: { trigger: '.growth-compare', start: 'top 74%', toggleActions: 'play none none reverse' }
      });

    gsap.fromTo(featured.querySelectorAll('.case-series .case-subtitle'),
      { y: 20, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.6, ease: 'power3.out',
        scrollTrigger: { trigger: '.case-series', start: 'top 74%', toggleActions: 'play none none reverse' }
      });

    gsap.fromTo(featured.querySelectorAll('.series-item img'),
      { scale: 1.08, opacity: 0 },
      {
        scale: 1, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.08,
        // libera o transform inline para o zoom de hover (cases.css) voltar a funcionar
        onComplete: function () { gsap.set(this.targets(), { clearProps: 'transform' }); },
        scrollTrigger: { trigger: '.case-series', start: 'top 74%', toggleActions: 'play none none reverse' }
      });

    gsap.fromTo('.case-reels .case-subtitle, .case-reels .case-note',
      { y: 20, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.6, ease: 'power3.out',
        scrollTrigger: { trigger: '.case-reels', start: 'top 76%', toggleActions: 'play none none reverse' }
      });

    // Cada reel entra na sua vez (não o carrossel inteiro de uma vez), reforçando a
    // sensação de conteúdo "chegando" conforme a pessoa rola até essa parte do case.
    gsap.fromTo('.case-reels .reel-card',
      { y: 30, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.07,
        scrollTrigger: { trigger: '.case-reels', start: 'top 76%', toggleActions: 'play none none reverse' }
      });
  };
})();
