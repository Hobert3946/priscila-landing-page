/* form.js — formulário sem backend: valida na borda e abre o WhatsApp com o briefing codificado. */
(function () {
  const WHATSAPP_NUMBER = '5571988350272';

  const FIELD_RULES = {
    'field-name': {
      validate: (v) => v.length >= 2,
      message: 'Informe seu nome (mínimo 2 caracteres).'
    },
    'field-contact': {
      // aceita e-mail OU telefone com 10+ dígitos
      validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || (v.replace(/\D/g, '').length >= 10),
      message: 'Informe um e-mail válido ou um telefone com DDD.'
    }
  };

  function validateField(input) {
    const rule = FIELD_RULES[input.id];
    if (!rule) return true;

    const valid = rule.validate(input.value.trim());
    const errorEl = document.querySelector(`[data-error-for="${input.id}"]`);

    input.setAttribute('aria-invalid', String(!valid));
    if (errorEl) errorEl.textContent = valid ? '' : rule.message;
    return valid;
  }

  function buildMessage() {
    const name = document.getElementById('field-name').value.trim();
    const contact = document.getElementById('field-contact').value.trim();
    const msg = document.getElementById('field-message').value.trim();
    const services = document.getElementById('hidden-services').value;
    const goals = document.getElementById('hidden-goals').value;
    
    let text = `Olá, Priscila! Sou ${name}.\nContato: ${contact}\n`;
    
    if (services) {
      text += `\nPreciso de:\n- ${services.split(',').join('\n- ')}\n`;
    }
    if (goals) {
      text += `\nMeu objetivo é:\n- ${goals.split(',').join('\n- ')}\n`;
    }
    if (msg) {
      text += `\nDetalhes adicionais:\n${msg}`;
    }
    
    return text;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const status = document.getElementById('form-status');
    const fields = Object.keys(FIELD_RULES).map(id => document.getElementById(id));
    
    // valida TODOS os campos (find() pararia no primeiro inválido e não marcaria os demais)
    const results = fields.map(validateField);
    const firstInvalid = fields[results.indexOf(false)];

    if (firstInvalid) {
      status.textContent = 'Revise os campos destacados antes de enviar.';
      status.classList.remove('is-success');
      firstInvalid.focus();
      return;
    }

    status.textContent = 'Abrindo o WhatsApp com seu briefing...';
    status.classList.add('is-success');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildMessage())}`, '_blank', 'noopener');
  }

  PS.initContactForm = function () {
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
