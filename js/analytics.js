/* ============================================================================
   analytics.js — medição de tráfego pago.

   Três responsabilidades, nessa ordem:
   1. Guardar de qual anúncio a visita veio (UTM), pra colar na mensagem do WhatsApp.
   2. Carregar GA4 / Pixel da Meta / Google Ads — só depois do aceite de cookies
      e só se o código estiver preenchido no analytics-config.js.
   3. Avisar essas ferramentas quando algo importante acontece (clique no
      WhatsApp, envio do formulário, rolagem da página).

   Nada aqui roda sozinho antes do consentimento: o js/consent.js chama
   PS.startAnalytics() quando a pessoa aceita.
   ========================================================================== */
(function () {
  const CFG = window.PS_ANALYTICS || {};
  const UTM_KEY = 'ps-utm';
  const UTM_FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid'];

  let started = false;

  /* --- 1. Origem da visita ------------------------------------------------ */

  // Guarda a origem na primeira página vista e não sobrescreve depois: se a
  // pessoa voltar pelo Instagram orgânico, o crédito continua com o anúncio
  // que a trouxe primeiro nesta sessão.
  function captureCampaign() {
    try {
      if (sessionStorage.getItem(UTM_KEY)) return;

      const params = new URLSearchParams(window.location.search);
      const found = {};
      UTM_FIELDS.forEach(field => {
        const value = params.get(field);
        if (value) found[field] = value.slice(0, 120);
      });

      if (!Object.keys(found).length && document.referrer) {
        found.referrer = document.referrer.slice(0, 120);
      }
      if (Object.keys(found).length) sessionStorage.setItem(UTM_KEY, JSON.stringify(found));
    } catch (e) { /* navegador sem storage: seguimos sem atribuição */ }
  }

  function getCampaign() {
    try {
      return JSON.parse(sessionStorage.getItem(UTM_KEY) || '{}');
    } catch (e) { return {}; }
  }

  // Vira uma linha legível no fim da mensagem do WhatsApp.
  function campaignLine() {
    const data = getCampaign();
    const source = data.utm_source || (data.gclid ? 'google' : '') || (data.fbclid ? 'meta' : '');
    if (!source) return '';

    const parts = [source];
    if (data.utm_campaign) parts.push(data.utm_campaign);
    if (data.utm_content) parts.push(data.utm_content);
    return `\n_Origem: ${parts.join(' · ')}_`;
  }

  /* --- 2. Carregamento das ferramentas ------------------------------------ */

  function loadScript(src) {
    const el = document.createElement('script');
    el.async = true;
    el.src = src;
    document.head.appendChild(el);
  }

  function startGoogle() {
    const ids = [CFG.ga4, CFG.googleAds].filter(Boolean);
    if (!ids.length) return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    ids.forEach(id => window.gtag('config', id));
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${ids[0]}`);
  }

  function startMeta() {
    if (!CFG.metaPixel) return;

    /* eslint-disable */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */

    window.fbq('init', CFG.metaPixel);
    window.fbq('track', 'PageView');
  }

  /* --- 3. Eventos --------------------------------------------------------- */

  // Nomes do lado do Google; o mapa traduz pro vocabulário da Meta.
  const META_EVENTS = {
    generate_lead: 'Lead',
    contact_click: 'Contact',
    form_start: 'InitiateCheckout'
  };

  function track(name, params) {
    const payload = params || {};
    if (window.gtag) window.gtag('event', name, payload);
    if (window.fbq && META_EVENTS[name]) window.fbq('track', META_EVENTS[name], payload);

    // Conversão do Google Ads: só no lead, e só se a etiqueta estiver preenchida.
    if (name === 'generate_lead' && window.gtag && CFG.googleAdsLeadLabel) {
      window.gtag('event', 'conversion', { send_to: CFG.googleAdsLeadLabel });
    }
  }

  function trackContactClicks() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;

      const href = link.getAttribute('href') || '';
      let channel = '';
      if (href.includes('wa.me')) channel = 'whatsapp';
      else if (href.startsWith('mailto:')) channel = 'email';
      else if (href.includes('instagram.com')) channel = 'instagram';
      else if (href.includes('linkedin.com')) channel = 'linkedin';

      if (channel) track('contact_click', { channel: channel });
    }, { passive: true });
  }

  function trackScrollDepth() {
    const marks = [25, 50, 75, 100];
    let reached = 0;

    window.addEventListener('scroll', () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;

      const percent = (window.scrollY / scrollable) * 100;
      const mark = marks.filter(m => percent >= m).pop();
      if (mark && mark > reached) {
        reached = mark;
        track('scroll_depth', { percent: mark });
      }
    }, { passive: true });
  }

  /* --- Ligação ------------------------------------------------------------ */

  window.PS = window.PS || {};
  window.PS.track = track;
  window.PS.getCampaign = getCampaign;
  window.PS.campaignLine = campaignLine;

  window.PS.startAnalytics = function () {
    if (started) return;
    started = true;
    startGoogle();
    startMeta();
  };

  captureCampaign();
  trackContactClicks();
  trackScrollDepth();
})();
