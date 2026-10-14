import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SITE, linkWhatsapp } from '../../core/config/site.config';
import { Icone } from '../../shared/icone/icone';

@Component({
  selector: 'app-duvidas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icone],
  templateUrl: './duvidas.html',
  styleUrl: './duvidas.scss',
})
export class Duvidas {
  protected readonly duvidas = SITE.duvidas;
  protected readonly whats = linkWhatsapp(SITE.mensagens.duvidas);
}
