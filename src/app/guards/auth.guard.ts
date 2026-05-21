// ============================================================
// ARCHIVO: src/app/guards/auth.guard.ts
// PROPÓSITO: Guard de autenticación para proteger rutas privadas.
// Impide que usuarios no autenticados accedan al dashboard.
// Se ejecuta ANTES de renderizar el componente de la ruta.
// ============================================================

import { inject } from '@angular/core';

// CanActivateFn: tipo moderno de guard en Angular 17+ (sin clases)
import { CanActivateFn, Router } from '@angular/router';

// Importamos nuestro servicio de autenticación
import { AuthService } from '../services/auth.service';

// Operadores RxJS para transformar el Observable del usuario
import { map, take } from 'rxjs';

/**
 * authGuard
 * Función guard que verifica si hay un usuario autenticado.
 * Si hay sesión → permite el acceso a la ruta.
 * Si no hay sesión → redirige a /login y bloquea el acceso.
 *
 * Angular 17+ usa CanActivateFn en lugar de clases que implementan CanActivate.
 * La función se usa directamente en app.routes.ts con canActivate: [authGuard].
 */
export const authGuard: CanActivateFn = () => {
  // Inyectamos los servicios necesarios dentro de la función
  // (no en constructor porque es una función, no una clase)
  const authService = inject(AuthService);
  const router = inject(Router);

  // Nos suscribimos al Observable user$ del AuthService
  return authService.user$.pipe(
    // take(1): toma solo la primera emisión y completa el Observable
    // Esto evita suscripciones infinitas en el guard
    take(1),

    // map: transforma cada valor emitido por el Observable
    // user → puede ser un objeto User o null
    map((user) => {
      if (user) {
        // Si hay usuario autenticado → retornamos true para permitir el acceso
        return true;
      } else {
        // Si NO hay usuario → redirigimos a /login y bloqueamos el acceso
        // router.createUrlTree(['/login']) crea la URL de redirección
        return router.createUrlTree(['/login']);
      }
    })
  );
};
