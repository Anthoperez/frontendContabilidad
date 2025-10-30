// src/app/app.config.ts
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'; // Para la API
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'; // Para Material

// ▼▼▼ AÑADIR ESTAS IMPORTACIONES ▼▼▼
import { provideNativeDateAdapter } from '@angular/material/core';
// ▲▲▲ FIN DE LA MODIFICACIÓN ▲▲▲

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),
    
    // ▼▼▼ AÑADIR ESTA LÍNEA ▼▼▼
    provideNativeDateAdapter() // <-- Para el Datepicker en el diálogo
    // ▲▲▲ FIN DE LA MODIFICACIÓN ▲▲▲
  ]
};