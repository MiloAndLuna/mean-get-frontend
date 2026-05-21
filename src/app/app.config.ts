// ============================================================
// ARCHIVO: src/app/app.config.ts
// PROPÓSITO: Configuración central del inyector de dependencias.
// En Angular 17+ Standalone, este archivo reemplaza al AppModule.
// Aquí se registran todos los proveedores globales de la app.
// ============================================================

import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

// Firebase
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';

// Rutas y configuración de Firebase
import { routes } from './app.routes';
import { firebaseConfig } from '../environments/firebase';

// ── Chart.js: registro COMPLETO mediante el helper de ng2-charts v9 ──────────
// ng2-charts v9 expone provideCharts() + withDefaultRegisterables() que
// registran internamente TODOS los controladores y elementos de Chart.js:
//   BarController, LineController, DoughnutController, PieController...
//   BarElement, ArcElement, LineElement, PointElement...
//   CategoryScale, LinearScale, LogarithmicScale...
//   Title, Tooltip, Legend, Filler...
//
// Antes (manual) registrábamos solo BarElement y ArcElement,
// pero olvidamos BarController y DoughnutController → error
// "X is not a registered controller".
// La solución definitiva es dejar que ng2-charts registre todo con su provider.
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

/**
 * appConfig
 * Configuración principal que se pasa a bootstrapApplication() en main.ts.
 * providers: array de servicios globales disponibles en toda la aplicación.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // 1. ROUTER: Sistema de navegación con rutas lazy-loaded
    provideRouter(routes),

    // 2. HTTP CLIENT: Habilita HttpClient en servicios y componentes
    // withFetch() usa la Fetch API nativa (más moderna que XMLHttpRequest)
    provideHttpClient(withFetch()),

    // 3. ANIMACIONES: Requeridas por algunos componentes de Bootstrap/Angular
    provideAnimations(),

    // 4. FIREBASE APP: Inicializa el SDK con las credenciales del proyecto
    provideFirebaseApp(() => initializeApp(firebaseConfig)),

    // 5. FIREBASE AUTH: Habilita el servicio de autenticación (Google SSO + email/pass)
    provideAuth(() => getAuth()),

    // 6. CHARTS: Registra automáticamente todos los controladores y escalas de Chart.js.
    // withDefaultRegisterables() equivale a importar y registrar manualmente:
    // BarController, DoughnutController, LineController, PieController,
    // BarElement, ArcElement, LineElement, PointElement,
    // CategoryScale, LinearScale, Title, Tooltip, Legend, Filler...
    provideCharts(withDefaultRegisterables()),
  ],
};
