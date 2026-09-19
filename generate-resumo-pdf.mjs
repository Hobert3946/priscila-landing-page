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
  <title>Resumo de Entregas — Priscila Santos</title>
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
      line-height: 1.45;
    }

    .page {
      width: 210mm;
      height: 297mm;
      padding: 16mm 18mm 14mm;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      background: radial-gradient(circle at 90% 10%, rgba(254, 99, 61, 0.09) 0%, transparent 55%),
                  radial-gradient(circle at 10% 90%, rgba(39, 46, 70, 0.45) 0%, transparent 55%),
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

    /* Cabeçalho */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      margin-bottom: 16px;
    }
    .brand-mark {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-logo-badge {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: linear-gradient(135deg, #FE633D, #ea4a22);
      color: #fff;
      font-weight: 800;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(254, 99, 61, 0.35);
    }
    .brand-name {
      font-size: 16px;
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
      padding: 5px 12px;
      border-radius: 9999px;
      background: rgba(52, 211, 153, 0.12);
      border: 1px solid rgba(52, 211, 153, 0.3);
      color: #34d399;
      font-size: 11px;
      font-weight: 600;
    }
    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10B981;
      box-shadow: 0 0 8px #10B981;
    }

    /* Título principal */
    .title-area {
      margin-bottom: 16px;
    }
    .kicker {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #FE633D;
      margin-bottom: 4px;
      display: block;
    }
    .main-title {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.01em;
      color: #FFFBFF;
      line-height: 1.2;
    }
    .main-title span {
      color: #FE633D;
    }
    .lead-text {
      font-size: 12.5px;
      color: #A3ADC2;
      margin-top: 4px;
      line-height: 1.5;
    }

    /* Seções de entrega */
    .cards-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .delivery-card {
      background: rgba(39, 46, 70, 0.42);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 14px 16px;
      position: relative;
    }

    .delivery-card-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .delivery-card-title {
      display: flex;
      align-items: center;
      gap: 9px;
      font-size: 14.5px;
      font-weight: 700;
      color: #FFFBFF;
    }
    .delivery-icon {
      width: 26px;
      height: 26px;
      border-radius: 7px;
      background: rgba(254, 99, 61, 0.15);
      border: 1px solid rgba(254, 99, 61, 0.3);
      color: #FE633D;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
    }
    .badge-tag {
      font-size: 10px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      background: rgba(254, 99, 61, 0.12);
      color: #FE633D;
      border: 1px solid rgba(254, 99, 61, 0.25);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .items-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 8px;
    }

    .item-point {
      background: rgba(20, 24, 40, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 7px 10px;
      font-size: 11.5px;
      color: #C3CDDE;
      line-height: 1.4;
    }
    .item-point strong {
      color: #FFFBFF;
      display: block;
      font-size: 11.5px;
      margin-bottom: 2px;
    }

    /* Quote Box do Professor */
    .quote-box {
      margin-top: 8px;
      padding: 8px 12px;
      border-left: 3px solid #FE633D;
      background: rgba(254, 99, 61, 0.06);
      border-radius: 0 8px 8px 0;
      font-size: 11px;
      font-style: italic;
      color: #E2E8F0;
      line-height: 1.45;
    }
    .quote-author {
      margin-top: 4px;
      font-style: normal;
      font-size: 10.5px;
      font-weight: 600;
      color: #FE633D;
    }

    /* Grid inferior: Verificação e Rodapé */
    .bottom-section {
      display: grid;
      grid-template-columns: 1.6fr 1fr;
      gap: 12px;
      margin-top: 12px;
    }

    .qa-box {
      background: rgba(20, 24, 40, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 10px;
      padding: 10px 14px;
    }
    .qa-title {
      font-size: 11.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #FE633D;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .qa-list {
      list-style: none;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px 10px;
      font-size: 10.5px;
      color: #A3ADC2;
    }
    .qa-list li {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .check-green {
      color: #34d399;
      font-weight: 800;
    }

    .sign-box {
      background: linear-gradient(135deg, rgba(254, 99, 61, 0.12), rgba(39, 46, 70, 0.4));
      border: 1px solid rgba(254, 99, 61, 0.3);
      border-radius: 10px;
      padding: 10px 14px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .sign-badge {
      font-size: 10px;
      font-weight: 800;
      color: #FE633D;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }
    .sign-text {
      font-size: 11px;
      color: #FFFBFF;
      line-height: 1.35;
    }

    /* Footer da página */
    .page-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 10px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 10px;
      color: #8C96AB;
      margin-top: 12px;
    }
    .page-footer-left {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .badge-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #FE633D;
    }
  </style>
</head>
<body>

  <div class="page">
    <div>
      <!-- Topo / Identificação -->
      <header class="header">
        <div class="brand-mark">
          <div class="brand-logo-badge">PS</div>
          <div class="brand-name">Priscila Santos<span>.</span></div>
        </div>
        <div class="status-pill">
          <div class="status-dot"></div>
          Publicado na Vercel & Sincronizado no Git
        </div>
      </header>

      <!-- Título do Documento -->
      <div class="title-area">
        <span class="kicker">Relatório Resumido de Entregas</span>
        <h1 class="main-title">Implementação: <span>Oportunidades</span> & <span>Recomendação UFBA</span></h1>
        <p class="lead-text">
          Documento síntese confirmando a implementação das solicitações estratégicas da cliente: abertura do site para recrutadores/vagas e a carta de recomendação de autoridade do Prof. Cláudio Cardoso.
        </p>
      </div>

      <!-- Blocos de Entrega -->
      <div class="cards-container">

        <!-- Card 1: Vagas / Oportunidades -->
        <div class="delivery-card">
          <div class="delivery-card-head">
            <div class="delivery-card-title">
              <div class="delivery-icon">💼</div>
              <span>1. Módulo de Oportunidades Profissionais & Recrutadores</span>
            </div>
            <span class="badge-tag">Implementado</span>
          </div>

          <div class="items-grid">
            <div class="item-point">
              <strong>Hero com Duplo Posicionamento</strong>
              Selo atualizado para <em>"Disponível para projetos e oportunidades"</em> com o atalho exclusivo <strong>"Tem uma vaga? →"</strong>.
            </div>
            <div class="item-point">
              <strong>Formulário Inteligente & Condicional</strong>
              Pergunta inicial <em>"Como posso falar com você?"</em>. Ao escolher vaga, esconde perguntas de serviços e vai direto ao ponto.
            </div>
            <div class="item-point">
              <strong>Roteamento Direto para o WhatsApp</strong>
              A mensagem já viaja categorizada com <code>*Assunto:* Tenho uma oportunidade profissional</code> para identificação imediata.
            </div>
            <div class="item-point">
              <strong>Deep Link para Currículo e LinkedIn</strong>
              O link <code>priscilasantos.com.br/?assunto=vaga</code> abre o site com o formulário já configurado para contratação de equipes.
            </div>
          </div>
        </div>

        <!-- Card 2: Professor Cláudio Cardoso -->
        <div class="delivery-card">
          <div class="delivery-card-head">
            <div class="delivery-card-title">
              <div class="delivery-icon">🎓</div>
              <span>2. Carta de Recomendação do Prof. Cláudio Cardoso (UFBA)</span>
            </div>
            <span class="badge-tag">Chancela Institucional</span>
          </div>

          <div class="items-grid">
            <div class="item-point">
              <strong>Posicionamento de Prestígio</strong>
              Inserido com design editorial entre a seção "Minha Jornada" e o comparativo com agências, formato carta (não mero depoimento).
            </div>
            <div class="item-point">
              <strong>Credenciais de Alto Nível</strong>
              Foto oficial e biografia: Prof. Titular da UFBA, Pós-doutor pela USP, Consultor de Bradesco/Neoenergia/CNI e Personalidade ABERJE.
            </div>
          </div>

          <div class="quote-box">
            "Acompanhei a trajetória de Priscila Santos desde os tempos de faculdade... dedicação em método e ambição em rigor profissional. Na Limpurb produziu resultados de reconhecimento nacional... Recomendo seu trabalho de olhos fechados."
            <div class="quote-author">— Prof. Cláudio Cardoso (UFBA)</div>
          </div>
        </div>

        <!-- Card 3: Visibilidade Permanente dos Contatos -->
        <div class="delivery-card">
          <div class="delivery-card-head">
            <div class="delivery-card-title">
              <div class="delivery-icon">⚡</div>
              <span>3. Campos de Contato com Visibilidade Permanente</span>
            </div>
            <span class="badge-tag">UX & Conversão</span>
          </div>
          <div class="item-point" style="margin-top: 0;">
            <strong>Acesso Imediato em Qualquer Rolagem</strong>
            Eliminada qualquer barreira de animação (opacity: 0). Todos os campos do formulário e cartões de contato (WhatsApp, E-mail, Instagram) permanecem sempre visíveis e interativos, mesmo que a pessoa não role até o fim absoluto da página.
          </div>
        </div>

      </div>

      <!-- Rodapé Técnico & QA -->
      <div class="bottom-section">
        <div class="qa-box">
          <div class="qa-title">
            <span>✓</span> Validação Técnica & Garantia de Qualidade
          </div>
          <ul class="qa-list">
            <li><span class="check-green">✓</span> 14 Testes Automatizados 100% OK</li>
            <li><span class="check-green">✓</span> Mobile Tabbar Fixa sem Cortes</li>
            <li><span class="check-green">✓</span> Formulário Condicional Validado</li>
            <li><span class="check-green">✓</span> Plano B de Fallback no WhatsApp</li>
            <li><span class="check-green">✓</span> Atendimento Nacional Configurado</li>
            <li><span class="check-green">✓</span> Zero Overflow em Telas de 360px</li>
          </ul>
        </div>

        <div class="sign-box">
          <div class="sign-badge">STATUS: NO AR</div>
          <div class="sign-text">
            Atualizações enviadas ao GitHub e publicadas em produção na Vercel com sucesso.
          </div>
        </div>
      </div>

    </div>

    <!-- Rodapé Legal / Assinatura -->
    <footer class="page-footer">
      <div class="page-footer-left">
        <div class="badge-dot"></div>
        <span>Priscila Santos — Jornalista & Estrategista de Comunicação Digital</span>
      </div>
      <div>Relatório Oficial de Entregas • Página 1 de 1</div>
    </footer>
  </div>

</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'resumo-entregas-priscila.html'), htmlContent, 'utf-8');

async function generatePDF() {
  console.log('Iniciando Chromium via Playwright para gerar PDF Resumido...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const fileUrl = 'file:///' + path.join(__dirname, 'resumo-entregas-priscila.html').replace(/\\\\/g, '/');
  console.log('Navegando para:', fileUrl);
  await page.goto(fileUrl, { waitUntil: 'networkidle' });
  
  const pdfPath = path.join(__dirname, 'resumo-entregas-priscila.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true
  });
  
  await browser.close();
  console.log('PDF Resumido gerado com sucesso em:', pdfPath);
}

generatePDF().catch(err => {
  console.error('Erro ao gerar PDF:', err);
  process.exit(1);
});
