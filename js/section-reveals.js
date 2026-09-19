/*
  section-reveals.js — entrada ao rolar para as seções que ainda não tinham: O Que Você
  Recebe, Depoimentos, FAQ e Contato. Cada uma com uma assinatura de movimento diferente
  pra não repetir o mesmo fade-up em tudo (ver initScrollReveals em text-effects.js).
*/
(function () {
  /* Abas deslizam da esquerda (mesma linguagem da timeline); o painel ativo entra em
     cascata (título → texto → itens) só na primeira vez que a seção aparece — a troca
     de aba já tem sua própria transição em CSS (sections.css .tech-panel-content). */
  PS.initTechServicesReveal = function () {
    const section = document.querySelector('.tech-services-section');
    if (!section) return;

    gsap.fromTo(section.querySelectorAll('.tech-tab-btn'), { x: -24, opacity: 0 }, {
      x: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.08,
      scrollTrigger: { trigger: '.tech-tabs-menu', start: 'top 74%', toggleActions: 'play none none reverse' }
    });

    const activePanel = section.querySelector('.tech-panel-content.active');
    if (!activePanel) return;

    gsap.fromTo(activePanel.querySelectorAll('.tech-panel-title, .tech-panel-desc, .tech-panel-list li'),
      { y: 20, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.08,
        scrollTrigger: { trigger: '.tech-display-panel', start: 'top 72%', toggleActions: 'play none none reverse' }
      });
  };

  /* Cada pergunta dispara sozinha ao entrar na tela (o próprio ritmo do scroll já
     espaça uma da outra) e o ícone "+" nasce levemente rotacionado, como se abrisse. */
  PS.initFaqReveal = function () {
    gsap.utils.toArray('.faq-item').forEach(item => {
      const icon = item.querySelector('.faq-icon');
      const tl = gsap.timeline({
        scrollTrigger: { trigger: item, start: 'top 78%', toggleActions: 'play none none reverse' }
      });
      tl.fromTo(item, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' });
      if (icon) {
        tl.fromTo(icon, { rotate: -45, opacity: 0 }, { rotate: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.6)' }, '-=0.45');
      }
    });
  };

  /* Contato: os campos de contato e os cartões de canal devem sempre
     aparecer e permanecer visíveis (sem opacity: 0 inicial e sem depender de
     rolar até o fim da página). A mão decorativa mantém sua entrada sutil. */
  PS.initContactReveal = function () {
    // Mão apontando "chega" um instante antes do título, puxando o olhar pra frase final.
    const hand = document.querySelector('.tech-pointing-hand--contact');
    if (hand) {
      gsap.fromTo(hand, { y: -16, opacity: 0, rotate: -8 }, {
        y: 0, opacity: 1, rotate: 0, duration: 0.6, ease: 'back.out(1.6)',
        scrollTrigger: { trigger: '.contact-header', start: 'top 74%', toggleActions: 'play none none reverse' }
      });
    }
  };
})();
