/**
 * Confere o build de produção num navegador de verdade.
 *
 *   npm run build && npm run conferir
 *
 * Em cada largura (320, 390, 768, 1024, 1440 e 2560):
 *   - erros no console e requisições que falharam;
 *   - rolagem horizontal, medida no documento inteiro;
 *   - acessibilidade com axe-core (WCAG 2.x A e AA);
 *   - prints em .conferencia/ para inspeção visual.
 * Depois, as interações: menu móvel (inert + Esc), mapa sob demanda e FAQ.
 */

import { createServer } from 'node:http';
import { createReadStream, existsSync } from 'node:fs';
import { mkdir, stat } from 'node:fs/promises';
import { extname, join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pasta = join(raiz, 'dist', 'ideal', 'browser');
const saida = join(raiz, '.conferencia');
const PORTA = 4899;
const ORIGEM = `http://127.0.0.1:${PORTA}`;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
};

function servir() {
  const servidor = createServer(async (req, res) => {
    const caminho = decodeURIComponent((req.url ?? '/').split('?')[0]);
    let arquivo = join(pasta, caminho);
    try {
      if ((await stat(arquivo)).isDirectory()) arquivo = join(arquivo, 'index.html');
    } catch {
      return void res.writeHead(404).end('nao encontrado');
    }
    res.writeHead(200, {
      'content-type': MIME[extname(arquivo).toLowerCase()] ?? 'application/octet-stream',
      'cache-control': 'no-store',
    });
    createReadStream(arquivo).pipe(res);
  });
  return new Promise((ok) => servidor.listen(PORTA, '127.0.0.1', () => ok(servidor)));
}

const LARGURAS = [
  { nome: '320', largura: 320, altura: 720, movel: true },
  { nome: '390', largura: 390, altura: 844, movel: true },
  { nome: '768', largura: 768, altura: 1024, movel: true },
  { nome: '1024', largura: 1024, altura: 768, movel: false },
  { nome: '1440', largura: 1440, altura: 900, movel: false },
  { nome: '2560', largura: 2560, altura: 1440, movel: false },
];

const problemas = [];
const anota = (cond, texto) => {
  if (!cond) problemas.push(texto);
};

function vigiar(pagina, erros) {
  pagina.on('console', (m) => m.type() === 'error' && erros.push(m.text()));
  pagina.on('pageerror', (e) => erros.push(`pageerror: ${e.message}`));
  pagina.on('requestfailed', (r) => erros.push(`falhou: ${r.url()} — ${r.failure()?.errorText}`));
  // Nada de terceiros por padrão: qualquer requisição para fora é problema.
  pagina.on('request', (r) => {
    if (!r.url().startsWith(ORIGEM) && !r.url().startsWith('data:')) erros.push(`terceiro: ${r.url()}`);
  });
}

async function conferirLargura(navegador, c) {
  const contexto = await navegador.newContext({
    viewport: { width: c.largura, height: c.altura },
    deviceScaleFactor: c.movel ? 2 : 1,
    isMobile: c.movel && c.largura < 700,
    hasTouch: c.movel,
    locale: 'pt-BR',
    reducedMotion: 'reduce',
  });
  const pagina = await contexto.newPage();
  const erros = [];
  vigiar(pagina, erros);

  await pagina.goto(`${ORIGEM}/`, { waitUntil: 'networkidle' });
  await pagina.evaluate(() => document.fonts.ready);

  const excedente = await pagina.evaluate(() => {
    const doc = document.documentElement;
    const largos = [...document.querySelectorAll('body *')]
      .filter((el) => el.getBoundingClientRect().right > doc.clientWidth + 1)
      .slice(0, 5)
      .map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].join('.')}`);
    return { px: doc.scrollWidth - doc.clientWidth, largos };
  });
  anota(excedente.px <= 0, `[${c.nome}] rolagem horizontal de ${excedente.px}px (${excedente.largos.join(', ')})`);

  await pagina.screenshot({ path: join(saida, `${c.nome}-topo.png`) });

  // Rola até o fim para as imagens com loading="lazy" carregarem antes do print inteiro.
  await pagina.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight * 0.8) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await pagina.waitForLoadState('networkidle');
  await pagina.screenshot({ path: join(saida, `${c.nome}-inteira.png`), fullPage: true });

  const axe = await new AxeBuilder({ page: pagina }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze();
  for (const v of axe.violations) {
    problemas.push(`[${c.nome}] axe ${v.id} (${v.impact}): ${v.help} — ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`);
  }

  if (erros.length) problemas.push(`[${c.nome}] console/rede:\n    ${[...new Set(erros)].join('\n    ')}`);
  await contexto.close();
  console.log(`[ok] ${c.nome}px — axe: ${axe.violations.length} violação(ões)`);
}

async function conferirInteracoes(navegador) {
  // ---- celular: menu ----
  const ctxM = await navegador.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'pt-BR' });
  const m = await ctxM.newPage();
  const erros = [];
  m.on('pageerror', (e) => erros.push(e.message));
  await m.goto(`${ORIGEM}/`, { waitUntil: 'networkidle' });
  await m.waitForTimeout(500);

  anota((await m.getAttribute('#painel-menu', 'inert')) !== null, '[menu] painel fechado não está inerte');
  await m.getByRole('button', { name: 'Abrir menu' }).click();
  await m.waitForTimeout(400);
  anota((await m.getAttribute('#painel-menu', 'inert')) === null, '[menu] painel continuou inerte depois de abrir');
  await m.screenshot({ path: join(saida, 'interacao-menu.png') });
  await m.keyboard.press('Escape');
  await m.waitForTimeout(400);
  anota((await m.getAttribute('#painel-menu', 'inert')) !== null, '[menu] Esc não fechou o menu');
  anota(
    await m.evaluate(() => document.activeElement?.classList.contains('cabecalho__alternar')),
    '[menu] o foco não voltou para o botão do menu depois do Esc',
  );

  // link do menu fecha o painel
  await m.getByRole('button', { name: 'Abrir menu' }).click();
  await m.waitForTimeout(300);
  await m.locator('#painel-menu').getByRole('link', { name: 'Como coletar' }).click();
  await m.waitForTimeout(500);
  anota((await m.getAttribute('#painel-menu', 'inert')) !== null, '[menu] clicar num link não fechou o menu');
  await ctxM.close();

  // ---- desktop: painel visível e sem inert, FAQ, mapa, WhatsApp ----
  const ctx = await navegador.newContext({ viewport: { width: 1440, height: 900 }, locale: 'pt-BR' });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => erros.push(e.message));
  await p.goto(`${ORIGEM}/`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(500);
  anota((await p.getAttribute('#painel-menu', 'inert')) === null, '[desktop] navegação ficou inerte no desktop');

  const primeira = p.locator('details.duvida').first();
  await primeira.locator('summary').click();
  anota((await primeira.getAttribute('open')) !== null, '[faq] a pergunta não abriu');

  // mapa: nenhum iframe até o clique; depois, iframe do Google com foco
  anota((await p.locator('iframe').count()) === 0, '[mapa] iframe carregado antes do clique');
  await p.getByRole('button', { name: /Mostrar mapa/ }).click();
  await p.waitForTimeout(400);
  anota((await p.locator('iframe[src^="https://www.google.com/maps/embed"]').count()) === 1, '[mapa] iframe não apareceu após o clique');
  anota(await p.evaluate(() => document.activeElement?.tagName === 'IFRAME'), '[mapa] o foco não foi para o mapa');
  await p.locator('#contato').screenshot({ path: join(saida, 'interacao-mapa.png') });

  // todos os links de WhatsApp levam ao número certo, com mensagem
  const whats = await p.locator('a[href^="https://wa.me/"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  anota(whats.length >= 8, `[whats] só ${whats.length} link(s) de WhatsApp`);
  for (const href of whats) {
    anota(href.startsWith('https://wa.me/5515991287775?text='), `[whats] link fora do padrão: ${href}`);
  }

  // links que abrem nova aba avisam no nome acessível
  const semAviso = await p.locator('a[target="_blank"]').evaluateAll((as) =>
    as.filter((a) => !/nova aba/i.test(a.textContent ?? '')).map((a) => a.getAttribute('href')),
  );
  anota(semAviso.length === 0, `[a11y] links de nova aba sem aviso: ${semAviso.join(', ')}`);

  // PDF do guia existe
  const pdf = await p.request.get(`${ORIGEM}/guia-coleta-de-solo.pdf`);
  anota(pdf.ok(), '[pdf] guia de coleta não encontrado no build');

  await ctx.close();
  if (erros.length) problemas.push(`[interação] console:\n    ${[...new Set(erros)].join('\n    ')}`);
  console.log('[ok] interações');
}

async function conferirSemJs(navegador) {
  // O conteúdo precisa estar no HTML pré-renderizado.
  const ctx = await navegador.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(`${ORIGEM}/`);
  const texto = await p.locator('body').innerText();
  for (const trecho of ['Conheça o seu solo', 'Divida a área em glebas', 'Quanto tempo demora o resultado?', '(15) 3227-1120']) {
    anota(texto.includes(trecho), `[ssg] "${trecho}" não está no HTML sem JavaScript`);
  }
  await ctx.close();
  console.log('[ok] HTML sem JavaScript');
}

async function main() {
  if (!existsSync(pasta)) {
    console.error(`Build não encontrado em ${pasta}. Rode "npm run build" antes.`);
    process.exit(1);
  }
  await mkdir(saida, { recursive: true });

  const servidor = await servir();
  const navegador = await chromium.launch({ channel: 'msedge' });

  for (const c of LARGURAS) await conferirLargura(navegador, c);
  await conferirInteracoes(navegador);
  await conferirSemJs(navegador);

  await navegador.close();
  servidor.close();

  console.log('');
  if (problemas.length) {
    console.log(`${problemas.length} problema(s):\n`);
    for (const p of problemas) console.log(' - ' + p);
    process.exitCode = 1;
  } else {
    console.log('Nenhum problema encontrado.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
