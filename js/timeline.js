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
        scrollTrigger: { trigger: '.about-manifesto', start: 'top 85%', toggleActions: 'play none none reverse' }
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
        scrollTrigger: { trigger: '.about-credentials', start: 'top 88%', toggleActions: 'play none none reverse' }
      });
    }
  }

  function initTrajectory(wrap) {
    const track = wrap.querySelector('.timeline-list');
    const dots = wrap.querySelectorAll('.trajectory-dots .dot');
    if (!track) return;

    // Permitir rolagem horizontal (mouse wheel) sem rolar a página verticalmente, similar ao carousel
    wrap.addEventListener('mouseenter', () => { if (PS.lenis) PS.lenis.stop(); });
    wrap.addEventListener('mouseleave', () => { if (PS.lenis) PS.lenis.start(); });

    track.addEventListener('wheel', (e) => {
      if (track.scrollWidth <= track.clientWidth) return;
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;

      const atStart = track.scrollLeft <= 0;
      const atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 1;
      if ((e.deltaY < 0 && atStart) || (e.deltaY > 0 && atEnd)) return;

      e.preventDefault();
      track.scrollLeft += e.deltaY;
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

    // Permite clicar ou passar o mouse nas bolinhas para navegar
    dots.forEach((dot, index) => {
      const navigateToCard = () => {
        const card = cards[index];
        if (card) {
          const paddingOffset = parseFloat(getComputedStyle(track).paddingLeft) || 0;
          track.scrollTo({ left: card.offsetLeft - paddingOffset - 20, behavior: 'smooth' });
        }
      };
      dot.addEventListener('click', navigateToCard);
    });

    // Navegação via setas (apenas clique)
    const prevBtn = wrap.querySelector('[data-timeline-prev]');
    const nextBtn = wrap.querySelector('[data-timeline-next]');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => track.scrollBy({ left: -400, behavior: 'smooth' }));
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => track.scrollBy({ left: 400, behavior: 'smooth' }));
    }

    // Panning (rolagem) ultra-suave ao passar o mouse pelas bordas dos cards
    let trackScrollReq = null;
    let trackScrollDir = 0;

    const performTrackScroll = () => {
      if (trackScrollDir !== 0) {
        // Velocidade base muito lenta (1.2px por frame = ~72px/segundo)
        track.scrollLeft += trackScrollDir * 1.2;
        trackScrollReq = requestAnimationFrame(performTrackScroll);
      }
    };

    track.addEventListener('mousemove', (e) => {
      const rect = track.getBoundingClientRect();
      const x = e.clientX - rect.left;
      
      const threshold = 200; // pixels de distância da borda
      if (x < threshold) {
        trackScrollDir = -1;
      } else if (x > rect.width - threshold) {
        trackScrollDir = 1;
      } else {
        trackScrollDir = 0;
      }

      if (trackScrollDir !== 0 && !trackScrollReq) {
        trackScrollReq = requestAnimationFrame(performTrackScroll);
      } else if (trackScrollDir === 0 && trackScrollReq) {
        cancelAnimationFrame(trackScrollReq);
        trackScrollReq = null;
      }
    });

    track.addEventListener('mouseleave', () => {
      if (trackScrollReq) {
        cancelAnimationFrame(trackScrollReq);
        trackScrollReq = null;
      }
      trackScrollDir = 0;
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
