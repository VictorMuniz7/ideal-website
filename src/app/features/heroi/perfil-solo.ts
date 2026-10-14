import { ChangeDetectionStrategy, Component, input } from '@angular/core';

interface Ponto {
  readonly x: number;
  readonly y: number;
  readonly r: number;
}

/** Gerador pseudoaleatório com semente fixa: o desenho sai igual no servidor e no navegador. */
function sorteio(semente: number): () => number {
  let s = semente;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function pontilhado(qtd: number, x0: number, x1: number, y0: number, y1: number, rMin: number, rMax: number, semente: number): Ponto[] {
  const r = sorteio(semente);
  return Array.from({ length: qtd }, () => ({
    x: Math.round(x0 + r() * (x1 - x0)),
    y: Math.round(y0 + r() * (y1 - y0)),
    r: +(rMin + r() * (rMax - rMin)).toFixed(1),
  }));
}

/**
 * Corte de um perfil de solo em camadas, com a fatia amostrada (um palmo)
 * destacada — o mesmo gesto ensinado no passo a passo de coleta.
 * Puramente ilustrativo: a legenda em texto fica no `figcaption`.
 */
@Component({
  selector: 'app-perfil-solo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
    }
    figure {
      margin: 0;
    }
    svg {
      width: 100%;
      height: auto;
      aspect-ratio: 480 / 470;
    }
    figcaption {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      margin-top: 0.75rem;
      color: var(--texto-suave);
      font-size: 0.9375rem;
      font-weight: 600;
    }
    .marcador {
      width: 1.5rem;
      height: 0.875rem;
      border: 2px dashed var(--acao);
      border-radius: 3px;
      background: var(--turquesa-claro);
      flex: none;
    }
  `,
  template: `
    <figure>
    <svg viewBox="0 0 480 470" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="perfil-bloco">
          <path d="M40 150 C 120 140 200 158 280 148 S 400 142 440 150 L440 440 Q440 466 414 466 L66 466 Q40 466 40 440 Z" />
        </clipPath>
      </defs>

      <circle cx="372" cy="96" r="84" fill="#d6f0f4" />

      <g clip-path="url(#perfil-bloco)">
        <rect x="0" y="120" width="480" height="360" fill="#5a3823" />
        <path d="M0 262 C 90 250 170 276 260 262 S 400 250 480 262 L480 480 L0 480 Z" fill="#8a5a3b" />
        <path d="M0 372 C 100 362 190 386 280 372 S 410 360 480 372 L480 480 L0 480 Z" fill="#b07a4f" />

        @for (p of pontosA; track $index) {
          <circle [attr.cx]="p.x" [attr.cy]="p.y" [attr.r]="p.r" fill="#8a5a3b" />
        }
        @for (p of pontosB; track $index) {
          <circle [attr.cx]="p.x" [attr.cy]="p.y" [attr.r]="p.r" fill="#a8744d" />
        }
        @for (p of pedras; track $index) {
          <ellipse [attr.cx]="p.x" [attr.cy]="p.y" [attr.rx]="p.r * 2.2" [attr.ry]="p.r * 1.5" fill="#cf9f72" />
        }

        <g fill="none" stroke="#e8d6bd" stroke-linecap="round" opacity="0.55">
          <path d="M318 152 C 316 190 330 214 322 250 S 312 300 320 330" stroke-width="3" />
          <path d="M320 190 C 340 210 352 226 372 240" stroke-width="2" />
          <path d="M322 230 C 300 246 292 266 274 284" stroke-width="2" />
          <path d="M318 280 C 336 296 344 316 360 330" stroke-width="1.5" />
          <path d="M210 152 C 212 176 204 196 212 222" stroke-width="2" />
          <path d="M120 152 C 118 172 126 186 122 206" stroke-width="1.5" />
        </g>

        <!-- fatia amostrada -->
        <rect x="104" y="148" width="46" height="114" fill="#ffffff" fill-opacity="0.16" />
        <rect x="104" y="148" width="46" height="114" fill="none" stroke="#17a7c2" stroke-width="4" stroke-dasharray="10 7" />
      </g>

      <!-- marca de profundidade -->
      <g stroke="#0b4f5c" stroke-width="3" stroke-linecap="round" fill="none">
        <path d="M456 150 V 262" />
        <path d="M448 150 H 464 M448 262 H 464" />
      </g>

      <!-- superfície: capim e muda -->
      <g fill="none" stroke="#5c8a3a" stroke-width="3.5" stroke-linecap="round">
        <path d="M60 150 l-6 -18 M66 149 l2 -20 M72 150 l8 -16" />
        <path d="M170 152 l-5 -14 M176 151 l3 -18 M182 152 l7 -13" />
        <path d="M392 146 l-6 -16 M398 146 l2 -19 M404 147 l7 -14" />
      </g>
      <path d="M318 152 C 318 120 316 96 320 70" fill="none" stroke="#4d7a2f" stroke-width="5" stroke-linecap="round" />
      <path d="M319 104 C 294 104 274 90 266 66 C 292 64 312 78 319 104 Z" fill="#5c8a3a" />
      <path d="M320 84 C 340 80 360 62 364 38 C 340 40 322 58 320 84 Z" fill="#6f9e45" />
    </svg>
    <figcaption><span class="marcador"></span>{{ legenda() }}</figcaption>
    </figure>
  `,
})
export class PerfilSolo {
  readonly legenda = input.required<string>();

  protected readonly pontosA = pontilhado(70, 40, 440, 160, 262, 1.2, 2.6, 7);
  protected readonly pontosB = pontilhado(55, 40, 440, 270, 372, 1.2, 2.8, 19);
  protected readonly pedras = pontilhado(14, 50, 430, 388, 456, 2.5, 5, 31);
}
