/**
 * Auditoria Lighthouse do build de produção, em desktop e em celular.
 *
 *   npm run build && npm run auditar
 *
 * Serve o `dist/` num servidor local e roda o Lighthouse de verdade contra o
 * Edge instalado na máquina. Os relatórios completos ficam em `auditoria/`
 * e o resumo sai no terminal.
 */

import { createServer } from 'node:http';
import { createGzip } from 'node:zlib';
import { createReadStream, existsSync } from 'node:fs';
import { mkdir, writeFile, stat } from 'node:fs/promises';
import { extname, join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import lighthouse from 'lighthouse';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pasta = join(raiz, 'dist', 'ideal', 'browser');
const saida = join(raiz, 'auditoria');
const PORTA = 4896;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.jpg': 'image/jpeg',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
};

function servir() {
  const servidor = createServer(async (req, res) => {
    const caminho = decodeURIComponent((req.url ?? '/').split('?')[0]);
    let arquivo = join(pasta, caminho);
    try {
      if ((await stat(arquivo)).isDirectory()) arquivo = join(arquivo, 'index.html');
    } catch {
      // Como na hospedagem estática: arquivo inexistente é 404, não a página inicial.
      return void res.writeHead(404, { 'content-type': 'text/plain' }).end('nao encontrado');
    }
    if (!existsSync(arquivo)) return void res.writeHead(404).end('nao encontrado');

    const ext = extname(arquivo).toLowerCase();

    // Comprimir texto é obrigatório aqui: Vercel, Netlify e Cloudflare fazem
    // isso por padrão, e medir sem compressão daria um número que não
    // corresponde a nada que o visitante vai encontrar.
    const comprimivel = ['.html', '.js', '.css', '.json', '.svg', '.webmanifest', '.txt'].includes(ext);
    const aceitaGzip = /\bgzip\b/.test(req.headers['accept-encoding'] ?? '');

    res.writeHead(200, {
      'content-type': MIME[ext] ?? 'application/octet-stream',
      // Aproxima o host real: imutável para o que tem hash no nome.
      'cache-control': /-[A-Z0-9]{8}\./.test(arquivo)
        ? 'public, max-age=31536000, immutable'
        : 'no-cache',
      ...(comprimivel && aceitaGzip ? { 'content-encoding': 'gzip', vary: 'Accept-Encoding' } : {}),
    });

    const fluxo = createReadStream(arquivo);
    if (comprimivel && aceitaGzip) fluxo.pipe(createGzip({ level: 6 })).pipe(res);
    else fluxo.pipe(res);
  });
  return new Promise((ok) => servidor.listen(PORTA, '127.0.0.1', () => ok(servidor)));
}

const PERFIS = [
  { nome: 'desktop', preset: 'desktop' },
  { nome: 'celular', preset: undefined },
];

async function main() {
  if (!existsSync(pasta)) {
    console.error('Build não encontrado. Rode "npm run build" antes.');
    process.exit(1);
  }
  await mkdir(saida, { recursive: true });

  const servidor = await servir();
  // O Lighthouse precisa de uma porta de depuração; o Playwright entrega
  // uma instância do Edge já pronta e a fecha direito no fim.
  const navegador = await chromium.launch({
    channel: 'msedge',
    args: ['--remote-debugging-port=9333'],
  });

  const resumo = [];

  for (const perfil of PERFIS) {
    const resultado = await lighthouse(
      `http://127.0.0.1:${PORTA}/`,
      {
        port: 9333,
        output: ['html', 'json'],
        logLevel: 'error',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      },
      perfil.preset === 'desktop'
        ? {
            extends: 'lighthouse:default',
            settings: {
              formFactor: 'desktop',
              screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1 },
              throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 },
            },
          }
        : undefined,
    );

    const { categories, audits } = resultado.lhr;
    await writeFile(join(saida, `${perfil.nome}.report.html`), resultado.report[0], 'utf8');
    await writeFile(join(saida, `${perfil.nome}.report.json`), resultado.report[1], 'utf8');

    resumo.push({
      perfil: perfil.nome,
      performance: Math.round(categories.performance.score * 100),
      acessibilidade: Math.round(categories.accessibility.score * 100),
      praticas: Math.round(categories['best-practices'].score * 100),
      seo: Math.round(categories.seo.score * 100),
      lcp: audits['largest-contentful-paint'].displayValue,
      cls: audits['cumulative-layout-shift'].displayValue,
      tbt: audits['total-blocking-time'].displayValue,
    });
  }

  await navegador.close();
  servidor.close();

  console.log('\n| perfil   | perf | a11y | boas práticas | seo | LCP | CLS | TBT |');
  console.log('| -------- | ---: | ---: | ------------: | --: | --- | --- | --- |');
  for (const r of resumo) {
    console.log(
      `| ${r.perfil.padEnd(8)} | ${String(r.performance).padStart(4)} | ${String(r.acessibilidade).padStart(4)} | ` +
        `${String(r.praticas).padStart(13)} | ${String(r.seo).padStart(3)} | ${r.lcp} | ${r.cls} | ${r.tbt} |`,
    );
  }
  console.log(`\nRelatórios completos em auditoria/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
