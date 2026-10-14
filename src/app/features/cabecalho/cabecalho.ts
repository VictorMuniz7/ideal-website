import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SITE, linkWhatsapp } from '../../core/config/site.config';
import { Icone } from '../../shared/icone/icone';

/** Abaixo desta largura a navegação vira menu recolhível. */
const CONSULTA_MOVEL = '(max-width: 55.99rem)';

@Component({
  selector: 'app-cabecalho',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icone],
  templateUrl: './cabecalho.html',
  styleUrl: './cabecalho.scss',
  host: { '(document:keydown.escape)': 'fecharComEsc()' },
})
export class Cabecalho {
  protected readonly site = SITE;
  protected readonly whats = linkWhatsapp(SITE.mensagens.padrao);

  protected readonly aberto = signal(false);
  /** No servidor assume desktop; o CSS já esconde o painel no celular antes da hidratação. */
  protected readonly movel = signal(false);

  private readonly botao = viewChild.required<ElementRef<HTMLButtonElement>>('botaoMenu');
  private readonly navegador = isPlatformBrowser(inject(PLATFORM_ID));

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const consulta = matchMedia(CONSULTA_MOVEL);
      const atualizar = () => {
        this.movel.set(consulta.matches);
        if (!consulta.matches) this.aberto.set(false);
      };
      atualizar();
      consulta.addEventListener('change', atualizar);
      destroyRef.onDestroy(() => consulta.removeEventListener('change', atualizar));
    });
  }

  protected alternar(): void {
    this.aberto.update((v) => !v);
  }

  protected fechar(): void {
    this.aberto.set(false);
  }

  protected fecharComEsc(): void {
    if (!this.aberto()) return;
    this.aberto.set(false);
    if (this.navegador) this.botao().nativeElement.focus();
  }
}
