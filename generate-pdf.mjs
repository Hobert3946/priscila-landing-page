import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Apresentação de Entrega — Priscila Santos</title>
  <link rel="preconnect" href="https://api.fontshare.com" crossorigin>
  <link href="https://api.fontshare.com/v2/css?f[]=outfit@400,500,600,700,800&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #141828;
      color: #FFFBFF;
      -webkit-font-smoothing: antialiased;
      line-height: 1.5;
    }

    .page {
      width: 210mm;
      height: 297mm;
      padding: 20mm 20mm;
      position: relative;
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      background: radial-gradient(circle at 90% 10%, rgba(254, 99, 61, 0.08) 0%, transparent 60%),
                  radial-gradient(circle at 10% 90%, rgba(39, 46, 70, 0.5) 0%, transparent 60%),
                  #141828;
    }

    .page::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #FE633D, #ea4a22, #FE633D);
    }

    .page-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      font-size: 11px;
      color: #A3ADC2;
    }
    .page-footer-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .badge-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #FE633D;
    }

    /* Page 1: Capa */
    .cover-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }
    .brand-mark {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-logo-badge {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, #FE633D, #ea4a22);
      color: #fff;
      font-weight: 800;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 15px rgba(254, 99, 61, 0.35);
    }
    .brand-name {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .brand-name span {
      color: #FE633D;
    }
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 9999px;
      background: rgba(52, 211, 153, 0.12);
      border: 1px solid rgba(52, 211, 153, 0.3);
      color: #34d399;
      font-size: 12px;
      font-weight: 600;
    }
    .status-live-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10B981;
      box-shadow: 0 0 8px #10B981;
    }

    .hero-presentation {
      margin-top: 20px;
      margin-bottom: 30px;
    }
    .kicker {
      display: inline-block;
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #FE633D;
      margin-bottom: 12px;
    }
    .main-title {
      font-size: 38px;
      font-weight: 800;
      line-height: 1.15;
      letter-spacing: -0.02em;
      margin-bottom: 16px;
      color: #FFFBFF;
    }
    .main-title span {
      color: #FE633D;
    }
    .lead-text {
      font-size: 16px;
      line-height: 1.6;
      color: #A3ADC2;
      max-width: 620px;
    }

    .key-metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 30px;
    }
    .metric-card {
      background: rgba(39, 46, 70, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 20px;
      position: relative;
    }
    .metric-number {
      font-size: 28px;
      font-weight: 800;
      color: #FE633D;
      line-height: 1;
      margin-bottom: 6px;
    }
    .metric-label {
      font-size: 13px;
      font-weight: 600;
      color: #FFFBFF;
      margin-bottom: 4px;
    }
    .metric-desc {
      font-size: 11px;
      color: #A3ADC2;
      line-height: 1.4;
    }

    .overview-box {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 16px;
      padding: 20px 24px;
      margin-bottom: 20px;
    }
    .overview-box h3 {
      font-size: 16px;
      font-weight: 700;
      color: #E8DCCD;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .overview-box p {
      font-size: 13px;
      color: #A3ADC2;
      line-height: 1.6;
    }

    /* Page 2 & 3: Sections & Features */
    .page-title-area {
      margin-bottom: 24px;
    }
    .page-section-kicker {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #FE633D;
      margin-bottom: 4px;
      display: block;
    }
    .page-heading {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.01em;
      color: #FFFBFF;
    }

    .features-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      flex: 1;
    }
    .feature-card {
      background: rgba(39, 46, 70, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 18px 22px;
      display: flex;
      gap: 18px;
      align-items: flex-start;
    }
    .feature-icon-box {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: rgba(254, 99, 61, 0.12);
      border: 1px solid rgba(254, 99, 61, 0.25);
      color: #FE633D;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 20px;
    }
    .feature-content h4 {
      font-size: 16px;
      font-weight: 700;
      color: #FFFBFF;
      margin-bottom: 5px;
    }
    .feature-content p {
      font-size: 13px;
      color: #A3ADC2;
      line-height: 1.55;
      margin-bottom: 8px;
    }
    .feature-tags {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .tag {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 3px 8px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.06);
      color: #E8DCCD;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .tag.highlight {
      background: rgba(254, 99, 61, 0.15);
      color: #FE633D;
      border-color: rgba(254, 99, 61, 0.3);
    }

    /* Page 4: Hospedagem, Infra e Proposta */
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    .summary-card {
      background: rgba(39, 46, 70, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 18px;
    }
    .summary-card h4 {
      font-size: 14px;
      font-weight: 700;
      color: #FE633D;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .summary-card ul {
      list-style: none;
    }
    .summary-card ul li {
      font-size: 12px;
      color: #A3ADC2;
      line-height: 1.6;
      position: relative;
      padding-left: 14px;
      margin-bottom: 4px;
    }
    .summary-card ul li::before {
      content: "•";
      position: absolute;
      left: 0;
      color: #FE633D;
      font-weight: bold;
    }

    .checklist-box {
      background: linear-gradient(135deg, rgba(254, 99, 61, 0.08) 0%, rgba(39, 46, 70, 0.5) 100%);
      border: 1px solid rgba(254, 99, 61, 0.25);
      border-radius: 16px;
      padding: 22px;
      margin-bottom: 24px;
    }
    .checklist-title {
      font-size: 15px;
      font-weight: 700;
      color: #FFFBFF;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .checklist-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px 16px;
    }
    .check-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: #FFFBFF;
    }
    .check-icon {
      color: #34d399;
      font-weight: 800;
      font-size: 14px;
    }

    .sign-off-box {
      border: 1px dashed rgba(255, 255, 255, 0.15);
      border-radius: 14px;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255, 255, 255, 0.02);
    }
    .sign-off-info h5 {
      font-size: 13px;
      font-weight: 700;
      color: #FFFBFF;
      margin-bottom: 2px;
    }
    .sign-off-info p {
      font-size: 11px;
      color: #A3ADC2;
    }
    .sign-badge {
      padding: 6px 14px;
      border-radius: 8px;
      background: rgba(254, 99, 61, 0.15);
      border: 1px solid rgba(254, 99, 61, 0.4);
      color: #FE633D;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
  </style>
</head>
<body>

  <!-- ==================== PÁGINA 1: CAPA & VISÃO GERAL ==================== -->
  <section class="page">
    <div>
      <div class="cover-header">
        <div class="brand-mark">
          <div class="brand-logo-badge">PS</div>
          <div class="brand-name">Priscila Santos<span>.</span></div>
        </div>
        <div class="status-pill">
          <div class="status-live-dot"></div>
          Projeto Concluído & Validado
        </div>
      </div>

      <div class="hero-presentation">
        <span class="kicker">Relatório Executivo de Entrega</span>
        <h1 class="main-title">A Nova Presença Digital de <span>Alto Impacto</span></h1>
        <p class="lead-text">
          Uma landing page de padrão internacional, desenvolvida do zero para consolidar a autoridade de Priscila Santos em Comunicação Estratégica, Jornalismo e Social Media — desenhada para transformar visitantes em clientes qualificados.
        </p>
      </div>

      <div class="key-metrics-grid">
        <div class="metric-card">
          <div class="metric-number">100%</div>
          <div class="metric-label">Código Autoral</div>
          <div class="metric-desc">Sem uso de modelos prontos ou plugins pesados do WordPress/Elementor.</div>
        </div>
        <div class="metric-card">
          <div class="metric-number">Mobile</div>
          <div class="metric-label">App-Like Navigation</div>
          <div class="metric-desc">Barra inferior ergonômica permanente para navegação rápida com o polegar.</div>
        </div>
        <div class="metric-card">
          <div class="metric-number">Fast</div>
          <div class="metric-label">Performance WebP</div>
          <div class="metric-desc">Mídias compactadas de última geração e carregamento instantâneo.</div>
        </div>
      </div>

      <div class="overview-box">
        <h3>🎯 Objetivo Estratégico Concluído</h3>
        <p>
          O novo site posiciona Priscila Santos acima das agências generalistas e freelancers comuns. Com estética moderna (cores da marca Coral #FE633D e Marinho Profundo), tipografia premium Outfit do Fontshare e fluidez inspirada na Apple e NESH, cada detalhe foi calibrado para gerar confiança imediata e facilitar o contato direto via WhatsApp.
        </p>
      </div>
    </div>

    <footer class="page-footer">
      <div class="page-footer-left">
        <div class="badge-dot"></div>
        <span>Priscila Santos — Comunicação Estratégica</span>
      </div>
      <div>Página 1 de 4 • Visão Geral</div>
    </footer>
  </section>

  <!-- ==================== PÁGINA 2: DESIGN, INTERATIVIDADE E MOBILE ==================== -->
  <section class="page">
    <div>
      <div class="page-title-area">
        <span class="page-section-kicker">Pilares de Experiência</span>
        <h2 class="page-heading">Design System, Interatividade & Mobile-First</h2>
      </div>

      <div class="features-list">
        <!-- Feature 1 -->
        <div class="feature-card">
          <div class="feature-icon-box">🎨</div>
          <div class="feature-content">
            <h4>Identidade Visual & Tipografia Premium</h4>
            <p>
              Implementação da fonte <strong>Outfit</strong> (via Fontshare CDN) combinada à paleta proprietária: Coral vibrante (#FE633D), Azul Marinho Profundo (#1C2339) e toques de areia quente. A escala de texto foi ampliada cirurgicamente para garantir máxima legibilidade e sofisticação em qualquer monitor.
            </p>
            <div class="feature-tags">
              <span class="tag highlight">Fontshare Outfit</span>
              <span class="tag">Glassmorphism</span>
              <span class="tag">Design Tokens</span>
            </div>
          </div>
        </div>

        <!-- Feature 2 -->
        <div class="feature-card">
          <div class="feature-icon-box">✨</div>
          <div class="feature-content">
            <h4>Animações e Interatividade Apple-Style</h4>
            <p>
              Rolagem cinematográfica com motor <strong>Lenis Smooth Scroll</strong>, animações fluidas com <strong>GSAP & ScrollTrigger</strong>, números dos cases que realizam contagem progressiva ao entrar na tela, títulos que se revelam palavra por palavra e rotação dinâmica de frases no Hero.
            </p>
            <div class="feature-tags">
              <span class="tag highlight">GSAP 3.12</span>
              <span class="tag">ScrollTrigger</span>
              <span class="tag">Lenis Smooth</span>
              <span class="tag">Contadores Dinâmicos</span>
            </div>
          </div>
        </div>

        <!-- Feature 3 -->
        <div class="feature-card">
          <div class="feature-icon-box">📱</div>
          <div class="feature-content">
            <h4>Experiência Mobile-First com Barra de Navegação</h4>
            <p>
              Experiência idêntica à de um aplicativo nativo no celular: foi criada uma <strong>barra inferior fixa (Tabbar)</strong> com 5 atalhos imediatos (Início, Serviços, Cases, Depoimentos e Contato). No desktop, o cabeçalho fica limpo e sem poluição visual.
            </p>
            <div class="feature-tags">
              <span class="tag highlight">Mobile Tabbar Fixa</span>
              <span class="tag">Touch Drag Snap</span>
              <span class="tag">Zero Overflow</span>
            </div>
          </div>
        </div>

        <!-- Feature 4 -->
        <div class="feature-card">
          <div class="feature-icon-box">⏳</div>
          <div class="feature-content">
            <h4>Linha do Tempo Interativa da Trajetória</h4>
            <p>
              Apresentação da carreira de Priscila Santos em formato de linha do tempo horizontal que avança suavemente com o rolar da página, permitindo conhecer suas credenciais em jornalismo, rádio e comunicação pública de forma envolvente.
            </p>
            <div class="feature-tags">
              <span class="tag">Horizontal Scrub</span>
              <span class="tag">Storytelling</span>
              <span class="tag">Credenciais Oficiais</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <footer class="page-footer">
      <div class="page-footer-left">
        <div class="badge-dot"></div>
        <span>Priscila Santos — Comunicação Estratégica</span>
      </div>
      <div>Página 2 de 4 • Engenharia Frontend</div>
    </footer>
  </section>

  <!-- ==================== PÁGINA 3: CONVERSÃO, CONTEÚDO E SEO ==================== -->
  <section class="page">
    <div>
      <div class="page-title-area">
        <span class="page-section-kicker">Máquina de Resultados</span>
        <h2 class="page-heading">Conversão no WhatsApp, SEO & Performance</h2>
      </div>

      <div class="features-list">
        <!-- Feature 1 -->
        <div class="feature-card">
          <div class="feature-icon-box">💬</div>
          <div class="feature-content">
            <h4>Formulário com Conversão Direta & "Plano B"</h4>
            <p>
              O formulário permite ao prospect selecionar o tipo de projeto, nome e contato. Ao enviar, uma mensagem personalizada é montada e enviada direto ao WhatsApp de Priscila. Caso o navegador ou bloqueador trave a abertura, um botão visual de fallback (Plano B) garante que o lead nunca seja perdido.
            </p>
            <div class="feature-tags">
              <span class="tag highlight">Lead WhatsApp</span>
              <span class="tag">Validação Visual Instantânea</span>
              <span class="tag">Fallback Anti-Bloqueador</span>
            </div>
          </div>
        </div>

        <!-- Feature 2 -->
        <div class="feature-card">
          <div class="feature-icon-box">🔍</div>
          <div class="feature-content">
            <h4>SEO Técnico & Indexação para o Google</h4>
            <p>
              Inclusão de arquivo <strong>sitemap.xml</strong> e <strong>robots.txt</strong> devidamente formatados, dados estruturados <strong>JSON-LD</strong> (Schema de autoridade para pessoa e negócio) e metatags completas de OpenGraph para prévias atraentes ao compartilhar links no WhatsApp e Instagram.
            </p>
            <div class="feature-tags">
              <span class="tag highlight">Sitemap.xml</span>
              <span class="tag">Robots.txt</span>
              <span class="tag">JSON-LD Schema</span>
              <span class="tag">OpenGraph</span>
            </div>
          </div>
        </div>

        <!-- Feature 3 -->
        <div class="feature-card">
          <div class="feature-icon-box">🏆</div>
          <div class="feature-content">
            <h4>Cases Oficiais & Depoimentos Reais</h4>
            <p>
              Destaque do case principal da <strong>Limpurb</strong> com imagens oficiais dos trabalhos, comparativo de crescimento (antes e depois), métricas de alcance (+2 milhões de visualizações) e depoimentos validados de clientes parceiros (Kasa dos Cachos, Óticas Calazans, etc.).
            </p>
            <div class="feature-tags">
              <span class="tag">Portfólio Limpurb</span>
              <span class="tag">Prova Social Real</span>
              <span class="tag">Carrossel Touch</span>
            </div>
          </div>
        </div>

        <!-- Feature 4 -->
        <div class="feature-card">
          <div class="feature-icon-box">⚡</div>
          <div class="feature-content">
            <h4>Otimização Extrema de Mídia (WebP) & Página 404</h4>
            <p>
              Todas as imagens foram convertidas para WebP ultraleve, arquivos pesados obsoletos foram expurgados e foi criada uma página de erro personalizada <strong>404.html</strong> que mantém a pessoa dentro do fluxo da marca mesmo se digitar um endereço incorreto.
            </p>
            <div class="feature-tags">
              <span class="tag">Imagens WebP</span>
              <span class="tag">Página 404 Estilizada</span>
              <span class="tag">Alta Velocidade</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <footer class="page-footer">
      <div class="page-footer-left">
        <div class="badge-dot"></div>
        <span>Priscila Santos — Comunicação Estratégica</span>
      </div>
      <div>Página 3 de 4 • Conversão & SEO</div>
    </footer>
  </section>

  <!-- ==================== PÁGINA 4: INFRAESTRUTURA & PRÓXIMOS PASSOS ==================== -->
  <section class="page">
    <div>
      <div class="page-title-area">
        <span class="page-section-kicker">Lançamento & Estratégia</span>
        <h2 class="page-heading">Hospedagem, Domínio e Ativação</h2>
      </div>

      <div class="summary-grid">
        <div class="summary-card">
          <h4>🚀 Hospedagem Global na Vercel</h4>
          <ul>
            <li>Servidores em nuvem de alta velocidade (Edge Network).</li>
            <li>Certificado de segurança SSL (HTTPS) automático e gratuito.</li>
            <li>Zero custo de mensalidade de servidor para este porte de site.</li>
            <li>Deploy contínuo e atualizações instantâneas via Git.</li>
          </ul>
        </div>
        <div class="summary-card">
          <h4>🌐 Domínio Próprio (.com.br)</h4>
          <ul>
            <li>Registro oficial no Registro.br (custo de R$ 40/ano).</li>
            <li>Apontamento simples de DNS (registros A e CNAME).</li>
            <li>Transmite credibilidade corporativa imediata aos clientes.</li>
            <li>Facilita criação futura de e-mail institucional.</li>
          </ul>
        </div>
      </div>

      <div class="checklist-box">
        <div class="checklist-title">
          <span>📋 Checklist de Validação Técnica e Qualidade (QA)</span>
        </div>
        <div class="checklist-grid">
          <div class="check-item"><span class="check-icon">✓</span> Testado em Telas Mobile (360px a 430px)</div>
          <div class="check-item"><span class="check-icon">✓</span> Testado em Telas Tablet e Desktop (1440px)</div>
          <div class="check-item"><span class="check-icon">✓</span> Disparo de Mensagem WhatsApp Validado</div>
          <div class="check-item"><span class="check-icon">✓</span> Plano B de Fallback em Funcionamento</div>
          <div class="check-item"><span class="check-icon">✓</span> Zero Rolagem Horizontal Indesejada</div>
          <div class="check-item"><span class="check-icon">✓</span> Todos os 9 Testes Automatizados Aprovados</div>
          <div class="check-item"><span class="check-icon">✓</span> Robots.txt e Sitemap.xml Ativos</div>
          <div class="check-item"><span class="check-icon">✓</span> Página 404 Personalizada Integrada</div>
        </div>
      </div>

      <div class="overview-box" style="margin-bottom: 20px;">
        <h3>💎 Resumo do Valor Entregue</h3>
        <p>
          Esta plataforma não é um gasto operacional, mas sim um ativo de vendas contínuo. Ela confere autoridade para negociação de contratos com valores mais altos, funciona 24 horas por dia qualificando interessados e entrega uma experiência digital comparável à das principais referências do setor criativo nacional.
        </p>
      </div>

      <div class="sign-off-box">
        <div class="sign-off-info">
          <h5>Entrega Técnica Concluída</h5>
          <p>Pronto para publicação na Vercel e vinculação do domínio definitivo.</p>
        </div>
        <div class="sign-badge">VERSÃO 2.0 • PRONTO PARA O AR</div>
      </div>
    </div>

    <footer class="page-footer">
      <div class="page-footer-left">
        <div class="badge-dot"></div>
        <span>Priscila Santos — Comunicação Estratégica</span>
      </div>
      <div>Página 4 de 4 • Conclusão & Ativação</div>
    </footer>
  </section>

</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'apresentacao-projeto-priscila-santos.html'), htmlContent, 'utf-8');

async function generatePDF() {
  console.log('Iniciando Chromium via Playwright para gerar PDF...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const fileUrl = 'file:///' + path.join(__dirname, 'apresentacao-projeto-priscila-santos.html').replace(/\\\\/g, '/');
  console.log('Navegando para:', fileUrl);
  await page.goto(fileUrl, { waitUntil: 'networkidle' });
  
  const pdfPath = path.join(__dirname, 'apresentacao-projeto-priscila-santos.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true
  });
  
  await browser.close();
  console.log('PDF gerado com sucesso em:', pdfPath);
}

generatePDF().catch(err => {
  console.error('Erro ao gerar PDF:', err);
  process.exit(1);
});
