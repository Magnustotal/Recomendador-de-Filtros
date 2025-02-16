// src/interfaz.js
import { calcular } from './calculos.js';
import { obtenerDatosDesdeCSV } from './datos.js';


// --- Funciones para manejar eventos ---

export function setupEventListeners(app) {
    document.getElementById('calculatorForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        app.errorMessage = null;
        app.showResults = false;

        let formData = {};

        if (app.inputMode === "dimensions") {
            if (!app.length || !app.width || !app.height) {
                app.errorMessage = "Por favor, introduce todas las dimensiones.";
                return;
            }
            formData = {
                length: app.length,
                width: app.width,
                height: app.height,
            };
        } else {
            if (!app.aquariumVolume) {
                app.errorMessage = "Por favor, introduce el volumen.";
                return;
            }
            formData = { volume: app.aquariumVolume };
        }

        // Obtener y procesar datos
        try {
            const filtrosData = await obtenerDatosDesdeCSV(); // Obtiene los datos de los filtros.
            const resultados = calcular(formData, filtrosData); // Pasa los datos del form y la lista de filtros

            // Actualizar la interfaz con los resultados
            app.filtros = transformarFiltros(resultados.filtros);
            app.stats.totalFilters = resultados.stats.totalFilters;
            app.stats.recommendedFilters = resultados.stats.recommendedFilters;
            app.stats.suitableFilters = resultados.stats.suitableFilters;
            app.stats.unsuitableFilters = resultados.stats.unsuitableFilters;
            app.tankInfo = resultados.tankInfo;
            app.specialMessages = resultados.mensajesEspeciales;

            app.showResults = true;
            app.showBanner = true;

        } catch (error) {
            app.errorMessage = "Error al obtener o procesar los datos.";
            console.error(error);
        }
    });

    document.querySelectorAll('.input-selector .tab-button').forEach(button => {
        button.addEventListener('click', (event) => {
          const mode = event.target.dataset.input;
          app.switchInputMode(mode); // Usa el método de Vue
        });
      });

    document.querySelectorAll('.results-tabs .tab-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const tab = event.target.dataset.tab;
            app.switchResultTab(tab);  //  Usa el metodo de Vue.
        });
    });

    document.querySelectorAll('.view-selector .view-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const view = event.target.dataset.view;
            app.switchView(view);  // Usa el metodo de Vue.
        });
    });

    document.getElementById('nextTipButton').addEventListener('click', () => {
        app.showNextTip();  // Usa el metodo de Vue.
    });
      document.querySelector('.close-banner').addEventListener('click', () => {
            app.hideBanner();  // Usa el metodo de Vue.
        });
}

// --- Funciones para mostrar/ocultar elementos (ya no son necesarias, se maneja con Vue) ---


// --- Funciones de utilidad para la interfaz ---

export function updateTableData(filtros, app) { // Simplificado
    if (app.currentView === 'table') {
        buildTable(filtros, app);
    }
}

export function buildTable(filtros, app) {
    const tableContainer = document.getElementById('table-container');
    if (!tableContainer) return;

    tableContainer.innerHTML = '';

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const headers = ['Marca y Modelo', 'Caudal (l/h)', 'Volumen Vaso (l)', 'Consumo (W)', 'Estado'];
    const headerRow = document.createElement('tr');
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        th.setAttribute('scope', 'col');
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

     for (const category in filtros) {
        filtros[category].forEach(filtro => {
            const tr = document.createElement('tr');
            let statusText = '';
            if (category === 'recomendados') {
                statusText = 'Recomendado';
            } else if (category === 'adecuados') {
                statusText = 'Adecuado';
            } else if (category === 'noAdecuados') {
                statusText = 'No Adecuado';
            }

            const rowData = [
                filtro.marcaModelo,
                `${filtro.caudal} L/h`,
                `${filtro.volumenVaso} L`,
                `${filtro.consumo} W`,
                statusText,
            ];
            rowData.forEach(cellData => {
                const td = document.createElement('td');
                td.textContent = cellData;
                tr.appendChild(td);
            });
            tr.cells[0].setAttribute('scope', 'row');
            tbody.appendChild(tr);
        });
    }

    table.appendChild(tbody);
    tableContainer.appendChild(table);
    table.classList.add('table');
}

  /**
     * Transforma los nombres de los campos de los filtros para hacerlos
     * más amigables para su uso en las plantillas.
     *
     * @param {Array<Object>} filtros - Array de objetos filtro con nombres de campo originales.
     * @returns {Array<Object>} - Array de objetos filtro con nombres de campo transformados.
     */
  export function transformarFiltros(filtros) {
    // Mapea los nombres de los campos originales a los nuevos nombres
    const keyMappings = {
      "Marca y Modelo": "marcaModelo",
      "Caudal (l/h)": "caudal",
      "Volúmen vaso del filtro (l)": "volumenVaso",
      "Consumo (W)": "consumo",
      "Cestas": "cestas",
      "Volúmen prefiltro (l)": "volumenPrefiltro",
      "Volúmen filtrante real (l)": "volumenFiltranteReal",
      "ASIN": "asin",
      "ID": "id",
    };

    // Itera sobre cada categoría de filtros (recomendados, adecuados, noAdecuados)
    return Object.keys(filtros).reduce((acc, categoria) => {
      // Transforma los filtros de cada categoría
      acc[categoria] = filtros[categoria].map((filtro) => {
        const transformedFiltro = {};
        // Itera sobre las claves del filtro original
        for (const key in filtro) {
          // Si la clave original tiene un mapeo, usa el nuevo nombre; de lo contrario, usa la clave original
          const newKey = keyMappings[key] || key;
          transformedFiltro[newKey] = filtro[key];
        }
        return transformedFiltro;
      });
      return acc;
    }, {});
  }