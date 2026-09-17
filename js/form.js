/* form.js — formulário sem backend: valida na borda e abre o WhatsApp com o briefing codificado. */
(function () {
  const WHATSAPP_NUMBER = '5571988350272';

  const FIELD_RULES = {
    'field-name': {
      validate: (v) => v.length >= 2,
      message: 'Informe seu nome ou marca (mínimo 2 caracteres).'
    },
    'field-contact': {
      // aceita e-mail OU telefone com 10+ dígitos
      validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || (v.replace(/\D/g, '').length >= 10),
      message: 'Informe um e-mail válido ou telefone com DDD.'
    }
  };

  function validateField(input) {
    const rule = FIELD_RULES[input.id];
    if (!rule) return true;

    const valid = rule.validate(input.value.trim());
    const errorEl = document.querySelector(`[data-error-for="${input.id}"]`);

    input.setAttribute('aria-invalid', String(!valid));
    if (errorEl) {
      errorEl.textContent = valid ? '' : rule.message;
      errorEl.style.display = valid ? 'none' : 'block';
    }
    return valid;
  }

  function buildMessage() {
    const name = document.getElementById('field-name').value.trim();
    const contact = document.getElementById('field-contact').value.trim();
    const msg = document.getElementById('field-message').value.trim();
    const services = document.getElementById('hidden-services').value;
    const goals = document.getElementById('hidden-goals').value;
    
    let text = `*Olá, Priscila!* Meu nome é *${name}*.\n\n`;
    text += `*Meu Contato:* ${contact}\n\n`;
    
    if (services) {
      text += `*Tenho interesse em:*\n- ${services.split(',').join('\n- ')}\n\n`;
    }
    if (goals) {
      text += `*Meu principal objetivo é:*\n- ${goals.split(',').join('\n- ')}\n\n`;
    }
    if (msg) {
      text += `*Mais alguns detalhes:*\n_${msg}_\n`;
    }
    
    return text;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const status = document.getElementById('form-status');
    const fields = Object.keys(FIELD_RULES).map(id => document.getElementById(id)).filter(Boolean);
    
    // valida TODOS os campos
    const results = fields.map(validateField);
    const firstInvalid = fields[results.indexOf(false)];

    if (firstInvalid) {
      if (status) {
        status.innerHTML = `
          <div class="form-feedback form-feedback--error" role="alert">
            <div class="form-feedback-title">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>Por favor, revise os campos destacados</span>
            </div>
            <p class="form-feedback-desc">Preencha seu nome e contato com WhatsApp ou e-mail para gerar o briefing.</p>
          </div>
        `;
      }
      firstInvalid.focus();
      return;
    }

    const messageText = buildMessage();
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(messageText)}`;

    if (status) {
      status.innerHTML = `
        <div class="form-feedback form-feedback--success" role="status">
          <div class="form-feedback-title">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <span>Briefing enviado com sucesso!</span>
          </div>
          <p class="form-feedback-desc">Seu briefing foi gerado. Estamos abrindo o WhatsApp da Priscila com o texto pronto para envio.</p>
          <div class="form-fallback-box">
            <p class="form-fallback-label">O WhatsApp não abriu? Bloqueador de pop-up ativo?</p>
            <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="form-fallback-btn" id="fallback-whatsapp-link">
              <span>Abrir conversa no WhatsApp</span>
              <span class="btn-arrow" aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      `;
    }

    // Tenta abrir o WhatsApp na nova aba
    try {
      const openedWindow = window.open(waUrl, '_blank', 'noopener');
      if (!openedWindow || openedWindow.closed || typeof openedWindow.closed === 'undefined') {
        const fallbackBtn = document.getElementById('fallback-whatsapp-link');
        if (fallbackBtn) fallbackBtn.focus();
      }
    } catch (err) {
      console.warn('Bloqueador impediu window.open:', err);
      const fallbackBtn = document.getElementById('fallback-whatsapp-link');
      if (fallbackBtn) fallbackBtn.focus();
    }
  }

  window.PS = window.PS || {};
  window.PS.initContactForm = function () {
    const form = document.getElementById('contact-form');
    if (!form) return;

    // Configuração dos Chips
    const setupChips = (containerId, hiddenId) => {
      const container = document.getElementById(containerId);
      const hiddenInput = document.getElementById(hiddenId);
      if (!container || !hiddenInput) return;
      
      const chips = container.querySelectorAll('.form-chip');
      chips.forEach(chip => {
        chip.addEventListener('click', () => {
          chip.classList.toggle('active');
          const activeValues = Array.from(container.querySelectorAll('.form-chip.active'))
                                    .map(c => c.getAttribute('data-value'));
          hiddenInput.value = activeValues.join(',');
        });
      });
    };

    setupChips('services-chips', 'hidden-services');
    setupChips('goals-chips', 'hidden-goals');

    const message = document.getElementById('field-message');
    const counter = document.getElementById('field-message-count');
    if (message && counter) {
      message.addEventListener('input', () => { counter.textContent = message.value.length; });
    }

    form.querySelectorAll('input, textarea').forEach(input => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        if (input.getAttribute('aria-invalid') === 'true') validateField(input);
      });
    });

    form.addEventListener('submit', handleSubmit);
  };
})();
