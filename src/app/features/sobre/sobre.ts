import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SITE } from '../../core/config/site.config';
import { Icone } from '../../shared/icone/icone';

@Component({
  selector: 'app-sobre',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icone],
  templateUrl: './sobre.html',
  styleUrl: './sobre.scss',
})
export class Sobre {
  protected readonly sobre = SITE.sobre;
  protected readonly endereco = SITE.endereco;
  protected readonly horarios = SITE.horarios;
}
