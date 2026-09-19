import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const PAGE_URL = pathToFileURL(resolve('index.html')).href;
const PRIVACY_URL = pathToFileURL(resolve('politica-de-privacidade.html')).href;

test('Nenhum pixel é carregado antes do aceite de cookies', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const trackers = [];
  page.on('request', (req) => {
    const url = req.url();
    if (/googletagmanager|google-analytics|connect\.facebook\.net|facebook\.com\/tr/.test(url)) {
      trackers.push(url);
    }
  });

  await page.goto(PAGE_URL);
  await page.waitForTimeout(3200);

  assert.equal(trackers.length, 0, `Nada deve ser carregado sem consentimento. Carregou: ${trackers.join(', ')}`);

  // O banner precisa aparecer e oferecer as duas saídas.
  const banner = await page.waitForSelector('.cookie-banner', { timeout: 3000 });
  assert.ok(banner, 'Banner de cookies deve aparecer na primeira visita');
  assert.ok(await page.$('.cookie-banner [data-consent="granted"]'), 'Deve ter botão de aceitar');
  assert.ok(await page.$('.cookie-banner [data-consent="denied"]'), 'Deve ter botão de recusar');

  // Recusar fecha o banner e não liga nada.
  await page.click('.cookie-banner [data-consent="denied"]');
  await page.waitForTimeout(500);
  assert.equal(await page.$('.cookie-banner'), null, 'Banner deve sumir após a escolha');
  assert.equal(trackers.length, 0, 'Recusar não pode carregar tracker');

  await page.close();
  await browser.close();
});

test('Config de analytics vazia não quebra o site e a escolha de cookies é lembrada', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const erros = [];
  page.on('pageerror', (err) => erros.push(err.message));

  await page.goto(PAGE_URL);
  await page.waitForTimeout(3200);
  await page.click('.cookie-banner [data-consent="granted"]');

  // Segunda visita: a escolha está guardada, o banner não volta.
  await page.reload();
  await page.waitForTimeout(3200);
  assert.equal(await page.$('.cookie-banner'), null, 'Banner não deve reaparecer depois do aceite');
  assert.deepEqual(erros, [], 'Nenhum erro de JavaScript com os códigos de anúncio em branco');

  await page.close();
  await browser.close();
});

test('Origem do anúncio (UTM) é capturada e vai junto na mensagem do WhatsApp', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`${PAGE_URL}?utm_source=instagram&utm_medium=cpc&utm_campaign=eventos-outubro`);

  const salvo = await page.evaluate(() => JSON.parse(sessionStorage.getItem('ps-utm') || '{}'));
  assert.equal(salvo.utm_source, 'instagram');
  assert.equal(salvo.utm_campaign, 'eventos-outubro');

  await page.fill('#field-name', 'Ana Teste');
  await page.fill('#field-contact', '71999999999');
  await page.click('#contact-form button[type="submit"]');
  await page.waitForSelector('.form-feedback--success', { timeout: 3000 });

  const href = await page.$eval('#fallback-whatsapp-link', el => el.getAttribute('href'));
  const texto = decodeURIComponent(href.split('?text=')[1]);
  assert.match(texto, /Origem: instagram · eventos-outubro/);

  await page.close();
  await browser.close();
});

test('Política de privacidade existe, é indexável e está ligada ao site', async () => {
  assert.ok(existsSync(resolve('politica-de-privacidade.html')));

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(PRIVACY_URL);

  assert.equal(await page.$('meta[name="robots"][content*="noindex"]'), null, 'A política precisa ser indexável');
  const texto = await page.textContent('body');
  assert.match(texto, /LGPD|13\.709/, 'Deve citar a base legal');
  assert.match(texto, /prisantospinheiro\.ssa@gmail\.com/, 'Deve ter canal de contato do titular');

  // Meta e Google exigem o link acessível a partir da página do anúncio.
  await page.goto(PAGE_URL);
  assert.ok(await page.$('a[href="/politica-de-privacidade.html"]'), 'Rodapé deve linkar a política');

  await page.close();
  await browser.close();
});

test('Imagem de preview do link existe e está declarada no tamanho certo', async () => {
  assert.ok(existsSync(resolve('assets/og-image.jpg')), 'og-image.jpg deve existir de verdade');

  const html = readFileSync(resolve('index.html'), 'utf-8');
  assert.match(html, /og:image" content="https:\/\/priscilasantos\.com\.br\/assets\/og-image\.jpg/);
  assert.match(html, /og:image:width" content="1200"/);
  assert.match(html, /og:image:height" content="630"/);

  const sitemap = readFileSync(resolve('sitemap.xml'), 'utf-8');
  assert.match(sitemap, /politica-de-privacidade\.html/, 'Sitemap deve listar a política');
});
test('Com os códigos preenchidos, GA4 e Pixel da Meta carregam e o lead dispara conversão', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Troca o arquivo de configuração por uma versão preenchida, sem tocar no
  // arquivo real do projeto. Tem que ser no lugar dele mesmo: o analytics-config.js
  // é carregado depois de qualquer script injetado e sobrescreveria os valores.
  await page.route('**/js/analytics-config.js', (route) => route.fulfill({
    status: 200,
    contentType: 'application/javascript',
    body: `window.PS_ANALYTICS = {
      ga4: 'G-TESTE12345',
      metaPixel: '1234567890123456',
      googleAds: 'AW-987654321',
      googleAdsLeadLabel: 'AW-987654321/TesteLabel00'
    };`
  }));

  // Responde só pelos domínios de tracker: o teste não pode bater em rede real.
  const carregados = [];
  const fakeScript = (route) => {
    carregados.push(route.request().url());
    return route.fulfill({ status: 200, contentType: 'application/javascript', body: '' });
  };
  await page.route('**://www.googletagmanager.com/**', fakeScript);
  await page.route('**://connect.facebook.net/**', fakeScript);

  await page.goto(PAGE_URL);
  await page.waitForTimeout(3200);
  await page.click('.cookie-banner [data-consent="granted"]');
  await page.waitForTimeout(800);

  assert.ok(carregados.some(u => u.includes('googletagmanager.com')), 'GA4/Google Ads deve carregar após o aceite');
  assert.ok(carregados.some(u => u.includes('connect.facebook.net')), 'Pixel da Meta deve carregar após o aceite');
  assert.ok(carregados.some(u => u.includes('id=G-TESTE12345')), 'Deve usar o ID configurado');

  // Espiona o que é enviado, já que os scripts reais foram substituídos por vazio.
  await page.evaluate(() => {
    window.__eventos = [];
    window.gtag = (...args) => window.__eventos.push(args.join(' '));
    window.fbq = (...args) => window.__eventos.push(args.join(' '));
  });

  await page.fill('#field-name', 'Ana Teste');
  await page.fill('#field-contact', '71999999999');
  await page.click('#contact-form button[type="submit"]');
  await page.waitForSelector('.form-feedback--success', { timeout: 3000 });

  const eventos = await page.evaluate(() => window.__eventos);
  assert.ok(eventos.some(e => e.startsWith('event form_start')), `form_start ausente: ${eventos.join(' | ')}`);
  assert.ok(eventos.some(e => e.startsWith('event generate_lead')), 'Deve registrar generate_lead no Google');
  assert.ok(eventos.some(e => e.startsWith('track Lead')), 'Deve registrar Lead na Meta');
  assert.ok(eventos.some(e => e.startsWith('event conversion')), 'Deve disparar a conversão do Google Ads');

  await page.close();
  await browser.close();
});
