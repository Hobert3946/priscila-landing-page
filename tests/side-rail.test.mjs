import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const PAGE_URL = pathToFileURL(resolve('index.html')).href;

describe('Menu flutuante lateral (side-rail)', () => {
  let browser;

  before(async () => {
    browser = await chromium.launch();
  });

  after(async () => {
    if (browser) await browser.close();
  });

  test('nomes das seções aparecem visíveis e corretos no desktop', async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(PAGE_URL, { waitUntil: 'load' });

    const labels = await page.$$eval('.side-rail .side-dot-label', els =>
      els.map(el => el.textContent.trim())
    );

    const expected = ['Serviços', 'Projetos', 'Depoimentos', 'Minha Jornada', 'Por que eu', 'FAQ', 'Contato'];
    assert.deepEqual(labels, expected, 'todos os 7 nomes de seção devem estar presentes na barra lateral');

    // Verifica que os textos estão visíveis (display != none, opacity > 0)
    const visibilities = await page.$$eval('.side-rail .side-dot-label', els =>
      els.map(el => {
        const style = getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && parseFloat(style.opacity || '1') > 0;
      })
    );
    assert.ok(visibilities.every(Boolean), 'todos os rótulos de texto devem estar visíveis');

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
