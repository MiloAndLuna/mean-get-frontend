// ============================================================
// ARCHIVO: src/app/components/inventory-crud/inventory-crud.component.ts
// PROPÓSITO: Componente CRUD del inventario.
// Contiene la tabla de productos y un modal flotante para
// crear y editar productos. Recibe datos del padre (Dashboard)
// vía @Input y notifica cambios al padre vía @Output.
// ============================================================

import {
  Component,
  Input,        // Decorador para recibir datos del componente padre
  Output,       // Decorador para emitir eventos al componente padre
  EventEmitter, // Clase para crear el canal de eventos
  inject,
  OnChanges,    // Lifecycle hook: detecta cambios en los @Input
  SimpleChanges,
} from '@angular/core';

// CommonModule: directivas @if, @for, pipes (DatePipe, etc.)
import { CommonModule } from '@angular/common';

// FormsModule: two-way binding con [(ngModel)] en el formulario
import { FormsModule } from '@angular/forms';

// SweetAlert2: librería para diálogos de confirmación y notificaciones
import Swal from 'sweetalert2';

// Servicios e interfaces
import { InventoryService } from '../../services/inventory.service';
import { InventoryItem } from '../../interfaces/inventory-item';

// User de Firebase (para tipado del @Input)
import { User } from 'firebase/auth';

@Component({
  selector: 'app-inventory-crud',
  standalone: true,
  imports: [
    CommonModule,  // Para @if, @for en el template
    FormsModule,   // Para [(ngModel)] en el formulario
  ],
  templateUrl: './inventory-crud.component.html',
})
export class InventoryCrudComponent implements OnChanges {
  // Inyectamos el servicio de inventario
  private inventoryService = inject(InventoryService);

  // ──────────────────────────────────────────────────
  // @Input: Datos que recibe del componente padre (Dashboard)
  // ──────────────────────────────────────────────────

  // currentUser: usuario autenticado de Firebase
  @Input() currentUser: User | null = null;

  // items: array de productos del inventario del usuario actual
  @Input() items: InventoryItem[] = [];

  // ──────────────────────────────────────────────────
  // @Output: Eventos que emite hacia el componente padre
  // ──────────────────────────────────────────────────

  // inventarioChanged: notifica al padre cuando se crea/edita/elimina
  @Output() inventarioChanged = new EventEmitter<void>();

  // ──────────────────────────────────────────────────
  // ESTADO DEL MODAL
  // ──────────────────────────────────────────────────

  // showModal: controla si el modal flotante está visible o no
  showModal = false;

  // ──────────────────────────────────────────────────
  // ESTADO DE BÚSQUEDA Y FILTROS
  // ──────────────────────────────────────────────────

  // searchText: texto ingresado en la barra de búsqueda por nombre
  searchText = '';

  // filterEstado: estado seleccionado como filtro ('', 'Normal', 'Crítico', 'Agotado')
  filterEstado = '';

  // sortColumn: columna actualmente ordenada ('codigo', 'producto', 'stockInicial', 'stockFinal')
  sortColumn = '';

  // sortDirection: dirección del ordenamiento actual
  sortDirection: 'asc' | 'desc' = 'asc';

  // ──────────────────────────────────────────────────
  // ESTADO DEL FORMULARIO
  // ──────────────────────────────────────────────────

  // Modelo del formulario con los campos capturables por el usuario.
  formData = {
    codigo: '',
    producto: '',
    stockInicial: 0,
    entradas: 0,
    salidas: 0,
  };

  // editingId: almacena el _id del producto en edición (null = modo crear)
  editingId: string | null = null;

  // isSubmitting: evita doble envío mientras se procesa la petición
  isSubmitting = false;

  // errorMessage: muestra errores del backend dentro del modal
  errorMessage = '';

  // ──────────────────────────────────────────────────
  // PROPIEDADES CALCULADAS (GETTERS)
  // ──────────────────────────────────────────────────

  /**
   * stockFinalPreview
   * Vista previa del stockFinal en tiempo real ANTES de guardar.
   * El cálculo definitivo lo hace el backend con el Pre-save Hook.
   */
  get stockFinalPreview(): number {
    return (
      (this.formData.stockInicial || 0) +
      (this.formData.entradas || 0) -
      (this.formData.salidas || 0)
    );
  }

  /**
   * estadoPreview
   * Estado que tendría el producto según el stockFinal calculado.
   */
  get estadoPreview(): string {
    const stock = this.stockFinalPreview;
    if (stock > 10) return 'Normal';
    if (stock > 0) return 'Crítico';
    return 'Agotado';
  }

  /**
   * productosEnRiesgo
   * Cuenta cuántos productos están en estado Crítico o Agotado.
   * Se muestra como badge de alerta en la cabecera de la tabla.
   */
  get productosEnRiesgo(): number {
    return this.items.filter(
      (item) => item.estado === 'Crítico' || item.estado === 'Agotado'
    ).length;
  }

  /**
   * filteredItems
   * Aplica búsqueda por nombre, filtro por estado y ordenamiento.
   * Pasos: 1) filtrar → 2) ordenar → 3) retornar el resultado.
   */
  get filteredItems(): InventoryItem[] {
    const texto = this.searchText.trim().toLowerCase();

    // 1. Filtrado
    let resultado = this.items.filter((item) => {
      const coincideNombre = !texto || item.producto.toLowerCase().includes(texto);
      const coincideEstado = !this.filterEstado || item.estado === this.filterEstado;
      return coincideNombre && coincideEstado;
    });

    // 2. Ordenamiento (solo si hay columna seleccionada)
    if (this.sortColumn) {
      resultado = [...resultado].sort((a, b) => {
        // Obtenemos el valor de cada item para la columna activa
        let valA = a[this.sortColumn as keyof InventoryItem] ?? '';
        let valB = b[this.sortColumn as keyof InventoryItem] ?? '';

        // Comparación insensible a mayúsculas para strings
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return resultado;
  }

  /**
   * sortBy
   * Cambia la columna de ordenamiento o invierte la dirección si ya está activa.
   * @param column - Nombre del campo a ordenar
   */
  sortBy(column: string): void {
    if (this.sortColumn === column) {
      // Misma columna → invertir dirección
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Nueva columna → ordenar ascendente por defecto
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  /**
   * getSortIcon
   * Retorna la clase del ícono Bootstrap según el estado del ordenamiento.
   * @param column - Columna a consultar
   */
  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return 'bi-arrow-up-down text-secondary opacity-50';
    return this.sortDirection === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down';
  }

  // ──────────────────────────────────────────────────
  // LIFECYCLE HOOKS
  // ──────────────────────────────────────────────────

  ngOnChanges(changes: SimpleChanges): void {
    // Reaccionamos cuando el padre actualiza el array de items
    if (changes['items']) {
      // Espacio para validaciones adicionales si se necesitan en el futuro
    }
  }

  // ──────────────────────────────────────────────────
  // MÉTODOS DEL MODAL
  // ──────────────────────────────────────────────────

  /**
   * abrirModalCrear
   * Resetea el formulario y abre el modal en modo "crear".
   */
  abrirModalCrear(): void {
    this.resetForm();
    this.clearMessages();
    this.showModal = true;
    // Bloquea el scroll del body mientras el modal está abierto
    document.body.style.overflow = 'hidden';
  }

  /**
   * cerrarModal
   * Cierra el modal, cancela la edición y restaura el scroll del body.
   */
  cerrarModal(): void {
    this.showModal = false;
    this.resetForm();
    this.clearMessages();
    document.body.style.overflow = '';
  }

  /**
   * limpiarFiltros
   * Resetea el texto de búsqueda y el filtro de estado.
   * Llamado desde el botón "Limpiar filtros" cuando no hay resultados.
   */
  limpiarFiltros(): void {
    this.searchText = '';
    this.filterEstado = '';
  }

  // ──────────────────────────────────────────────────
  // MÉTODOS CRUD
  // ──────────────────────────────────────────────────

  /**
   * onSubmit
   * Maneja el envío del formulario dentro del modal.
   * Decide si crear o actualizar según editingId.
   */
  onSubmit(): void {
    // Validación: el nombre del producto es obligatorio
    if (!this.formData.producto.trim()) {
      this.errorMessage = 'El nombre del producto es obligatorio.';
      return;
    }

    // Validación: el stock final no puede ser negativo
    if (this.stockFinalPreview < 0) {
      this.errorMessage = 'Las salidas no pueden superar el stock disponible.';
      return;
    }

    // Decidir entre crear o actualizar según si hay un ID de edición
    if (this.editingId) {
      this.actualizar();
    } else {
      this.crear();
    }
  }

  /**
   * crear
   * Llama al servicio para crear un nuevo producto en el backend.
   */
  private crear(): void {
    if (!this.currentUser) return;

    this.isSubmitting = true;
    this.clearMessages();

    // Construimos el objeto con los datos del usuario de Firebase
    const nuevoProducto: Partial<InventoryItem> = {
      uid: this.currentUser.uid,
      displayName: this.currentUser.displayName || 'Usuario',
      email: this.currentUser.email || '',
      codigo: this.formData.codigo.trim(),  // Vacío → backend genera P001, P002...
      producto: this.formData.producto.trim(),
      stockInicial: this.formData.stockInicial,
      entradas: this.formData.entradas,
      salidas: this.formData.salidas,
    };

    this.inventoryService.crearProducto(nuevoProducto).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.cerrarModal(); // Cerramos el modal antes de mostrar la alerta

        // Alerta de éxito con SweetAlert2
        Swal.fire({
          icon: 'success',
          title: '¡Producto guardado!',
          text: 'El producto fue registrado exitosamente en el inventario.',
          confirmButtonColor: '#2c7be5',
          timer: 2500,
          timerProgressBar: true,
        });

        this.inventarioChanged.emit(); // Notificamos al padre para recargar datos
      },
      error: (err) => {
        // El backend retorna un mensaje amigable cuando hay código duplicado
        this.errorMessage =
          err.error?.message || 'Error al crear el producto. Intente de nuevo.';
        console.error('Error al crear:', err);
        this.isSubmitting = false;
      },
    });
  }

  /**
   * actualizar
   * Llama al servicio para actualizar el producto en edición.
   */
  private actualizar(): void {
    if (!this.editingId) return;

    this.isSubmitting = true;
    this.clearMessages();

    const datosActualizados: Partial<InventoryItem> = {
      codigo: this.formData.codigo.trim(),
      producto: this.formData.producto.trim(),
      stockInicial: this.formData.stockInicial,
      entradas: this.formData.entradas,
      salidas: this.formData.salidas,
    };

    this.inventoryService.actualizarProducto(this.editingId, datosActualizados).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.cerrarModal(); // Cerramos el modal antes de mostrar la alerta

        // Alerta de éxito con SweetAlert2
        Swal.fire({
          icon: 'success',
          title: '¡Producto actualizado!',
          text: 'Los cambios fueron guardados exitosamente.',
          confirmButtonColor: '#2c7be5',
          timer: 2500,
          timerProgressBar: true,
        });

        this.inventarioChanged.emit(); // Notificamos al padre para recargar datos
      },
      error: (err) => {
        this.errorMessage =
          err.error?.message || 'Error al actualizar el producto. Intente de nuevo.';
        console.error('Error al actualizar:', err);
        this.isSubmitting = false;
      },
    });
  }

  /**
   * editarProducto
   * Carga los datos del producto en el formulario y abre el modal en modo "editar".
   * @param item - Producto a editar
   */
  editarProducto(item: InventoryItem): void {
    // Guardamos el ID para saber que estamos en modo edición
    this.editingId = item._id || null;

    // Precargamos el formulario con los datos actuales del producto
    this.formData = {
      codigo: item.codigo || '',
      producto: item.producto,
      stockInicial: item.stockInicial,
      entradas: item.entradas,
      salidas: item.salidas,
    };

    this.clearMessages();
    this.showModal = true; // Abrimos el modal con los datos cargados
    document.body.style.overflow = 'hidden';
  }

  /**
   * eliminarProducto
   * Muestra confirmación SweetAlert2 y elimina el producto si el usuario confirma.
   * @param item - Producto a eliminar
   */
  async eliminarProducto(item: InventoryItem): Promise<void> {
    const result = await Swal.fire({
      title: '¿Eliminar producto?',
      text: `¿Estás seguro de que quieres eliminar "${item.producto}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed && item._id) {
      this.inventoryService.eliminarProducto(item._id).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Eliminado',
            text: 'El producto fue eliminado correctamente.',
            confirmButtonColor: '#2c7be5',
            timer: 2000,
            timerProgressBar: true,
          });
          this.inventarioChanged.emit();
        },
        error: (err) => {
          Swal.fire('Error', 'No se pudo eliminar el producto.', 'error');
          console.error('Error al eliminar:', err);
        },
      });
    }
  }

  // ──────────────────────────────────────────────────
  // MÉTODOS AUXILIARES (PRIVADOS)
  // ──────────────────────────────────────────────────

  /**
   * resetForm
   * Limpia el formulario y sale del modo edición.
   */
  private resetForm(): void {
    this.formData = { codigo: '', producto: '', stockInicial: 0, entradas: 0, salidas: 0 };
    this.editingId = null;
  }

  /**
   * clearMessages
   * Limpia los mensajes de error del formulario.
   */
  private clearMessages(): void {
    this.errorMessage = '';
  }

  // ──────────────────────────────────────────────────
  // MÉTODO AUXILIAR PARA EL TEMPLATE
  // ──────────────────────────────────────────────────

  /**
   * getEstadoBadgeClass
   * Retorna la clase CSS de Bootstrap según el estado del producto.
   * @param estado - Estado del producto ('Normal', 'Crítico', 'Agotado')
   */
  getEstadoBadgeClass(estado?: string): string {
    switch (estado) {
      case 'Normal':   return 'badge bg-success';
      case 'Crítico':  return 'badge bg-warning text-dark';
      case 'Agotado':  return 'badge bg-danger';
      default:         return 'badge bg-secondary';
    }
  }
}
