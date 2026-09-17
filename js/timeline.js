/*
  timeline.js — "Quem é Priscila Santos": entrada da apresentação e linha do tempo horizontal.

  A faixa da linha do tempo fica presa com `position: sticky` (não ScrollTrigger.pin: sem
  .pin-spacer, nada disputa o controle do scroll com o Lenis) e anda para o lado conforme a
  página rola. O wrapper ganha exatamente a altura do deslocamento horizontal — cada pixel
  rolado vira um pixel de faixa. Com "reduzir movimento" vira um carrossel nativo de arrastar
  (about.css); régua, contador e cartão ativo acompanham nos dois modos.
*/
(function () {
  /* Manifesto sobe linha a linha; a foto principal "abre" de baixo para cima e a menor,
     o selo e as credenciais entram em seguida. */
  function revealIntro(section) {
    const lines = section.querySelectorAll('.about-line');
    if (lines.length) {
      gsap.fromTo(lines, { yPercent: 105 }, {
        yPercent: 0, duration: 0.9, ease: 'power4.out', stagger: 0.12,
        scrollTrigger: { trigger: '.about-manifesto', start: 'top 74%', toggleActions: 'play none none reverse' }
      });
    }

    const collage = section.querySelector('.about-collage');
    if (collage) {
      gsap.timeline({ scrollTrigger: { trigger: collage, start: 'top 80%', toggleActions: 'play none none reverse' } })
        .fromTo('.about-photo--main', { clipPath: 'inset(100% 0% 0% 0% round 20px)' },
          { clipPath: 'inset(0% 0% 0% 0% round 20px)', duration: 1.2, ease: 'power4.inOut' })
        .fromTo('.about-photo--float', { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }, '-=0.55')
        .fromTo('.about-badge, .about-stamp', { scale: 0.6, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.7, ease: 'back.out(1.8)', stagger: 0.12 }, '-=0.5');

      // parallax dentro da foto principal (a imagem tem 116% de altura para isso)
      if (PS.env.animate) {
        gsap.fromTo('.about-photo--main img', { yPercent: 0 }, {
          yPercent: -13, ease: 'none',
          scrollTrigger: { trigger: collage, start: 'top bottom', end: 'bottom top', scrub: true }
        });
      }
    }

    const credentials = section.querySelectorAll('.about-credentials .credential-card');
    if (credentials.length) {
      gsap.fromTo(credentials, { y: 24, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.1,
        scrollTrigger: { trigger: '.about-credentials', start: 'top 76%', toggleActions: 'play none none reverse' }
      });
    }
  }

  function initTrajectory(wrap) {
    const track = wrap.querySelector('.timeline-list');
    const dots = wrap.querySelectorAll('.trajectory-dots .dot');
    if (!track) return;

    // Rolagem suave (lerp) ao invés de mover o scrollLeft de forma abrupta
    let wheelTarget = track.scrollLeft;
    let wheelRaf = null;
    const animateWheelScroll = () => {
      const current = track.scrollLeft;
      const diff = wheelTarget - current;
      if (Math.abs(diff) < 0.5) {
        track.scrollLeft = wheelTarget;
        wheelRaf = null;
        return;
      }
      track.scrollLeft = current + diff * 0.15;
      wheelRaf = requestAnimationFrame(animateWheelScroll);
    };

    track.addEventListener('wheel', (e) => {
      if (track.scrollWidth <= track.clientWidth) return;
      // Só intercepta gesto horizontal real (trackpad ou shift+wheel). Wheel vertical comum
      // (deltaY) precisa sempre rolar a página — nunca "prender" o scroll dentro do carrossel.
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;

      const atStart = track.scrollLeft <= 0;
      const atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 1;
      if ((e.deltaX < 0 && atStart) || (e.deltaX > 0 && atEnd)) return;

      e.preventDefault();
      e.stopPropagation();
      if (!wheelRaf) wheelTarget = track.scrollLeft;
      const max = track.scrollWidth - track.clientWidth;
      wheelTarget = Math.max(0, Math.min(max, wheelTarget + e.deltaX));
      if (!wheelRaf) wheelRaf = requestAnimationFrame(animateWheelScroll);
    }, { passive: false });

    // Atualiza o bullet ativo ao rolar
    const cards = track.querySelectorAll('.timeline-card');
    function updateActive() {
      const focusX = track.scrollLeft + track.clientWidth * 0.4;
      let activeIdx = 0;
      cards.forEach((card, i) => { if (card.offsetLeft <= focusX) activeIdx = i; });
      
      // Garante que o último cartão acenda se estivermos no fim do scroll
      const isAtEnd = Math.ceil(track.scrollLeft) >= track.scrollWidth - track.clientWidth - 10;
      if (isAtEnd) activeIdx = cards.length - 1;

      cards.forEach((card, i) => card.classList.toggle('is-active', i === activeIdx));
      if (dots.length) {
        dots.forEach((dot, i) => dot.classList.toggle('is-active', i === activeIdx));
      }
    }
    track.addEventListener('scroll', updateActive, { passive: true });
    updateActive();

    function cardTarget(card) {
      const paddingOffset = parseFloat(getComputedStyle(track).paddingLeft) || 0;
      const target = card.offsetLeft - paddingOffset - 20;
      const maxScroll = track.scrollWidth - track.clientWidth;
      return Math.max(0, Math.min(target, maxScroll));
    }

    // Sem scroll-snap nativo (ele forçava o scrollLeft de volta a 0 sempre que o wheel/hover
    // suave mexiam a faixa via JS). Em troca, alinha no cartão mais próximo sozinho quando o
    // movimento para — wheel, hover ou arraste no touch, tanto faz a origem do scroll.
    let snapTimer = null;
    function scheduleSnap() {
      clearTimeout(snapTimer);
      snapTimer = setTimeout(() => {
        if (gsap.isTweening(track)) return; // Ignora o scroll acionado pelo GSAP
        let nearest = cards[0];
        let nearestDist = Infinity;
        cards.forEach((card) => {
          const dist = Math.abs(cardTarget(card) - track.scrollLeft);
          if (dist < nearestDist) { nearestDist = dist; nearest = card; }
        });
        if (nearestDist > 4) {
          gsap.to(track, { scrollLeft: cardTarget(nearest), duration: 0.6, ease: 'power2.out', overwrite: 'auto' });
        }
      }, 140);
    }
    track.addEventListener('scroll', scheduleSnap, { passive: true });

    // Permite clicar nas bolinhas ou nos próprios cards para navegar
    cards.forEach((card, index) => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        gsap.to(track, { scrollLeft: cardTarget(card), duration: 0.8, ease: 'power2.out', overwrite: 'auto' });
      });
    });

    dots.forEach((dot, index) => {
      const navigateToCard = () => {
        const card = cards[index];
        if (card) gsap.to(track, { scrollLeft: cardTarget(card), duration: 0.8, ease: 'power2.out', overwrite: 'auto' });
      };
      dot.addEventListener('click', navigateToCard);
    });

    // Navegação via setas (apenas clique)
    const prevBtn = wrap.querySelector('[data-timeline-prev]');
    const nextBtn = wrap.querySelector('[data-timeline-next]');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => gsap.to(track, { scrollLeft: track.scrollLeft - 400, duration: 0.8, ease: 'power2.out', overwrite: 'auto' }));
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => gsap.to(track, { scrollLeft: track.scrollLeft + 400, duration: 0.8, ease: 'power2.out', overwrite: 'auto' }));
    }

    // Panning (rolagem) ultra-suave ao passar o mouse pelas bordas dos cards
    let trackScrollReq = null;
    let trackScrollSpeed = 0;

    const performTrackScroll = () => {
      if (trackScrollSpeed === 0) { trackScrollReq = null; return; }
      track.scrollLeft += trackScrollSpeed;
      trackScrollReq = requestAnimationFrame(performTrackScroll);
    };

    track.addEventListener('mousemove', (e) => {
      const rect = track.getBoundingClientRect();
      const center = rect.width / 2;
      const offset = (e.clientX - rect.left) - center;
      const deadZone = rect.width * 0.15; // parado perto do centro; desliza ao se aproximar das bordas

      if (Math.abs(offset) < deadZone) {
        trackScrollSpeed = 0;
      } else {
        const strength = (Math.abs(offset) - deadZone) / (center - deadZone); // 0 a 1
        trackScrollSpeed = Math.sign(offset) * strength * 3.5; // até ~210px/s na borda
      }

      if (trackScrollSpeed !== 0 && !trackScrollReq) {
        trackScrollReq = requestAnimationFrame(performTrackScroll);
      }
    });

    track.addEventListener('mouseleave', () => {
      trackScrollSpeed = 0;
    });
    // Fade-in inicial dos cartões
    wrap.classList.add('is-ready');
    if (PS.env.animate) {
      gsap.fromTo(track.querySelectorAll('.timeline-media, .timeline-body'), { y: 50, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.06,
        scrollTrigger: { trigger: wrap, start: 'top 75%', once: true },
        onComplete: function () { gsap.set(this.targets(), { clearProps: 'transform' }); }
      });
    }
  }

  PS.initTrajectoryReveal = function () {
    const section = document.querySelector('.timeline-section');
    if (!section) return;

    revealIntro(section);
    const wrap = section.querySelector('.trajectory');
    if (wrap) initTrajectory(wrap);
  };
})();
