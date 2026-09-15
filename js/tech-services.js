document.addEventListener('DOMContentLoaded', () => {
  const tabBtns = document.querySelectorAll('.tech-tab-btn');
  const tabPanels = document.querySelectorAll('.tech-panel-content');

  if (tabBtns.length === 0 || tabPanels.length === 0) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remover active de todos os botões e painéis
      tabBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      tabPanels.forEach(p => {
        p.classList.remove('active');
        p.setAttribute('hidden', 'true');
      });

      // Ativar o botão clicado
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
    });
  });
});
