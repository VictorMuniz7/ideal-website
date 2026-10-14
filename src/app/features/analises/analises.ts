import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SITE, linkWhatsapp } from '../../core/config/site.config';
import { Icone } from '../../shared/icone/icone';

@Component({
  selector: 'app-analises',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icone],
  templateUrl: './analises.html',
  styleUrl: './analises.scss',
})
export class Analises {
  protected readonly analises = SITE.analises;
  protected readonly itens = SITE.analises.itens.map((a) => ({ ...a, whats: linkWhatsapp(a.mensagemWhats) }));
}
