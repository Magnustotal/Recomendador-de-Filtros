// src/datos.js
const API_URL = "https://script.google.com/macros/s/AKfycbwOM0eT0znOupFJ4fegXfjcs0lf40QywHzIpaOPrPGX9ifkOINUJhg2f2crYaK_0gWm/exec";

export async function obtenerDatos(formData) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (data.success) {
            return { success: true, data: data };
        } else {
            return { success: false, error: data.error.userMessage };
        }
    } catch (error) {
        console.error("Error en obtenerDatos:", error);
        return { success: false, error: "Error al obtener los datos." };
    }
}

// Función para obtener los datos iniciales (opcional, descomentar si se necesita)
/*
export async function loadInitialData() {
    try {
        const response = await fetch(API_URL + "?initialLoad=true"); // Añade un parámetro para indicar la carga inicial
        const data = await response.json();
        if (data.success) {
            return { success: true, data: data };
        } else {
            return { success: false, error: data.error };
        }

    } catch (error) {
        console.error("Error en loadInitialData:", error);
        return { success: false, error: "Error al cargar los datos iniciales." };
    }
}
*/
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