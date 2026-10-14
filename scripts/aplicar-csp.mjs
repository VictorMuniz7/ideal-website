/**
 * Passo de pós-build: preload das fontes e Content-Security-Policy real do HTML gerado.
 *
 * Roda sozinho depois de `ng build` (script `postbuild`).
 *
 * Por que calcular em vez de escrever à mão: o HTML final tem scripts inline
 * que não existem no código-fonte (o JSON-LD montado pelo serviço de SEO e,
 * dependendo da otimização, um `onload` no <link> do CSS não crítico). Em vez
 * de liberar `unsafe-inline`, o script calcula o SHA-256 de cada um e libera
 * exatamente aqueles.
 *
 * `style-src 'unsafe-inline'` fica liberado de propósito: o Angular serializa
 * ligações de estilo como atributo `style` no HTML pré-renderizado, e atributo
 * de estilo não aceita hash na prática. Estilo inline não executa código.
 *
 * `frame-src` libera só o Google Maps, que é carregado quando o visitante
 * clica em "Mostrar mapa".
 *
 * Saída: o HTML atualizado, `_headers` (Netlify / Cloudflare Pages) dentro do
 * build e `vercel.json` na raiz do projeto.
 */

import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pasta = join(raiz, 'dist', 'ideal', 'browser');
const paginas = ['index.html'];

const sha256 = (texto) => `'sha256-${createHash('sha256').update(texto, 'utf8').digest('base64')}'`;

function politica({ scripts, precisaHashesDeAtributo }) {
  const script = ["'self'", ...scripts];
  if (precisaHashesDeAtributo) script.push("'unsafe-hashes'");

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    `script-src ${script.join(' ')}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "form-action 'self'",
    'frame-src https://www.google.com',
    "manifest-src 'self'",
    'upgrade-insecure-requests',
  ].join('; ');
}

/** A mesma política, mais o que só funciona em cabeçalho HTTP. */
const CABECALHOS = (csp) => ({
  'Content-Security-Policy': `${csp}; frame-ancestors 'none'`,
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), camera=(), microphone=(), payment=(), usb=(), interest-cohort=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Frame-Options': 'DENY',
});

/**
 * Preload das fontes que pintam o texto do topo (subconjunto latino).
 * O nome do arquivo leva o hash da build, então o caminho é lido do CSS gerado.
 */
async function preloadDeFontes(html) {
  const css = (await readdir(pasta)).find((f) => /^styles-.*\.css$/.test(f));
  if (!css) return html;

  const conteudo = await readFile(join(pasta, css), 'utf8');
  const arquivos = [
    ...new Set(
      [...conteudo.matchAll(/url\(["']?\.?\/?(media\/[^"')]+-latin-wght-normal-[^"')]+\.woff2)/g)].map((m) => m[1]),
    ),
  ];
  if (!arquivos.length) return html;

  const links = arquivos.map((f) => `<link rel="preload" href="${f}" as="font" type="font/woff2" crossorigin>`).join('\n  ');
  console.log(`[fontes] ${arquivos.length} preload(s) injetado(s).`);
  return html.replace(/<\/head>/i, `  ${links}\n</head>`);
}

async function processar(arquivo) {
  const caminho = join(pasta, arquivo);
  if (!existsSync(caminho)) return null;

  let html = await readFile(caminho, 'utf8');
  if (!html.includes('rel="preload" href="media/')) html = await preloadDeFontes(html);

  // 1. Todo <script> sem src (inclui o application/ld+json).
  const hashes = new Set();
  let inline = 0;
  for (const [, atributos, corpo] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\bsrc\s*=/i.test(atributos) || !corpo.trim()) continue;
    hashes.add(sha256(corpo));
    inline++;
  }

  // 2. Manipuladores inline (onload= e companhia) que a otimização injeta.
  let atributos = 0;
  for (const [, corpo] of html.matchAll(/\son(?:load|error|click)\s*=\s*"([^"]*)"/gi)) {
    hashes.add(sha256(corpo));
    atributos++;
  }

  const csp = politica({ scripts: [...hashes].sort(), precisaHashesDeAtributo: atributos > 0 });
  const meta = `<meta http-equiv="Content-Security-Policy" content="${csp}">`;
  html = /<meta http-equiv="Content-Security-Policy"[^>]*>/i.test(html)
    ? html.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/i, meta)
    : html.replace(/<head>/i, `<head>\n  ${meta}`);

  await writeFile(caminho, html, 'utf8');
  console.log(`[csp] ${arquivo}: ${inline} script(s) inline, ${atributos} atributo(s) de evento.`);
  return csp;
}

async function main() {
  if (!existsSync(pasta)) {
    console.error(`[csp] build não encontrado em ${pasta}`);
    process.exit(1);
  }

  let csp = null;
  for (const pagina of paginas) csp = (await processar(pagina)) ?? csp;
  if (!csp) {
    console.error('[csp] nenhuma página processada');
    process.exit(1);
  }

  const cabecalhos = CABECALHOS(csp);

  const linhas = [
    '/*',
    ...Object.entries(cabecalhos).map(([k, v]) => `  ${k}: ${v}`),
    '',
    '/media/*',
    '  Cache-Control: public, max-age=31536000, immutable',
    '/*.js',
    '  Cache-Control: public, max-age=31536000, immutable',
    '/*.css',
    '  Cache-Control: public, max-age=31536000, immutable',
    '',
  ];
  await writeFile(join(pasta, '_headers'), linhas.join('\n'), 'utf8');

  await writeFile(
    join(raiz, 'vercel.json'),
    JSON.stringify(
      {
        $schema: 'https://openapi.vercel.sh/vercel.json',
        buildCommand: 'npm run build',
        outputDirectory: 'dist/ideal/browser',
        headers: [
          { source: '/(.*)', headers: Object.entries(cabecalhos).map(([key, value]) => ({ key, value })) },
          {
            // JS e CSS saem do build com hash no nome (outputHashing: all), então são imutáveis.
            // Imagens e PDF mantêm o nome e podem ser trocados: cache curto.
            source: '/(.*)\\.(js|css)',
            headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
          },
          {
            source: '/media/(.*)',
            headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
          },
          {
            source: '/img/(.*)',
            headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }],
          },
        ],
      },
      null,
      2,
    ) + '\n',
    'utf8',
  );

  console.log('[csp] _headers e vercel.json atualizados.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
