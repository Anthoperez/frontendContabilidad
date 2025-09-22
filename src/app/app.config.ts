import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'; // Para la API
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'; // Para Materialng gen

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),      // <-- AÑADE ESTA LÍNEA
    provideAnimationsAsync()  // <-- AÑADE ESTA LÍNEA
  ]
};
