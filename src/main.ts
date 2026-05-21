// ============================================================
// ARCHIVO: src/main.ts
// PROPÓSITO: Punto de entrada de la aplicación Angular.
// Es el primer archivo que ejecuta el navegador (referenciado
// en angular.json → "browser": "src/main.ts").
// Inicia el framework Angular con el componente raíz y la configuración.
// ============================================================

// bootstrapApplication: función de Angular 17+ para arrancar apps standalone
// Reemplaza al antiguo platformBrowserDynamic().bootstrapModule(AppModule)
import { bootstrapApplication } from '@angular/platform-browser';

// AppComponent: componente raíz que contiene <router-outlet>
import { AppComponent } from './app/app.component';

// appConfig: configuración del inyector (Router, Firebase, HttpClient, etc.)
import { appConfig } from './app/app.config';

/**
 * bootstrapApplication(AppComponent, appConfig)
 * Arranca la aplicación Angular con:
 * 1. AppComponent como componente raíz (reemplaza <app-root> en index.html)
 * 2. appConfig como configuración de proveedores globales
 *
 * .catch(err => console.error(err)):
 * Captura errores de arranque (Firebase mal configurado, módulo faltante, etc.)
 * y los muestra en la consola del navegador para facilitar el debugging.
 */
bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error('Error al inicializar la aplicación:', err)
);
