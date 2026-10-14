import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Ilustração do passo 1 (o folheto original não tem desenho para ele):
 * uma área dividida em glebas — alto, encosta e baixada — no mesmo traço
 * das ilustrações escaneadas dos outros passos.
 */
@Component({
  selector: 'app-mapa-glebas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
      width: 100%;
      max-width: 22rem;
    }
    svg {
      width: 100%;
      height: 100%;
    }
    text {
      font-family: var(--fonte-corpo);
      font-size: 15px;
      font-weight: 700;
    }
  `,
  template: `
    <svg viewBox="0 0 360 250" role="img" [attr.aria-label]="descricao()">
      <defs>
        <pattern id="gleba-hachura" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M0 0 V10" stroke="#0b4f5c" stroke-width="1.6" opacity="0.55" />
        </pattern>
        <pattern id="gleba-pontos" width="12" height="12" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1.5" fill="#0b4f5c" opacity="0.6" />
          <circle cx="9" cy="9" r="1.1" fill="#0b4f5c" opacity="0.5" />
        </pattern>
        <pattern id="gleba-ondas" width="24" height="12" patternUnits="userSpaceOnUse">
          <path d="M0 6 Q6 1 12 6 T24 6" fill="none" stroke="#0b4f5c" stroke-width="1.5" opacity="0.55" />
        </pattern>
      </defs>

      <g stroke="#0b4f5c" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <path d="M30 40 L120 18 L250 26 L332 54 L326 150 L340 222 L210 236 L70 228 L22 196 L36 120 Z" fill="url(#gleba-hachura)" />
        <path d="M33 110 C 110 90 200 128 330 96 L326 150 L340 222 L210 236 L70 228 L22 196 L36 120 Z" fill="#ffffff" />
        <path d="M33 110 C 110 90 200 128 330 96 L326 150 L340 222 L210 236 L70 228 L22 196 L36 120 Z" fill="url(#gleba-pontos)" />
        <path d="M28 172 C 120 152 220 186 334 160 L340 222 L210 236 L70 228 L22 196 Z" fill="#ffffff" />
        <path d="M28 172 C 120 152 220 186 334 160 L340 222 L210 236 L70 228 L22 196 Z" fill="url(#gleba-ondas)" />
      </g>

      @for (r of posicoes; track r.y; let i = $index) {
        <g [attr.transform]="'translate(' + r.x + ' ' + r.y + ')'">
          <rect x="-48" y="-14" width="96" height="26" rx="13" fill="#0b4f5c" />
          <text x="0" y="4" text-anchor="middle" fill="#ffffff">{{ rotulos()[i] }}</text>
        </g>
      }
    </svg>
  `,
})
export class MapaGlebas {
  readonly rotulos = input.required<readonly string[]>();
  readonly descricao = input.required<string>();

  protected readonly posicoes = [
    { x: 180, y: 64 },
    { x: 180, y: 140 },
    { x: 180, y: 204 },
  ];
}
