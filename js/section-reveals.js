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
      scrollTrigger: { trigger: '.tech-tabs-menu', start: 'top 85%', toggleActions: 'play none none reverse' }
    });

    const activePanel = section.querySelector('.tech-panel-content.active');
    if (!activePanel) return;

    gsap.fromTo(activePanel.querySelectorAll('.tech-panel-title, .tech-panel-desc, .tech-panel-list li'),
      { y: 20, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.08,
        scrollTrigger: { trigger: '.tech-display-panel', start: 'top 82%', toggleActions: 'play none none reverse' }
      });
  };

  /* Cards alternam o lado de entrada (ímpar da esquerda, par da direita) num timeline
     só, com pequeno deslocamento entre eles -- lembra uma troca de falas, não uma lista. */
  PS.initTestimonialsReveal = function () {
    const cards = gsap.utils.toArray('.testimonial-card');
    if (!cards.length) return;

    const tl = gsap.timeline({
      scrollTrigger: { trigger: '.testimonials-section .carousel-track', start: 'top 85%', toggleActions: 'play none none reverse' }
    });
    cards.forEach((card, i) => {
      tl.fromTo(card, { x: i % 2 === 0 ? -40 : 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, i * 0.1);
    });
  };

  /* Cada pergunta dispara sozinha ao entrar na tela (o próprio ritmo do scroll já
     espaça uma da outra) e o ícone "+" nasce levemente rotacionado, como se abrisse. */
  PS.initFaqReveal = function () {
    gsap.utils.toArray('.faq-item').forEach(item => {
      const icon = item.querySelector('.faq-icon');
      const tl = gsap.timeline({
        scrollTrigger: { trigger: item, start: 'top 90%', toggleActions: 'play none none reverse' }
      });
      tl.fromTo(item, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' });
      if (icon) {
        tl.fromTo(icon, { rotate: -45, opacity: 0 }, { rotate: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.6)' }, '-=0.45');
      }
    });
  };

  /* Contato: os 2 cartões de canal "materializam" com leve scale-in -- convidativo,
     sem ser chamativo. O formulário em si recebe o mínimo de movimento de propósito
     (fade + 10px, sem stagger por campo): é onde a pessoa vai digitar, não onde
     queremos prender o olhar. */
  PS.initContactReveal = function () {
    gsap.fromTo('.contact-channels .contact-card', { scale: 0.92, opacity: 0 }, {
      scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.7)', stagger: 0.12,
      scrollTrigger: { trigger: '.contact-channels', start: 'top 88%', toggleActions: 'play none none reverse' }
    });

    gsap.fromTo('.contact-box .form-divider, .contact-box .contact-form', { y: 10, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.5, ease: 'power1.out',
      scrollTrigger: { trigger: '.contact-form', start: 'top 92%', toggleActions: 'play none none reverse' }
    });
  };
})();
