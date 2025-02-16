// src/script.js

import { obtenerDatos } from './datos.js'; // Si decides implementar loadInitialData
import { setupEventListeners } from './interfaz.js';


new Vue({
    el: "#app",
    data: {
        version: "2.1.1", // Versión de la app
        inputMode: "dimensions",
        length: null,
        width: null,
        height: null,
        aquariumVolume: null,
        showResults: false,
        errorMessage: null,
        filtros: {
            recomendados: [],
            adecuados: [],
            noAdecuados: [],
        },
        stats: {
            totalFilters: 0,
            recommendedFilters: 0,
            suitableFilters: 0,
            unsuitableFilters: 0,
        },
        tankInfo: null,
        specialMessages: [],
        currentTab: "recomendados",
        currentView: "grid",
        showModal: false,
        selectedFilter: null,
        tips: [
           {
                message:
                    "🔄 Mantenimiento del material biológico: Cambia solo un 25% del material biológico 'viejo' por 'nuevo' durante las limpiezas del filtro. ¡Nunca lo cambies todo de golpe! Algunos materiales pierden eficacia con el tiempo al obstruirse sus poros.",
                icon: "🔄",
            },
            {
                message: "🧽 Limpieza regular: Limpia el prefiltro (si tu filtro tiene uno) con frecuencia para evitar que se obstruya y reduzca el caudal.",
                icon: "🧽",
            },
            {
                message: "🧪 Material filtrante químico: Si usas material filtrante químico (como carbón activado), reemplázalo regularmente según las instrucciones del fabricante.",
                icon: "🧪",
            },
            {
                message: "🐠 Compatibilidad: Asegúrate de que el filtro que elijas sea compatible con el tipo de peces y plantas que tienes en tu acuario.",
                icon: "🐠",
            },
            {
                message: "💡 Caudal: Un caudal demasiado alto puede estresar a los peces, mientras que un caudal demasiado bajo puede no ser suficiente para mantener el agua limpia.",
                icon: "💡",
            },
            {
                message: "🌱 Plantas: Las plantas ayudan a mantener el agua limpia y oxigenada, lo que reduce la carga sobre el filtro.",
                icon: "🌱",
            },
          ],
        currentTipIndex: 0,
        currentTip: {},
        showBanner: true,
    },
    mounted() {
        this.showRandomTip();
      //  this.loadInitialData(); // Descomenta si decides implementar la carga inicial
        setupEventListeners(this); // Pasa la instancia de Vue a setupEventListeners

    },
    methods: {
        switchInputMode(mode) {
            this.inputMode = mode;
            this.resetForm();
        },
        async handleFormSubmit() {
          //Esta función se simplifica, ahora solo llama a las funciones de los modulos.
          //Ya se ha trasladado todo a los modulos.
        },
        switchResultTab(tab) {
            this.currentTab = tab;
        },

        switchView(view) {
            this.currentView = view;
            this.updateTableData(); // Actualizar datos de la tabla al cambiar de vista.
        },

        showFilterDetails(id) {
          const filter = this.findFilterById(id);
            if (filter) {
                this.selectedFilter = filter;
                this.showModal = true;
            }
        },

        closeModal() {
            this.showModal = false;
            this.selectedFilter = null;
        },
         /**
             * Busca un filtro por su ID en todas las categorías.
             * @param {number} id - El ID del filtro.
             * @returns {object|null} El objeto filtro si se encuentra, null en caso contrario.
             */
            findFilterById(id) {
                for (const categoria in this.filtros) {
                    const filtro = this.filtros[categoria].find((f) => f.id === id);
                    if (filtro) {
                        return filtro;
                    }
                }
                return null;
            },
            /**
             * Transforma los nombres de los campos de los filtros para hacerlos
             * más amigables para su uso en las plantillas.
             *
             * @param {Array<Object>} filtros - Array de objetos filtro con nombres de campo originales.
             * @returns {Array<Object>} - Array de objetos filtro con nombres de campo transformados.
             */
            transformFilterData(filtros) {
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
            },

            resetForm() {
                this.length = null;
                this.width = null;
                this.height = null;
                this.aquariumVolume = null;
                this.showResults = false;
                this.errorMessage = null;
                // Limpia los datos de los filtros
                this.filtros = {
                  recomendados: [],
                  adecuados: [],
                  noAdecuados: [],
                };
                // Limpia las estadísticas.
                this.stats = {
                  totalFilters: 0,
                  recommendedFilters: 0,
                  suitableFilters: 0,
                  unsuitableFilters: 0,
                };
                this.tankInfo = null;
                this.specialMessages = [];
            },
            //Metodos relacionados con el banner.
            hideBanner() {
                this.showBanner = false;
            },
            showRandomTip() {
                this.currentTipIndex = Math.floor(Math.random() * this.tips.length);
                this.currentTip = this.tips[this.currentTipIndex];
            },
            showNextTip() {
                this.currentTipIndex = (this.currentTipIndex + 1) % this.tips.length;
                this.currentTip = this.tips[this.currentTipIndex];
            },
            // Método para actualizar los datos de la tabla (se llamará cuando currentView sea 'table')
            updateTableData() {
              if (this.currentView === 'table') {
                // Podrías tener una función separada para construir la tabla si es muy compleja
                this.buildTable();
              }
            },
            // Ejemplo de función para construir la tabla (muy simplificado)
            buildTable() {
                const tableContainer = document.getElementById('table-container'); // Asegúrate de tener un elemento con este ID
                  if (!tableContainer) return;

                  tableContainer.innerHTML = ''; // Limpia el contenido anterior

                  const table = document.createElement('table');
                  const thead = document.createElement('thead');
                  const tbody = document.createElement('tbody');

                    // Cabecera de la tabla (ajusta los encabezados según tus datos)
                    const headers = ['Marca y Modelo', 'Caudal (l/h)', 'Volumen Vaso (l)', 'Consumo (W)', 'Estado'];
                    const headerRow = document.createElement('tr');
                    headers.forEach(headerText => {
                        const th = document.createElement('th');
                        th.textContent = headerText;
                        th.setAttribute('scope', 'col'); // Accesibilidad: indica que es una cabecera de columna
                        headerRow.appendChild(th);
                    });
                    thead.appendChild(headerRow);
                    table.appendChild(thead);

                    // Contenido de la tabla (todas las categorías juntas)
                    for (const category in this.filtros) {
                        this.filtros[category].forEach(filtro => {
                            const tr = document.createElement('tr');

                            // Obtener el texto del estado del filtro.  Usa el computed property del componente.
                            let statusText = '';
                            if (category === 'recomendados') {
                                statusText = 'Recomendado';
                            } else if (category === 'adecuados') {
                                statusText = 'Adecuado';
                            } else if (category === 'noAdecuados') {
                                statusText = 'No Adecuado';
                            }


                            // Datos de cada fila (ajusta según tus datos)
                            const rowData = [
                                filtro.marcaModelo,
                                `${filtro.caudal} L/h`,
                                `${filtro.volumenVaso} L`,
                                `${filtro.consumo} W`,
                                statusText, // Añadimos el estado.
                            ];
                            rowData.forEach(cellData => {
                                const td = document.createElement('td');
                                td.textContent = cellData;
                                tr.appendChild(td);
                            });
                            // Añade atributo para la primera celda de la fila, mejorando la accesibilidad
                            tr.cells[0].setAttribute('scope', 'row');

                            tbody.appendChild(tr);
                        });
                    }

                    table.appendChild(tbody);
                    tableContainer.appendChild(table);

                    // Aplicar estilos a la tabla (podrías hacerlo en CSS, pero aquí tienes un ejemplo)
                    table.classList.add('table'); // Añadimos una clase para poder aplicar estilos

            },

             async loadInitialData() {
                //  Carga inicial de datos (opcional, si quieres cargar datos al inicio)
                // try{
                //     const response = await fetch("URL_DE_TU_API?initialLoad=true"); // Podrias usar un parametro en la URL
                //      const data = await response.json();
                //      if (data.success){
                //          this.filtros = this.transformFilterData(data.filtros);
                //          this.stats.totalFilters = data.stats.totalFilters
                //      }
                //
                // }
                // catch(error){
                //
                // }
                console.info(
                    "La función loadInitialData() está comentada. Descoméntala y configúrala si necesitas cargar datos al inicio."
                );
            },
        },
    });