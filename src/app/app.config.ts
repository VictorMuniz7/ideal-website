import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration, withNoIncrementalHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  // Página única, sem rotas e sem blocos `@defer`: a hidratação incremental não
  // traria ganho e injetaria um script inline de captura de eventos a mais.
  providers: [provideBrowserGlobalErrorListeners(), provideClientHydration(withNoIncrementalHydration())],
};
