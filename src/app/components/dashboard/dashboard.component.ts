// ============================================================
// ARCHIVO: src/app/components/dashboard/dashboard.component.ts
// PROPÓSITO: Componente principal del dashboard.
// Orquesta los datos del usuario, las métricas KPI y los
// componentes hijos (tabla CRUD y gráficas).
// Es el "cerebro" de la aplicación post-login.
// ============================================================

import { Component, OnInit, OnDestroy, inject } from '@angular/core';

// CommonModule: proporciona directivas como @if, @for en templates
import { CommonModule } from '@angular/common';

// Router y RouterModule para navegación
import { Router } from '@angular/router';

// Subscription: para cancelar suscripciones y evitar memory leaks
import { Subscription } from 'rxjs';

// Servicios propios
import { AuthService } from '../../services/auth.service';
import { InventoryService } from '../../services/inventory.service';

// Interface del modelo de datos
import { InventoryItem } from '../../interfaces/inventory-item';

// Componentes hijos que se renderizarán en el template
import { InventoryCrudComponent } from '../inventory-crud/inventory-crud.component';
import { ChartsComponent } from '../charts/charts.component';

// User de Firebase para tipar el usuario actual
import { User } from 'firebase/auth';

/**
 * @Component
 * standalone: true → Angular 17+ sin NgModules
 * imports: lista de dependencias del template (otros componentes, directivas, pipes)
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,        // Necesario para @if, @for en el template
    InventoryCrudComponent, // Componente de tabla + formulario CRUD
    ChartsComponent,     // Componente de gráficas estadísticas
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Inyectamos los servicios con inject()
  private authService = inject(AuthService);
  private inventoryService = inject(InventoryService);
  private router = inject(Router);

  // ──────────────────────────────────────────────────
  // ESTADO DEL COMPONENTE (propiedades reactivas)
  // ──────────────────────────────────────────────────

  // currentUser: usuario autenticado de Firebase
  currentUser: User | null = null;

  // items: lista de productos del inventario del usuario
  items: InventoryItem[] = [];

  // isLoading: controla el spinner de carga inicial
  isLoading = true;

  // Suscripciones que debemos cancelar cuando el componente se destruye
  private userSub?: Subscription;
  private inventorySub?: Subscription;

  // ──────────────────────────────────────────────────
  // MÉTRICAS KPI (calculadas a partir de items)
  // ──────────────────────────────────────────────────

  // totalRegistros: cantidad total de productos en el inventario
  get totalRegistros(): number {
    return this.items.length;
  }

  // ultimaActualizacion: fecha del registro más reciente
  get ultimaActualizacion(): string {
    if (this.items.length === 0) return 'Sin registros';

    // Ordenamos por createdAt y tomamos el más reciente
    const sorted = [...this.items].sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    );

    // Formateamos la fecha en español con formato legible
    return new Date(sorted[0].createdAt || '').toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  // productoMayorRotacion: producto con más salidas (mayor movimiento)
  get productoMayorRotacion(): string {
    if (this.items.length === 0) return 'N/A';

    // Reduce encuentra el item con más salidas comparando de a pares
    const maximo = this.items.reduce((prev, current) =>
      prev.salidas > current.salidas ? prev : current
    );

    return maximo.producto;
  }

  // productosEnRiesgo: count de productos Críticos + Agotados
  get productosEnRiesgo(): number {
    return this.items.filter(
      (item) => item.estado === 'Crítico' || item.estado === 'Agotado'
    ).length;
  }

  // ──────────────────────────────────────────────────
  // LIFECYCLE HOOKS
  // ──────────────────────────────────────────────────

  /**
   * ngOnInit
   * Se ejecuta una vez cuando el componente se inicializa.
   * Aquí obtenemos el usuario actual y cargamos el inventario.
   */
  ngOnInit(): void {
    // Nos suscribimos al Observable del usuario
    this.userSub = this.authService.user$.subscribe((user) => {
      this.currentUser = user;

      if (user) {
        // Si hay usuario autenticado, cargamos su inventario
        this.loadInventario(user.uid);
      } else {
        // Si no hay usuario, redirigimos al login
        this.router.navigate(['/login']);
      }
    });
  }

  /**
   * ngOnDestroy
   * Se ejecuta cuando el componente se elimina del DOM.
   * IMPORTANTE: Debemos cancelar todas las suscripciones para
   * evitar memory leaks (el componente ya no existe pero la
   * suscripción seguiría ejecutándose en segundo plano).
   */
  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
    this.inventorySub?.unsubscribe();
  }

  // ──────────────────────────────────────────────────
  // MÉTODOS PÚBLICOS
  // ──────────────────────────────────────────────────

  /**
   * loadInventario
   * Llama al servicio para obtener los productos del usuario.
   * @param uid - Firebase UID del usuario para filtrar en el backend
   */
  loadInventario(uid: string): void {
    this.isLoading = true;

    // Nos suscribimos al Observable retornado por el servicio
    this.inventorySub = this.inventoryService.getInventario(uid).subscribe({
      // next: se ejecuta cuando llegan los datos del backend
      next: (data) => {
        this.items = data; // Actualizamos la lista de productos
        this.isLoading = false;
      },
      // error: se ejecuta si hay un error en la petición HTTP
      error: (err) => {
        console.error('Error al cargar inventario:', err);
        this.isLoading = false;
      },
    });
  }

  /**
   * onInventarioChanged
   * Callback que recibe el evento del componente hijo InventoryCrudComponent
   * cuando se crea, edita o elimina un producto.
   * Recarga el inventario para reflejar los cambios.
   */
  onInventarioChanged(): void {
    if (this.currentUser) {
      this.loadInventario(this.currentUser.uid);
    }
  }

  /**
   * logout
   * Cierra la sesión del usuario y redirige al login.
   */
  async logout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
