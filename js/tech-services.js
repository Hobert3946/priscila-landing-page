document.addEventListener('DOMContentLoaded', () => {
  const tabBtns = document.querySelectorAll('.tech-tab-btn');
  const tabPanels = document.querySelectorAll('.tech-panel-content');

  if (tabBtns.length === 0 || tabPanels.length === 0) return;

  tabBtns.forEach(btn => {
    const activateTab = () => {
      // Remover active de todos os botões e painéis
      tabBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      tabPanels.forEach(p => {
        p.classList.remove('active');
        p.setAttribute('hidden', 'true');
      });

      // Ativar o botão focado
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Mostrar o painel correspondente
      const targetId = btn.getAttribute('data-target');
      const targetPanel = document.getElementById(targetId);
      
      if (targetPanel) {
        targetPanel.removeAttribute('hidden');
        // Usar um setTimeout pequeno para permitir que o navegador processe a remoção do hidden antes da opacidade
        setTimeout(() => {
          targetPanel.classList.add('active');
        }, 10);
      }
    };

    btn.addEventListener('click', activateTab);
    btn.addEventListener('mouseenter', activateTab);
  });

  // Vídeo da Priscila apontando pras abas: só baixa/toca quando a seção entra na tela
  // (preload="none" no HTML) e pausa ao sair, pra não gastar bateria/dados à toa.
  const pointerVideo = document.getElementById('pointing-hands');
  if (pointerVideo) {
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        pointerVideo.play().catch(() => {});
      } else {
        pointerVideo.pause();
      }
    }, { threshold: 0.25 }).observe(pointerVideo);
  }
});
