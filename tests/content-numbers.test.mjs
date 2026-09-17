import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const PAGE_URL = pathToFileURL(resolve('index.html')).href;

test('números na seção Conteúdo com Intenção sobem continuamente e atingem os valores corretos', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(PAGE_URL);

  // 1. Rola até a seção "Conteúdo com Intenção" (insights)
  await page.locator('.insights-data-grid').scrollIntoViewIfNeeded();

  // 2. Aguarda os contadores dos insights subirem e atingirem os valores
  await page.waitForFunction(() => {
    const numbers = Array.from(document.querySelectorAll('.insight-number')).map(el => el.textContent.trim());
    return numbers.includes('3M+') && numbers.includes('500K+') && numbers.includes('2.4M+');
  }, null, { timeout: 6000 });

  const insightTexts = await page.$$eval('.insight-number', els => els.map(e => e.textContent.trim()));
  assert.equal(insightTexts[0], '3M+');
  assert.equal(insightTexts[1], '500K+');
  assert.equal(insightTexts[2], '2.4M+');

  // 3. Rola até os reels da Limpurb
  await page.locator('.case-reels').scrollIntoViewIfNeeded();

  // 4. Verifica que as imagens dos reels estão presentes e sem sobreposição de contadores
  const reelCards = await page.$$('.reel-card');
  assert.ok(reelCards.length >= 1, 'Deve haver ao menos 1 card de reel');
  const reelViews = await page.$$('.reel-card .reel-views-count');
  assert.equal(reelViews.length, 0, 'Reels não devem ter contadores de visualização sobrepostos');

  await page.close();
  await browser.close();
});
