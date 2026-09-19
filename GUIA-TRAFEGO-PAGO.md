# Guia de Tráfego Pago — Site da Priscila Santos

Tudo que o site precisa para anunciar **já está instalado e desligado**. Você só precisa
criar as contas, copiar 4 códigos e colar num único arquivo. Nada aqui exige programador.

---

## Parte 1 — O único arquivo que você edita

Abra o arquivo **`js/analytics-config.js`**. Ele tem 4 linhas para preencher, entre as aspas:

```js
ga4: '',                  // ← Google Analytics
metaPixel: '',            // ← Pixel do Instagram/Facebook
googleAds: '',            // ← Google Ads
googleAdsLeadLabel: '',   // ← etiqueta de conversão do Google Ads
```

**Regra de ouro:** campo vazio = ferramenta desligada. Você pode ligar uma de cada vez,
sem pressa, e o site continua funcionando normalmente.

---

## Parte 2 — Onde achar cada código

### Google Analytics 4 (faça esse primeiro — é grátis e serve pra sempre)

1. Acesse [analytics.google.com](https://analytics.google.com) e entre com seu Gmail.
2. Clique em **Começar a medir** → nome da conta: `Priscila Santos`.
3. Crie uma **propriedade** com o nome `Site priscilasantos.com.br`, fuso **Brasília**, moeda **Real**.
4. Escolha a plataforma **Web** e informe o endereço `priscilasantos.com.br`.
5. Na tela seguinte aparece o **ID da métrica**, no formato `G-ABC1234567`.
6. Cole esse código no campo `ga4`.

### Pixel da Meta (Instagram + Facebook)

1. Acesse [business.facebook.com](https://business.facebook.com) e crie um **Gerenciador de Negócios**,
   se ainda não tiver.
2. Vá em **Gerenciador de Eventos** → **Conectar fonte de dados** → **Web** → **Pixel da Meta**.
3. Dê o nome `Pixel Site Priscila` e escolha **instalar manualmente** (o código já está no site,
   você só precisa do número).
4. O número do pixel tem 15 ou 16 dígitos, algo como `1234567890123456`.
5. Cole esse número no campo `metaPixel`.
6. Ainda no Gerenciador de Eventos, faça a **verificação do domínio** — sem isso a Meta limita
   a medição no iPhone. Ela vai te dar uma meta tag; me mande que eu coloco no site.

### Google Ads

1. Acesse [ads.google.com](https://ads.google.com) e crie a conta.
2. Vá em **Ferramentas** → **Conversões** → **Nova ação de conversão** → **Site**.
3. Categoria: **Envio de formulário de lead**. Nome: `Contato pelo site`.
4. Escolha **Adicionar a tag manualmente**. Vão aparecer dois códigos:
   - `AW-123456789` → cole em `googleAds`
   - `AW-123456789/AbC-D_efGh12` → cole em `googleAdsLeadLabel`

---

## Parte 3 — O que o site já mede sozinho

Depois que os códigos estiverem colados, tudo isso é registrado automaticamente:

| Evento | Quando acontece | Pra que serve |
|---|---|---|
| `page_view` | Alguém abre o site | Quantidade de visitas |
| `scroll_depth` | A pessoa rola 25%, 50%, 75% e 100% da página | Descobre onde as pessoas desistem de ler |
| `form_start` | A pessoa começa a preencher o formulário | Mostra interesse mesmo sem envio |
| **`generate_lead`** | A pessoa clica em enviar o formulário | **É a conversão.** É isso que você otimiza |
| `contact_click` | Clique no WhatsApp, e-mail, Instagram ou LinkedIn | Mede os contatos diretos |

O evento `generate_lead` chega na Meta com o nome **`Lead`** — é ele que você escolhe quando
a campanha perguntar "qual evento você quer otimizar?".

> **Importante entender:** o formulário abre o WhatsApp com o texto pronto, mas quem aperta
> "enviar" no WhatsApp é a pessoa. Então o site conta o **clique no botão**, não a mensagem
> recebida. Seu painel pode mostrar 10 leads e você receber 8 conversas. É o esperado.

---

## Parte 4 — Saber de qual anúncio cada pessoa veio

Isto **já funciona, sem depender de conta nenhuma**. Quando você divulgar o site, use um
link com etiqueta em vez do link puro:

```
https://priscilasantos.com.br/?utm_source=instagram&utm_medium=cpc&utm_campaign=eventos-outubro
```

Aí, quando essa pessoa preencher o formulário, a mensagem que chega no seu WhatsApp
vem assim, com a origem no rodapé:

```
Olá, Priscila! Meu nome é Ana.
Meu Contato: 71 99999-9999
Assunto: Quero contratar um serviço
Tenho interesse em: Cobertura de Eventos

Origem: instagram · eventos-outubro
```

Você já sabe qual anúncio trouxe a pessoa **antes de responder**.

### Como montar a etiqueta

| Pedaço | O que escrever | Exemplo |
|---|---|---|
| `utm_source` | Onde o anúncio está | `instagram`, `facebook`, `google` |
| `utm_medium` | Tipo de divulgação | `cpc` (pago), `bio` (link da bio), `story` |
| `utm_campaign` | Nome da campanha | `eventos-outubro`, `social-media-bahia` |
| `utm_content` | Qual criativo (se testar mais de um) | `video-depoimento`, `foto-carrossel` |

Regras: tudo em **minúsculo**, **sem acento**, e usando **hífen** no lugar de espaço.
Se escrever `Instagram` num anúncio e `instagram` noutro, o painel vai contar como duas origens
diferentes.

### Links prontos para copiar

```
Link da bio do Instagram:
https://priscilasantos.com.br/?utm_source=instagram&utm_medium=bio&utm_campaign=perfil

Anúncio no Instagram/Facebook:
https://priscilasantos.com.br/?utm_source=instagram&utm_medium=cpc&utm_campaign=NOME-DA-CAMPANHA

Vaga / recrutadores (LinkedIn) — já abre o formulário no modo "oportunidade":
https://priscilasantos.com.br/?assunto=vaga&utm_source=linkedin&utm_medium=perfil&utm_campaign=oportunidades

Cartão de visita / QR Code:
https://priscilasantos.com.br/?utm_source=offline&utm_medium=cartao&utm_campaign=networking
```

### O atalho `?assunto=vaga`

Além das etiquetas de campanha, o site entende `?assunto=vaga` no endereço. Quem abrir o
link por aí já encontra o formulário com **"Tenho uma oportunidade profissional"** marcado,
sem precisar procurar. Use esse link no LinkedIn, no currículo e em resposta a vagas.

No Google Ads **não precisa** de `utm_source`: o Google já manda o `gclid` sozinho e o site
entende.

---

## Parte 5 — Antes de apertar "publicar anúncio"

- [ ] Os códigos estão colados no `js/analytics-config.js` e o site foi publicado depois disso
- [ ] Abri o site, aceitei os cookies e vi a visita aparecer no Google Analytics (aba **Tempo real**)
- [ ] Testei o formulário e o evento `Lead` apareceu no Gerenciador de Eventos da Meta
- [ ] O domínio está verificado no Gerenciador de Negócios da Meta
- [ ] A política de privacidade abre em `priscilasantos.com.br/politica-de-privacidade.html`
- [ ] O link do LinkedIn no rodapé aponta pro meu perfil de verdade
- [ ] Mandei o link do site pra mim mesma no WhatsApp e a imagem de preview apareceu

Esse último item importa mais do que parece: o preview é a primeira coisa que a pessoa vê
quando alguém compartilha seu site.

---

## Parte 6 — Textos de anúncio prontos

Três ângulos diferentes. Rode os três com verba pequena por uma semana e mantenha o que
trouxer mais conversa.

### Ângulo 1 — Dor do cliente

> **Título:** Seu perfil posta todo dia e mesmo assim ninguém liga?
>
> **Texto:** Postar não é comunicar. Eu sou jornalista e construo a estratégia por trás do
> conteúdo — pra sua marca ser lembrada, não só vista. Atendo de salão de bairro a órgão
> público.
>
> **Botão:** Saiba mais

### Ângulo 2 — Prova / autoridade

> **Título:** Jornalista, não "social media"
>
> **Texto:** 10 anos cobrindo pauta, apurando história e escrevendo pra quem precisa ser
> entendido na primeira leitura. Agora aplico isso na comunicação da sua marca.
>
> **Botão:** Ver trabalhos

### Ângulo 3 — Evento (sazonal, use perto de datas de eventos da sua cidade)

> **Título:** Seu evento merece mais que fotos no celular
>
> **Texto:** Cobertura completa: stories em tempo real durante o evento e um vídeo editado
> pra eternizar depois. Conteúdo que continua trabalhando quando o evento acaba.
>
> **Botão:** Fale comigo

### Tamanhos de imagem que você vai precisar

| Onde | Formato | Medida |
|---|---|---|
| Feed do Instagram/Facebook | Quadrado | 1080 × 1080 |
| Stories e Reels | Vertical | 1080 × 1920 |
| Preview do link (já pronto) | Deitado | 1200 × 630 |

---

## Parte 7 — Quanto investir no começo

Sugestão pra quem está começando, não é regra:

- **R$ 20 a R$ 30 por dia** durante 7 dias, numa campanha só.
- Objetivo da campanha: **Cadastros (Leads)**, otimizando pelo evento `Lead`.
- Público: sua cidade e região, 25 a 55 anos, interesses em empreendedorismo, marketing,
  pequenos negócios.
- **Não mexa na campanha nos primeiros 4 dias.** Toda vez que você edita, o aprendizado
  reinicia e o dinheiro gasto até ali é desperdiçado.

O que olhar no fim da semana: **custo por lead**. Se cada conversa está custando mais do que
você ganha num trabalho pequeno, troque o criativo antes de aumentar a verba.

---

## Parte 8 — Onde as coisas moram no projeto

| Arquivo | O que é |
|---|---|
| `js/analytics-config.js` | **Onde você cola os códigos.** O único que você precisa abrir |
| `js/analytics.js` | Motor da medição. Não precisa mexer |
| `js/consent.js` | Aviso de cookies. Não precisa mexer |
| `politica-de-privacidade.html` | Exigida pelo Meta e pelo Google |
| `assets/og-image.jpg` | Imagem que aparece quando o link é compartilhado |

---

## Dúvidas comuns

**O site ficou mais lento?**
Não. Enquanto os códigos estiverem vazios, nada externo é baixado. Depois de preenchidos, os
scripts só carregam **após** o aceite de cookies e sem travar a página.

**E quem recusar os cookies?**
Navega o site inteiro normalmente, usa o formulário normalmente. Só não é contabilizado.
Isso derruba um pouco os números do painel — é o preço de estar em dia com a LGPD.

**Posso anunciar sem a política de privacidade?**
Não. Meta e Google verificam isso e reprovam a conta de anúncios. Ela já está publicada.

**Preciso pagar o Google Analytics?**
Não. É gratuito e vale a pena mesmo que você nunca anuncie.
