// ============================================================
// ARCHIVO: src/app/components/charts/charts.component.ts
// PROPÓSITO: Componente de visualización estadística.
// Genera gráficas usando ng2-charts (wrapper de Chart.js).
// Recibe los items del padre y construye los datasets para
// la gráfica de barras y la gráfica circular (doughnut).
// ============================================================

import {
  Component,
  Input,
  OnChanges,      // Detecta cambios en @Input para re-renderizar gráficas
  SimpleChanges,
} from '@angular/core';

// CommonModule para directivas en el template
import { CommonModule } from '@angular/common';

// BaseChartDirective: directiva standalone de ng2-charts v9+.
// En versiones anteriores (v4) era NgChartsModule, pero desde v9
// ng2-charts usa directivas standalone (sin NgModule).
import { BaseChartDirective } from 'ng2-charts';

// ChartData, ChartOptions: tipos de Chart.js para configurar las gráficas
import { ChartData, ChartOptions } from 'chart.js';

// Interface del modelo de datos
import { InventoryItem } from '../../interfaces/inventory-item';

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [
    CommonModule,
    BaseChartDirective, // Directiva standalone de ng2-charts v9+ que habilita <canvas baseChart>
  ],
  templateUrl: './charts.component.html',
})
export class ChartsComponent implements OnChanges {
  // @Input: recibe el array de productos del componente padre (Dashboard)
  @Input() items: InventoryItem[] = [];

  // ──────────────────────────────────────────────────
  // CONFIGURACIÓN DE LA GRÁFICA DE BARRAS
  // Eje X: nombres de productos
  // Eje Y: stock final de cada producto
  // ──────────────────────────────────────────────────

  /**
   * barChartData
   * Estructura de datos que ng2-charts/Chart.js usa para renderizar
   * la gráfica de barras. Se actualiza en ngOnChanges.
   */
  barChartData: ChartData<'bar'> = {
    labels: [],   // Nombres de productos (eje X)
    datasets: [
      {
        data: [],  // Valores de stock final (eje Y)
        label: 'Stock Final',
        backgroundColor: [
          // Paleta de colores con transparencia (formato RGBA)
          'rgba(13, 110, 253, 0.7)',   // Azul Bootstrap primary
          'rgba(25, 135, 84, 0.7)',    // Verde Bootstrap success
          'rgba(255, 193, 7, 0.7)',    // Amarillo Bootstrap warning
          'rgba(220, 53, 69, 0.7)',    // Rojo Bootstrap danger
          'rgba(13, 202, 240, 0.7)',   // Celeste Bootstrap info
          'rgba(111, 66, 193, 0.7)',   // Morado Bootstrap purple
        ],
        borderColor: [
          'rgba(13, 110, 253, 1)',
          'rgba(25, 135, 84, 1)',
          'rgba(255, 193, 7, 1)',
          'rgba(220, 53, 69, 1)',
          'rgba(13, 202, 240, 1)',
          'rgba(111, 66, 193, 1)',
        ],
        borderWidth: 2,
        borderRadius: 6,  // Bordes redondeados en las barras
      },
    ],
  };

  /**
   * barChartOptions
   * Opciones de configuración para la gráfica de barras.
   * responsive: true → se adapta al contenedor.
   * plugins.legend.display: false → ocultamos la leyenda (la barra ya tiene el label).
   */
  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false, // Permite controlar la altura con CSS
    plugins: {
      legend: { display: true, position: 'top' },
      // Tooltip: configuración del popover al pasar el cursor
      tooltip: {
        callbacks: {
          // Muestra el nombre completo del producto en el tooltip al pasar el cursor,
          // así el usuario sabe a qué producto corresponde cada código.
          title: (items) => {
            const idx = items[0]?.dataIndex ?? 0;
            const item = this.items[idx];
            return item ? `${item.codigo || ''} — ${item.producto}` : '';
          },
          label: (context) => ` Stock Final: ${context.raw} unidades`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true, // El eje Y siempre empieza en 0
        title: {
          display: true,
          text: 'Unidades en stock',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Productos',
        },
      },
    },
  };

  // ──────────────────────────────────────────────────
  // CONFIGURACIÓN DE LA GRÁFICA CIRCULAR (DOUGHNUT)
  // Distribución de estados: Normal, Crítico, Agotado
  // ──────────────────────────────────────────────────

  /**
   * doughnutChartData
   * Estructura de datos para la gráfica de dona.
   * Muestra la proporción de productos en cada estado.
   */
  doughnutChartData: ChartData<'doughnut'> = {
    labels: ['Normal', 'Crítico', 'Agotado'], // Etiquetas de los segmentos
    datasets: [
      {
        data: [0, 0, 0], // [conteo Normal, conteo Crítico, conteo Agotado]
        backgroundColor: [
          'rgba(25, 135, 84, 0.8)',   // Verde para Normal
          'rgba(255, 193, 7, 0.8)',   // Amarillo para Crítico
          'rgba(220, 53, 69, 0.8)',   // Rojo para Agotado
        ],
        borderColor: [
          'rgba(25, 135, 84, 1)',
          'rgba(255, 193, 7, 1)',
          'rgba(220, 53, 69, 1)',
        ],
        borderWidth: 2,
        hoverOffset: 8, // Separación del segmento al pasar el cursor
      },
    ],
  };

  /**
   * doughnutChartOptions
   * Opciones para la gráfica de dona.
   */
  doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right', // Leyenda a la derecha para mejor presentación
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            // Muestra el conteo y el porcentaje en el tooltip
            const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
            const value = context.raw as number;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return ` ${context.label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    cutout: '65%', // Porcentaje del hueco interior de la dona
  };

  // ──────────────────────────────────────────────────
  // MÉTRICAS ADICIONALES
  // ──────────────────────────────────────────────────

  // Producto con mayor rotación (más salidas)
  get productoMayorRotacion(): InventoryItem | null {
    if (this.items.length === 0) return null;
    return this.items.reduce((prev, curr) =>
      prev.salidas > curr.salidas ? prev : curr
    );
  }

  // Cantidad de productos Críticos
  get productosCriticos(): number {
    return this.items.filter((i) => i.estado === 'Crítico').length;
  }

  // Cantidad de productos Agotados
  get productosAgotados(): number {
    return this.items.filter((i) => i.estado === 'Agotado').length;
  }

  // Stock total de todos los productos
  get stockTotal(): number {
    return this.items.reduce((sum, i) => sum + (i.stockFinal || 0), 0);
  }

  // ──────────────────────────────────────────────────
  // LIFECYCLE: actualizar gráficas cuando cambian los datos
  // ──────────────────────────────────────────────────

  /**
   * ngOnChanges
   * Se dispara cada vez que el @Input items cambia.
   * Reconstruimos los datasets de las gráficas con los nuevos datos.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items'] && this.items.length > 0) {
      this.actualizarGraficas();
    }
  }

  /**
   * actualizarGraficas
   * Recalcula los datos de ambas gráficas basándose en el array items.
   * Usamos spread operator ({...}) para crear nuevos objetos y forzar
   * la detección de cambios de Angular (inmutabilidad).
   */
  private actualizarGraficas(): void {
    // ─── Actualizar gráfica de barras ───
    // Labels: tomamos solo los primeros 10 productos para no saturar la gráfica.
    // Usamos el CÓDIGO del producto en el eje X (en lugar del nombre completo)
    // para que las etiquetas sean cortas y legibles en la gráfica.
    // Si por algún motivo no tiene código (productos viejos), mostramos el nombre.
    const productosAMostrar = this.items.slice(0, 10);

    this.barChartData = {
      ...this.barChartData,
      labels: productosAMostrar.map((item) => item.codigo || item.producto), // Código en eje X
      datasets: [
        {
          ...this.barChartData.datasets[0],
          data: productosAMostrar.map((item) => item.stockFinal || 0), // Stock en eje Y
        },
      ],
    };

    // ─── Actualizar gráfica de dona ───
    const normal = this.items.filter((i) => i.estado === 'Normal').length;
    const critico = this.items.filter((i) => i.estado === 'Crítico').length;
    const agotado = this.items.filter((i) => i.estado === 'Agotado').length;

    this.doughnutChartData = {
      ...this.doughnutChartData,
      datasets: [
        {
          ...this.doughnutChartData.datasets[0],
          data: [normal, critico, agotado], // Conteos por estado
        },
      ],
    };
  }
}
