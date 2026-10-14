import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SITE, linkWhatsapp } from '../../core/config/site.config';
import { Icone } from '../../shared/icone/icone';

@Component({
  selector: 'app-whatsapp-flutuante',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icone],
  // Landmark próprio: o atalho fica fora do <main> e do <footer>, mas não "solto" na página.
  host: { role: 'complementary', '[attr.aria-label]': 'rotulo' },
  template: `
    <a class="flutuante" [href]="whats" target="_blank" rel="noopener">
      <app-icone nome="whatsapp" />
      <span class="sr-only">Conversar com a {{ nome }} pelo WhatsApp (abre em nova aba)</span>
    </a>
  `,
  styles: `
    .flutuante {
      position: fixed;
      z-index: 40;
      right: max(1rem, env(safe-area-inset-right));
      bottom: max(1rem, env(safe-area-inset-bottom));
      display: grid;
      place-items: center;
      width: 3.75rem;
      height: 3.75rem;
      border-radius: 999px;
      background: var(--whats);
      color: #fff;
      box-shadow: 0 10px 24px -8px rgb(20 108 58 / 55%);
      transition:
        transform 0.18s ease,
        background-color 0.18s ease;

      &:hover {
        background: var(--whats-hover);
        transform: scale(1.06);
      }

      &:focus-visible {
        outline-color: var(--tinta);
      }
    }
    app-icone {
      width: 2rem;
      height: 2rem;
    }
  `,
})
export class WhatsappFlutuante {
  protected readonly nome = SITE.empresa.nome;
  protected readonly rotulo = 'Atalho para o WhatsApp';
  protected readonly whats = linkWhatsapp(SITE.mensagens.padrao);
}
