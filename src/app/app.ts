import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SeoService } from './core/seo/seo.service';
import { Cabecalho } from './features/cabecalho/cabecalho';
import { Heroi } from './features/heroi/heroi';
import { Sobre } from './features/sobre/sobre';
import { Analises } from './features/analises/analises';
import { Coleta } from './features/coleta/coleta';
import { Duvidas } from './features/duvidas/duvidas';
import { Contato } from './features/contato/contato';
import { Rodape } from './features/rodape/rodape';
import { WhatsappFlutuante } from './features/whatsapp-flutuante/whatsapp-flutuante';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Cabecalho, Heroi, Sobre, Analises, Coleta, Duvidas, Contato, Rodape, WhatsappFlutuante],
  templateUrl: './app.html',
})
export class App {
  constructor() {
    inject(SeoService).aplicar();
  }
}
