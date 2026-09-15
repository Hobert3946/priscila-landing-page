/* numbers.js — contadores ([data-count]) e odômetro nos anos da trajetória. Só roda com animação ativa. */
(function () {
  function initCounters() {
    document.querySelectorAll('[data-count]').forEach(el => {
      const target = parseFloat(el.dataset.count);
      if (Number.isNaN(target)) return;

      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const hasDecimals = target % 1 !== 0;
      const state = { value: 0 };
      
      const render = () => { 
        el.textContent = prefix + state.value.toLocaleString('pt-BR', {
          minimumFractionDigits: hasDecimals ? 1 : 0,
          maximumFractionDigits: hasDecimals ? 1 : 0
        }) + suffix; 
      };

      render();
      gsap.to(state, {
        value: target, duration: 1.6, ease: 'power2.out', onUpdate: render,
        // 'top bottom': dispara assim que aparece. Com 'top 90%' o badge do hero, visível no rodapé
        // da primeira dobra, ficava travado em "+0" até a pessoa rolar.
        scrollTrigger: { trigger: el, start: 'top bottom', once: true }
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
