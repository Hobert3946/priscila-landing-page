/* ============================================================================
   analytics-config.js — O ÚNICO arquivo que você precisa editar.

   Cole aqui os códigos das suas contas de anúncio, entre as aspas.
   Enquanto um campo estiver vazio (''), aquela ferramenta NÃO é carregada:
   o site continua leve e nada é rastreado.

   Onde achar cada código está explicado no GUIA-TRAFEGO-PAGO.md.
   ========================================================================== */
window.PS_ANALYTICS = {

  // Google Analytics 4 — formato: 'G-XXXXXXXXXX'
  // Mostra quantas pessoas visitam o site, de onde vêm e o que clicam.
  ga4: '',

  // Pixel da Meta (Instagram + Facebook) — só números, ex: '1234567890123456'
  // Mede quem veio do anúncio e virou contato.
  metaPixel: '',

  // Google Ads — formato: 'AW-123456789'
  googleAds: '',

  // Etiqueta da conversão do Google Ads — formato: 'AW-123456789/AbC-D_efGh12'
  // É o que diz ao Google "esta pessoa virou um contato".
  googleAdsLeadLabel: '',

  // Domínio do site. Usado nos links da política de privacidade.
  siteDomain: 'pscomunica.com.br'
};
