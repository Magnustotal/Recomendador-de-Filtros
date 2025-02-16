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
            return { success: true, data: data }; // Retorna los datos envueltos en un objeto
        } else {
            return { success: false, error: data.error.userMessage }; // Retorna el error
        }
    } catch (error) {
        console.error("Error en obtenerDatos:", error); // Log del error para debugging
        return { success: false, error: "Error al obtener los datos." }; // Mensaje genérico para el usuario
    }
}