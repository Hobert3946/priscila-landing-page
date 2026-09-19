/* ============================================================================
   form-select.js — caixa de seleção compacta do formulário.

   Substitui as fileiras de bolinhas: cada pergunta vira uma caixa fechada de
   uma linha só, que abre a lista ao clicar. Funciona em dois modos:

   - `data-mode="single"`  → escolhe uma e fecha (ex.: o assunto do contato).
   - `data-mode="multi"`   → marca várias e continua aberta; a caixa mostra
                             "Primeira opção  +2".

   O valor real vive no <input type="hidden"> de sempre, então o resto do
   formulário (js/form.js) não precisa saber que a aparência mudou.
   ========================================================================== */
(function () {
  const OPEN = 'is-open';

  function closeAll(except) {
    document.querySelectorAll('.form-select.' + OPEN).forEach(root => {
      if (root === except) return;
      root.classList.remove(OPEN);
      root.querySelector('.form-select-trigger').setAttribute('aria-expanded', 'false');
      root.querySelector('.form-select-panel').hidden = true;
    });
  }

  // Um só ouvinte pra todas as caixas: clique fora e Esc fecham o que estiver aberto.
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.form-select')) closeAll(null);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll(null);
  });

  window.PS = window.PS || {};

  window.PS.createSelect = function (root, onChange) {
    if (!root) return null;

    const multi = root.getAttribute('data-mode') === 'multi';
    const placeholder = root.getAttribute('data-placeholder') || 'Selecione';
    const trigger = root.querySelector('.form-select-trigger');
    const valueEl = root.querySelector('.form-select-value');
    const panel = root.querySelector('.form-select-panel');
    const hidden = root.querySelector('input[type="hidden"]');
    const options = Array.from(root.querySelectorAll('.form-select-option'));

    function isOn(option) {
      return option.getAttribute('aria-selected') === 'true';
    }

    function label(values) {
      if (!values.length) return placeholder;
      if (values.length === 1) return values[0];
      return `${values[0]}  +${values.length - 1}`;
    }

    function sync(last) {
      const values = options.filter(isOn).map(o => o.getAttribute('data-value'));
      hidden.value = values.join(',');
      valueEl.textContent = label(values);
      valueEl.classList.toggle('is-placeholder', values.length === 0);
      if (onChange) onChange(values, last);
    }

    function open() {
      closeAll(root);
      root.classList.add(OPEN);
      trigger.setAttribute('aria-expanded', 'true');
      panel.hidden = false;
    }

    function close() {
      root.classList.remove(OPEN);
      trigger.setAttribute('aria-expanded', 'false');
      panel.hidden = true;
    }

    function choose(option) {
      if (multi) {
        option.setAttribute('aria-selected', isOn(option) ? 'false' : 'true');
      } else {
        options.forEach(o => o.setAttribute('aria-selected', String(o === option)));
      }
      sync(option);
      if (!multi) {
        close();
        trigger.focus();
      }
    }

    trigger.addEventListener('click', () => {
      if (root.classList.contains(OPEN)) close(); else open();
    });

    options.forEach(option => {
      option.addEventListener('click', () => choose(option));
    });

    // Na múltipla escolha a lista continua aberta depois de marcar — e aberta ela
    // cobre o campo de baixo. O "Pronto" dá uma saída óbvia sem exigir que a
    // pessoa descubra que precisa clicar fora.
    if (multi) {
      const done = document.createElement('button');
      done.type = 'button';
      done.className = 'form-select-done';
      done.textContent = 'Pronto';
      done.addEventListener('click', () => { close(); trigger.focus(); });
      panel.appendChild(done);
    }

    sync(null);

    return {
      root: root,
      // Marca a opção que tiver `data-<attr>="<value>"`. Usado pelos atalhos
      // de fora do formulário, como o "Tem uma vaga?" do hero.
      chooseBy: function (attr, value) {
        const option = options.find(o => o.getAttribute('data-' + attr) === value);
        if (option) choose(option);
        return !!option;
      },
      clear: function () {
        options.forEach(o => o.setAttribute('aria-selected', 'false'));
        close();
        sync(null);
      }
    };
  };
})();
