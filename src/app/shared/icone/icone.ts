import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type NomeIcone =
  | 'whatsapp'
  | 'telefone'
  | 'email'
  | 'instagram'
  | 'local'
  | 'relogio'
  | 'download'
  | 'seta'
  | 'externo'
  | 'mapa'
  | 'menu'
  | 'fechar'
  | 'check'
  | 'quimica'
  | 'fisica'
  | 'ph'
  | 'foliar';

/**
 * Ícones em SVG inline (traço em `currentColor`): acompanham a cor do texto
 * e não geram requisição. Sempre decorativos — o nome acessível fica no
 * elemento que os contém.
 */
@Component({
  selector: 'app-icone',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'icone', 'aria-hidden': 'true' },
  styles: `
    :host {
      display: inline-flex;
      flex: none;
      width: 1em;
      height: 1em;
    }
    svg {
      width: 100%;
      height: 100%;
    }
  `,
  template: `
    @switch (nome()) {
      @case ('whatsapp') {
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.22-8.23 8.22Zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29Z"
          />
        </svg>
      }
      @case ('telefone') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
        </svg>
      }
      @case ('email') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      }
      @case ('instagram') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
        </svg>
      }
      @case ('local') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12Z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
      }
      @case ('relogio') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      }
      @case ('download') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 20h14" />
        </svg>
      }
      @case ('seta') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14m-6-6 6 6-6 6" />
        </svg>
      }
      @case ('externo') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 4h6v6m0-6-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
        </svg>
      }
      @case ('mapa') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2-6-2Zm0 0v14m6-12v14" />
        </svg>
      }
      @case ('menu') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      }
      @case ('fechar') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      }
      @case ('check') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m5 12.5 4.5 4.5L19 7.5" />
        </svg>
      }
      @case ('quimica') {
        <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 4h8M13.5 4v8.5L6.5 25a2 2 0 0 0 1.8 3h15.4a2 2 0 0 0 1.8-3l-7-12.5V4" />
          <path d="M9.5 20h13" />
          <circle cx="14" cy="24" r="1" fill="currentColor" />
          <circle cx="18.5" cy="23" r="1.4" fill="currentColor" />
        </svg>
      }
      @case ('fisica') {
        <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="10" r="4" />
          <circle cx="20" cy="8" r="2.5" />
          <circle cx="24" cy="17" r="3.2" />
          <circle cx="14" cy="19" r="1.6" />
          <circle cx="8" cy="24" r="1" fill="currentColor" />
          <circle cx="18" cy="25" r="0.9" fill="currentColor" />
          <circle cx="23" cy="26" r="0.7" fill="currentColor" />
          <circle cx="12" cy="27" r="0.7" fill="currentColor" />
        </svg>
      }
      @case ('ph') {
        <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 3.5S7 13.5 7 19.5a9 9 0 0 0 18 0c0-6-9-16-9-16Z" />
          <text x="16" y="23" text-anchor="middle" font-family="inherit" font-size="8.5" font-weight="700" fill="currentColor" stroke="none">pH</text>
        </svg>
      }
      @case ('foliar') {
        <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 26C6 14 13 6 27 5c0 13-8 20-19 20" />
          <path d="M6 26 18 14M11 21h5M14 18v-4" />
        </svg>
      }
    }
  `,
})
export class Icone {
  readonly nome = input.required<NomeIcone>();
}
