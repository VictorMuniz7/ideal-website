import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SITE } from '../../core/config/site.config';

@Component({
  selector: 'app-rodape',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './rodape.html',
  styleUrl: './rodape.scss',
})
export class Rodape {
  protected readonly site = SITE;
  protected readonly ano = new Date().getFullYear();
}
