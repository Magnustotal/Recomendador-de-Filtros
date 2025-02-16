// src/interfaz.js
import { calcular } from './calculos.js'; // Importa la función calcular

// --- Funciones para manejar eventos ---

export function setupEventListeners(app) { // Recibe la instancia de Vue como argumento
  // Event listener para el botón de calcular
    document.getElementById('calculatorForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      app.errorMessage = null; // Limpiar mensajes de error previos
      app.showResults = false;

      let formData = {};

      // Validación y preparación de los datos del formulario
      if (app.inputMode === "dimensions") {
          if (!app.length || !app.width || !app.height) {
              app.errorMessage = "Por favor, introduce todas las dimensiones.";
              return; // Importante: detener la ejecución si hay un error
          }
          formData = {
              length: app.length,
              width: app.width,
              height: app.height,
          };
      } else { // inputMode === "volume"
          if (!app.aquariumVolume) {
              app.errorMessage = "Por favor, introduce el volumen.";
              return;
          }
          formData = { volume: app.aquariumVolume };
      }

        const filtrosData = await obtenerDatosDesdeCSV();
        const resultados = calcular(formData, filtrosData); // Pasa los datos y la lista de filtros.

        // Actualizar los datos en la interfaz (usando las propiedades de la instancia de Vue)
        app.filtros = resultados.filtros;
        app.stats = resultados.stats;
        app.tankInfo = resultados.tankInfo;
        app.specialMessages = resultados.mensajesEspeciales;
        app.showResults = true;
        app.showBanner = true;

    });

  // Event listeners para los botones de cambio de modo de entrada
  document.querySelectorAll('.input-selector .tab-button').forEach(button => {
    button.addEventListener('click', (event) => {
      const mode = event.target.dataset.input;
      app.switchInputMode(mode); // Usa el método de Vue
    });
  });

   document.querySelectorAll('.results-tabs .tab-button').forEach(button => {
      button.addEventListener('click', (event) => {
          const tab = event.target.dataset.tab;
            app.switchResultTab(tab);
      });
  });

  document.querySelectorAll('.view-selector .view-button').forEach(button => {
      button.addEventListener('click', (event) => {
          const view = event.target.dataset.view; // Obtiene el valor del atributo data-view
            app.switchView(view); // Llama al método switchView de la instancia de Vue
      });
  });

  // Event listener para el botón de "Siguiente Consejo"
  document.getElementById('nextTipButton').addEventListener('click', () => {
      app.showNextTip(); // Llama al metodo de Vue.
  });
    document.querySelector('.close-banner').addEventListener('click', () => {
          app.hideBanner();
      });

}

// --- Funciones para mostrar/ocultar elementos ---

export function mostrarResultados(filtros, stats, tankInfo, specialMessages, app) { //Recibe la instancia de Vue.
    app.filtros = filtros;
    app.stats = stats;
    app.tankInfo = tankInfo;
    app.specialMessages = specialMessages;
    app.showResults = true;
}

export function mostrarError(mensaje, app) { //Recibe la instancia de Vue.
  app.errorMessage = mensaje;
}

// --- Otras funciones de utilidad para la interfaz ---

// ... (Añade aquí otras funciones para actualizar la tabla, mostrar el modal, etc.) ...

export async function obtenerDatosDesdeCSV() {
  return new Promise((resolve, reject) => {
    const url =
      "https://docs.google.com/spreadsheets/d/1d4TqXM9DOk36ToQzMZ3hOY8p9TZ88Y5Yjy81mmFOWNQ/export?gid=1302759309&format=csv";

    Papa.parse(url, {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: function (results) {
        if (results.data) {
            //Aquí se procesan los datos del CSV.
          resolve(results.data);
        } else if (results.errors) {
            console.log(results.errors);
          reject(results.errors);
        }
      },
      error: function (error) {
        reject(error);
      },
    });
  });
}