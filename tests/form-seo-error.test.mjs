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
  assert.match(robots, /Sitemap:\s*https:\/\/priscilasantos\.com\.br\/sitemap\.xml/i);

  assert.ok(existsSync(resolve('sitemap.xml')), 'sitemap.xml deve existir');
  const sitemap = readFileSync(resolve('sitemap.xml'), 'utf-8');
  assert.match(sitemap, /<loc>https:\/\/priscilasantos\.com\.br\/<\/loc>/);
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

  // Seleciona um chip
  const firstChip = await page.$('#services-chips .form-chip');
  if (firstChip) await firstChip.click();

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
  assert.match(bodyFont, /Outfit/i, 'A fonte do body deve conter Outfit');

  const headingFont = await page.evaluate(() => getComputedStyle(document.querySelector('.hero-heading, h1, h2')).fontFamily);
  assert.match(headingFont, /Outfit/i, 'A fonte dos títulos deve conter Outfit');

  await page.close();
  await browser.close();
});

test('No desktop web, nav-toggle e mobile-menu ficam ocultos e caixinha de novos projetos está renovada', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(PAGE_URL);

  const toggleDisplay = await page.locator('#nav-toggle').evaluate(el => getComputedStyle(el).display);
  assert.equal(toggleDisplay, 'none', 'nav-toggle não deve ser visível no desktop (sem ponto branco)');

  const pill = page.locator('.btn-pill');
  const pillDisplay = await pill.evaluate(el => getComputedStyle(el).display);
  assert.notEqual(pillDisplay, 'none', 'A caixinha de disponível para novos projetos deve ser visível no desktop');

  const pillText = await pill.innerText();
  assert.match(pillText, /Disponível para novos projetos/i);

  const statusIndicator = page.locator('.btn-pill .status-indicator');
  const isIndicatorVisible = await statusIndicator.isVisible();
  assert.equal(isIndicatorVisible, true, 'O indicador de status deve estar visível dentro da caixinha');

  await page.close();
  await browser.close();
});
