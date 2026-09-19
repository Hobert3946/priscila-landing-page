/* form.js — formulário sem backend: valida na borda e abre o WhatsApp com o briefing codificado. */
(function () {
  const WHATSAPP_NUMBER = '5571988350272';

  // Cada assunto decide quais grupos de chips aparecem e o que o campo livre pede.
  const INTENTS = {
    servico:  { services: true,  goals: true,  placeholder: 'Quer detalhar um pouco mais? (Opcional)' },
    parceria: { services: true,  goals: false, placeholder: 'Conte a ideia da parceria: o que você propõe e quem participa. (Opcional)' },
    vaga:     { services: false, goals: false, placeholder: 'Conte sobre a vaga: empresa, cargo e formato (presencial, híbrido ou remoto).' },
    outro:    { services: false, goals: false, placeholder: 'Escreva sua mensagem.' }
  };

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
    const intent = document.getElementById('hidden-intent').value;
    const services = document.getElementById('hidden-services').value;
    const goals = document.getElementById('hidden-goals').value;

    let text = `*Olá, Priscila!* Meu nome é *${name}*.\n\n`;
    text += `*Meu Contato:* ${contact}\n\n`;
    if (intent) {
      text += `*Assunto:* ${intent}\n\n`;
    }

    if (services) {
      text += `*Tenho interesse em:*\n- ${services.split(',').join('\n- ')}\n\n`;
    }
    if (goals) {
      text += `*Meu principal objetivo é:*\n- ${goals.split(',').join('\n- ')}\n\n`;
    }
    if (msg) {
      text += `*Mais alguns detalhes:*\n_${msg}_\n`;
    }

    // Assinatura de origem: diz de qual anúncio/campanha essa pessoa veio.
    if (window.PS && window.PS.campaignLine) {
      text += window.PS.campaignLine();
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

    // Conversão: é aqui que o anúncio "deu certo".
    if (window.PS && window.PS.track) {
      window.PS.track('generate_lead', {
        intent: document.getElementById('hidden-intent').value,
        services: document.getElementById('hidden-services').value
      });
    }

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

    // Caixas de seleção (js/form-select.js). Os dois últimos guardam o objeto
    // retornado porque o assunto precisa poder limpá-los.
    const selects = {
      services: PS.createSelect(document.getElementById('block-services')),
      goals: PS.createSelect(document.getElementById('block-goals'))
    };

    // Assunto: escolha única. Ao trocar, esconde as caixas que não servem pro
    // assunto e limpa o que estava marcado, pra não ir seleção antiga no WhatsApp.
    const messageField = document.getElementById('field-message');

    const applyIntent = (values, option) => {
      if (!option) return;
      const config = INTENTS[option.getAttribute('data-intent')] || INTENTS.servico;

      [['services', config.services], ['goals', config.goals]].forEach(([key, visible]) => {
        const select = selects[key];
        if (!select) return;
        select.root.hidden = !visible;
        if (!visible) select.clear();
      });

      if (messageField) messageField.placeholder = config.placeholder;
    };

    const intentSelect = PS.createSelect(
      document.querySelector('[data-select="intent"]'),
      applyIntent
    );

    if (intentSelect) {
      // Só aceita nomes que existem em INTENTS: o valor pode vir da URL, então
      // nunca vai cru pra busca da opção.
      const selectIntent = (name) => {
        if (!Object.prototype.hasOwnProperty.call(INTENTS, name)) return;
        intentSelect.chooseBy('intent', name);
      };

      // Atalhos fora do formulário, como o "Tem uma vaga?" do hero.
      document.querySelectorAll('[data-form-intent]').forEach(el => {
        el.addEventListener('click', () => selectIntent(el.getAttribute('data-form-intent')));
      });

      // Link direto pra divulgar em currículo/LinkedIn: /?assunto=vaga já chega
      // com o formulário no modo certo.
      try {
        selectIntent(new URLSearchParams(window.location.search).get('assunto'));
      } catch (e) { /* URL sem query: segue no padrão */ }
    }

    const message = document.getElementById('field-message');
    const counter = document.getElementById('field-message-count');
    if (message && counter) {
      message.addEventListener('input', () => { counter.textContent = message.value.length; });
    }

    // Quem começou a preencher mas não enviou também é informação útil no painel.
    form.addEventListener('input', function onFirstInput() {
      form.removeEventListener('input', onFirstInput);
      if (window.PS && window.PS.track) window.PS.track('form_start', {});
    });

    form.querySelectorAll('input, textarea').forEach(input => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        if (input.getAttribute('aria-invalid') === 'true') validateField(input);
      });
    });

    form.addEventListener('submit', handleSubmit);
  };
})();
