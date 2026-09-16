/* numbers.js — contadores ([data-count]) e odômetro nos anos da trajetória. Só roda com animação ativa. */
(function () {
  function animateCounter(el, options = {}) {
    const target = parseFloat(el.dataset.count);
    if (Number.isNaN(target)) return;

    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const hasDecimals = el.dataset.decimals !== undefined
      ? parseInt(el.dataset.decimals, 10) > 0
      : (target % 1 !== 0);

    const isWorkSection = Boolean(el.closest('#work') || el.closest('.work-section'));
    const defaultDuration = isWorkSection ? 2.8 : 1.6;
    const duration = el.dataset.duration ? parseFloat(el.dataset.duration) : (options.duration || defaultDuration);

    const badge = el.closest('.reel-views') || el.closest('.insight-data-card');
    const state = { value: 0 };

    const render = () => {
      let formatted;
      if (hasDecimals) {
        formatted = state.value.toLocaleString('pt-BR', {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1
        });
      } else if (target < 10 && suffix.includes('mi')) {
        // Para pequenos números em milhões (ex: 1 mi), mostra decimal durante a subida e resolve para inteiro no final
        if (state.value >= target) {
          formatted = Math.round(target).toString();
        } else {
          formatted = state.value.toLocaleString('pt-BR', {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
          });
        }
      } else {
        formatted = Math.floor(state.value).toLocaleString('pt-BR');
      }
      el.textContent = prefix + formatted + suffix;
    };

    render();

    gsap.to(state, {
      value: target,
      duration: duration,
      delay: options.delay || 0,
      ease: 'power1.out', // Subida contínua e suave de um em um
      onStart: () => {
        if (badge) badge.classList.add('is-counting');
      },
      onUpdate: render,
      onComplete: () => {
        state.value = target;
        const finalFormatted = hasDecimals
          ? target.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
          : target.toLocaleString('pt-BR');
        el.textContent = prefix + finalFormatted + suffix;

        if (badge) {
          badge.classList.remove('is-counting');
          badge.classList.add('is-counted');
        }
      }
    });
  }

  /* Animação com efeito visual para as visualizações dos Reels quando entram na tela */
  function initReelCounters() {
    const reelCards = document.querySelectorAll('.reel-card');
    if (!reelCards.length) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const countEl = entry.target.querySelector('[data-count]');
            if (countEl && !countEl._hasAnimated) {
              countEl._hasAnimated = true;
              animateCounter(countEl, { duration: 2.6 });
            }
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.25 });

      reelCards.forEach(card => observer.observe(card));
    } else {
      reelCards.forEach(card => {
        const countEl = card.querySelector('[data-count]');
        if (countEl) animateCounter(countEl, { duration: 2.6 });
      });
    }
  }

  function initCounters() {
    // 1. Reels: animam quando o cliente visualiza cada reel no carrossel
    initReelCounters();

    // 2. Demais números da página (hero, estatísticas, insights com porcentagens e K)
    document.querySelectorAll('[data-count]').forEach(el => {
      if (el.closest('.reel-card')) return;

      const isHero = Boolean(el.closest('.hero'));
      const triggerEl = el.closest('.insight-data-card') || el.closest('.case-stats') || el.closest('.growth-compare') || el;
      const startTrigger = isHero ? 'top bottom' : 'top 90%';

      ScrollTrigger.create({
        trigger: triggerEl,
        start: startTrigger,
        once: true,
        onEnter: () => {
          if (!el._hasAnimated) {
            el._hasAnimated = true;
            animateCounter(el);
          }
        }
      });
    });
  }

  function createDigitCell(digit) {
    const cell = document.createElement('span');
    cell.className = 'odo-digit';
    cell.setAttribute('aria-hidden', 'true');

    const strip = document.createElement('span');
    strip.className = 'odo-strip';
    for (let d = 0; d <= 9; d++) {
      const n = document.createElement('span');
      n.textContent = d;
      strip.appendChild(n);
    }
    cell.appendChild(strip);
    return { cell, strip, digit };
  }

  /* Troca "2021 — 2024" por colunas de 0–9; o texto real fica num span só para leitores de tela */
  function buildOdometer(el) {
    const text = el.textContent.trim();
    el.textContent = '';

    const label = document.createElement('span');
    label.className = 'sr-only';
    label.textContent = text;
    el.appendChild(label);

    const digits = [];
    for (const ch of text) {
      if (/\d/.test(ch)) {
        const d = createDigitCell(Number(ch));
        el.appendChild(d.cell);
        digits.push(d);
        continue;
      }
      const sep = document.createElement('span');
      sep.className = 'odo-char';
      sep.setAttribute('aria-hidden', 'true');
      sep.textContent = ch;
      el.appendChild(sep);
    }
    return digits;
  }

  function initOdometers() {
    const years = document.querySelectorAll('.timeline-year');
    if (!years.length) return;

    const tl = gsap.timeline({ paused: true });
    years.forEach((el, i) => {
      buildOdometer(el).forEach(({ strip, digit }, j) => {
        tl.fromTo(strip, { yPercent: 0 }, { yPercent: -10 * digit, duration: 1.4, ease: 'power3.out' }, i * 0.15 + j * 0.06);
      });
    });

    // a faixa da trajetória vem depois da apresentação: os anos giram quando ela chega na tela
    ScrollTrigger.create({ trigger: '.trajectory', start: 'top 60%', once: true, onEnter: () => tl.play() });
  }

  PS.initNumbers = function () {
    initCounters();
    initOdometers();
  };
})();
