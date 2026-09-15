---
name: impeccable-landing-high-end
description: >-
  Ative esta skill quando o usuário solicitar explícitamente a versão "High-End Edition" da Impeccable Landing, focada em animações 3D interativas, Glassmorphism, Parallax e visuais ultra-cinematográficos inspirados na Apple.
---

# Impeccable Landing Skill (High-End Edition)

O usuário possui um padrão extremo de exigência para criação de Landing Pages. Abandone designs genéricos ou minimalistas simples. Sua missão é entregar uma verdadeira **Máquina de Vendas High-End** com estética cinematográfica.

## 1. Setup Técnico (Vite + React)
- **Instalação Base:** Se o usuário enviar um comando `npx create-vite`, execute em background sem questionar.
- **Ecossistema Obrigatório:** Instale sempre `tailwindcss`, `framer-motion` (fundamental para o visual "Apple"), e `lucide-react` para iconografia premium.

## 2. Design System & Estética "Impeccable"
- **Dark Mode Profundo:** Use sempre o preto absoluto (`#000000`) como base. Elementos não devem clarear para o cinza, mas sim misturar-se com neons intensos (Roxo, Esmeralda, Ciano).
- **Animações Fluidas de Fundo (Aurora/Waves):** Nunca deixe o fundo chapado. Crie camadas CSS (`.wave-layer`) com `radial-gradient`, alto nível de opacidade (`0.7` a `0.9`), `mix-blend-mode: screen` e desfoque pesado (`blur(50px)`), animando rotações assíncronas para criar uma verdadeira aurora de luz fluida no fundo escuro.
- **Glassmorphism Agressivo:** Cards sem fundo sólido. Use sempre cores translúcidas (ex: `bg-white/5` ou `bg-black/40`), forte desfoque (`backdrop-blur-xl`), bordas precisas de vidro (`border-white/10`) e brilhos sutis nas sombras.

## 3. Arsenal de Componentes High-End
Sempre considere aplicar as seguintes interações para atingir o nível "Impeccable":

- **Spotlight Cards:** Cards que rastreiam as coordenadas `x` e `y` do mouse para gerar um brilho especular por trás do conteúdo.
- **3D Tilt Image (TiltFounderCard):** Fotos estáticas são chatas. Use matrizes matemáticas do Framer Motion (`useMotionValue`, `useTransform`) para fazer a imagem inclinar em 3D conforme o mouse se move, aplicando um `useMotionTemplate` para um *glare* (luz simulada) que varre a foto (Padrão Apple).
- **Dual Marquee Progressivo:** Faixas infinitas CSS cruzando a tela com palavras soltas e ícones marcantes de diferencial.
- **FAQ de Vidro Líquido:** Accordions onde caixas de vidro deslizam fluidamente para abrir (usando `AnimatePresence`), ativando bordas de neon quando abertas.
- **CTA Buraco Negro (Black Hole):** Antes do rodapé, uma seção totalmente escura com um botão magnético central que atrai a visão, envolto por um anel pulsante (`radar-pulse` CSS).
- **Rodapé Magnético (Efeito Cortina):** O rodapé do site NUNCA rola junto com o conteúdo. Ele deve usar o `useScroll` do framer motion com `y` subindo (Parallax) e opacity crescendo, parecendo estar escondido debaixo do site até o usuário atingir o fim da tela, revelando uma tipografia colossal semi-transparente cobrindo a tela toda.

## 4. Copywriting de Conversão (Direct Response)
- Adote linguagem incisiva, sem jargões corporativos vazios.
- Fale sobre lucro, ROAS, escala, previsibilidade e retorno de investimento.
- Exemplo: "Pare de perder dinheiro com achismos. Assuma o controle do seu crescimento hoje mesmo."

## 5. Estrutura Padrão da Landing Page
1. **Hero Section:** Título agressivo, Barra de Progresso Neon grudada no topo, e **Formulário à vista imediatamente**. Imagem/3D ao lado.
2. **Dual Marquee:** Logos e provas sociais se movendo infinitamente.
3. **Resultados Matemáticos:** Cards com números grandes (+1MM, ROAS 20x).
4. **Metodologia / História:** Apoiado pelas fotos 3D interativas (Tilt).
5. **FAQ Glassmorphism:** Quebra objeções finais em blocos de vidro líquido.
6. **Black Hole CTA:** Última chamada arrebatadora antes do fim.
7. **Magnetic Footer:** A marca revelada massivamente no fundo.
