import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SITE, linkWhatsapp } from '../../core/config/site.config';
import { Icone } from '../../shared/icone/icone';
import { PerfilSolo } from './perfil-solo';

@Component({
  selector: 'app-heroi',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icone, PerfilSolo],
  templateUrl: './heroi.html',
  styleUrl: './heroi.scss',
})
export class Heroi {
  protected readonly heroi = SITE.heroi;
  protected readonly whats = linkWhatsapp(SITE.mensagens.heroi);
}
