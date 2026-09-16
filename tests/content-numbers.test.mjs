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
    return numbers.includes('+150%') && numbers.includes('10K+') && numbers.includes('158K+');
  }, null, { timeout: 6000 });

  const insightTexts = await page.$$eval('.insight-number', els => els.map(e => e.textContent.trim()));
  assert.equal(insightTexts[0], '+150%');
  assert.equal(insightTexts[1], '10K+');
  assert.equal(insightTexts[2], '158K+');

  // 3. Rola até os reels da Limpurb
  await page.locator('.case-reels').scrollIntoViewIfNeeded();

  // 4. Aguarda as views dos reels visíveis contarem até os valores esperados
  await page.waitForFunction(() => {
    const firstReel = document.querySelector('.reel-card .reel-views-count');
    return firstReel && firstReel.textContent.trim() === '2,4 mi';
  }, null, { timeout: 6000 });

  const firstReelViews = await page.$eval('.reel-card .reel-views-count', el => el.textContent.trim());
  assert.equal(firstReelViews, '2,4 mi');

  // Verifica que o ícone de play está presente no badge
  const hasPlayIcon = await page.$eval('.reel-card .reel-views-icon', el => el.textContent.trim() === '▶');
  assert.ok(hasPlayIcon, 'Ícone de play deve estar visível no badge de views');

  await page.close();
  await browser.close();
});
