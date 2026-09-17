import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const PAGE_URL = pathToFileURL(resolve('index.html')).href;

describe('Header Instagram e Hero Disponibilidade', () => {
  let browser;

  before(async () => {
    browser = await chromium.launch();
  });

  after(async () => {
    if (browser) await browser.close();
  });

  test('menu superior contém link do Instagram nos tons do site', async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(PAGE_URL, { waitUntil: 'load' });

    const igLink = page.locator('.nav-action .nav-instagram');
    assert.equal(await igLink.isVisible(), true, 'link do Instagram deve estar visível no menu desktop');

    const href = await igLink.getAttribute('href');
    assert.match(href, /instagram\.com\/prisantos2021/i, 'link deve apontar para o Instagram oficial');

    const hasIcon = await igLink.locator('.nav-instagram-icon').isVisible();
    assert.equal(hasIcon, true, 'ícone do Instagram deve estar visível');

    const text = await igLink.innerText();
    assert.match(text, /Instagram/i, 'texto deve ser Instagram');

    await page.close();
  });

  test('hero contém botão "Disponível para projetos" com indicador pulsante no lugar de UFBA', async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(PAGE_URL, { waitUntil: 'load' });

    const heroPill = page.locator('.hero-tag-wrap .btn-pill');
    assert.equal(await heroPill.isVisible(), true, 'caixinha de disponibilidade deve estar visível no Hero');

    const pillText = await heroPill.innerText();
    assert.match(pillText, /Disponível para (novos )?projetos/i, 'deve exibir Disponível para projetos no Hero');

    const indicator = heroPill.locator('.status-indicator');
    assert.equal(await indicator.isVisible(), true, 'indicador de status deve estar presente e visível');

    // Garante que o texto antigo da UFBA não está mais presente
    const ufbaCount = await page.locator('.hero-tag-wrap').evaluate(el => el.textContent.includes('UFBA'));
    assert.equal(ufbaCount, false, 'texto "Jornalista formada pela UFBA" deve ter sido substituído');

    await page.close();
  });
});
