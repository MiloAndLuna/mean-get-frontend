// ============================================================
// ARCHIVO: src/app/services/inventory.service.ts
// PROPÓSITO: Servicio de inventario que realiza peticiones HTTP
// al backend de Node.js + Express en localhost:3000.
// NO usa Firebase para datos; solo usa el UID de Firebase como
// identificador de usuario para filtrar datos en el backend.
// ============================================================

import { Injectable, inject } from '@angular/core';

// HttpClient: cliente HTTP de Angular para hacer peticiones REST
// Necesita provideHttpClient() en app.config.ts para funcionar
import { HttpClient } from '@angular/common/http';

// Observable: tipo de retorno de HttpClient; permite suscribirse
// a la respuesta cuando llegue (programación reactiva con RxJS)
import { Observable } from 'rxjs';

// Importamos la interface para tener tipado fuerte en las peticiones
import { InventoryItem } from '../interfaces/inventory-item';

/**
 * @Injectable({ providedIn: 'root' })
 * Singleton: una sola instancia compartida por toda la aplicación.
 */
@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  // URL base de la API del backend.
  // En desarrollo: http://localhost:3000/api/inventario
  // En producción: cambiar a la URL del servidor desplegado
  private apiUrl = 'http://localhost:3000/api/inventario';

  // Inyectamos HttpClient para hacer peticiones HTTP
  private http = inject(HttpClient);

  /**
   * getInventario
   * GET /api/inventario/:uid
   * Obtiene todos los productos del usuario identificado por su uid de Firebase.
   * Retorna un Observable del array de productos; el componente se suscribe.
   *
   * @param uid - Firebase User ID para filtrar el inventario en el backend
   */
  getInventario(uid: string): Observable<InventoryItem[]> {
    // this.http.get<T>() realiza una petición GET y tipamos la respuesta como InventoryItem[]
    return this.http.get<InventoryItem[]>(`${this.apiUrl}/${uid}`);
  }

  /**
   * crearProducto
   * POST /api/inventario
   * Envía un nuevo producto al backend para guardarlo en MongoDB.
   * El backend calcula stockFinal y estado automáticamente (Pre-save Hook).
   *
   * @param producto - Objeto con los datos del producto a crear
   */
  crearProducto(producto: Partial<InventoryItem>): Observable<InventoryItem> {
    // this.http.post<T>() realiza una petición POST con el objeto en el body
    // Angular serializa el objeto a JSON automáticamente
    return this.http.post<InventoryItem>(this.apiUrl, producto);
  }

  /**
   * actualizarProducto
   * PUT /api/inventario/:id
   * Actualiza un producto existente en MongoDB.
   * El backend recalcula stockFinal y estado con el Pre-findOneAndUpdate Hook.
   *
   * @param id - ID de MongoDB (_id) del producto a actualizar
   * @param datos - Campos a actualizar (Partial permite enviar solo algunos)
   */
  actualizarProducto(id: string, datos: Partial<InventoryItem>): Observable<InventoryItem> {
    // this.http.put<T>() realiza una petición PUT con los datos en el body
    return this.http.put<InventoryItem>(`${this.apiUrl}/${id}`, datos);
  }

  /**
   * eliminarProducto
   * DELETE /api/inventario/:id
   * Elimina permanentemente un producto de MongoDB.
   *
   * @param id - ID de MongoDB (_id) del producto a eliminar
   */
  eliminarProducto(id: string): Observable<{ message: string; id: string }> {
    // this.http.delete<T>() realiza una petición DELETE
    return this.http.delete<{ message: string; id: string }>(`${this.apiUrl}/${id}`);
  }
}
