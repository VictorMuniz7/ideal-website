/**
 * Preparação das imagens do site a partir do material original em `images/`.
 *
 *   npm run prep:imagens
 *
 * Não faz parte do build: roda uma vez (ou quando o material mudar) e grava o
 * resultado em `public/`. O que ele gera:
 *
 *   - foto da entrada do laboratório em AVIF e WebP, em três larguras;
 *   - logo recortada (sem margem) em WebP, em duas densidades;
 *   - ilustrações dos passos de coleta, recortadas do folheto escaneado e
 *     convertidas em traço sobre fundo transparente, na cor da marca;
 *   - favicons, ícones do manifesto e a imagem de compartilhamento 1200×630.
 *
 * O guia de coleta em PDF é gerado à parte, por `gerar-guia-pdf.mjs` (npm run prep:guia).
 */

import sharp from 'sharp';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve(import.meta.dirname, '..');
const ORIGEM = path.join(RAIZ, 'images');
const PUBLICO = path.join(RAIZ, 'public');
const IMG = path.join(PUBLICO, 'img');

mkdirSync(IMG, { recursive: true });

/** Tinta usada nas ilustrações — o mesmo azul-petróleo escuro do texto do site. */
const TINTA = { r: 0x0b, g: 0x4f, b: 0x5c };
const PAPEL = '#f7f4ee';

// ---------------------------------------------------------------------------
// 1. Foto da entrada
// ---------------------------------------------------------------------------
const FOTO = path.join(ORIGEM, 'entrada.jpeg');
for (const largura of [480, 800, 1200]) {
  const base = sharp(FOTO).rotate().resize({ width: largura });
  await base.clone().avif({ quality: 55, effort: 6 }).toFile(path.join(IMG, `entrada-${largura}.avif`));
  await base.clone().webp({ quality: 74 }).toFile(path.join(IMG, `entrada-${largura}.webp`));
}

// ---------------------------------------------------------------------------
// 2. Logo
// ---------------------------------------------------------------------------
const logoRecortada = await sharp(path.join(ORIGEM, 'logo (2).png')).trim({ threshold: 10 }).png().toBuffer();
const logoMeta = await sharp(logoRecortada).metadata();
console.log('logo recortada:', logoMeta.width, 'x', logoMeta.height);

for (const largura of [180, 360]) {
  await sharp(logoRecortada).resize({ width: largura }).webp({ quality: 90 }).toFile(path.join(IMG, `logo-${largura}.webp`));
}

// Só o símbolo (frasco e tubo), sem o nome — base dos favicons.
const larguraSimbolo = Math.round(logoMeta.width * 0.29);
const simbolo = await sharp(logoRecortada)
  .extract({ left: 0, top: 0, width: larguraSimbolo, height: logoMeta.height })
  .trim({ threshold: 10 })
  .png()
  .toBuffer();

// ---------------------------------------------------------------------------
// 3. Ilustrações dos passos (2 a 7)
// ---------------------------------------------------------------------------
// Recorte de cada ilustração dentro do quadro do folheto (imagens 960×540).
const RECORTES = {
  2: { left: 588, top: 98, width: 326, height: 380 },
  3: { left: 602, top: 106, width: 314, height: 328 },
  4: { left: 622, top: 88, width: 286, height: 370 },
  5: { left: 598, top: 42, width: 316, height: 456 },
  6: { left: 588, top: 105, width: 330, height: 330 },
  7: { left: 600, top: 95, width: 316, height: 388 },
};

/**
 * Converte o escaneado em traço: quanto mais escuro o pixel, mais opaco.
 * O papel (claro) vira transparente, e a cor final é sempre a `TINTA`, então
 * todas as ilustrações saem com o mesmo tom, independente do escaneamento.
 */
async function emTraco(entrada) {
  const { data, info } = await sharp(entrada).greyscale().raw().toBuffer({ resolveWithObject: true });
  const saida = Buffer.alloc(info.width * info.height * 4);
  const claro = 215;
  const escuro = 120;
  for (let i = 0; i < info.width * info.height; i++) {
    const lum = data[i];
    let alfa;
    if (lum >= claro) alfa = 0;
    else if (lum <= escuro) alfa = 255;
    else alfa = Math.round(255 * ((claro - lum) / (claro - escuro)));
    saida[i * 4] = TINTA.r;
    saida[i * 4 + 1] = TINTA.g;
    saida[i * 4 + 2] = TINTA.b;
    saida[i * 4 + 3] = alfa;
  }
  return sharp(saida, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

const dimensoes = {};
for (const [passo, caixa] of Object.entries(RECORTES)) {
  const recorte = await sharp(path.join(ORIGEM, `${passo}.png`)).extract(caixa).png().toBuffer();
  const traco = await sharp(await emTraco(recorte)).trim({ threshold: 1 }).png().toBuffer();
  const meta = await sharp(traco).metadata();
  dimensoes[passo] = `${meta.width} / ${meta.height}`;
  await sharp(traco).webp({ quality: 88, alphaQuality: 90 }).toFile(path.join(IMG, `passo-${passo}.webp`));
  await sharp(traco).avif({ quality: 60, effort: 6 }).toFile(path.join(IMG, `passo-${passo}.avif`));
}
console.log('proporções das ilustrações:', dimensoes);

// ---------------------------------------------------------------------------
// 4. Favicons e ícones
// ---------------------------------------------------------------------------
async function icone(tamanho, arquivo, raio = 0, margem = 0.16) {
  const pad = Math.round(tamanho * margem);
  const interno = tamanho - pad * 2;
  const desenho = await sharp(simbolo)
    .resize({ width: interno, height: interno, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  let fundo = sharp({ create: { width: tamanho, height: tamanho, channels: 4, background: '#ffffff' } });
  if (raio > 0) {
    const mascara = Buffer.from(
      `<svg width="${tamanho}" height="${tamanho}"><rect width="${tamanho}" height="${tamanho}" rx="${raio}" fill="#fff"/></svg>`,
    );
    fundo = sharp(await fundo.composite([{ input: mascara, blend: 'dest-in' }]).png().toBuffer());
  }
  await fundo.composite([{ input: desenho, top: pad, left: pad }]).png().toFile(arquivo);
}

await icone(16, path.join(PUBLICO, 'favicon-16.png'), 0, 0.04);
await icone(32, path.join(PUBLICO, 'favicon-32.png'), 0, 0.06);
await icone(48, path.join(PUBLICO, 'favicon-48.png'), 0, 0.08);
await icone(180, path.join(PUBLICO, 'apple-touch-icon.png'));
await icone(192, path.join(PUBLICO, 'icon-192.png'), 40);
await icone(512, path.join(PUBLICO, 'icon-512.png'), 104);
await icone(512, path.join(PUBLICO, 'icon-512-maskable.png'), 0, 0.24);

// .ico com PNGs embutidos (formato aceito por todos os navegadores atuais).
function montarIco(pngs) {
  const cabecalho = Buffer.alloc(6);
  cabecalho.writeUInt16LE(0, 0);
  cabecalho.writeUInt16LE(1, 2);
  cabecalho.writeUInt16LE(pngs.length, 4);
  let deslocamento = 6 + 16 * pngs.length;
  const entradas = pngs.map(({ tamanho, buf }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(tamanho, 0);
    e.writeUInt8(tamanho, 1);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(buf.length, 8);
    e.writeUInt32LE(deslocamento, 12);
    deslocamento += buf.length;
    return e;
  });
  return Buffer.concat([cabecalho, ...entradas, ...pngs.map((p) => p.buf)]);
}
writeFileSync(
  path.join(PUBLICO, 'favicon.ico'),
  montarIco([16, 32, 48].map((tamanho) => ({ tamanho, buf: readFileSync(path.join(PUBLICO, `favicon-${tamanho}.png`)) }))),
);

// ---------------------------------------------------------------------------
// 5. Imagem de compartilhamento (Open Graph / Twitter) 1200×630
// ---------------------------------------------------------------------------
const OG_L = 1200;
const OG_A = 630;
const logoOg = await sharp(logoRecortada).resize({ width: 520 }).png().toBuffer();
const logoOgMeta = await sharp(logoOg).metadata();

// Faixas inspiradas nas camadas de um perfil de solo.
const fundoOg = `
<svg width="${OG_L}" height="${OG_A}" viewBox="0 0 ${OG_L} ${OG_A}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${OG_L}" height="${OG_A}" fill="${PAPEL}"/>
  <path d="M0 470 C 200 450 380 490 600 468 S 1000 446 1200 466 L1200 630 L0 630 Z" fill="#8a5a3b"/>
  <path d="M0 520 C 240 505 420 540 640 522 S 1000 500 1200 518 L1200 630 L0 630 Z" fill="#6b4329"/>
  <path d="M0 574 C 260 562 460 590 680 576 S 1020 560 1200 572 L1200 630 L0 630 Z" fill="#4a2e1c"/>
  <path d="M0 462 C 200 442 380 482 600 460 S 1000 438 1200 458" fill="none" stroke="#5c8a3a" stroke-width="10"/>
  <text x="600" y="368" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="40" font-weight="600" fill="#0b4f5c">Análises agrícolas e técnicas · Sorocaba/SP</text>
</svg>`;
await sharp(Buffer.from(fundoOg))
  .composite([{ input: logoOg, top: 120, left: Math.round((OG_L - logoOgMeta.width) / 2) }])
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(path.join(PUBLICO, 'og-image.jpg'));

console.log('Imagens prontas em public/.');
