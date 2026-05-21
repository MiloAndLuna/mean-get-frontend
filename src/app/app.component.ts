// ============================================================
// ARCHIVO: src/app/app.component.ts
// PROPÓSITO: Componente raíz de la aplicación Angular.
// Es el primer componente que se renderiza. Su template
// contiene el <router-outlet> que actúa como "pantalla" donde
// el Router Angular proyecta el componente de la ruta activa.
// ============================================================

import { Component } from '@angular/core';

// RouterOutlet: directiva que marca dónde se renderiza la vista activa
// El Router inyecta el componente correspondiente a la URL actual aquí
import { RouterOutlet } from '@angular/router';

/**
 * AppComponent
 * Componente shell de la aplicación.
 * No tiene lógica de negocio propia — su único propósito es
 * contener el router-outlet para el sistema de navegación.
 *
 * Selector 'app-root' coincide con <app-root> en index.html.
 */
@Component({
  selector: 'app-root',     // Etiqueta HTML personalizada usada en index.html
  standalone: true,          // Angular 17+: no requiere NgModule
  imports: [RouterOutlet],   // RouterOutlet se importa como dependencia del template
  // Template inline: simple <router-outlet> que renderiza la vista de la ruta activa
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent {
  // El título de la app — puede usarse en el head del HTML
  title = 'Gestión Inteligente de Inventario';
}
