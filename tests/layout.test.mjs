// Testes de regressão de layout. Rodar com: npm test
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { inflateSync } from 'node:zlib';
import { chromium } from 'playwright';

// Decoder de PNG mínimo (só o suficiente pra ler pixels de volta em testes de cor — sem libs novas:
// zlib já vem com o Node). Suporta 8 bits, RGB (tipo 2) e RGBA (tipo 6), sem interlace.
function decodePNG(buffer) {
  const CRC_LEN = 4;
  let pos = 8; // pula a assinatura do PNG
  let width, height, colorType;
  const idatChunks = [];

  while (pos < buffer.length) {
    const len = buffer.readUInt32BE(pos);
    const type = buffer.toString('ascii', pos + 4, pos + 8);
    const data = buffer.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      colorType = data.readUInt8(9);
    } else if (type === 'IDAT') {
      idatChunks.push(data);
    }
    pos += 8 + len + CRC_LEN;
  }

  const channels = colorType === 6 ? 4 : 3;
  const raw = inflateSync(Buffer.concat(idatChunks));
  const stride = width * channels;
  const pixels = Buffer.alloc(height * stride);
  let prevRow = Buffer.alloc(stride);

  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const rowStart = y * (stride + 1) + 1;
    const row = Buffer.alloc(stride);
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? row[x - channels] : 0;
      const b = prevRow[x];
      const c = x >= channels ? prevRow[x - channels] : 0;
      const raw_x = raw[rowStart + x];
      let value;
      if (filter === 0) value = raw_x;
      else if (filter === 1) value = raw_x + a;
      else if (filter === 2) value = raw_x + b;
      else if (filter === 3) value = raw_x + Math.floor((a + b) / 2);
      else { // Paeth
        const p = a + b - c;
        const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        const pred = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
        value = raw_x + pred;
      }
      row[x] = value & 0xff;
    }
    row.copy(pixels, y * stride);
    prevRow = row;
  }

  return { width, height, channels, pixels };
}

function pixelAt(png, x, y) {
  const i = (y * png.width + x) * png.channels;
  return { r: png.pixels[i], g: png.pixels[i + 1], b: png.pixels[i + 2] };
}

const PAGE_URL = pathToFileURL(resolve('index.html')).href;
const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 }
];

let browser;
before(async () => { browser = await chromium.launch(); });
after(async () => { await browser.close(); });

async function openPage(viewport, { blockCdn = false, hasTouch = false } = {}) {
  const page = await browser.newPage({ viewport, hasTouch, isMobile: hasTouch });
  if (blockCdn) {
    await page.route(/unpkg\.com|cdnjs\.cloudflare\.com/, route => route.abort());
  }
  await page.goto(PAGE_URL, { waitUntil: 'load' });
  return page;
}

for (const viewport of VIEWPORTS) {
  test(`sem rolagem horizontal em ${viewport.width}px`, async () => {
    const page = await openPage(viewport);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    await page.close();
    assert.ok(overflow <= 0, `documento ${overflow}px mais largo que a viewport`);
  });

  // Regressão: "Comunicação," quebrava no meio ("Comunicaçã / o") por ser mais larga que a coluna.
  // Vale para todo título animado pelo SplitType (palavras inline-block quebram letra a letra).
  test(`palavras dos títulos não quebram em ${viewport.width}px`, async () => {
    const page = await openPage(viewport);
    await page.waitForSelector('#hero-heading .word');
    const broken = await page.evaluate(() => {
      const words = [...document.querySelectorAll('#hero-heading .word, .split-text .word, [data-highlight] .word')]
        .filter(w => w.getBoundingClientRect().height > parseFloat(getComputedStyle(w).fontSize) * 1.8)
        .map(w => w.textContent);

      // Regressão: "SUBSTANCIA / L" nos logos — mais linhas do que palavras = palavra partida no meio
      const tiles = [...document.querySelectorAll('.client-logo')].filter(tile => {
        const range = document.createRange();
        range.selectNodeContents(tile);
        const lines = new Set([...range.getClientRects()].map(r => Math.round(r.top))).size;
        return lines > tile.textContent.trim().split(/\s+/).length;
      }).map(tile => tile.textContent.trim());

      return [...words, ...tiles];
    });
    await page.close();
    assert.deepEqual(broken, []);
  });

  // A linha da palavra girando tem overflow hidden: uma frase larga demais seria cortada sem aviso.
  test(`todas as frases do rotator cabem na coluna em ${viewport.width}px`, async () => {
    const page = await openPage(viewport);
    const overflowing = await page.evaluate(() => {
      const rotator = document.querySelector('.word-rotator');
      const probe = rotator.querySelector('.word-rotator-item').cloneNode();
      probe.style.cssText = 'position:absolute;visibility:hidden;transform:none';
      rotator.appendChild(probe);
      const result = rotator.dataset.words.split('|').filter(phrase => {
        probe.textContent = phrase;
        return probe.getBoundingClientRect().width > rotator.clientWidth;
      });
      probe.remove();
      return result;
    });
    await page.close();
    assert.deepEqual(overflowing, []);
  });
}

test('convite "role para conhecer" aparece no canto do hero e some ao rolar', async () => {
  const page = await openPage({ width: 1440, height: 900 });
  const cue = page.locator('#scroll-cue');
  await page.waitForTimeout(3600); // a entrada do convite espera a abertura do hero

  assert.equal(await cue.getAttribute('href'), '#about');
  const shown = await cue.evaluate(el => parseFloat(getComputedStyle(el).opacity) * parseFloat(getComputedStyle(el.firstElementChild).opacity));
  const box = await cue.boundingBox();

  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(1200);
  const hidden = await cue.evaluate(el => parseFloat(getComputedStyle(el).opacity));
  await page.close();

  assert.ok(shown > 0.9, `convite com opacidade ${shown} depois da entrada`);
  assert.ok(box.y + box.height > 900 - 120 && box.x > 1440 / 2, 'convite fora do canto inferior direito');
  assert.ok(hidden < 0.1, 'convite continua visível depois de rolar');
});

test('carrossel de depoimentos avança pelo botão', async () => {
  const page = await openPage({ width: 1440, height: 900 });
  assert.equal(await page.locator('#testimonials [data-carousel-prev]').isDisabled(), true);

  await page.locator('#testimonials [data-carousel-next]').click();
  await page.waitForFunction(() => document.querySelector('#testimonials .carousel-track').scrollLeft > 50, null, { timeout: 3000 });
  await page.waitForFunction(() => !document.querySelector('#testimonials [data-carousel-prev]').disabled, null, { timeout: 3000 });
  await page.close();
});

test('portfólio: Limpurb em destaque, 3 cases e todas as imagens carregam', async () => {
  const page = await openPage({ width: 1440, height: 900 });
  assert.equal(await page.locator('#work .case-featured').count(), 1);
  assert.equal(await page.locator('#work .case-card').count(), 3);

  // as imagens são lazy: força o carregamento para verificar arquivos quebrados
  await page.evaluate(() => document.querySelectorAll('#work img').forEach(img => { img.loading = 'eager'; }));
  await page.waitForFunction(() => [...document.querySelectorAll('#work img')].every(img => img.complete), null, { timeout: 10000 });
  const broken = await page.$$eval('#work img', imgs => imgs.filter(i => i.naturalWidth === 0).map(i => i.getAttribute('src')));
  await page.close();
  assert.deepEqual(broken, []);
});

// Regressão: capa com width fixa de 320px invadia o padding do card em 390px (sem estourar a página).
test('capa do case Limpurb fica dentro da área útil do card no celular', async () => {
  const page = await openPage({ width: 390, height: 844 });
  const excess = await page.evaluate(() => {
    const card = document.querySelector('.case-featured');
    const cover = document.querySelector('.case-featured-cover');
    const contentRight = card.getBoundingClientRect().right - parseFloat(getComputedStyle(card).paddingRight);
    return Math.round(cover.getBoundingClientRect().right - contentRight);
  });
  await page.close();
  assert.ok(excess <= 0, `capa passa ${excess}px da área útil do card`);
});

test('reels da Limpurb rolam pelo botão', async () => {
  const page = await openPage({ width: 1440, height: 900 });
  await page.locator('.case-reels [data-carousel-next]').click();
  await page.waitForFunction(() => document.querySelector('.reels-track').scrollLeft > 50, null, { timeout: 3000 });
  await page.close();
});

// Rola até uma fração do percurso da faixa da trajetória (0 = acabou de prender, 1 = fim).
async function scrollTrajectory(page, ratio) {
  await page.evaluate((ratio) => {
    const wrap = document.querySelector('.trajectory');
    const y = wrap.getBoundingClientRect().top + window.scrollY + (wrap.offsetHeight - window.innerHeight) * ratio;
    if (PS.lenis) PS.lenis.scrollTo(y, { immediate: true });
    else window.scrollTo(0, y);
  }, ratio);
  await page.waitForTimeout(1200); // scrub suaviza o deslocamento
}

// A trajetória é uma faixa horizontal que avança com a rolagem. Fica presa por position: sticky,
// não por ScrollTrigger.pin: sem .pin-spacer, nada disputa o controle do scroll com o Lenis.
for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  test(`trajetória em ${viewport.width}px: presa na tela, anda para o lado e mostra a seta`, async () => {
    const page = await openPage(viewport);
    await scrollTrajectory(page, 0.6);
    const r = await page.evaluate(() => {
      const card = document.querySelector('.timeline-card.is-active').getBoundingClientRect();
      return {
        pinSpacers: document.querySelectorAll('.pin-spacer').length,
        rows: document.querySelectorAll('.timeline-card').length,
        stickyTop: Math.round(document.querySelector('.trajectory-sticky').getBoundingClientRect().top),
        trackX: new DOMMatrix(getComputedStyle(document.querySelector('.timeline-list')).transform).m41,
        cue: parseFloat(getComputedStyle(document.querySelector('.trajectory-cue')).opacity),
        counter: document.querySelector('.trajectory-count-current').textContent,
        // O card "ativo" é definido pelo foco em 40% da faixa (js/timeline.js): durante o scrub
        // ele pode estar saindo pela esquerda enquanto o próximo ainda não entrou por completo —
        // isso é o próprio movimento, não um bug. O que precisa valer sempre: cabe na vertical
        // (nunca corta o rodapé do card) e ainda cruza a viewport na horizontal (não sumiu de vez).
        activeFitsVertically: card.height > 0 && card.bottom <= window.innerHeight + 1,
        activeCrossesViewport: card.right > 0 && card.left < window.innerWidth
      };
    });
    await page.close();
    assert.equal(r.pinSpacers, 0);
    assert.equal(r.rows, 4);
    assert.equal(r.stickyTop, 0, 'a faixa não ficou presa no topo da tela');
    assert.ok(r.trackX < -300, `a faixa andou só ${Math.round(r.trackX)}px`);
    assert.ok(r.cue > 0.9, 'a seta "role para avançar" não apareceu');
    assert.notEqual(r.counter, '01', 'o contador não acompanhou a faixa');
    assert.ok(r.activeFitsVertically, 'o cartão ativo estoura a altura da tela');
    assert.ok(r.activeCrossesViewport, 'o cartão ativo saiu inteiro da tela');
  });
}

// Com "reduzir movimento" a faixa não é guiada pela rolagem: vira carrossel nativo de arrastar.
test('trajetória com "reduzir movimento" vira carrossel de arrastar, sem prender a tela', async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await page.goto(PAGE_URL, { waitUntil: 'load' });
  await page.waitForTimeout(500);
  const r = await page.evaluate(() => {
    const wrap = document.querySelector('.trajectory');
    const track = document.querySelector('.timeline-list');
    return {
      scrubbed: wrap.classList.contains('is-scrubbed'),
      scrollable: track.scrollWidth > track.clientWidth,
      overflow: document.documentElement.scrollWidth - window.innerWidth
    };
  });
  await page.close();
  assert.equal(r.scrubbed, false);
  assert.ok(r.scrollable, 'a faixa não rola na horizontal');
  assert.ok(r.overflow <= 0, `documento ${r.overflow}px mais largo que a viewport`);
});

// Regressão: "2024 — 2025" e "2020 — Hoje" quebravam em duas linhas dentro da coluna fixa de 200px do ano.
test('anos com intervalo não quebram linha na coluna da trajetória', async () => {
  const page = await openPage({ width: 1024, height: 900 });
  const wrapped = await page.evaluate(() =>
    [...document.querySelectorAll('.timeline-year')]
      .filter(y => y.getBoundingClientRect().height > parseFloat(getComputedStyle(y).fontSize) * 1.5)
      .map(y => y.querySelector('.sr-only').textContent)
  );
  await page.close();
  assert.deepEqual(wrapped, []);
});

// Regressão: a régua de progresso preenche conforme a seção rola, sem travar o scroll da página.
test('régua de progresso da trajetória preenche ao rolar', async () => {
  const page = await openPage({ width: 1440, height: 900 });
  const before = await page.evaluate(() => getComputedStyle(document.querySelector('.timeline-progress-fill')).transform);
  await scrollTrajectory(page, 0.5);
  const after = await page.evaluate(() => getComputedStyle(document.querySelector('.timeline-progress-fill')).transform);
  await page.close();
  assert.notEqual(before, after);
});

// Regressão: o hero ganhou uma coluna de atalhos (estilo NESH) — precisa existir, ir aos
// destinos certos e não sobrepor o conteúdo em telas menores que o próprio hero exige.
test('atalhos do hero existem, apontam para seções reais e ficam ocultos em telas médias', async () => {
  const desktop = await openPage({ width: 1440, height: 900 });
  const hrefs = await desktop.$$eval('.hero-shortcut', els => els.map(el => el.getAttribute('href')));
  const missing = [];
  for (const href of hrefs) {
    const exists = await desktop.evaluate((sel) => !!document.querySelector(sel), href);
    if (!exists) missing.push(href);
  }
  const visibleOnDesktop = await desktop.locator('.hero-shortcuts').isVisible();
  await desktop.close();
  assert.equal(hrefs.length, 7);
  assert.deepEqual(missing, []);
  assert.equal(visibleOnDesktop, true);

  const tablet = await openPage({ width: 1024, height: 900 });
  const visibleOnTablet = await tablet.locator('.hero-shortcuts').isVisible();
  await tablet.close();
  assert.equal(visibleOnTablet, false, 'atalhos deveriam sumir antes de disputar espaço com o texto do hero');
});

// Regressão: o GSAP deixava o transform da entrada gravado inline, e o zoom de hover em CSS
// nunca mais conseguia sobrescrevê-lo — o case ficava com hover morto para sempre.
test('zoom de hover nos cases funciona depois da animação de entrada terminar', async () => {
  const page = await openPage({ width: 1440, height: 900 });
  const card = page.locator('.case-card').first();
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500); // entrada completa (~1.1s) + folga

  const img = card.locator('.case-media-main img');
  const before = await img.evaluate(el => getComputedStyle(el).transform);
  await img.hover();
  await page.waitForTimeout(1000); // transição de hover (0.9s)
  const after = await img.evaluate(el => getComputedStyle(el).transform);

  await page.close();
  assert.notEqual(before, after, 'hover não mudou o transform — a entrada travou o estilo inline');
});

// Cards de vidro: fundo translúcido + borda em gradiente (não a borda reta genérica de antes).
test('cards de projetos/serviços/depoimentos/planos usam o tratamento de vidro', async () => {
  const page = await openPage({ width: 1440, height: 900 });
  const results = await page.evaluate(() => {
    const selectors = ['.service-card', '.testimonial-card', '.plan-card', '.case-card', '.case-featured'];
    return selectors.map(sel => {
      const el = document.querySelector(sel);
      const cs = getComputedStyle(el);
      const after = getComputedStyle(el, '::after');
      return {
        sel,
        hasBackdropBlur: cs.backdropFilter.includes('blur') || cs.webkitBackdropFilter?.includes('blur'),
        hasGradientBorder: after.backgroundImage.includes('conic-gradient'),
        // a máscara é o que recorta o anel de 1px — sem ela o gradiente cobriria o card inteiro
        isMasked: (after.maskComposite && after.maskComposite !== 'add') ||
                  (after.webkitMaskComposite && after.webkitMaskComposite !== 'source-over')
      };
    });
  });
  await page.close();
  for (const r of results) {
    assert.ok(r.hasBackdropBlur, `${r.sel} sem backdrop-filter`);
    assert.ok(r.hasGradientBorder, `${r.sel} sem a borda em gradiente no ::after`);
    assert.ok(r.isMasked, `${r.sel} sem máscara no ::after — o gradiente cobriria o card inteiro, não só a borda`);
  }
});

// Regressão (2 tentativas erradas antes desta): 1ª, duas camadas no mesmo `background`
// vazavam o gradiente por cima do card (a cor de fundo não é 100% opaca ali). 2ª, um
// z-index:-1 no ::after também vazava — por especificação, z-index negativo pinta ACIMA
// do próprio background do elemento, não atrás dele. A prova real é visual: o pixel do
// centro do card (bem longe de qualquer texto/borda) precisa ser a cor de vidro (cinza
// translúcido), nunca um tom do gradiente neon vazando por cima.
test('gradiente da borda não vaza para o interior translúcido do card (checagem visual)', async () => {
  const page = await openPage({ width: 1440, height: 900 });
  const card = page.locator('.service-card').first();
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(700); // Lenis suaviza o scroll — espera assentar antes de calcular o recorte

  const box = await card.boundingBox();
  const buffer = await page.screenshot({
    clip: { x: Math.round(box.x + box.width / 2 - 4), y: Math.round(box.y + box.height / 2 - 4), width: 8, height: 8 }
  });
  await page.close();

  const png = decodePNG(buffer);
  const { r, g, b } = pixelAt(png, 4, 4);

  // Cinza-grafite (--glass-bg ~ rgb 38,40,44 sobre o fundo da página): componentes próximos entre si.
  // O gradiente neon (rgb 254, 99, 61) vazando por cima empurraria o verde bem acima do azul/vermelho.
  assert.ok(g - b < 40, `centro do card com tom esverdeado (rgb ${r},${g},${b}) — o gradiente da borda vazou para o interior`);
});

// Regressão: contact-card tinha "transform: translateY(-5px)" fixo em CSS, que brigaria
// com o tilt em JS (inline sempre vence). O tilt precisa ser o único dono do transform.
test('card de contato inclina em 3D acompanhando o mouse e volta ao soltar', async () => {
  const page = await openPage({ width: 1440, height: 900 });
  const card = page.locator('.contact-card').first();
  await card.scrollIntoViewIfNeeded();
  // Lenis suaviza o scroll: ler a posição cedo demais mira o mouse onde o card
  // costumava estar, não onde ele parou. Dá tempo do scroll assentar antes de mirar.
  await page.waitForTimeout(700);

  await card.hover({ position: { x: 20, y: 20 } }); // canto, pra gerar uma inclinação bem marcada
  await page.waitForTimeout(700);
  const tilted = await card.evaluate(el => getComputedStyle(el).transform);

  await page.mouse.move(5, 5); // sai do card
  await page.waitForTimeout(700);
  const reset = await card.evaluate(el => getComputedStyle(el).transform);

  await page.close();
  assert.notEqual(tilted, 'none', 'card não inclinou com o mouse por cima');
  assert.notEqual(tilted, reset, 'a inclinação não mudou entre o hover e o mouse fora do card');
});

// Regressão: mudar animation-duration no hover causaria um salto; a faixa precisa
// desacelerar suavemente (GSAP timeScale), não parar/pular de golpe.
test('faixa de clientes desacelera suavemente no hover', async () => {
  const page = await openPage({ width: 1440, height: 900 });
  const strip = page.locator('.infinite-strip');
  const track = page.locator('.strip-track');

  const posAt = async () => track.evaluate(el => new DOMMatrix(getComputedStyle(el).transform).m41);

  const p1 = await posAt();
  await page.waitForTimeout(500);
  const p2 = await posAt();
  const normalSpeed = Math.abs(p2 - p1);

  await strip.hover();
  await page.waitForTimeout(1200); // dá tempo do timeScale desacelerar
  const p3 = await posAt();
  await page.waitForTimeout(500);
  const p4 = await posAt();
  const hoverSpeed = Math.abs(p4 - p3);

  await page.close();
  assert.ok(hoverSpeed < normalSpeed * 0.6, `velocidade no hover (${hoverSpeed.toFixed(1)}) não caiu o suficiente vs. normal (${normalSpeed.toFixed(1)})`);
});

// Regressão: em touch, o navegador pode sintetizar "mouseenter" no toque sem um "mouseleave"
// correspondente ao soltar o dedo. Isso chamava lenis.stop() e nunca lenis.start(), travando
// o scroll suave da página pra sempre depois de deslizar sobre a trajetória/carrossel de clientes.
test('deslizar (touch) sobre a trajetória ou o carrossel de clientes não trava o scroll suave', async () => {
  const page = await openPage({ width: 390, height: 844 }, { hasTouch: true });
  await page.waitForFunction(() => window.PS && window.PS.lenis, null, { timeout: 5000 });

  const stoppedAfter = await page.evaluate(() => {
    // mesmo evento sintético que um toque dispara: mouseenter sem mouseleave depois.
    document.querySelector('.trajectory')?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
    document.querySelector('.clients-carousel')?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
    return window.PS.lenis.isStopped;
  });

  await page.close();
  assert.equal(stoppedAfter, false, 'lenis ficou parado (isStopped) após simular um toque, travando o scroll');
});

// Regressão: a palavra do rotator sumia de uma vez (fromTo com immediateRender) e ficava ~43% do tempo invisível.
test('palavra girando sai subindo e fica visível na maior parte do ciclo', async () => {
  const page = await openPage({ width: 1440, height: 900 });
  const samples = await page.evaluate(async () => {
    const item = document.querySelector('.word-rotator-item');
    const rotator = document.querySelector('.word-rotator');
    await new Promise(r => setTimeout(r, 3500)); // preloader + entrada do hero
    const out = [];
    for (let i = 0; i < 70; i++) {
      out.push({
        opacity: parseFloat(getComputedStyle(item).opacity),
        dy: item.getBoundingClientRect().top - rotator.getBoundingClientRect().top
      });
      await new Promise(r => setTimeout(r, 50));
    }
    return out;
  });
  await page.close();

  const visible = samples.filter(s => s.opacity > 0.9 && Math.abs(s.dy) < 4).length / samples.length;
  const exitsUpward = samples.some(s => s.dy < -5 && s.opacity > 0.05);
  assert.ok(exitsUpward, 'a saída da palavra não é visível (some de uma vez)');
  assert.ok(visible >= 0.65, `palavra visível só ${Math.round(visible * 100)}% do tempo`);
});

// O "PS" gigante do fundo do hero se move mais devagar que o resto ao rolar (profundidade sutil).
test('"PS" do hero tem parallax: se move mais devagar que a rolagem', async () => {
  const page = await openPage({ width: 1440, height: 900 });
  await page.waitForTimeout(3500); // preloader + entrada do hero

  const before = await page.evaluate(() => document.querySelector('.hero-giant-type').getBoundingClientRect().top);
  await page.evaluate(() => window.scrollTo(0, 300));
  await page.waitForTimeout(500);
  const after = await page.evaluate(() => document.querySelector('.hero-giant-type').getBoundingClientRect().top);

  await page.close();
  const moved = before - after; // sem parallax seria exatamente 300 (acompanha 1:1)
  assert.ok(moved > 150 && moved < 290, `"PS" andou ${Math.round(moved)}px em 300px de scroll — devia ficar visivelmente para trás, mas sem parar`);
});

// Regressão: o badge do contador aparece na primeira dobra e ficava em "+0" até a pessoa rolar.
test('contador visível na primeira dobra termina sem precisar rolar', async () => {
  const page = await openPage({ width: 1440, height: 900 });
  await page.waitForFunction(
    () => document.querySelector('.hero-gallery-stat strong').textContent === '+6', null, { timeout: 6000 }
  );
  await page.close();
});

test('contador abaixo da dobra termina ao entrar na tela', async () => {
  const page = await openPage({ width: 1440, height: 900 });
  await page.locator('dd[data-count="44"]').scrollIntoViewIfNeeded();
  await page.waitForFunction(
    () => document.querySelector('dd[data-count="44"]').textContent === '44 mil', null, { timeout: 6000 }
  );
  await page.close();
});

// Regressão: o retrato da Priscila entrou no hero (foto real, blur-to-focus); título, ações e a
// faixa de fotos precisam continuar na 1ª dobra e o botão principal não pode ficar coberto pelo retrato.
for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  test(`hero em ${viewport.width}px: retrato visível, título na 1ª dobra e botão clicável`, async () => {
    const page = await openPage(viewport);
    await page.waitForTimeout(3000); // preloader + entrada do hero
    const r = await page.evaluate(() => {
      const title = document.querySelector('#hero-heading').getBoundingClientRect();
      const portrait = document.querySelector('.hero-portrait img').getBoundingClientRect();
      const btn = document.querySelector('.hero-actions .btn-primary-nesh').getBoundingClientRect();
      const hit = document.elementFromPoint(btn.left + btn.width / 2, btn.top + btn.height / 2);
      return {
        portraitVisible: portrait.width > 0 && portrait.height > 0,
        titleBottom: title.bottom,
        btnOnTop: !!hit && !!hit.closest('.btn-primary-nesh'),
        ufbaPill: [...document.querySelectorAll('#hero .pill-tag')].length
      };
    });
    await page.close();
    assert.ok(r.portraitVisible, 'o retrato da Priscila não está visível no hero');
    assert.ok(r.titleBottom <= viewport.height, `título termina em ${Math.round(r.titleBottom)}px, fora da 1ª dobra`);
    assert.ok(r.btnOnTop, 'o botão principal está coberto por outro elemento');
    assert.equal(r.ufbaPill, 0);
  });
}

// Regressão: as fotos da faixa (trabalho/uniforme) precisam carregar de verdade, não só existir no DOM.
test('faixa de fotos do hero carrega todas as imagens', async () => {
  const page = await openPage({ width: 1440, height: 900 });
  await page.waitForFunction(() => document.querySelectorAll('.hero-gallery-item img').length >= 3);
  await page.evaluate(() => document.querySelectorAll('.hero-gallery-item img').forEach(img => { img.loading = 'eager'; }));
  await page.waitForFunction(() => [...document.querySelectorAll('.hero-gallery-item img')].every(img => img.complete), null, { timeout: 10000 });
  const broken = await page.$$eval('.hero-gallery-item img', imgs => imgs.filter(i => i.naturalWidth === 0).map(i => i.getAttribute('src')));
  await page.close();
  assert.deepEqual(broken, []);
});

test('preloader roda só na primeira visita da sessão', async () => {
  const page = await openPage({ width: 1440, height: 900 });
  assert.equal(await page.evaluate(() => sessionStorage.getItem('ps-preloader-seen')), '1');
  await page.waitForFunction(() => !document.documentElement.classList.contains('show-preloader'), null, { timeout: 4000 });

  await page.reload({ waitUntil: 'load' });
  assert.equal(await page.evaluate(() => document.documentElement.classList.contains('show-preloader')), false);
  await page.close();
});

// Regressão: com os CDNs fora do ar, hero e cards ficavam com opacity 0 para sempre.
test('conteúdo fica visível quando GSAP/CDNs falham', async () => {
  const page = await openPage({ width: 1440, height: 900 }, { blockCdn: true });
  await page.waitForTimeout(3000);
  const hidden = await page.evaluate(() =>
    [...document.querySelectorAll('#hero-desc, #hero-actions, .hero-gallery, .hero-shortcuts, .gsap-reveal, .case-featured, .case-card')]
      .filter(el => getComputedStyle(el).opacity === '0')
      .map(el => el.id || el.className)
  );
  await page.close();
  assert.deepEqual(hidden, []);
});

test('menu mobile abre, fecha com Esc e devolve o foco', async () => {
  const page = await openPage({ width: 390, height: 844 });
  const toggle = page.locator('#nav-toggle');
  const menu = page.locator('#mobile-menu');

  await toggle.click();
  assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
  await menu.waitFor({ state: 'visible', timeout: 2000 });
  const clippedLinks = await page.$$eval('.mobile-link', links =>
    links.filter(l => l.getBoundingClientRect().right > window.innerWidth).map(l => l.textContent.trim())
  );
  assert.deepEqual(clippedLinks, [], 'links do menu mobile estouram a tela');

  await page.keyboard.press('Escape');
  assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
  await menu.waitFor({ state: 'hidden', timeout: 2000 });
  assert.equal(await page.evaluate(() => document.activeElement.id), 'nav-toggle');
  await page.close();
});

test('formulário bloqueia envio inválido e marca os campos', async () => {
  const page = await openPage({ width: 1440, height: 900 });
  await page.fill('#field-name', 'A');
  await page.fill('#field-contact', 'nao-e-contato');
  await page.click('.form-submit');
  const invalid = await page.$$eval('[aria-invalid="true"]', els => els.map(e => e.id));
  await page.close();
  assert.deepEqual(invalid.sort(), ['field-contact', 'field-message', 'field-name']);
});
