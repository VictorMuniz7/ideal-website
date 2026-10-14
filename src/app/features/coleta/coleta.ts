import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SITE, linkWhatsapp } from '../../core/config/site.config';
import { Icone } from '../../shared/icone/icone';
import { MapaGlebas } from './mapa-glebas';

@Component({
  selector: 'app-coleta',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icone, MapaGlebas],
  templateUrl: './coleta.html',
  styleUrl: './coleta.scss',
})
export class Coleta {
  protected readonly coleta = SITE.coleta;
  protected readonly whats = linkWhatsapp(SITE.mensagens.coleta);

  /** Largura e altura intrínsecas de cada ilustração, a partir da proporção do config (evita CLS). */
  protected readonly passos = SITE.coleta.passos.map((p) => {
    const [largura, altura] = (p.proporcao ?? '1 / 1').split('/').map((n) => Number(n.trim()));
    return { ...p, largura, altura };
  });
}
