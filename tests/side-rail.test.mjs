import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const PAGE_URL = pathToFileURL(resolve('index.html')).href;

describe('Menu flutuante lateral (side-rail) e Header estático', () => {
  let browser;

  before(async () => {
    browser = await chromium.launch();
  });

  after(async () => {
    if (browser) await browser.close();
  });

  test('nomes das seções incluem Início com ícone de casinha e aparecem visíveis no desktop', async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(PAGE_URL, { waitUntil: 'load' });

    const labels = await page.$$eval('.side-rail .side-dot-label', els =>
      els.map(el => el.textContent.trim())
    );

    const expected = ['Início', 'Serviços', 'Projetos', 'Depoimentos', 'Minha Jornada', 'Por que eu', 'FAQ', 'Contato'];
    assert.deepEqual(labels, expected, 'todos os 8 links devem estar presentes na barra lateral (incluindo Início)');

    const hasHomeIcon = await page.locator('.side-rail .side-home-icon').isVisible();
    assert.equal(hasHomeIcon, true, 'ícone de casinha deve estar presente no link Início da lateral');

    // Verifica que não há casinha na barra de menu principal
    const navMenuHome = await page.locator('.nav-menu .nav-home').count();
    assert.equal(navMenuHome, 0, 'não deve haver ícone de casinha na barra de menu principal');

    await page.close();
  });

  test('logo badge ao lado de Priscila Santos não gira e não se mexe ao rolar', async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(PAGE_URL, { waitUntil: 'load' });

    // Rola para compactar o header
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(500);

    const badgeAnimation = await page.$eval('.logo-badge', el => {
      const s = getComputedStyle(el);
      return {
        animationName: s.animationName,
        transform: s.transform
      };
    });

    assert.equal(badgeAnimation.animationName, 'none', 'a logo não deve possuir animação de rotação');
    assert.ok(badgeAnimation.transform === 'none' || badgeAnimation.transform === 'matrix(1, 0, 0, 1, 0, 0)', 'a logo não deve se mover');

    await page.close();
  });

  test('barra lateral não possui caixa/container pesado ao redor (design limpo e livre)', async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(PAGE_URL, { waitUntil: 'load' });

    const railStyle = await page.$eval('.side-rail', el => {
      const s = getComputedStyle(el);
      return {
        hasBg: s.backgroundColor !== 'rgba(0, 0, 0, 0)' && s.backgroundColor !== 'transparent',
        hasBorder: s.borderStyle !== 'none' && parseFloat(s.borderWidth || '0') > 0,
        position: s.position
      };
    });

    assert.equal(railStyle.position, 'fixed', 'side-rail deve ser fixo na tela');
    assert.equal(railStyle.hasBg, false, 'side-rail não deve ter fundo em caixa');
    assert.equal(railStyle.hasBorder, false, 'side-rail não deve ter borda de caixa');

    await page.close();
  });

  test('conteúdo das seções tem margem de segurança (padding-right) para não ser coberto pelos nomes em telas médias', async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(PAGE_URL, { waitUntil: 'load' });

    const paddingRight = await page.$eval('.section > .container', el => {
      return parseFloat(getComputedStyle(el).paddingRight);
    });

    assert.ok(paddingRight >= 140, `padding-right (${paddingRight}px) deve ser de pelo menos 140px para proteger os textos contra sobreposição`);

    await page.close();
  });

  test('no mobile (<=900px), a barra lateral fica oculta para privilegiar a barra inferior', async () => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(PAGE_URL, { waitUntil: 'load' });

    const display = await page.$eval('.side-rail', el => getComputedStyle(el).display);
    assert.equal(display, 'none', 'side-rail não deve ser exibido no mobile');

    await page.close();
  });
});
