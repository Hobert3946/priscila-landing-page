---
name: verify-visual
description: Run this site's automated test suite and/or a local Playwright visual check. Use ONLY when the user explicitly asks to test/verify/check something — never automatically after making edits. The user tests visually herself and finds automatic verification a waste of her time.
---

# Verificar o site da Priscila

**Regra nº 1: não use esta skill por conta própria.** Depois de editar HTML/CSS/JS neste
projeto, **entregue a mudança direto, sem rodar nada antes**. A usuária testa visualmente
ela mesma e já pediu explicitamente para eu parar de gastar o tempo dela com verificações
automáticas. Só rode algo daqui se ela disser algo como "testa isso", "roda os testes",
"confere se quebrou" — aí sim siga os passos abaixo, do mais rápido pro mais lento.

## 1. Suíte de regressão existente (rápido, sempre a primeira opção)

Já existe uma suíte Playwright pronta em `tests/layout.test.mjs` (Node test runner nativo,
`node_modules/playwright` já instalado localmente — não precisa `npm install` nem baixar
browser de novo). Cobre overflow horizontal, quebra de linha em títulos, carrosséis,
trajetória, hero, formulário, menu mobile, preloader, cards de vidro, contador etc.

```bash
npm test
```

Isso é tudo que normalmente é preciso. Leia a saída e reporte só o que falhou.

## 2. Checagem visual pontual (só se pedirem algo que a suíte não cobre)

Para ver como uma seção específica renderiza (ex.: um novo componente, um recorte de
imagem, um layout mobile) sem escrever um teste formal:

```bash
python3 -m http.server 8791 >/tmp/server.log 2>&1 &
```

Depois, um script Node solto (Playwright já está em `node_modules`, então rode a partir
da raiz do projeto para resolver o import sem instalar nada nem criar `package.json` novo):

```js
// escreva em algo como _tmp_check.mjs na raiz do projeto, rode com `node _tmp_check.mjs`
import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:8791/index.html', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000); // preloader + reveals no GSAP levam ~2-2.5s
await page.locator('#alguma-secao').screenshot({ path: 'C:/Users/HOBERT~1.SAN/AppData/Local/Temp/check.png' });
await browser.close();
```

Notas que já custaram tempo nesta sessão:
- **Nunca crie `package.json`/`node_modules` fora da raiz do projeto** (ex. num diretório
  temporário) — rode sempre a partir da raiz, o Playwright já está instalado ali.
- **Espere pelo menos ~2s após `waitForTimeout`** antes de tirar screenshot: o preloader e
  as animações de entrada do GSAP escondem conteúdo por até ~2,5s; capturar antes disso dá
  falso-positivo de "elemento sumiu/vazio".
- **`element.screenshot()` em elemento mais alto que a viewport duplica elementos
  `position:fixed`/`sticky`** (o header aparece 2x, sobreposto) — isso é artefato da
  captura, não bug real. Para seções longas, prefira `page.screenshot({fullPage:true})` e
  corte com PIL depois, ou várias screenshots menores do viewport.
- O site usa **Lenis** (scroll suave) com wheel handler próprio — qualquer elemento com seu
  próprio scroll horizontal (carrosséis) precisa que o Lenis seja pausado
  (`PS.lenis.stop()`/`start()` no hover) ou o gesto de rolar briga com o scroll da página.
- **Sempre limpe depois**: apague o script `_tmp_*.mjs`, mate o `http.server`
  (`pkill -f "http.server 8791"`) e apague screenshots temporários do Temp.

## Contexto do projeto

- Dois agentes trabalham neste repo (Antigravity + Claude Code), coordenados por
  `.agent-handoff.md` na raiz — vale ler esse arquivo para saber o que mudou por fora antes
  de mexer em algo que parece inconsistente com o que você lembra.
- `about.css` existe mas talvez ainda não esteja linkado no `<head>` do `index.html` —
  confirme antes de assumir que estilos de lá estão ativos.
