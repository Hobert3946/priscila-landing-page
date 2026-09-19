/* ============================================================================
   consent.js — aviso de cookies (LGPD).

   Regra da casa: nenhuma ferramenta de medição é carregada antes do aceite.
   Quem recusa navega no site inteiro normalmente, só não é medido.
   A escolha fica guardada no próprio navegador da pessoa por 6 meses.
   ========================================================================== */
(function () {
  const KEY = 'ps-consent';
  const MAX_AGE_DAYS = 180;

  function readChoice() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!saved || !saved.at) return null;

      const ageDays = (Date.now() - saved.at) / 86400000;
      return ageDays > MAX_AGE_DAYS ? null : saved.choice;
    } catch (e) { return null; }
  }

  function saveChoice(choice) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ choice: choice, at: Date.now() }));
    } catch (e) { /* modo anônimo: vale só nesta visita */ }
  }

  function decide(choice, banner) {
    saveChoice(choice);
    if (choice === 'granted' && window.PS && window.PS.startAnalytics) {
      window.PS.startAnalytics();
    }
    if (banner) banner.remove();
  }

  function buildBanner() {
    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Aviso de cookies');
    banner.innerHTML = `
      <p class="cookie-banner-text">
        Uso cookies para entender como as pessoas chegam até aqui e melhorar o site.
        Você decide. <a href="/politica-de-privacidade.html">Ver política de privacidade</a>.
      </p>
      <div class="cookie-banner-actions">
        <button type="button" class="cookie-btn cookie-btn--ghost" data-consent="denied">Agora não</button>
        <button type="button" class="cookie-btn cookie-btn--accept" data-consent="granted">Aceitar</button>
      </div>
    `;
    banner.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-consent]');
      if (btn) decide(btn.getAttribute('data-consent'), banner);
    });
    return banner;
  }

  window.PS = window.PS || {};
  window.PS.initConsent = function () {
    const choice = readChoice();

    if (choice === 'granted') {
      if (window.PS.startAnalytics) window.PS.startAnalytics();
      return;
    }
    if (choice === 'denied') return;

    // Espera o preloader sair de cena antes de mostrar a barra.
    setTimeout(() => document.body.appendChild(buildBanner()), 2600);
  };
})();
