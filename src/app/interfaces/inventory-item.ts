// ============================================================
// ARCHIVO: src/app/interfaces/inventory-item.ts
// PROPÓSITO: Define el contrato de datos (interface TypeScript)
// para un item de inventario. Garantiza que todos los componentes
// y servicios trabajen con la misma estructura de datos.
// Una interface TypeScript es solo para tipado — no genera código JS.
// ============================================================

/**
 * InventoryItem
 * Representa la estructura de un producto en el inventario.
 * Coincide con el Schema de Mongoose definido en el backend.
 * El signo '?' indica que el campo es OPCIONAL (puede ser undefined).
 */
export interface InventoryItem {
  // _id: Identificador único generado por MongoDB.
  // Es opcional porque no existe al crear un producto nuevo.
  _id?: string;

  // uid: Firebase User ID del propietario del producto.
  // Permite filtrar el inventario por usuario en el backend.
  uid: string;

  // displayName: Nombre del usuario de Firebase Auth.
  displayName: string;

  // email: Correo del usuario de Firebase Auth.
  email: string;

  // codigo: Código identificador del producto.
  // Puede ser ingresado por el usuario o auto-generado por el backend.
  codigo?: string;

  // producto: Nombre descriptivo del producto.
  producto: string;

  // stockInicial: Cantidad de unidades al inicio del período.
  stockInicial: number;

  // entradas: Unidades que ingresaron al inventario.
  entradas: number;

  // salidas: Unidades que salieron del inventario.
  salidas: number;

  // stockFinal: Calculado por el backend (stockInicial + entradas - salidas).
  // Es opcional porque el backend lo calcula; el cliente no lo envía al crear.
  stockFinal?: number;

  // estado: Determinado automáticamente por el backend.
  // 'Normal' | 'Crítico' | 'Agotado'
  estado?: 'Normal' | 'Crítico' | 'Agotado';

  // createdAt: Timestamp de creación, generado por MongoDB (timestamps: true).
  // Es opcional porque no existe antes de guardarse.
  createdAt?: string;

  // updatedAt: Timestamp de última actualización.
  updatedAt?: string;
}
