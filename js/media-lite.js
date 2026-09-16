/*
  media-lite.js — carrega vídeos decorativos só quando valem a pena.

  O vídeo da mãozinha tem 948 KB e fica na seção de contato, lá no fim da página, mas
  com `autoplay` o navegador baixava o arquivo inteiro junto com o resto — sozinho ele
  era ~40% do peso inicial no celular. Aqui ele só ganha `src` quando chega perto da
  tela, e em conexão lenta ou com economia de dados ligada não carrega nunca (é
  decoração, `aria-hidden`: a página não perde informação nenhuma sem ele).
*/
(function () {
  PS.initLazyMedia = function () {
    var videos = document.querySelectorAll('video[data-src]');
    if (!videos.length) return;

    // Em rede fraca/economia de dados, decoração não justifica o download.
    if (PS.env.saveData || PS.env.lowEnd) return;

    var load = function (video) {
      if (video.dataset.loaded) return;
      video.dataset.loaded = '1';
      video.src = video.dataset.src;
      // play() rejeita sozinho se o navegador bloquear; sem catch vira erro no console.
      var p = video.play();
      if (p && typeof p.catch === 'function') p.catch(function () {});
    };

    if (!('IntersectionObserver' in window)) {
      // Navegador antigo: carrega direto, é melhor que não funcionar.
      videos.forEach(load);
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        load(entry.target);
        io.unobserve(entry.target);
      });
    }, { rootMargin: '200px' });

    videos.forEach(function (v) { io.observe(v); });
  };
})();
