import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const PAGE_URL = pathToFileURL(resolve('index.html')).href;
const ERROR_PAGE_URL = pathToFileURL(resolve('404.html')).href;

test('Arquivos de SEO (robots.txt e sitemap.xml) existem e são válidos', () => {
  assert.ok(existsSync(resolve('robots.txt')), 'robots.txt deve existir');
  const robots = readFileSync(resolve('robots.txt'), 'utf-8');
  assert.match(robots, /User-agent:\s*\*/i);
  assert.match(robots, /Sitemap:\s*https:\/\/pscomunica.com.br\/sitemap\.xml/i);

  assert.ok(existsSync(resolve('sitemap.xml')), 'sitemap.xml deve existir');
  const sitemap = readFileSync(resolve('sitemap.xml'), 'utf-8');
  assert.match(sitemap, /<loc>https:\/\/pscomunica.com.br\/<\/loc>/);
});

test('Página 404.html existe, contém noindex e botão para página inicial', async () => {
  assert.ok(existsSync(resolve('404.html')), '404.html deve existir');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(ERROR_PAGE_URL);

  const noindexMeta = await page.$('meta[name="robots"][content*="noindex"]');
  assert.ok(noindexMeta, 'Deve ter meta tag noindex');

  const titleText = await page.title();
  assert.match(titleText, /404/);

  const homeBtn = await page.$('a[href="/"]');
  assert.ok(homeBtn, 'Deve ter botão de retorno para o início');

  await page.close();
  await browser.close();
});

test('Formulário exibe erro visual ao submeter vazio e exibe sucesso + botão fallback (Plano B) ao submeter preenchido', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(PAGE_URL);

  // 1. Rola até o formulário
  await page.locator('#contact-form').scrollIntoViewIfNeeded();

  // 2. Tenta submeter vazio
  await page.click('#contact-form button[type="submit"]');

  // Verifica estado de erro no container e campo
  const errorFeedback = await page.$('.form-feedback--error');
  assert.ok(errorFeedback, 'Deve exibir card visual de erro');

  const nameError = await page.$eval('[data-error-for="field-name"]', el => el.textContent.trim());
  assert.ok(nameError.length > 0, 'Deve exibir texto de erro no campo nome');

  // 3. Preenche os campos
  await page.fill('#field-name', 'Empresa Teste');
  await page.fill('#field-contact', '71999999999');

  // Escolhe um serviço na caixa de seleção
  await page.click('#block-services .form-select-trigger');
  await page.click('#block-services .form-select-option');

  // Submete preenchido
  await page.click('#contact-form button[type="submit"]');

  // 4. Verifica estado de sucesso visível
  const successFeedback = await page.waitForSelector('.form-feedback--success', { timeout: 3000 });
  assert.ok(successFeedback, 'Deve exibir card visual de sucesso');

  // 5. Verifica existência do link visível de contingência (Plano B)
  const fallbackLink = await page.$('#fallback-whatsapp-link');
  assert.ok(fallbackLink, 'Deve existir o botão de contingência (Plano B) para o WhatsApp');

  const href = await fallbackLink.getAttribute('href');
  assert.match(href, /^https:\/\/wa\.me\/5571988350272\?text=/);
  assert.ok(href.includes('Empresa%20Teste') || href.includes('Empresa+Teste'), 'Href deve conter o nome codificado');

  await page.close();
  await browser.close();
});

test('Barra de menu inferior (mobile-tabbar) tem 5 atalhos e fica permanentemente visível ao rolar para baixo', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(PAGE_URL);

  // 1. Verifica que há pelo menos 5 atalhos
  const links = await page.$$('.mobile-tabbar .tab-link');
  assert.ok(links.length >= 5, `Esperava pelo menos 5 atalhos na tabbar, encontrou ${links.length}`);

  // 2. Verifica visibilidade inicial da barra
  const tabbar = page.locator('.mobile-tabbar');
  await assert.doesNotReject(tabbar.waitFor({ state: 'visible', timeout: 3000 }));

  // 3. Rola bastante a página para baixo
  await page.evaluate(() => window.scrollTo(0, 1500));
  await page.waitForTimeout(500);

  // 4. Verifica que a barra continua visível e sem classe is-hidden
  const isHiddenClass = await tabbar.evaluate(el => el.classList.contains('is-hidden'));
  assert.equal(isHiddenClass, false, 'A barra não deve receber a classe is-hidden ao rolar para baixo');

  const isVisible = await tabbar.isVisible();
  assert.ok(isVisible, 'A barra de navegação inferior deve permanecer visível após rolagem para baixo');

  await page.close();
  await browser.close();
});

test('Barra de menu principal (header) é visível no hero e some ao rolar para fora dele no mobile', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(PAGE_URL);

  const header = page.locator('.header');
  const toggle = page.locator('#nav-toggle');

  // 1. No topo (dentro do hero), o header e o toggle estão visíveis
  assert.equal(await header.evaluate(el => el.classList.contains('is-hidden')), false);
  assert.ok(await toggle.isVisible(), 'Botão hambúrguer deve estar visível no topo');

  // 2. Rola para fora do hero (ex: 1200px)
  await page.evaluate(() => window.scrollTo(0, 1200));
  await page.waitForFunction(() => document.querySelector('.header').classList.contains('is-hidden'), null, { timeout: 3000 });

  const isHidden = await header.evaluate(el => el.classList.contains('is-hidden'));
  assert.equal(isHidden, true, 'Header deve receber .is-hidden ao sair da área do hero');

  // 3. Rola de volta para o topo (hero)
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForFunction(() => !document.querySelector('.header').classList.contains('is-hidden'), null, { timeout: 3000 });

  assert.equal(await header.evaluate(el => el.classList.contains('is-hidden')), false, 'Header deve voltar a ficar visível no topo');

  await page.close();
  await browser.close();
});

test('Botão de envio para o WhatsApp no mobile tem todo o texto visível sem estouro ou corte em 360px', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 360, height: 740 } });
  await page.goto(PAGE_URL);

  const btn = page.locator('#btn-form-submit');
  await btn.scrollIntoViewIfNeeded();

  const metrics = await btn.evaluate(el => {
    const rect = el.getBoundingClientRect();
    const span = el.querySelector('span:first-child');
    const spanRect = span ? span.getBoundingClientRect() : null;
    return {
      btnWidth: rect.width,
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      spanWidth: spanRect ? spanRect.width : 0,
      text: el.textContent.trim(),
      hasOverflow: el.scrollWidth > el.clientWidth + 1
    };
  });

  assert.match(metrics.text, /WhatsApp/i);
  assert.equal(metrics.hasOverflow, false, 'Botão não deve ter estouro horizontal de texto');
  assert.ok(metrics.btnWidth <= 360, 'Botão deve caber na viewport');

  await page.close();
  await browser.close();
});

test('Fonte Outfit do Fontshare está configurada e aplicada no site', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(PAGE_URL);

  const bodyFont = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  assert.match(bodyFont, /Satoshi|Outfit/i, 'A fonte do body deve conter Satoshi ou Outfit');

  const headingFont = await page.evaluate(() => getComputedStyle(document.querySelector('.hero-heading, h1, h2')).fontFamily);
  assert.match(headingFont, /Outfit/i, 'A fonte dos títulos deve conter Outfit');

  await page.close();
  await browser.close();
});

test('No desktop web, nav-toggle e mobile-menu ficam ocultos (sem ponto branco) e caixinha de projetos permanece visível', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(PAGE_URL);

  const toggleDisplay = await page.locator('#nav-toggle').evaluate(el => getComputedStyle(el).display);
  assert.equal(toggleDisplay, 'none', 'nav-toggle não deve ser visível no desktop (sem ponto branco)');

  const pill = page.locator('.btn-pill');
  const pillDisplay = await pill.evaluate(el => getComputedStyle(el).display);
  assert.notEqual(pillDisplay, 'none', 'A caixinha de disponível para novos projetos deve ser visível no desktop');

  const pillText = await pill.innerText();
  assert.match(pillText, /Disponível para (novos )?projetos/i);

  const statusIndicator = page.locator('.btn-pill .status-indicator');
  const isIndicatorVisible = await statusIndicator.isVisible();
  assert.equal(isIndicatorVisible, true, 'O indicador de status deve estar visível dentro da caixinha');

  await page.close();
  await browser.close();
});

test('Seletor de assunto adapta o formulário e leva o assunto para a mensagem do WhatsApp', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(PAGE_URL);

  // Estado inicial: cliente. As duas caixas de cliente aparecem.
  assert.equal(await page.$eval('#hidden-intent', el => el.value), 'Quero contratar um serviço');
  assert.equal(await page.$eval('#block-services', el => el.hidden), false);
  assert.equal(await page.$eval('#block-goals', el => el.hidden), false);

  // Marca um serviço e um objetivo antes de trocar de assunto.
  await page.click('#block-services .form-select-trigger');
  await page.click('#block-services .form-select-option');
  await page.click('#block-services .form-select-done');
  await page.click('#block-goals .form-select-trigger');
  await page.click('#block-goals .form-select-option');
  await page.click('#block-goals .form-select-done');
  assert.ok((await page.$eval('#hidden-services', el => el.value)).length > 0);

  // Troca para oportunidade profissional: esconde e limpa os grupos de cliente.
  await page.click('[data-select="intent"] .form-select-trigger');
  await page.click('[data-select="intent"] .form-select-option[data-intent="vaga"]');
  assert.equal(await page.$eval('#hidden-intent', el => el.value), 'Tenho uma oportunidade profissional');
  assert.equal(await page.$eval('#block-services', el => el.hidden), true);
  assert.equal(await page.$eval('#block-goals', el => el.hidden), true);
  assert.equal(await page.$eval('#hidden-services', el => el.value), '');
  assert.equal(await page.$eval('#hidden-goals', el => el.value), '');
  assert.match(await page.$eval('#field-message', el => el.placeholder), /vaga/i);

  // Escolha única: só uma opção de assunto fica marcada.
  assert.equal(
    await page.$$eval('[data-select="intent"] .form-select-option[aria-selected="true"]', els => els.length),
    1
  );

  // O assunto viaja na mensagem do WhatsApp, sem as escolhas de cliente.
  await page.fill('#field-name', 'Recrutadora Teste');
  await page.fill('#field-contact', 'rh@empresa.com');
  await page.click('#contact-form button[type="submit"]');
  await page.waitForSelector('.form-feedback--success', { timeout: 3000 });

  const href = await page.$eval('#fallback-whatsapp-link', el => el.getAttribute('href'));
  const text = decodeURIComponent(href.split('?text=')[1]);
  assert.match(text, /\*Assunto:\* Tenho uma oportunidade profissional/);
  assert.ok(!text.includes('Tenho interesse em'), 'Não deve levar serviços de cliente numa mensagem de vaga');

  await page.close();
  await browser.close();
});

test('Hero sinaliza disponibilidade para vagas e o atalho já marca o assunto no formulário', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(PAGE_URL);

  // A pílula do topo precisa falar dos dois públicos.
  const pill = await page.textContent('.availability-pill');
  assert.match(pill, /projetos e oportunidades/i);

  // O atalho existe, aponta pro contato e não compete com o botão principal.
  const jobLink = page.locator('.hero-job-link');
  await jobLink.waitFor({ state: 'visible', timeout: 3000 });
  assert.equal(await jobLink.getAttribute('href'), '#contact');

  const [principal, vaga] = await page.$$eval(
    '#hero-actions a',
    els => els.map(el => parseFloat(getComputedStyle(el).fontSize))
  );
  assert.ok(vaga <= principal, 'O atalho de vaga não pode ser maior que o botão principal');

  // Clicar nele deixa o formulário pronto pra recrutador.
  await jobLink.click();
  await page.waitForTimeout(400);
  assert.equal(await page.$eval('#hidden-intent', el => el.value), 'Tenho uma oportunidade profissional');
  assert.equal(await page.$eval('#block-services', el => el.hidden), true);

  await page.close();
  await browser.close();
});

test('Link direto /?assunto=vaga abre o formulário já no modo oportunidade', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(`${PAGE_URL}?assunto=vaga`);
  assert.equal(await page.$eval('#hidden-intent', el => el.value), 'Tenho uma oportunidade profissional');

  // Valor inválido na URL não pode quebrar nada nem mudar o padrão.
  const erros = [];
  page.on('pageerror', (err) => erros.push(err.message));
  await page.goto(`${PAGE_URL}?assunto=%22%5D,%5Bx`);
  await page.waitForTimeout(500);
  assert.equal(await page.$eval('#hidden-intent', el => el.value), 'Quero contratar um serviço');
  assert.deepEqual(erros, [], 'Assunto inválido na URL não pode gerar erro de JavaScript');

  await page.close();
  await browser.close();
});

// Regressão: o `display: flex` do painel vencia o atributo `hidden`, e a lista
// ficava aberta permanentemente, cobrindo os campos seguintes do formulário.
test('As listas só ocupam espaço quando abertas e liberam os campos de baixo', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(PAGE_URL);
  await page.waitForTimeout(2800);

  const intentPanel = page.locator('[data-select="intent"] .form-select-panel');
  const servicesPanel = page.locator('#block-services .form-select-panel');

  // Nasce tudo fechado: três linhas, não três listas abertas.
  assert.equal(await intentPanel.isVisible(), false);
  assert.equal(await servicesPanel.isVisible(), false);
  assert.equal(await page.locator('#block-goals .form-select-panel').isVisible(), false);

  // Escolha única fecha sozinha ao escolher.
  await page.click('[data-select="intent"] .form-select-trigger');
  assert.equal(await intentPanel.isVisible(), true);
  await page.click('[data-select="intent"] .form-select-option[data-intent="parceria"]');
  assert.equal(await intentPanel.isVisible(), false);

  // Múltipla escolha continua aberta pra marcar mais de um...
  await page.click('#block-services .form-select-trigger');
  await page.click('#block-services .form-select-option[data-value="Gestão de Redes Sociais"]');
  await page.click('#block-services .form-select-option[data-value="Criação de Conteúdo"]');
  assert.equal(await servicesPanel.isVisible(), true);
  assert.equal(
    await page.$eval('#block-services .form-select-value', el => el.textContent.trim()),
    'Gestão de Redes Sociais  +1',
    'A caixa fechada deve resumir a escolha múltipla'
  );

  // ...e o "Pronto" libera o campo de baixo.
  await page.click('#block-services .form-select-done');
  assert.equal(await servicesPanel.isVisible(), false);

  // Abrir uma lista fecha a outra. A ordem importa: a lista aberta cobre o que
  // vem abaixo dela, então quem abre por último tem que ser a de cima.
  await page.click('#block-services .form-select-trigger');
  await page.click('[data-select="intent"] .form-select-trigger');
  assert.equal(await servicesPanel.isVisible(), false, 'Duas listas não podem ficar abertas juntas');

  // Esc fecha a que estiver aberta.
  await page.keyboard.press('Escape');
  assert.equal(await intentPanel.isVisible(), false, 'Esc deve fechar a lista aberta');

  await page.close();
  await browser.close();
});

test('O site deixa claro que o atendimento é para todo o Brasil', async () => {
  const html = readFileSync(resolve('index.html'), 'utf-8');

  // Buscador e preview do link precisam dizer isso antes do clique.
  assert.match(html, /<meta name="description"[^>]*todo o Brasil/i);
  assert.match(html, /og:description"[^>]*todo o Brasil/i);

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(PAGE_URL);

  // A ficha estruturada precisa declarar o país, não só a cidade da base.
  const dados = JSON.parse(await page.$eval('script[type="application/ld+json"]', el => el.textContent));
  assert.equal(dados.areaServed.name, 'Brasil');

  // E o texto visível, em pelo menos três momentos da página.
  const texto = await page.textContent('body');
  const mencoes = (texto.match(/todo o Brasil|Brasil inteiro|qualquer lugar do Brasil/gi) || []).length;
  assert.ok(mencoes >= 3, `Esperava ao menos 3 menções ao alcance nacional, achei ${mencoes}`);


  await page.close();
  await browser.close();
});

test('Campos de contato e canais no fim do site estão sempre visíveis sem precisar rolar até o fim da página', async () => {
  const browser = await chromium.launch();

  // 1. Desktop (1440x900)
  const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktopPage.goto(PAGE_URL);
  await desktopPage.waitForTimeout(1000);

  // No topo da página, os elementos já não devem ter opacity: 0
  const dFormOpacity = await desktopPage.$eval('#contact-form', el => window.getComputedStyle(el).opacity);
  const dCardsOpacity = await desktopPage.$eval('.contact-card', el => window.getComputedStyle(el).opacity);
  assert.equal(dFormOpacity, '1', 'Formulário de contato deve ter opacity 1 no desktop');
  assert.equal(dCardsOpacity, '1', 'Cartões de contato devem ter opacity 1 no desktop');

  // Ao rolar apenas até o início da seção de contato (#contact), os campos já devem estar visíveis
  await desktopPage.evaluate(() => document.getElementById('contact').scrollIntoView());
  await desktopPage.waitForTimeout(400);

  const dNameVisible = await desktopPage.$eval('#field-name', el => {
    const style = window.getComputedStyle(el);
    return style.visibility !== 'hidden' && style.display !== 'none' && style.opacity === '1';
  });
  assert.ok(dNameVisible, 'Campo de nome deve estar visível ao chegar na seção de contato');

  await desktopPage.close();

  // 2. Mobile (390x844)
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto(PAGE_URL);
  await mobilePage.waitForTimeout(1000);

  // Ao rolar para #contact no mobile (sem rolar até o fim absoluto da página)
  await mobilePage.evaluate(() => document.getElementById('contact').scrollIntoView());
  await mobilePage.waitForTimeout(400);

  const mFormOpacity = await mobilePage.$eval('#contact-form', el => window.getComputedStyle(el).opacity);
  const mCardOpacity = await mobilePage.$eval('.contact-card', el => window.getComputedStyle(el).opacity);
  assert.equal(mFormOpacity, '1', 'Formulário de contato deve ter opacity 1 no mobile');
  assert.equal(mCardOpacity, '1', 'Cartões de contato devem ter opacity 1 no mobile');

  // Verifica que os campos principais estão visíveis
  const fieldsCheck = await mobilePage.$$eval('#field-name, #field-contact, #btn-form-submit', els => {
    return els.every(el => {
      const style = window.getComputedStyle(el);
      return style.visibility !== 'hidden' && style.display !== 'none' && style.opacity === '1';
    });
  });
  assert.ok(fieldsCheck, 'Todos os campos de contato devem estar visíveis sem precisar rolar até o fim');

  // Ao rolar para cima (reverse scroll), os campos não devem sumir
  await mobilePage.evaluate(() => window.scrollTo(0, 0));
  await mobilePage.waitForTimeout(400);
  const mFormOpacityAfterScrollUp = await mobilePage.$eval('#contact-form', el => window.getComputedStyle(el).opacity);
  assert.equal(mFormOpacityAfterScrollUp, '1', 'Campos de contato não devem sumir após rolagem reversa');

  await mobilePage.close();
  await browser.close();
});
