# Ideal Análises — site

Landing page da **IDEAL Análises Agrícolas e Técnicas LTDA**, laboratório de análise de solo e foliar
em Sorocaba/SP. Página única, pré-renderizada (HTML estático), com foco em levar o visitante ao
WhatsApp do laboratório e em ensinar a coleta correta da amostra de solo.

Seções: início · sobre o laboratório · análises · como coletar (7 passos + guia em PDF) ·
perguntas frequentes · contato (com mapa sob demanda). Cabeçalho, rodapé e botão flutuante de
WhatsApp completam a página.

Desenvolvido por VMO - Sistemas.

## Como rodar

Requisitos: Node.js 22 ou mais recente e npm.

```bash
npm install
npm start          # servidor de desenvolvimento em http://localhost:4200
```

## Como buildar

```bash
npm run build
```

O resultado fica em `dist/ideal/browser/` — só arquivos estáticos (HTML, CSS, JS, imagens), sem
servidor. O `build` roda em seguida o `postbuild` (`scripts/aplicar-csp.mjs`), que:

- injeta o `preload` das fontes com o nome gerado pelo build;
- calcula o hash SHA-256 de cada script inline e monta a Content-Security-Policy sem `unsafe-inline`;
- grava os cabeçalhos de segurança em `dist/ideal/browser/_headers` (Netlify, Cloudflare Pages) e
  em `vercel.json` (Vercel).

Os hashes mudam quando o conteúdo muda — por isso o `vercel.json` é regerado a cada build e deve ser
versionado junto com a alteração.

## Publicar

**Vercel (recomendado):** importe o repositório. O `vercel.json` já define o comando de build
(`npm run build`), a pasta de saída (`dist/ideal/browser`) e os cabeçalhos.

**Netlify / Cloudflare Pages:** comando `npm run build`, pasta `dist/ideal/browser`. Os cabeçalhos
vão no `_headers` gerado dentro do build.

Hospedagem estática: na maioria dos casos, o plano gratuito dessas plataformas é suficiente.

## Onde mexer no conteúdo

Todo o texto, contato, horário e link do site está em **um arquivo só**:
`src/app/core/config/site.config.ts`. Os templates não têm texto comercial.

| O que                                     | Onde, em `site.config.ts`            |
| ----------------------------------------- | ------------------------------------ |
| Nome, razão social, cidade                | `empresa`                            |
| Domínio e link publicado                  | `dominio`, `urlPublicacao`           |
| Título e descrição para o Google          | `seo`                                |
| WhatsApp, telefone, e-mail, Instagram     | `contato`                            |
| Endereço, mapa, links de rota             | `endereco`                           |
| Horário de atendimento                    | `horarios`                           |
| Mensagens pré-preenchidas do WhatsApp     | `mensagens` e `analises.itens[].mensagemWhats` |
| Textos de cada seção                      | `heroi`, `sobre`, `analises`, `coleta`, `duvidas`, `contatoSecao` |
| Passos da coleta e ilustrações            | `coleta.passos`                      |
| Perguntas frequentes                      | `duvidas.itens`                      |
| CNPJ no rodapé (opcional)                 | `rodape.cnpj`                        |

Os dados estruturados para o Google (JSON-LD de `LocalBusiness` e `FAQPage`) são montados a partir
desse mesmo arquivo — mudou o horário ou uma pergunta, o JSON-LD acompanha.

### Imagens

O material original fica em `images/` (foto da entrada, logo e folheto de coleta escaneado). As
versões otimizadas são geradas por:

```bash
npm run prep:imagens
```

O script grava em `public/`: a foto em AVIF e WebP (480, 800 e 1200 px), a logo em duas densidades,
as ilustrações dos passos 2 a 7 recortadas do folheto e convertidas em traço na cor do site, os
favicons, os ícones do manifesto e a imagem de compartilhamento `og-image.jpg` (1200×630).
Para trocar uma foto, substitua o arquivo em `images/` com o mesmo nome e rode o comando de novo.

### Guia de coleta em PDF

```bash
npm run prep:guia
```

Gera `public/guia-coleta-de-solo.pdf` (A4, uma página, pronto para imprimir) com os mesmos passos,
contatos, endereço e horário de `site.config.ts`, as ilustrações tratadas e um QR code que abre o
WhatsApp do laboratório. Sempre que um contato, horário ou passo mudar, rode o comando de novo — o
PDF acompanha o site. Se algum texto não couber na folha, o comando avisa em vez de cortar o conteúdo.
Depois de gerar, confira o tamanho do arquivo em `coleta.pdfTamanho` (texto do botão de download).

## Antes de publicar

Os itens abaixo estão marcados com `// DEFINIR:` em `site.config.ts`:

- [ ] **Domínio** — preencha `dominio` (ex.: `https://www.idealanalises.com.br/`). Com ele, o site
      passa a publicar URL canônica. Crie também `public/robots.txt` e `public/sitemap.xml`
      apontando para o domínio.
- [ ] **Link publicado** — `urlPublicacao` aponta para `https://ideal-website-tau.vercel.app/`; ao
      trocar de endereço (ou quando o domínio entrar), atualize para a imagem de compartilhamento
      continuar aparecendo na prévia do link no WhatsApp.
- [ ] **Tempo de mercado** — confirmar "mais de 25 anos de experiência" (texto em `sobre`).
- [ ] **Horário** — confirmar o horário de sexta-feira (o aviso na porta diz "6ª até às 16:00").
- [ ] **Prazo do resultado** — confirmar "7 a 10 dias" (destaque do topo e primeira pergunta).
- [ ] **CNPJ** — preencher `rodape.cnpj` se quiser exibi-lo no rodapé.

## Identidade visual

| Token            | Cor       | Uso                                                |
| ---------------- | --------- | -------------------------------------------------- |
| `--papel`        | `#f7f4ee` | fundo da página                                    |
| `--tinta`        | `#0b4f5c` | títulos, traço das ilustrações                     |
| `--texto`        | `#1d2a2d` | texto corrido                                      |
| `--acao`         | `#0a6b7c` | links e botões principais                          |
| `--whats`        | `#146c3a` | botões de WhatsApp                                 |
| `--turquesa`     | `#17a7c2` | cor da logo — só em elementos decorativos          |
| `--terra-escura` | `#3d2617` | faixa da seção "Como coletar"                      |

Os pares de contraste estão documentados em `src/styles.scss`. Fontes auto-hospedadas via
`@fontsource-variable`: **Bricolage Grotesque** (títulos) e **Figtree** (texto).

## Qualidade

Medido no build de produção (`npm run build && npm run auditar`), relatórios completos em
`auditoria/`:

| Perfil  | Performance | Acessibilidade | Boas práticas | SEO | LCP   | CLS |
| ------- | ----------: | -------------: | ------------: | --: | ----- | --- |
| Desktop |         100 |            100 |           100 | 100 | 0,6 s | 0   |
| Celular |          99 |            100 |           100 | 100 | 2,2 s | 0   |

- **Acessibilidade (WCAG AA):** zero violações no axe-core em 320, 390, 768, 1024, 1440 e 2560 px;
  link "pular para o conteúdo"; foco visível; menu móvel fechado com `inert` e fechamento por Esc
  (o foco volta ao botão); perguntas frequentes em `<details>`; links que abrem nova aba avisam no
  nome acessível; `prefers-reduced-motion` desliga animações e transições.
- **Responsivo:** de 320 px a 4K, sem rolagem horizontal (medida sem `overflow-x: hidden`).
- **Conteúdo sem JavaScript:** o HTML é pré-renderizado; o texto completo aparece mesmo com JS
  desligado.
- **Privacidade:** nenhum rastreador e nenhum cookie. O mapa do Google só é carregado quando o
  visitante clica em "Mostrar mapa"; até lá, nenhuma requisição sai para terceiros. Os links
  "Abrir no Google Maps" e "Traçar rota" funcionam sem carregar o mapa.
- **Segurança:** CSP sem `unsafe-inline` em `script-src`, `frame-src` restrito ao Google Maps,
  `frame-ancestors 'none'`, HSTS, `X-Content-Type-Options`, `Referrer-Policy`,
  `Permissions-Policy` e COOP. `npm audit` sem vulnerabilidades.
- **SEO:** título e descrição, Open Graph e Twitter Card com imagem 1200×630, JSON-LD
  (`LocalBusiness` com endereço, coordenadas e horários + `FAQPage`), manifesto e favicons.

Conferência automatizada (larguras, axe-core, console, requisições de terceiros, menu, mapa e links
de WhatsApp), com prints em `.conferencia/`:

```bash
npm run build && npm run conferir
```

## Estrutura de pastas

```
images/                  material original (foto, logo, folheto escaneado)
public/                  arquivos servidos como estão (imagens otimizadas, ícones, PDF, manifesto)
scripts/
  prep-imagens.mjs       gera as imagens otimizadas a partir de images/
  gerar-guia-pdf.mjs     gera o guia de coleta em PDF a partir do config
  aplicar-csp.mjs        postbuild: preload de fontes, CSP e cabeçalhos
  conferir.mjs           conferência em navegador (larguras, axe-core, interações)
  auditar.mjs            Lighthouse desktop e celular
src/
  index.html
  styles.scss            tokens, base, botões
  app/
    core/config/site.config.ts   todo o conteúdo do site
    core/seo/seo.service.ts      meta tags e JSON-LD
    features/            uma pasta por seção (cabecalho, heroi, sobre, analises,
                         coleta, duvidas, contato, rodape, whatsapp-flutuante)
    shared/icone/        ícones SVG inline
auditoria/               relatórios do Lighthouse
```

## Melhorias possíveis

- Fotos reais do interior do laboratório e dos equipamentos, para uma seção de galeria.
- Depoimentos de clientes (com autorização), em seção própria.
- Formulário que monte a mensagem do pedido (tipo de análise, número de amostras, cidade) e abra o
  WhatsApp já preenchido.
