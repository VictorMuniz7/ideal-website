/**
 * Gera o guia de coleta em PDF (A4, uma página) a partir do conteúdo do site.
 *
 *   npm run prep:guia
 *
 * Os passos, os contatos, o endereço e o horário vêm de
 * `src/app/core/config/site.config.ts` — o mesmo arquivo que alimenta o site.
 * Mudou um telefone ou um passo? Rode o comando de novo e o PDF acompanha.
 *
 * Usa as ilustrações já tratadas por `prep-imagens.mjs` (rode-o antes, se
 * ainda não existirem em `public/img/`) e as fontes do próprio site.
 * Saída: `public/guia-coleta-de-solo.pdf`.
 */

import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import QRCode from 'qrcode';

const RAIZ = path.resolve(import.meta.dirname, '..');
const { SITE, linkWhatsapp } = await import(pathToFileURL(path.join(RAIZ, 'src/app/core/config/site.config.ts')).href);

const SAIDA = path.join(RAIZ, 'public', SITE.coleta.pdf);

const dataUri = (arquivo, tipo) => `data:${tipo};base64,${readFileSync(arquivo).toString('base64')}`;
const fonte = (pacote, arquivo) =>
  dataUri(path.join(RAIZ, 'node_modules/@fontsource-variable', pacote, 'files', arquivo), 'font/woff2');
const imagem = (nome) => dataUri(path.join(RAIZ, 'public/img', nome), 'image/webp');
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const { empresa, contato, endereco, horarios, coleta } = SITE;

const qrWhats = await QRCode.toString(linkWhatsapp(SITE.mensagens.coleta), {
  type: 'svg',
  margin: 0,
  errorCorrectionLevel: 'M',
  color: { dark: '#0b4f5c', light: '#ffffff' },
});

/** O mesmo desenho do passo 1 no site (área dividida em glebas). */
const glebas = `
<svg viewBox="0 0 360 250" aria-hidden="true">
  <defs>
    <pattern id="h" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0 V10" stroke="#0b4f5c" stroke-width="1.6" opacity="0.55"/></pattern>
    <pattern id="p" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.5" fill="#0b4f5c" opacity="0.6"/><circle cx="9" cy="9" r="1.1" fill="#0b4f5c" opacity="0.5"/></pattern>
    <pattern id="o" width="24" height="12" patternUnits="userSpaceOnUse"><path d="M0 6 Q6 1 12 6 T24 6" fill="none" stroke="#0b4f5c" stroke-width="1.5" opacity="0.55"/></pattern>
  </defs>
  <g stroke="#0b4f5c" stroke-width="3" stroke-linejoin="round">
    <path d="M30 40 L120 18 L250 26 L332 54 L326 150 L340 222 L210 236 L70 228 L22 196 L36 120 Z" fill="url(#h)"/>
    <path d="M33 110 C 110 90 200 128 330 96 L326 150 L340 222 L210 236 L70 228 L22 196 L36 120 Z" fill="#fff"/>
    <path d="M33 110 C 110 90 200 128 330 96 L326 150 L340 222 L210 236 L70 228 L22 196 L36 120 Z" fill="url(#p)"/>
    <path d="M28 172 C 120 152 220 186 334 160 L340 222 L210 236 L70 228 L22 196 Z" fill="#fff"/>
    <path d="M28 172 C 120 152 220 186 334 160 L340 222 L210 236 L70 228 L22 196 Z" fill="url(#o)"/>
  </g>
  ${[64, 140, 204]
    .map(
      (y, i) => `<g transform="translate(180 ${y})"><rect x="-48" y="-14" width="96" height="26" rx="13" fill="#0b4f5c"/>
      <text x="0" y="4" text-anchor="middle" fill="#fff" font-family="Figtree" font-size="15" font-weight="700">${esc(coleta.rotulosGlebas[i])}</text></g>`,
    )
    .join('')}
</svg>`;

const passo = (p) => `
  <article class="passo${p.ilustracao ? '' : ' passo--largo'}">
    <div class="passo__figura">
      ${p.ilustracao ? `<img src="${imagem(p.ilustracao + '.webp')}" alt="">` : glebas}
    </div>
    <div class="passo__texto">
      <div class="passo__cabeca"><span class="numero">${p.numero}</span><h2>${esc(p.titulo)}</h2></div>
      <p>${esc(p.texto)}</p>
      ${p.observacao ? `<p class="obs">${esc(p.observacao)}</p>` : ''}
    </div>
  </article>`;

const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>${esc(coleta.titulo)} — ${esc(empresa.nome)}</title>
<style>
  @font-face { font-family: 'Figtree'; font-weight: 300 900; src: url(${fonte('figtree', 'figtree-latin-wght-normal.woff2')}) format('woff2'); }
  @font-face { font-family: 'Bricolage'; font-weight: 200 800; src: url(${fonte('bricolage-grotesque', 'bricolage-grotesque-latin-wght-normal.woff2')}) format('woff2'); }
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; }
  body {
    width: 210mm; height: 297mm; overflow: hidden;
    display: flex; flex-direction: column;
    font-family: 'Figtree', sans-serif; color: #1d2a2d; background: #f7f4ee;
    font-size: 9.6pt; line-height: 1.42;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  h1, h2 { font-family: 'Bricolage', sans-serif; color: #0b4f5c; margin: 0; letter-spacing: -0.01em; }
  p { margin: 0; }

  .topo { display: flex; align-items: flex-end; justify-content: space-between; gap: 8mm; padding: 10mm 12mm 5mm; }
  .topo img { width: 40mm; }
  .topo__texto { text-align: right; }
  .selo { color: #7a4a2c; font-size: 8pt; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 1mm; }
  h1 { font-size: 23pt; font-weight: 750; line-height: 1.05; }
  .intro { padding: 0 12mm 5mm; color: #4a5a5d; font-size: 10pt; max-width: 165mm; }

  .passos { flex: 1; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: auto repeat(3, 1fr); gap: 3.5mm; padding: 0 12mm; }
  .passo { display: flex; background: #fff; border: 0.3mm solid #ddd4c4; border-radius: 3.5mm; overflow: hidden; }
  .passo--largo { grid-column: span 2; }
  .passo__figura { flex: 0 0 33mm; display: flex; align-items: center; justify-content: center; padding: 3mm; border-right: 0.3mm solid #ddd4c4; }
  .passo--largo .passo__figura { flex-basis: 52mm; padding: 2.5mm 3mm; }
  .passo--largo .passo__figura svg { max-height: 30mm; }
  .passo__figura img, .passo__figura svg { max-width: 100%; max-height: 38mm; }
  .passo__texto { padding: 3.5mm 4mm; align-self: center; }
  .passo__cabeca { display: flex; align-items: center; gap: 2.5mm; margin-bottom: 1.5mm; }
  .numero { flex: none; display: grid; place-items: center; width: 7.5mm; height: 7.5mm; border-radius: 50%; background: #0a6b7c; color: #fff; font-family: 'Bricolage', sans-serif; font-weight: 750; font-size: 11.5pt; }
  h2 { font-size: 11.5pt; font-weight: 700; line-height: 1.15; }
  .obs { display: inline-block; margin-top: 1.5mm; padding: 0.8mm 2.2mm; border-radius: 1.5mm; background: #d6f0f4; color: #0b4f5c; font-weight: 700; font-size: 8.8pt; }

  .rodape { display: flex; gap: 6mm; align-items: center; margin-top: 4.5mm; padding: 5.5mm 12mm 6.5mm; background: #3d2617; color: #f7f4ee; font-size: 8.8pt; }
  .rodape__qr { flex: none; width: 25mm; padding: 1.8mm; background: #fff; border-radius: 2mm; }
  .rodape__qr svg { display: block; width: 100%; height: auto; }
  .rodape__chamada { flex: 0 0 38mm; }
  .rodape__chamada strong { display: block; font-family: 'Bricolage', sans-serif; font-size: 12pt; line-height: 1.15; color: #fff; margin-bottom: 1mm; }
  .rodape__chamada span { color: #e9dfd1; }
  .rodape__dados { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 2.5mm 6mm; border-left: 0.3mm solid rgba(255,255,255,0.25); padding-left: 6mm; }
  .rotulo { display: block; color: #9fdbe6; font-size: 7.4pt; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
  .rodape__dados p { color: #f7f4ee; }
</style>
</head>
<body>
  <header class="topo">
    <img src="${imagem('logo-360.webp')}" alt="${esc(empresa.nome)}">
    <div class="topo__texto">
      <p class="selo">${esc(empresa.razaoSocial)}</p>
      <h1>${esc(coleta.titulo)}</h1>
    </div>
  </header>
  <p class="intro">${esc(coleta.introducao)}</p>

  <main class="passos">
    ${coleta.passos.map(passo).join('')}
  </main>

  <footer class="rodape">
    <div class="rodape__qr">${qrWhats}</div>
    <div class="rodape__chamada">
      <strong>${esc(coleta.rotuloDuvida)}</strong>
      <span>${esc(coleta.textoQrPdf)}</span>
    </div>
    <div class="rodape__dados">
      <div><span class="rotulo">WhatsApp</span><p>${esc(contato.whatsapp.exibicao)}</p></div>
      <div><span class="rotulo">Telefone</span><p>${esc(contato.telefone.exibicao)}</p></div>
      <div><span class="rotulo">E-mail</span><p>${esc(contato.email)}</p></div>
      <div><span class="rotulo">Instagram</span><p>${esc(contato.instagram.usuario)}</p></div>
      <div><span class="rotulo">Endereço</span><p>${esc(endereco.logradouro)} – ${esc(endereco.bairro)}<br>${esc(endereco.cidade)}/${esc(endereco.uf)} · CEP ${esc(endereco.cep)}</p></div>
      <div><span class="rotulo">Horário</span><p>${horarios.map((h) => `${esc(h.dias)}: ${esc(h.periodos.join(' e '))}`).join('<br>')}</p></div>
    </div>
  </footer>
</body>
</html>`;

const navegador = await chromium.launch({ channel: 'msedge' });
const pagina = await navegador.newPage({ viewport: { width: 794, height: 1123 } });
await pagina.setContent(html, { waitUntil: 'load' });
await pagina.evaluate(() => document.fonts.ready);

// O guia precisa caber numa folha: se algo transbordar, falha em vez de cortar texto.
const transbordo = await pagina.evaluate(() =>
  [...document.querySelectorAll('.passo__texto, .rodape')].filter((el) => el.scrollHeight > el.clientHeight + 1 || el.getBoundingClientRect().bottom > document.body.getBoundingClientRect().bottom + 1).length,
);
if (transbordo) {
  console.error(`[guia] ${transbordo} bloco(s) não couberam na página — revise os textos ou o layout.`);
  process.exitCode = 1;
}

await pagina.pdf({ path: SAIDA, format: 'A4', printBackground: true, preferCSSPageSize: true });
await pagina.screenshot({ path: path.join(RAIZ, '.conferencia', 'guia-pdf.png'), fullPage: true }).catch(() => {});
await navegador.close();

console.log(`[guia] ${path.relative(RAIZ, SAIDA)} gerado (${Math.round(statSync(SAIDA).size / 1024)} KB).`);
