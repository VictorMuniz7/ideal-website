import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SITE, linkWhatsapp } from '../../core/config/site.config';
import { Icone } from '../../shared/icone/icone';

@Component({
  selector: 'app-contato',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icone],
  templateUrl: './contato.html',
  styleUrl: './contato.scss',
})
export class Contato {
  protected readonly site = SITE;
  protected readonly textos = SITE.contatoSecao;
  protected readonly whats = linkWhatsapp(SITE.mensagens.contato);
  /** O e-mail é longo para cartões estreitos: quebra só antes do @, nunca no meio. */
  protected readonly emailUsuario = SITE.contato.email.split('@')[0];
  protected readonly emailDominio = SITE.contato.email.split('@')[1];

  /**
   * O mapa do Google só é carregado quando o visitante pede: sem isso, toda
   * visita baixaria scripts e cookies de terceiros, mesmo de quem nunca olha
   * o mapa. Enquanto isso, os links "Abrir no Google Maps" e "Traçar rota"
   * resolvem sem carregar nada.
   */
  protected readonly mapaAtivo = signal(false);
  protected readonly urlMapa = inject(DomSanitizer).bypassSecurityTrustResourceUrl(SITE.endereco.mapaEmbed);

  private readonly injector = inject(Injector);
  private readonly iframe = viewChild<ElementRef<HTMLIFrameElement>>('iframeMapa');

  protected mostrarMapa(): void {
    this.mapaAtivo.set(true);
    // O botão some junto com a capa: o foco segue para o mapa, sem se perder.
    afterNextRender(() => this.iframe()?.nativeElement.focus(), { injector: this.injector });
  }
}
