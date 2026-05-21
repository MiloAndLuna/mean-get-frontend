// ============================================================
// ARCHIVO: src/app/app.routes.ts
// PROPÓSITO: Define todas las rutas de la aplicación Angular.
// El Router de Angular usa esta configuración para saber qué
// componente renderizar según la URL del navegador.
// ============================================================

// Routes: tipo de dato que es un array de objetos de ruta
import { Routes } from '@angular/router';

// Importamos el guard de autenticación para proteger el dashboard
import { authGuard } from './guards/auth.guard';

/**
 * routes
 * Array de rutas de la aplicación.
 * Cada objeto define: path (URL), component (qué renderizar),
 * y opcionalmente canActivate (guardianes de acceso).
 */
export const routes: Routes = [
  {
    // Ruta vacía ('') → redirige automáticamente al dashboard
    // pathMatch: 'full' → solo redirige si la URL es exactamente ''
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    // Ruta pública: formulario de login con Google SSO
    // No requiere autenticación — cualquiera puede acceder
    path: 'login',
    // loadComponent: carga el componente de forma LAZY (solo cuando se necesita)
    // Esto optimiza el bundle inicial → la app carga más rápido
    loadComponent: () =>
      import('./components/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    // Ruta privada: panel principal del inventario
    // canActivate: [authGuard] → el guard verifica autenticación ANTES de renderizar
    // Si el usuario no está autenticado, el guard redirige a /login
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    canActivate: [authGuard], // Protección de ruta: requiere login
  },
  {
    // Wildcard: captura cualquier URL que no coincida con las anteriores
    // Redirige al dashboard (que a su vez usa el guard)
    path: '**',
    redirectTo: 'dashboard',
  },
];
